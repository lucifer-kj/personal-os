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
});
