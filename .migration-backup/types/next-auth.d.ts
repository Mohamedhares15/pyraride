import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: Role;
      phoneNumber?: string | null;
      // Profile image is NOT stored in session to avoid cookie size limits
      // Fetch it separately from /api/profile endpoint
    };
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    phoneNumber?: string | null;
    // Profile image is NOT stored in user object to avoid JWT token size limits
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    phoneNumber?: string | null;
  }
}

