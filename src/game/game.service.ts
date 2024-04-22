import { Injectable } from '@nestjs/common';
import { CreateGameDto, createMoveDto, updateGameDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameDocument } from './models/Game';
import { GAME_MODE, GAME_STATUS, GAME_WINNER } from 'src/common/constant';

@Injectable()
export class GameService {
    constructor(@InjectModel('Game') private gameModel: Model<GameDocument>) {}

    async create(createGameDto: CreateGameDto) {
        const createdGame = new this.gameModel({
            ...createGameDto,
            status:
                createGameDto.mode === GAME_MODE.PVB
                    ? GAME_STATUS.PLAYING
                    : GAME_STATUS.WAITNG,
        });
        return await createdGame.save();
    }

    async createMove(createMoveDto: createMoveDto) {
        const { gameId } = createMoveDto;
        delete createMoveDto.gameId;
        const updatedGame = await this.gameModel
            .findOneAndUpdate(
                {
                    _id: gameId,
                },
                {
                    $push: {
                        moves: { ...createMoveDto, createdAt: new Date() },
                    },
                },
            )
            .populate('xPlayer')
            .populate('oPlayer');
        return updatedGame;
    }

    findAll() {
        return `This action returns all game`;
    }

    async findOneById(id: string) {
        const game = await this.gameModel
            .findById(id)
            .populate('xPlayer')
            .populate('oPlayer');
        return game;
    }

    async updateOne(_id: string, updateGameDto: updateGameDto) {
        const game = await this.gameModel.updateOne({ _id }, updateGameDto);
        return game;
    }

    async finishGameIfUserDisconnect(userId: string, gameId: string) {
        const game = await this.gameModel.findOne({ _id: gameId });
        if (game) {
            const winner = game?.xPlayer?.toString() === userId 
                ? GAME_WINNER.O_PLAYER 
                : GAME_WINNER.X_PLAYER;
            const status = GAME_STATUS.FINISHED;
            const updatedGame = await this.gameModel.updateOne({ _id: gameId }, { status, winner });
            return updatedGame
        }
    }
}
