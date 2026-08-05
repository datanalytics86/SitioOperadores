import Link from 'next/link';

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-10"
      aria-label="Paginación"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn-secondary px-4 py-2 text-sm">
          ← Anterior
        </Link>
      ) : (
        <span className="btn-secondary px-4 py-2 text-sm opacity-40 pointer-events-none">
          ← Anterior
        </span>
      )}

      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
          (p) => (
            <Link
              key={p}
              href={hrefFor(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors ${
                p === page
                  ? 'bg-faena text-black'
                  : 'text-gray-400 hover:text-white hover:bg-ink-700'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="btn-secondary px-4 py-2 text-sm">
          Siguiente →
        </Link>
      ) : (
        <span className="btn-secondary px-4 py-2 text-sm opacity-40 pointer-events-none">
          Siguiente →
        </span>
      )}
    </nav>
  );
}
