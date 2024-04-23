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
            createdBy: createGameDto?.xPlayer ?? createGameDto.oPlayer
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
                {
                    new: true
                }
            )
            .populate('xPlayer')
            .populate('oPlayer')
            .select('-moves');
        return updatedGame;
    }

    async findOneById(id: string, populatePlayer = true) {
        const game = 
            populatePlayer 
            ? await this.gameModel
                .findById(id)
                .populate('xPlayer')
                .populate('oPlayer')
                .select('-moves')
            : await this.gameModel.findById(id);
        return game;
    }

    async updateOne(_id: string, updateGameDto: updateGameDto) {
        const game = await this.gameModel.updateOne({ _id }, updateGameDto);
        return game;
    }

    async joinGame(gameId: string, userId: string) {
        const game = await this.gameModel.findOne({ _id: gameId, status: GAME_STATUS.WAITNG });
        const updateData = {
            ...game.xPlayer && {
                oPlayer: userId
            },
            ...game.oPlayer && {
                xPlayer: userId
            },
            status: GAME_STATUS.PLAYING
        }
        const updatedGame = await this.gameModel
            .findOneAndUpdate({ _id: gameId }, updateData, { new: true })
            .populate('xPlayer')
            .populate('oPlayer');
        return updatedGame;      
    }

    async terminateGame(userId: string, gameId: string) {
        const game = await this.gameModel.findOne({ _id: gameId });
        if (game) {
            const winner = game?.xPlayer?.toString() === userId 
                ? GAME_WINNER.O_PLAYER 
                : GAME_WINNER.X_PLAYER;
            const status = GAME_STATUS.TERMINATED;
            const updatedGame = await this.gameModel.findOneAndUpdate({ _id: gameId }, { status, winner }, { new: true });
            return updatedGame
        }
    }
}
