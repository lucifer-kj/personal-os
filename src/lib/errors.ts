/**
 * Application & Infrastructure Error Hierarchy for Personal OS.
 * Standardizes typed errors across domain, application, and infrastructure layers.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR", 500);
  }
}

export class InfrastructureError extends AppError {
  constructor(message: string) {
    super(message, "INFRASTRUCTURE_ERROR", 500);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ValidationError extends AppError {
  public readonly details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 422);
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}
