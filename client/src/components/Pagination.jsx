export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxShow = 5;
  let start = Math.max(1, page - Math.floor(maxShow / 2));
  let end = Math.min(totalPages, start + maxShow - 1);
  if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btn = "px-3 py-1.5 text-sm border border-slate-700 rounded-lg transition text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center space-x-1.5 mt-10">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={btn}>上一页</button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btn}>1</button>
          {start > 2 && <span className="px-2 text-slate-600">...</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={p === page
            ? 'px-3 py-1.5 text-sm rounded-lg bg-cyan-600 text-white font-medium shadow-lg shadow-cyan-500/20'
            : btn}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-slate-600">...</span>}
          <button onClick={() => onPageChange(totalPages)} className={btn}>{totalPages}</button>
        </>
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={btn}>下一页</button>
    </div>
  );
}
