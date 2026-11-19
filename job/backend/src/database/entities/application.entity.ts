import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../../common/enums/portal.enums';
import { Job } from './job.entity';
import { User } from './user.entity';

@Entity('jobportal_applications')
@Unique(['jobId', 'seekerId'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Index()
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'resume_url', type: 'varchar', nullable: true })
  resumeUrl: string | null;

  @Column({ name: 'cover_note', type: 'text', nullable: true })
  coverNote: string | null;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status: ApplicationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
