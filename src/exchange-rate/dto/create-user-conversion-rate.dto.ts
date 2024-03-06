import { Currency } from '@prisma/client';
import { IsString, IsNumber, IsPositive, IsEnum } from 'class-validator';

export class CreateUserConversionRateDto {
    @IsEnum(Currency)
    fromCurrency: Currency;

    @IsEnum(Currency)
    toCurrency: Currency;

    @IsNumber()
    @IsPositive()
    amount: number;
}
