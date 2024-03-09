import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_EXPIRATION } from 'src/common/consts';
import { User } from '@prisma/client';

@Injectable()
export class AuthenticationService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) { }

  async signup(username: string, email: string, plainTextPassword: string) {
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);


    // Check if username already exists
    const existingUsername = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }

    // Check if email already exists
    const existingEmail = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

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

  async validateUser(username: string, plainTextPassword: string): Promise<Omit<User, 'password'>> {
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

    // Generate a cryptographically secure random string
    const randomString = crypto.randomBytes(32).toString('hex');
    const refreshTokenUUID = crypto.randomUUID();

    const accessTokenPayload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(accessTokenPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
    const refreshTokenPayload = { ...accessTokenPayload, rnd: randomString, id: refreshTokenUUID};
    const refreshToken = this.jwtService.sign(refreshTokenPayload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRATION });

    // Hash the combination of userId and randomString
    const hashInput = `${user.id}-${randomString}`;
    const hashedRefreshToken = await bcrypt.hash(hashInput, 10);

    // Store the hashed refresh token in the database
    await this.prismaService.refreshToken.create({
      data: {
        id: refreshTokenUUID,
        token: hashedRefreshToken,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
      // Extract user ID and randomString from the token payload
      if (!payload.sub || !payload.rnd || !payload.id) {
        throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
      }



      // Generate the hash input from the user ID and the extracted randomString
      const hashInput = `${payload.sub}-${payload.rnd}`;

      // Verify if the token matches the one stored in the database
      const refreshTokenInDb = await this.prismaService.refreshToken.findFirst({
        where: {
          id: payload.id,
          userId: payload.sub,
          isArchived: false,
        },
      });

      if (!refreshTokenInDb || !(await bcrypt.compare(hashInput, refreshTokenInDb.token))) {
        throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
      }

      const newPayload = {
        username: payload.username,
        sub: payload.sub,
      };

      // Generate a cryptographically secure random string
      const randomString = crypto.randomBytes(32).toString('hex');
      const refreshTokenUUID = crypto.randomUUID();

      // Generate new tokens
      const newAccessToken = this.jwtService.sign(newPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
      const newRefreshToken = this.jwtService.sign({ ...newPayload, rnd: randomString, id: refreshTokenUUID }, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRATION });

      // Hash the combination of userId and randomString
      const newHashInput = `${refreshTokenInDb.userId}-${randomString}`;
      const hashedNewRefreshToken = await bcrypt.hash(newHashInput, 10);

      await this.prismaService.$transaction(async (tx) => {
        // archive the refresh token in the database
        await tx.refreshToken.update({
          where: {
            id: refreshTokenInDb.id,
          },
          data: {
            isArchived: true,
            archivedAt: new Date(),
          },
        });

        // Store the new hashed refresh token in the database
        await tx.refreshToken.create({
          data: {
            id: refreshTokenUUID,
            token: hashedNewRefreshToken,
            user: {
              connect: {
                id: refreshTokenInDb.userId,
              },
            },
          },
        });
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);

    }
  }

}
