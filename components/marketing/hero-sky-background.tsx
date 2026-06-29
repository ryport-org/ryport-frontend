export function HeroSkyBackground() {
  return (
    <div
      className="hero-sky-mesh pointer-events-none absolute inset-x-0 -top-20 bottom-0 overflow-hidden sm:-top-24"
      aria-hidden="true"
    >
      {/* Layered brand-sky cloud puffs */}
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--a" />
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--b" />
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--c" />
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--d" />
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--e" />
      <div className="hero-sky-mesh__cloud hero-sky-mesh__cloud--f" />

      {/* Soft centre glow — keeps headline readable */}
      <div className="hero-sky-mesh__glow" />

      <svg
        className="hero-sky-mesh__spark"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L13.2 9.8L21 11L13.2 12.2L12 20L10.8 12.2L3 11L10.8 9.8L12 2Z"
          fill="#3D8BFF"
          fillOpacity="0.55"
        />
        <path
          d="M19 4L19.6 7.4L23 8L19.6 8.6L19 12L18.4 8.6L15 8L18.4 7.4L19 4Z"
          fill="#3D8BFF"
          fillOpacity="0.35"
        />
      </svg>
    </div>
  );
}
