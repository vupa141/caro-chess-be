import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto';
import { Socket, Server } from 'socket.io';
import { SuccessResponse } from 'src/common/helpers/response';

@WebSocketGateway({
    cors: {
      origin: process.env.CLIENT_HOST,
      credentials: true,
    },
  })
export class GameGateway {
    constructor(private readonly gameService: GameService) { }

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        console.log(server);
        //Do stuffs
    }

    handleDisconnect(client: Socket) {
        console.log(`Client Disconnected: ${client.id}`);
        //Do stuffs
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client Connected: ${client.id}`);
        //Do stuffs
    }

    @SubscribeMessage('create-game')
    async create(@MessageBody() createGameDto: CreateGameDto) {
        const createResult = await this.gameService.create(createGameDto)
        return new SuccessResponse(createResult)
    }

    @SubscribeMessage('get-game')
    async get(@MessageBody() { id }: { id: string }) {
        const result = await this.gameService.findOneById(id)
        return new SuccessResponse(result)
    }


    @SubscribeMessage('move')
    move(@MessageBody() moveDto) {
        //
    }

}
