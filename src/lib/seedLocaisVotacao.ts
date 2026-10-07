import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function seedLocaisVotacao() {
  const locais = [
    { local: 'Escola Municipal Alfredo Pegado', secoes: '84, 85, 86' },
    { local: 'Escola Estadual Atheneu Norte-Riograndense', secoes: '10, 11, 12, 13' },
    { local: 'Instituto Federal do RN (IFRN) - Campus Natal Central', secoes: '50, 51, 52' }
  ];

  try {
    const colRef = collection(db, 'locaisVotacao');
    for (const item of locais) {
      await addDoc(colRef, item);
    }
    console.log('Locais de votação semeados.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'locaisVotacao');
  }
}
seedLocaisVotacao();
