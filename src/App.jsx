import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import FlapHand from './pages/FlapHand.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flap-hand" element={<FlapHand />} />
      <Route path="/corrida" element={<h1>Jogo da Corrida</h1>} />
      <Route path="/flap-hand" element={<h1>Jogo Flap Hand</h1>} />
    </Routes>
  )
}

export default App