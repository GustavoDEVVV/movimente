import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'

function TesteMao() {
    const videoRef = useRef(null)
    const [status, setStatus] = useState('Carregando modelo...')
    const [gesto, setGesto] = useState('—')

    useEffect(() => {
        let recognizer
        let stream
        let animationId
        let cancelado = false // trava contra a dupla execução do Strict Mode

        async function iniciar() {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            )
            if (cancelado) return // se já foi cancelado, nem continua

            recognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 1,
            })
            if (cancelado) {
                recognizer.close() // já criou à toa, mas fecha certinho
                return
            }

            stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (cancelado) {
                stream.getTracks().forEach((t) => t.stop())
                return
            }

            videoRef.current.srcObject = stream
            await videoRef.current.play()
            if (cancelado) return

            setStatus('Detectando...')
            detectarLoop()
        }

        function detectarLoop() {
            if (cancelado) return

            try {
                const video = videoRef.current
                if (video && video.readyState >= 2) {
                    const resultado = recognizer.recognizeForVideo(video, performance.now())
                    if (resultado.gestures.length > 0) {
                        console.log('categoria detectada:', resultado.gestures[0][0].categoryName, '| score:', resultado.gestures[0][0].score)
                    } else {
                        console.log('nenhuma mao no frame')
                    }

                    if (resultado.gestures.length > 0) {
                        const nomeGesto = resultado.gestures[0][0].categoryName
                        const confianca = resultado.gestures[0][0].score
                        setGesto(`${nomeGesto} (${(confianca * 100).toFixed(0)}%)`)
                    } else {
                        setGesto('nenhuma mão detectada')
                    }
                }
            } catch (erroLoop) {
                console.error('ERRO NO LOOP:', erroLoop)
                setStatus('Erro no loop: ' + erroLoop.message)
                return // para o loop pra não spammar o mesmo erro infinitamente
            }

            animationId = requestAnimationFrame(detectarLoop)
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
    }, [])

    return (
        <div style={{ padding: 24, color: '#fff' }}>
            <h1>Teste de gesto (mão)</h1>
            <p>{status}</p>
            <p style={{ fontSize: 24, fontFamily: 'monospace' }}>Gesto: {gesto}</p>
            <video
                ref={videoRef}
                style={{ width: 640, transform: 'scaleX(-1)' }}
                muted
                playsInline
            ></video>
        </div>
    )
}

export default TesteMao