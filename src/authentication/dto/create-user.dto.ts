import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
export class CreateUserDto extends LoginUserDto{
    @IsEmail()
    email: string;
}