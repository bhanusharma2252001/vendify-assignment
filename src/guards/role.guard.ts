import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { log } from 'console';
import { CompanyAdminRole } from 'src/common/constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const foundCompanyAdminRole = await this.prismaService.role.findFirst({
      where: { name: CompanyAdminRole },
    });
    return user.role_id === foundCompanyAdminRole?.id;
  }
}
