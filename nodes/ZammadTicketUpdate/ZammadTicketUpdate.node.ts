import type {
	IExecuteFunctions,
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	ticketUpdateDescription
} from './descriptions/TicketUpdateDescription';

import {
	doesNotBelongToZammad,
	fieldToLoadOption,
	getAllFields, getAllStates,
	getGroupCustomFields,
	getGroupFields,
	getOrganizationCustomFields,
	getOrganizationFields,
	getTicketCustomFields,
	getTicketFields,
	getUserCustomFields,
	getUserFields,
	isCustomer,
	isNotZammadFoundation,
	tolerateTrailingSlash,
	zammadApiRequest,
} from './GenericFunctions';

import type {Zammad as ZammadTypes} from './types';

export class ZammadTicketUpdate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zammad Ticket update',
		name: 'ZammadTicketUpdate',
		icon: 'file:ZammadTicketUpdate.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Update Tickets using the Zammad API',
		defaults: {
			name: 'Zammad Ticket Update',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zammadBasicAuthApi',
				required: true,
				testedBy: 'zammadBasicAuthApiTest',
				displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
			},
			{
				name: 'zammadTokenAuthApi',
				required: true,
				testedBy: 'zammadTokenAuthApiTest',
				displayOptions: {
					show: {
						authentication: ['tokenAuth'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth',
						value: 'basicAuth',
					},
					{
						name: 'Token Auth',
						value: 'tokenAuth',
					},
				],
				default: 'tokenAuth',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				noDataExpression: true,
				type: 'options',
				options: [
					{
						name: 'Ticket',
						value: 'ticket',
					},
				],
				default: 'ticket',
			},

			...ticketUpdateDescription
		],
	};

	methods = {
		loadOptions: {
			// ----------------------------------
			//          custom fields
			// ----------------------------------

			async loadGroupCustomFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getGroupCustomFields(allFields).map(fieldToLoadOption);
			},


			async loadOrganizationCustomFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getOrganizationCustomFields(allFields).map(fieldToLoadOption);
			},

			async loadUserCustomFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getUserCustomFields(allFields).map(fieldToLoadOption);
			},

			async loadTicketCustomFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getTicketCustomFields(allFields).map((i) => ({name: i.name, value: i.name}));
			},

			// ----------------------------------
			//          built-in fields
			// ----------------------------------

			async loadGroupFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getGroupFields(allFields).map(fieldToLoadOption);
			},

			async loadOrganizationFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getOrganizationFields(allFields).map(fieldToLoadOption);
			},

			async loadTicketFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getTicketFields(allFields).map(fieldToLoadOption);
			},

			async loadUserFields(this: ILoadOptionsFunctions) {
				const allFields = await getAllFields.call(this);

				return getUserFields(allFields).map(fieldToLoadOption);
			},

			async loadTicketStates(this: ILoadOptionsFunctions) {
				const states = await getAllStates.call(this)
				return states.map(s => {
					return {name: s.name, value: s.name}
				})
			},

			// ----------------------------------
			//             resources
			// ----------------------------------

			// by non-ID attribute


			/**
			 * PUT /users requires organization name instead of organization ID.
			 */
			async loadOrganizationNames(this: ILoadOptionsFunctions) {
				const orgs = (await zammadApiRequest.call(
					this,
					'GET',
					'/organizations',
				)) as ZammadTypes.Group[];

				return orgs.filter(isNotZammadFoundation).map((i) => ({name: i.name, value: i.name}));
			},

			/**
			 * POST & PUT /tickets requires customer email instead of customer ID.
			 */
			async loadCustomerEmails(this: ILoadOptionsFunctions) {
				const users = (await zammadApiRequest.call(this, 'GET', '/users')) as ZammadTypes.User[];

				return users.filter(isCustomer).map((i) => ({name: i.email, value: i.email}));
			},

			// by ID

			async loadGroups(this: ILoadOptionsFunctions) {
				const groups = (await zammadApiRequest.call(this, 'GET', '/groups')) as ZammadTypes.Group[];

				return groups.map((i) => ({name: i.name, value: i.id}));
			},

			async loadOrganizations(this: ILoadOptionsFunctions) {
				const orgs = (await zammadApiRequest.call(
					this,
					'GET',
					'/organizations',
				)) as ZammadTypes.Organization[];

				return orgs.filter(isNotZammadFoundation).map((i) => ({name: i.name, value: i.id}));
			},

			async loadUsers(this: ILoadOptionsFunctions) {
				const users = (await zammadApiRequest.call(this, 'GET', '/users')) as ZammadTypes.User[];

				return users.filter(doesNotBelongToZammad).map((i) => ({name: i.login, value: i.id}));
			},
		},
		credentialTest: {
			async zammadBasicAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as ZammadTypes.BasicAuthCredentials;

				const baseUrl = tolerateTrailingSlash(credentials.baseUrl);

				const options: any = {
					method: 'GET',
					uri: `${baseUrl}/api/v1/users/me`,
					json: true,
					rejectUnauthorized: !credentials.allowUnauthorizedCerts,
					auth: {
						user: credentials.username,
						pass: credentials.password,
					},
				};

				try {
					await this.helpers.request(options);
					return {
						status: 'OK',
						message: 'Authentication successful',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: error.message,
					};
				}
			},

			async zammadTokenAuthApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as ZammadTypes.TokenAuthCredentials;

				const baseUrl = tolerateTrailingSlash(credentials.baseUrl);

				const options: any = {
					method: 'GET',
					uri: `${baseUrl}/api/v1/users/me`,
					json: true,
					rejectUnauthorized: !credentials.allowUnauthorizedCerts,
					headers: {
						Authorization: `Token token=${credentials.accessToken}`,
					},
				};

				try {
					await this.helpers.request(options);
					return {
						status: 'OK',
						message: 'Authentication successful',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: error.message,
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resource = this.getNodeParameter('resource', 0) as ZammadTypes.Resource;
		const operation = this.getNodeParameter('operation', 0);

		let responseData;
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'ticket') {
					// **********************************************************************
					//                                  ticket
					// **********************************************************************

					if (operation === 'update') {
						// ----------------------------------
						//           ticket:create
						// ----------------------------------

						// https://docs.zammad.org/en/latest/api/ticket/index.html#create

						const body = {} as any;

						const group = this.getNodeParameter('group', i) as string;
						const state = this.getNodeParameter('state', i) as string;

						if (group) {
							body.group = group;
						}
						if (state) {
							body.state = state;
						}

						const article = this.getNodeParameter('article', i) as ZammadTypes.Article;

						if (article && article.articleDetails) {

							const {
								articleDetails: {visibility, ...rest},
							} = article;

							body.article = {
								...rest,
								internal: visibility === 'internal',
							};
						}

						const { customFieldsUi } = this.getNodeParameter(
							'additionalFields',
							i,
						) as ZammadTypes.UserAdditionalFields;

						customFieldsUi?.customFieldPairs.forEach((pair) => {
							body[pair.name] = pair.value;
						});

						const id = this.getNodeParameter('id', i) as string;

						responseData = await zammadApiRequest.call(
							this,
							'PUT',
							`/tickets/${id}`,
							body
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{itemData: {item: i}},
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({json: {error: error.message}});
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
