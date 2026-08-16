"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FraudLog {
  _id: string
  reason: string
  severity: string
  ip: string
  deviceFingerprint?: string
  metadata: Record<string, unknown>
  createdAt: string
  userId?: { email: string; username: string }
}

export default function AdminFraudLogsPage() {
  const [logs, setLogs] = useState<FraudLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [ipFilter, setIpFilter] = useState("")

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "50",
        })
        if (severityFilter !== "all") params.set("severity", severityFilter)
        if (ipFilter) params.set("ip", ipFilter)

        const response = await fetch(`/api/admin/fraud-logs?${params}`)
        const data = await response.json()

        if (data.success) {
          setLogs(data.data.logs)
          setTotalPages(data.data.pagination.pages)
        }
      } catch (error) {
        console.error("Failed to fetch fraud logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [page, severityFilter, ipFilter])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="warning">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fraud & Risk Logs</h1>
        <p className="text-muted-foreground">Monitor suspicious activity and abuse attempts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by IP address..."
            value={ipFilter}
            onChange={(e) => {
              setIpFilter(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={severityFilter}
          onValueChange={(value) => {
            setSeverityFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Severity</th>
                  <th className="text-left p-4 font-medium">Reason</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">IP</th>
                  <th className="text-left p-4 font-medium">Fingerprint</th>
                  <th className="text-left p-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No fraud logs found</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{getSeverityBadge(log.severity)}</td>
                      <td className="p-4">
                        <div className="font-medium">{log.reason}</div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(log.metadata).slice(0, 100)}...
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {log.userId ? (
                          <>
                            <div>{log.userId.username}</div>
                            <div className="text-muted-foreground">{log.userId.email}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Anonymous</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm">{log.ip}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {log.deviceFingerprint || "-"}
                      </td>
                      <td className="p-4 text-sm">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
