type ContentSectionProps = {
  children: React.ReactNode;
};

export function ContentSection({ children }: ContentSectionProps) {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="space-y-6 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function ContentHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-ink">{children}</h2>;
}
