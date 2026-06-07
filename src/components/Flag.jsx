// Mapeo de códigos de equipos a códigos de flag-icons
const FLAG_MAP = {
  MEX: 'mx', SAF: 'za', COR: 'kr', RCH: 'cz',
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch',
  USA: 'us', PAR: 'py', BRA: 'br', MAR: 'ma',
  HAI: 'ht', ESC: 'gb-sct', AUS: 'au', TUR: 'tr',
  GER: 'de', CUR: 'cw', NDL: 'nl', JAP: 'jp',
  CdM: 'ci', ECU: 'ec', SUE: 'se', TUN: 'tn',
  ESP: 'es', CVE: 'cv', BEL: 'be', EGI: 'eg',
  KSA: 'sa', URU: 'uy', IRN: 'ir', NZE: 'nz',
  FRA: 'fr', SEN: 'sn', IRK: 'iq', NOR: 'no',
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  POR: 'pt', RDC: 'cd', ING: 'gb-eng', CRO: 'hr',
  GHA: 'gh', PAN: 'pa', UZB: 'uz', COL: 'co',
}

export default function Flag({ teamCode, size = '1em' }) {
  const flagCode = FLAG_MAP[teamCode]

  if (!flagCode) {
    return <span>{teamCode}</span>
  }

  return (
    <span
      className={`fi fi-${flagCode}`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        fontSize: size,
        lineHeight: size,
      }}
    />
  )
}
