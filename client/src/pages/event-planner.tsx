import { useMemo, useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  Bot,
  CalendarCheck,
  Lock,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BookingStatus = "pending" | "accepted" | "rejected";

type BookingRequest = {
  id: string;
  name: string;
  email: string;
  eventType: string;
  packageLabel: string;
  location: string;
  decoration: string;
  date: Date;
  status: BookingStatus;
};

type ChatMessage = {
  from: "bot" | "user";
  message: string;
};

const eventTypes = ["Wedding", "Corporate", "Private", "Destination", "Other"];
const packageOptions = [
  { label: "Intimate (50 guests)", guests: 50, multiplier: 1 },
  { label: "Classic (100 guests)", guests: 100, multiplier: 1.4 },
  { label: "Grande (200 guests)", guests: 200, multiplier: 1.85 },
  { label: "Royal (350 guests)", guests: 350, multiplier: 2.4 },
];
const locations = ["Mumbai", "Pune", "Delhi"];
const decorationOptions = [
  { label: "Simple", multiplier: 1 },
  { label: "Intermediate", multiplier: 1.4 },
  { label: "Premium", multiplier: 1.9 },
];

const eventBasePricing: Record<string, number> = {
  Wedding: 650000,
  Corporate: 420000,
  Private: 280000,
  Destination: 900000,
  Other: 350000,
};

const locationMultiplier: Record<string, number> = {
  Mumbai: 1.3,
  Pune: 1.1,
  Delhi: 1.25,
};

const initialChat: ChatMessage[] = [
  {
    from: "bot",
    message: "Hi! I can help you estimate budgets, book a date, or answer planning questions.",
  },
];

const formatCurrency = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

const getChatResponse = (message: string) => {
  const lowered = message.toLowerCase();
  if (lowered.includes("budget") || lowered.includes("estimate")) {
    return "Use the Estimate tab to select event type, guest package, location, and decor. I can explain each option too!";
  }
  if (lowered.includes("book") || lowered.includes("date")) {
    return "Open the Booking tab, pick a date, and submit. Admin-approved dates are shown in red and disabled.";
  }
  if (lowered.includes("decoration")) {
    return "Simple is elegant and minimal, Intermediate adds layered florals and lighting, Premium delivers luxury themes and custom installs.";
  }
  return "Thanks for the note! Share more details and I will guide you.";
};

export default function EventPlanner() {
  const [activeTab, setActiveTab] = useState("estimate");
  const [eventType, setEventType] = useState(eventTypes[0]);
  const [packageLabel, setPackageLabel] = useState(packageOptions[1].label);
  const [location, setLocation] = useState(locations[0]);
  const [decoration, setDecoration] = useState(decorationOptions[0].label);
  const [estimate, setEstimate] = useState<number | null>(null);

  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    eventType: eventTypes[0],
    packageLabel: packageOptions[1].label,
    location: locations[0],
    decoration: decorationOptions[0].label,
    date: undefined as Date | undefined,
  });

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(initialChat);
  const [chatDraft, setChatDraft] = useState("");

  const bookedDates = useMemo(
    () => bookingRequests.filter((request) => request.status === "accepted").map((request) => request.date),
    [bookingRequests],
  );

  const handleEstimate = () => {
    const selectedPackage = packageOptions.find((option) => option.label === packageLabel);
    const selectedDecor = decorationOptions.find((option) => option.label === decoration);
    if (!selectedPackage || !selectedDecor) {
      return;
    }
    const base = eventBasePricing[eventType] ?? 350000;
    const packageCost = base * selectedPackage.multiplier;
    const locationCost = packageCost * (locationMultiplier[location] ?? 1);
    const decorCost = locationCost * selectedDecor.multiplier;
    setEstimate(decorCost);
  };

  const submitBooking = () => {
    if (!bookingForm.date) {
      return;
    }
    const newRequest: BookingRequest = {
      id: crypto.randomUUID(),
      name: bookingForm.name,
      email: bookingForm.email,
      eventType: bookingForm.eventType,
      packageLabel: bookingForm.packageLabel,
      location: bookingForm.location,
      decoration: bookingForm.decoration,
      date: bookingForm.date,
      status: "pending",
    };
    setBookingRequests((prev) => [newRequest, ...prev]);
    setBookingForm((prev) => ({
      ...prev,
      name: "",
      email: "",
      date: undefined,
    }));
    setActiveTab("book");
  };

  const updateStatus = (id: string, status: BookingStatus) => {
    setBookingRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
            }
          : request,
      ),
    );
  };

  const sendChat = () => {
    if (!chatDraft.trim()) {
      return;
    }
    const message = chatDraft.trim();
    setChatMessages((prev) => [
      ...prev,
      { from: "user", message },
      { from: "bot", message: getChatResponse(message) },
    ]);
    setChatDraft("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild data-testid="button-back-home">
            <Link href="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-admin-login">
                      <ShieldCheck className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Admin Login</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Admin Name</Label>
                        <Input
                          id="admin-name"
                          placeholder="Enter admin name"
                          value={adminName}
                          onChange={(event) => setAdminName(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter password"
                          value={adminPassword}
                          onChange={(event) => setAdminPassword(event.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          if (adminName.trim() === "ADadmin" && adminPassword === "123Admin") {
                            setIsAdmin(true);
                          }
                        }}
                      >
                        Unlock Admin Panel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>Admin Login</TooltipContent>
            </Tooltip>
            {isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Admin Mode
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="mx-auto">
              Event Planning Studio
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">Estimate &amp; Book Your Event</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use our ML-inspired estimator to budget your celebration, then reserve your preferred date with instant
              admin visibility.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full md:w-[480px] grid-cols-2 mx-auto">
              <TabsTrigger value="estimate">Estimate Budget</TabsTrigger>
              <TabsTrigger value="book">Book Event</TabsTrigger>
            </TabsList>

            <TabsContent value="estimate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    ML Budget Estimation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Type of Event</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Package (No. of Guests)</Label>
                      <Select value={packageLabel} onValueChange={setPackageLabel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                        <SelectContent>
                          {packageOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Decoration Type</Label>
                      <Select value={decoration} onValueChange={setDecoration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select decoration type" />
                        </SelectTrigger>
                        <SelectContent>
                          {decorationOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <Button onClick={handleEstimate} data-testid="button-estimate-cost">
                      Estimate Cost
                    </Button>
                    {estimate && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                        <p className="text-sm text-muted-foreground">Estimated Budget</p>
                        <p className="text-2xl font-semibold text-primary">{formatCurrency(estimate)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="book">
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                      Book Your Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={bookingForm.name}
                          onChange={(event) => setBookingForm((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={bookingForm.email}
                          onChange={(event) => setBookingForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="you@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select
                          value={bookingForm.eventType}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, eventType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Package (No. of Guests)</Label>
                        <Select
                          value={bookingForm.packageLabel}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, packageLabel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packageOptions.map((option) => (
                              <SelectItem key={option.label} value={option.label}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                          value={bookingForm.location}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, location: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Decoration Type</Label>
                        <Select
                          value={bookingForm.decoration}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, decoration: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select decoration type" />
                          </SelectTrigger>
                          <SelectContent>
                            {decorationOptions.map((option) => (
                              <SelectItem key={option.label} value={option.label}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bookingForm.date && "text-muted-foreground",
                              )}
                            >
                              {bookingForm.date ? format(bookingForm.date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bookingForm.date}
                              onSelect={(date) => setBookingForm((prev) => ({ ...prev, date: date ?? undefined }))}
                              disabled={bookedDates}
                              modifiers={{ booked: bookedDates }}
                              modifiersClassNames={{
                                booked: "bg-red-500 text-white hover:bg-red-500",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Red dates are already booked by admin approval.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={submitBooking}
                      className="w-full md:w-auto"
                      disabled={!bookingForm.name || !bookingForm.email || !bookingForm.date}
                    >
                      Submit Booking Request
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Booking requests will appear here once submitted.
                      </p>
                    ) : (
                      bookingRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{request.name}</p>
                            <Badge
                              variant={
                                request.status === "accepted"
                                  ? "default"
                                  : request.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.eventType} · {request.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(request.date, "PPP")}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <section id="admin-panel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAdmin ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Admin access required. Use the admin login icon in the header to unlock this panel.
                  </div>
                ) : bookingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No booking requests yet.</p>
                ) : (
                  bookingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">{request.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.eventType} · {request.packageLabel} · {request.decoration}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.location} · {format(request.date, "PPP")}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(request.id, "rejected")}
                          disabled={request.status === "rejected"}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, "accepted")}
                          disabled={request.status === "accepted"}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <Card className="w-80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Finest Helper</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.from === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {message.message}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Ask about budgets, dates, or packages..."
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                />
                <Button onClick={sendChat} className="w-full">
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <Button
          onClick={() => setChatOpen((prev) => !prev)}
          className="rounded-full shadow-lg"
          size="icon"
          data-testid="button-chatbot"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
