import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SchedulerService } from './scheduler/scheduler.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    PrismaModule,
    ExchangeRateModule,
    HttpModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthenticationModule,
  ],
  controllers: [AppController],
  exports: [PrismaService],
  providers: [AppService, PrismaService, SchedulerService],
})
export class AppModule { }
