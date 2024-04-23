import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    Min,
    Max,
    IsString,
} from 'class-validator';
import {
    GAME_MODE,
    GAME_STATUS,
    GAME_WINNER,
    MOVE_TYPE,
} from 'src/common/constant';

export class CreateGameDto {
    @IsEnum(GAME_MODE)
    mode: string;
    @IsNotEmpty()
    xPlayer?: string;
    @IsNotEmpty()
    oPlayer?: string;
}

export class createMoveDto {
    @IsString()
    gameId: string;
    @IsEnum(MOVE_TYPE)
    type: number;
    @IsNumber()
    @Min(0)
    @Max(60)
    timeLeft: number;
    @IsNumber()
    @Min(0)
    @Max(19)
    xPosition: number;
    @IsNumber()
    @Min(0)
    @Max(19)
    yPosition: number;
}

export class updateGameDto {
    @IsEnum(GAME_STATUS)
    status?: string;
    @IsEnum(GAME_WINNER)
    winner?: string;
}
