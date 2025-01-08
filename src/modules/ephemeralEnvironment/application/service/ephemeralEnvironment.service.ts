import {
  CloudWatchEventsClient,
  DeleteRuleCommand,
  ListTargetsByRuleCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemovePermissionCommand,
  RemovePermissionCommandOutput,
  RemoveTargetsCommand,
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
  DeleteEventSourceMappingCommand,
  LambdaClient,
  RemovePermissionCommand as LambdaRemovePermissionCommand,
  ListEventSourceMappingsCommand,
} from '@aws-sdk/client-lambda';
import { HttpService } from '@nestjs/axios';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as StellarSdk from '@stellar/stellar-sdk';
import type { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { MessagesEphemeralEnvironment } from '../enum/messages.enum';
import {
  type IEphemeralEnvironmentService,
  ITaskInfo,
} from '../interface/ephemeralEnvironment.interface';

export class EphemeralEnvironmentService
  implements IEphemeralEnvironmentService
{
  private readonly ecsClient: ECSClient;
  private readonly ec2Client: EC2Client;
  private readonly clusterName: string;
  private readonly taskDefinition: string;
  private readonly subnets: string[];
  private readonly securityGroupId: string;
  private readonly region: string;
  private readonly cloudWatchClient: CloudWatchEventsClient;
  private readonly lambdaClient: LambdaClient;
  private readonly httpService: HttpService;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    httpService: HttpService,
  ) {
    this.responseService.setContext(EphemeralEnvironmentService.name);
    this.region = process.env.AWS_REGION;
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
    this.httpService = httpService;
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
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  async configureFargateStopRule(
    taskID: string,
    intervalMinutes: number,
  ): Promise<void> {
    if (intervalMinutes <= 0) {
      throw new Error(
        MessagesEphemeralEnvironment.INTERVAL_MUST_BE_POSITIVE_NUMBER,
      );
    }

    const lambdaFunctionArn = process.env.LAMBDA_ARN;

    if (!lambdaFunctionArn) {
      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.MISSING_REQUIRED_ENV_VARS,
      );
    }

    const now = new Date();
    const executionTime = new Date(now.getTime() + intervalMinutes * 60000);
    const cronExpression = `cron(${executionTime.getUTCMinutes()} ${executionTime.getUTCHours()} ${executionTime.getUTCDate()} ${
      executionTime.getUTCMonth() + 1
    } ? ${executionTime.getUTCFullYear()})`;

    try {
      const ruleArn = await this.createCloudWatchRule(taskID, cronExpression);
      await this.addLambdaPermission(taskID, lambdaFunctionArn, ruleArn);
      await this.addCloudWatchTarget(taskID, lambdaFunctionArn);

      this.responseService.verbose(
        `Auto-stop rule configured: ${taskID} to stop Fargate tasks started by "${taskID}" in ${intervalMinutes} minutes.`,
      );
    } catch (error) {
      this.responseService.errorHandler({ error });
    }
  }

  private async createCloudWatchRule(
    taskID: string,
    cronExpression: string,
  ): Promise<string> {
    const putRuleParams = {
      Name: taskID,
      ScheduleExpression: cronExpression,
      State: RuleState.ENABLED,
    };

    const putRuleResponse = await this.cloudWatchClient.send(
      new PutRuleCommand(putRuleParams),
    );
    return putRuleResponse.RuleArn;
  }

  private async addLambdaPermission(
    taskID: string,
    lambdaFunctionArn: string,
    ruleArn: string,
  ): Promise<void> {
    const permissionParams: AddPermissionCommandInput = {
      FunctionName: lambdaFunctionArn,
      StatementId: taskID,
      Action: 'lambda:InvokeFunction',
      Principal: 'events.amazonaws.com',
      SourceArn: ruleArn,
    };

    try {
      await this.lambdaClient.send(new AddPermissionCommand(permissionParams));
    } catch (error) {
      if (error.name === 'ResourceConflictException') {
        this.responseService.error(
          `Permission already exists for rule ${taskID}`,
        );
      } else {
        throw error;
      }
    }
  }

  private async addCloudWatchTarget(
    taskID: string,
    lambdaFunctionArn: string,
  ): Promise<void> {
    const putTargetsParams = {
      Rule: taskID,
      Targets: [
        {
          Arn: lambdaFunctionArn,
          Id: taskID,
          Input: JSON.stringify({ taskID }),
        },
      ],
    };

    await this.cloudWatchClient.send(new PutTargetsCommand(putTargetsParams));
  }

  private async handleCommand<T>(command: Promise<T>, successMessage: string) {
    try {
      const response = await command;
      this.responseService.verbose(successMessage);
      // this.responseService.verbose(JSON.stringify(response));
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
      });

      const taskArnsResponse = await this.handleCommand(
        this.ecsClient.send(listTasksCommand),
        MessagesEphemeralEnvironment.LISTED_TASKS_SUCCESS,
      );

      if (
        !taskArnsResponse.taskArns ||
        taskArnsResponse.taskArns.length === 0
      ) {
        return null;
      }

      const describeTasksCommand = new DescribeTasksCommand({
        cluster: this.clusterName,
        tasks: taskArnsResponse.taskArns,
      });

      const taskDescriptionsResponse = await this.handleCommand(
        this.ecsClient.send(describeTasksCommand),
        MessagesEphemeralEnvironment.DESCRIBED_TASK_SUCCESS,
      );

      const matchingTask = taskDescriptionsResponse.tasks?.find((task) => {
        const startedByMatch = task.startedBy.includes(clientId);

        return startedByMatch;
      });

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
      const intervalMinutes = parseInt(
        existingTask.overrides?.containerOverrides
          ?.find((override) => override.name === 'stellar')
          ?.environment?.find((envVar) => envVar.name === 'INTERVAL_MINUTES')
          ?.value || '',
        10,
      );
      const taskStatusResponse = await this.getTaskPublicIp(
        existingTask.taskArn,
      );
      const publicIpAddress = taskStatusResponse.payload.publicIp;

      return this.responseService.createResponse({
        payload: {
          executionInterval: intervalMinutes,
          publicIp: publicIpAddress,
          status: existingTask.lastStatus as DesiredStatus,
          taskArn: existingTask.taskArn || '',
          taskStartedAt: existingTask.startedAt,
          taskStoppedAt: new Date(
            existingTask.startedAt.getTime() + intervalMinutes * 60000,
          ),
        },
        message: MessagesEphemeralEnvironment.TASK_ALREADY_RUNNING,
        type: 'OK',
      });
    }
    const uuid = uuidv4().split('-')[0];

    const taskID = `${clientId}-task-${uuid}`;

    const runTaskParams: RunTaskCommandInput = {
      clientToken: uuid,
      cluster: this.clusterName,
      taskDefinition: this.taskDefinition,
      launchType: LaunchType.FARGATE,
      startedBy: taskID,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          securityGroups: [this.securityGroupId],
          assignPublicIp: AssignPublicIp.ENABLED,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'stellar',
            environment: [
              { name: 'INTERVAL_MINUTES', value: intervalMinutes.toString() },
            ],
          },
        ],
      },
      tags: [
        {
          key: 'intervalMinutes',
          value: intervalMinutes.toString(),
        },
      ],
    };
    try {
      const taskResponse = await this.handleCommand(
        this.ecsClient.send(new RunTaskCommand(runTaskParams)),
        MessagesEphemeralEnvironment.FARGATE_TASK_STARTED,
      );

      const task = taskResponse.tasks?.[0];

      if (!task?.taskArn) {
        await this.stopTask(clientId);
        throw new InternalServerErrorException(
          MessagesEphemeralEnvironment.FARGATE_TASK_NOT_STARTED,
        );
      }
      await this.waitForTaskToRun(task?.taskArn);
      const publicIpResponse = await this.getTaskPublicIp(task?.taskArn);
      const publicIpAddress = publicIpResponse.payload?.publicIp;
      await this.checkStellarContainerStatus(publicIpAddress, clientId);
      const startedAt = task?.startedAt || new Date();
      const stoppedAt = task?.startedAt
        ? new Date(task?.startedAt.getTime() + intervalMinutes * 60000)
        : new Date(Date.now() + intervalMinutes * 60000);
      await this.configureFargateStopRule(taskID, intervalMinutes);
      return this.responseService.createResponse({
        payload: {
          executionInterval: intervalMinutes,
          publicIp: publicIpAddress,
          status: DesiredStatus.RUNNING,
          taskArn: task?.taskArn || '',
          taskStartedAt: startedAt,
          taskStoppedAt: stoppedAt,
        },
        message: MessagesEphemeralEnvironment.FARGATE_TASK_STARTED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      await this.stopTask(clientId);
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

      const taskID = clientData.startedBy;

      const { Targets: targets } = await this.cloudWatchClient.send(
        new ListTargetsByRuleCommand({ Rule: taskID }),
      );

      if (targets?.length) {
        await this.cloudWatchClient.send(
          new RemoveTargetsCommand({
            Rule: taskID,
            Ids: targets
              .map((target) => target.Id)
              .filter((id): id is string => Boolean(id)),
          }),
        );
      }

      await this.cloudWatchClient.send(new DeleteRuleCommand({ Name: taskID }));

      const removePermissionSafely = async (
        command: () => Promise<RemovePermissionCommandOutput>,
        errorMessage: string,
      ) => {
        try {
          await command();
        } catch (error) {
          if ((error as Error).name !== 'ResourceNotFoundException') {
            throw error;
          }
          this.responseService.warn(errorMessage);
        }
      };

      await removePermissionSafely(
        () =>
          this.cloudWatchClient.send(
            new RemovePermissionCommand({ StatementId: taskID }),
          ),
        `EventBus does not have a policy for StatementId: ${taskID}`,
      );

      await removePermissionSafely(
        () =>
          this.lambdaClient.send(
            new LambdaRemovePermissionCommand({
              FunctionName: process.env.LAMBDA_ARN,
              StatementId: taskID,
            }),
          ),
        `Lambda does not have a policy for StatementId: ${taskID}`,
      );

      await removePermissionSafely(
        () =>
          this.cloudWatchClient.send(
            new RemoveTargetsCommand({
              Rule: taskID,
              Ids: [taskID],
            }),
          ),
        `Failed to remove trigger for Rule: ${taskID}`,
      );

      const eventSourceMappings = await this.lambdaClient.send(
        new ListEventSourceMappingsCommand({
          FunctionName: process.env.LAMBDA_ARN,
        }),
      );

      if (eventSourceMappings.EventSourceMappings) {
        const mappingToDelete = eventSourceMappings.EventSourceMappings.find(
          (mapping) => mapping.UUID === taskID,
        );

        if (mappingToDelete) {
          await this.lambdaClient.send(
            new DeleteEventSourceMappingCommand({ UUID: mappingToDelete.UUID }),
          );
        }
      }

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
      const taskResponse = await this.handleCommand(
        this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
        MessagesEphemeralEnvironment.TASK_INFO_RETRIEVED,
      );

      const task = taskResponse.tasks?.[0];
      const networkInterfaceId = task?.attachments?.[0]?.details?.find(
        (detail) => detail.name === 'networkInterfaceId',
      )?.value;

      if (!networkInterfaceId) {
        throw new InternalServerErrorException(
          MessagesEphemeralEnvironment.NO_NETWORK_INTERFACE,
        );
      }

      const describeNetworkInterfacesCommand =
        new DescribeNetworkInterfacesCommand({
          NetworkInterfaceIds: [networkInterfaceId],
        });

      const describeNetworkInterfacesResponse = await this.ec2Client.send(
        describeNetworkInterfacesCommand,
      );
      const publicIpAddress =
        describeNetworkInterfacesResponse.NetworkInterfaces?.[0]?.Association
          ?.PublicIp;

      if (publicIpAddress) {
        return this.responseService.createResponse({
          payload: { publicIp: publicIpAddress },
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

  private async checkStellarContainerStatus(
    ip: string,
    clientId: string,
  ): Promise<boolean> {
    const url = `http://${ip}:8000`;
    const maxAttempts = 5;
    const waitTime = 2000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await lastValueFrom(this.httpService.get(url));
        if (response.status !== 502) {
          this.responseService.verbose(
            `Stellar container is running at ${url}`,
          );

          const keypair = StellarSdk.Keypair.random();
          const publicKey = keypair.publicKey();

          await this.getAccountOrFund(publicKey, clientId);

          return true;
        } else {
          this.responseService.verbose(
            `Received status 502 from ${url}, retrying...`,
          );
        }
      } catch (error) {
        if (error.response?.status !== 502) {
          this.responseService.error(
            `Error accessing Stellar container at ${url}: ${error.message}`,
          );
          return false;
        } else {
          this.responseService.verbose(
            `Received status 502 from ${url}, retrying...`,
          );
        }
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempts++;
    }

    this.responseService.error(
      `Stellar container did not start properly after ${maxAttempts} attempts`,
    );
    await this.stopTask(clientId);
    return false;
  }

  async getTaskStatus(clientId: string): IPromiseResponse<ITaskInfo> {
    const task = await this.getClientTask(clientId);

    if (!task) {
      throw new NotFoundException(
        MessagesEphemeralEnvironment.NO_RUNNING_TASKS,
      );
    }

    const taskStatusResponse = await this.getTaskPublicIp(task.taskArn);
    const publicIpAddress = taskStatusResponse.payload.publicIp;
    if (!publicIpAddress) {
      throw new InternalServerErrorException(
        MessagesEphemeralEnvironment.NO_PUBLIC_IP,
      );
    }

    const intervalMinutes = parseInt(
      task.overrides?.containerOverrides
        ?.find((override) => override.name === 'stellar')
        ?.environment?.find((envVar) => envVar.name === 'INTERVAL_MINUTES')
        ?.value || '',
      10,
    );

    const endTime = task.startedAt
      ? new Date(task.startedAt.getTime() + intervalMinutes * 60000)
      : new Date(Date.now() + intervalMinutes * 60000);

    return this.responseService.createResponse({
      payload: {
        status: (task.lastStatus || DesiredStatus.STOPPED) as DesiredStatus,
        taskArn: task.taskArn || '',
        publicIp: publicIpAddress,
        taskStartedAt: task.startedAt,
        taskStoppedAt: endTime,
        executionInterval: intervalMinutes,
      },
      message: MessagesEphemeralEnvironment.TASK_STATUS_RETRIEVED,
      type: 'OK',
    });
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

      const taskResponse = await this.handleCommand(
        this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
        MessagesEphemeralEnvironment.DESCRIBED_TASK_FOR_WAITING,
      );

      const task = taskResponse.tasks?.[0];
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
        const taskResponse = await this.handleCommand(
          this.ecsClient.send(new DescribeTasksCommand(describeTaskParams)),
          MessagesEphemeralEnvironment.DESCRIBED_TASK_FOR_WAITING,
        );

        const task = taskResponse.tasks?.[0];
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

  async getAccountOrFund(
    publicKey: string,
    clientId: string,
  ): IPromiseResponse<void> {
    const taskStatusResponse = await this.getTaskStatus(clientId);
    const urlEphimeral = await this.getTaskPublicIp(
      taskStatusResponse.payload.taskArn,
    );

    return await this.fetchWithRetry(
      `http://${urlEphimeral.payload.publicIp}:8000/friendbot?addr=${publicKey}`,
    );
  }

  private async fetchWithRetry(url: string): IPromiseResponse<void> {
    let response: AxiosResponse<any, any>;
    do {
      try {
        response = await lastValueFrom(this.httpService.get(url));
        if (response.status === 200) {
          return this.responseService.createResponse({
            message: 'Account funded successfully',
            type: 'OK',
          });
        }
      } catch (error) {
        if (
          error.response?.status === 400 &&
          error.response?.data?.detail ===
            'account already funded to starting balance'
        ) {
          return this.responseService.createResponse({
            message: 'Account already funded to starting balance',
            type: 'OK',
          });
        }
        console.error('Fetch failed, retrying in 3 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } while (response?.status !== 200);
  }
}
