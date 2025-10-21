import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { ArrowLeft, Mail, Phone, MapPin, Building2, TrendingUp, Calendar, Trash2, Edit, Video } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/StatusBadge";
import { GET_LEAD, DELETE_LEAD } from "@/graphql/leads";
import { format } from "date-fns";
import type { Lead } from "@/types/lead";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_LEAD, {
    variables: { id: parseInt(id || "0") },
    skip: !id,
  });

  const [deleteLead] = useMutation(DELETE_LEAD, {
    onCompleted: () => {
      toast.success("Lead deleted successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(`Error deleting lead: ${error.message}`);
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      await deleteLead({
        variables: { id: parseInt(id || "0") },
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Skeleton className="h-9 w-[250px] mb-2" />
              <Skeleton className="h-5 w-[150px]" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[80px]" />
            <Skeleton className="h-10 w-[90px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[180px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-[60px] mb-2" />
                        <Skeleton className="h-5 w-[140px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactions Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-[180px]" />
                  <Skeleton className="h-9 w-[130px]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-5 w-[80px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Lead Details Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[120px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-[80px] mb-2" />
                  <Skeleton className="h-6 w-[100px] rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[60px] mb-2" />
                  <Skeleton className="h-6 w-[120px] rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[60px] mb-2" />
                  <Skeleton className="h-8 w-[140px]" />
                </div>
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-[100px] mb-1" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[120px]" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Lead Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {error ? `Error: ${error.message}` : "Lead not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lead: Lead = data.lead;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-muted-foreground">Lead Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/leads/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                )}

                {lead.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{lead.location}</p>
                    </div>
                  </div>
                )}

                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">{lead.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactions History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Interaction History</CardTitle>
                <Button size="sm" onClick={() => navigate(`/leads/${id}/add-interaction`)}>
                  Add Interaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lead.interactions && lead.interactions.length > 0 ? (
                <div className="space-y-4">
                  {lead.interactions.map((interaction) => {
                    // Get the appropriate icon based on interaction type
                    const getInteractionIcon = () => {
                      switch (interaction.type.toLowerCase()) {
                        case 'email':
                          return <Mail className="h-5 w-5 text-primary" />;
                        case 'call':
                          return <Phone className="h-5 w-5 text-primary" />;
                        case 'meeting':
                          return <Video className="h-5 w-5 text-primary" />;
                        default:
                          return <Calendar className="h-5 w-5 text-primary" />;
                      }
                    };

                    return (
                      <div
                        key={interaction.id}
                        className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getInteractionIcon()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium capitalize">{interaction.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(interaction.date), "MMM d, yyyy")}
                            </p>
                          </div>
                          {interaction.notes && (
                            <p className="text-sm text-muted-foreground">
                              {interaction.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No interactions recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Lead Details */}
        <div className="space-y-6">
          {/* Status & Source */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <StatusBadge status={lead.status} />
              </div>

              {lead.source && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Source</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-medium capitalize">
                    <TrendingUp className="h-4 w-4" />
                    {lead.source}
                  </div>
                </div>
              )}

              {lead.budget && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Budget</p>
                  <p className="text-2xl font-bold">
                    ${lead.budget.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
              {lead.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
