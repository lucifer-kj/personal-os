import {
  InboxItem,
  CreateInboxItemDTO,
  UpdateInboxItemDTO,
  ProcessInboxItemDTO,
  InboxFilters,
  IInboxRepository,
} from "./types";
import { ITaskRepository } from "../tasks/task.repository";

export class InboxService {
  constructor(
    private inboxRepo: IInboxRepository,
    private taskRepo?: ITaskRepository
  ) {}

  async listItems(userId: string, filters?: InboxFilters) {
    return this.inboxRepo.findMany(userId, filters);
  }

  async getItemById(userId: string, id: string) {
    return this.inboxRepo.findById(userId, id);
  }

  async captureItem(dto: CreateInboxItemDTO) {
    return this.inboxRepo.create(dto);
  }

  async updateItem(userId: string, id: string, dto: UpdateInboxItemDTO) {
    return this.inboxRepo.update(userId, id, dto);
  }

  async dismissItem(userId: string, id: string) {
    return this.inboxRepo.update(userId, id, { status: "dismissed" });
  }

  async deleteItem(userId: string, id: string) {
    return this.inboxRepo.delete(userId, id);
  }

  /**
   * Process and convert an inbox item into a task or other entity.
   */
  async processItem(
    userId: string,
    id: string,
    dto: ProcessInboxItemDTO
  ): Promise<{ item: InboxItem; created_entity_id: string; target_type: string }> {
    const item = await this.inboxRepo.findById(userId, id);
    if (!item) {
      throw new Error(`Inbox item ${id} not found`);
    }

    if (item.status === "processed") {
      throw new Error("Inbox item has already been processed");
    }

    let createdEntityId: string;

    if (dto.target_type === "task") {
      if (!this.taskRepo) {
        throw new Error("Task repository not available for inbox conversion");
      }

      const task = await this.taskRepo.create(userId, {
        title: item.title,
        description: item.content || (item.url ? `Source: ${item.url}` : undefined),
        priority: dto.priority || "medium",
        due_date: dto.due_date || null,
        project_id: dto.project_id || null,
        source_type: "inbox",
        source_id: item.id,
      });

      createdEntityId = task.id;
    } else {
      // Future entities (note, project, event) fallback placeholder ID
      createdEntityId = crypto.randomUUID();
    }

    const updatedItem = await this.inboxRepo.markProcessed(
      userId,
      id,
      dto.target_type,
      createdEntityId
    );

    return {
      item: updatedItem,
      created_entity_id: createdEntityId,
      target_type: dto.target_type,
    };
  }
}
