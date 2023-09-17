const RoleUser = {
  USER: '0000',
  ADMIN: '0101'
};

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id',
  GITHUB_TOKEN: 'x-github-token'
};

const avt_default =
  'https://res.cloudinary.com/dp58kf8pw/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1694576962/default_avatar_ixpwcf.jpg';

const pp_UserDefault = '_id name email user_image';
const se_UserDefault = ['_id', 'name', 'email', 'user_image'];

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;
const objectConnectRedis = {
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
};

module.exports = {
  HEADER,
  RoleUser,
  avt_default,
  se_UserDefault,
  pp_UserDefault,
  objectConnectRedis
};
