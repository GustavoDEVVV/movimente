import { gsap } from './gsapSetup.js'

// fade + slight rise, usado como "entrada" padrão de cada página
export function fadeInPage(ref) {
  if (!ref.current) return
  gsap.fromTo(
    ref.current,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
  )
}

// aplica um "pop" sutil de hover num elemento (botões, ícones)
export function attachHoverPop(el, { scale = 1.06, lift = -3 } = {}) {
  if (!el) return
  const entrar = () => gsap.to(el, { scale, y: lift, duration: 0.25, ease: 'power2.out' })
  const sair = () => gsap.to(el, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  el.addEventListener('mouseenter', entrar)
  el.addEventListener('mouseleave', sair)
  return () => {
    el.removeEventListener('mouseenter', entrar)
    el.removeEventListener('mouseleave', sair)
  }
}