import { NextRequest, NextResponse } from "next/server"
import { parseCSV } from "@/lib/parsers/csv-parser"
import { parseExcel } from "@/lib/parsers/excel-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name.toLowerCase()
    let headers: string[]
    let previewRows: Record<string, string>[]
    let totalRows: number

    if (filename.endsWith(".csv")) {
      const text = await file.text()
      const result = parseCSV(text)
      headers = result.headers
      previewRows = result.rows.slice(0, 10)
      totalRows = result.rowCount
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const buffer = await file.arrayBuffer()
      const result = parseExcel(buffer)
      headers = result.headers
      previewRows = result.rows.slice(0, 10)
      totalRows = result.rowCount
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }

    // Auto-detect likely column mappings
    const suggestions = autoDetectMappings(headers)

    return NextResponse.json({
      headers,
      previewRows,
      totalRows,
      suggestions,
    })
  } catch (error) {
    console.error("Preview error:", error)
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    )
  }
}

function autoDetectMappings(headers: string[]): {
  customer: string | null
  date: string | null
  amount: string | null
} {
  const lower = headers.map((h) => h.toLowerCase())

  const customerPatterns = ["customer", "client", "name", "customer name", "customer/job"]
  const datePatterns = ["date", "txn date", "transaction date", "invoice date"]
  const amountPatterns = ["amount", "total", "revenue", "sales", "balance", "net amount"]

  return {
    customer: findMatch(headers, lower, customerPatterns),
    date: findMatch(headers, lower, datePatterns),
    amount: findMatch(headers, lower, amountPatterns),
  }
}

function findMatch(
  headers: string[],
  lowerHeaders: string[],
  patterns: string[]
): string | null {
  for (const pattern of patterns) {
    const idx = lowerHeaders.findIndex(
      (h) => h === pattern || h.includes(pattern)
    )
    if (idx !== -1) return headers[idx]
  }
  return null
}
