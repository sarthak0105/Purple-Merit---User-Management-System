import { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

// Extend Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Protect a route — requires a valid Bearer JWT */
export function protect(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    sendError(res, 'No token provided. Please log in.', 401);
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token. Please log in again.', 401);
  }
}

/** Restrict access to specific roles */
export function restrictTo(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'You do not have permission to perform this action', 403);
      return;
    }
    next();
  };
}
