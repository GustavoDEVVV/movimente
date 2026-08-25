import { useState, useEffect } from 'react'
import './Carousel.css'

function Carousel({ slides }) {
  const [atual, setAtual] = useState(0)

  // troca de slide automaticamente a cada 4.2s
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAtual((i) => (i + 1) % slides.length)
    }, 4200)
    return () => clearInterval(intervalo) // limpa o timer ao desmontar o componente
  }, [slides.length])

  return (
    <div className="carousel">
      <p className="carousel-slide">{slides[atual]}</p>
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === atual ? 'active' : ''}
            onClick={() => setAtual(i)}
            aria-label={`Ver slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel