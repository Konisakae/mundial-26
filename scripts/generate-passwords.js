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

const FIXED_PASSWORDS = {
  'Lucía': 'luc026',
  'Olivia': 'oli541',
  'Eva': 'eva831',
  'Pablo': 'pab801',
  'Lucas': 'luc778',
  'Darío': 'dar018',
  'Elena': 'ele777',
  'Javi': 'jav361',
  'Nic': 'nic573',
  'Jose': 'jos886',
  'Charo': 'cha494',
  'Abuelo': 'abu116'
};

const PARTICIPANTS = Object.keys(FIXED_PASSWORDS);

async function generatePasswords() {
  console.log('Configurando contraseñas fijas...\n');

  const passwords = [];

  for (const name of PARTICIPANTS) {
    const newPassword = FIXED_PASSWORDS[name];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await updateDoc(doc(db, 'participants', name), {
        passwordHash: hashedPassword
      });
      console.log(`✓ ${name}: ${newPassword}`);
      passwords.push({ name, password: newPassword });
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  console.log('\n✅ Contraseñas generadas y guardadas en Firestore\n');
  console.log('Resumen de contraseñas:');
  console.log('------------------------');
  passwords.forEach(p => {
    console.log(`${p.name.padEnd(12)}: ${p.password}`);
  });

  process.exit(0);
}

generatePasswords();
