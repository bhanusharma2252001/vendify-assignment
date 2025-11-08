
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prismaService: PrismaService) {

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'test',
        });
    }

    async validate(payload: any) {

        const { userId } = payload;
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found with id: ' + userId)
        return user;
    }
}
