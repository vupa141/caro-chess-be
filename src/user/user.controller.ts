import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    HttpCode,
    UseGuards,
    HttpException,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    GuestLoginDto,
    GuestSignupDto,
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
} from './dto';
import {
    HTTP_STATUS_CODE,
    USER_STATUS,
    USER_TOKEN_TYPE,
    USER_TYPE,
} from 'src/common/constant';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { UserTokenService } from './userToken.service';
import { compareSync } from 'bcrypt';
import {
    generateRandomToken,
    hashPassword,
    signToken,
} from 'src/common/helpers/commonFunction';
import {
    createAccountTemplate,
    forgotPasswordTemplate,
    sendMail,
} from 'src/common/mail/mail';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userTokenService: UserTokenService,
    ) {}

    @Post('/login')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async logIn(@Body() userDto: LoginDto) {
        const { email, password } = userDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.NOT_FOUND,
                    'User Not Found',
                    [{ key: 'email' }],
                ),
                HTTP_STATUS_CODE.NOT_FOUND,
            );
        }
        if (user.status === USER_STATUS.UNVERIFIED) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.UNAUTHORIZED,
                    'User Not Verified',
                    [{ key: 'email' }],
                ),
                HTTP_STATUS_CODE.UNAUTHORIZED,
            );
        }
        if (!compareSync(password, user.password)) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    'Wrong Password',
                    [{ key: 'password' }],
                ),
                HTTP_STATUS_CODE.BAD_REQUEST,
            );
        }
        const accessToken = signToken({ id: user._id });
        const refreshToken = await this.userTokenService.createToken(
            user._id,
            generateRandomToken(),
            USER_TOKEN_TYPE.REFRESH,
        );
        delete user.password;
        return new SuccessResponse({
            accessToken,
            refreshToken: refreshToken.token,
            user,
        });
    }

    @Post('/signup')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async signUp(@Body() userDto: RegisterDto) {
        const { username, email, password } = userDto;
        let user = await this.userService.findByEmail(email);
        if (user) {
            if (user.status === USER_STATUS.VERIFIED) {
                throw new HttpException(
                    new ErrorResponse(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        'Email Existed',
                        [{ key: 'email' }],
                    ),
                    HTTP_STATUS_CODE.BAD_REQUEST,
                );
            } else {
                user = await this.userService.update(user._id.toString(), {
                    username,
                    password: hashPassword(password),
                });
            }
        } else {
            user = await this.userService.create({
                username,
                email,
                password: hashPassword(password),
                status: USER_STATUS.UNVERIFIED,
            });
        }
        const verifyEmailToken = await this.userTokenService.createToken(
            user._id,
            generateRandomToken(),
            USER_TOKEN_TYPE.VERIFY_EMAIL,
        );
        const htmlEmail = createAccountTemplate(verifyEmailToken.token);
        sendMail({
            from: 'Caro Game',
            to: email,
            subject: 'Verify Your Account - Caro Game',
            html: htmlEmail,
        });
        delete user.password;
        return new SuccessResponse({ user });
    }

    @Post('/verify-account')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async verifyAccount(@Body() { token }: { token: string }) {
        const verifyToken = await this.userTokenService.findToken(
            token,
            USER_TOKEN_TYPE.VERIFY_EMAIL,
        );
        if (!verifyToken) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    'Verify Token Invalid',
                    [{ key: 'token' }],
                ),
                HTTP_STATUS_CODE.BAD_REQUEST,
            );
        } else {
            const userId = verifyToken.userId;
            const updatedUser = await this.userService.update(
                userId.toString(),
                { status: USER_STATUS.VERIFIED },
            );
            const accessToken = signToken({ id: updatedUser._id });
            const refreshToken = await this.userTokenService.createToken(
                updatedUser._id,
                generateRandomToken(),
                USER_TOKEN_TYPE.REFRESH,
            );
            return new SuccessResponse({
                user: updatedUser,
                accessToken,
                refreshToken,
            });
        }
    }

    @Post('/forgot-password')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async forgotPasswordToken(@Body() { email }: { email: string }) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.NOT_FOUND,
                    'User Not Found',
                    [{ key: 'email' }],
                ),
                HTTP_STATUS_CODE.NOT_FOUND,
            );
        }
        if (user.status === USER_STATUS.UNVERIFIED) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.UNAUTHORIZED,
                    'User Not Verified',
                    [{ key: 'email' }],
                ),
                HTTP_STATUS_CODE.UNAUTHORIZED,
            );
        }
        const forgotPasswordToken = await this.userTokenService.createToken(
            user._id,
            generateRandomToken(),
            USER_TOKEN_TYPE.FORGOT_PASSWORD,
        );
        const htmlEmail = forgotPasswordTemplate(forgotPasswordToken.token);
        sendMail({
            from: 'Caro Game',
            to: email,
            subject: 'Reset Your Password - Caro Game',
            html: htmlEmail,
        });
        return new SuccessResponse({});
    }

    @Patch('/reset-password')
    async resetPassword(@Body() data: ResetPasswordDto) {
        const forgotPasswordToken = await this.userTokenService.findToken(
            data.token,
            USER_TOKEN_TYPE.FORGOT_PASSWORD,
        );
        if (!forgotPasswordToken) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    'Reset Password Token Invalid',
                    [{ key: 'token' }],
                ),
                HTTP_STATUS_CODE.BAD_REQUEST,
            );
        } else {
            const userId = forgotPasswordToken.userId;
            await this.userService.update(userId.toString(), {
                password: hashPassword(data.password),
            });
            return new SuccessResponse({});
        }
    }

    @UseGuards(AuthenticationGuard)
    @Post('/access-token')
    async getAccessToken(
        @Body() { refreshToken }: { refreshToken: string },
        @Req() req,
    ) {
        const token = await this.userTokenService.findToken(
            refreshToken,
            USER_TOKEN_TYPE.REFRESH,
        );
        if (!token) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    'Refresh Token Invalid',
                    [{ key: 'refeshToken' }],
                ),
                HTTP_STATUS_CODE.BAD_REQUEST,
            );
        }
        const accessToken = signToken({ id: req.loginUser._id });
        return new SuccessResponse({ accessToken });
    }

    @UseGuards(AuthenticationGuard)
    @Get('/profile')
    async whoAmI(@Req() req) {
        const user = await this.userService.findById(req.loginUser.id);
        return new SuccessResponse({
            profile: user,
        });
    }

    @Post('/guest-signup')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async guestSignUp(@Body() userDto: GuestSignupDto) {
        const { username } = userDto;
        const newUser = await this.userService.create({
            username,
            type: USER_TYPE.GUEST,
            status: USER_STATUS.UNVERIFIED,
        });
        const accessToken = signToken({ id: newUser._id });
        const refreshToken = await this.userTokenService.createToken(
            newUser._id,
            generateRandomToken(),
            USER_TOKEN_TYPE.REFRESH,
        );
        delete newUser.password;
        return new SuccessResponse({
            accessToken,
            refreshToken: refreshToken.token,
            user: newUser,
        });
    }

    @Post('/guest-login')
    @HttpCode(HTTP_STATUS_CODE.SUCCESS)
    async guestLogin(@Body() guestLoginDto: GuestLoginDto) {
        const { id } = guestLoginDto;
        const user = await this.userService.findById(id);
        if (!user) {
            throw new HttpException(
                new ErrorResponse(
                    HTTP_STATUS_CODE.NOT_FOUND,
                    'User Not Found',
                    [{ key: '_id' }],
                ),
                HTTP_STATUS_CODE.NOT_FOUND,
            );
        }
        const accessToken = signToken({ id: user._id });
        const refreshToken = await this.userTokenService.createToken(
            user._id,
            generateRandomToken(),
            USER_TOKEN_TYPE.REFRESH,
        );
        delete user.password;
        return new SuccessResponse({
            accessToken,
            refreshToken: refreshToken.token,
            user,
        });
    }

    // TO DO
    @Patch('/update-type')
    async updateUserType(@Body() data: any) {}
}
