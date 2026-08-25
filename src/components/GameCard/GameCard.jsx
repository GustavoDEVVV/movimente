import Carousel from '../Carousel/Carousel.jsx'
import './GameCard.css'

function GameCard({ tag, title, slides, visual, playLabel, reverse = false }) {
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
        <a href="#" className="game-play">{playLabel}</a>
      </div>
    </div>
  )
}

export default GameCard