import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSchema } from './models/Game';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'game', schema: GameSchema }]),
    ],
    providers: [GameGateway, GameService],
})
export class GameModule {}
