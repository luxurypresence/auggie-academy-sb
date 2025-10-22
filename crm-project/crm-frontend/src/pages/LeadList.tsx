import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Plus, Search, SlidersHorizontal, ArrowUpDown, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StatusBadge from "@/components/StatusBadge";
import { ActivityScoreBadge } from "@/components/ActivityScoreBadge";
import { GET_LEADS, RECALCULATE_ALL_SCORES } from "@/graphql/leads";
import type { Lead } from "../types/lead";
import { format } from "date-fns";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function LeadList() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_LEADS);

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByScore, setSortByScore] = useState(false);

  // Mutation for recalculating all scores
  const [recalculateScores, { loading: isRecalculating }] = useMutation(
    RECALCULATE_ALL_SCORES,
    {
      onCompleted: (data) => {
        toast.success(`${data.recalculateAllScores.count} leads recalculated`);
      },
      onError: (error) => {
        toast.error(`Error recalculating scores: ${error.message}`);
      },
      refetchQueries: [{ query: GET_LEADS }],
    }
  );

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    if (!data?.leads) return [];

    let filtered = [...data.leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((lead: Lead) =>
        lead.firstName.toLowerCase().includes(query) ||
        lead.lastName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.location && lead.location.toLowerCase().includes(query))
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead: Lead) =>
        lead.source && lead.source.toLowerCase() === sourceFilter.toLowerCase()
      );
    }

    // Status filter
    if (stageFilter !== "all") {
      filtered = filtered.filter((lead: Lead) =>
        lead.status.toLowerCase() === stageFilter.toLowerCase()
      );
    }

    return filtered;
  }, [data?.leads, searchQuery, sourceFilter, stageFilter]);

  // Sort by activity score
  const sortedLeads = useMemo(() => {
    const filtered = [...filteredLeads];

    if (sortByScore) {
      return filtered.sort((a, b) => {
        const scoreA = a.activityScore ?? -1;
        const scoreB = b.activityScore ?? -1;
        return scoreB - scoreA; // Descending (highest first)
      });
    }

    return filtered;
  }, [filteredLeads, sortByScore]);

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const handleRowClick = (leadId: number) => {
    navigate(`/leads/${leadId}`);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Efficiently manage and track your sales leads.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading leads: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Efficiently manage and track your sales leads.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => recalculateScores()}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalculate All Scores
              </>
            )}
          </Button>
          <Button onClick={() => navigate('/leads/new')} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Source: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Source: All</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="email">Email Campaign</SelectItem>
                <SelectItem value="tradeshow">Trade Show</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="coldcall">Cold Call</SelectItem>
              </SelectContent>
            </Select>

            {/* Stage Filter */}
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stage: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Stage: All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort and Filter Buttons */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={sortByScore ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSortByScore(!sortByScore)}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sort by Activity Score</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sort Options</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advanced Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Table */}
          {loading ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Lead Name</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Company</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Source</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Contact Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Activity Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[180px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[140px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px] rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px] rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-6">
                <Skeleton className="h-5 w-[200px]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-[80px]" />
                  <Skeleton className="h-9 w-[80px]" />
                </div>
              </div>
            </>
          ) : paginatedLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Lead Name</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Company</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Source</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Contact Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase">Activity Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead: Lead) => (
                    <TableRow
                      key={lead.id}
                      onClick={() => handleRowClick(lead.id)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors duration-150"
                    >
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.company || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.source || 'Website'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(lead.createdAt), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        <ActivityScoreBadge score={lead.activityScore} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedLeads.length)} of {sortedLeads.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
