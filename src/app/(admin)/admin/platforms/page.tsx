"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Save, X, Globe } from "lucide-react"
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

interface Platform {
  _id: string
  name: string
  slug: string
  icon: string
  urlPattern: string
  isActive: boolean
  sortOrder: number
}

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    urlPattern: "",
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    fetchPlatforms()
  }, [])

  async function fetchPlatforms() {
    try {
      const response = await fetch("/api/platforms")
      const data = await response.json()
      if (data.success) setPlatforms(data.data)
    } catch (error) {
      console.error("Failed to fetch platforms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/admin/platforms", {
        method: editingPlatform ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingPlatform ? { id: editingPlatform._id, ...formData } : formData
        ),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingPlatform ? "Platform updated" : "Platform created",
        })
        setIsDialogOpen(false)
        setEditingPlatform(null)
        resetForm()
        fetchPlatforms()
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
        description: "Failed to save platform",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      icon: "",
      urlPattern: "",
      isActive: true,
      sortOrder: 0,
    })
  }

  const openEditDialog = (platform: Platform) => {
    setEditingPlatform(platform)
    setFormData({
      name: platform.name,
      slug: platform.slug,
      icon: platform.icon,
      urlPattern: platform.urlPattern,
      isActive: platform.isActive,
      sortOrder: platform.sortOrder,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platforms</h1>
          <p className="text-muted-foreground">Manage supported platforms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPlatform(null) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlatform ? "Edit Platform" : "Add Platform"}</DialogTitle>
              <DialogDescription>
                {editingPlatform ? "Update platform details" : "Add a new platform"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Instagram"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., instagram"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., instagram"
                />
              </div>
              <div className="space-y-2">
                <Label>URL Pattern (Regex)</Label>
                <Input
                  value={formData.urlPattern}
                  onChange={(e) => setFormData({ ...formData, urlPattern: e.target.value })}
                  placeholder="^https?:\/\/(www\.)?instagram\.com\/..."
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {editingPlatform ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Platforms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : platforms.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center py-12">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No platforms found</p>
            </CardContent>
          </Card>
        ) : (
          platforms.map((platform) => (
            <Card key={platform._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-violet-600" />
                  </div>
                  <Badge variant={platform.isActive ? "success" : "destructive"}>
                    {platform.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{platform.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">/{platform.slug}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {platform.urlPattern}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(platform)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
