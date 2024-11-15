import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT || '1119', 10), 
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    enableArithAbort: true,
    requestTimeout: 300000,
    trustServerCertificate: false, // Use `true` for self-signed certificates or if required
  },
};

let pool: sql.ConnectionPool | null = null;

async function checkDbConnection() {
  if (pool) {
    return pool;
  }

  try {
    pool = await sql.connect(dbConfig);
    return pool;
  } catch (error) {
    throw error;
    process.exit(1);
  }
}

export {checkDbConnection};
export default sql;