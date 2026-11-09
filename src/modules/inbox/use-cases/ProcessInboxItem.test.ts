import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessInboxItem } from "./ProcessInboxItem";
import { NotFoundError, ValidationError } from "@/lib/errors";

describe("ProcessInboxItem Use Case", () => {
  const mockInboxRepo = {
    findById: vi.fn(),
    markProcessed: vi.fn(),
    processItemToTaskAtomic: vi.fn(),
  } as any;

  const mockTaskRepo = {
    create: vi.fn(),
    delete: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws ValidationError when an unsupported target type is provided", async () => {
    const useCase = new ProcessInboxItem(mockInboxRepo, mockTaskRepo);

    await expect(
      useCase.execute("user-1", "inbox-1", {
        target_type: "project" as any,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when inbox item does not exist", async () => {
    mockInboxRepo.findById.mockResolvedValue(null);
    const useCase = new ProcessInboxItem(mockInboxRepo, mockTaskRepo);

    await expect(
      useCase.execute("user-1", "inbox-nonexistent", {
        target_type: "task",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("is idempotent when item is already processed", async () => {
    mockInboxRepo.findById.mockResolvedValue({
      id: "inbox-1",
      user_id: "user-1",
      title: "Already processed note",
      status: "processed",
      converted_entity_type: "task",
      converted_entity_id: "task-existing-123",
    });

    const useCase = new ProcessInboxItem(mockInboxRepo, mockTaskRepo);
    const result = await useCase.execute("user-1", "inbox-1", {
      target_type: "task",
    });

    expect(result.idempotent).toBe(true);
    expect(result.created_entity_id).toBe("task-existing-123");
    expect(mockTaskRepo.create).not.toHaveBeenCalled();
    expect(mockInboxRepo.markProcessed).not.toHaveBeenCalled();
  });

  it("uses atomic RPC when repository supports processItemToTaskAtomic", async () => {
    mockInboxRepo.findById.mockResolvedValue({
      id: "inbox-1",
      user_id: "user-1",
      title: "Atomic item",
      status: "unprocessed",
    });

    mockInboxRepo.processItemToTaskAtomic.mockResolvedValue({
      item: { id: "inbox-1", status: "processed" },
      created_entity_id: "task-rpc-999",
      target_type: "task",
      idempotent: false,
    });

    const useCase = new ProcessInboxItem(mockInboxRepo, mockTaskRepo);
    const result = await useCase.execute("user-1", "inbox-1", {
      target_type: "task",
      priority: "high",
    });

    expect(mockInboxRepo.processItemToTaskAtomic).toHaveBeenCalledWith(
      "user-1",
      "inbox-1",
      expect.objectContaining({ target_type: "task", priority: "high" }),
      "Atomic item",
      undefined
    );
    expect(result.created_entity_id).toBe("task-rpc-999");
    expect(result.idempotent).toBe(false);
  });

  it("rolls back created task when markProcessed fails during non-atomic execution", async () => {
    // Delete atomic method to test compensating transaction
    const nonAtomicInboxRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "inbox-1",
        user_id: "user-1",
        title: "Failing item",
        status: "unprocessed",
      }),
      markProcessed: vi.fn().mockRejectedValue(new Error("Database write failed")),
    } as any;

    mockTaskRepo.create.mockResolvedValue({ id: "task-temp-1" });
    mockTaskRepo.delete.mockResolvedValue(true);

    const useCase = new ProcessInboxItem(nonAtomicInboxRepo, mockTaskRepo);

    await expect(
      useCase.execute("user-1", "inbox-1", { target_type: "task" })
    ).rejects.toThrow("Database write failed");

    expect(mockTaskRepo.create).toHaveBeenCalled();
    expect(mockTaskRepo.delete).toHaveBeenCalledWith("user-1", "task-temp-1");
  });
});
