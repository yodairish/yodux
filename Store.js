'use strict';

import {EventEmitter} from 'events';
import dispatcher from './dispatcher';

let events = new WeakMap();
let states = new WeakMap();
let handlers = new WeakMap();
let dispatchTokens = new WeakMap();

class Store extends EventEmitter {
  constructor(options = {}) {
    super();
    
    validateOptions(options);
    
    states.set(this, (options.state || {}));
    handlers.set(this, (options.handlers || {}));
    
    createEvents(this, options.events);
    addToDispatcher(this);
  }
  
  /**
   * @param {string} name
   */
  emit(name) {
    validateEvent(this, name);
    super.emit(getEvent(this, name));
  }
  
  /**
   * @param {string|array|object} nameOrData
   * @param {function} callback
   */
  addListener(nameOrData, callback) {
    if (Array.isArray(nameOrData)) {
      addMultiListeners(this, nameOrData);
    
    } else if (nameOrData && typeof nameOrData === 'object') {
      const {event, callback} = nameOrData;
      
      this.addListener(event, callback);
      
    } else {
      validateEvent(this, nameOrData);
      this.on(getEvent(this, nameOrData), callback);
    }
  }

  /**
   * @param {string|array|object} nameOrData
   * @param {function} callback
   */
  removeListener(nameOrData, callback) {
    if (Array.isArray(nameOrData)) {
      removeMultiListeners(this, nameOrData);
      
    } else if (nameOrData && typeof nameOrData === 'object') {
      const {event, callback} = nameOrData;
      
      this.removeListener(event, callback);
      
    } else {
      validateEvent(this, nameOrData);
      super.removeListener(getEvent(this, nameOrData), callback);
    }
  }
}

/**
 * @param {object} store
 * @param {array} nameOrList
 */
function addMultiListeners(store, listeners) {
  listeners.forEach((listener) => {
    if (Array.isArray(listener)) {
      store.addListener(...listener);
      
    } else if (listener && typeof listener === 'object') {
      const {event, callback} = listener;
      
      store.addListener(event, callback);
      
    } else {
      throw new Error('You are send an incorrect listener object');
    }
  });
}

/**
 * @param {object} store
 * @param {array} nameOrList
 */
function removeMultiListeners(store, listeners) {
  listeners.forEach((listener) => {
    if (Array.isArray(listener)) {
      store.removeListener(...listener);
      
    } else if (listener && typeof listener === 'object') {
      const {event, callback} = listener;
      
      store.removeListener(event, callback);
      
    } else {
      throw new Error('You are send an incorrect listener object');
    }
  });
}

/**
 * @param {object|undefined} options
 */
function validateOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Incorrect store options');
  }
}

/**
 * @param {object} store
 * @param {string} name
 */
function validateEvent(store, name) {
  if (!getEvent(store, name)) {
    throw new Error(`You are not register "$(name)" event`);
  }
}

/**
 * @param {object} store
 * @param {string} name
 * @returns {string|undefined}
 */
function getEvent(store, name) {
  return events.get(store)[name];
}

/**
 * @param {object} store
 * @returns {object}
 */
function getState(store) {
  return states.get(store);
}

/**
 * @param {object} store
 * @param {string} name
 * @returns {function|undefined}
 */
function getHandler(store, name) {
  return handlers.get(store)[name];
}

/**
 * @param {object} store
 * @param {array} storeEvents
 */
function createEvents(store, storeEvents = []) {
  events.set(store, storeEvents.reduce((eventsList, event) => {
    eventsList[event] = Symbol();
    
    return eventsList;
  }, {}));
}

/**
 * @param {object} store
 */
function addToDispatcher(store) {
  dispatchTokens.set(store, dispatcher.register((action) => {
    const handler = getHandler(store, action.name);
  
    if (handler) {
      const {newState, events} = handler({
        state: Object.assign({}, getState(store)),
        action
      });
      
      updateState(store, newState);
      [...events].forEach((event) => store.emit(event));
    }
  }));
}

/**
 * @param {object} store
 * @param {object|undefined} newState
 */
function updateState(store, newState) {
  if (!newState) return;
  
  states.set(store, Object.keys(newState).reduce((state, name) => {
    if (state.hasOwnProperty(name)) {
      state[name] = newState[name];
    }
    
    return state;
  }, getState(store)));
}

export default Store;
