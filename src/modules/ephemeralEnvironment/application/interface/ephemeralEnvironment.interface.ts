import { type DesiredStatus, Task } from '@aws-sdk/client-ecs';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

export interface ITaskInfo {
  status: DesiredStatus;
  taskArn: string;
  publicIp: string;
  taskStartedAt: Date;
  taskStoppedAt: Date;
  executionInterval: number;
}

export interface IEphemeralEnvironmentService {
  startTask(
    clientId: string,
    intervalMinutes: number,
  ): IPromiseResponse<ITaskInfo>;
  stopTask(
    clientId: string,
  ): IPromiseResponse<{ taskArn: string; status: string }>;
  getTaskPublicIp(taskArn: string): IPromiseResponse<{ publicIp: string }>;
  getClientTask(clientId: string): Promise<Task | null>;
  getTaskStatus(clientId: string): IPromiseResponse<ITaskInfo>;
  getAccountOrFund(publicKey: string, clientId: string): IPromiseResponse<void>;
}

export const EPHEMERAL_ENVIRONMENT_SERVICE = 'EPHEMERAL_ENVIRONMENT_SERVICE';
