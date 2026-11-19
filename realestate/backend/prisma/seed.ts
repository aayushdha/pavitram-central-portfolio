/**
 * Optional local-testing seed. This does NOT create login credentials (auth
 * lives on the central Pavitram Auth API) — it just drops in a couple of
 * RealUser shadow rows + sample listings so you can hit the read endpoints
 * immediately after `npm run prisma:migrate`.
 *
 * Run with: npm run prisma:seed
 */
import {
  PrismaClient,
  RealRole,
  PropertyType,
  ListingIntent,
  Possession,
  Furnishing,
  ModerationStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.realUser.upsert({
    where: { centralUserId: 'seed-central-owner-1' },
    create: {
      centralUserId: 'seed-central-owner-1',
      email: 'owner-demo@pavitramindia.com',
      name: 'Demo Owner',
      roles: [RealRole.OWNER, RealRole.SEEKER],
      ownerType: 'OWNER',
      city: 'Ahmedabad',
    },
    update: {},
  });

  const seeker = await prisma.realUser.upsert({
    where: { centralUserId: 'seed-central-seeker-1' },
    create: {
      centralUserId: 'seed-central-seeker-1',
      email: 'seeker-demo@pavitramindia.com',
      name: 'Demo Seeker',
      roles: [RealRole.SEEKER],
      city: 'Ahmedabad',
    },
    update: {},
  });

  await prisma.realProperty.upsert({
    where: { id: 'seed-property-1' },
    create: {
      id: 'seed-property-1',
      ownerId: owner.id,
      title: '3 BHK Apartment in Bodakdev',
      description: 'Spacious apartment with clubhouse access and covered parking.',
      type: PropertyType.APARTMENT,
      intent: ListingIntent.BUY,
      city: 'Ahmedabad',
      locality: 'Bodakdev',
      price: 9500000,
      bhk: '3 BHK',
      areaSqft: 1650,
      possession: Possession.READY_TO_MOVE,
      furnishing: Furnishing.SEMI_FURNISHED,
      status: ModerationStatus.APPROVED,
      verified: true,
      images: ['https://images.unsplash.com/photo-1567157577867-05ccb1388e66'],
    },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', { ownerId: owner.id, seekerId: seeker.id });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
