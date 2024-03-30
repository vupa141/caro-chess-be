import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { extractToken } from '../helpers/commonFunction';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractToken(request.headers.authorization || '');
        if (!token) {
            throw new UnauthorizedException();
        }
        request.loginUser = await this.validateToken(token);
        // TODO: implement logic later
        return true;
    }

    async validateToken(token: string) {
        const publicKey = process.env.JWT_TOKEN_SECRET_KEY
            .replace(/\\n/g, '\n');
        try {
            return await jwt.verify(token, publicKey, {
                ignoreExpiration: false,
                algorithms: ['RS256'],
            });
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}
