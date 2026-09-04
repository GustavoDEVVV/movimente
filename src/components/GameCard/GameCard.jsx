import Carousel from '../Carousel/Carousel.jsx'
import { Link } from 'react-router-dom'
import './GameCard.css'

function GameCard({ tag, title, slides, visual, playLabel, to, reverse = false }) {
  return (
    <div className={`game-card ${reverse ? 'reverse' : ''}`}>
      <div className="game-visual">
        <div className="track-bg"></div>
        {visual}
      </div>
      <div className="game-copy">
        <span className="game-tag">{tag}</span>
        <h3>{title}</h3>
        <Carousel slides={slides} />
        <Link to={to} className="game-play">{playLabel}</Link>
      </div>
    </div>
  )
}

export default GameCard