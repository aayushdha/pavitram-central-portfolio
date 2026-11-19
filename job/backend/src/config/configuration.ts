export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    // Postgres schema this service's tables live in — keeps it fully
    // isolated from any other project sharing the same Postgres server.
    // The schema must be created once manually (see RUNBOOK.md); TypeORM
    // will not create the schema itself.
    schema: process.env.DB_SCHEMA || 'public',
    // Auto-create/update tables from the entities. Safe to leave true even
    // in production for THIS project since it owns its schema exclusively —
    // set DB_SYNCHRONIZE=false once you introduce real migrations.
    synchronize: process.env.DB_SYNCHRONIZE
      ? process.env.DB_SYNCHRONIZE === 'true'
      : process.env.NODE_ENV !== 'production',
  },
  centralAuth: {
    baseUrl: process.env.CENTRAL_AUTH_BASE_URL || 'https://mainbackend.pavitramindia.com/api/v1',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
});
