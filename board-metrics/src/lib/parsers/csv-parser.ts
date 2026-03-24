import Papa from "papaparse"

export interface ParsedRow {
  [key: string]: string
}

export interface ParseResult {
  headers: string[]
  rows: ParsedRow[]
  rowCount: number
}

export function parseCSV(fileContent: string): ParseResult {
  const result = Papa.parse<ParsedRow>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  })

  const headers = result.meta.fields || []
  const rows = result.data

  return {
    headers,
    rows,
    rowCount: rows.length,
  }
}
