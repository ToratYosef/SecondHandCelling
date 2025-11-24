import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { LoadingSpinner, ErrorState } from "../../components/AdminUtilities";
import { useToast } from "../../components/AdminToast";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";

export default function AdminEmail() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: emailHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-email-history"],
    queryFn: async () => {
      const res = await fetch("/api/admin/emails/history");
      if (!res.ok) throw new Error("Failed to fetch email history");
      return res.json();
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string }) => {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send email");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Email sent successfully!");
      setRecipient("");
      setSubject("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-email-history"] });
    },
    onError: () => {
      toast.error("Failed to send email");
    },
  });

  const quickActions = [
    {
      label: "Condition Inquiry",
      icon: "🔍",
      subject: "Quick question about your device",
      body: "Hi,\n\nWe're processing your order and need more details about your device condition.\n\nCould you please provide:\n- Any cosmetic damage (scratches, dents, cracks)\n- Screen condition\n- Battery health if available\n\nThank you!",
    },
    {
      label: "FMI Cleared",
      icon: "✅",
      subject: "Find My iPhone Cleared - Ready to Process",
      body: "Great news!\n\nWe've confirmed that Find My iPhone has been successfully disabled on your device. We're now moving forward with the inspection.\n\nYou'll receive an update once the inspection is complete.\n\nThank you!",
    },
    {
      label: "Request Review",
      icon: "⭐",
      subject: "How was your experience?",
      body: "Hi,\n\nWe hope you had a great experience selling your device to us!\n\nWould you mind taking a moment to leave us a review? Your feedback helps us improve.\n\n[Review Link]\n\nThank you!",
    },
    {
      label: "Payment Delay",
      icon: "⏱️",
      subject: "Payment Processing Update",
      body: "Hi,\n\nWe wanted to give you a quick update on your payment. Due to [reason], there's a slight delay.\n\nWe expect to process your payment by [date].\n\nWe apologize for any inconvenience.\n\nThank you for your patience!",
    },
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setSubject(action.subject);
    setBody(action.body);
  };

  const handleSendEmail = () => {
    if (!recipient || !subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }
    sendEmailMutation.mutate({ to: recipient, subject, body });
  };

  const history = emailHistory?.emails || [];

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Send emails and view sent history</p>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 justify-start h-auto py-3"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Email Composer */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compose Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient
                </label>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <Input
                  type="text"
                  placeholder="Email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <Textarea
                  placeholder="Email body..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending}
                >
                  {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecipient("");
                    setSubject("");
                    setBody("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Email History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sent Email History</h3>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Loading email history..." />
            ) : error ? (
              <ErrorState message="Failed to load email history" onRetry={refetch} />
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emails sent yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((email: any) => (
                      <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(email.sentAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium">{email.to}</td>
                        <td className="px-4 py-3">{email.subject}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {email.status || "sent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}
