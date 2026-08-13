import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const usePostgres = Boolean(process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost'));

const config = usePostgres ? {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tsf_db',
  },
  migrations: {
    directory: path.join(__dirname, 'server', 'db', 'migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'server', 'db', 'seeds'),
    extension: 'ts',
  },
} : {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'server', 'db', 'tsf_local.sqlite'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'server', 'db', 'migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'server', 'db', 'seeds'),
    extension: 'ts',
  },
};

export default config;
