type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow ? (
            <p className="text-sm font-medium text-sky">{eyebrow}</p>
          ) : null}
          <h1
            className={`font-display text-ink ${eyebrow ? "mt-3" : ""}`}
            style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3rem)", lineHeight: 1.12 }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-4 text-mist"
              style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
