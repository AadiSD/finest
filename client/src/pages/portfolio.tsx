import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Event } from "@shared/schema";

const categories = ["All", "Wedding", "Corporate", "Private", "Destination"];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase());

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

      <div className="py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of beautifully executed events that showcase our commitment to excellence
            </p>
          </div>

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
