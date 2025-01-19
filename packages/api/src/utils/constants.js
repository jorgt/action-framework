import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PRODUCTION = NODE_ENV === 'production';
export const PORT = process.env.PORT || 3003;
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_DATABASE = process.env.DB_DATABASE || 'postgres';
export const QUEUE_INTERVAL = process.env.QUEUE_INTERVAL || 1000;
export const MAX_WORKERS = process.env.MAX_WORKERS || 4;
