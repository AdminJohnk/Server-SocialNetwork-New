'use strict';

const _ = require('lodash');
const { Types } = require('mongoose');

const convertToObjectIDMongoDB = id => new Types.ObjectId(id);

/*
    const a = {
        c: {
            d: 1,
            e: 2
        }
    }

    db.collection.updateOne({
        `c.d`: 1
    })
 */
const updateNestedObjectParser = obj => {
  // console.log("Nested1::", obj);
  const final = {};
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const nested = updateNestedObjectParser(obj[key]);
      Object.keys(nested).forEach(nestedKey => {
        final[`${key}.${nestedKey}`] = nested[nestedKey];
      });
    } else {
      final[key] = obj[key];
    }
  });
  // console.log("Nested2::", final);
  return final;
};

const removeUndefinedFields = obj => {
  //   return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  // console.log('obj1::', obj);
  Object.keys(obj).forEach(k => {
    if (obj[k] === null || obj[k] === undefined) delete obj[k];
  });
  // console.log('obj2::', obj);
  return obj;
};

// limit object in array by limit and page parametter
const limitData = ({ data = [], limit = 10, page = 1 }) => {
  const start = (page - 1) * limit;
  const end = page * limit;
  return data.slice(start, end);
};

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

// ['name', 'age'] -> {name: 1, age: 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map(item => [item, 1]));
};

// ['name', 'age'] -> {name: 0, age: 0}
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map(item => [item, 0]));
};

module.exports = {
  limitData,
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedFields,
  updateNestedObjectParser,
  convertToObjectIDMongoDB
};
