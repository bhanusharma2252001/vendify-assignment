import { IsString, IsNotEmpty, IsUUID, IsEmail, MinLength, IsDateString } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    category_id: string;

    @IsDateString()
    registered_at: string;

    @IsString()
    @IsNotEmpty()
    registeration_no: string;

    @IsString()
    @IsNotEmpty()
    company_admin_name: string;

    @IsEmail()
    company_admin_email: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    company_admin_password: string;
}
