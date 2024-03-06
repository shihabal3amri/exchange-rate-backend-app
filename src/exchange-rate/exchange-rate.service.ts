import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConversionRate, Currency, UserConversion } from '@prisma/client';
import { map } from 'rxjs/operators';
import { PrismaService } from 'src/prisma/prisma.service';
import { lastValueFrom } from 'rxjs';
import { CreateUserConversionRateDto } from './dto/create-user-conversion-rate.dto';
import { Pagination } from 'src/common/pagination';

@Injectable()
export class ExchangeRateService {

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) { }
  async saveOmrConversionRates(currency: Currency) {
    const response = await this.httpService.get(`${process.env.EXCHANGE_RATE_BASE_URL}/latest/${currency}`).pipe(
      map(response => response.data)
    )

    const data = await lastValueFrom(response);
    const conversionRates = data.conversion_rates;

    // Prepare an array of data to be inserted
    const dataToInsert = Object.entries(conversionRates).map(([toCurrencyCode, rate]) => ({
      fromCurrency: currency,
      toCurrency: toCurrencyCode as Currency,
      rate: rate,
    }));

    // Perform batch insert
    try {
      await this.prismaService.conversionRate.createMany({
        data: dataToInsert.map(item => ({
          ...item,
          rate: Number(item.rate)
        })),
      });
      console.log('Conversion rates stored successfully.');
    } catch (error) {
      console.error('Error storing conversion rates:', error);
    }

  }

  async getOmrSavedConversionRates(pagination: Pagination): Promise<ConversionRate[]> {
    try {
      const conversionRates = await this.prismaService.conversionRate.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        ...pagination,

      });
      return conversionRates;
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
    }
  }

  async createUserConversionRate(input: CreateUserConversionRateDto, userId: string) {
    const response = this.httpService.get(`${process.env.EXCHANGE_RATE_BASE_URL}/pair/${input.fromCurrency}/${input.toCurrency}/${input.amount}`).pipe(
      map(response => response.data)
    );

    const data = await lastValueFrom(response);

    try {
      const userConversion = await this.prismaService.userConversion.create({
        data: {
          amount: input.amount,
          rate: data.conversion_rate,
          fromCurrency: input.fromCurrency as Currency,
          toCurrency: input.toCurrency as Currency,
          user: {
            connect: {
              id: userId
            }
          }
        }
      }) as UserConversion;
      console.log('User conversion rate stored successfully.');
      return userConversion;

    } catch (error) {
      console.error('Error storing user conversion rate:', error);
    }
  }

  async getUserConversionRates(userId: string, pagination: Pagination): Promise<UserConversion[]> {
    try {
      const userConversionRates = await this.prismaService.userConversion.findMany({
        where: {
          userId
        },
        orderBy: {
          timestamp: 'desc',
        },
        ...pagination,
      });
      return userConversionRates;
    } catch (error) {
      console.error('Error fetching user conversion rates:', error);
    }
  }
}
