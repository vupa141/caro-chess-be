import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameDocument } from './models/Game';
import { GAME_MODE, GAME_STATUS } from 'src/common/constant';

@Injectable()
export class GameService {
    constructor(@InjectModel('Game') private gameModel: Model<GameDocument>) {}
    
    async create(createGameDto: CreateGameDto) {
        const createdGame = new this.gameModel({
            ...createGameDto,
            status: createGameDto.mode === GAME_MODE.PVB ? GAME_STATUS.PLAYING : GAME_STATUS.WAITNG
        });
        return await createdGame.save();
    }

    findAll() {
        return `This action returns all game`;
    }

    async findOneById(id: string) {
        const game = await this.gameModel.findById(id).populate('xPlayer').populate('oPlayer')
        return game;
    }

    update(id: number, updateGameDto) {
        return `This action updates a #${id} game`;
    }

    remove(id: number) {
        return `This action removes a #${id} game`;
    }
}
