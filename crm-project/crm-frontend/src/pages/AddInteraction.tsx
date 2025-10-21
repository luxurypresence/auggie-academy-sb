import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_INTERACTION } from "@/graphql/interactions";
import { GET_LEAD } from "@/graphql/leads";

export default function AddInteraction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: leadData } = useQuery(GET_LEAD, {
    variables: { id: parseInt(id || "0") },
    skip: !id,
  });

  const [createInteraction, { loading: creating }] = useMutation(CREATE_INTERACTION, {
    onCompleted: () => {
      toast.success("Interaction added successfully");
      navigate(`/leads/${id}`);
    },
    onError: (error) => {
      toast.error(`Error creating interaction: ${error.message}`);
    },
    refetchQueries: [{ query: GET_LEAD, variables: { id: parseInt(id || "0") } }],
  });

  const [formData, setFormData] = useState({
    type: "call",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createInteraction({
      variables: {
        createInteractionInput: {
          type: formData.type.toUpperCase(),
          date: new Date(formData.date).toISOString(),
          notes: formData.notes || undefined,
          leadId: parseInt(id || "0"),
        },
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const leadName = leadData?.lead
    ? `${leadData.lead.firstName} ${leadData.lead.lastName}`
    : "Lead";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/leads/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Interaction</h1>
          <p className="text-muted-foreground">Record a new interaction with {leadName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Interaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any relevant notes about this interaction..."
                rows={5}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/leads/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                <Save className="mr-2 h-4 w-4" />
                {creating ? "Saving..." : "Add Interaction"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
