import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead } from "@/types/lead";

interface AISummaryCardProps {
  lead: Lead;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

interface ActivityMetric {
  label: string;
  score: number;
  maxScore: number;
  description: string;
  color: string;
}

export function AISummaryCard({ lead, onRegenerate, isRegenerating }: AISummaryCardProps) {
  // Calculate activity score breakdown
  const calculateActivityMetrics = (): ActivityMetric[] => {
    const interactions = lead.interactions || [];
    const status = lead.status.toLowerCase();

    // Recency Score (max 40 points) - Based on days since last interaction
    let recencyScore = 0;
    let recencyDescription = "No interactions yet";
    if (interactions.length > 0) {
      const lastInteraction = [...interactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const daysSinceLastContact = Math.floor(
        (Date.now() - new Date(lastInteraction.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastContact <= 1) recencyScore = 40;
      else if (daysSinceLastContact <= 3) recencyScore = 35;
      else if (daysSinceLastContact <= 7) recencyScore = 30;
      else if (daysSinceLastContact <= 14) recencyScore = 20;
      else if (daysSinceLastContact <= 30) recencyScore = 10;
      else recencyScore = 5;

      recencyDescription = `Last contact ${daysSinceLastContact} day${daysSinceLastContact !== 1 ? 's' : ''} ago`;
    }

    // Engagement Score (max 30 points) - Based on number of interactions
    const interactionCount = interactions.length;
    let engagementScore = 0;
    if (interactionCount >= 10) engagementScore = 30;
    else if (interactionCount >= 5) engagementScore = 20;
    else if (interactionCount >= 2) engagementScore = 10;
    else if (interactionCount === 1) engagementScore = 5;

    const engagementDescription = `${interactionCount} interaction${interactionCount !== 1 ? 's' : ''}`;

    // Budget Score (max 20 points) - Based on budget value
    let budgetScore = 0;
    let budgetDescription = "No budget set";
    if (lead.budget) {
      if (lead.budget >= 100000) budgetScore = 20;
      else if (lead.budget >= 50000) budgetScore = 15;
      else if (lead.budget >= 25000) budgetScore = 10;
      else if (lead.budget >= 10000) budgetScore = 5;
      else budgetScore = 2;

      budgetDescription = `$${lead.budget.toLocaleString()}`;
    }

    // Status Score (max 10 points) - Based on lead status
    let statusScore = 0;
    const statusScores: Record<string, number> = {
      'won': 10,
      'negotiation': 9,
      'proposal': 8,
      'qualified': 7,
      'contacted': 5,
      'new': 3,
      'lost': 0,
    };
    statusScore = statusScores[status] || 3;

    return [
      {
        label: "Recency",
        score: recencyScore,
        maxScore: 40,
        description: recencyDescription,
        color: recencyScore >= 30 ? "bg-green-500" : recencyScore >= 20 ? "bg-orange-500" : "bg-red-500",
      },
      {
        label: "Engagement",
        score: engagementScore,
        maxScore: 30,
        description: engagementDescription,
        color: engagementScore >= 20 ? "bg-green-500" : engagementScore >= 10 ? "bg-orange-500" : "bg-red-500",
      },
      {
        label: "Budget",
        score: budgetScore,
        maxScore: 20,
        description: budgetDescription,
        color: budgetScore >= 15 ? "bg-green-500" : budgetScore >= 10 ? "bg-orange-500" : "bg-red-500",
      },
      {
        label: "Status",
        score: statusScore,
        maxScore: 10,
        description: status.charAt(0).toUpperCase() + status.slice(1),
        color: statusScore >= 7 ? "bg-green-500" : statusScore >= 5 ? "bg-orange-500" : "bg-red-500",
      },
    ];
  };

  const activityMetrics = calculateActivityMetrics();
  const activityScore = lead.activityScore || activityMetrics.reduce((sum, m) => sum + m.score, 0);

  // Determine lead category based on score
  const getLeadCategory = (score: number) => {
    if (score >= 71) return { label: "Hot Lead", color: "bg-green-500" };
    if (score >= 41) return { label: "Warm Lead", color: "bg-orange-500" };
    return { label: "Cold Lead", color: "bg-red-500" };
  };

  const leadCategory = getLeadCategory(activityScore);

  // Format timestamp
  const getTimestamp = () => {
    if (!lead.summaryGeneratedAt) return null;

    try {
      const date = new Date(lead.summaryGeneratedAt);
      const distance = formatDistanceToNow(date, { addSuffix: true });
      return `Generated ${distance}`;
    } catch {
      return "Generated recently";
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Automated analysis of lead engagement and potential
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1.5 rounded-full text-white font-semibold text-sm ${leadCategory.color}`}>
              {activityScore}/100
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-medium text-white ${leadCategory.color}`}>
              {leadCategory.label}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Activity Score Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Activity Score Breakdown</h3>
          </div>

          <div className="space-y-3">
            {activityMetrics.map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-muted-foreground">
                    {metric.score}/{metric.maxScore} - {metric.description}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${metric.color} transition-all duration-300`}
                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              AI Summary
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>

          {lead.summary ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lead.summary}
              </p>
              {getTimestamp() && (
                <p className="text-xs text-muted-foreground italic">
                  {getTimestamp()}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                No AI summary generated yet. Click "Regenerate" to create one.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
