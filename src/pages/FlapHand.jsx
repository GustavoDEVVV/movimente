import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import { useDeteccaoMao } from '../games/flapHand/useDeteccaoMao.js'
import { registrarUltimoJogo } from '../utils/save.js'
import ModeloCarregando from '../components/ModeloCarregando/ModeloCarregando.jsx'
import { fadeInPage } from '../utils/animations.js'
import * as C from '../games/flapHand/config.js'

const CHAVE_RECORDE = 'movimente-flaphand-recorde'

function FlapHand() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const raizRef = useRef(null)
  const [status, setStatus] = useState('Carregando modelo...')
  const navigate = useNavigate()

  const recordeRef = useRef(Number(localStorage.getItem(CHAVE_RECORDE)) || 0)

  const jogo = useRef({
    passaroY: C.ALTURA / 2,
    velocidadeY: 0,
    canos: [],
    pontuacao: 0,
    iniciado: false,
    gameOver: false,
    recordeSalvo: false,
    novoRecorde: false,
  })

  function reiniciarJogo() {
    jogo.current = {
      passaroY: C.ALTURA / 2,
      velocidadeY: 0,
      canos: [],
      pontuacao: 0,
      iniciado: false,
      gameOver: false,
      recordeSalvo: false,
      novoRecorde: false,
    }
  }

  function baterAsa() {
    const j = jogo.current
    if (j.gameOver) {
      reiniciarJogo()
      return
    }
    if (!j.iniciado) {
      j.iniciado = true
    }
    j.velocidadeY = C.IMPULSO
  }

  const { processarGesto } = useDeteccaoMao(baterAsa)

  // animação de entrada da página (roda uma vez, ao montar)
  useLayoutEffect(() => {
    fadeInPage(raizRef)
  }, [])

  // teclas de atalho: 'r' reinicia, 'q' ou ESC volta pra Home
  useEffect(() => {
    function aoApertarTecla(e) {
      if (e.key === 'r') {
        reiniciarJogo()
      } else if (e.key === 'q' || e.key === 'Escape') {
        navigate('/')
      }
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [navigate])

  useEffect(() => {
    let recognizer
    let stream
    let animationId
    let cancelado = false

    async function iniciar() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      if (cancelado) return

      recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      })
      if (cancelado) { recognizer.close(); return }

      stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (cancelado) { stream.getTracks().forEach((t) => t.stop()); return }

      videoRef.current.srcObject = stream
      await videoRef.current.play()
      if (cancelado) return

      setStatus('ok')
      loop()
    }

    function atualizarFisica() {
      const j = jogo.current
      if (!j.iniciado || j.gameOver) return

      j.velocidadeY += C.GRAVIDADE
      j.passaroY += j.velocidadeY

      j.canos.forEach((cano) => (cano.x -= C.VELOCIDADE_CANO))
      j.canos = j.canos.filter((cano) => cano.x + C.LARGURA_CANO > 0)

      const ultimoCano = j.canos[j.canos.length - 1]
      if (!ultimoCano || ultimoCano.x < C.LARGURA - C.ESPACO_ENTRE_CANOS) {
        const margem = 60
        const gapY = margem + Math.random() * (C.ALTURA - C.GAP_CANO - margem * 2)
        j.canos.push({ x: C.LARGURA, gapY, pontuado: false })
      }

      if (j.passaroY - C.RAIO_PASSARO < 0 || j.passaroY + C.RAIO_PASSARO > C.ALTURA) {
        j.gameOver = true
      }

      j.canos.forEach((cano) => {
        const dentroFaixaX =
          C.X_PASSARO + C.RAIO_PASSARO > cano.x &&
          C.X_PASSARO - C.RAIO_PASSARO < cano.x + C.LARGURA_CANO
        const dentroDoGap =
          j.passaroY - C.RAIO_PASSARO > cano.gapY &&
          j.passaroY + C.RAIO_PASSARO < cano.gapY + C.GAP_CANO

        if (dentroFaixaX && !dentroDoGap) {
          j.gameOver = true
        }

        if (!cano.pontuado && cano.x + C.LARGURA_CANO < C.X_PASSARO) {
          cano.pontuado = true
          j.pontuacao += 1
        }
      })

      if (j.gameOver && !j.recordeSalvo) {
        j.recordeSalvo = true
        registrarUltimoJogo('flapHand')
        if (j.pontuacao > recordeRef.current) {
          recordeRef.current = j.pontuacao
          j.novoRecorde = true
          localStorage.setItem(CHAVE_RECORDE, String(j.pontuacao))
        }
      }
    }

    function desenhar() {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const j = jogo.current

      ctx.fillStyle = C.COR_FUNDO
      ctx.fillRect(0, 0, C.LARGURA, C.ALTURA)

      ctx.fillStyle = C.COR_CANO
      j.canos.forEach((cano) => {
        ctx.fillRect(cano.x, 0, C.LARGURA_CANO, cano.gapY)
        ctx.fillRect(cano.x, cano.gapY + C.GAP_CANO, C.LARGURA_CANO, C.ALTURA - (cano.gapY + C.GAP_CANO))
      })

      ctx.fillStyle = C.COR_PASSARO
      ctx.beginPath()
      ctx.arc(C.X_PASSARO, j.passaroY, C.RAIO_PASSARO, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = C.COR_TEXTO
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(j.pontuacao, C.LARGURA / 2, 50)

      ctx.textAlign = 'right'
      ctx.font = '14px monospace'
      ctx.fillStyle = '#5fe8d0'
      ctx.fillText(`recorde: ${recordeRef.current}`, C.LARGURA - 16, 28)
      ctx.textAlign = 'left'

      if (!j.iniciado && !j.gameOver) {
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Feche a mão pra começar a voar', C.LARGURA / 2, C.ALTURA / 2 - 40)
        ctx.textAlign = 'left'
      }

      if (j.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, C.LARGURA, C.ALTURA)
        ctx.fillStyle = C.COR_TEXTO
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Fim de jogo', C.LARGURA / 2, C.ALTURA / 2 - 20)

        if (j.novoRecorde) {
          ctx.fillStyle = '#d9a441'
          ctx.font = 'bold 18px sans-serif'
          ctx.fillText('NOVO RECORDE!', C.LARGURA / 2, C.ALTURA / 2 + 10)
        }

        ctx.fillStyle = C.COR_TEXTO
        ctx.font = '16px sans-serif'
        ctx.fillText('Feche a mão pra jogar de novo', C.LARGURA / 2, C.ALTURA / 2 + 40)
        ctx.textAlign = 'left'
      }
    }

    function loop() {
      if (cancelado) return

      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const resultado = recognizer.recognizeForVideo(video, performance.now())
        if (resultado.gestures.length > 0) {
          const g = resultado.gestures[0][0]
          processarGesto(g.categoryName, g.score)
        }
      }

      atualizarFisica()
      desenhar()

      animationId = requestAnimationFrame(loop)
    }

    iniciar().catch((erro) => {
      if (!cancelado) {
        console.error(erro)
        setStatus('Erro: ' + erro.message)
      }
    })

    return () => {
      cancelado = true
      if (animationId) cancelAnimationFrame(animationId)
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (recognizer) recognizer.close()
    }
  }, [processarGesto])

  return (
    <div ref={raizRef} style={{ padding: 24, color: 'var(--text)' }}>
      <h1 style={{ textAlign: 'center' }}>Flap Hand</h1>

      {status !== 'ok' ? (
        <ModeloCarregando texto={status} />
      ) : (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
          Abra e feche a mão pra voar!
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          flexWrap: 'nowrap',
          maxWidth: C.LARGURA * 2 + 20,
          margin: '0 auto',
        }}
      >
        <canvas
          ref={canvasRef}
          width={C.LARGURA}
          height={C.ALTURA}
          style={{ borderRadius: 14, border: '1px solid var(--line)' }}
        />
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 8,
            width: C.LARGURA,
            height: C.ALTURA,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: '100%',
              flex: 1,
              objectFit: 'cover',
              borderRadius: 8,
              transform: 'scaleX(-1)',
              display: 'block',
            }}
            muted
            playsInline
          ></video>
          <p
            style={{
              marginTop: 8,
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'var(--motion)',
              textAlign: 'center',
            }}
          >
            você
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        <button
          onClick={reiniciarJogo}
          style={{
            background: 'var(--amber)',
            color: '#14100a',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 999,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reiniciar (r)
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--line)',
            padding: '10px 20px',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          Sair (q)
        </button>
      </div>
    </div>
  )
}

export default FlapHand