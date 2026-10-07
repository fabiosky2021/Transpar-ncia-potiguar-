import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_PLATFORM_DATA } from '../data/platformData';

export async function migrateData() {
  console.log('Migrating data to Firestore...');
  
  // Migrate candidatos
  for (const cand of INITIAL_PLATFORM_DATA.candidatos) {
    await setDoc(doc(db, 'candidatos', cand.id), cand);
  }
  
  // Migrate enquete
  await setDoc(doc(db, 'enquete', 'resultado'), {
    totalVotos: INITIAL_PLATFORM_DATA.enqueteSegundoTurno.totalVotos,
    votosNatalia: INITIAL_PLATFORM_DATA.enqueteSegundoTurno.opcoes[0].votos,
    votosPaulinho: INITIAL_PLATFORM_DATA.enqueteSegundoTurno.opcoes[1].votos,
  });
  
  console.log('Migration complete.');
}
