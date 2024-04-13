'use strict';
import { set, connect } from 'mongoose';
import { countConnect } from '../helpers/check.connect.js';
import configsMongodb from '../configs/configs.mongodb.js';
const {
  db: { host, port, name }
} = configsMongodb;

class Database {
  constructor() {
    this.connect('mongodb');
  }

  connect(type) {
    if (type === 'mongodb') {
      if (1 === 1) {
        set('debug', true);
        set('debug', { color: true });
      }

      // const connectString = `mongodb://${host}:${port}/${name}`;

      const connectString =
        'mongodb+srv://socialnetwork:IsBSBM6L1CFiiQWL@socialcluster.i599n1a.mongodb.net/SocialProDEV';

      connect(connectString, {
        maxPoolSize: 50
      })
        .then(() => {
          countConnect();
          console.log('Connected to MongoDB');
        })
        .catch((err) => {
          console.log('Error connecting to MongoDB');
          console.log(err);
        });
    }
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceDB = Database.getInstance();

export default instanceDB;
