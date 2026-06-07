import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  apiKey: "AIzaSyDQlrP7fX6staH67NOiql32-BJdQADkiCE",
  authDomain: "mundial-26-los-ropers.firebaseapp.com",
  projectId: "mundial-26-los-ropers",
  storageBucket: "mundial-26-los-ropers.firebasestorage.app",
  messagingSenderId: "648258874292",
  appId: "1:648258874292:web:b41e5f98b5cf2edf1020e1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PASSWORDS_TO_UPDATE = [
  { name: 'Lucía', oldPassword: 'lucía100', newPassword: 'lucia100' },
  { name: 'Darío', oldPassword: 'darío105', newPassword: 'dario105' }
];

async function fixAccents() {
  console.log('Actualizando contraseñas sin acentos...\n');

  for (const { name, oldPassword, newPassword } of PASSWORDS_TO_UPDATE) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await updateDoc(doc(db, 'participants', name), {
        passwordHash: hashedPassword
      });
      console.log(`✓ ${name}: ${oldPassword} → ${newPassword}`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  console.log('\n✅ Contraseñas actualizadas');
  process.exit(0);
}

fixAccents();
