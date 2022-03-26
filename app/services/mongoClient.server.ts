import { MongoClient } from 'mongodb';
import invariant from 'tiny-invariant';

invariant(process.env.MONGODB_URL, 'missing MONGODB_URL');

export const client = new MongoClient(process.env.MONGODB_URL);
export const DB_NAME = process.env.MONGODB_DB ?? 'turborepo-remote-cache';
