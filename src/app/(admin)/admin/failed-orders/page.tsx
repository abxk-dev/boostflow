"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, XCircle, RefreshCw } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Order {
  _id: string
  requestId: string
  status: string
  quantity: number
  targetUrl: string
  failureReason?: string
  retryCount: number
  createdAt: string
  failedAt?: string
  userId: { email: string; username: string }
  serviceId: { name: string }
  providerId?: { name: string }
}

export default function AdminFailedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/orders?status=FAILED&page=${page}&limit=20`)
        const data = await response.json()

        if (data.success) {
          setOrders(data.data.orders)
          setTotalPages(data.data.pagination.pages)
        }
      } catch (error) {
        console.error("Failed to fetch failed orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Failed Orders</h1>
        <p className="text-muted-foreground">Monitor and investigate failed orders</p>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">Reason</th>
                  <th className="text-left p-4 font-medium">Retries</th>
                  <th className="text-left p-4 font-medium">Failed At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No failed orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-xs">{order.requestId.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{order.userId?.username}</div>
                        <div className="text-xs text-muted-foreground">{order.userId?.email}</div>
                      </td>
                      <td className="p-4 text-sm">{order.serviceId?.name}</td>
                      <td className="p-4 text-sm">{order.providerId?.name || "-"}</td>
                      <td className="p-4">
                        <div className="text-sm text-red-600 max-w-[200px] truncate">
                          {order.failureReason || "Unknown"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          {order.retryCount}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {order.failedAt ? formatDateTime(order.failedAt) : "-"}
                      </td>
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
