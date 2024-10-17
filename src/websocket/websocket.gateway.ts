import { Inject } from '@nestjs/common';
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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(WebsocketGateway.name);
  }

  handleConnection(client: Socket) {
    this.responseService.verbose('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    this.responseService.verbose('Client disconnected:', client.id);
  }

  @SubscribeMessage('balanceUpdate')
  handleMessage(client: Socket) {
    this.responseService.verbose('Balance update received:', client.id);
  }

  notifyBalanceUpdate(userId: string, newBalance: number) {
    this.server.emit('balanceUpdate', { userId, balance: newBalance });
  }
}
