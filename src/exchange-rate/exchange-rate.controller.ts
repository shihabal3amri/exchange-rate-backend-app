import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { CreateUserConversionRateDto } from './dto/create-user-conversion-rate.dto';
import { Currency, UserConversion, ConversionRate } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtAuthGuard } from 'src/authentication/jwt-auth-guard';
import { GetUser } from 'src/authentication/get-user.decorator';
import { Pagination } from 'src/common/pagination';

@UseGuards(JwtAuthGuard)
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}
  
  @OnEvent('save.omr.conversion.rates')
  async handleSaveOmrConversionRates() {
    return await this.exchangeRateService.saveOmrConversionRates(Currency.OMR);
  }
  
  @Post('create-user-conversion-rate')
  createUserConversionRate(@GetUser() userId: string, @Body() createUserConversionRateDto: CreateUserConversionRateDto): Promise<UserConversion> {
    return this.exchangeRateService.createUserConversionRate(createUserConversionRateDto, userId);
  }

  @Get('get-user-conversion-rates')
  getUserConversionRates(@GetUser() userId: string, @Body() pagination: Pagination): Promise<UserConversion[]> {
    return this.exchangeRateService.getUserConversionRates(userId, pagination);
  }

  @Get('get-omr-saved-conversion-rates')
  getOmrSavedConversionRates(@Body() pagination: Pagination): Promise<ConversionRate[]> {
    return this.exchangeRateService.getOmrSavedConversionRates(pagination);
  }
}
