export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="shrink-0 border-b border-border bg-bg px-6 py-5">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-6">{children}</div>;
}
