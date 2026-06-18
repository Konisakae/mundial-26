// Paleta Mezcla: Cyberpunk + Valorant
const PURPLE = '#7b2cbf'
const GOLD = '#ffc600'
const CYAN = '#00bcd4'
const PALETTE = [PURPLE, GOLD, CYAN]

// Color por grupo (Paleta oscura sofisticada + neón hover)
export const GROUP_COLORS = {
  A:{a:'#5B0E2D',b:'#5B0E2D',t:'#ffffff',glow:'#FF0055'},
  B:{a:'#7A1A00',b:'#7A1A00',t:'#ffffff',glow:'#FF3300'},
  C:{a:'#664600',b:'#664600',t:'#ffffff',glow:'#FF7700'},
  D:{a:'#1A4314',b:'#1A4314',t:'#ffffff',glow:'#39FF14'},
  E:{a:'#004D40',b:'#004D40',t:'#ffffff',glow:'#00FFCC'},
  F:{a:'#004B6E',b:'#004B6E',t:'#ffffff',glow:'#00BFFF'},
  G:{a:'#0B2545',b:'#0B2545',t:'#ffffff',glow:'#00FFFF'},
  H:{a:'#1F1A3A',b:'#1F1A3A',t:'#ffffff',glow:'#7B2CBF'},
  I:{a:'#3D0C5A',b:'#3D0C5A',t:'#ffffff',glow:'#BD00FF'},
  J:{a:'#540054',b:'#540054',t:'#ffffff',glow:'#FF00FF'},
  K:{a:'#5C0038',b:'#5C0038',t:'#ffffff',glow:'#FF00AA'},
  L:{a:'#252525',b:'#252525',t:'#ffffff',glow:'#CCCCCC'},
}

// Color por fase (3 colores)
export const PHASE_COLORS = {
  G:   {a:PALETTE[0],b:PALETTE[0],t:'#ffffff',glow:PALETTE[0]},
  R16: {a:PALETTE[1],b:PALETTE[1],t:'#ffffff',glow:PALETTE[1]},
  OCT: {a:PALETTE[2],b:PALETTE[2],t:'#ffffff',glow:PALETTE[2]},
  CTO: {a:PALETTE[0],b:PALETTE[0],t:'#ffffff',glow:PALETTE[0]},
  SEMI:{a:PALETTE[1],b:PALETTE[1],t:'#ffffff',glow:PALETTE[1]},
  '3P':{a:PALETTE[2],b:PALETTE[2],t:'#ffffff',glow:PALETTE[2]},
  FIN: {a:PALETTE[0],b:PALETTE[0],t:'#ffffff',glow:PALETTE[0]},
}

// Colores de avatar por índice de participante (máxima distinción)
export const AVATAR_COLORS = [
  {b:'#00FF00',t:'#000'},{b:'#AA33FF',t:'#fff'},
  {b:'#0066FF',t:'#fff'},{b:'#FFFF00',t:'#000'},
  {b:'#f092f2',t:'#000'},{b:'#93ffff',t:'#000'},
  {b:'#ffc66a',t:'#000'},{b:'#FF0000',t:'#fff'},
  {b:'#ff3eb2',t:'#fff'},{b:'#009d77',t:'#fff'},
  {b:'#ff6600',t:'#fff'},{b:'#1aa4ff',t:'#fff'},
  {b:'#FFAA00',t:'#000'},
]

export const PHASES = [
  {id:'G',   icon:'⚽', label:'Grupos'},
  {id:'R16', icon:'🔘', label:'1/16'},
  {id:'OCT', icon:'🔔', label:'Octavos'},
  {id:'CTO', icon:'💫', label:'Cuartos'},
  {id:'SEMI',icon:'⚡', label:'Semis'},
  {id:'3P',  icon:'🥉', label:'3.er P.'},
  {id:'FIN', icon:'🏆', label:'Final'},
]
