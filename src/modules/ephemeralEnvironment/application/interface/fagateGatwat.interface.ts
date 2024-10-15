import type { Socket } from 'socket.io';

export interface IFargateGateway {
  handleConnection(client: Socket): Promise<void>;
  handleDisconnect(client: Socket): Promise<void>;
  handleStartFargate(client: Socket): Promise<void>;
  handleStopFargate(client: Socket): Promise<void>;
}
