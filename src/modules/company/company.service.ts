import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyAdminRole } from '../../../src/common/constants';
import bcrypt from 'bcrypt';
import { saltNoOfRounds } from '../../../src/common/constants';

@Injectable()
export class CompanyService {
  constructor(private prismaService: PrismaService) { }
  async create(
    createCompanyDto
      : CreateCompanyDto
  ) {
    const {
      company_admin_email,
      company_admin_password,
      company_admin_name,
      ...companyDetais
    } = createCompanyDto;

    const category = await this.prismaService.category.findFirst({
      where: { },
    });
    if (!category) throw new InternalServerErrorException('Master Data has not been seed yet');

    const duplicateEmail = await this.prismaService.user.findUnique({ where: { email: company_admin_email } });
    if (duplicateEmail) throw new BadRequestException('Duplicate email')

    const createdCompany = await this.prismaService.company.create({
      data: {
        category_id: category.id,
        ...companyDetais,
      },
    });

    const companyAdminRole = await this.prismaService.role.findUniqueOrThrow({
      where: { name: CompanyAdminRole },
    });
    if (!companyAdminRole)
      throw new InternalServerErrorException('Role not created by admin');

    const hashedPassword = await bcrypt.hash(
      company_admin_password,
      saltNoOfRounds,
    );
    const createdCompanyAdmin = await this.prismaService.user.create({
      data: {
        name: company_admin_name,
        email: company_admin_email,
        password_hash: hashedPassword,
        company_id: createdCompany.id,
        role_id: companyAdminRole?.id,
      },
    });
    return {
      success: true,
      company: createdCompany,
      admin: createdCompanyAdmin,
    };
  }


}
