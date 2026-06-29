import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Blog — Ryport",
  description: "Insights on cash flow, growth, and running a smarter business.",
};

const posts = [
  {
    title: "5 signs your business needs better cash flow visibility",
    date: "March 12, 2026",
    excerpt: "If you're guessing at runway or surprised by expenses, it's time for a clearer view.",
  },
  {
    title: "How AI is changing small business finance",
    date: "February 28, 2026",
    excerpt: "Plain-English summaries are replacing spreadsheet archaeology for growing teams.",
  },
  {
    title: "What to track before you hire your first employee",
    date: "February 10, 2026",
    excerpt: "Revenue trends, burn rate, and buffer — the three numbers every founder should know.",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights for growing businesses"
        description="Practical advice on cash flow, revenue, and making smarter financial decisions."
      />
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="divide-y divide-line">
            {posts.map((post) => (
              <article key={post.title} className="py-8 first:pt-0 last:pb-0">
                <p className="text-xs text-mist">{post.date}</p>
                <h2 className="mt-2 font-display text-xl text-ink">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist">{post.excerpt}</p>
                <Link href="#" className="mt-4 inline-block text-sm font-medium text-sky hover:underline">
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
