import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EstimatePrediction } from "@shared/schema";

const eventTypes = ["Wedding", "Corporate", "Private", "Destination"];
const packages = [
  { label: "Up to 100 guests", value: "100" },
  { label: "Up to 500 guests", value: "500" },
  { label: "Up to 1000 guests", value: "1000" },
];
const locations = ["Mumbai", "Pune", "Delhi"];
const decorTypes = ["Simple", "Intermediate", "Premium"];

export default function EventPlanner() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"estimate" | "book">("estimate");
  const [estimateType, setEstimateType] = useState("Wedding");
  const [estimatePackage, setEstimatePackage] = useState("100");
  const [estimateLocation, setEstimateLocation] = useState("Mumbai");
  const [estimateDecor, setEstimateDecor] = useState("Simple");
  const [estimateResult, setEstimateResult] = useState<EstimatePrediction | null>(null);
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [estimateDate, setEstimateDate] = useState<Date | undefined>(undefined);

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
        estimateId: estimateId ?? undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings/blocked-dates"] });
      setBookName("");
      setBookEmail("");
      toast({
        title: "Booking Request Sent",
        description: "Thanks! We’ll review your request and confirm the date shortly.",
      });
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async () => {
      const dateValue = estimateDate ? format(estimateDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      const res = await apiRequest("POST", "/api/estimate", {
        eventType: estimateType,
        guests: Number(estimatePackage),
        location: estimateLocation,
        decor: estimateDecor,
        date: dateValue,
      });
      return res.json();
    },
    onSuccess: (data: EstimatePrediction) => {
      setEstimateResult(data);
      setEstimateId(data.id ?? null);
    },
    onError: () => {
      setEstimateResult(null);
      setEstimateId(null);
    },
  });

  useEffect(() => {
    setEstimateResult(null);
    setEstimateId(null);
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
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Event Date</label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {estimateDate ? format(estimateDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <Calendar
                          mode="single"
                          selected={estimateDate}
                          onSelect={setEstimateDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Button onClick={() => estimateMutation.mutate()} disabled={estimateMutation.isPending}>
                  {estimateMutation.isPending ? "Estimating..." : "Estimate Cost"}
                </Button>
                {estimateResult !== null && (
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">
                      Estimated: {estimateResult.currency} {estimateResult.estimatedBudget.toLocaleString("en-IN")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Range: {estimateResult.currency} {estimateResult.budgetLow.toLocaleString("en-IN")} - {estimateResult.currency} {estimateResult.budgetHigh.toLocaleString("en-IN")}
                    </div>
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

      </div>
    </div>
  );
}
