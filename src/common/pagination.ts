import { IsNumber, IsPositive, Max, Min } from "class-validator";
export class Pagination {
    @IsNumber()
    @Min(1)
    @Max(200)
    take: number = 50;
    
    @IsNumber()
    @Min(0)
    skip: number = 0;
}