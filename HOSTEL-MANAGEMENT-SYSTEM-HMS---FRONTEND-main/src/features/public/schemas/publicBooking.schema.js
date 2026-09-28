import { z } from 'zod';

export const publicBookingSchema = z.object({
  branchId: z.string().trim().min(1, 'Branch is required'),
  bedId: z.string().trim().min(1, 'Bed is required'),
  roomId: z.string().trim().optional(),
});

export const publicFullPaymentSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
});
