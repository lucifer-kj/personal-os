"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { LeadCard } from "./LeadCard";
import { CreateLeadModal } from "./CreateLeadModal";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function LeadList() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchLeads = React.useCallback(async () => {
    setIsLoading(true);
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
    fetchLeads();
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

  // Metrics
  const totalCount = leads.length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Pipeline Leads
            </span>
            <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[var(--foreground)]">
              {totalCount}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">active profiles</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Qualified
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[var(--foreground)]">
              {qualifiedCount}
            </span>
            <span className="text-xs text-amber-500/80">ready for discovery</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Converted
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[var(--foreground)]">
              {convertedCount}
            </span>
            <span className="text-xs text-emerald-500/80">client projects</span>
          </div>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "lead", "contacted", "qualified", "converted", "lost"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
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
            className="h-8 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Leads Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-[var(--border)] bg-[var(--card)] animate-pulse"
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
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={fetchLeads}
      />
    </div>
  );
}
