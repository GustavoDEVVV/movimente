import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/corrida" element={<h1>Jogo da Corrida</h1>} />
      <Route path="/flap-hand" element={<h1>Jogo Flap Hand</h1>} />
    </Routes>
  )
}

export default App