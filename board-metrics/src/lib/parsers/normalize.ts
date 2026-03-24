export interface ColumnMapping {
  customer: string
  date: string
  amount: string
}

export interface NormalizedRecord {
  customerName: string
  month: string // "YYYY-MM"
  amount: number
}

export function normalizeRecords(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): NormalizedRecord[] {
  const records: NormalizedRecord[] = []

  for (const row of rows) {
    const customerName = (row[mapping.customer] || "").trim()
    const rawDate = (row[mapping.date] || "").trim()
    const rawAmount = (row[mapping.amount] || "").trim()

    if (!customerName || !rawDate || !rawAmount) continue

    const month = parseMonth(rawDate)
    const amount = parseAmount(rawAmount)

    if (!month || isNaN(amount)) continue

    records.push({ customerName, month, amount })
  }

  return records
}

function parseMonth(dateStr: string): string | null {
  // Try YYYY-MM format first
  if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr.slice(0, 7)

  // Try MM/DD/YYYY (common QuickBooks format)
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const month = mdyMatch[1].padStart(2, "0")
    return `${mdyMatch[3]}-${month}`
  }

  // Try M/D/YY
  const mdyShortMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
  if (mdyShortMatch) {
    const year =
      parseInt(mdyShortMatch[3]) > 50
        ? `19${mdyShortMatch[3]}`
        : `20${mdyShortMatch[3]}`
    const month = mdyShortMatch[1].padStart(2, "0")
    return `${year}-${month}`
  }

  // Try parsing with Date constructor as fallback
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

  return null
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, parentheses (negative)
  let cleaned = amountStr.replace(/[$,\s]/g, "")
  const isNegative = cleaned.startsWith("(") && cleaned.endsWith(")")
  if (isNegative) {
    cleaned = cleaned.slice(1, -1)
  }
  const num = parseFloat(cleaned)
  return isNegative ? -num : num
}

export function aggregateByCustomerMonth(
  records: NormalizedRecord[]
): NormalizedRecord[] {
  const map = new Map<string, NormalizedRecord>()

  for (const record of records) {
    const key = `${record.customerName}|${record.month}`
    const existing = map.get(key)
    if (existing) {
      existing.amount += record.amount
    } else {
      map.set(key, { ...record })
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const monthCmp = a.month.localeCompare(b.month)
    if (monthCmp !== 0) return monthCmp
    return a.customerName.localeCompare(b.customerName)
  })
}
