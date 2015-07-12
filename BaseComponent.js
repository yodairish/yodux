'use strict';

import React from 'react';

export class BaseComponent extends React.Component {
  _bind(...methods) {
    methods.forEach(method => this[method] = this[method].bind(this));
  }

  /**
   * @param {string|object} state
   * @param {function|undefined} storeMethod
   * @returns {function}
   */
  _updateState(state, storeMethod) {
    return () => {
      let newState = {};
    
      if (typeof state === 'object') {
        for (const [name, func] of Object.entries(state)) {
          newState[name] = func();
        }
        
      } else {
        newState[state] = storeMethod();
      }
      
      this.setState(newState);
    };
  }
  
  /**
   * @param {array|object} data
   * @returns {function}
   */
  _updateStateByStore(data) {
    return () => {
      let newState = (Array.isArray(data)
                        ? Object.assign({}, ...data.map(getStateByStore))
                        : getStateByStore(data));
                    
      this.setState(newState);
    };
  }
}

/**
 * @param {object} dataForStore
 * @returns {object}
 */
function getStateByStore(dataForStore) {
  let {store, states} = dataForStore,
      newState = {};
      
  for (let [name, method] of Object.entries(states)) {
    newState[name] = store[method]();
  }
  
  return newState;
}
