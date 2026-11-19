import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Job } from './entities/job.entity';
import { Application } from './entities/application.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobAlert } from './entities/job-alert.entity';
import { Session } from './entities/session.entity';
import {
  PortalRole,
  JobType,
  WorkMode,
  JobStatus,
  ApplicationStatus,
} from '../common/enums/portal.enums';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Session, Company, Job, Application, SavedJob, JobAlert],
  synchronize: true,
});

async function main() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const companyRepo = dataSource.getRepository(Company);
  const jobRepo = dataSource.getRepository(Job);
  const applicationRepo = dataSource.getRepository(Application);
  const savedJobRepo = dataSource.getRepository(SavedJob);

  let employer = await userRepo.findOne({ where: { email: 'employer@example.com' } });
  if (!employer) {
    employer = await userRepo.save(
      userRepo.create({
        centralUserId: 'seed-central-employer-1',
        email: 'employer@example.com',
        phone: '9998887771',
        name: 'Rhea Sen',
        role: PortalRole.EMPLOYER,
        centralRole: 'USER',
        isOnboarded: true,
        city: 'Bengaluru',
        state: 'Karnataka',
      }),
    );
  }

  let seeker = await userRepo.findOne({ where: { email: 'seeker@example.com' } });
  if (!seeker) {
    seeker = await userRepo.save(
      userRepo.create({
        centralUserId: 'seed-central-seeker-1',
        email: 'seeker@example.com',
        phone: '9998887772',
        name: 'Ananya Kulkarni',
        role: PortalRole.SEEKER,
        centralRole: 'USER',
        isOnboarded: true,
        city: 'Bengaluru',
        state: 'Karnataka',
        headline: 'Senior Product Designer',
        skills: ['Figma', 'Design Systems', 'User Research'],
      }),
    );
  }

  let company = await companyRepo.findOne({ where: { name: 'Anthropi Finserve' } });
  if (!company) {
    company = await companyRepo.save(
      companyRepo.create({
        ownerId: employer.id,
        name: 'Anthropi Finserve',
        industry: 'Financial Services',
        companySize: '500-1000 employees',
        about: 'Building lending and payments infrastructure for India\u2019s small businesses.',
        city: 'Bengaluru',
        state: 'Karnataka',
        verified: true,
      }),
    );
  }

  let job = await jobRepo.findOne({ where: { title: 'Senior Product Designer', companyId: company.id } });
  if (!job) {
    job = await jobRepo.save(
      jobRepo.create({
        companyId: company.id,
        employerId: employer.id,
        title: 'Senior Product Designer',
        description: 'Own end-to-end design for our lending and payments products.',
        responsibilities: 'Lead design for 1-2 product areas. Maintain the design system.',
        requirements: '5+ years product design experience. Strong Figma skills.',
        benefits: ['Health insurance', 'Annual learning budget', 'ESOPs'],
        skills: ['Figma', 'Design Systems', 'B2B SaaS'],
        jobType: JobType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        status: JobStatus.PUBLISHED,
        experienceMin: 5,
        experienceMax: 8,
        salaryMin: '2800000',
        salaryMax: '3800000',
        city: 'Bengaluru',
        state: 'Karnataka',
        openings: 2,
        publishedAt: new Date(),
      }),
    );
  }

  const existingApplication = await applicationRepo.findOne({
    where: { jobId: job.id, seekerId: seeker.id },
  });
  if (!existingApplication) {
    await applicationRepo.save(
      applicationRepo.create({
        jobId: job.id,
        seekerId: seeker.id,
        coverNote: "I'd love to bring my fintech design background to this role.",
        status: ApplicationStatus.APPLIED,
      }),
    );
  }

  const existingSave = await savedJobRepo.findOne({ where: { userId: seeker.id, jobId: job.id } });
  if (!existingSave) {
    await savedJobRepo.save(savedJobRepo.create({ userId: seeker.id, jobId: job.id }));
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:', { employerId: employer.id, seekerId: seeker.id, companyId: company.id, jobId: job.id });
  await dataSource.destroy();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
