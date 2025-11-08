import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { saltNoOfRounds } from 'src/common/constants';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(user: User, createUserDto : CreateUserDto
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
      is_deleted: false
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



  async getRoles() {
    return await this.prismaService.role.findMany();
  }

  async remove(user: User, id: string) {
    const foundUser = await this.prismaService.user.findUnique({ where: { id } });
    if (!foundUser) throw new BadRequestException('Invalid user id');
    if (foundUser.company_id !== user.company_id) throw new ForbiddenException('This user does not belong to this company')

    const deletedUser = await this.prismaService.user.update({ where: { id: id }, data: { is_deleted: true } });
    return deletedUser;
  }
}
