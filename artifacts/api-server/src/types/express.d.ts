import type { DbUser } from "../lib/auth-db";

declare global {
  namespace Express {
    interface Request {
      sessionUser?: DbUser;
    }
  }
}
