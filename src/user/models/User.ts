import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_STATUS, USER_TYPE } from 'src/common/constant';

export type UserDocument = User & Document<Types.ObjectId>;
@Schema({ 
    timestamps: true, 
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
        }
    }
})
export class User {
    @Prop({ required: function() {
        return this?.type && this.type == USER_TYPE.NORMAL
    }})
    email: string
    @Prop({ required: true })
    username: string
    @Prop({ required: function() {
        return this?.type && this.type == USER_TYPE.NORMAL
    }})
    password: string
    @Prop({ required: true, default: false })
    deleted: boolean
    @Prop({ required: true, default: USER_TYPE.NORMAL, enum: USER_TYPE })
    type: string
    @Prop({ required: true, default: USER_STATUS.UNVERIFIED, enum: USER_STATUS })
    status: string
    @Prop()
    createdAt: Date
    @Prop()
    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);