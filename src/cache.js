import env from 'env-var';
import ioredis from 'ioredis';

const REDIS_HOST = env.get('REDIS_HOST').asString();
const REDIS_PORT = env.get('REDIS_PORT', 6379).asIntPositive();

export default new ioredis(REDIS_PORT, REDIS_HOST);
