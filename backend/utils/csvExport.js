// backend/utils/csvExport.js
export function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';

  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(row =>
    keys.map(k => `"${(row[k] !== undefined ? String(row[k]) : '').replace(/"/g, '""')}"`).join(',')
  );

  return [header, ...rows].join('\n');
}
