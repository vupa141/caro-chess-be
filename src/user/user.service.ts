import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/User';
import { UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private userModel: Model<UserDocument>,
    ) {}

    async create(user: UserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(user);
        return await createdUser.save();
    }

    async findByName(username: string): Promise<UserDocument> {
        return this.userModel.findOne({ username, deleted: false });
    }
}
