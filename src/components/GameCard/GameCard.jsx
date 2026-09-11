import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Carousel from '../Carousel/Carousel.jsx'
import { gsap, ScrollTrigger } from '../../utils/gsapSetup.js'
import './GameCard.css'

function GameCard({ tag, title, slides, visual, playLabel, to, reverse = false }) {
  const cardRef = useRef(null)
  const visualRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    const anim = gsap.fromTo(
      el,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    )

    const icone = visualRef.current
    let flutuar
    const entrar = () => {
      flutuar = gsap.to(icone, {
        y: -6,
        rotate: 3,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }
    const sair = () => {
      if (flutuar) flutuar.kill()
      gsap.to(icone, { y: 0, rotate: 0, duration: 0.3 })
    }
    el.addEventListener('mouseenter', entrar)
    el.addEventListener('mouseleave', sair)

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
      el.removeEventListener('mouseenter', entrar)
      el.removeEventListener('mouseleave', sair)
      if (flutuar) flutuar.kill()
    }
  }, [])

  return (
    <div ref={cardRef} className={`game-card ${reverse ? 'reverse' : ''}`}>
      <div className="game-visual">
        <div className="track-bg"></div>
        <div ref={visualRef}>{visual}</div>
      </div>
      <div className="game-copy">
        <span className="game-tag">{tag}</span>
        <h3>{title}</h3>
        <Carousel slides={slides} />
        <Link to={to} className="game-play">{playLabel}</Link>
      </div>
    </div>
  )
}

export default GameCard