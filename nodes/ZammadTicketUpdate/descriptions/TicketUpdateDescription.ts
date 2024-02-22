import type { INodeProperties } from 'n8n-workflow';

export const ticketUpdateDescription: INodeProperties[] = [
	// ----------------------------------
	//           operations
	// ----------------------------------
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ticket'],
			},
		},
		options: [
			{
				name: 'Update',
				value: 'update',
				description: 'Update a ticket',
				action: 'Update a ticket',
			},
		],
		default: 'update',
	},
	{
		displayName: 'Ticket ID',
		name: 'id',
		type: 'string',
		description:
			'Ticket to update. Specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		default: '',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Group Name or ID',
		name: 'group',
		type: 'string',
		placeholder: 'First-Level Helpdesk',
		description:
			'Group that will own the ticket. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		default: '',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['update'],
			},
		},
	},
	// {
	// 	displayName: 'Customer Email Name or ID',
	// 	name: 'customer',
	// 	type: 'options',
	// 	typeOptions: {
	// 		loadOptionsMethod: 'loadCustomerEmails',
	// 	},
	// 	description:
	// 		'Email address of the customer concerned in the ticket to create. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	// 	default: '',
	// 	placeholder: 'hello@n8n.io',
	// 	required: true,
	// 	displayOptions: {
	// 		show: {
	// 			resource: ['ticket'],
	// 			operation: ['create'],
	// 		},
	// 	},
	// },

	{
		displayName: 'State',
		name: 'state',
		type: 'string',
		description:
			'New Ticket State',
		default: '',
		// typeOptions: {
		// 	loadOptionsMethod: 'loadTicketStates',
		// },
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Article',
		name: 'article',
		type: 'fixedCollection',
		placeholder: 'Add Article',
		default: {},
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Article Details',
				name: 'articleDetails',
				values: [
					{
						displayName: 'Subject',
						name: 'subject',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Body',
						name: 'body',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						default: 'internal',
						options: [
							{
								name: 'External',
								value: 'external',
								description: 'Visible to customers',
							},
							{
								name: 'Internal',
								value: 'internal',
								description: 'Visible to help desk',
							},
						],
					},
					{
						displayName: 'Article Type',
						name: 'type',
						type: 'options',
						// https://docs.zammad.org/en/latest/api/ticket/articles.html
						options: [
							{
								name: 'Chat',
								value: 'chat',
							},
							{
								name: 'Email',
								value: 'email',
							},
							{
								name: 'Fax',
								value: 'fax',
							},
							{
								name: 'Note',
								value: 'note',
							},
							{
								name: 'Phone',
								value: 'phone',
							},
							{
								name: 'SMS',
								value: 'sms',
							},
						],
						default: 'note',
					},
				],
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['update'],
			},
		},
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				type: 'fixedCollection',
				default: {},
				placeholder: 'Add Custom Field',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'customFieldPairs',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'loadTicketCustomFields',
								},
								default: '',
								description:
									'Name of the custom field to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to set on the custom field',
							},
						],
					},
				],
			},
		],
	},
];
