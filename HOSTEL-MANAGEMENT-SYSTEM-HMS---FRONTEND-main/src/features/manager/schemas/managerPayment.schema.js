import { z } from 'zod';

export const managerBranchPaymentSchema = z.object({
  branchId: z.string().trim().min(1, 'Branch ID is required'),
});

export const managerCashPaymentSchema = z.object({
  tenantId: z.string().trim().min(1, 'Tenant ID is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export const managerInvoiceSchema = z.object({
  paymentId: z.string().trim().min(1, 'Payment ID is required'),
});
