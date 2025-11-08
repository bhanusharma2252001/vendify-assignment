import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'test',
      signOptions: { expiresIn: '2d' },
    })],

  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule { }
