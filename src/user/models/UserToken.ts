import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserToken {
    @Prop({ required: true })
    token: string
    @Prop({ required: true, ref: "User" })
    userId: Types.ObjectId
    @Prop({ required: true, default: false })
    deleted: boolean
    @Prop()
    createdAt: Date
    @Prop()
    updatedAt: Date
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
