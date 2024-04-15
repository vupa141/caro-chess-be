import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserToken } from './models/UserToken';
import * as moment from 'moment';
import { extractTimeAmountAndUnit } from 'src/common/helpers/commonFunction';
import { USER_TOKEN_TYPE } from 'src/common/constant';

@Injectable()
export class UserTokenService {
    constructor(
        @InjectModel('UserToken') private userTokenModel: Model<UserToken>,
    ) {}

    async createToken(userId: Types.ObjectId, token: string, type: USER_TOKEN_TYPE): Promise<UserToken> {
        const createdToken =  new this.userTokenModel({ token, userId, type });
        return await createdToken.save();
    }

    async findToken(token: string, type: USER_TOKEN_TYPE): Promise<UserToken> {
        let expireIn = ''
        switch (type) {
            case USER_TOKEN_TYPE.REFRESH:
                expireIn = process.env.REFRESH_TOKEN_EXPIRE_IN;
                break;
            case USER_TOKEN_TYPE.VERIFY_EMAIL:
                expireIn = process.env.VERIFY_EMAIL_TOKEN_EXPIRE_IN;
                break;
            case USER_TOKEN_TYPE.FORGOT_PASSWORD:
                expireIn = process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN;
                break;
        }

        const time = extractTimeAmountAndUnit(expireIn)
        return this.userTokenModel.findOne({
            token,
            deleted: false,
            type,
            createdAt: { 
                $gt: moment().subtract(
                    time.amount as moment.DurationInputArg1,
                    time.unit as moment.DurationInputArg2
                ).toDate()
            }
        });
    }
}
