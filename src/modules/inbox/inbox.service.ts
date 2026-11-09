import {
  InboxItem,
  CreateInboxItemDTO,
  UpdateInboxItemDTO,
  ProcessInboxItemDTO,
  InboxFilters,
  IInboxRepository,
} from "./types";
import { ITaskRepository } from "../tasks/task.repository";
import { ProcessInboxItem, ProcessInboxItemResult } from "./use-cases/ProcessInboxItem";

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
   * Process and convert an inbox item into a task atomically with idempotency.
   */
  async processItem(
    userId: string,
    id: string,
    dto: ProcessInboxItemDTO
  ): Promise<ProcessInboxItemResult> {
    const useCase = new ProcessInboxItem(this.inboxRepo, this.taskRepo);
    return useCase.execute(userId, id, dto);
  }
}
