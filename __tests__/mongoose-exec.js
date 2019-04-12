const rule = require('../rules/mongoose-exec');
const RuleTester = require('eslint').RuleTester;

const ERROR_MSG_NOT_STYLED = 'Expected exec.';
const ERROR_MSG_EXEC_NOT_NEEDED = 'This function does not have an exec, just use the promise returned.';

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
      code: 'var query = Model.find({});',
    },
    {
      code: 'var countQuery = Model.count({});',
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
    {
      code: 'Model.create().exec()',
      errors: [{
        message: ERROR_MSG_EXEC_NOT_NEEDED,
        type: 'CallExpression',
      }]
    }
  ],
});
