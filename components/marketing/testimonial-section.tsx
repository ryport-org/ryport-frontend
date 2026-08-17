import Image from "next/image";
import { Quote, CheckCircle2 } from "lucide-react";

export function TestimonialSection() {
  return (
    <section id="customers" className="scroll-mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Authentic Portrait */}
          <div className="lg:col-span-5 relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-ink/5">
            <Image
              src="/testimonial-chiamaka.jpg"
              alt="Chiamaka Obilor, Founder of Pectrids"
              fill
              className="object-cover object-center transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/30">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> Verified Ryport User
              </span>
              <p className="mt-2 text-lg font-bold">Chiamaka Obilor</p>
              <p className="text-xs text-slate-200">Founder, Pectrids</p>
            </div>
          </div>

          {/* Right Column: Editorial Quote */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
              <Quote className="size-6" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-sky">Customer Story</p>

            <blockquote className="mt-3">
              <p
                className="font-display text-ink"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.15 }}
              >
                &ldquo;I finally know where my money is going.&rdquo;
              </p>
            </blockquote>

            <div
              className="mt-6 space-y-4 text-mist"
              style={{ fontSize: "var(--text-subhead)", lineHeight: 1.65 }}
            >
              <p>
                &ldquo;I used to guess my spending at the end of every month. With Ryport, I see every transaction categorized instantly — from generator fuel to vendor paystack links.&rdquo;
              </p>
              <p>
                &ldquo;Within weeks of using Ryport, I surfaced leaks in my spending I didn&apos;t even realize existed and saved more every month.&rdquo;
              </p>
            </div>

            {/* Metric Callouts */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-medium text-mist">Impact on Savings</p>
                <p className="mt-1 font-mono text-xl font-bold text-ink tabular-nums">+24% saved/mo</p>
              </div>
              <div>
                <p className="text-xs font-medium text-mist">Time Saved Reconciling</p>
                <p className="mt-1 font-mono text-xl font-bold text-ink tabular-nums">4 hrs/week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
