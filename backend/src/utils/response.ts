import { Response } from 'express';

/** Standard success response — matches frontend ApiResponse<T> */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/** Standard error response — matches frontend ApiResponse<T> */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}

/** Paginated response — matches frontend PaginatedResponse<T> */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  return res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
