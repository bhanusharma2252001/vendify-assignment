import { PrismaClient } from '@prisma/client';
import { CompanyAdminRole } from '../../src/common/constants';

const prisma = new PrismaClient();
async function main() {
  const createdCategories = await prisma.category.createMany({
    data: [
      { name: 'Telecom' },
      { name: 'Banking' },
      { name: 'IT' },
      { name: 'Real Estate' },
    ],
  });

  const defaultRoles = await prisma.role.createMany({
    data: [
      {
        name: CompanyAdminRole,
      },
      {
        name: 'StoreManager',
      },
      {
        name: 'FloorManager',
      },
    ],
  });
  console.log('Created Categories: ', createdCategories);
  console.log('Default Created Roles: ', defaultRoles);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
