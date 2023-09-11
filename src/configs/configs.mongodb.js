'use strict';
// mongodb+srv://socialnetwork:<password>@socialcluster.i599n1a.mongodb.net/
const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST,
    password: process.env.DEV_DB_PASSWORD,
    suffix: process.env.DEV_DB_SUFFIX,
  },
};

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },
  db: {
    host: process.env.PRO_DB_HOST || "localhost",
    password: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || "socialPRO",
  },
};

const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];
