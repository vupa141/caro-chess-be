import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { extractToken } from '../helpers/commonFunction';
import { verify } from 'jsonwebtoken';

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
            return await verify(token, publicKey);
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}
