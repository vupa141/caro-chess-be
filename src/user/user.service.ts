import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Condition, Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './models/User';
import { GuestUserDto, UpdateUserDto, UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

    async create(user: UserDto | GuestUserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(user);
        return await createdUser.save();
    }

    async findByName(username: string): Promise<UserDocument> {
        return this.userModel.findOne({ username, deleted: false });
    }

    async findByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email, deleted: false });
    }

    async findById(id: ObjectId | string): Promise<UserDocument> {
        return this.userModel.findOne({
            _id: id as Condition<ObjectId>,
            deleted: false,
        });
    }

    async update(id: string, data: UpdateUserDto): Promise<UserDocument> {
        return await this.userModel.findOneAndUpdate(
            {
                _id: id,
            },
            data,
        );
    }
}
