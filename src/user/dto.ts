import { IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/constant';

export class UserDto {
    @IsNotEmpty()
    username: string;   
    @Matches(PASSWORD_REGEX)
    password: string;
}