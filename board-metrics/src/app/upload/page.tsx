"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"

interface PreviewData {
  headers: string[]
  previewRows: Record<string, string>[]
  totalRows: number
  suggestions: {
    customer: string | null
    date: string | null
    amount: string | null
  }
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [mapping, setMapping] = useState({
    customer: "",
    date: "",
    amount: "",
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch("/api/upload/preview", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to parse file")
        setLoading(false)
        return
      }

      setPreview(data)
      setMapping({
        customer: data.suggestions.customer || "",
        date: data.suggestions.date || "",
        amount: data.suggestions.amount || "",
      })
    } catch {
      setError("Failed to parse file")
    }
    setLoading(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFile(droppedFile)
    },
    [handleFile]
  )

  const handleSubmit = async () => {
    if (!file || !mapping.customer || !mapping.date || !mapping.amount) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mapping", JSON.stringify(mapping))

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Upload failed")
        setUploading(false)
        return
      }

      setSuccess(
        `Successfully imported ${data.recordCount} records for ${data.customerCount} customers (${data.monthRange.from} to ${data.monthRange.to})`
      )

      setTimeout(() => router.push("/"), 2000)
    } catch {
      setError("Upload failed")
    }
    setUploading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Upload Data
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload a QuickBooks export (CSV or Excel) to import revenue data.
        </p>
      </div>

      {/* Error / Success banners */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          dragOver
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
        }`}
      >
        <Upload className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Drag and drop your file here, or{" "}
          <label className="text-emerald-600 hover:text-emerald-500 font-medium cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </label>
        </p>
        <p className="text-xs text-zinc-400">CSV, XLSX, or XLS files</p>
        {file && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-600 dark:text-zinc-300">
            <FileSpreadsheet className="h-4 w-4" />
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-sm text-zinc-500">
          Parsing file...
        </div>
      )}

      {/* Preview and column mapping */}
      {preview && !loading && (
        <div className="space-y-6">
          {/* Column Mapping */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Map Columns
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Select which columns correspond to customer name, date, and
              amount. We auto-detected likely matches.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { key: "customer", label: "Customer Name" },
                  { key: "date", label: "Date" },
                  { key: "amount", label: "Amount" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    {label} *
                  </label>
                  <select
                    value={mapping[key]}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Select column...</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Preview ({preview.totalRows} total rows, showing first 10)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    {preview.headers.map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                          h === mapping.customer ||
                          h === mapping.date ||
                          h === mapping.amount
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                            : "text-zinc-500"
                        }`}
                      >
                        {h}
                        {h === mapping.customer && " (Customer)"}
                        {h === mapping.date && " (Date)"}
                        {h === mapping.amount && " (Amount)"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {preview.previewRows.map((row, i) => (
                    <tr key={i}>
                      {preview.headers.map((h) => (
                        <td
                          key={h}
                          className={`px-4 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap ${
                            h === mapping.customer ||
                            h === mapping.date ||
                            h === mapping.amount
                              ? "bg-emerald-50/50 dark:bg-emerald-950/10 font-medium"
                              : ""
                          }`}
                        >
                          {row[h] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                uploading ||
                !mapping.customer ||
                !mapping.date ||
                !mapping.amount
              }
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uploading ? "Importing..." : "Import Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
