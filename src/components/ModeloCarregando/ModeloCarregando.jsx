import { useEffect, useRef } from 'react'
import { gsap } from '../../utils/gsapSetup.js'
import './ModeloCarregando.css'

function ModeloCarregando({ texto = 'Carregando modelo de detecção...' }) {
  const pontosRef = useRef(null)

  useEffect(() => {
    const pontos = pontosRef.current.querySelectorAll('.ponto-loading')
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(pontos, {
      y: -10,
      opacity: 1,
      duration: 0.4,
      stagger: { each: 0.15, repeat: 1, yoyo: true },
      ease: 'power2.inOut',
    })
    return () => tl.kill()
  }, [])

  return (
    <div className="modelo-carregando">
      <div ref={pontosRef} className="pontos-loading">
        <span className="ponto-loading" />
        <span className="ponto-loading" />
        <span className="ponto-loading" />
      </div>
      <p>{texto}</p>
    </div>
  )
}

export default ModeloCarregando