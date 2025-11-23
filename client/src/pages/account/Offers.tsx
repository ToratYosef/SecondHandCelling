import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type QuoteRequest = {
  id: string;
  quoteNumber: string;
  status: string;
  totalOfferAmount: string;
  expiresAt: string | null;
  createdAt: string;
  items: Array<{
    deviceModel: { name: string } | null;
    deviceVariant: { storageSizeGb: number | null } | null;
  }>;
};

export default function AccountOffers() {
  const { data: quotes, isLoading } = useQuery<QuoteRequest[]>({
    queryKey: ['/api/quotes/my-quotes'],
  });

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Offers</h1>
              <p className="text-muted-foreground">View and manage your device quotes</p>
            </div>
            <Button asChild data-testid="button-get-new-quote">
              <Link href="/sell">
                Get New Quote
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ) : quotes && quotes.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => {
                    const daysLeft = getDaysUntilExpiry(quote.expiresAt);
                    const deviceName = quote.items[0]?.deviceModel?.name || "Unknown Device";
                    const storageSize = quote.items[0]?.deviceVariant?.storageSizeGb;
                    const deviceLabel = storageSize ? `${deviceName} ${storageSize}GB` : deviceName;
                    
                    return (
                      <TableRow key={quote.quoteNumber} className="hover-elevate">
                        <TableCell className="font-mono text-sm">{quote.quoteNumber}</TableCell>
                        <TableCell className="font-medium">{deviceLabel}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={quote.status as any} />
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          ${parseFloat(quote.totalOfferAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {daysLeft !== null && (
                            <Badge variant={daysLeft < 3 ? "destructive" : "secondary"}>
                              {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                            </Badge>
                          )}
                          {daysLeft === null && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm" data-testid={`button-view-${quote.quoteNumber}`}>
                            <Link href={`/account/offers/${quote.quoteNumber}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No quotes found</p>
              <Button asChild>
                <Link href="/sell">Get Your First Quote</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
