import { migrateData } from './migrateData';
migrateData().then(() => {
  console.log('Migration finished');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
