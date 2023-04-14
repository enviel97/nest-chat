export default Object.freeze({
  server: {
    env: process.env.ENVIRONMENT,
    port: process.env.PORT,
    cookie_key: process.env.COOKIE_KEY,
    session_prefix: 'sid_',
  },
  mongoose: {
    uri: `mongodb+srv://${process.env.MONGOOSE_USERNAME}:${process.env.MONGOOSE_PASSWORD}@chatapp.ykb0ux4.mongodb.net/`,
    dbName: {
      dev: process.env.MONGOOSE_DBNAME,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  image: {
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
  },
});
