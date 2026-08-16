"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Order {
  _id: string
  requestId: string
  status: string
  quantity: number
  targetUrl: string
  latencyMs?: number
  providerOrderId?: string
  failureReason?: string
  createdAt: string
  completedAt?: string
  userId: { email: string; username: string }
  serviceId: { name: string }
  platformId: { name: string; slug: string }
  providerId?: { name: string }
  providerResponse?: Record<string, unknown>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        })
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (search) params.set("search", search)

        const response = await fetch(`/api/admin/orders?${params}`)
        const data = await response.json()

        if (data.success) {
          setOrders(data.data.orders)
          setTotalPages(data.data.pagination.pages)
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page, statusFilter, search])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="success">Delivered</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "ORDER_QUEUED":
        return <Badge variant="warning">Queued</Badge>
      case "PROVIDER_DISPATCHED":
        return <Badge variant="warning">Dispatched</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and monitor all orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, URL, or provider order ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ORDER_QUEUED">Queued</SelectItem>
            <SelectItem value="PROVIDER_DISPATCHED">Dispatched</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Tracking ID</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Link</th>
                  <th className="text-left p-4 font-medium">Qty</th>
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <>
                      <tr key={order._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-mono text-xs font-semibold">{order.trackingId || order.requestId?.slice(0, 8)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{order.userId?.username || "Guest"}</div>
                          <div className="text-xs text-muted-foreground">{order.userId?.email || "-"}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{order.serviceId?.name}</div>
                          <div className="text-xs text-muted-foreground">{order.platformId?.name}</div>
                        </td>
                        <td className="p-4 max-w-[200px] truncate">
                          <a
                            href={order.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-600 hover:underline"
                          >
                            {order.targetUrl?.replace(/^https?:\/\/(www\.)?/, "").slice(0, 30)}...
                          </a>
                        </td>
                        <td className="p-4">{order.quantity}</td>
                        <td className="p-4">
                          {order.providerId?.name || "-"}
                          {order.providerOrderId && (
                            <div className="text-xs text-muted-foreground">
                              ID: {order.providerOrderId}
                            </div>
                          )}
                        </td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 text-sm">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order._id ? null : order._id
                              )
                            }
                          >
                            {expandedOrder === order._id ? "Hide" : "Details"}
                          </Button>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr key={`${order._id}-details`}>
                          <td colSpan={9} className="p-4 bg-muted/50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Request ID:</strong> {order.requestId}
                              </div>
                              <div>
                                <strong>Target URL:</strong>{" "}
                                <a
                                  href={order.targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-600 hover:underline"
                                >
                                  {order.targetUrl}
                                </a>
                              </div>
                              {order.failureReason && (
                                <div className="col-span-2">
                                  <strong>Failure Reason:</strong>{" "}
                                  <span className="text-red-600">{order.failureReason}</span>
                                </div>
                              )}
                              {order.providerResponse && (
                                <div className="col-span-2">
                                  <strong>Provider Response:</strong>
                                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                                    {JSON.stringify(order.providerResponse, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
