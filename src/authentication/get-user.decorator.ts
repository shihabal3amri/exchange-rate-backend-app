import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const jwtService = new JwtService({ secret: process.env.ACCESS_TOKEN_SECRET});
  if (!request.headers.authorization) return null;

  const token = request.headers.authorization.split(' ')[1];
  const decodedToken = jwtService.decode(token);

  return decodedToken ? decodedToken.sub : null;
});