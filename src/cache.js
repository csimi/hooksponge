const env = require('env-var');
const ioredis = require('ioredis');

const REDIS_HOST = env.get('REDIS_HOST').asString();
const REDIS_PORT = env.get('REDIS_PORT', 6379).asIntPositive();

module.exports = new ioredis(REDIS_PORT, REDIS_HOST);
