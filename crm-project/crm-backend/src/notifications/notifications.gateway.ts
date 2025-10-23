import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token as string;
      if (!token) {
        this.logger.warn('Client connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync<{ email: string }>(
        token,
      );
      this.logger.log(`Client connected: ${payload.email} (${client.id})`);
    } catch {
      this.logger.error('Client connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit notification to all connected clients

  emitNotificationCreated(notification: any) {
    this.server.emit('notification:created', notification);
    this.logger.log(
      `Emitted notification:created for notification ${notification.id}`,
    );
  }

  // Emit notification update to all connected clients

  emitNotificationUpdated(notification: any) {
    this.server.emit('notification:updated', notification);
    this.logger.log(
      `Emitted notification:updated for notification ${notification.id}`,
    );
  }
}
