import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulerService implements OnModuleInit {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async onModuleInit() {
        await this.initializeScheduledJobs();
    }
    private async initializeScheduledJobs() {
        const jobs = await this.prismaService.schedule.findMany();
        jobs.forEach(job => {
            const callback = (): void => {
                this.eventEmitter.emit(job.name);
            };
            const jobName = job.name;
      
            const cronJob = new CronJob(job.cronExpression, callback, null, true);
            this.schedulerRegistry.addCronJob(jobName, cronJob);
      
            console.log(`Scheduled job ${jobName} with cron: ${job.cronExpression}`);
        });
    }

}
