import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { extractToken } from '../helpers/commonFunction';
import { verify } from 'jsonwebtoken';
import { HTTP_STATUS_CODE } from '../constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractToken(request.headers.authorization || '');
        if (!token) {
            throw new UnauthorizedException();
        }
        request.loginUser = await this.validateToken(token);
        return true;
    }

    async validateToken(token: string) {
        const publicKey = process.env.JWT_TOKEN_SECRET_KEY.replace(
            /\\n/g,
            '\n',
        );
        try {
            return verify(token, publicKey);
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}

@Injectable()
export class SocketAuthenticationGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const token = extractToken(client.handshake.auth.token || '');
        if (!token) {
            throw new WsException({
                message: 'Unauthorized',
                code: HTTP_STATUS_CODE.UNAUTHORIZED,
            });
        }
        client.handshake.auth.loginUser = await this.validateToken(token);
        return true;
    }

    async validateToken(token: string) {
        const publicKey = process.env.JWT_TOKEN_SECRET_KEY.replace(
            /\\n/g,
            '\n',
        );
        try {
            return verify(token, publicKey);
        } catch (error) {
            throw new WsException({
                message: 'Unauthorized',
                code: HTTP_STATUS_CODE.UNAUTHORIZED,
            });
        }
    }
}
