import { z } from 'zod';
/**
 * Create a return response out of a schema. This one is for single objects
 * @param {any} s The schema object. See the other exports in this file.
 * @returns
 */
export const singleSchema = (/** @type {any} */ s) => {
	return {
		type: 'object',
		required: ['success', 'data'],
		properties: {
			success: { type: 'boolean' },
			data: s,
		},
	};
};

/**
 * Create a return response out of a schema. This one supports arrays of objects.
 * @param {any} s The schema object. See the other exports in this file.
 * @returns
 */
export const multipleSchema = (/** @type {any} */ s) => {
	return {
		type: 'object',
		required: ['success', 'data'],
		properties: {
			success: { type: 'boolean' },
			data: {
				type: 'array',
				items: s,
			},
		},
	};
};

export const log = {
	type: 'object',
	required: ['id', 'action_id', 'action_code', 'action_description', 'created_at', 'entity_name'],
	properties: {
		id: { type: 'string' },
		action_id: { type: 'string', format: 'uuid' },
		action_code: { type: 'string' },
		action_description: { type: 'string' },
		created_at: { type: 'string', format: 'date-time' },
		description: { type: 'string' },
		entity_name: { type: 'string' },
	},
};

export const queue = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		entity_id: { type: 'string', format: 'uuid' },
		entity_type: { type: 'string' },
		action: {
			type: 'object',
			properties: {
				actions: {
					type: 'object',
					properties: {
						config: { type: 'object' },
						action_id: { type: 'string', format: 'uuid' },
						useraction: { type: 'boolean' },
						action_code: { type: 'string' },
						action_type: { type: 'string' },
						parent_action_id: { type: ['string', 'null'], format: 'uuid' },
						action_description: { type: 'string' },
					},
					required: ['action_id', 'action_code', 'action_type', 'action_description'],
				},
				entity_id: { type: 'string', format: 'uuid' },
				sequence_id: { type: 'string', format: 'uuid' },
				sequence_code: { type: 'string' },
				action_matrix_id: { type: 'string', format: 'uuid' },
				action_matrix_code: { type: 'string' },
				current_status_code: { type: 'string' },
				sequence_description: { type: 'string' },
				current_status_description: { type: 'string' },
				status_on_sequence_failure_id: { type: 'string', format: 'uuid' },
				status_on_sequence_success_id: { type: 'string', format: 'uuid' },
				status_on_sequence_failure_code: { type: 'string' },
				status_on_sequence_success_code: { type: 'string' },
				status_on_sequence_failure_description: { type: 'string' },
				status_on_sequence_success_description: { type: 'string' },
			},
			required: [
				'actions',
				'entity_id',
				'sequence_id',
				'sequence_code',
				'action_matrix_id',
				'action_matrix_code',
				'current_status_code',
				'sequence_description',
				'current_status_description',
				'status_on_sequence_failure_id',
				'status_on_sequence_success_id',
				'status_on_sequence_failure_code',
				'status_on_sequence_success_code',
				'status_on_sequence_failure_description',
				'status_on_sequence_success_description',
			],
		}, // Updated action property
		payload: { type: 'object' },
		result: { type: 'object' },
		created_at: { type: 'string', format: 'date-time' },
		start: { type: 'string', format: 'date-time' },
		retries: { type: 'number', nullable: true },
		status: { type: 'string' },
	},
	required: [
		'id',
		'entity_id',
		'entity_type',
		'action',
		'payload',
		'result',
		'created_at',
		'status',
		'retries',
		'start',
	],
};

export const entity = {
	type: 'object',
	required: ['id', 'name', 'created_at', 'updated_at', 'status_code', 'entity_type', 'status_description'],
	properties: {
		id: { type: 'string', format: 'uuid' },
		name: { type: 'string' },
		created_at: { type: 'string', format: 'date-time' },
		updated_at: { type: 'string', format: 'date-time' },
		status_code: { type: 'string' },
		entity_type: { type: 'string' },
		locked: { type: 'boolean', default: false },
		status_description: { type: 'string' },
		sequences: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					sequence_id: { type: 'string', format: 'uuid' },
					sequence_code: { type: 'string' },
					sequence_description: { type: 'string' },
					status_on_sequence_success_code: { type: 'string' },
					status_on_sequence_failure_code: { type: 'string' },
				},
				required: [
					'sequence_id',
					'sequence_code',
					'sequence_description',
					'status_on_sequence_success_code',
					'status_on_sequence_failure_code',
				],
			},
		},
	},
};

// Webhook schema
export const webhooks = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		headers: {
			type: 'array',
			items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'string' } } },
		},
		parameters: {
			type: 'array',
			items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'string' } } },
		},
		url: { type: 'string' },
		method: { type: 'string' },
		fields: {
			type: 'array',
			items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' } } },
		},
		name: { type: 'string' },
	},
	required: ['url', 'method', 'name'],
};

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
