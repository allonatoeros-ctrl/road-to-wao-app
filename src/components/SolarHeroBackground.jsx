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

      {/* Sole / Solar Glow Centrale solo CSS */}
      <div className="wao-eclipse-wrapper">
        <div className="wao-solar-corona" aria-hidden="true"></div>
        <div className="wao-solar-core" aria-hidden="true"></div>
        <div className="wao-solar-aura" aria-hidden="true"></div>
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
