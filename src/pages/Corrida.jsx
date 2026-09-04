import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useContadorPassadas } from '../games/corrida/useContadorPassadas.js'
import { registrarUltimoJogo } from '../utils/save.js'
import * as C from '../games/corrida/config.js'

const CHAVE_RECORDE = 'movimente-corrida-recorde'

function Corrida() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [status, setStatus] = useState('Carregando modelo...')
    const navigate = useNavigate()

    const recordeRef = useRef(Number(localStorage.getItem(CHAVE_RECORDE)) || null)

    const jogo = useRef({
        distancia: 0,
        inicioMs: null,
        tempoFinalS: 0,
        terminou: false,
        novoRecorde: false,
    })

    const contador = useContadorPassadas({
        limiarEntrada: C.LIMIAR_ENTRADA,
        limiarSaida: C.LIMIAR_SAIDA,
        cooldownMs: C.COOLDOWN_MS,
        framesConfirmacao: C.FRAMES_CONFIRMACAO,
    })

    function reiniciarCorrida() {
        contador.reiniciar()
        jogo.current = { distancia: 0, inicioMs: null, tempoFinalS: 0, terminou: false, novoRecorde: false }
    }

    // teclas de atalho: 'r' reinicia, 'q' ou ESC volta pra Home
    useEffect(() => {
        function aoApertarTecla(e) {
            if (e.key === 'r') {
                reiniciarCorrida()
            } else if (e.key === 'q' || e.key === 'Escape') {
                navigate('/')
            }
        }
        window.addEventListener('keydown', aoApertarTecla)
        return () => window.removeEventListener('keydown', aoApertarTecla)
    }, [navigate])

    useEffect(() => {
        let landmarker
        let stream
        let animationId
        let cancelado = false

        async function iniciar() {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            )
            if (cancelado) return

            landmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
            })
            if (cancelado) { landmarker.close(); return }

            stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (cancelado) { stream.getTracks().forEach((t) => t.stop()); return }

            videoRef.current.srcObject = stream
            await videoRef.current.play()
            if (cancelado) return

            setStatus('ok')
            loop()
        }

        function desenharBoneco(ctx, xCentro, yBase, tempoDecorrido) {
            const fase = (tempoDecorrido * C.VELOCIDADE_ANIMACAO) % (2 * Math.PI)
            const balancoPerna = Math.sin(fase) * C.BALANCO_PERNA_PX
            const balancoBraco = -Math.sin(fase) * C.BALANCO_BRACO_PX

            const yQuadril = yBase - 34
            const yOmbro = yQuadril - C.ALTURA_CORPO_BONECO

            ctx.strokeStyle = C.COR_PERNA_BONECO
            ctx.lineWidth = 8
            ctx.beginPath(); ctx.moveTo(xCentro, yQuadril); ctx.lineTo(xCentro - balancoPerna, yBase); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(xCentro, yQuadril); ctx.lineTo(xCentro + balancoPerna, yBase); ctx.stroke()

            ctx.strokeStyle = C.COR_CAMISA
            ctx.lineWidth = 14
            ctx.beginPath(); ctx.moveTo(xCentro, yOmbro); ctx.lineTo(xCentro, yQuadril); ctx.stroke()

            ctx.strokeStyle = C.COR_PELE
            ctx.lineWidth = 7
            ctx.beginPath(); ctx.moveTo(xCentro, yOmbro + 8); ctx.lineTo(xCentro - balancoBraco, yOmbro + 36); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(xCentro, yOmbro + 8); ctx.lineTo(xCentro + balancoBraco, yOmbro + 36); ctx.stroke()

            ctx.fillStyle = C.COR_PELE
            ctx.beginPath(); ctx.arc(xCentro, yOmbro - 14, C.RAIO_CABECA, 0, 2 * Math.PI); ctx.fill()
        }

        function desenharPista(tempoDecorrido) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            const j = jogo.current

            ctx.fillStyle = C.COR_GRAMA
            ctx.fillRect(0, 0, C.LARGURA, C.ALTURA)

            const horizonteY = 30
            const baseY = C.ALTURA - 30
            const centroX = C.LARGURA / 2
            const larguraTopo = 70
            const larguraBase = C.LARGURA - 80

            ctx.fillStyle = C.COR_PISTA
            ctx.beginPath()
            ctx.moveTo(centroX - larguraTopo / 2, horizonteY)
            ctx.lineTo(centroX + larguraTopo / 2, horizonteY)
            ctx.lineTo(centroX + larguraBase / 2, baseY)
            ctx.lineTo(centroX - larguraBase / 2, baseY)
            ctx.closePath()
            ctx.fill()

            ctx.strokeStyle = C.COR_RAIA
            const nRaias = 4
            for (let i = 0; i <= nRaias; i++) {
                const frac = i / nRaias
                const xTopo = centroX - larguraTopo / 2 + frac * larguraTopo
                const xBase = centroX - larguraBase / 2 + frac * larguraBase
                ctx.lineWidth = i === 0 || i === nRaias ? 3 : 1
                ctx.beginPath(); ctx.moveTo(xTopo, horizonteY); ctx.lineTo(xBase, baseY); ctx.stroke()
            }

            for (let d = 0; d <= C.DISTANCIA_TOTAL_M; d += 10) {
                const distAFrente = d - j.distancia
                if (distAFrente >= 0 && distAFrente <= C.DISTANCIA_VISIVEL_M) {
                    const t = distAFrente / C.DISTANCIA_VISIVEL_M
                    const y = baseY - t * (baseY - horizonteY)
                    const larguraAtual = larguraTopo + (1 - t) * (larguraBase - larguraTopo)
                    const x0 = centroX - larguraAtual / 2
                    const x1 = centroX + larguraAtual / 2

                    if (d === C.DISTANCIA_TOTAL_M) {
                        const bloco = Math.max(6, larguraAtual / 10)
                        let x = x0
                        let i = 0
                        while (x < x1) {
                            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#1a1a1a'
                            ctx.fillRect(x, y - 5, bloco, 10)
                            x += bloco
                            i++
                        }
                    } else {
                        ctx.strokeStyle = '#ffffff'
                        ctx.lineWidth = Math.max(1, 3 * (1 - t) + 1)
                        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke()
                        ctx.fillStyle = C.COR_TEXTO
                        ctx.font = '11px monospace'
                        ctx.fillText(`${d}m`, x1 + 6, y + 4)
                    }
                }
            }

            if (!j.terminou) desenharBoneco(ctx, centroX, baseY, tempoDecorrido)

            ctx.fillStyle = C.COR_TEXTO
            ctx.font = 'bold 22px sans-serif'
            ctx.fillText(`${Math.min(j.distancia, C.DISTANCIA_TOTAL_M).toFixed(0)} / ${C.DISTANCIA_TOTAL_M} m`, 20, 36)

            ctx.textAlign = 'right'
            ctx.fillStyle = C.COR_TEMPO
            ctx.fillText(`${tempoDecorrido.toFixed(2)}s`, C.LARGURA - 20, 36)
            if (recordeRef.current !== null) {
                ctx.font = '13px monospace'
                ctx.fillStyle = C.COR_RECORDE
                ctx.fillText(`recorde: ${recordeRef.current.toFixed(2)}s`, C.LARGURA - 20, 56)
            }
            ctx.textAlign = 'left'

            if (j.inicioMs === null && !j.terminou) {
                ctx.textAlign = 'center'
                ctx.font = '15px sans-serif'
                ctx.fillStyle = C.COR_TEXTO
                ctx.fillText('Corra no lugar levantando os joelhos!', centroX, C.ALTURA / 2 - 60)
                ctx.textAlign = 'left'
            }

            if (j.terminou) {
                ctx.fillStyle = 'rgba(0,0,0,0.55)'
                ctx.fillRect(0, 0, C.LARGURA, C.ALTURA)
                ctx.textAlign = 'center'
                ctx.fillStyle = C.COR_CHEGADA
                ctx.font = 'bold 26px sans-serif'
                ctx.fillText(`CHEGOU! ${j.tempoFinalS.toFixed(2)}s`, centroX, C.ALTURA / 2 - 10)
                if (j.novoRecorde) {
                    ctx.fillStyle = C.COR_RECORDE
                    ctx.font = 'bold 16px sans-serif'
                    ctx.fillText('NOVO RECORDE!', centroX, C.ALTURA / 2 + 20)
                }
                ctx.fillStyle = C.COR_TEXTO
                ctx.font = '14px sans-serif'
                ctx.fillText("levante o joelho pra reiniciar", centroX, C.ALTURA / 2 + 46)
                ctx.textAlign = 'left'
            }
        }

        function loop() {
            if (cancelado) return

            const video = videoRef.current
            const j = jogo.current

            if (video && video.readyState >= 2) {
                const timestampMs = performance.now()
                const resultado = landmarker.detectForVideo(video, timestampMs)

                if (resultado.landmarks.length > 0 && !j.terminou) {
                    const pontos = resultado.landmarks[0]
                    const passada = contador.atualizar(pontos[25].y, pontos[26].y, timestampMs)

                    if (passada) {
                        if (j.inicioMs === null) j.inicioMs = timestampMs

                        j.distancia += C.METROS_POR_PASSADA
                        if (j.distancia >= C.DISTANCIA_TOTAL_M) {
                            j.distancia = C.DISTANCIA_TOTAL_M
                            j.terminou = true
                            j.tempoFinalS = (timestampMs - j.inicioMs) / 1000
                            registrarUltimoJogo('corrida')   // <-- adiciona essa linha


                            if (recordeRef.current === null || j.tempoFinalS < recordeRef.current) {
                                recordeRef.current = j.tempoFinalS
                                j.novoRecorde = true
                                localStorage.setItem(CHAVE_RECORDE, String(j.tempoFinalS))
                            }
                        }
                    }
                } else if (resultado.landmarks.length > 0 && j.terminou) {
                    const pontos = resultado.landmarks[0]
                    const passada = contador.atualizar(pontos[25].y, pontos[26].y, timestampMs)
                    if (passada) reiniciarCorrida()
                }
            }

            const tempoDecorrido = j.terminou
                ? j.tempoFinalS
                : j.inicioMs !== null
                    ? (performance.now() - j.inicioMs) / 1000
                    : 0

            desenharPista(tempoDecorrido)
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
            if (landmarker) landmarker.close()
        }
    }, [])

    return (
        <div style={{ padding: 24, color: 'var(--text)' }}>
            <h1 style={{ textAlign: 'center' }}>Corrida 100m</h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                {status === 'ok' ? 'Corra no lugar pra avançar na pista!' : status}
            </p>
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
                        style={{ width: '100%', flex: 1, objectFit: 'cover', borderRadius: 8, transform: 'scaleX(-1)', display: 'block' }}
                        muted
                        playsInline
                    ></video>
                    <p style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12, color: 'var(--motion)', textAlign: 'center' }}>
                        você
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button
                    onClick={reiniciarCorrida}
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

export default Corrida