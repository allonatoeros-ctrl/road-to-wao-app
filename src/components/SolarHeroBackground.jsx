export default function SolarHeroBackground() {
  return (
    <div className="solar-background-container">
      {/* Sfondo principale (Spazio Profondo e Nebulosa) */}
      <img
        src="/assets/road-to-wao/home/hero/wao-home-hero-background-main.png"
        className="wao-bg-main"
        alt=""
        aria-hidden="true"
      />

      {/* Overlay particelle e campo stellato */}
      <img
        src="/assets/road-to-wao/home/hero/wao-home-starfield-particles-overlay.png"
        className="wao-starfield-overlay"
        alt=""
        aria-hidden="true"
      />

      {/* Eclissi Solare Centrale */}
      <div className="wao-eclipse-wrapper">
        {/* Sole/Eclissi in CSS per eliminare l'asset con trasparenza errata (scacchiera) */}
        <div className="wao-eclipse-css-sun" aria-label="Eclissi Solare">
          <div className="wao-eclipse-corona" aria-hidden="true"></div>
          <div className="wao-eclipse-dark-center" aria-hidden="true"></div>
        </div>
        {/* Un leggero bagliore/alone CSS pulsante dietro l'alone dell'eclissi */}
        <div className="wao-eclipse-pulse-glow" aria-hidden="true"></div>
      </div>

      {/* Nebulosa inferiore per sfumare verso il contenuto */}
      <img
        src="/assets/road-to-wao/home/hero/wao-home-nebula-bottom-overlay.png"
        className="wao-nebula-bottom"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
