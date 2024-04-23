import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    WsException,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto, createMoveDto } from './dto';
import { Socket, Server } from 'socket.io';
import { SuccessResponse } from 'src/common/helpers/response';
import { GAME_MODE, GAME_STATUS, GAME_WINNER, HTTP_STATUS_CODE, MOVE_TYPE } from 'src/common/constant';
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

    async handleDisconnect(client: Socket) {
        const userId = client.handshake.auth?.loginUser?.id;
        const gameId = client.handshake.auth?.gameId;
        if (userId && gameId) {
           const finishedGame = await this.gameService.finishGameIfUserDisconnect(userId, gameId);
           if (finishedGame.mode === GAME_MODE.PVP) {
                this.server.to(gameId).emit('opponent-quit');
           }
        }        
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client Connected: ${client.id}`);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('create-game')
    async create(
        @MessageBody() createGameDto: CreateGameDto,
        @ConnectedSocket() client: Socket,
    ) {
        const createResult = await this.gameService.create(createGameDto);
        client.handshake.auth.gameId = createResult._id.toString();
        if (createGameDto.mode === GAME_MODE.PVP) {
            client.join(createResult._id.toString());
        }
        return new SuccessResponse(createResult);
    }

    // @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('get-game')
    async get(@MessageBody() { id }: { id: string }) {
        const result = await this.gameService.findOneById(id);
        return new SuccessResponse(result);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('join-game')
    async join(
        @MessageBody() { gameId, userId }: { gameId: string, userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const result = await this.gameService.joinGame(gameId, userId);
        if (result) {
            client.handshake.auth.gameId = gameId;
            client.join(gameId);
            this.server.to(gameId).emit('game-started', result);
            return new SuccessResponse(result);
        }
        throw new WsException({
            message: 'Game not found',
            code: HTTP_STATUS_CODE.NOT_FOUND
        })
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('move')
    async move(
        @MessageBody() moveDto: createMoveDto,
        @ConnectedSocket() client: Socket,
    ) {
        const game = await this.gameService.findOneById(moveDto.gameId, false);
        const playerId = client.handshake.auth.loginUser.id;
        const playerKey = moveDto.type === MOVE_TYPE.X ? 'xPlayer' : 'oPlayer';
        if (game.mode === GAME_MODE.PVP) {
            if (playerId !== game[playerKey]) {
                throw new WsException({
                    message: 'Invalid action',
                    code: HTTP_STATUS_CODE.BAD_REQUEST
                })
            }
        }
        if (game.mode === GAME_MODE.PVB) {
            if (playerId !== game.xPlayer && playerId !== game.oPlayer) {
                throw new WsException({
                    message: 'Invalid action',
                    code: HTTP_STATUS_CODE.BAD_REQUEST
                })
            }
        }
        const result = await this.gameService.createMove(moveDto);
        if (game.mode === GAME_MODE.PVP) {
            this.server.to(game._id.toString()).emit('opponent-move', moveDto);
        }
        return new SuccessResponse(result);
    }

    @UseGuards(SocketAuthenticationGuard)
    @SubscribeMessage('finish')
    async finishGame(
        @MessageBody() { id, winner }: { id: string; winner: GAME_WINNER },
    ) {
        const result = await this.gameService.updateOne(id, {
            status: GAME_STATUS.FINISHED,
            winner,
        });
        return new SuccessResponse(result);
    }
}
