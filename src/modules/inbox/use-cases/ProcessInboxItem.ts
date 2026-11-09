/**
 * ProcessInboxItem Use Case
 *
 * Atomically converts an unprocessed inbox item into a canonical entity (task)
 * with strict idempotency and boundary validation.
 */

import { IInboxRepository, ProcessInboxItemDTO, InboxItem } from "../types";
import { ITaskRepository } from "@/modules/tasks/task.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";

export interface ProcessInboxItemResult {
  item: InboxItem;
  created_entity_id: string;
  target_type: string;
  idempotent: boolean;
}

export class ProcessInboxItem {
  constructor(
    private inboxRepo: IInboxRepository,
    private taskRepo?: ITaskRepository
  ) {}

  async execute(
    userId: string,
    id: string,
    dto: ProcessInboxItemDTO
  ): Promise<ProcessInboxItemResult> {
    // 1. Boundary check: Only implemented target types are supported
    if (dto.target_type !== "task") {
      throw new ValidationError(
        `Conversion target '${dto.target_type}' is not supported. Implemented conversion target: 'task'.`
      );
    }

    // 2. Fetch existing inbox item
    const item = await this.inboxRepo.findById(userId, id);
    if (!item) {
      throw new NotFoundError(`Inbox item ${id} not found`);
    }

    // 3. Idempotency guard: Return immediately if already processed
    if (item.status === "processed" && item.converted_entity_id) {
      return {
        item,
        created_entity_id: item.converted_entity_id,
        target_type: item.converted_entity_type || "task",
        idempotent: true,
      };
    }

    const title = item.title;
    const description = item.content || (item.url ? `Source: ${item.url}` : undefined);

    // 4. Atomic PostgreSQL execution via RPC if repository supports it
    if (typeof this.inboxRepo.processItemToTaskAtomic === "function") {
      try {
        return await this.inboxRepo.processItemToTaskAtomic(
          userId,
          id,
          dto,
          title,
          description
        );
      } catch (err: unknown) {
        // If RPC succeeds or fails, pass error through
        throw err;
      }
    }

    // 5. Compensating transaction fallback (e.g., in-memory or test repos)
    if (!this.taskRepo) {
      throw new ValidationError("Task repository not available for inbox conversion");
    }

    let createdTaskId: string | null = null;
    try {
      const task = await this.taskRepo.create(userId, {
        title,
        description,
        priority: dto.priority || "medium",
        due_date: dto.due_date || null,
        project_id: dto.project_id || null,
        source_type: "inbox",
        source_id: item.id,
      });

      createdTaskId = task.id;

      const updatedItem = await this.inboxRepo.markProcessed(
        userId,
        id,
        "task",
        task.id
      );

      return {
        item: updatedItem,
        created_entity_id: task.id,
        target_type: "task",
        idempotent: false,
      };
    } catch (err: unknown) {
      // Compensate: rollback created task if inbox update failed
      if (createdTaskId && this.taskRepo.delete) {
        try {
          await this.taskRepo.delete(userId, createdTaskId);
        } catch {
          // Best effort rollback
        }
      }
      throw err;
    }
  }
}
