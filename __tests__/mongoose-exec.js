const rule = require('../rules/mongoose-exec');
const RuleTester = require('eslint').RuleTester;

const ERROR_MSG_NO_EXEC = 'Expected exec or cursor.';
const ERROR_MSG_NO_CURSOR = 'Expected cursor.';
const ERROR_MSG_EXEC_NOT_NEEDED = 'This function does not have an exec, just use the promise returned.';
const ERROR_MSG_CURSOR_NOT_NEEDED = 'This function does not have a cursor, only find() can have one.';

const ruleTester = new RuleTester();

ruleTester.run('mongoose-exec', rule, {
  valid: [
    {
      code: 'Model.update().exec();',
    },
    {
      code: 'Model.find().cursor();',
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
      code: 'var cursor = Model.find({}).cursor();',
    },
    {
      code: 'var someCursor = Model.find({}).cursor();',
    },
    {
      code: '_.find()',
    },
    {
      code: 'Model.populate();',
    },
    {
      code: 'Model.create();',
    }
  ],
  invalid: [
    {
      code: 'Model.update()',
      errors: [{
        message: ERROR_MSG_NO_EXEC,
        type: 'CallExpression',
      }],
    },
    {
      code: 'Model.create().exec()',
      errors: [{
        message: ERROR_MSG_EXEC_NOT_NEEDED,
        type: 'CallExpression',
      }]
    },
    {
      code: 'Model.populate().exec()',
      errors: [{
        message: ERROR_MSG_EXEC_NOT_NEEDED,
        type: 'CallExpression',
      }]
    },
    {
      code: 'var cursor = Model.find();',
      errors: [{
        message: ERROR_MSG_NO_CURSOR,
        type: 'CallExpression',
      }]
    },
    {
      code: 'var cursor = Model.update().cursor();',
      errors: [{
        message: ERROR_MSG_CURSOR_NOT_NEEDED,
        type: 'CallExpression',
      }]
    },
  ],
});
