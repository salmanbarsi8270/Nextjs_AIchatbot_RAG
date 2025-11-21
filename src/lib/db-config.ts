import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {config} from 'dotenv';

config({path: '.env.local'});
const client = neon(process.env.NEON_DATABASE_URL!);
export const db = drizzle(client);

export default db;