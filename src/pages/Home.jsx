import GameCard from '../components/GameCard/GameCard.jsx'
import './Home.css'

// ícone SVG do jogo de corrida (bonequinho correndo)
function IconeCorrida() {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="18" r="9" fill="#d9a441" />
      <line x1="50" y1="27" x2="50" y2="55" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="55" x2="28" y2="90" stroke="#5fe8d0" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="55" x2="70" y2="72" stroke="#5fe8d0" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="35" x2="25" y2="45" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="35" x2="75" y2="50" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

// ícone SVG do jogo de mão (mão fechando)
function IconeMao() {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <path d="M35 60 L35 30 Q35 22 43 22 Q51 22 51 30 L51 55" stroke="#5fe8d0" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M51 55 L51 35 Q51 27 59 27 Q67 27 67 35 L67 58" stroke="#5fe8d0" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M35 60 Q30 68 35 78 Q42 90 58 90 Q72 90 72 74 L72 55" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Home() {
  return (
    <>
      <nav>
        <div className="wrap nav-inner">
          <div className="logo"><span className="logo-dot"></span>movimente</div>
          <div className="nav-links">
            <a href="#jogos">Jogos</a>
            <a href="#continuar">Continuar</a>
          </div>
          <a href="#jogos" className="nav-cta">Jogar agora</a>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">controlado por webcam</span>
            <h1>Seu corpo <em>é</em><br />o controle.</h1>
            <p className="lead">
              Mova-se na frente da câmera e veja o jogo responder em tempo real.
              Sem joystick, sem teclado — só você, o sensor e a vontade de se mexer.
            </p>
            <div className="hero-ctas">
              <a href="#jogos" className="btn-primary">Escolher um jogo</a>
              <a href="#" className="btn-ghost">Como funciona</a>
            </div>
          </div>

          <div className="skeleton-box">
            <span className="hud-tag hud-tag-tl">rastreando corpo…</span>
            <svg className="skeleton-svg" viewBox="0 0 300 380">
              <g className="bone" fill="none">
                <line x1="150" y1="70" x2="150" y2="170" />
                <line x1="150" y1="90" x2="95" y2="130" />
                <line x1="95" y1="130" x2="70" y2="185" />
                <line x1="150" y1="90" x2="205" y2="130" />
                <line x1="205" y1="130" x2="230" y2="185" />
                <line x1="150" y1="170" x2="110" y2="250" />
                <line x1="110" y1="250" x2="100" y2="330" />
                <line x1="150" y1="170" x2="190" y2="250" />
                <line x1="190" y1="250" x2="200" y2="330" />
              </g>
              <circle className="node" cx="150" cy="45" r="16" style={{ animationDelay: '0s' }} />
              <circle className="node" cx="150" cy="90" r="4.5" style={{ animationDelay: '0.1s' }} />
              <circle className="node" cx="95" cy="130" r="4.5" style={{ animationDelay: '0.2s' }} />
              <circle className="node" cx="70" cy="185" r="4.5" style={{ animationDelay: '0.3s' }} />
              <circle className="node" cx="205" cy="130" r="4.5" style={{ animationDelay: '0.4s' }} />
              <circle className="node" cx="230" cy="185" r="4.5" style={{ animationDelay: '0.5s' }} />
              <circle className="node" cx="150" cy="170" r="4.5" style={{ animationDelay: '0.15s' }} />
              <circle className="node" cx="110" cy="250" r="4.5" style={{ animationDelay: '0.25s' }} />
              <circle className="node" cx="100" cy="330" r="4.5" style={{ animationDelay: '0.35s' }} />
              <circle className="node" cx="190" cy="250" r="4.5" style={{ animationDelay: '0.45s' }} />
              <circle className="node" cx="200" cy="330" r="4.5" style={{ animationDelay: '0.55s' }} />
            </svg>
            <span className="hud-tag hud-tag-br">33 pontos ativos</span>
          </div>
        </div>
      </header>

      <section className="games" id="jogos">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow eyebrow-amber">biblioteca de jogos</span>
            <h2>Cada jogo, uma parte do corpo.</h2>
            <p>Escolha o movimento e a câmera faz o resto. Novos jogos chegam conforme novas partes do corpo entram em cena.</p>
          </div>

          <GameCard
            tag="Pernas · Cardio"
            title="Corrida 100m"
            visual={<IconeCorrida />}
            playLabel="Jogar Corrida 100m"
            slides={[
              'Corra no lugar levantando os joelhos alternadamente — cada passada te empurra pra frente na pista.',
              'Uma pista em perspectiva reage em tempo real, com linha de chegada se aproximando conforme você avança.',
              'Seu melhor tempo fica salvo. O objetivo é simples: bater o seu próprio recorde.',
            ]}
          />

          <GameCard
            tag="Mãos · Reflexo"
            title="Flap Hand"
            visual={<IconeMao />}
            playLabel="Jogar Flap Hand"
            reverse
            slides={[
              'Abra e feche a mão na frente da câmera pra fazer o personagem "bater asas" e ganhar altura.',
              'Desvie dos obstáculos que vão surgindo — cada fechada de mão é um pulo, cada pausa é uma queda.',
              'Detecção de 21 pontos por mão, direto do MediaPipe Hand Landmarker.',
            ]}
          />
        </div>
      </section>

      <section className="continue" id="continuar">
        <div className="wrap">
          <div className="section-head section-head-tight">
            <span className="eyebrow eyebrow-amber">seu progresso</span>
            <h2>Continue de onde parou.</h2>
          </div>
          <div className="save-card">
            <div className="save-left">
              <div className="save-icon"><IconeCorrida /></div>
              <div className="save-meta">
                <span className="mono">último jogo</span>
                <h4>Corrida 100m</h4>
              </div>
            </div>
            <div className="save-stats">
              <div className="stat">
                <span className="num">6.90s</span>
                <span className="label">seu recorde</span>
              </div>
              <div className="stat">
                <span className="num">21/08</span>
                <span className="label">última jogada</span>
              </div>
            </div>
            <a href="#" className="btn-primary">Continuar</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-inner">
          <span>movimente — feito com React, MediaPipe.js e a teimosia de fazer funcionar sem engine gráfica.</span>
          <span className="mono">github.com/seu-usuario/movimente</span>
        </div>
      </footer>
    </>
  )
}

export default Home