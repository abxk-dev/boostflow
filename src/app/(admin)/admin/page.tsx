"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  Users,
  Layers,
  Server,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Stats {
  overview: {
    totalOrders: number
    todayOrders: number
    weekOrders: number
    monthOrders: number
    totalUsers: number
    activeServices: number
    activeProviders: number
    avgLatencyMs: number
  }
  statusBreakdown: Record<string, number>
  recentOrders: Array<{
    _id: string
    status: string
    quantity: number
    createdAt: string
    userId: { email: string; username: string }
    serviceId: { name: string }
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="success">Delivered</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "ORDER_QUEUED":
      case "PROVIDER_DISPATCHED":
        return <Badge variant="warning">Processing</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.totalOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Today</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.todayOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Users</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.totalUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Avg Latency</span>
                </div>
                <div className="text-3xl font-bold">
                  {Math.round(stats?.overview.avgLatencyMs || 0)}ms
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Services</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.activeServices || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm">Providers</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.activeProviders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">This Week</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.weekOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">This Month</span>
                </div>
                <div className="text-3xl font-bold">{stats?.overview.monthOrders || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
          <CardDescription>Current distribution of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">{status}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{order.serviceId?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.userId?.username} ({order.userId?.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">x{order.quantity}</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
