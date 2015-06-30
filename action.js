'use strict';

import dispatcher from './dispatcher';

/**
 * @param {string|array} nameOrList
 * @param {object|undefined} data
 */
function action(nameOrList, data) {
  (
    dispatchAction(nameOrList, data) ||
    multiActions(nameOrList) ||
    incorrectError()
  );
}

/**
 * @param {string} name
 * @param {object|undefined} data
 * @returns {boolean}
 */
function dispatchAction(name, data) {
  const isNotName = (
    typeof nameOrList !== 'string' &&
    typeof nameOrList !== 'symbol'
  );
  
  if (isNotName) return false;
  
  dispatcher.dispatch(Object.assign({ name }, data));
  
  return true;
}

/**
 * @param {array} list
 * @returns {boolean}
 */
function multiActions(list) {
  if (!Array.isArray(list)) return false;
  
  list.forEach((actionData) => {
    if (Array.isArray(actionData)) {
      action(...actionData);
      
    } else if (actionData && typeof actionData === 'object') {
      action(actionData.name, actionData);
      
    } else {
      action(actionData);
    }
  });
  
  return true;
}

function incorrectError() {
  throw new Error('You should send a name or a list of actions');
}

export default action;
