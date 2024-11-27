import {
  CloudWatchEventsClient,
  PutRuleCommand,
  PutTargetsCommand,
  RuleState,
} from '@aws-sdk/client-cloudwatch-events';
import {
  DescribeNetworkInterfacesCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import {
  AssignPublicIp,
  DescribeTasksCommand,
  DescribeTasksCommandInput,
  DesiredStatus,
  ECSClient,
  LaunchType,
  ListTasksCommand,
  RunTaskCommand,
  RunTaskCommandInput,
  StopTaskCommand,
  Task,
} from '@aws-sdk/client-ecs';
import {
  AddPermissionCommand,
  AddPermissionCommandInput,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { MessagesEphemeralEnvironment } from '../enum/messages.enum';
import { ITaskInfo } from '../interface/ephemeralEnvironment.interface';

export class EphemeralEnvironmentService {
  private readonly ecsClient: ECSClient;
  private readonly ec2Client: EC2Client;
  private readonly clusterName: string;
  private readonly taskDefinition: string;
  private readonly subnets: string[];
  private readonly securityGroupId: string;
  private readonly region: string;
  private readonly cloudWatchClient: CloudWatchEventsClient;
  private readonly lambdaClient: LambdaClient;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(EphemeralEnvironmentService.name);
    this.region = process.env.AWS_ECS_REGION;
    this.clusterName = process.env.AWS_ECS_CLUSTER_NAME;
    this.taskDefinition = process.env.AWS_ECS_TASK_DEFINITION;
    this.subnets = process.env.AWS_ECS_SUBNETS?.split(',') || [];
    this.securityGroupId = process.env.AWS_ECS_SECURITY_GROUP_ID;
    this.ecsClient = this.createClient(ECSClient) as ECSClient;
    this.ec2Client = this.createClient(EC2Client) as EC2Client;
    this.cloudWatchClient = this.createClient(
      CloudWatchEventsClient,
    ) as CloudWatchEventsClient;
    this.lambdaClient = this.createClient(LambdaClient) as LambdaClient;
  }

  private createClient(
    Client: new (options: {
      region: string;
      credentials: { accessKeyId: string; secretAccessKey: string };
    }) => ECSClient | EC2Client | CloudWatchEventsClient | LambdaClient,
  ) {
    return new Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ECS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ECS_SECRET_KEY,
      },
    });
  }

  async configureFargateStopRule(
    clientId: string,
    intervalMinutes: number,
  ): Promise<void> {
    if (intervalMinutes <= 0) {
      throw new Error(
        MessagesEphemeralEnvironment.INTERVAL_MUST_BE_POSITIVE_NUMBER,
      );
    }

    const ruleName = `${clientId}-fargate-auto-stop-rule`;
    const lambdaArn = process.env.LAMBDA_ARN;

    if (!lambdaArn) {
      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.MISSING_REQUIRED_ENV_VARS,
      );
    }

    const now = new Date();
    const executionTime = new Date(now.getTime() + intervalMinutes * 60000);
    const cronExpression = `cron(${executionTime.getUTCMinutes()} ${executionTime.getUTCHours()} * * ? *)`;

    try {
      const putRuleParams = {
        Name: ruleName,
        ScheduleExpression: cronExpression,
        State: RuleState.ENABLED,
      };

      const putRuleResponse = await this.cloudWatchClient.send(
        new PutRuleCommand(putRuleParams),
      );
      const ruleArn = putRuleResponse.RuleArn;

      const permissionParams: AddPermissionCommandInput = {
        FunctionName: lambdaArn,
        StatementId: `${ruleName}-invoke-permission`,
        Action: 'lambda:InvokeFunction',
        Principal: 'events.amazonaws.com',
        SourceArn: ruleArn,
      };

      try {
        await this.lambdaClient.send(
          new AddPermissionCommand(permissionParams),
        );
      } catch (error) {
        if (error.name === 'ResourceConflictException') {
          this.responseService.error(
            `Permission already exists for rule ${ruleName}`,
          );
        } else {
          throw error;
        }
      }

      const putTargetsParams = {
        Rule: ruleName,
        Targets: [
          {
            Arn: lambdaArn,
            Id: `${clientId}-target`,
            Input: JSON.stringify({ clientId, ruleName }),
          },
        ],
      };

      await this.cloudWatchClient.send(new PutTargetsCommand(putTargetsParams));

      this.responseService.verbose(
        `Auto-stop rule configured: ${ruleName} to stop Fargate tasks started by "${clientId}" in ${intervalMinutes} minutes.`,
      );
    } catch (error) {
      this.responseService.errorHandler({ error });
    }
  }

  private async handleCommand<T>(command: Promise<T>, successMessage: string) {
    try {
      const response = await command;
      this.responseService.verbose(successMessage);
      this.responseService.verbose(JSON.stringify(response));
      return response;
    } catch (error) {
      this.responseService.error(error);
      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.ERROR_EXECUTING_COMMAND,
      );
    }
  }

  async getClientTask(clientId: string): Promise<Task | null> {
    try {
      const listTasksCommand = new ListTasksCommand({
        cluster: this.clusterName,
        desiredStatus: DesiredStatus.RUNNING,
        startedBy: clientId,
      });

      const taskArns = await this.handleCommand(
        this.ecsClient.send(listTasksCommand),
        MessagesEphemeralEnvironment.LISTED_TASKS_SUCCESS,
      );

      if (!taskArns.taskArns || taskArns.taskArns.length === 0) {
        return null;
      }

      const describeTasksCommand = new DescribeTasksCommand({
        cluster: this.clusterName,
        tasks: taskArns.taskArns,
      });

      const taskDescriptions = await this.handleCommand(
        this.ecsClient.send(describeTasksCommand),
        MessagesEphemeralEnvironment.DESCRIBED_TASK_SUCCESS,
      );

      const matchingTask = taskDescriptions.tasks?.find(
        (task) => task.startedBy === clientId,
      );

      return matchingTask || null;
    } catch (error) {
      this.responseService.error(error);
      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.ERROR_RETRIEVING_CLIENT_TASK,
      );
    }
  }

  async startTask(
    clientId: string,
    intervalMinutes: number,
  ): IPromiseResponse<ITaskInfo> {
    if (intervalMinutes <= 0) {
      throw new Error('Interval must be a positive number of minutes.');
    }

    const existingTask = await this.getClientTask(clientId);

    if (existingTask) {
      throw new ConflictException(
        MessagesEphemeralEnvironment.TASK_ALREADY_RUNNING,
      );
    }

    const runTaskParams: RunTaskCommandInput = {
      clientToken: clientId,
      cluster: this.clusterName,
      taskDefinition: this.taskDefinition,
      launchType: LaunchType.FARGATE,
      startedBy: clientId,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          securityGroups: [this.securityGroupId],
          assignPublicIp: AssignPublicIp.ENABLED,
        },
      },
    };

    try {
      const response = await this.handleCommand(
        this.ecsClient.send(new RunTaskCommand(runTaskParams)),
        MessagesEphemeralEnvironment.FARGATE_TASK_STARTED,
      );

      const taskArn = response.tasks?.[0]?.taskArn;

      if (!taskArn) {
        throw new InternalServerErrorException(
          MessagesEphemeralEnvironment.FARGATE_TASK_NOT_STARTED,
        );
      }

      await this.waitForTaskToRun(taskArn);
      this.configureFargateStopRule(clientId, intervalMinutes);

      const publicIpResponse = await this.getTaskPublicIp(taskArn);
      const publicIp = publicIpResponse.payload?.publicIp;

      return this.responseService.createResponse({
        payload: { taskArn, publicIp },
        message: MessagesEphemeralEnvironment.FARGATE_TASK_STARTED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.responseService.errorHandler({ error });
    }
  }

  async stopTask(clientId: string): IPromiseResponse<{
    taskArn: string;
    status: string;
  }> {
    const clientData = await this.getClientTask(clientId);

    if (!clientData?.taskArn) {
      throw new NotFoundException(
        MessagesEphemeralEnvironment.NO_RUNNING_TASKS,
      );
    }

    const stopTaskParams = {
      cluster: this.clusterName,
      task: clientData?.taskArn || '',
    };

    try {
      await this.handleCommand(
        this.ecsClient.send(new StopTaskCommand(stopTaskParams)),
        MessagesEphemeralEnvironment.FARGATE_TASK_STOPPED,
      );

      const status = await this.waitForTaskToStop(clientData?.taskArn);

      return this.responseService.createResponse({
        payload: {
          taskArn: clientData?.taskArn || '',
          status: status || DesiredStatus.STOPPED,
        },
        message: MessagesEphemeralEnvironment.FARGATE_TASK_STOPPED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      this.responseService.errorHandler({ error });
    }
  }

  async getTaskPublicIp(
    taskArn: string,
  ): IPromiseResponse<{ publicIp: string }> {
    const describeTaskParams: DescribeTasksCommandInput = {
      cluster: this.clusterName,
      tasks: [taskArn],
    };

    try {
      const response = await this.handleCommand(
        this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
        MessagesEphemeralEnvironment.TASK_INFO_RETRIEVED,
      );

      const task = response.tasks?.[0];
      const eniId = task?.attachments?.[0]?.details?.find(
        (detail) => detail.name === 'networkInterfaceId',
      )?.value;

      if (!eniId) {
        throw new InternalServerErrorException(
          MessagesEphemeralEnvironment.NO_NETWORK_INTERFACE,
        );
      }

      const describeNetworkInterfacesCommand =
        new DescribeNetworkInterfacesCommand({
          NetworkInterfaceIds: [eniId],
        });

      const describeNetworkInterfacesResponse = await this.ec2Client.send(
        describeNetworkInterfacesCommand,
      );
      const publicIp =
        describeNetworkInterfacesResponse.NetworkInterfaces?.[0]?.Association
          ?.PublicIp;

      if (publicIp) {
        return this.responseService.createResponse({
          payload: { publicIp },
          message: MessagesEphemeralEnvironment.PUBLIC_IP_RETRIEVED_SUCCESS,
          type: 'OK',
        });
      }

      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.NO_PUBLIC_IP,
      );
    } catch (error) {
      this.responseService.errorHandler({ error });
    }
  }

  private async waitForTaskToRun(taskArn: string): Promise<void> {
    const maxAttempts = 100;
    const waitTime = 4000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const describeTaskParams: DescribeTasksCommandInput = {
        cluster: this.clusterName,
        tasks: [taskArn],
      };

      const response = await this.handleCommand(
        this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
        MessagesEphemeralEnvironment.DESCRIBED_TASK_FOR_WAITING,
      );

      const task = response.tasks?.[0];
      if (task && task.lastStatus === DesiredStatus.RUNNING) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempts++;
    }

    throw new InternalServerErrorException(
      MessagesEphemeralEnvironment.TASK_DID_NOT_TRANSITION_TO_RUNNING,
    );
  }

  private async waitForTaskToStop(taskArn: string): Promise<string> {
    if (!taskArn) {
      return DesiredStatus.STOPPED;
    }

    const maxAttempts = 100;
    const waitTime = 4000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const describeTaskParams: DescribeTasksCommandInput = {
        cluster: this.clusterName,
        tasks: [taskArn],
      };

      try {
        const response = await this.handleCommand(
          this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
          MessagesEphemeralEnvironment.DESCRIBED_TASK_FOR_WAITING,
        );

        const task = response.tasks?.[0];
        if (!task) {
          this.responseService.verbose(
            `${MessagesEphemeralEnvironment.TASK_HAS_STOPPED_OR_DOES_NOT_EXIST} ${taskArn}`,
          );
          return DesiredStatus.STOPPED;
        }

        if (task.lastStatus === DesiredStatus.STOPPED) {
          return DesiredStatus.STOPPED;
        }
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          this.responseService.verbose(
            `${MessagesEphemeralEnvironment.TASK_NOT_FOUND_CONSIDERING_STOPPED} ${taskArn}`,
          );
          return DesiredStatus.STOPPED;
        }
        this.responseService.errorHandler({ error });
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempts++;
    }

    this.responseService.verbose(
      MessagesEphemeralEnvironment.TASK_DID_NOT_STOP_WITHIN_EXPECTED_TIME,
    );
  }

  async getTaskStatus(clientId: string): IPromiseResponse<{
    status: string;
    taskArn: string;
    publicIp: string;
  }> {
    const task = await this.getClientTask(clientId);

    if (!task) {
      throw new NotFoundException(
        MessagesEphemeralEnvironment.NO_RUNNING_TASKS,
      );
    }

    return this.responseService.createResponse({
      payload: {
        status: task.lastStatus || DesiredStatus.STOPPED,
        taskArn: task.taskArn || '',
        publicIp:
          (await this.getTaskPublicIp(task.taskArn)).payload.publicIp || '',
      },
      message: MessagesEphemeralEnvironment.TASK_STATUS_RETRIEVED,
      type: 'OK',
    });
  }
}
