import Image from "next/image";

const testimonials = [
  {
    quote: "I finally know where my money is going.",
    body: "I used to guess my spending. Now I see everything clearly and save more every month.",
    name: "Chiamaka Obilor",
    role: "Founder, Pectrids",
    image: "/testimonial-chiamaka.jpg",
  },
  {
    quote: "Ryport replaced three spreadsheets.",
    body: "Our team finally has one place to see revenue, expenses, and runway without the Monday morning scramble.",
    name: "Ryan Okafor",
    role: "CEO, Stackline",
    image: null,
  },
  {
    quote: "The AI summaries actually make sense.",
    body: "I don't have an accounting background. Ryport tells me what changed and why — in plain English.",
    name: "Ada Nwosu",
    role: "Owner, Bloom Studio",
    image: null,
  },
];

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <div className="relative size-10 overflow-hidden rounded-full border border-line">
        <Image src={image} alt="" fill className="object-cover" sizes="40px" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-sky-soft text-xs font-semibold text-sky">
      {initials}
    </div>
  );
}

export function CustomersGridSection() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col rounded-2xl border border-line bg-white p-8"
            >
              <p className="font-display text-lg leading-snug text-ink">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-mist">{item.body}</p>
              <div className="mt-8 flex items-center gap-3">
                <Avatar name={item.name} image={item.image} />
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-mist">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
