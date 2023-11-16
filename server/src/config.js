import { config } from "dotenv";

config();

export const PORT = process.env.PORT || 3001;
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 33306;
export const DB_USER = process.env.DB_USER || 'A01234354';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'A01234354';
export const DB_DATABASE = process.env.DB_DATABASE || 'washroom';