"use client";

import * as React from "react";
import { LeadNiche, LeadLocation } from "@/modules/leads/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export function TargetingView() {
  const [niches, setNiches] = React.useState<LeadNiche[]>([]);
  const [locations, setLocations] = React.useState<LeadLocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // New Niche Form State
  const [isAddingNiche, setIsAddingNiche] = React.useState(false);
  const [nicheName, setNicheName] = React.useState("");
  const [nicheVertical, setNicheVertical] = React.useState("Healthcare");
  const [nicheOsmTag, setNicheOsmTag] = React.useState("");
  const [nichePitch, setNichePitch] = React.useState("");

  // New Location Form State
  const [isAddingLocation, setIsAddingLocation] = React.useState(false);
  const [locName, setLocName] = React.useState("");
  const [locCity, setLocCity] = React.useState("Kolkata");
  const locLat = "22.5726";
  const locLon = "88.3639";
  const [locRadius, setLocRadius] = React.useState("3.0");

  const fetchData = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [nichesRes, locsRes] = await Promise.all([
        fetch("/api/v1/engine/niches"),
        fetch("/api/v1/engine/locations"),
      ]);

      if (nichesRes.ok) {
        const json = await nichesRes.json();
        setNiches(json.data || []);
      }
      if (locsRes.ok) {
        const json = await locsRes.json();
        setLocations(json.data || []);
      }
    } catch {
      toast.error("Failed to load targeting parameters");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isSubscribed = true;
    Promise.resolve().then(async () => {
      if (isSubscribed) {
        await fetchData();
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [fetchData]);

  const handleCreateNiche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheName.trim()) return;

    try {
      const res = await fetch("/api/v1/engine/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nicheName.trim(),
          vertical: nicheVertical,
          osm_tags: nicheOsmTag ? [nicheOsmTag.trim()] : [],
          default_pitch_angle: nichePitch.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create niche");
      toast.success("Niche added to autonomous search catalog");
      setNicheName("");
      setNicheOsmTag("");
      setNichePitch("");
      setIsAddingNiche(false);
      await fetchData();
    } catch {
      toast.error("Could not add niche");
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    try {
      const res = await fetch("/api/v1/engine/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locName.trim(),
          city: locCity.trim(),
          latitude: parseFloat(locLat) || 22.5726,
          longitude: parseFloat(locLon) || 88.3639,
          radius_km: parseFloat(locRadius) || 3.0,
        }),
      });

      if (!res.ok) throw new Error("Failed to create location");
      toast.success("Commercial location added to crawler matrix");
      setLocName("");
      setIsAddingLocation(false);
      await fetchData();
    } catch {
      toast.error("Could not add location");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Strategy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Autonomous Targeting Control
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Configure target verticals, OSM tags, and geographic hubs dispatched to n8n workers.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => fetchData(true)} disabled={isLoading} className="gap-1.5 self-start">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Parameters
        </Button>
      </div>

      {/* Niches Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h3 className="font-medium text-sm text-[var(--foreground)]">Target Verticals &amp; Niches ({niches.length})</h3>
          </div>
          <Button size="sm" onClick={() => setIsAddingNiche(!isAddingNiche)} className="gap-1 text-xs h-8">
            <Plus className="w-3.5 h-3.5" />
            {isAddingNiche ? "Cancel" : "Add Niche"}
          </Button>
        </div>

        {isAddingNiche && (
          <form onSubmit={handleCreateNiche} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Niche Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dental Clinics"
                  value={nicheName}
                  onChange={(e) => setNicheName(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Vertical Category</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare"
                  value={nicheVertical}
                  onChange={(e) => setNicheVertical(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">OSM Tag</label>
                <input
                  type="text"
                  placeholder="e.g. amenity=dentist"
                  value={nicheOsmTag}
                  onChange={(e) => setNicheOsmTag(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Default Pitch Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile booking loss & slow LCP"
                  value={nichePitch}
                  onChange={(e) => setNichePitch(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="text-xs">Save Niche</Button>
          </form>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 animate-pulse" />
            ))}
          </div>
        ) : niches.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
            <p className="text-xs text-[var(--muted-foreground)]">No targeting verticals configured. Add your first niche above or click Refresh Parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {niches.map((niche) => (
              <div key={niche.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-[var(--foreground)]">{niche.name}</span>
                  <Badge variant={niche.is_active ? "success" : "secondary"}>
                    {niche.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  {niche.vertical}
                </div>
                {niche.osm_tags && niche.osm_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {niche.osm_tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {niche.default_pitch_angle && (
                  <p className="text-xs text-[var(--foreground)] italic line-clamp-2">
                    &ldquo;{niche.default_pitch_angle}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locations Master Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500" />
            <h3 className="font-medium text-sm text-[var(--foreground)]">Commercial Hubs &amp; Territories ({locations.length})</h3>
          </div>
          <Button size="sm" onClick={() => setIsAddingLocation(!isAddingLocation)} className="gap-1 text-xs h-8">
            <Plus className="w-3.5 h-3.5" />
            {isAddingLocation ? "Cancel" : "Add Location"}
          </Button>
        </div>

        {isAddingLocation && (
          <form onSubmit={handleCreateLocation} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Hub Name</label>
                <input
                  type="text"
                  placeholder="e.g. Salt Lake Sector V"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">City</label>
                <input
                  type="text"
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Radius (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={locRadius}
                  onChange={(e) => setLocRadius(e.target.value)}
                  className="w-full text-xs mt-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="text-xs">Save Location</Button>
          </form>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 animate-pulse" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
            <p className="text-xs text-[var(--muted-foreground)]">No commercial hubs configured. Add your first territory above or click Refresh Parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-[var(--foreground)]">{loc.name}</span>
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">
                    {loc.radius_km} km radius
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-500" />
                  {loc.city}
                  {loc.latitude !== undefined && loc.longitude !== undefined && (
                    <span>({Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
