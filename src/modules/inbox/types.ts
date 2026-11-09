export type CaptureType =
  | "task"
  | "note"
  | "idea"
  | "link"
  | "reminder"
  | "other";

export type InboxStatus = "unprocessed" | "processed" | "dismissed";

export type CaptureSource =
  | "manual"
  | "widget"
  | "extension"
  | "ai"
  | "integration";

export type ConvertedEntityType = "task" | "note" | "project" | "event";

export interface InboxItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  capture_type: CaptureType;
  status: InboxStatus;
  source: CaptureSource;
  url: string | null;
  converted_entity_type: ConvertedEntityType | null;
  converted_entity_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInboxItemDTO {
  user_id: string;
  title: string;
  content?: string | null;
  capture_type?: CaptureType;
  source?: CaptureSource;
  url?: string | null;
}

export interface UpdateInboxItemDTO {
  title?: string;
  content?: string | null;
  capture_type?: CaptureType;
  status?: InboxStatus;
  url?: string | null;
}

export interface ProcessInboxItemDTO {
  target_type: ConvertedEntityType;
  // Specific task parameters if converting to task
  due_date?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  project_id?: string | null;
  idempotency_key?: string;
}

export interface InboxFilters {
  status?: InboxStatus | "all";
  capture_type?: CaptureType;
  search?: string;
}

export interface IInboxRepository {
  findMany(
    userId: string,
    filters?: InboxFilters
  ): Promise<{ items: InboxItem[]; total: number }>;

  findById(userId: string, id: string): Promise<InboxItem | null>;

  create(data: CreateInboxItemDTO): Promise<InboxItem>;

  update(
    userId: string,
    id: string,
    data: UpdateInboxItemDTO
  ): Promise<InboxItem>;

  markProcessed(
    userId: string,
    id: string,
    entityType: ConvertedEntityType,
    entityId: string
  ): Promise<InboxItem>;

  processItemToTaskAtomic?(
    userId: string,
    id: string,
    dto: ProcessInboxItemDTO,
    title: string,
    description?: string
  ): Promise<{ item: InboxItem; created_entity_id: string; target_type: string; idempotent: boolean }>;

  delete(userId: string, id: string): Promise<boolean>;
}
