import { useRef, useCallback } from 'react'

const SCORE_MINIMO = 0.6 // ignora classificações com pouca confiança

export function useDeteccaoMao(aoBaterAsa) {
  const gestoConfirmado = useRef(null) // 'Open_Palm' | 'Closed_Fist' | null

  const processarGesto = useCallback((categoryName, score) => {
    if (score < SCORE_MINIMO) return // ignora leituras de baixa confiança

    const gestoAtual = categoryName === 'Closed_Fist' ? 'fechada' :
                        categoryName === 'Open_Palm' ? 'aberta' : null

    if (gestoAtual === null) return // ignora "None" e afins

    // detecta a transição aberta -> fechada = 1 bater de asa
    if (gestoConfirmado.current === 'aberta' && gestoAtual === 'fechada') {
      aoBaterAsa()
    }

    gestoConfirmado.current = gestoAtual
  }, [aoBaterAsa])

  return { processarGesto }
}