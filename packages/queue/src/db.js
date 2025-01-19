import knex from 'knex'

const db = knex.default({
	client: 'postgresql',
	connection: {
		host: process.env.POSTGRES_HOST || 'localhost',
		port: process.env.POSTGRES_PORT || 5432,
		database: process.env.POSTGRES_DB,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
	},
	pool: {
		min: 2,
		max: 10,
	},
})

export default db
