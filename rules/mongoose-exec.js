'use strict';

const _ = require('lodash');

const getMethodName = _.property(['callee', 'property', 'name']);
const getCaller = _.property(['callee', 'object']);

function isExec(node) {
  return getMethodName(node) === 'exec';
}

function isCursor(node) {
  return getMethodName(node) === 'cursor' || getMethodName(node) === 'stream';
}

function isChainBreaker(node) {
  return isExec(node) || isCursor(node);
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

function isAssign(node, assignVarNames) {
  if (!node || !node.parent) {
    return false;
  }

  let nodeName;

  if (node.parent.type === 'VariableDeclarator') {
    nodeName = node.parent.id.name;
  } else if (
    node.parent.type === 'AssignmentExpression' &&
    node.parent.operator === '=' &&
    node.parent.left.name
  ) {
    nodeName = node.parent.left.name;
  } else {
    return false;
  }


  if (assignVarNames.includes(nodeName)) {
    return true;
  }

  // Check for camel case, e.g. variables ending with Query or Find
  return assignVarNames.some(varName => {
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
      expected: 'Expected exec or cursor or stream.',
      expected_cursor: 'Expected cursor or stream.',
      not_needed: 'This function does not have an exec, just use the promise returned.',
      not_needed_cursor: 'This function does not have a cursor/stream, only find() can have one.',
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
          'updateOne',
          'updateMany',
          'count',
          'countDocuments',
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
          'remove',
          'deleteOne',
          'deleteMany',
        ];

        const mongooseNoExecFns = [
          'populate',
          'create',
        ];

        const mongooseCursorFns = [
          'find',
        ];

        const endOfChain = getEndOfChain(node);

        if (mongooseFns.includes(getMethodName(node))) {
          // If the method has a callback it means we don't have to expect exec
          if (isCallback(node.arguments[node.arguments.length - 1])) {
            return;
          }

          if (isCursor(endOfChain) && !mongooseCursorFns.includes(getMethodName(node))) {
            context.report({
              node,
              messageId: 'not_needed_cursor',
            });
          }

          if (isAssign(node, ['cursor', 'stream'])) {
            if (!isCursor(endOfChain)) {
              context.report({
                node,
                messageId: 'expected_cursor',
              });
            }
            return;
          }

          if (!isAssign(node, ['find', 'query']) && !isChainBreaker(endOfChain)) {
            context.report({
              node,
              messageId: 'expected',
            });
            return;
          }
        } else if (mongooseNoExecFns.includes(getMethodName(node))) {
          if (isExec(endOfChain)) {
            context.report({
              node,
              messageId: 'not_needed',
            });
          }
        }
      },
    };
  },
};
