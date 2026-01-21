"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

type ProfilePayload = {
  name: string
  email: string
  phoneNo: string
  address: string
}

export default function CustomerProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()

  const startInEditMode = useMemo(() => searchParams.get("edit") === "1", [searchParams])
  const [isEditing, setIsEditing] = useState(startInEditMode)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [initial, setInitial] = useState<ProfilePayload>({
    name: user?.name || "",
    email: user?.email || "",
    phoneNo: user?.phoneNo || "",
    address: "",
  })

  const [form, setForm] = useState<ProfilePayload>(initial)

  useEffect(() => {
    setIsEditing(startInEditMode)
  }, [startInEditMode])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/users/profile")
        const data = await res.json()
        if (!data?.success || !data?.data) {
          throw new Error(data?.message || "Failed to load profile")
        }

        const next: ProfilePayload = {
          name: data.data.name || "",
          email: data.data.email || "",
          phoneNo: data.data.phoneNo || "",
          address: data.data.address || "",
        }
        setInitial(next)
        setForm(next)
      } catch (e: any) {
        toast.error(e?.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCancel = () => {
    setForm(initial)
    setIsEditing(false)
    router.replace("/customer/profile")
  }

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phoneNo: form.phoneNo,
          address: form.address,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save profile")
      }

      const next: ProfilePayload = {
        name: data.data?.name || form.name,
        email: data.data?.email || form.email,
        phoneNo: data.data?.phoneNo || form.phoneNo,
        address: data.data?.address || form.address,
      }

      setInitial(next)
      setForm(next)
      setIsEditing(false)
      router.replace("/customer/profile")
      await refreshUser()
      toast.success("Profile updated")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and update your personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isEditing ? "Update your details, then save or cancel." : "Your saved customer information."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    disabled={!isEditing}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    readOnly
                    disabled={!isEditing}
                    className="cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone</Label>
                  <Input
                    id="phoneNo"
                    value={form.phoneNo}
                    disabled={!isEditing}
                    onChange={(e) => setForm((p) => ({ ...p, phoneNo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  disabled={!isEditing}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}