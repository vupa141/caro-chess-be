import { IsNotEmpty, Matches, IsEnum } from 'class-validator';
import {
    EMAIL_REGEX,
    PASSWORD_REGEX,
    USER_STATUS,
    USER_TYPE,
} from 'src/common/constant';

export class UserDto {
    @IsNotEmpty()
    username: string;
    @Matches(PASSWORD_REGEX)
    password: string;
    @Matches(EMAIL_REGEX)
    email: string;
    @IsEnum(USER_STATUS)
    status: string;
}

export class LoginDto {
    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    email: string;
}

export class RegisterDto {
    @IsNotEmpty()
    username: string;
    @Matches(PASSWORD_REGEX)
    password: string;
    @Matches(EMAIL_REGEX)
    email: string;
}

export class GuestUserDto {
    @IsNotEmpty()
    username: string;
    @IsEnum(USER_TYPE)
    type?: string;
}

export class GuestLoginDto {
    @IsNotEmpty()
    id: string;
}

export class GuestSignupDto {
    @IsNotEmpty()
    username: string;
}
export class UpdateUserDto {
    @Matches(PASSWORD_REGEX)
    password?: string;
    @IsEnum(USER_STATUS)
    status?: string;
    @IsNotEmpty()
    username?: string;
}

export class ResetPasswordDto {
    @Matches(PASSWORD_REGEX)
    password?: string;
    @IsNotEmpty()
    token: string;
}
