export default function ScoreCard({
  scores,
  psi,
  url,
}: {
  scores: any;
  psi: any;
  url: string;
}) {
  const pill = (label: string, v: number) => (
    <div className="badge bg-neutral-100 dark:bg-neutral-800">
      {label}: <span className="font-semibold">{v ?? 'NA'}</span>
    </div>
  );
  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit – {url}</h2>
        <div className="badge bg-neutral-200 dark:bg-neutral-800">
          Overall: <span className="font-bold">{scores.overall}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pill('Technical', scores.technical)}
        {pill('Content', scores.content)}
        {pill('Metadata', scores.metadata)}
        {pill('Links', scores.links)}
        {pill('Media', scores.media)}
      </div>
      <div className="flex flex-wrap gap-2 opacity-80">
        {pill('Lighthouse Perf', psi?.lighthouse?.performance)}
        {pill('Lighthouse SEO', psi?.lighthouse?.seo)}
        {pill('LCP(s)', psi?.lcp)}
        {pill('CLS', psi?.cls)}
        {pill('INP(s)', psi?.inp)}
      </div>
    </section>
  );
}
