import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

export interface ITaskInfo {
  taskArn: string;
  publicIp: string;
}
export interface IEphemeralEnvironmentService {
  startTask(clientId: string): Promise<IPromiseResponse<ITaskInfo>>;
  stopTask(
    taskArn: string,
    clientId: string,
  ): IPromiseResponse<{ taskArn: string }>;
  getClientTask(clientId: string): Promise<ITaskInfo | null>;
  deleteClientTask(clientId: string): Promise<void>;
  saveClientTask(
    clientId: string,
    taskArn: string,
    publicIp: string,
  ): Promise<void>;
  getTaskPublicIp(taskArn: string): IPromiseResponse<{ publicIp: string }>;
}

export const EPHEMERAL_ENVIRONMENT_SERVICE = 'EPHEMERAL_ENVIRONMENT_SERVICE';
