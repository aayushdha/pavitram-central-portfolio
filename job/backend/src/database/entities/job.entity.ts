import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobStatus, JobType, WorkMode } from '../../common/enums/portal.enums';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Application } from './application.entity';
import { SavedJob } from './saved-job.entity';

@Entity('jobportal_jobs')
@Index(['city', 'state'])
@Index(['jobType', 'workMode', 'status'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /** The employer user who posted this job. */
  @Index()
  @Column({ name: 'employer_id' })
  employerId: string;

  @ManyToOne(() => User, (user) => user.jobsPosted)
  @JoinColumn({ name: 'employer_id' })
  employer: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string | null;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  benefits: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  skills: string[];

  @Column({ name: 'job_type', type: 'enum', enum: JobType })
  jobType: JobType;

  @Column({ name: 'work_mode', type: 'enum', enum: WorkMode })
  workMode: WorkMode;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ name: 'experience_min', type: 'int', nullable: true })
  experienceMin: number | null;

  @Column({ name: 'experience_max', type: 'int', nullable: true })
  experienceMax: number | null;

  @Column({ name: 'salary_min', type: 'numeric', precision: 14, scale: 2, nullable: true })
  salaryMin: string | null;

  @Column({ name: 'salary_max', type: 'numeric', precision: 14, scale: 2, nullable: true })
  salaryMax: string | null;

  @Column({ name: 'salary_negotiable', default: false })
  salaryNegotiable: boolean;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'int', default: 1 })
  openings: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'applicants_count', default: 0 })
  applicantsCount: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job)
  savedBy: SavedJob[];
}
