import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  new: {
    bg: "bg-[#E8EFFF]",
    text: "text-[#4F7CFF]",
    label: "New"
  },
  contacted: {
    bg: "bg-[#E0F5F5]",
    text: "text-[#00B5AD]",
    label: "Contacted"
  },
  qualified: {
    bg: "bg-[#EDE9FF]",
    text: "text-[#5B4FFF]",
    label: "Qualified"
  },
  proposal: {
    bg: "bg-[#FFF9E6]",
    text: "text-[#F2A600]",
    label: "Proposal"
  },
  negotiation: {
    bg: "bg-[#FFE8D6]",
    text: "text-[#E86A33]",
    label: "Negotiation"
  },
  won: {
    bg: "bg-[#E8F5E9]",
    text: "text-[#4CAF50]",
    label: "Won"
  },
  lost: {
    bg: "bg-[#FFE8E8]",
    text: "text-[#E53935]",
    label: "Lost"
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.new;

  return (
    <Badge
      className={`${config.bg} ${config.text} hover:${config.bg} border-0 font-medium`}
    >
      {config.label}
    </Badge>
  );
}
