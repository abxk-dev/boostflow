"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Zap,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderStats {
  total: number
  active: number
  completed: number
  failed: number
}

interface RecentOrder {
  _id: string
  status: string
  targetUrl: string
  quantity: number
  createdAt: string
  serviceId: { name: string }
  platformId: { name: string; icon: string }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/orders?limit=5")
        const data = await response.json()

        if (data.success) {
          const orders = data.data.orders
          setRecentOrders(orders)
          setStats({
            total: data.data.pagination.total,
            active: orders.filter((o: RecentOrder) =>
              ["ORDER_QUEUED", "PROVIDER_DISPATCHED"].includes(o.status)
            ).length,
            completed: orders.filter((o: RecentOrder) => o.status === "DELIVERED").length,
            failed: orders.filter((o: RecentOrder) => o.status === "FAILED").length,
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your account activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Active</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{stats?.active || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Failed</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats?.failed || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-violet-200 dark:border-violet-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>New Order</CardTitle>
                <CardDescription>Boost your social media presence</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Choose from our catalog of services and get free followers, likes, views, and more.
            </p>
            <Link href="/services">
              <Button className="gradient-bg text-white">
                Browse Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track all your orders</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed status of all your orders and track delivery progress.
            </p>
            <Link href="/dashboard/orders">
              <Button variant="outline">
                View Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest orders</CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
              <p className="text-sm">Start by browsing our services</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {order.serviceId?.name || "Service"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.targetUrl}
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
