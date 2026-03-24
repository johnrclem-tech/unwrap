import * as XLSX from "xlsx"

export interface ParsedRow {
  [key: string]: string
}

export interface ParseResult {
  headers: string[]
  rows: ParsedRow[]
  rowCount: number
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(firstSheet, {
    defval: "",
    raw: false,
  })

  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : []

  return {
    headers,
    rows: jsonData,
    rowCount: jsonData.length,
  }
}
