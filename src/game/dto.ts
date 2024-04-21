import { IsEnum, IsNotEmpty } from "class-validator";
import { GAME_MODE } from "src/common/constant";

export class CreateGameDto {
    @IsEnum(GAME_MODE)
    mode: string
    @IsNotEmpty()
    xPlayer?: string
    @IsNotEmpty()
    oPlayer?: string
}
