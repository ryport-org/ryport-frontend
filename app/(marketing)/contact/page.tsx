import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Contact — Ryport",
  description: "Get in touch with the Ryport team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions about pricing, partnerships, or enterprise plans? Send us a message."
      />
      <section className="bg-paper">
        <div className="mx-auto max-w-lg px-6 py-16 lg:px-8 lg:py-20">
          <form className="space-y-4" action="#" method="post">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-ink">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1.5 block w-full resize-none rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <Button type="submit" className="w-full">
              Send message
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-mist">
            Or email us directly at{" "}
            <a href="mailto:hello@ryport.io" className="font-medium text-sky hover:underline">
              hello@ryport.io
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
