import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Adjust the import path as necessary

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
