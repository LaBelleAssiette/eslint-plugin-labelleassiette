'use strict';

const _ = require('lodash');

const getMethodName = _.property(['callee', 'property', 'name']);
const getCaller = _.property(['callee', 'object']);


module.exports = {
  meta: {
    type: 'layout',

    docs: {
      description: 'ensure we do not used deprecated mongoose methods',
    },

    schema: [{
      type: 'object',
      properties: {
        ignoreChainWithDepth: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          default: 2,
        },
      },
      additionalProperties: false,
    }],
    messages: {
      deprecated: 'Method is deprecated.',
    },
  },

  create(context) {
    return {
      CallExpression: function (node) {
        const caller = getCaller(node);
        if (!caller || !caller.name) {
          return;
        }

        if (
          caller.name[0] !== caller.name[0].toUpperCase() ||
          caller.name === '_'
        ) {
          // Not a call on a model
          return;
        }

        const mongooseFns = [
          'remove',
          'count',
          'update',
        ];

        if (mongooseFns.includes(getMethodName(node))) {
          context.report({
            node,
            messageId: 'deprecated',
          });
        }
      },
    };
  },
};
