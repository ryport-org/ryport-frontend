import Image from "next/image";
import { Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    quote: "I finally know where my money is going.",
    body: "I used to guess my spending. Now I see everything clearly and save more every month.",
    name: "Chiamaka Obilor",
    role: "Founder, Pectrids",
    image: "/testimonial-chiamaka.jpg",
    location: "Lagos, Nigeria",
    metric: "Saved 24% monthly",
  },
  {
    quote: "Ryport replaced three spreadsheets.",
    body: "Our team finally has one place to see revenue, expenses, and runway without the Monday morning scramble.",
    name: "Ryan Okafor",
    role: "CEO, Stackline",
    image: null,
    location: "Abuja, Nigeria",
    metric: "4.2 mo runway visibility",
  },
  {
    quote: "The AI summaries actually make sense.",
    body: "I don't have an accounting background. Ryport tells me what changed and why — in plain English.",
    name: "Ada Nwosu",
    role: "Owner, Bloom Studio",
    image: null,
    location: "Port Harcourt, Nigeria",
    metric: "Tax-ready in 5 mins",
  },
];

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <div className="relative size-12 overflow-hidden rounded-full border border-line shadow-sm">
        <Image src={image} alt={name} fill className="object-cover" sizes="48px" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand border border-brand/20">
      {initials}
    </div>
  );
}

export function CustomersGridSection() {
  return (
    <section className="bg-paper border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky">Verified Stories</p>
          <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
            Trusted by creators, freelancers, and founders across Nigeria
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-3xl border border-line bg-white p-8 shadow-sm transition-all hover:border-sky/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="size-3" /> {item.metric}
                  </span>
                  <Quote className="size-5 text-mist/40" />
                </div>

                <p className="mt-5 font-display text-xl leading-snug text-ink font-semibold">
                  &ldquo;{item.quote}&rdquo;
                </p>

                <p className="mt-3 text-sm leading-relaxed text-mist">{item.body}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-line/60 flex items-center gap-4">
                <Avatar name={item.name} image={item.image} />
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-mist">{item.role}</p>
                  <p className="text-[11px] font-mono text-sky">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
