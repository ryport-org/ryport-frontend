const partners = ["Mono Open Banking", "Paystack", "Nigerian Banks (via Mono)"];

export function IntegrationsStrip() {
  return (
    <section className="border-y border-line bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-mist">
          Integrates with Mono Open Banking & Paystack infrastructure
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {partners.map((name) => (
            <span key={name} className="text-sm font-semibold text-ink/80">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
