"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Branch } from "@/types"
import { useEffect, useState } from "react"

interface BranchFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    branch?: Branch | null
    onSubmit: (data: Partial<Branch>) => Promise<void>
    isLoading?: boolean
}

export function BranchFormDialog({
    open,
    onOpenChange,
    branch,
    onSubmit,
    isLoading,
}: BranchFormDialogProps) {
    const [formData, setFormData] = useState<Partial<Branch>>({
        name: "",
        address: "",
        city: "",
        phoneNo: "",
        email: "",
        openingTime: "07:00",
        closingTime: "21:00",
        isActive: true,
    })

    const isEditing = !!branch

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                city: branch.city,
                phoneNo: branch.phoneNo || "",
                email: branch.email || "",
                openingTime: branch.openingTime || "07:00",
                closingTime: branch.closingTime || "21:00",
                isActive: branch.isActive,
            })
        } else {
            setFormData({
                name: "",
                address: "",
                city: "",
                phoneNo: "",
                email: "",
                openingTime: "07:00",
                closingTime: "21:00",
                isActive: true,
            })
        }
    }, [branch, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the branch information below."
                            : "Fill in the details to create a new branch."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Branch Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Downtown Coffee Hub"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="123 Main Street"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) =>
                                    setFormData({ ...formData, city: e.target.value })
                                }
                                placeholder="New York"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phoneNo">Phone</Label>
                                <Input
                                    id="phoneNo"
                                    value={formData.phoneNo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNo: e.target.value })
                                    }
                                    placeholder="+1 (212) 555-0100"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="branch@coffeehub.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="openingTime">Opening Time</Label>
                                <Input
                                    id="openingTime"
                                    type="time"
                                    value={formData.openingTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, openingTime: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="closingTime">Closing Time</Label>
                                <Input
                                    id="closingTime"
                                    type="time"
                                    value={formData.closingTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, closingTime: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable or disable this branch
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isActive: checked })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? isEditing
                                    ? "Saving..."
                                    : "Creating..."
                                : isEditing
                                  ? "Save Changes"
                                  : "Create Branch"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
