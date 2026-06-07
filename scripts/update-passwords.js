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

const PARTICIPANTS = [
  'Laura', 'Lucía', 'Olivia', 'Eva', 'Pablo', 'Lucas', 'Darío',
  'Elena', 'Javi', 'Nic', 'Jose M.', 'Charo', 'Abuelo'
];

async function updatePasswords() {
  console.log('Actualizando contraseñas...\n');

  for (let i = 0; i < PARTICIPANTS.length; i++) {
    const name = PARTICIPANTS[i];
    const newPassword = `${name.toLowerCase().replace(/\s+/g, '')}${100 + i}`;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await updateDoc(doc(db, 'participants', name), {
        passwordHash: hashedPassword
      });
      console.log(`✓ ${name}: ${newPassword}`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  console.log('\n✅ Contraseñas actualizadas');
  process.exit(0);
}

updatePasswords();
