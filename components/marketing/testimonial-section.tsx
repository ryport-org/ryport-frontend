import Image from "next/image";

export function TestimonialSection() {
  return (
    <section id="customers" className="scroll-mt-32 border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_32px_rgba(19,23,31,0.08)]">
            <Image
              src="/testimonial-chiamaka.jpg"
              alt="Chiamaka Obilor, Founder of Pectrids"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <p className="text-sm text-mist">Chiamaka Obilor, Founder of Pectrids</p>

            <blockquote className="mt-6">
              <p
                className="font-display text-ink"
                style={{ fontSize: "clamp(1.5rem, 2.5vw + 0.5rem, 2rem)", lineHeight: 1.25 }}
              >
                &ldquo;I finally know where my money is going.&rdquo;
              </p>
            </blockquote>

            <div
              className="mt-8 space-y-4 text-mist"
              style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}
            >
              <p>
                I used to guess my spending. Now I see everything clearly and save
                more every month.
              </p>
              <p>
                Within weeks, I found leaks in my spending I didn&apos;t even realize.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="relative size-12 overflow-hidden rounded-full border border-line">
                <Image
                  src="/testimonial-chiamaka.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-medium text-ink">Chiamaka Obilor</p>
                <p className="text-sm text-mist">Founder, Pectrids</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
