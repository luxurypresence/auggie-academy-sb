import { Badge } from "@/components/ui/badge";

interface ActivityScoreBadgeProps {
  score: number | null | undefined;
}

export function ActivityScoreBadge({ score }: ActivityScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        Not Calculated
      </Badge>
    );
  }

  const getColorClass = () => {
    if (score <= 30) return "bg-red-100 text-red-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Badge className={getColorClass()}>
      {score}
    </Badge>
  );
}
