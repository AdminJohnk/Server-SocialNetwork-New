'use stric';

const Logger = require('../loggers/discord.log');

const pushToLogDiscord = async (req, res, next) => {
  try {
    Logger.senToFormatCode({
      title: `Method: ${req.method}`,
      code: req.methpd === 'GET' ? req.query : req.body,
      message: `${req.get('host')}${req.originalUrl}`
    });

    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  pushToLogDiscord
};
