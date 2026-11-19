import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PortalRole } from '../../common/enums/portal.enums';
import { Job } from './job.entity';
import { Application } from './application.entity';
import { SavedJob } from './saved-job.entity';
import { JobAlert } from './job-alert.entity';
import { Session } from './session.entity';

@Entity('jobportal_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The `user.id` returned by the Pavitram Central Auth API — the real source of truth for identity. */
  @Index({ unique: true })
  @Column({ name: 'central_user_id', unique: true })
  centralUserId: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  /** Role WITHIN this job portal module. */
  @Column({ type: 'enum', enum: PortalRole, default: PortalRole.SEEKER })
  role: PortalRole;

  /** Mirrors the central auth "role" field (USER / ADMIN / SUPER_ADMIN). */
  @Column({ name: 'central_role', default: 'USER' })
  centralRole: string;

  @Column({ name: 'account_status', default: 'ACTIVE' })
  accountStatus: string;

  @Column({ name: 'kyc_status', default: 'PENDING' })
  kycStatus: string;

  @Column({ name: 'is_onboarded', default: false })
  isOnboarded: boolean;

  /**
   * The central auth access_token from the most recent login — kept so this
   * backend can call central endpoints (e.g. PATCH /auth/profile) on the
   * user's behalf without the client ever having to handle that token.
   */
  @Column({ name: 'central_access_token', type: 'text', nullable: true })
  centralAccessToken: string | null;

  @Column({ name: 'central_access_token_issued_at', type: 'timestamptz', nullable: true })
  centralAccessTokenIssuedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  state: string | null;

  @Column({ type: 'varchar', nullable: true })
  profession: string | null;

  @Column({ type: 'varchar', nullable: true })
  designation: string | null;

  /** For a SEEKER, their current/most recent employer. For an EMPLOYER, their company name. */
  @Column({ type: 'varchar', nullable: true })
  organization: string | null;

  /** Short professional headline shown on the seeker's profile, e.g. "Senior Product Designer". */
  @Column({ type: 'varchar', nullable: true })
  headline: string | null;

  /** Comma-free list of skills, e.g. ["Figma", "React"]. */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  skills: string[];

  /** URL to an uploaded resume file (seeker). */
  @Column({ name: 'resume_url', type: 'varchar', nullable: true })
  resumeUrl: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.employer)
  jobsPosted: Job[];

  @OneToMany(() => Application, (application) => application.seeker)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.user)
  savedJobs: SavedJob[];

  @OneToMany(() => JobAlert, (alert) => alert.user)
  jobAlerts: JobAlert[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
