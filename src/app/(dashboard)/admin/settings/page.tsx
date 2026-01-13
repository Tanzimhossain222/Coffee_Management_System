"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Bell, Lock, Moon, Palette, Shield, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [notifications, setNotifications] = useState({
        orderAlerts: true,
        lowStockAlerts: true,
        reviewAlerts: false,
        emailNotifications: true,
    })

    const [appearance, setAppearance] = useState({
        darkMode: false,
        compactMode: false,
    })

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleProfileSave = async () => {
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoading(false)
        toast.success("Profile updated successfully")
    }

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoading(false)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        toast.success("Password changed successfully")
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Alerts</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Theme</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your account profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="" alt={user?.name || "User"} />
                                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                        {user?.name ? getInitials(user.name) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" size="sm">
                                        Change Avatar
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or GIF. Max 2MB
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profileForm.name}
                                        onChange={(e) =>
                                            setProfileForm({ ...profileForm, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) =>
                                            setProfileForm({ ...profileForm, email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleProfileSave} disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handlePasswordChange} disabled={isLoading}>
                                    {isLoading ? "Updating..." : "Update Password"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Configure how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Order Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when new orders are placed
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.orderAlerts}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, orderAlerts: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Low Stock Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when inventory is running low
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.lowStockAlerts}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, lowStockAlerts: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Review Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when customers leave reviews
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.reviewAlerts}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, reviewAlerts: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.emailNotifications}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, emailNotifications: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        Dark Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable dark mode for the dashboard
                                    </p>
                                </div>
                                <Switch
                                    checked={appearance.darkMode}
                                    onCheckedChange={(checked) =>
                                        setAppearance({ ...appearance, darkMode: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Compact Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Use smaller spacing and fonts
                                    </p>
                                </div>
                                <Switch
                                    checked={appearance.compactMode}
                                    onCheckedChange={(checked) =>
                                        setAppearance({ ...appearance, compactMode: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
