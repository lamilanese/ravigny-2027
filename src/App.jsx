import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CarnetDeVoyage from './pages/CarnetDeVoyage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/carnet-de-voyage" element={<CarnetDeVoyage />} />
    </Routes>
  )
}

export default App
