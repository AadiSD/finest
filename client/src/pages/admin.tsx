import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield } from "lucide-react";

export default function Admin() {
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem("fh_admin_token")
  );

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      if (!adminToken) return [];
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Basic ${adminToken}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: !!adminToken,
  });

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", {
        username: adminUser,
        password: adminPass,
      });
      await res.json();
      const token = btoa(`${adminUser}:${adminPass}`);
      localStorage.setItem("fh_admin_token", token);
      setAdminToken(token);
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const res = await fetch(`/api/bookings/${id}/${status}` as string, {
        method: "POST",
        headers: { Authorization: `Basic ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/blocked-dates"] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("fh_admin_token");
    setAdminToken(null);
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold">Admin Login</h1>
            </div>

            {!adminToken ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                  Sign in to manage booking requests and block dates.
                </div>
                <div className="space-y-3">
                  <Input placeholder="Admin Username" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
                  <Input placeholder="Admin Password" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
                  <Button onClick={() => adminLoginMutation.mutate()} disabled={adminLoginMutation.isPending}>
                    {adminLoginMutation.isPending ? "Signing in..." : "Login"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Booking Requests</h2>
                  <div className="flex items-center gap-3">
                    <Badge>Admin</Badge>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
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
                          <p className="font-medium">{b.name} • {b.eventType}</p>
                          <p className="text-sm text-muted-foreground">
                            {b.date} • {b.location} • {b.guests} guests • {b.decor}
                          </p>
                          <p className="text-sm text-muted-foreground">{b.email}</p>
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
                          {b.status}
                        </Badge>
                      </div>
                      {b.status === "pending" && (
                        <div className="mt-3 flex gap-3">
                          <Button onClick={() => updateBookingStatus.mutate({ id: b.id, status: "accepted" })}>
                            Accept
                          </Button>
                          <Button variant="outline" onClick={() => updateBookingStatus.mutate({ id: b.id, status: "rejected" })}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
