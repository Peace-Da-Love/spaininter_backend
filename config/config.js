require('dotenv').config();

module.exports = {
  development: {
    username: 'disabled',
    password: 'disabled',
    database: 'disabled',
    host: '127.0.0.1',
    port: 1,
    dialect: 'postgres',
    logging: false,
  },
  test: {
    username: 'disabled',
    password: 'disabled',
    database: 'disabled',
    host: '127.0.0.1',
    port: 1,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB || 'spaininter',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  },
};
