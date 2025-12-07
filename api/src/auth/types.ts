// api/src/auth/types.ts
import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

// This extends the standard Express Request to include our User
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
