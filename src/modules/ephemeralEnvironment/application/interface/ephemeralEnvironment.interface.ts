import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

export interface IEphemeralEnvironmentService {
  runTask(): IPromiseResponse<{ taskArn: string; publicIp: string }>;
  stopTask(taskArn: string): IPromiseResponse<{ taskArn: string }>;
  getTaskPublicIp(taskArn: string): IPromiseResponse<{ publicIp: string }>;
}

export const EPHEMERAL_ENVIRONMENT_SERVICE = 'EPHEMERAL_ENVIRONMENT_SERVICE';
