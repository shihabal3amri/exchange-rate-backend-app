import { IsEmail, IsNotEmpty, IsString, Max, MaxLength, MinLength } from 'class-validator';
export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    password: string;
}