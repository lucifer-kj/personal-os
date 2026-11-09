import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  handleApiError,
  apiSuccess,
  apiError,
  apiNotFound,
  apiUnauthorized,
} from "./response";
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InfrastructureError,
} from "@/lib/errors";

describe("API Response & Error Envelopes", () => {
  it("formats apiSuccess with data and metadata", async () => {
    const res = apiSuccess({ id: "123" }, { total_count: 1 }, 200, "req-test-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe("123");
    expect(json.meta.request_id).toBe("req-test-1");
    expect(json.meta.total_count).toBe(1);
  });

  it("handles NotFoundError with 404 status and NOT_FOUND code", async () => {
    const err = new NotFoundError("Task 456 not found");
    const res = handleApiError(err);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("Task 456 not found");
  });

  it("handles ValidationError with 422 status and VALIDATION_ERROR code", async () => {
    const err = new ValidationError("Invalid target", [{ field: "target_type", message: "unsupported" }]);
    const res = handleApiError(err);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details).toHaveLength(1);
  });

  it("handles ConflictError with 409 status and CONFLICT code", async () => {
    const err = new ConflictError("Resource already exists");
    const res = handleApiError(err);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.code).toBe("CONFLICT");
  });

  it("handles InfrastructureError with 500 status and INFRASTRUCTURE_ERROR code", async () => {
    const err = new InfrastructureError("PostgreSQL connection refused");
    const res = handleApiError(err);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("INFRASTRUCTURE_ERROR");
  });

  it("handles ZodError with 400 status and mapped field details", async () => {
    const schema = z.object({ title: z.string().min(3) });
    const parseResult = schema.safeParse({ title: "a" });
    if (!parseResult.success) {
      const res = handleApiError(parseResult.error);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.details[0].field).toBe("title");
    }
  });

  it("handles generic Error with 500 status and INTERNAL_ERROR code", async () => {
    const err = new Error("Unexpected crash");
    const res = handleApiError(err);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
  });
});
