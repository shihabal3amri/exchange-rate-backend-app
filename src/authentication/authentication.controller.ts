import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('v1/auth')
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) { }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signup(createUserDto.username, createUserDto.email, createUserDto.password);
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return await this.authService.login(loginUserDto.username, loginUserDto.password);
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return await this.authService.refreshToken(refreshToken);
    }

}
