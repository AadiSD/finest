import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import type { Event } from "@shared/schema";

const categories = ["All", "Wedding", "Corporate", "Private", "Destination"];
const galleryImagesByCategory: Record<string, string[]> = {
  wedding: [
    "/attached_assets/stock_images/indian_wedding_cerem_96f31f4b.jpg",
    "/attached_assets/stock_images/indian_sangeet_night_4011fe32.jpg",
    "/attached_assets/stock_images/indian_rajasthani_we_7b398419.jpg",
    "/attached_assets/generated_images/Luxury_wedding_reception_venue_ad069ecc.png",
  ],
  corporate: [
    "/attached_assets/stock_images/mumbai_corporate_eve_851a13ca.jpg",
    "/attached_assets/stock_images/indian_corporate_eve_e692aecb.jpg",
    "/attached_assets/generated_images/Corporate_gala_dinner_event_a9f58349.png",
  ],
  private: [
    "/attached_assets/stock_images/indian_party_celebra_c1fa1c78.jpg",
    "/attached_assets/generated_images/Elegant_table_setting_details_b2fd9bec.png",
    "/attached_assets/generated_images/Grand_event_venue_entrance_1ef7554f.png",
  ],
  destination: [
    "/attached_assets/stock_images/goa_beach_wedding_de_8c4c5f5b.jpg",
    "/attached_assets/stock_images/kerala_traditional_i_deef526d.jpg",
    "/attached_assets/generated_images/Destination_wedding_ceremony_setup_b1bdc699.png",
  ],
};

const getGalleryImages = (event: Event) => {
  const categoryKey = event.category.toLowerCase();
  const galleryImages = galleryImagesByCategory[categoryKey] ?? [];
  const combined = [event.imageUrl, ...galleryImages];
  return Array.from(new Set(combined));
};

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <Button variant="ghost" asChild data-testid="button-back-home">
            <Link href="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Portfolio Content */}
      <div className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of beautifully executed events that showcase our commitment to excellence
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-12" data-testid="filter-bar">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
                data-testid={`filter-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No events found in this category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover-elevate transition-all duration-500 group cursor-pointer"
                  data-testid={`portfolio-card-${event.id}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge className="mb-3" data-testid={`portfolio-badge-${event.id}`}>
                        {event.category}
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="text-sm text-white/80 mb-1">{event.location}</p>
                      )}
                      {event.eventDate && (
                        <p className="text-sm text-white/70">{event.eventDate}</p>
                      )}
                      <p className="text-white/90 mt-3 line-clamp-3">{event.description}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4 w-full bg-white/90 text-black hover:bg-white"
                            data-testid={`portfolio-gallery-${event.id}`}
                          >
                            View Gallery
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{event.title} Gallery</DialogTitle>
                            <DialogDescription>
                              Browse highlights from this event setup and decor.
                            </DialogDescription>
                          </DialogHeader>
                          <Carousel opts={{ align: "start" }} className="relative">
                            <CarouselContent>
                              {getGalleryImages(event).map((image, index) => (
                                <CarouselItem key={`${event.id}-${index}`}>
                                  <div className="aspect-[16/10] w-full overflow-hidden rounded-lg">
                                    <img
                                      src={image}
                                      alt={`${event.title} gallery image ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
