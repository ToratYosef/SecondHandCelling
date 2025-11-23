import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface DeviceCardProps {
  name: string;
  imageUrl?: string;
  maxPrice?: string;
  slug: string;
  brand?: string;
}

export function DeviceCard({ name, imageUrl, maxPrice, slug, brand }: DeviceCardProps) {
  return (
    <Link href={`/sell/quote/${slug}`} data-testid={`card-device-${slug}`}>
      <Card className="p-4 hover-elevate active-elevate-2 transition-all h-full flex flex-col">
        <div className="aspect-square relative mb-4 bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="text-6xl text-muted-foreground/20">📱</div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          {brand && (
            <p className="text-xs text-muted-foreground font-medium mb-1">{brand}</p>
          )}
          <h3 className="font-semibold text-base mb-2 line-clamp-2">{name}</h3>
          {maxPrice && (
            <p className="text-sm text-muted-foreground mb-3">
              Up to <span className="text-primary font-semibold">{maxPrice}</span>
            </p>
          )}
          <div className="mt-auto flex items-center text-sm text-primary font-medium">
            Get offer
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
