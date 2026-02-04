import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarDays, ArrowLeft } from "lucide-react";

const eventTypes = ["Wedding", "Corporate", "Private", "Destination"];
const packages = [
  { label: "Up to 100 guests", value: "100" },
  { label: "Up to 500 guests", value: "500" },
  { label: "Up to 1000 guests", value: "1000" },
];
const locations = ["Mumbai", "Pune", "Delhi"];
const decorTypes = ["Simple", "Intermediate", "Premium"];

function estimateCost({
  eventType,
  guests,
  location,
  decor,
}: {
  eventType: string;
  guests: number;
  location: string;
  decor: string;
}) {
  const base =
    eventType === "Wedding"
      ? 280000
      : eventType === "Destination"
      ? 320000
      : eventType === "Corporate"
      ? 220000
      : 180000;
  const guestMultiplier = guests * 1200;
  const locationMultiplier = location === "Mumbai" ? 1.2 : location === "Delhi" ? 1.1 : 1.0;
  const decorMultiplier = decor === "Premium" ? 1.6 : decor === "Intermediate" ? 1.3 : 1.0;
  return Math.round((base + guestMultiplier) * locationMultiplier * decorMultiplier);
}

export default function EventPlanner() {
  const [tab, setTab] = useState<"estimate" | "book">("estimate");
  const [estimateType, setEstimateType] = useState("Wedding");
  const [estimatePackage, setEstimatePackage] = useState("100");
  const [estimateLocation, setEstimateLocation] = useState("Mumbai");
  const [estimateDecor, setEstimateDecor] = useState("Simple");
  const [estimateResult, setEstimateResult] = useState<number | null>(null);

  const [bookName, setBookName] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookType, setBookType] = useState("Wedding");
  const [bookPackage, setBookPackage] = useState("100");
  const [bookLocation, setBookLocation] = useState("Mumbai");
  const [bookDecor, setBookDecor] = useState("Simple");
  const [bookDate, setBookDate] = useState<Date | undefined>(undefined);

  const { data: blockedDates = [] } = useQuery<string[]>({
    queryKey: ["/api/bookings/blocked-dates"],
  });

  const disabledDays = useMemo(() => {
    return blockedDates.map((d) => new Date(d));
  }, [blockedDates]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!bookDate) throw new Error("Select a date");
      return apiRequest("POST", "/api/bookings", {
        name: bookName,
        email: bookEmail,
        eventType: bookType,
        guests: Number(bookPackage),
        location: bookLocation,
        decor: bookDecor,
        date: format(bookDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/blocked-dates"] });
      setBookName("");
      setBookEmail("");
    },
  });

  const estimation = useMemo(() => {
    return estimateCost({
      eventType: estimateType,
      guests: Number(estimatePackage),
      location: estimateLocation,
      decor: estimateDecor,
    });
  }, [estimateType, estimatePackage, estimateLocation, estimateDecor]);

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Button variant="ghost" asChild data-testid="button-back-home">
          <Link href="/">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="py-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <Badge className="rounded-full px-4 py-1 mb-4">Bookings</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Plan and Book Your Event</h1>
          <p className="text-lg text-muted-foreground">
            Estimate your budget and reserve your preferred date with instant confirmation requests.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-2 bg-muted rounded-xl p-1">
            <button
              className={`py-2 rounded-lg font-medium ${tab === "estimate" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setTab("estimate")}
            >
              Estimate Budget
            </button>
            <button
              className={`py-2 rounded-lg font-medium ${tab === "book" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setTab("book")}
            >
              Book Event
            </button>
          </div>
        </div>

        {tab === "estimate" && (
          <Card className="max-w-5xl mx-auto mb-12">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="secondary">Budget Estimation</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Type of Event</label>
                  <Select value={estimateType} onValueChange={setEstimateType}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Package (No. of Guests)</label>
                  <Select value={estimatePackage} onValueChange={setEstimatePackage}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {packages.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Select value={estimateLocation} onValueChange={setEstimateLocation}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Decoration Type</label>
                  <Select value={estimateDecor} onValueChange={setEstimateDecor}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {decorTypes.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Button onClick={() => setEstimateResult(estimation)}>Estimate Cost</Button>
                {estimateResult !== null && (
                  <div className="text-lg font-semibold">
                    Estimated: INR {estimateResult.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "book" && (
          <Card className="max-w-5xl mx-auto mb-12">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input className="mt-2" value={bookName} onChange={(e) => setBookName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input className="mt-2" value={bookEmail} onChange={(e) => setBookEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Select value={bookType} onValueChange={setBookType}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Package (No. of Guests)</label>
                  <Select value={bookPackage} onValueChange={setBookPackage}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {packages.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Select value={bookLocation} onValueChange={setBookLocation}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Decoration Type</label>
                  <Select value={bookDecor} onValueChange={setBookDecor}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {decorTypes.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {bookDate ? format(bookDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <Calendar
                          mode="single"
                          selected={bookDate}
                          onSelect={setBookDate}
                          disabled={disabledDays}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={() => bookingMutation.mutate()} disabled={bookingMutation.isPending}>
                  {bookingMutation.isPending ? "Submitting..." : "Book Event"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="max-w-5xl mx-auto text-sm text-muted-foreground">
          Admin actions are available on the Admin Login page.
        </div>
      </div>
    </div>
  );
}
