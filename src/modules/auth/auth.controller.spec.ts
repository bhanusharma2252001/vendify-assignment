import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ------------------------------------------------------------------
  // ✅ Test: Login should return token + user
  // ------------------------------------------------------------------
  it('should return login result from AuthService', async () => {
    const req = {
      user: { id: '123', email: 'test@gmail.com' },
    };

    const mockResponse = {
      success: true,
      user: req.user,
      access_token: 'mocked_token',
    };

    mockAuthService.login.mockResolvedValue(mockResponse);

    const result = await controller.login(req);

    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(result).toEqual(mockResponse);
  });
});
