"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Link2, Edit, Save, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProviderService {
  _id: string
  externalServiceId: string
  costPerUnit: number
  isActive: boolean
  priority: number
  minQuantity: number
  maxQuantity: number
  createdAt: string
  providerId: { _id: string; name: string }
  serviceId: { _id: string; name: string }
}

export default function AdminProviderServicesPage() {
  const [providerServices, setProviderServices] = useState<ProviderService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProviderService | null>(null)
  const [formData, setFormData] = useState({
    externalServiceId: "",
    costPerUnit: 0,
    priority: 0,
    minQuantity: 1,
    maxQuantity: 1000,
  })

  useEffect(() => {
    fetchProviderServices()
  }, [])

  async function fetchProviderServices() {
    try {
      const response = await fetch("/api/admin/provider-services")
      const data = await response.json()
      if (data.success) setProviderServices(data.data)
    } catch (error) {
      console.error("Failed to fetch provider services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function syncPrices() {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/admin/provider-services/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Prices Synced",
          description: `${data.data.updated} price(s) updated from ${data.data.totalRemote} remote services`,
        })
        fetchProviderServices()
      } else {
        toast({
          title: "Sync Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Sync Failed",
        description: "Could not connect to provider",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const openEditDialog = (ps: ProviderService) => {
    setEditing(ps)
    setFormData({
      externalServiceId: ps.externalServiceId,
      costPerUnit: ps.costPerUnit,
      priority: ps.priority,
      minQuantity: ps.minQuantity,
      maxQuantity: ps.maxQuantity,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return

    try {
      const response = await fetch("/api/admin/provider-services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing._id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Provider service updated",
        })
        setIsDialogOpen(false)
        setEditing(null)
        fetchProviderServices()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Services</h1>
          <p className="text-muted-foreground">Manage provider-service mappings and costs</p>
        </div>
        <Button onClick={syncPrices} disabled={isSyncing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Prices from Provider"}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider Service</DialogTitle>
            <DialogDescription>
              {editing?.providerId?.name} → {editing?.serviceId?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>External Service ID (smmlite.com)</Label>
              <Input
                value={formData.externalServiceId}
                onChange={(e) => setFormData({ ...formData, externalServiceId: e.target.value })}
                placeholder="e.g. 7460"
              />
            </div>
            <div className="space-y-2">
              <Label>Cost Per 1000 ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Qty</Label>
                <Input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Qty</Label>
                <Input
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">External ID</th>
                  <th className="text-left p-4 font-medium">Cost/1000</th>
                  <th className="text-left p-4 font-medium">Quantity Range</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : providerServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No provider services found</p>
                    </td>
                  </tr>
                ) : (
                  providerServices.map((ps) => (
                    <tr key={ps._id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{ps.providerId?.name}</td>
                      <td className="p-4">{ps.serviceId?.name}</td>
                      <td className="p-4 font-mono text-sm">{ps.externalServiceId}</td>
                      <td className="p-4">
                        <span className={ps.costPerUnit > 0 ? "font-semibold text-emerald-600" : "text-muted-foreground"}>
                          ${ps.costPerUnit.toFixed(2)}/1k
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {ps.minQuantity} - {ps.maxQuantity.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{ps.priority}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={ps.isActive ? "success" : "destructive"}>
                          {ps.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(ps)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
