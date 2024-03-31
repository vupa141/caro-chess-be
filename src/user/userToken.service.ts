import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserToken } from './models/UserToken';
import * as moment from 'moment';
import { extractTimeAmountAndUnit } from 'src/common/helpers/commonFunction';

@Injectable()
export class UserTokenService {
    constructor(
        @InjectModel('UserToken') private userTokenModel: Model<UserToken>,
    ) {}

    async createToken(userId: Types.ObjectId, token: string): Promise<UserToken> {
        const createdToken =  new this.userTokenModel({ token, userId });
        return await createdToken.save();
    }

    async findToken(token: string): Promise<UserToken> {
        const time = extractTimeAmountAndUnit(process.env.REFRESH_TOKEN_EXPIRE_IN)
        return this.userTokenModel.findOne({
            token,
            deleted: false,
            createdAt: { 
                $gt: moment().subtract(
                    time.amount as moment.DurationInputArg1,
                    time.unit as moment.DurationInputArg2
                ).toDate()
            }
        });
    }
}
