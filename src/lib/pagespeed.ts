import fetch from 'node-fetch';

export type PSI = {
  lcp?: number;
  cls?: number;
  inp?: number;
  lighthouse?: {
    performance?: number;
    accessibility?: number;
    seo?: number;
    bestPractices?: number;
  };
};

export async function getPSI(
  url: string,
  apiKey?: string
): Promise<PSI | null> {
  if (!apiKey) return null;
  const endpoint = new URL(
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  );
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.append('category', 'PERFORMANCE');
  endpoint.searchParams.append('category', 'SEO');
  endpoint.searchParams.set('strategy', 'mobile');
  endpoint.searchParams.set('key', apiKey);
  const res = await fetch(endpoint.toString());
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data) return null;
  const audits = data.lighthouseResult?.audits || {};
  const metrics = data.loadingExperience?.metrics || {};
  return {
    lcp: metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile
      ? metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000
      : undefined,
    cls: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
    inp: metrics.INTERACTION_TO_NEXT_PAINT?.percentile
      ? metrics.INTERACTION_TO_NEXT_PAINT.percentile / 1000
      : undefined,
    lighthouse: {
      performance: data.lighthouseResult?.categories?.performance?.score
        ? Math.round(data.lighthouseResult.categories.performance.score * 100)
        : undefined,
      accessibility: data.lighthouseResult?.categories?.accessibility?.score
        ? Math.round(data.lighthouseResult.categories.accessibility.score * 100)
        : undefined,
      seo: data.lighthouseResult?.categories?.seo?.score
        ? Math.round(data.lighthouseResult.categories.seo.score * 100)
        : undefined,
      bestPractices: data.lighthouseResult?.categories?.['best-practices']
        ?.score
        ? Math.round(
            data.lighthouseResult.categories['best-practices'].score * 100
          )
        : undefined,
    },
  };
}
