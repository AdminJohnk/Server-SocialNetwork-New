require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const fs = require('fs');
const { parse } = require('csv-parse');
const app = require('../app');

const records = [];

const processFile = async () => {
  const parser = fs.createReadStream('./src/test/FileTest/dataLogin.csv').pipe(
    parse({
      delimiter: ',',
      columns: true,
      ltrim: true
    })
  );
  for await (const record of parser) {
    records.push(record);
  }
};

/* Connect to the database before tests */
beforeAll(async () => {
  await mongoose.connect(
    'mongodb+srv://socialnetwork:IsBSBM6L1CFiiQWL@socialcluster.i599n1a.mongodb.net/SocialProDEV'
  );
  await processFile();
});

/* Remove all documents and close database connection after tests */
afterAll(async () => {
  //   await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Login API', () => {
  beforeAll(async () => {
    await processFile();
  });

  test.each(records)('should login with valid credentials for user %p', async (record) => {
    const response = await request(app).post('/api/login').send({
      email: record.email,
      password: record.password
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
