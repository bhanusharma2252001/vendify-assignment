import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  //   Service should be defined
  // -------------------------------------------------------
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // -------------------------------------------------------
  // validateUser → Invalid email (user not found)
  // -------------------------------------------------------
  it('should throw BadRequestException if email is invalid', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.validateUser({ email: 'x@gmail.com', password: '123456' })
    ).rejects.toThrow(BadRequestException);
  });

  // -------------------------------------------------------
  //  validateUser → Invalid password
  // -------------------------------------------------------
  it('should return null if password does not match', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@gmail.com',
      password_hash: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    const result = await authService.validateUser({
      email: 'test@gmail.com',
      password: 'wrongpass',
    });

    expect(result).toBeNull();
  });

  // -------------------------------------------------------
  // ✅ 4. validateUser → Success
  // -------------------------------------------------------
  it('should return user if credentials are valid', async () => {
    const mockUser = {
      id: '1',
      email: 'test@gmail.com',
      password_hash: 'hashed',
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const result = await authService.validateUser({
      email: 'test@gmail.com',
      password: 'Demo@1234',
    });

    expect(result).toEqual(mockUser);
  });

  // -------------------------------------------------------
  // ✅ 5. login → Should return JWT + user
  // -------------------------------------------------------
  it('should return access token and user details', async () => {
    const mockUser = { id: '1', company_id: '2', role_id: '3' };

    const result = await authService.login(mockUser as any);

    expect(jwtService.sign).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      user: mockUser,
      access_token: 'mocked_jwt_token',
    });
  });
});
