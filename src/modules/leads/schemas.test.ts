import { describe, it, expect } from "vitest";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  ConvertLeadSchema,
  LeadFilterSchema,
} from "./schemas";

describe("Leads validation schemas", () => {
  describe("CreateLeadSchema", () => {
    it("accepts valid input with minimal required full_name", () => {
      const res = CreateLeadSchema.safeParse({ full_name: "John Doe" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.full_name).toBe("John Doe");
        expect(res.data.source).toBe("manual");
        expect(res.data.score).toBe(0);
      }
    });

    it("accepts full enriched lead payload", () => {
      const res = CreateLeadSchema.safeParse({
        full_name: "Sarah Connor",
        first_name: "Sarah",
        last_name: "Connor",
        email: "sarah@cyberdyne.io",
        phone: "+15550001111",
        company: "Cyberdyne Systems",
        job_title: "Security Architect",
        website: "https://cyberdyne.io",
        linkedin_url: "https://linkedin.com/in/sarah-connor",
        source: "linkedin",
        score: 85,
        estimated_value_cents: 500000,
        notes: "High intent prospective enterprise client",
      });
      expect(res.success).toBe(true);
    });

    it("rejects missing full_name", () => {
      const res = CreateLeadSchema.safeParse({ email: "test@example.com" });
      expect(res.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const res = CreateLeadSchema.safeParse({
        full_name: "Bob",
        email: "not-an-email",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("ConvertLeadSchema", () => {
    it("accepts empty object or custom project name", () => {
      const res1 = ConvertLeadSchema.safeParse({});
      expect(res1.success).toBe(true);

      const res2 = ConvertLeadSchema.safeParse({
        project_name: "Acme Cloud Migration",
        project_description: "Enterprise consulting engagement",
      });
      expect(res2.success).toBe(true);
    });
  });

  describe("LeadFilterSchema", () => {
    it("parses query parameters with proper coercion", () => {
      const res = LeadFilterSchema.safeParse({
        status: "qualified",
        min_score: "60",
        limit: "25",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe("qualified");
        expect(res.data.min_score).toBe(60);
        expect(res.data.limit).toBe(25);
      }
    });
  });
});
