import { NextResponse } from "next/server";

export interface ApiResponseMeta {
  request_id?: string;
  cursor?: string | null;
  has_more?: boolean;
  total_count?: number;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    request_id: string;
  };
}

export function generateRequestId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function apiSuccess<T>(
  data: T,
  meta?: Omit<ApiResponseMeta, "request_id">,
  status = 200,
  requestId = generateRequestId()
): NextResponse<ApiSuccessEnvelope<T>> {
  return NextResponse.json(
    {
      data,
      meta: {
        request_id: requestId,
        ...meta,
      },
    },
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  details?: ApiErrorDetail[],
  status = 400,
  requestId = generateRequestId()
): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details: details && details.length > 0 ? details : undefined,
        request_id: requestId,
      },
    },
    { status }
  );
}
