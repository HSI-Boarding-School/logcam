import { useEffect, useState } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Logbook {
  id: number
  name: string
  tipe: string
  mengambil: string
  mengembalikan: string
  created_at: string
  user_id: number
  kelas?: string
  date?: string
  time?: string
}

export default function Logbook() {
  const [logs, setLogs] = useState<Logbook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [search, setSearch] = useState("")

  // 🔹 Fetch all logs (laptop + hp + users)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [laptopRes, hpRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/users/all/log-laptop"),
          axios.get("http://127.0.0.1:8000/users/all/log-hp"),
          axios.get("http://127.0.0.1:8000/users/all/users"),
        ])

        const usersData = usersRes.data.users || usersRes.data
        const laptopLogs = laptopRes.data["log-laptop"]
        const hpLogs = hpRes.data["log-hp"]

        const merged = [...laptopLogs, ...hpLogs].map((log: Logbook) => {
          const user = usersData.find((u: any) => u.id === log.user_id)
          const kelas = user ? user.kelas || user.tipe_class || "-" : "-"

          const createdAt = new Date(log.created_at.replace(" ", "T") + "Z")
          const dateStr = createdAt.toLocaleDateString("id-ID")
          const timeStr = createdAt.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })

          return {
            ...log,
            kelas,
            date: dateStr,
            time: timeStr,
          }
        })

        setLogs(merged)
      } catch (err) {
        console.error("Failed to fetch logs:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // 🔹 Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesDevice =
      selectedDevice === "all" || log.tipe.toLowerCase() === selectedDevice
    const matchesAction =
      selectedAction === "all" ||
      (selectedAction === "borrowed" && log.mengambil === "SUDAH") ||
      (selectedAction === "returned" && log.mengembalikan === "SUDAH")
    const matchesSearch = log.name
      .toLowerCase()
      .includes(search.toLowerCase())
    return matchesDevice && matchesAction && matchesSearch
  })

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground animate-pulse">
        Loading logbook data...
      </div>
    )
  }

  // 🔹 UI Modern Table
  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4 sm:px-8">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Logbook
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-60"
            />

            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="hp">HP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Device</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Time</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.name}</TableCell>
                    <TableCell className="capitalize">
                      {log.tipe}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.mengembalikan === "SUDAH"
                            ? "secondary"
                            : "default"
                        }
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                      >
                        {log.mengembalikan === "SUDAH"
                          ? "Returned"
                          : "Borrowed"}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.time}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
