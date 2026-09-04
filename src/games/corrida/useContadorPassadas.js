import { useRef, useCallback } from 'react'

export function useContadorPassadas({ limiarEntrada, limiarSaida, cooldownMs, framesConfirmacao }) {
  const estado = useRef({
    pernaConfirmada: null,
    candidatoAtual: null,
    contagemCandidato: 0,
    ultimaPassadaMs: -9999,
    passadas: 0,
  })

  const reiniciar = useCallback(() => {
    estado.current = {
      pernaConfirmada: null,
      candidatoAtual: null,
      contagemCandidato: 0,
      ultimaPassadaMs: -9999,
      passadas: 0,
    }
  }, [])

  // retorna 'esquerda' | 'direita' se uma passada nova foi confirmada, ou null
  const atualizar = useCallback((joelhoEsqY, joelhoDirY, timestampMs) => {
    const e = estado.current
    const diferenca = joelhoEsqY - joelhoDirY

    const limiarAtual =
      e.pernaConfirmada !== null && e.pernaConfirmada !== 'nenhuma'
        ? limiarSaida
        : limiarEntrada

    let candidato
    if (diferenca < -limiarAtual) candidato = 'esquerda'
    else if (diferenca > limiarAtual) candidato = 'direita'
    else candidato = 'nenhuma'

    if (candidato === e.candidatoAtual) {
      e.contagemCandidato += 1
    } else {
      e.candidatoAtual = candidato
      e.contagemCandidato = 1
    }

    let passadaNova = null
    const estavel = e.contagemCandidato >= framesConfirmacao
    const mudou = e.candidatoAtual !== e.pernaConfirmada

    if (estavel && mudou) {
      if (e.pernaConfirmada !== null) {
        const passouCooldown = timestampMs - e.ultimaPassadaMs > cooldownMs
        if (e.candidatoAtual !== 'nenhuma' && passouCooldown) {
          e.passadas += 1
          e.ultimaPassadaMs = timestampMs
          passadaNova = e.candidatoAtual
        }
      }
      e.pernaConfirmada = e.candidatoAtual
    }

    return passadaNova
  }, [limiarEntrada, limiarSaida, cooldownMs, framesConfirmacao])

  return { atualizar, reiniciar, passadas: () => estado.current.passadas }
}