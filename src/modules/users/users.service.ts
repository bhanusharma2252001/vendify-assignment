import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { saltNoOfRounds } from 'src/common/constants';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(user: User, createUserDto
    // : CreateUserDto
  ) {
    const role = await this.prismaService.role.findUnique({ where: { id: createUserDto.role_id } });
    if (!role) throw new BadRequestException('Invalid role id');

    const duplicateEmail = await this.prismaService.user.findUnique({ where: { email: createUserDto.email } });
    if (duplicateEmail) throw new BadRequestException('Duplicate email')

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltNoOfRounds,
    );
    const { password, ...otherDetails } = createUserDto;

    const createdUser = await this.prismaService.user.create({
      data: {
        ...otherDetails,
        password_hash: hashedPassword,
        company_id: user.company_id,
        created_by_id: user.id
      }
    })
    return {
      user: createdUser
    }
  }

  async findAll(user: User, page: number = 1, pageSize: number = 10) {
    page = Number(page);
    pageSize = Number(pageSize)
    const skip = (page - 1) * pageSize;

    const whereQuery = {
      company_id: user.company_id,
    };

    const total = await this.prismaService.user.count({ where: whereQuery });

    const users = await this.prismaService.user.findMany({
      where: whereQuery,
      skip,
      take: Number(pageSize),
    });

    return {
      page: page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: users,
    };
  }



  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
