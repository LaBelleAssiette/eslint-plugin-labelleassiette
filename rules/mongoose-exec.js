'use strict';

const _ = require('lodash');

const getMethodName = _.property(['callee', 'property', 'name']);
const getCaller = _.property(['callee', 'object']);

function isChainBreaker(node) {
  return getMethodName(node) === 'exec';
}

function getEndOfChain(node) {
  const stillInChain = _.negate(isChainBreaker);
  let curr = node.parent.parent;
  while (curr.parent && curr === getCaller(curr.parent.parent) && stillInChain(curr)) {
    curr = curr.parent.parent;
  }
  return curr;
}

const callbacks = ['done', 'cb', 'callback', 'next'];

function isNamedCallback(potentialCallbackName) {
  return callbacks.some(trueCallbackName => {
    return potentialCallbackName === trueCallbackName;
  });
}

function isCallback(node) {
  if (!node) {
    return false;
  }
  const isCallExpression = node.type === 'FunctionExpression';
  const nameIsCallback = node.type === 'Identifier' && isNamedCallback(node.name);
  const isCB = isCallExpression || nameIsCallback;
  return isCB;
}

function isQueryAssign(node) {
  if (!node || !node.parent) {
    return false;
  }

  if (node.parent.type !== 'VariableDeclarator') {
    return false;
  }

  const queryVarNames = ['query', 'find'];
  const nodeName = node.parent.id.name;

  if (queryVarNames.includes(nodeName)) {
    return true;
  }

  // Check for camel case, i.e. variables ending with Query or Find
  return queryVarNames.some(varName => {
    const camelCase = varName[0].toUpperCase() + varName.slice(1);
    return nodeName.endsWith(varName) || nodeName.endsWith(camelCase);
  })
}


module.exports = {
  meta: {
    type: 'layout',

    docs: {
      description: 'require a newline after each call in a method chain',
      category: 'Stylistic Issues',
      recommended: false,
      url: 'https://eslint.org/docs/rules/newline-per-chained-call',
    },

    fixable: 'whitespace',

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
      expected: 'Expected exec.',
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
          'update',
          'count',
          'create',
          'distinct',
          'find',
          'findById',
          'findByIdAndRemove',
          'findByIdAndUpdate',
          'findOne',
          'findOneAndRemove',
          'findOneAndUpdate',
          'geoNear',
          'geoSearch',
          'populate',
          'remove',
        ];

        if (mongooseFns.includes(getMethodName(node))) {
          // If the method has a callback it means we don't have to expect exec
          if (isCallback(node.arguments[node.arguments.length - 1])) {
            return;
          }
          if (!isChainBreaker(getEndOfChain(node)) && !isQueryAssign(node)) {
            context.report({
              node,
              messageId: 'expected',
            });
          }
        }
      },
    };
  },
};
