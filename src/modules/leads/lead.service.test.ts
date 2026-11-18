import { describe, it, expect, beforeEach } from "vitest";
import { LeadService } from "./lead.service";
import { getInMemoryLeadRepository } from "./lead.repository";

describe("LeadService domain logic & CRM workflows", () => {
  const repo = getInMemoryLeadRepository();
  const service = new LeadService(repo);

  const USER_A = "00000000-0000-0000-0000-000000000001";
  const USER_B = "00000000-0000-0000-0000-000000000002";

  beforeEach(() => {
    repo.clear();
  });

  it("calculates automated lead score when not explicitly provided", async () => {
    // Lead with email (+20), phone (+20), company (+20), linkedin (+15) => score = 75
    const lead = await service.createLead(USER_A, {
      full_name: "Bruce Wayne",
      email: "bruce@wayneenterprises.com",
      phone: "+15551234567",
      company: "Wayne Enterprises",
      linkedin_url: "https://linkedin.com/in/bruce-wayne",
    });

    expect(lead.id).toBeDefined();
    expect(lead.score).toBe(75);
    expect(lead.status).toBe("lead");
  });

  it("logs activity when lead status transitions", async () => {
    const lead = await service.createLead(USER_A, {
      full_name: "Clark Kent",
      email: "clark@dailyplanet.com",
    });

    const updated = await service.updateLead(USER_A, lead.id, {
      status: "qualified",
    });

    expect(updated?.status).toBe("qualified");

    const activities = await service.listActivities(USER_A, lead.id);
    expect(activities.length).toBeGreaterThanOrEqual(2); // initial creation + status change
    const statusActivity = activities.find((a) => a.activity_type === "status_changed");
    expect(statusActivity).toBeDefined();
    expect(statusActivity?.summary).toContain("qualified");
  });

  it("converts a qualified lead into project and onboarding task", async () => {
    const lead = await service.createLead(USER_A, {
      full_name: "Diana Prince",
      company: "Themyscira Antiques",
      email: "diana@themyscira.org",
    });

    const result = await service.convertLead(USER_A, lead.id, {
      project_name: "Global Archival Preservation",
    });

    expect(result.success).toBe(true);
    expect(result.project_id).toBeDefined();
    expect(result.task_id).toBeDefined();

    const convertedLead = await service.getLead(USER_A, lead.id);
    expect(convertedLead?.status).toBe("converted");
    expect(convertedLead?.converted_project_id).toBe(result.project_id);
  });

  it("enforces strict user enclave isolation", async () => {
    const leadA = await service.createLead(USER_A, {
      full_name: "User A Contact",
    });

    // User B should not see or be able to query User A's lead
    const resultForB = await service.getLead(USER_B, leadA.id);
    expect(resultForB).toBeNull();

    const listForB = await service.listLeads(USER_B);
    expect(listForB.leads.length).toBe(0);
  });

  it("handles batch ingestion with deduplication by dedupe_key", async () => {
    const ingestData = {
      leads: [
        {
          full_name: "Kolkata Dental Care",
          business_name: "Kolkata Dental Care",
          phone: "+919830999999",
          dedupe_key: "osm_node_1001",
          lighthouse_mobile: 32,
          score_tier: "hot" as const,
        },
        {
          full_name: "Apex Diagnostic Lab",
          business_name: "Apex Diagnostic Lab",
          phone: "+919830888888",
          dedupe_key: "osm_node_1002",
          lighthouse_mobile: 45,
          score_tier: "warm" as const,
        },
      ],
      batch_id: "batch-test-01",
    };

    const result = await service.batchIngest(USER_A, ingestData);
    expect(result.count).toBe(2);

    // Ingesting the same dedupe_key should update instead of creating a duplicate
    const reIngest = await service.batchIngest(USER_A, {
      leads: [
        {
          full_name: "Kolkata Dental Care (Updated)",
          business_name: "Kolkata Dental Care (Updated)",
          dedupe_key: "osm_node_1001",
          lighthouse_mobile: 28,
        },
      ],
    });
    expect(reIngest.count).toBe(1);

    const allLeads = await service.listLeads(USER_A);
    // Total should still be 2 (plus any default seed leads)
    const matching = allLeads.leads.filter((l) => l.dedupe_key === "osm_node_1001");
    expect(matching.length).toBe(1);
    expect(matching[0].business_name).toBe("Kolkata Dental Care (Updated)");
  });

  it("manages targeting niches and locations cleanly", async () => {
    const niche = await service.createNiche(USER_A, {
      name: "Boutique Cafes",
      vertical: "Food & Beverage",
      osm_tags: ["amenity=cafe"],
      avg_deal_value_cents: 2000000,
    });
    expect(niche.id).toBeDefined();
    expect(niche.name).toBe("Boutique Cafes");

    const location = await service.createLocation(USER_A, {
      name: "New Town Hub",
      city: "Kolkata",
      latitude: 22.585,
      longitude: 88.465,
      radius_km: 4.0,
    });
    expect(location.id).toBeDefined();

    const stats = await service.getStats(USER_A);
    expect(stats.active_niches).toBeGreaterThanOrEqual(1);
    expect(stats.active_locations).toBeGreaterThanOrEqual(1);
  });

  it("dispatches and records push triggers for workflows", async () => {
    const trigger = await service.triggerWorkflow(USER_A, "discovery", {
      niche: "Dental Clinics",
      location: "Salt Lake",
    });

    expect(trigger.triggered).toBe(true);
    expect(trigger.executionId).toBeDefined();

    const logs = await service.listLogs(USER_A);
    const triggerLog = logs.find((l) => l.event_type === "workflow_trigger");
    expect(triggerLog).toBeDefined();
    expect(triggerLog?.component).toBe("n8n_discovery");
  });
});
