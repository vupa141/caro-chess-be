import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
    GAME_MODE,
    GAME_STATUS,
    MOVE_TYPE,
    USER_STATUS,
    USER_TYPE,
} from 'src/common/constant';

export type GameDocument = Game & Document<Types.ObjectId>;
@Schema({
    timestamps: true,
})
export class Game {
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
    @Prop()
    finisheddAt: Date;
    @Prop({ required: true, enum: GAME_STATUS })
    status: String;
    @Prop({ required: true, enum: GAME_MODE })
    mode: String;
    @Prop({ required: function() {
        return this.mode === GAME_MODE.PVP && !this.oPlayer
    }, ref: 'User' })
    xPlayer: Types.ObjectId;
    @Prop({ required: function() {
        return this.mode === GAME_MODE.PVP && !this.xPlayer
    }, ref: 'User' })
    oPlayer: Types.ObjectId;
    @Prop({ required: true, default: [] })
    moves: GameMove[];
}

@Schema({
    timestamps: true,
})
class GameMove {
    @Prop()
    createdAt: Date;
    @Prop({ required: true })
    timeElapsed: number;
    @Prop({ required: true, enum: MOVE_TYPE })
    type: Number;
    @Prop({ required: true })
    xPosition: Number;
    @Prop({ required: true })
    yPosition: Number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
