"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Settings, Shield, Bell, Database } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast({
      title: "Success",
      description: "Settings saved successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure platform settings</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input defaultValue="BoostFlow" />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input defaultValue="support@boostflow.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platform URL</Label>
              <Input defaultValue="https://boostflow.com" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Rate limiting and abuse prevention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Orders per minute (per user)</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Registrations per hour (per IP)</Label>
                <Input type="number" defaultValue="3" />
              </div>
              <div className="space-y-2">
                <Label>Reward claims per minute</Label>
                <Input type="number" defaultValue="10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reward Token TTL (seconds)</Label>
                <Input type="number" defaultValue="120" />
              </div>
              <div className="space-y-2">
                <Label>Max Failed Login Attempts</Label>
                <Input type="number" defaultValue="5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure alerts and notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alert Email</Label>
                <Input defaultValue="alerts@boostflow.com" />
              </div>
              <div className="space-y-2">
                <Label>Fraud Alert Threshold</Label>
                <Input type="number" defaultValue="10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Provider Settings</CardTitle>
                <CardDescription>Default provider configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Default Timeout (ms)</Label>
                <Input type="number" defaultValue="10000" />
              </div>
              <div className="space-y-2">
                <Label>Default Max Retries</Label>
                <Input type="number" defaultValue="2" />
              </div>
              <div className="space-y-2">
                <Label>Retry Backoff (ms)</Label>
                <Input type="number" defaultValue="1000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
