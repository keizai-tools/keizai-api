import { Inject, Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { IFargateGateway } from '../application/interface/fagateGatwat.interface';
import { EphemeralEnvironmentService } from '../application/service/ephemeralEnvironment.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class FargateGateway
  implements OnGatewayConnection, OnGatewayDisconnect, IFargateGateway
{
  @WebSocketServer() server: Server;

  private readonly clientTasks: Map<
    string,
    { taskArn: string; publicIp: string }
  > = new Map();

  constructor(
    private readonly ephemeralEnvironmentService: EphemeralEnvironmentService,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(EphemeralEnvironmentService.name);
  }

  async handleConnection(client: Socket): Promise<void> {
    this.responseService.verbose('Client connected:', client.id);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.responseService.verbose('Client disconnected:', client.id);

    const clientData = this.clientTasks.get(client.id);
    if (clientData?.taskArn) {
      await this.ephemeralEnvironmentService.stopTask(clientData.taskArn);
      this.clientTasks.delete(client.id);
    }
  }

  @SubscribeMessage('startFargate')
  async handleStartFargate(client: Socket): Promise<void> {
    if (this.clientTasks.has(client.id)) {
      this.server.emit('fargateStatus', {
        status: 'ERROR',
        message: 'Task already running for this client',
      });
      return;
    }

    const response = await this.ephemeralEnvironmentService.runTask();

    if (response.type === 'OK') {
      const { taskArn, publicIp } = response.payload;

      this.clientTasks.set(client.id, { taskArn, publicIp });

      this.server.emit('fargateStatus', {
        status: 'RUNNING',
        taskArn,
        publicIp,
      });
    } else {
      this.server.emit('fargateStatus', {
        status: 'ERROR',
        message: response.message,
      });
    }
  }

  @SubscribeMessage('stopFargate')
  async handleStopFargate(client: Socket): Promise<void> {
    const clientData = this.clientTasks.get(client.id);

    if (clientData?.taskArn) {
      const response = await this.ephemeralEnvironmentService.stopTask(
        clientData.taskArn,
      );

      if (response.type === 'OK') {
        this.clientTasks.delete(client.id);
        this.server.emit('fargateStatus', {
          status: 'STOPPED',
          taskArn: clientData.taskArn,
        });
      } else {
        this.server.emit('fargateStatus', {
          status: 'ERROR',
          message: response.message,
        });
      }
    } else {
      this.server.emit('fargateStatus', {
        status: 'ERROR',
        message: 'No task found for this client',
      });
    }
  }
}
