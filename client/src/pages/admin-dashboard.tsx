import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LogOut, Plus, Edit, Trash2, Mail, Calendar, Users } from "lucide-react";
import type { Event, Inquiry, InsertEvent } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEventSchema } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You need admin access to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 500);
    }
  }, [authLoading, isAdmin, toast, setLocation]);

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAdmin,
  });

  const { data: inquiries = [] } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
    enabled: isAdmin,
  });

  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      location: "",
      eventDate: "",
      guestCount: 0,
      isFeatured: false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/featured"] });
      toast({
        title: "Event Created",
        description: "The event has been added successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingEvent(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertEvent }) => {
      return await apiRequest("PATCH", `/api/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/featured"] });
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingEvent(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/featured"] });
      toast({
        title: "Event Deleted",
        description: "The event has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const markInquiryReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/inquiries/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to mark inquiry as read",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEvent) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      category: event.category,
      imageUrl: event.imageUrl,
      location: event.location || "",
      eventDate: event.eventDate || "",
      guestCount: event.guestCount || 0,
      isFeatured: event.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    form.reset({
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      location: "",
      eventDate: "",
      guestCount: 0,
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const unreadInquiries = inquiries.filter(i => !i.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName || user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-testid="button-view-site">
              <Link href="/">View Site</Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-logout">
              <a href="/api/logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <Card data-testid="card-stat-total-events">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-inquiries">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadInquiries}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-featured">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Events</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.filter(e => e.isFeatured).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="events" className="w-full">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
              <TabsTrigger value="inquiries" data-testid="tab-inquiries">
                Inquiries
                {unreadInquiries > 0 && (
                  <Badge className="ml-2" variant="destructive">{unreadInquiries}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle>Event Management</CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNew} data-testid="button-add-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-event-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="min-h-[100px]" data-testid="textarea-event-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-event-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Wedding">Wedding</SelectItem>
                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                    <SelectItem value="Destination">Destination</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." data-testid="input-event-image-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-event-location" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="eventDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Event Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., June 2024" data-testid="input-event-date" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="guestCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Guest Count (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-event-guest-count"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Featured Event</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Display this event on the homepage
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-event-featured"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-4">
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={createEventMutation.isPending || updateEventMutation.isPending}
                              data-testid="button-save-event"
                            >
                              {editingEvent ? "Update Event" : "Create Event"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                              data-testid="button-cancel-event"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id} data-testid={`event-row-${event.id}`}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <Badge>{event.category}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{event.location || "-"}</TableCell>
                          <TableCell>
                            {event.isFeatured && <Badge variant="secondary">Featured</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(event)}
                                data-testid={`button-edit-${event.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(event.id)}
                                data-testid={`button-delete-${event.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {events.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No events yet. Click "Add Event" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inquiries" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <Card
                        key={inquiry.id}
                        className={inquiry.isRead ? "bg-muted/30" : ""}
                        data-testid={`inquiry-card-${inquiry.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                              <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!inquiry.isRead && (
                                <Badge variant="destructive">New</Badge>
                              )}
                              <Badge>{inquiry.eventType}</Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">{inquiry.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {!inquiry.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markInquiryReadMutation.mutate(inquiry.id)}
                                data-testid={`button-mark-read-${inquiry.id}`}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {inquiries.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No inquiries yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
