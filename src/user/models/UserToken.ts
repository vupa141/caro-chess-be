import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { USER_TOKEN_TYPE } from 'src/common/constant';

@Schema({ timestamps: true })
export class UserToken {
    @Prop({ required: true })
    token: string;
    @Prop({ required: true, ref: 'User' })
    userId: Types.ObjectId;
    @Prop({ required: true, default: false })
    deleted: boolean;
    @Prop({ required: true, enum: USER_TOKEN_TYPE })
    type: string;
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
