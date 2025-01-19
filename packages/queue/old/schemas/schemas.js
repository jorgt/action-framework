import { z } from 'zod';

// Zod Schema for payload verification
export const queueAction = z.object({
  entity_id: z.string().uuid(),
  current_status_code: z.string(),
  current_status_description: z.string(),
  action_matrix_id: z.string().uuid(),
  action_matrix_code: z.string(),
  sequence_id: z.string().uuid(),
  sequence_code: z.string(),
  sequence_description: z.string(),
  status_on_sequence_success_id: z.string().uuid(),
  status_on_sequence_success_code: z.string(),
  status_on_sequence_success_description: z.string(),
  status_on_sequence_failure_id: z.string().uuid(),
  status_on_sequence_failure_code: z.string(),
  status_on_sequence_failure_description: z.string(),
  actions: z.object({
    config: z.object({}).passthrough(),
    action_id: z.string().uuid(),
    useraction: z.boolean(),
    action_code: z.string(),
    action_type: z.string(),
    parent_action_id: z.string().uuid().nullable(),
    action_description: z.string(),
  }),
});