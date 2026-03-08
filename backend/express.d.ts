import { Request } from 'express';

declare module 'express' {
  export interface Request {
    userId?: string; // Add your custom property here, make it optional if it might not always exist
  }
}
