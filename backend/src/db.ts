import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "./config.js";

const client = postgres(config.DATABASE_URL, { max: 5, prepare: false, ssl: "require" });
export const db = drizzle(client);
export const checkDatabase = async () => client`select 1`;
