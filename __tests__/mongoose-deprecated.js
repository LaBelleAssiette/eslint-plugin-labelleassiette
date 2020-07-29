const rule = require('../rules/mongoose-deprecated');
const RuleTester = require('eslint').RuleTester;

const ERROR_MSG_DEPRECATED = 'Method is deprecated.';

const ruleTester = new RuleTester();

ruleTester.run('mongoose-deprecated', rule, {
  valid: [
    {
      code: 'Model.updateMany().exec();',
    },
    {
      code: 'var arr = _.remove(arr);',
    },
  ],
  invalid: [
    {
      code: 'Model.update()',
      errors: [{
        message: ERROR_MSG_DEPRECATED,
        type: 'CallExpression',
      }],
    },
    {
      code: 'Model.remove().exec()',
      errors: [{
        message: ERROR_MSG_DEPRECATED,
        type: 'CallExpression',
      }]
    },
  ],
});
