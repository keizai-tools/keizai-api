import {
  DescribeNetworkInterfacesCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import {
  DescribeTasksCommand,
  DescribeTasksCommandInput,
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput,
  StopTaskCommand,
} from '@aws-sdk/client-ecs';
import { Inject } from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { MessagesEphemeralEnvironment } from '../enum/messages.enum';
import type { IEphemeralEnvironmentService } from '../interface/ephemeralEnvironment.interface';

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

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(EphemeralEnvironmentService.name);
    this.region = process.env.AWS_REGION;
    this.clusterName = process.env.CLUSTER_NAME;
    this.taskDefinition = process.env.TASK_DEFINITION;
    this.subnets = process.env.SUBNETS?.split(',') || [];
    this.securityGroupId = process.env.SECURITY_GROUP_ID;
    this.ecsClient = this.createClient(ECSClient) as ECSClient;
    this.ec2Client = this.createClient(EC2Client) as EC2Client;
  }

  private createClient(
    Client: new (options: {
      region: string;
      credentials: { accessKeyId: string; secretAccessKey: string };
    }) => ECSClient | EC2Client,
  ) {
    return new Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ECS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ECS_SECRET_KEY,
      },
    });
  }

  private async handleCommand<T>(command: Promise<T>, successMessage: string) {
    try {
      const response = await command;
      this.responseService.verbose(successMessage, response);
      return response;
    } catch (error) {
      this.responseService.error(error);
    }
  }

  async runTask(): IPromiseResponse<{ taskArn: string; publicIp: string }> {
    const runTaskParams: RunTaskCommandInput = {
      cluster: this.clusterName,
      taskDefinition: this.taskDefinition,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          securityGroups: [this.securityGroupId],
          assignPublicIp: 'ENABLED',
        },
      },
    };

    const runTaskCommand = new RunTaskCommand(runTaskParams);

    try {
      const response = await this.handleCommand(
        this.ecsClient.send(runTaskCommand),
        MessagesEphemeralEnvironment.FARGATE_TASK_STARTED,
      );

      const taskArn = response.tasks?.[0]?.taskArn;

      if (!taskArn) {
        return this.responseService.createResponse({
          message: MessagesEphemeralEnvironment.FARGATE_TASK_NOT_STARTED,
          type: 'INTERNAL_SERVER_ERROR',
        });
      }

      const publicIpResponse = await this.getTaskPublicIp(taskArn);
      const publicIp = publicIpResponse.payload?.publicIp;

      return this.responseService.createResponse({
        payload: { taskArn, publicIp },
        message: MessagesEphemeralEnvironment.FARGATE_TASK_STARTED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      return this.responseService.createResponse({
        message: `${MessagesEphemeralEnvironment.FAILED_TO_START_TASK} ${error.message}`,
        type: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  async stopTask(taskArn: string): IPromiseResponse<{ taskArn: string }> {
    const stopTaskParams = {
      cluster: this.clusterName,
      task: taskArn,
    };

    const stopTaskCommand = new StopTaskCommand(stopTaskParams);

    try {
      await this.handleCommand(
        this.ecsClient.send(stopTaskCommand),
        MessagesEphemeralEnvironment.FARGATE_TASK_STOPPED,
      );

      return this.responseService.createResponse({
        payload: { taskArn },
        message: MessagesEphemeralEnvironment.FARGATE_TASK_STOPPED_SUCCESS,
        type: 'OK',
      });
    } catch (error) {
      return this.responseService.createResponse({
        message: `${MessagesEphemeralEnvironment.FAILED_TO_STOP_TASK} ${error.message}`,
        type: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  async getTaskPublicIp(
    taskArn: string,
  ): IPromiseResponse<{ publicIp: string }> {
    const describeTaskParams: DescribeTasksCommandInput = {
      cluster: this.clusterName,
      tasks: [taskArn],
    };

    const describeTaskCommand = new DescribeTasksCommand(describeTaskParams);

    try {
      const response = await this.handleCommand(
        this.ecsClient.send(describeTaskCommand),
        MessagesEphemeralEnvironment.TASK_INFO_RETRIEVED,
      );

      const task = response.tasks?.[0];
      const eniId = task?.attachments?.[0]?.details?.find(
        (detail) => detail.name === 'networkInterfaceId',
      )?.value;

      if (!eniId) {
        return this.responseService.createResponse({
          message: MessagesEphemeralEnvironment.NO_NETWORK_INTERFACE,
          type: 'INTERNAL_SERVER_ERROR',
        });
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

      return this.responseService.createResponse({
        message: MessagesEphemeralEnvironment.NO_PUBLIC_IP,
        type: 'INTERNAL_SERVER_ERROR',
      });
    } catch (error) {
      return this.responseService.createResponse({
        message: `${MessagesEphemeralEnvironment.FAILED_TO_RETRIEVE_PUBLIC_IP} ${error.message}`,
        type: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
}
