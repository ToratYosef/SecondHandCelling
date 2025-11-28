import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = 
  | "quoted"
  | "draft"
  | "expired"
  | "cancelled"
  | "label_pending"
  | "awaiting_device"
  | "in_transit"
  | "received"
  | "under_inspection"
  | "reoffer_sent"
  | "reoffer_pending"
  | "customer_decision_pending"
  | "payout_pending"
  | "pending_payment"
  | "completed"
  | "returned_to_customer"
  | "open"
  | "in_progress"
  | "closed"
  | "pending"
  | "accepted"
  | "rejected"
  | "paid"
  | "failed"
  | "not_started";

const statusConfig: Record<StatusVariant, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  // Quote statuses
  quoted: { label: "Quoted", variant: "default", className: "bg-blue-500 text-white" },
  draft: { label: "Draft", variant: "secondary" },
  expired: { label: "Expired", variant: "outline", className: "text-muted-foreground" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  
  // Order statuses
  label_pending: { label: "Label Pending", variant: "secondary" },
  awaiting_device: { label: "Awaiting Device", variant: "default", className: "bg-blue-500 text-white" },
  in_transit: { label: "In Transit", variant: "default", className: "bg-blue-600 text-white" },
  received: { label: "Received", variant: "default", className: "bg-green-600 text-white" },
  under_inspection: { label: "Under Inspection", variant: "default", className: "bg-amber-500 text-white" },
  reoffer_sent: { label: "Re-offer Sent", variant: "default", className: "bg-orange-500 text-white" },
  reoffer_pending: { label: "Re-offer Pending", variant: "default", className: "bg-orange-500 text-white" },
  customer_decision_pending: { label: "Decision Pending", variant: "default", className: "bg-purple-500 text-white" },
  payout_pending: { label: "Payout Pending", variant: "default", className: "bg-green-500 text-white" },
  pending_payment: { label: "Payment Pending", variant: "secondary" },
  completed: { label: "Completed", variant: "default", className: "bg-green-700 text-white" },
  returned_to_customer: { label: "Returned", variant: "outline" },

  // Support statuses
  open: { label: "Open", variant: "default", className: "bg-blue-500 text-white" },
  in_progress: { label: "In Progress", variant: "default", className: "bg-amber-500 text-white" },
  closed: { label: "Closed", variant: "outline" },

  // Decision statuses
  pending: { label: "Pending", variant: "secondary" },
  accepted: { label: "Accepted", variant: "default", className: "bg-green-600 text-white" },
  rejected: { label: "Rejected", variant: "destructive" },

  // Payment statuses
  paid: { label: "Paid", variant: "default", className: "bg-green-600 text-white" },
  failed: { label: "Failed", variant: "destructive" },
  not_started: { label: "Not Started", variant: "secondary" },
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
