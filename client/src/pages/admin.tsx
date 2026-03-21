import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminBooking = {
  id: string;
  name: string;
  email: string;
  eventType: string;
  guests: number;
  location: string;
  decor: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
  estimatedBudget?: number | null;
  finalBudget?: number | null;
  currency?: string | null;
  modelVersion?: string | null;
};

type AdminSession = {
  authenticated: true;
  username: string;
  role: "super_admin" | "admin";
};

type AdminAccount = {
  id: string;
  username: string;
  role: "super_admin" | "admin";
  isDefault: boolean;
  createdAt: string;
};

async function adminFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
  });

  if (!res.ok) {
    const message = (await res.text()) || "Request failed";
    throw new Error(message);
  }

  return res;
}

export default function Admin() {
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [finalBudgetInputs, setFinalBudgetInputs] = useState<Record<string, string>>({});

  const cleanText = (value: unknown) => {
    if (value == null) return "";
    return String(value).replace(/[`*_>#•]/g, "").replace(/\s+/g, " ").trim();
  };

  const { data: adminSession, isLoading: isSessionLoading } = useQuery<AdminSession | null>({
    queryKey: ["admin-session"],
    queryFn: async () => {
      const res = await fetch("/api/admin/session", {
        credentials: "include",
      });
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch admin session");
      }
      return res.json();
    },
    retry: false,
  });

  const { data: bookings = [] } = useQuery<AdminBooking[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await adminFetch("/api/bookings");
      return res.json();
    },
    enabled: !!adminSession?.authenticated,
    retry: false,
  });

  const { data: admins = [] } = useQuery<AdminAccount[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await adminFetch("/api/admins");
      return res.json();
    },
    enabled: adminSession?.role === "super_admin",
    retry: false,
  });

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", {
        username: adminUser,
        password: adminPass,
      });
      return res.json();
    },
    onSuccess: async () => {
      setAdminPass("");
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Admin logged in",
        description: "You can now manage booking requests.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout");
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Logged out",
        description: "Admin session ended.",
      });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newAdminUser,
          password: newAdminPass,
        }),
      });
      return res.json();
    },
    onSuccess: async () => {
      setNewAdminUser("");
      setNewAdminPass("");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Admin created",
        description: "The new admin can now log in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not create admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admins/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Admin deleted",
        description: "The admin account was removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not delete admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFinalBudget = useMutation({
    mutationFn: async ({ id, finalBudget }: { id: string; finalBudget: number }) => {
      const res = await adminFetch(`/api/bookings/${id}/final-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ finalBudget }),
      });
      return res.json();
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setFinalBudgetInputs((prev) => ({ ...prev, [variables.id]: "" }));
      toast({
        title: "Final budget saved",
        description: "This booking can now be used as training data.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save final budget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const res = await adminFetch(`/api/bookings/${id}/${status}`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/blocked-dates"] });
      toast({
        title: "Booking updated",
        description: "The request status was saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not update booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = async () => {
    try {
      const res = await adminFetch("/api/estimates/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "estimates.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "Export ready",
        description: "The estimates CSV download has started.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Could not export estimates.",
        variant: "destructive",
      });
    }
  };

  const isMutating =
    adminLoginMutation.isPending ||
    logoutMutation.isPending ||
    createAdminMutation.isPending ||
    deleteAdminMutation.isPending ||
    updateBookingStatus.isPending ||
    updateFinalBudget.isPending;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-10 space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold">Admin Login</h1>
            </div>

            {isSessionLoading ? (
              <p className="text-sm text-muted-foreground">Checking admin session...</p>
            ) : !adminSession?.authenticated ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                  Sign in to manage booking requests and admin users.
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Admin Username"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                  />
                  <Input
                    placeholder="Admin Password"
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                  <Button
                    onClick={() => adminLoginMutation.mutate()}
                    disabled={adminLoginMutation.isPending || !adminUser.trim() || !adminPass.trim()}
                  >
                    {adminLoginMutation.isPending ? "Signing in..." : "Login"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Booking Requests</h2>
                    <p className="text-sm text-muted-foreground">
                      Signed in as {cleanText(adminSession.username)} • {cleanText(adminSession.role)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{adminSession.role === "super_admin" ? "Super Admin" : "Admin"}</Badge>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={isMutating}>
                      Export Estimates
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No booking requests yet.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cleanText(b.name)} • {cleanText(b.eventType)}</p>
                          <p className="text-sm text-muted-foreground">
                            {cleanText(b.date)} • {cleanText(b.location)} • {cleanText(b.guests)} guests • {cleanText(b.decor)}
                          </p>
                          {b.estimatedBudget != null && (
                            <p className="text-sm text-muted-foreground">
                              Estimated: {cleanText(b.currency || "INR")} {cleanText(b.estimatedBudget)}
                              {b.modelVersion ? ` • ${cleanText(b.modelVersion)}` : ""}
                            </p>
                          )}
                          {b.finalBudget != null && (
                            <p className="text-sm text-muted-foreground">
                              Final: {cleanText(b.currency || "INR")} {cleanText(b.finalBudget)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">{cleanText(b.email)}</p>
                        </div>
                        <Badge
                          className={
                            b.status === "accepted"
                              ? "bg-green-600 text-white"
                              : b.status === "rejected"
                              ? "bg-red-600 text-white"
                              : "bg-amber-500 text-white"
                          }
                        >
                          {cleanText(b.status)}
                        </Badge>
                      </div>
                      {b.status === "pending" && (
                        <div className="mt-3 flex gap-3">
                          <Button
                            onClick={() => updateBookingStatus.mutate({ id: b.id, status: "accepted" })}
                            disabled={updateBookingStatus.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateBookingStatus.mutate({ id: b.id, status: "rejected" })}
                            disabled={updateBookingStatus.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      <div className="mt-4 grid md:grid-cols-[1fr_auto] gap-3">
                        <Input
                          placeholder="Final budget (INR)"
                          value={finalBudgetInputs[b.id] ?? ""}
                          onChange={(e) =>
                            setFinalBudgetInputs((prev) => ({ ...prev, [b.id]: e.target.value }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const value = Number.parseInt(finalBudgetInputs[b.id] ?? "", 10);
                            if (!Number.isNaN(value) && value > 0) {
                              updateFinalBudget.mutate({ id: b.id, finalBudget: value });
                            }
                          }}
                          disabled={updateFinalBudget.isPending}
                        >
                          Save Final Budget
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {adminSession?.role === "super_admin" && (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Admin Management</h2>
                  <p className="text-sm text-muted-foreground">
                    The default admin is the only super admin. New accounts are standard admins.
                  </p>
                </div>
                <Badge>Super Admin Only</Badge>
              </div>

              <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
                <Input
                  placeholder="New admin username"
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                />
                <Input
                  placeholder="New admin password"
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                />
                <Button
                  onClick={() => createAdminMutation.mutate()}
                  disabled={createAdminMutation.isPending || !newAdminUser.trim() || newAdminPass.length < 6}
                >
                  {createAdminMutation.isPending ? "Adding..." : "Add Admin"}
                </Button>
              </div>

              <div className="space-y-3">
                {admins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No admin accounts found.</p>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{cleanText(admin.username)}</p>
                        <p className="text-sm text-muted-foreground">
                          {cleanText(admin.role)}{admin.isDefault ? " • default account" : ""}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => deleteAdminMutation.mutate(admin.id)}
                        disabled={deleteAdminMutation.isPending || admin.isDefault || admin.role === "super_admin"}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
