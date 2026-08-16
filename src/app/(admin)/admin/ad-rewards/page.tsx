"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Gift } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface AdReward {
  _id: string
  rewardToken: string
  isUsed: boolean
  usedAt?: string
  expiresAt: string
  createdAt: string
  userId: { email: string; username: string }
  serviceId: { name: string }
}

export default function AdminAdRewardsPage() {
  const [rewards, setRewards] = useState<AdReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchRewards() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/ad-rewards?page=${page}&limit=50`)
        const data = await response.json()

        if (data.success) {
          setRewards(data.data.rewards)
          setTotalPages(data.data.pagination.pages)
        }
      } catch (error) {
        console.error("Failed to fetch ad rewards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRewards()
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ad Rewards</h1>
        <p className="text-muted-foreground">Monitor ad reward tokens and usage</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Token</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Expires</th>
                  <th className="text-left p-4 font-medium">Created</th>
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
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No ad rewards found</p>
                    </td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {reward.rewardToken.slice(0, 16)}...
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{reward.userId?.username}</div>
                        <div className="text-xs text-muted-foreground">{reward.userId?.email}</div>
                      </td>
                      <td className="p-4 text-sm">{reward.serviceId?.name}</td>
                      <td className="p-4">
                        <Badge variant={reward.isUsed ? "secondary" : "success"}>
                          {reward.isUsed ? "Used" : "Active"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">{formatDateTime(reward.expiresAt)}</td>
                      <td className="p-4 text-sm">{formatDateTime(reward.createdAt)}</td>
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
