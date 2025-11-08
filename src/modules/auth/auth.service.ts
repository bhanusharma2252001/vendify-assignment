import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';




@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) { }

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const { email, password } = loginDto;
    const foundUser = await this.prismaService.user.findUnique({ where: { email } });
    if (!foundUser) throw new BadRequestException("Invalid email");

    const passwordMatched = await bcrypt.compare(password, foundUser.password_hash);
    if (!passwordMatched) null;
    return foundUser;

  }

  async login(user: User) {
    const payload = { userId: user.id, companyId: user.company_id, roleId: user.role_id };
    return {
      success: true,
      user: user,
      access_token: this.jwtService.sign(payload)
    };
  }

}
