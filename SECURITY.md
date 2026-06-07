# Seguridad - Mundial 2026

## Estado Actual: v0.76

### Firestore Security Rules

**Configurar en Firebase Console → Firestore → Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if 
        // Permitir desde Vercel (producción)
        (request.headers['origin'] == 'https://mundial-26-los-ropers.vercel.app' ||
         request.headers['referer'].startsWith('https://mundial-26-los-ropers.vercel.app')) ||
        // Permitir desde localhost (desarrollo local)
        (request.headers['origin'] == 'http://localhost:5173' ||
         request.headers['referer'].startsWith('http://localhost:5173')) ||
        // Permitir usuarios autenticados
        request.auth != null;
    }
  }
}
```

### Autenticación Actual

**Participantes:**
- Login: nombre + contraseña
- Validación: contra colección `participants` en Firestore
- Hash: bcryptjs (10 rounds)
- Sesión: localStorage

**Admin:**
- Login: PIN (definido en `config/participants.js`)
- Sin hash (PIN corto)
- Sesión: localStorage

### Qué está protegido

✅ Lectura/escritura solo desde dominio autorizado
✅ Participantes validados con contraseña
✅ Admin protegido con PIN
✅ Predicciones se guardan en batch (reduce exposición)
✅ Actuals (resultados) guardados por admin solo

### Qué NO está protegido (aceptable)

⚠️ Datos de participantes visibles (nombres públicos)
⚠️ Resultados visibles (partidos públicos)
⚠️ Sin cifrado en tránsito (HTTPS lo cubre)

### Próximos pasos (opcional)

- [ ] Firebase Authentication nativa (más seguro, más trabajo)
- [ ] HTTPS certificates (Vercel lo incluye)
- [ ] Rate limiting en Firestore
- [ ] Audit logging

### Para desplegar

1. En Firebase Console, reemplazar Rules con las anteriores
2. Publicar reglas
3. Confirmar que app funciona en localhost y Vercel
