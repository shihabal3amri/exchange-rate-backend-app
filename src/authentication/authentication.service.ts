import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_EXPIRATION } from 'src/common/consts';

@Injectable()
export class AuthenticationService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) { }

  async signup(username: string, email: string, plainTextPassword: string) {
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return user;
  }

  async validateUser(username: string, plainTextPassword: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({ where: { username } });
    if (user && await bcrypt.compare(plainTextPassword, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, plainTextPassword: string) {
    const user = await this.validateUser(username, plainTextPassword);
    if (!user) {
      throw new HttpException('Invalid username or password', HttpStatus.UNAUTHORIZED);
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.ACCESS_TOKEN_SECRET });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRATION});

    // Store the refresh token in the database
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
      // Verify if the token matches the one stored in the database
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });
  
      if (!user || user.refreshToken !== refreshToken) {
        throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      }
  
      const newPayload = {
        username: payload.username,
        sub: payload.sub,
      };
  
      // Generate new tokens
      const newAccessToken = this.jwtService.sign(newPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
      const newRefreshToken = this.jwtService.sign(newPayload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRATION});
  
      // Update the refresh token in the database
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });
  
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw new HttpException('Refresh token validation failed', HttpStatus.UNAUTHORIZED);

    }
  }
   
}
