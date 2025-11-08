import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CompanyAdminRole } from '../../../src/common/constants';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    role: {
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // ✅ TEST: Invalid category ID
  // -------------------------------------------------------------------------
  it('should throw BadRequestException for invalid category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Adobe',
        category_id: 'not-exist',
        registered_at: new Date().toISOString(),
        registeration_no: 'ABC123',
        company_admin_name: 'Ram',
        company_admin_email: 'ram@example.com',
        company_admin_password: 'password',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // -------------------------------------------------------------------------
  //  Duplicate admin email
  // -------------------------------------------------------------------------
  it('should throw BadRequestException for duplicate email', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' }); // duplicate email found

    await expect(
      service.create({
        name: 'Adobe',
        category_id: 'cat1',
        registered_at: new Date().toISOString(),
        registeration_no: 'ABC123',
        company_admin_name: 'Ram',
        company_admin_email: 'ram@example.com',
        company_admin_password: 'password',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // -------------------------------------------------------------------------
  //  Successful company + admin creation
  // -------------------------------------------------------------------------
  it('should create company and admin successfully', async () => {
    // Mock category exists
    mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });

    // Mock no duplicate email
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // Mock company creation
    mockPrisma.company.create.mockResolvedValue({ id: 'comp1', name: 'Adobe' });

    // Mock role
    mockPrisma.role.findUniqueOrThrow.mockResolvedValue({ id: 'role1', name: CompanyAdminRole });

    // Mock hashed password
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');

    // Mock user (admin) creation
    mockPrisma.user.create.mockResolvedValue({
      id: 'admin1',
      name: 'Ram',
      email: 'ram@example.com',
    });

    const result = await service.create({
      name: 'Adobe',
      category_id: 'cat1',
      registered_at: new Date().toISOString(),
      registeration_no: 'ABC123',
      company_admin_name: 'Ram',
      company_admin_email: 'ram@example.com',
      company_admin_password: 'password',
    } as any);

    expect(result.success).toBe(true);
    expect(result.company).toEqual({ id: 'comp1', name: 'Adobe' });
    expect(result.admin.email).toBe('ram@example.com');
    expect(bcrypt.hash).toHaveBeenCalled();
  });
});
