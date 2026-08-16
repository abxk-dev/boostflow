"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Package, ExternalLink } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"

interface Order {
  _id: string
  status: string
  quantity: number
  targetUrl: string
  createdAt: string
  completedAt?: string
  serviceId: { name: string; description: string }
  platformId: { name: string; slug: string }
  providerOrderId?: string
  failureReason?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/orders?page=${page}&limit=10`)
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
  }, [page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="success">Delivered</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "ORDER_QUEUED":
        return <Badge variant="warning">Queued</Badge>
      case "PROVIDER_DISPATCHED":
        return <Badge variant="warning">In Progress</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track all your orders and their status</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by browsing our services and placing your first order
            </p>
            <Link href="/services">
              <Button className="gradient-bg text-white">
                Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{order.serviceId?.name}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.platformId?.name} • x{order.quantity}
                    </p>
                    <a
                      href={order.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-violet-600 hover:underline flex items-center gap-1"
                    >
                      {order.targetUrl.length > 50
                        ? order.targetUrl.slice(0, 50) + "..."
                        : order.targetUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    {order.providerOrderId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Provider ID: {order.providerOrderId}
                      </p>
                    )}
                    {order.failureReason && (
                      <p className="text-xs text-red-600 mt-1">{order.failureReason}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
