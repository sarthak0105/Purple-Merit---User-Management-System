import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

export const env = {
  PORT:           parseInt(process.env.PORT || '3001', 10),
  NODE_ENV:       process.env.NODE_ENV || 'development',
  MONGO_URI:      required('MONGO_URI'),
  JWT_SECRET:     required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL:     process.env.CLIENT_URL || 'http://localhost:3000',
  isDev():        boolean { return this.NODE_ENV === 'development'; },
  isProd():       boolean { return this.NODE_ENV === 'production'; },
};
