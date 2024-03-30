import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
    @Prop({ required: true })
    username: string
    @Prop({ required: true })
    password: string
    @Prop({ required: true, default: false })
    deleted: boolean
    @Prop()
    createdAt: Date
    @Prop()
    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);