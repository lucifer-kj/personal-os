"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { LeadCard } from "./LeadCard";
import { LeadGridView } from "./LeadGridView";
import { LeadStackCarousel } from "./LeadStackCarousel";
import { LeadKanbanView } from "./LeadKanbanView";
import { LeadDetailModal } from "./LeadDetailModal";
import { CreateLeadModal } from "./CreateLeadModal";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Layers,
  Kanban,
  List as ListIcon,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "grid" | "stack" | "kanban" | "list";

export function LeadList() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const fetchLeads = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const json = await res.json();
      setLeads(json.data || []);
    } catch {
      toast.error("Could not fetch leads from database");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    let isSubscribed = true;
    Promise.resolve().then(async () => {
      if (isSubscribed) {
        await fetchLeads();
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [fetchLeads]);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const res = await fetch(`/api/v1/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");
    const json = await res.json();
    setLeads((prev) => prev.map((l) => (l.id === id ? json.data : l)));
  };

  const handleConvert = async (id: string) => {
    const res = await fetch(`/api/v1/leads/${id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to convert lead");
    await fetchLeads();
  };

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };

  const handleModalStatusChange = async (id: string, newStatus: LeadStatus) => {
    await handleStatusChange(id, newStatus);
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
  };

  const handleModalConvert = async (id: string) => {
    await handleConvert(id);
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status: "converted" as LeadStatus } : prev));
  };

  // Metrics
  const totalCount = leads.length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards: Compact 3-col on mobile, full on desktop */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 sm:p-4 shadow-xs hover:border-[var(--primary)]/30 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
              Pipeline
            </span>
            <Users className="w-3.5 h-3.5 text-[var(--muted-foreground)] hidden sm:block shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl font-mono font-semibold tabular-nums text-[var(--foreground)]">
              {totalCount}
            </span>
            <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] hidden sm:inline">active profiles</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 sm:p-4 shadow-xs hover:border-amber-500/30 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
              Qualified
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 hidden sm:block shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl font-mono font-semibold tabular-nums text-[var(--foreground)]">
              {qualifiedCount}
            </span>
            <span className="text-[10px] sm:text-xs text-amber-500/80 hidden sm:inline">ready for discovery</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 sm:p-4 shadow-xs hover:border-emerald-500/30 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
              Converted
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 hidden sm:block shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl font-mono font-semibold tabular-nums text-[var(--foreground)]">
              {convertedCount}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-500/80 hidden sm:inline">client projects</span>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-xs">
        {/* Left: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search leads, niche, decision maker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
            />
          </div>

          {/* Status Pills with graceful horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth touch-pan-x -mx-1 px-1">
            {["all", "lead", "contacted", "qualified", "converted", "lost"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === st
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle & Primary Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]/60">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-[var(--muted)]/60 border border-[var(--border)] rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Grid View (Desktop)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("stack")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "stack"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Stacked Deck Carousel (Swipeable Pile)"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Kanban Pipeline Board"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Compact Tactile List"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeads(true)}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 text-xs font-medium gap-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Leads Views */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-[var(--border)] bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
          <Users className="w-10 h-10 mx-auto text-[var(--muted-foreground)] mb-3 opacity-60" />
          <h3 className="font-serif font-medium text-base text-[var(--foreground)]">
            No leads found
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1 mb-4">
            {search || statusFilter !== "all"
              ? "No leads match your current filter criteria."
              : "Your CRM pipeline is ready. Create your first lead or let your n8n scraper automatically ingest contacts."}
          </p>
          <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Lead
          </Button>
        </div>
      ) : viewMode === "stack" ? (
        <LeadStackCarousel
          leads={leads}
          onSelectLead={handleOpenDetail}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
        />
      ) : viewMode === "grid" ? (
        <LeadGridView
          leads={leads}
          onSelectLead={handleOpenDetail}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
        />
      ) : viewMode === "kanban" ? (
        <LeadKanbanView
          leads={leads}
          onSelectLead={handleOpenDetail}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {leads.map((lead) => (
            <div key={lead.id} onClick={() => handleOpenDetail(lead)} className="cursor-pointer">
              <LeadCard
                lead={lead}
                onStatusChange={handleStatusChange}
                onConvert={handleConvert}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating Detailed Intelligence Modal (Blurred Backdrop) */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onStatusChange={handleModalStatusChange}
        onConvert={handleModalConvert}
      />

      {/* Creation Modal */}
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={fetchLeads}
      />
    </div>
  );
}
