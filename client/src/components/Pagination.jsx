export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxShow = 5;
  let start = Math.max(1, page - Math.floor(maxShow / 2));
  let end = Math.min(totalPages, start + maxShow - 1);
  if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btn = "w-9 h-9 text-sm rounded-full transition border border-warm-200 text-brown-400 hover:text-coral-500 hover:border-coral-300 disabled:opacity-30 disabled:cursor-not-allowed font-medium";

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={`${btn} w-auto px-4`}>← 上一页</button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btn}>1</button>
          {start > 2 && <span className="text-brown-300 px-1">···</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={p === page
            ? 'w-9 h-9 text-sm rounded-full bg-coral-400 text-white font-medium shadow-md shadow-coral-200'
            : btn}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-brown-300 px-1">···</span>}
          <button onClick={() => onPageChange(totalPages)} className={btn}>{totalPages}</button>
        </>
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={`${btn} w-auto px-4`}>下一页 →</button>
    </div>
  );
}
