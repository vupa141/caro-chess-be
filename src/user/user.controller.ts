import { Body, Controller, Get, Post, HttpCode, UseGuards, HttpException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { UserDto } from './dto';
import { HTTP_STATUS_CODE } from 'src/common/constant';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { UserTokenService } from './userToken.service';
import { compareSync } from 'bcrypt';
import { generateRandomToken, hashPassword, signToken } from 'src/common/helpers/commonFunction';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly UserTokenService: UserTokenService
    ) {}

    @Post('/login')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async logIn(@Body() userDto: UserDto) {
        const { username, password } = userDto;
        const user = await this.userService.findByName(username);
        if (!user) {
            throw new HttpException(
                new ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, 'User Not Found', [{ key: 'username' }]),
                HTTP_STATUS_CODE.NOT_FOUND
            );
        }
        if (!compareSync(password, user.password)) {
            throw new HttpException(
                new ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, 'Wrong Password', [{ key: 'password' }]),
                HTTP_STATUS_CODE.BAD_REQUEST
            );
        }
        const accessToken = signToken({  id: user._id });
        const refreshToken = await this.UserTokenService.createToken(user._id, generateRandomToken());
        delete user.password;
        return new SuccessResponse({
            accessToken,
            refreshToken: refreshToken.token,
            user
        })
    }

    @Post('/signup')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async signUp(@Body() userDto: UserDto) {
        const { username, password } = userDto;
        const user = await this.userService.findByName(username);
        if (user) {
            throw new HttpException(
                new ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, 'User Exist', [{ key: 'username' }]),
                HTTP_STATUS_CODE.BAD_REQUEST
            );            
        }
        const hashedPassword = hashPassword(password);
        const newUser = await this.userService.create({
            username, password: hashedPassword
        });
        const accessToken = signToken({  id: newUser._id });
        const refreshToken = await this.UserTokenService.createToken(newUser._id, generateRandomToken());
        delete newUser.password;
        return new SuccessResponse({
            accessToken,
            refreshToken: refreshToken.token,
            user: newUser
        })
    }

    @UseGuards(AuthenticationGuard)
    @Get('/access-token')
    async getAccessToken(@Body() { refreshToken } : { refreshToken: string }, @Req() req) {
        const token = await this.UserTokenService.findToken(refreshToken);
        if (!token) {
            throw new HttpException(
                new ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, 'Refresh Token Invalid', [{ key: 'refeshToken' }]),
                HTTP_STATUS_CODE.BAD_REQUEST
            );
        }
        const accessToken = signToken({  id: req.loginUser._id });
        return new SuccessResponse({ accessToken });
    }

    @UseGuards(AuthenticationGuard)
    @Get('/user-profile')
    async whoAmI(@Req() req) {
        const user = await this.userService.findById(req.loginUser.id);
        return new SuccessResponse({
            profile: user
        })
    }
}
