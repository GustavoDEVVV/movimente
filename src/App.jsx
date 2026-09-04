import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import FlapHand from './pages/FlapHand.jsx'
import Corrida from './pages/Corrida.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flap-hand" element={<FlapHand />} />
      <Route path="/flap-hand" element={<h1>Jogo Flap Hand</h1>} />
      <Route path="/corrida" element={<Corrida />} />
    </Routes>
  )
}

export default App