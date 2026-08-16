"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash, Save, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Platform {
  _id: string
  name: string
  slug: string
}

interface Service {
  _id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  isFreeTier: boolean
  dailyFreeLimit: number
  isActive: boolean
  sortOrder: number
  platformId: Platform
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    platformId: "",
    name: "",
    description: "",
    minQuantity: 100,
    maxQuantity: 10000,
    isFreeTier: true,
    dailyFreeLimit: 3,
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [servicesRes, platformsRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/platforms"),
      ])

      const servicesData = await servicesRes.json()
      const platformsData = await platformsRes.json()

      if (servicesData.success) setServices(servicesData.data)
      if (platformsData.success) setPlatforms(platformsData.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const url = editingService ? "/api/admin/services" : "/api/admin/services"
      const method = editingService ? "PUT" : "POST"
      const body = editingService
        ? { id: editingService._id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingService ? "Service updated" : "Service created",
        })
        setIsDialogOpen(false)
        setEditingService(null)
        resetForm()
        fetchData()
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
        description: "Failed to save service",
        variant: "destructive",
      })
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: serviceId, isActive: !isActive }),
      })

      const data = await response.json()

      if (data.success) {
        setServices(
          services.map((s) =>
            s._id === serviceId ? { ...s, isActive: !isActive } : s
          )
        )
        toast({
          title: "Success",
          description: `Service ${isActive ? "disabled" : "enabled"}`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      platformId: "",
      name: "",
      description: "",
      minQuantity: 100,
      maxQuantity: 10000,
      isFreeTier: true,
      dailyFreeLimit: 3,
      isActive: true,
      sortOrder: 0,
    })
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      platformId: service.platformId._id,
      name: service.name,
      description: service.description,
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      isFreeTier: service.isFreeTier,
      dailyFreeLimit: service.dailyFreeLimit,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage available services</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingService(null) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update service details" : "Create a new service"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platformId}
                  onValueChange={(value) => setFormData({ ...formData, platformId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Instagram Followers"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Quantity</Label>
                  <Input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Free Limit</Label>
                  <Input
                    type="number"
                    value={formData.dailyFreeLimit}
                    onChange={(e) => setFormData({ ...formData, dailyFreeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {editingService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Platform</th>
                  <th className="text-left p-4 font-medium">Quantity</th>
                  <th className="text-left p-4 font-medium">Free Tier</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
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
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {service.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{service.platformId?.name}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {service.minQuantity} - {service.maxQuantity.toLocaleString()}
                      </td>
                      <td className="p-4">
                        {service.isFreeTier ? (
                          <Badge variant="success">Yes ({service.dailyFreeLimit}/day)</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={service.isActive ? "success" : "destructive"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleServiceStatus(service._id, service.isActive)}
                          >
                            {service.isActive ? (
                              <X className="h-4 w-4 text-red-600" />
                            ) : (
                              <Save className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
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
