import * as XLSX from 'xlsx';

export function useExport() {
  const exportExcel = (data: Record<string, any>[], headers: { key: string; label: string }[], filename: string) => {
    const rows = data.map((row) =>
      Object.fromEntries(headers.map((h) => [h.label, row[h.key] ?? ''])),
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportCsv = (data: Record<string, any>[], headers: { key: string; label: string }[], filename: string) => {
    const headerLine = headers.map((h) => `"${h.label}"`).join(',');
    const lines = data.map((row) =>
      headers.map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','),
    );
    const csv = [headerLine, ...lines].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { exportExcel, exportCsv };
}
