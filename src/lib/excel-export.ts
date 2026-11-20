import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
}

export interface ExcelColumn<T = any> {
  header: string;
  key: string;
  width?: number;
  format?: (row: T, index: number) => string | number;
}

/**
 * Generates and downloads a formatted .xlsx file in the browser
 */
export function exportToExcel<T extends Record<string, any>>(
  rows: T[],
  columnsOrFileName: ExcelColumn<T>[] | string,
  fileNameOrSheetName: string = "Hisobot",
  sheetNameOrColumns?: string | ExportColumn[]
) {
  if (Array.isArray(columnsOrFileName)) {
    const columns = columnsOrFileName;
    const fileName = fileNameOrSheetName;
    const sheetName = typeof sheetNameOrColumns === "string" ? sheetNameOrColumns : "Hisobot";

    const formattedData = rows.map((row, index) => {
      const record: Record<string, string | number> = {};
      for (const col of columns) {
        record[col.header] = col.format ? col.format(row, index) : (row[col.key] ?? "");
      }
      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    worksheet["!cols"] = columns.map((col) => ({
      wch: col.width || Math.max(col.header.length + 5, 16),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

    const cleanFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, cleanFileName);
    return;
  }

  // Legacy signature: exportToExcel(data, filename, sheetName, columns)
  const filename = columnsOrFileName;
  const sheetName = fileNameOrSheetName || "Sheet1";
  const columns = Array.isArray(sheetNameOrColumns) ? sheetNameOrColumns : undefined;

  let formattedData: any[] = rows;
  if (columns) {
    formattedData = rows.map((row) => {
      const formatted: any = {};
      columns.forEach((col) => {
        const value = row[col.key];
        formatted[col.header] = formatValue(value, col.format);
      });
      return formatted;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  if (columns) {
    worksheet["!cols"] = columns.map((col) => ({ wch: col.width || 15 }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, fullFilename);
}

function formatValue(value: any, format?: string): any {
  if (value === null || value === undefined) return "";
  switch (format) {
    case "date":
      return formatDate(value);
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return formatPercentage(value);
    case "number":
      return typeof value === "number" ? value : parseFloat(value) || 0;
    case "text":
    default:
      return String(value);
  }
}

function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return String(date);
  }
}

function formatCurrency(amount: number): string {
  if (typeof amount !== "number") {
    amount = parseFloat(String(amount)) || 0;
  }
  return (
    amount.toLocaleString("uz-UZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " UZS"
  );
}

function formatPercentage(value: number): string {
  if (typeof value !== "number") {
    value = parseFloat(String(value)) || 0;
  }
  return value.toFixed(1) + "%";
}

export async function exportStudentResults(results: any[]) {
  const columns: ExportColumn[] = [
    { header: "Student", key: "student_name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Test", key: "test_title", width: 25 },
    { header: "Subject", key: "subject", width: 12 },
    { header: "Score", key: "score", width: 10, format: "number" },
    { header: "Max Score", key: "max_score", width: 10, format: "number" },
    { header: "Percentage", key: "percentage", width: 12, format: "percentage" },
    { header: "Status", key: "status", width: 10 },
    { header: "Date", key: "completed_at", width: 12, format: "date" },
    { header: "Time Spent", key: "time_spent", width: 12 },
  ];

  const formattedResults = results.map((r) => ({
    student_name: r.student_name || "Unknown",
    phone: r.phone || "N/A",
    test_title: r.test_title || "N/A",
    subject: r.subject || "N/A",
    score: r.score || 0,
    max_score: r.max_score || 0,
    percentage: r.percentage || 0,
    status: r.percentage >= r.passing_score ? "Passed" : "Failed",
    completed_at: r.completed_at,
    time_spent: formatTimeSpent(r.time_spent_seconds),
  }));

  exportToExcel(formattedResults, "Student_Results", "Results", columns);
}

function formatTimeSpent(seconds: number | null): string {
  if (!seconds) return "0 min";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
