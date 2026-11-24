import { z } from 'zod';
import { CleanPeriod } from './CleanPeriod';

export const cleanSchema = z.object({
  period: z.enum([CleanPeriod.DAY, CleanPeriod.WEEK, CleanPeriod.MONTH, CleanPeriod.YEAR]),
});
