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
  'Lucía', 'Olivia', 'Eva', 'Pablo', 'Lucas', 'Darío',
  'Elena', 'Javi', 'Nic', 'Jose', 'Charo', 'Abuelo'
];

// Función para generar 3 números aleatorios
function generateRandomNumbers() {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// Función para quitar acentos
function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

async function generatePasswords() {
  console.log('Generando nuevas contraseñas...\n');

  const passwords = [];

  for (const name of PARTICIPANTS) {
    // 3 primeras letras sin acentos
    const prefix = removeAccents(name).toLowerCase().substring(0, 3);
    // 3 números aleatorios
    const suffix = generateRandomNumbers();
    const newPassword = `${prefix}${suffix}`;

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
