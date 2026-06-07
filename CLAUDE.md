# Mundial 2026 - v2 - Protocolo del Proyecto

## Principios

Este es un nuevo proyecto hecho correctamente desde cero:
- ✅ Git desde el inicio
- ✅ Código limpio, sin inline styles
- ✅ CSS Modules para estilos
- ✅ Estructura clara de carpetas
- ✅ Un cambio, un commit

## Stack

- Frontend: React + Vite
- Estilos: CSS Modules (NO inline styles)
- Almacenamiento local: localStorage (instantáneo)
- Base de datos: Firebase Firestore (cloud)
- Autenticación: Nombre + contraseña (validada en Firestore)
- Deploy: Vercel (production)

## Estructura

```
src/
├── components/      ← Componentes React
├── data/           ← teams.js, matches.js, colors.js
├── styles/         ← Archivos .module.css
├── utils/          ← scoring.js, storage.js
├── App.jsx         ← Componente raíz
└── main.jsx        ← Entry point
```

## Reglas de trabajo

1. **Estilos**: SIEMPRE usar CSS Modules (archivo.module.css)
2. **Un cambio = Un commit**: No acumules cambios
3. **Componentes**: Solo lógica y presentación, nada de datos hardcodeados
4. **Git**: Commits claros con descripción de qué cambió y por qué
5. **Verificación**: Prueba en navegador ANTES de hacer commit
6. **Idioma**: SIEMPRE comunicar en castellano

## Fases del proyecto

1. ✅ **Fase 1 - Diseño**: Interfaz visual completa
2. ✅ **Fase 2 - Funcionamiento**: Lógica, cálculos, interactividad
3. ✅ **Fase 3 - Autenticación local**: 13 usuarios con contraseñas
4. ✅ **Fase 4 - Firebase**: Base de datos en la nube
5. ✅ **Fase 5 - Vercel**: En producción (mundial-26-one.vercel.app)
6. ⏳ **Fase 6 - Seguridad**: Firestore Rules por dominio (ver SECURITY.md)

## Datos del proyecto

- **Participantes**: 13 personas (Laura, Lucía, Olivia, Eva, Pablo, Lucas, Darío, Elena, Javi, Nic, Jose M., Charo, Abuelo)
- **Partidos**: 104 (72 fases de grupos + 32 eliminatoria)
- **Grupos**: 12 grupos (A-L), 4 equipos cada uno
- **Puntuación**: 5 pts marcador exacto, 2 pts resultado (1/X/2), 1 pt un gol correcto, +2 ganador eliminatoria

## Colores de referencia (del proyecto actual)

- Fondo principal: #354a65
- Fondo oscuro: #253545
- Fondo muy oscuro: #1f2f45
- Cyan/Cian: #00d9ff
- Magenta: #ff006e
- Gold/Oro: #ffc600

Nota: Los colores pueden cambiar en Fase 1
