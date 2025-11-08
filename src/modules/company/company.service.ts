import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyAdminRole } from 'src/common/constants';
import bcrypt from 'bcrypt';
import { saltNoOfRounds } from 'src/common/constants';

@Injectable()
export class CompanyService {
  constructor(private prismaService: PrismaService) {}
  async create(
    createCompanyDto,
    // : CreateCompanyDto
  ) {
    const {
      company_admin_email,
      company_admin_password,
      company_admin_name,
      ...companyDetais
    } = createCompanyDto;

    const category = await this.prismaService.category.findUnique({
      where: { id: companyDetais.category_id },
    });
    if (!category) throw new BadRequestException('Invalid category id');
    
    const createdCompany = await this.prismaService.company.create({
      data: {
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

  findAll() {
    return `This action returns all company`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
