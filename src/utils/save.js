const CHAVE_ULTIMO_JOGO = 'movimente-ultimo-jogo'

const CHAVES_RECORDE = {
  corrida: 'movimente-corrida-recorde',
  flapHand: 'movimente-flaphand-recorde',
}

// chama isso sempre que um jogo TERMINA (não precisa ter batido recorde)
export function registrarUltimoJogo(jogoId) {
  localStorage.setItem(
    CHAVE_ULTIMO_JOGO,
    JSON.stringify({ jogo: jogoId, data: new Date().toISOString() })
  )
}

export function obterUltimoJogo() {
  const bruto = localStorage.getItem(CHAVE_ULTIMO_JOGO)
  if (!bruto) return null
  try {
    return JSON.parse(bruto)
  } catch {
    return null
  }
}

export function obterRecorde(jogoId) {
  const chave = CHAVES_RECORDE[jogoId]
  const valor = chave ? localStorage.getItem(chave) : null
  return valor !== null ? Number(valor) : null
}