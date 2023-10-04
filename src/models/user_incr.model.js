'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'UserIncr';
const COLLECTION_NAME = 'userIncrs';

var UserIncrSchema = new Schema(
  {
    id: { type: String, default: 'userIncr' },
    id_current: { type: Number, default: 0 },
    id_delete: { type: Array, default: [] }
  },
  {
    collection: COLLECTION_NAME
  }
);

const UserIncrModel = model(DOCUMENT_NAME, UserIncrSchema);

class UserIncrClass {
  // get id_current
  static async getIdCurrent() {
    return await UserIncrModel.findOne({
      id: 'userIncr'
    }).lean();
  }
  // set id_current
  static async setIncrId(newId) {
    return await UserIncrModel.findOneAndUpdate(
      { id: 'userIncr' },
      { $set: { id_current: newId } },
      { new: true }
    ).lean();
  }
  // push id_delete
  static async pushIdDelete(id) {
    return await UserIncrModel.findOneAndUpdate(
      { id: 'userIncr' },
      { $addToSet: { id_delete: id } },
      { new: true }
    ).lean();
  }
  // pull id_delete
  static async pullIdDelete() {
    // delete the last element in the array
    return await UserIncrModel.findOneAndUpdate(
      { id: 'userIncr' },
      { $pop: { id_delete: 1 } },
      { new: true }
    ).lean();
  }
}

module.exports = {
  UserIncrModel,
  UserIncrClass
};
