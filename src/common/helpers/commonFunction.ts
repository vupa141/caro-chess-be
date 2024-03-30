import { hashSync, genSaltSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substring(7, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
}

export function extractTimeAmountAndUnit(time: string) {
    return {
        amount: time.slice(0, -1),
        unit: time.slice(-1)
    }
}

export function generateRandomToken(length = 20): string {
    let randomString = '';
    const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      randomString += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
    }
    return randomString;
}

export function signToken(data: any) {
    return sign(data, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN})
}