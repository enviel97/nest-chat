export default Object.freeze({
  server: {
    port: process.env.PORT,
  },
  mongoose: {
    uri: `mongodb+srv://${process.env.MONGOOSE_USERNAME}:${process.env.MONGOOSE_PASSWORD}@chatapp.ykb0ux4.mongodb.net/`,
    dbName: {
      dev: process.env.MONGOOSE_DBNAME,
    },
  },
});
