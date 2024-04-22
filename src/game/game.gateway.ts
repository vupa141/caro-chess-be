import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto, createMoveDto } from './dto';
import { Socket, Server } from 'socket.io';
import { SuccessResponse } from 'src/common/helpers/response';
import { GAME_STATUS, GAME_WINNER } from 'src/common/constant';
import { SocketAuthenticationGuard } from 'src/common/guards/authentication.guard';
import { UseGuards } from '@nestjs/common';
@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_HOST,
        credentials: true,
    },
})
export class GameGateway {
    constructor(private readonly gameService: GameService) {}

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

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('create-game')
    async create(
        @MessageBody() createGameDto: CreateGameDto,
        @ConnectedSocket() client: Socket,
    ) {
        const createResult = await this.gameService.create(createGameDto);
        client.handshake.auth.gameId = createResult._id;
        return new SuccessResponse(createResult);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('get-game')
    async get(@MessageBody() { id }: { id: string }) {
        const result = await this.gameService.findOneById(id);
        return new SuccessResponse(result);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('move')
    async move(@MessageBody() moveDto: createMoveDto) {
        const result = await this.gameService.createMove(moveDto);
        return new SuccessResponse(result);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('finish')
    async finishGame(
        @MessageBody() { id, winner }: { id: string; winner: GAME_WINNER },
    ) {
        console.log('finish: ', id, winner);
        const result = await this.gameService.updateOne(id, {
            status: GAME_STATUS.FINISHED,
            winner,
        });
        return new SuccessResponse(result);
    }
}
