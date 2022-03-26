export function getClient() {
  return typeof window === 'undefined' && process.env.MONGODB_URL ? import('mongodb').then(({ MongoClient }) => new MongoClient(process.env.MONGODB_URL!)) : null;
}

export function getDbName() {
  return process.env.MONGODB_DB ?? 'turborepo-remote-cache';
}
