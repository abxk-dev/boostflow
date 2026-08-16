"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp, Users, Package } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalOrders: number
    todayOrders: number
    weekOrders: number
    monthOrders: number
    totalUsers: number
    avgLatencyMs: number
  }
  statusBreakdown: Record<string, number>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/admin/stats")
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const deliveryRate = data?.statusBreakdown
    ? ((data.statusBreakdown.DELIVERED || 0) /
        Math.max(
          1,
          Object.values(data.statusBreakdown).reduce((a, b) => a + b, 0)
        ) *
        100).toFixed(1)
    : "0"

  const failureRate = data?.statusBreakdown
    ? ((data.statusBreakdown.FAILED || 0) /
        Math.max(
          1,
          Object.values(data.statusBreakdown).reduce((a, b) => a + b, 0)
        ) *
        100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance metrics</p>
      </div>

      {/* Overview Cards */}
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
                <div className="text-3xl font-bold">{data?.overview.totalOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total Users</span>
                </div>
                <div className="text-3xl font-bold">{data?.overview.totalUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Delivery Rate</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{deliveryRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Avg Latency</span>
                </div>
                <div className="text-3xl font-bold">
                  {Math.round(data?.overview.avgLatencyMs || 0)}ms
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Time-based Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today</CardTitle>
            <CardDescription>Orders placed today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.overview.todayOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
            <CardDescription>Orders in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.overview.weekOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
            <CardDescription>Orders this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.overview.monthOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Breakdown of all order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data?.statusBreakdown || {}).map(([status, count]) => {
                const total = Object.values(data?.statusBreakdown || {}).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0"

                return (
                  <div key={status} className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">{status}</div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
