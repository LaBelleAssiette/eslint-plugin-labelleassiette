module.exports = {
  rules: {
    'mongoose-exec': require('./rules/mongoose-exec'),
    'mongoose-deprecated': require('./rules/mongoose-deprecated'),
  },
  rulesConfig: {
    'mongoose-exec': 0,
    'mongoose-deprecated': 0,
  }
};
