import React from 'react';
import { Icon } from './Icon';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-ballroom/60 border-t-2 border-blue-sail/20 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-blue-sail select-none">
      {/* Items count & Page size selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-blue-sail/75 text-[11px] sm:text-xs">
          Menampilkan <strong className="font-bold text-blue-sail">{startItem}</strong> - <strong className="font-bold text-blue-sail">{endItem}</strong> dari <strong className="font-bold text-blue-sail">{totalItems}</strong> data
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-blue-sail/60 hidden md:inline">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-blue-sail/40 px-2 py-1 text-xs font-bold text-blue-sail rounded-none outline-none cursor-pointer focus:border-blue-sail"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 bg-white hover:bg-blue-sail hover:text-white border border-blue-sail/40 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-blue-sail disabled:cursor-not-allowed transition-all font-mono font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
          title="Halaman Sebelumnya"
        >
          <Icon name="ChevronLeft" size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-blue-sail/50 font-mono text-xs">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[32px] h-[32px] font-mono font-bold text-xs border transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-sail text-decor border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                    : 'bg-white hover:bg-decor hover:text-blue-sail text-blue-sail border-blue-sail/30'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 bg-white hover:bg-blue-sail hover:text-white border border-blue-sail/40 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-blue-sail disabled:cursor-not-allowed transition-all font-mono font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
          title="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Next</span>
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    </div>
  );
};
