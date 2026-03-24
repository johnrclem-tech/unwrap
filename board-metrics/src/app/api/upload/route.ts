import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { parseCSV } from "@/lib/parsers/csv-parser"
import { parseExcel } from "@/lib/parsers/excel-parser"
import {
  normalizeRecords,
  aggregateByCustomerMonth,
  type ColumnMapping,
} from "@/lib/parsers/normalize"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mappingStr = formData.get("mapping") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!mappingStr) {
      return NextResponse.json(
        { error: "No column mapping provided" },
        { status: 400 }
      )
    }

    const mapping: ColumnMapping = JSON.parse(mappingStr)

    // Parse file based on type
    let parsedRows: Record<string, string>[]
    const filename = file.name.toLowerCase()

    if (filename.endsWith(".csv")) {
      const text = await file.text()
      const result = parseCSV(text)
      parsedRows = result.rows
    } else if (
      filename.endsWith(".xlsx") ||
      filename.endsWith(".xls")
    ) {
      const buffer = await file.arrayBuffer()
      const result = parseExcel(buffer)
      parsedRows = result.rows
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload CSV or Excel files." },
        { status: 400 }
      )
    }

    // Normalize and aggregate
    const normalized = normalizeRecords(parsedRows, mapping)
    const aggregated = aggregateByCustomerMonth(normalized)

    if (aggregated.length === 0) {
      return NextResponse.json(
        { error: "No valid records found. Please check your column mapping." },
        { status: 400 }
      )
    }

    // Store in database
    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        source: "quickbooks_export",
      },
    })

    let recordCount = 0
    for (const record of aggregated) {
      // Upsert customer
      const customer = await prisma.customer.upsert({
        where: { name: record.customerName },
        update: {},
        create: { name: record.customerName },
      })

      // Create revenue record
      await prisma.revenueRecord.upsert({
        where: {
          customerId_month_uploadId: {
            customerId: customer.id,
            month: record.month,
            uploadId: upload.id,
          },
        },
        update: { amount: record.amount },
        create: {
          customerId: customer.id,
          uploadId: upload.id,
          month: record.month,
          amount: record.amount,
        },
      })
      recordCount++
    }

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      filename: file.name,
      recordCount,
      customerCount: new Set(aggregated.map((r) => r.customerName)).size,
      monthRange: {
        from: aggregated[0]?.month,
        to: aggregated[aggregated.length - 1]?.month,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    )
  }
}
