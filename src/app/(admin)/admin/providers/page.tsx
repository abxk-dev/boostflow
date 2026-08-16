"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Save, X, Server, Wallet, RefreshCw } from "lucide-react"
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

interface Provider {
  _id: string
  name: string
  apiUrl: string
  apiKey: string
  isActive: boolean
  priority: number
  timeoutMs: number
  maxRetries: number
  createdAt: string
}

interface ProviderBalance {
  balance: string
  currency: string
  providerName: string
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [balances, setBalances] = useState<Record<string, ProviderBalance>>({})
  const [loadingBalance, setLoadingBalance] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
    apiSecret: "",
    isActive: true,
    priority: 0,
    timeoutMs: 10000,
    maxRetries: 2,
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  async function fetchProviders() {
    try {
      const response = await fetch("/api/admin/providers")
      const data = await response.json()
      if (data.success) setProviders(data.data)
    } catch (error) {
      console.error("Failed to fetch providers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchBalance(providerId: string) {
    setLoadingBalance((prev) => ({ ...prev, [providerId]: true }))
    try {
      const response = await fetch("/api/admin/providers/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      })
      const data = await response.json()
      if (data.success) {
        setBalances((prev) => ({ ...prev, [providerId]: data.data }))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch balance",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive",
      })
    } finally {
      setLoadingBalance((prev) => ({ ...prev, [providerId]: false }))
    }
  }

  const handleSubmit = async () => {
    try {
      const url = "/api/admin/providers"
      const method = editingProvider ? "PUT" : "POST"
      const body = editingProvider
        ? { id: editingProvider._id, ...formData }
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
          description: editingProvider ? "Provider updated" : "Provider created",
        })
        setIsDialogOpen(false)
        setEditingProvider(null)
        resetForm()
        fetchProviders()
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
        description: "Failed to save provider",
        variant: "destructive",
      })
    }
  }

  const toggleProviderStatus = async (providerId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: providerId, isActive: !isActive }),
      })

      const data = await response.json()

      if (data.success) {
        setProviders(
          providers.map((p) =>
            p._id === providerId ? { ...p, isActive: !isActive } : p
          )
        )
        toast({
          title: "Success",
          description: `Provider ${isActive ? "disabled" : "enabled"}`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update provider",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      apiUrl: "",
      apiKey: "",
      apiSecret: "",
      isActive: true,
      priority: 0,
      timeoutMs: 10000,
      maxRetries: 2,
    })
  }

  const openEditDialog = (provider: Provider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name,
      apiUrl: provider.apiUrl,
      apiKey: "",
      apiSecret: "",
      isActive: provider.isActive,
      priority: provider.priority,
      timeoutMs: provider.timeoutMs,
      maxRetries: provider.maxRetries,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Providers</h1>
          <p className="text-muted-foreground">Manage service providers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProvider(null) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProvider ? "Edit Provider" : "Add Provider"}</DialogTitle>
              <DialogDescription>
                {editingProvider ? "Update provider details" : "Add a new provider"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Provider name"
                />
              </div>
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder="https://api.provider.com/v1/order"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={editingProvider ? "Leave empty to keep current" : "Enter API key"}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={formData.timeoutMs}
                    onChange={(e) => setFormData({ ...formData, timeoutMs: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Input
                    type="number"
                    value={formData.maxRetries}
                    onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {editingProvider ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Providers List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">API URL</th>
                  <th className="text-left p-4 font-medium">Balance</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Config</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : providers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No providers found
                    </td>
                  </tr>
                ) : (
                  providers.map((provider) => (
                    <tr key={provider._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{provider.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">
                        {provider.apiUrl}
                      </td>
                      <td className="p-4">
                        {balances[provider._id] ? (
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-emerald-500" />
                            <span className="font-semibold text-emerald-600">
                              ${parseFloat(balances[provider._id].balance).toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {balances[provider._id].currency}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchBalance(provider._id)}
                            disabled={loadingBalance[provider._id]}
                            className="text-xs"
                          >
                            {loadingBalance[provider._id] ? (
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Wallet className="h-3 w-3 mr-1" />
                            )}
                            Check Balance
                          </Button>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{provider.priority}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {provider.timeoutMs}ms / {provider.maxRetries} retries
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={provider.isActive ? "success" : "destructive"}>
                            {provider.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {(!provider.apiKey || provider.apiKey === "REPLACE_WITH_YOUR_KEY") && (
                            <span className="text-xs text-red-500 font-medium">⚠ API key not set</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(provider)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProviderStatus(provider._id, provider.isActive)}
                          >
                            {provider.isActive ? (
                              <X className="h-4 w-4 text-red-600" />
                            ) : (
                              <Save className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchBalance(provider._id)}
                            disabled={loadingBalance[provider._id]}
                            title="Refresh balance"
                          >
                            <RefreshCw className={`h-4 w-4 ${loadingBalance[provider._id] ? "animate-spin" : ""}`} />
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
