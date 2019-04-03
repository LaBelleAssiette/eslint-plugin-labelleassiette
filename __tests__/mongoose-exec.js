const rule = require('../rules/mongoose-exec');
const RuleTester = require('eslint').RuleTester;

const ERROR_MSG_NOT_STYLED = 'Expected exec.';

const ruleTester = new RuleTester();

ruleTester.run('mongoose-exec', rule, {
  valid: [
    {
      code: 'Model.update().exec();',
    },
    {
      code: 'Model.update().lean().exec();',
    },
    {
      code: 'Model.update().lean().exec().then(function () {});',
    },
    {
      code: 'Model.find({ field: getter() }).exec();',
    },
    {
      code: 'query.populate();',
    },
    {
      code: 'Model.find({}, cb);',
    },
    {
      code: 'Model.find({}, function() {});',
    },
    {
      code: '_.find()',
    },
  ],
  invalid: [
    {
      code: 'Model.update()',
      errors: [{
        message: ERROR_MSG_NOT_STYLED,
        type: 'CallExpression',
      }],
    },
  ],
});
