import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Users, Calendar, Award, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import heroImage from "@assets/stock_images/luxury_indian_weddin_6c287dfd.jpg";
import weddingImage from "@assets/stock_images/indian_wedding_cerem_96f31f4b.jpg";
import corporateImage from "@assets/stock_images/mumbai_corporate_eve_851a13ca.jpg";
import destinationImage from "@assets/stock_images/goa_beach_wedding_de_8c4c5f5b.jpg";
import privateImage from "@assets/stock_images/indian_party_celebra_c1fa1c78.jpg";
import detailImage from "@assets/stock_images/indian_festival_cele_f3e1876a.jpg";
import type { Event } from "@shared/schema";

export default function Landing() {
  const { toast } = useToast();

  const { data: featuredEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events/featured"],
  });

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      eventType: "",
      message: "",
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      return await apiRequest("POST", "/api/inquiries", data);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent",
        description: "Thank you! We'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInquiry) => {
    inquiryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Grand event venue"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Finest Hospitality
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Creating Magical Celebrations Across India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="default"
              size="lg"
              className="text-lg px-8"
              asChild
              data-testid="button-explore-portfolio"
            >
              <Link href="/portfolio">
                Explore Our Portfolio <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-background/10 backdrop-blur-md border-white/30 text-white hover:bg-background/20"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-get-in-touch"
            >
              Get in Touch
            </Button>
          </div>
          <div className="mt-12 animate-bounce">
            <ArrowRight className="h-6 w-6 text-white/70 rotate-90 mx-auto" />
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
                India's Premier Event Planners
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                For over a decade, Finest Hospitality has been India's premier choice for crafting extraordinary celebrations. From grand Indian weddings to corporate galas, we blend traditional elegance with modern sophistication to create unforgettable experiences.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our passionate team specializes in authentic Indian celebrations, destination weddings, and corporate events across major cities including Mumbai, Delhi, Bangalore, and beyond. We honor traditions while embracing innovation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="hover-elevate transition-all duration-300" data-testid="card-stat-events">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">1000+</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Events Managed</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate transition-all duration-300" data-testid="card-stat-years">
                <CardContent className="p-6 text-center">
                  <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">12</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Years Excellence</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate transition-all duration-300" data-testid="card-stat-satisfaction">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">98%</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Client Satisfaction</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate transition-all duration-300" data-testid="card-stat-team">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">50+</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Expert Staff</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="portfolio" className="py-20 md:py-32 px-6 md:px-12 lg:px-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
              Featured Events
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our portfolio of beautifully crafted events that showcase our commitment to excellence
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents.slice(0, 6).map((event) => (
              <Card key={event.id} className="overflow-hidden hover-elevate transition-all duration-500 group" data-testid={`card-event-${event.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-3" data-testid={`badge-category-${event.id}`}>
                      {event.category}
                    </Badge>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="text-sm text-white/80">{event.location}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="default" size="lg" asChild data-testid="button-view-all-portfolio">
              <Link href="/portfolio">View All Portfolio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized event management across diverse celebration types
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover-elevate transition-all duration-300 cursor-pointer" data-testid="card-service-weddings">
              <CardContent className="p-8">
                <div className="h-48 mb-6 rounded-md overflow-hidden">
                  <img src={weddingImage} alt="Wedding services" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Indian Weddings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional Hindu, Sikh, Muslim, and Christian weddings with authentic rituals, stunning mandap designs, and magnificent celebrations.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-300 cursor-pointer" data-testid="card-service-corporate">
              <CardContent className="p-8">
                <div className="h-48 mb-6 rounded-md overflow-hidden">
                  <img src={corporateImage} alt="Corporate events" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Corporate Events</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Product launches, annual galas, conferences, and team celebrations across India's major business hubs with world-class hospitality.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-300 cursor-pointer" data-testid="card-service-private">
              <CardContent className="p-8">
                <div className="h-48 mb-6 rounded-md overflow-hidden">
                  <img src={privateImage} alt="Private parties" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Sangeet & Mehendi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Vibrant sangeet nights, traditional mehendi ceremonies, and intimate pre-wedding celebrations with cultural authenticity.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-300 cursor-pointer" data-testid="card-service-destination">
              <CardContent className="p-8">
                <div className="h-48 mb-6 rounded-md overflow-hidden">
                  <img src={destinationImage} alt="Destination events" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Destination Weddings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Breathtaking destination weddings in Goa, Udaipur, Jaipur, Kerala, and other exotic Indian locations with complete logistics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 px-6 md:px-12 lg:px-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
                Let's Create Magic Together
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Ready to plan your dream celebration? Contact us today and let's transform your vision into an unforgettable Indian experience filled with joy, tradition, and elegance.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>contact@finesthospitality.in</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>
            <Card data-testid="card-contact-form">
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="corporate">Corporate Event</SelectItem>
                              <SelectItem value="private">Private Party</SelectItem>
                              <SelectItem value="destination">Destination Event</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your event..."
                              className="resize-none min-h-[120px]"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={inquiryMutation.isPending}
                      data-testid="button-send-inquiry"
                    >
                      {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-serif font-semibold mb-4">Finest Hospitality</h3>
              <p className="text-sm text-muted-foreground">
                Creating magical Indian celebrations for over a decade
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/portfolio" className="hover:text-foreground transition-colors">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <a href="/api/login" className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-login">
                    Login
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Indian Weddings</li>
                <li>Corporate Events</li>
                <li>Sangeet & Mehendi</li>
                <li>Destination Weddings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contact@finesthospitality.in</li>
                <li>+91 98765 43210</li>
                <li>Mumbai, Maharashtra</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Finest Hospitality. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
