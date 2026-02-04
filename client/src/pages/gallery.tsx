import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const galleryImages = [
  {
    title: "Grand Venue Moments",
    category: "wedding",
    imageUrl: "/attached_assets/stock_images/luxury_indian_weddin_6c287dfd.jpg",
  },
  {
    title: "Destination Stories",
    category: "destination",
    imageUrl: "/attached_assets/stock_images/indian_destination_w_2ad3396c.jpg",
  },
  {
    title: "Festival Highlights",
    category: "corporate",
    imageUrl: "/attached_assets/stock_images/indian_festival_cele_f3e1876a.jpg",
  },
  {
    title: "Private Celebrations",
    category: "private",
    imageUrl: "/attached_assets/stock_images/indian_party_celebra_c1fa1c78.jpg",
  },
  {
    title: "Luxury Reception",
    category: "wedding",
    imageUrl: "/attached_assets/generated_images/Luxury_wedding_reception_venue_ad069ecc.png",
  },
  {
    title: "Elegant Table Setting",
    category: "private",
    imageUrl: "/attached_assets/generated_images/Elegant_table_setting_details_b2fd9bec.png",
  },
  {
    title: "Corporate Gala",
    category: "corporate",
    imageUrl: "/attached_assets/generated_images/Corporate_gala_dinner_event_a9f58349.png",
  },
  {
    title: "Destination Ceremony",
    category: "destination",
    imageUrl: "/attached_assets/generated_images/Destination_wedding_ceremony_setup_b1bdc699.png",
  },
  {
    title: "Grand Venue Entrance",
    category: "wedding",
    imageUrl: "/attached_assets/generated_images/Grand_event_venue_entrance_1ef7554f.png",
  },
];

export default function Gallery() {
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Gallery</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A visual collection of our recent celebrations and signature events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((item) => (
              <Card key={item.title} className="overflow-hidden hover-elevate transition-all duration-500 group">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <Badge className="mb-2">{item.category}</Badge>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link href="/portfolio">View Full Portfolio</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
