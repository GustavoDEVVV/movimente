import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

function TesteDeteccao() {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('Carregando modelo...')

  useEffect(() => {
    let poseLandmarker
    let stream
    let animationId

    async function iniciar() {
      // 1. carrega o "motor" do MediaPipe (equivalente ao pip install, mas via CDN)
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      // 2. cria o detector de pose (mesmo modelo .task que usamos em Python)
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
      })

      // 3. pede permissão e liga a webcam
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      setStatus('Detectando...')
      detectarLoop()
    }

    // loop de detecção, um frame por vez (equivalente ao while do Python)
    function detectarLoop() {
      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const resultado = poseLandmarker.detectForVideo(video, performance.now())
        if (resultado.landmarks.length > 0) {
          console.log('landmarks:', resultado.landmarks[0])
        }
      }
      animationId = requestAnimationFrame(detectarLoop)
    }

    iniciar().catch((erro) => {
      console.error(erro)
      setStatus('Erro: ' + erro.message)
    })

    // limpeza: desliga câmera e para o loop se a página for fechada/trocada
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (poseLandmarker) poseLandmarker.close()
    }
  }, [])

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h1>Teste de detecção</h1>
      <p>{status}</p>
      <video
        ref={videoRef}
        style={{ width: 640, transform: 'scaleX(-1)' }}
        muted
        playsInline
      ></video>
    </div>
  )
}

export default TesteDeteccao