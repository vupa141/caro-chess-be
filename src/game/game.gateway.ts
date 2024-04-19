import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    constructor(private readonly gameService: GameService) { }

    @WebSocketServer() server: Server;

    // afterInit(server: Server) {
    //     console.log(server);
    //     //Do stuffs
    // }

    handleDisconnect(client: Socket) {
        console.log(`Client Disconnected: ${client.id}`);
        //Do stuffs
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client Connected: ${client.id}`);
        //Do stuffs
    }

    @SubscribeMessage('createGame')
    create(@MessageBody() createGameDto: CreateGameDto) {
        return this.gameService.create(createGameDto);
    }

    @SubscribeMessage('move')
    move(@MessageBody() moveDto) {
        //
    }

}
