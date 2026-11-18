import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadCard } from "./LeadCard";
import { Lead } from "@/modules/leads/types";

describe("LeadCard Component", () => {
  const sampleLead: Lead = {
    id: "lead-101",
    user_id: "user-1",
    status: "lead",
    source: "n8n_scraper",
    full_name: "Dr. Roy Dental Clinic",
    business_name: "Dr. Roy Dental Clinic",
    category: "Healthcare",
    subcategory: "Dentist",
    location: "Salt Lake Sector V, Kolkata",
    score: 85,
    score_tier: "hot",
    estimated_value_cents: 3500000,
    enrichment_data: {},
    phone: "+919830111222",
    phone_formatted: "+919830111222",
    website: "www.roydental.in",
    lighthouse_mobile: 32,
    lighthouse_desktop: 60,
    has_ssl: true,
    cms_detected: "WordPress 5.2",
    decision_maker_name: "Dr. A. Roy",
    decision_maker_title: "Managing Doctor",
    recommended_service: "Speed Optimization & WhatsApp Bot",
    tailored_pitch: "Dr. Roy, your clinic website takes 8.2 seconds to load on mobile phones. Patients bounce before booking.",
    created_at: "2026-11-17T00:00:00Z",
    updated_at: "2026-11-17T00:00:00Z",
  };

  it("renders business name, decision maker, Lighthouse mobile gauge, and score", () => {
    const handleStatus = vi.fn().mockResolvedValue(undefined);
    const handleConvert = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadCard lead={sampleLead} onStatusChange={handleStatus} onConvert={handleConvert} />
    );

    expect(screen.getByText("Dr. Roy Dental Clinic")).toBeInTheDocument();
    expect(screen.getByText(/Dr\. A\. Roy/)).toBeInTheDocument();
    expect(screen.getByText("Mobile: 32/100")).toBeInTheDocument();
    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText(/Healthcare > Dentist/)).toBeInTheDocument();
  });

  it("renders 1-Click WhatsApp deeplink with pre-filled pitch message", () => {
    const handleStatus = vi.fn().mockResolvedValue(undefined);
    const handleConvert = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadCard lead={sampleLead} onStatusChange={handleStatus} onConvert={handleConvert} />
    );

    const waLink = screen.getByRole("link", { name: /1-Click WhatsApp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink.getAttribute("href")).toContain("https://wa.me/919830111222");
    expect(waLink.getAttribute("href")).toContain(encodeURIComponent("Dr. Roy, your clinic website takes 8.2 seconds"));
  });

  it("toggles consultative pitch drawer when clicking View Pitch", () => {
    const handleStatus = vi.fn().mockResolvedValue(undefined);
    const handleConvert = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadCard lead={sampleLead} onStatusChange={handleStatus} onConvert={handleConvert} />
    );

    const toggleBtn = screen.getByRole("button", { name: /View Pitch/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/takes 8.2 seconds to load on mobile/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide Pitch/i })).toBeInTheDocument();
  });

  it("triggers conversion when Convert button is clicked", async () => {
    const handleStatus = vi.fn().mockResolvedValue(undefined);
    const handleConvert = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadCard lead={sampleLead} onStatusChange={handleStatus} onConvert={handleConvert} />
    );

    const convertBtn = screen.getByRole("button", { name: /Convert/i });
    fireEvent.click(convertBtn);

    expect(handleConvert).toHaveBeenCalledWith("lead-101");
  });
});
