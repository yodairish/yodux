/**
 * =================== STORE MANAGER ===========================
 */

import Store from './Store';

let storesList = {};

const storeManager = {
  /**
   * @param {array|object|string} nameOrData
   * @param {object|undefined} newStore
   */
  add(nameOrData, newStore) {
    (
      addStoresFromList(nameOrData) ||
      addStoreByObject(nameOrData) ||
      addStore(nameOrData, newStore)
    );
  },
 
  /**
   * @param {string} name
   * @returns {object}
   */
  getStore(name) {
    return storesList[name];
  },
  
  /**
   * @param {string} name
   */
  addListener(name, ...rest) {
    checkStoreIsRegistered(name);
    storesList[name].addListener(...rest);
  },
  
  /**
   * @param {string} name
   */
  removeListener(name, ...rest) {
    checkStoreIsRegistered(name);
    storesList[name].removeListener(...rest);
  }
};

/**
 * @param {array} storesList
 * @returns {boolean}
 */
function addStoresFromList(storesList) {
  if (!Array.isArray(storesList)) return false;
  
  storesList.forEach((storeData) => {
    const [name, newStore] = storeData;
    
    addStore(name, newStore);
  });
  
  return true;
}

/**
 * @param {object} data
 * @returns {boolean}
 */
function addStoreByObject(data) {
  if (!data || typeof data !== 'object') return false;
  
  for (const [name, newStore] of Object.entries(data)) {
    addStore(name, newStore);
  }
  
  return true;
}

/**
 * @param {string} name
 * @param {object} newStore
 */
function addStore(name, newStore) {
  if (!validateNewStore(name, newStore)) return;
  
  storesList[name] = newStore;
      
  if (!storeManager.hasOwnProperty(name)) {
    storeManager[name] = newStore;
  }
}

/**
 * @param {string} name
 * @param {object} newStore
 * @returns {boolean}
 */
function validateNewStore(name, newStore) {
  let result = true;
  
  if (!name || typeof name !== 'string') {
    console.warn('You should define a name to the store');
    result = false;
    
  } else if (Object.getPrototypeOf(newStore) !== Store) {
    console.warn('Store should be extends from the yodux Store');
    result = false;
  }
  
  return result;
}

/**
 * @param {string} name
 */
function checkStoreIsRegistered(name) {
  if (!storeManager.getStore(name)) {
    throw new Error(`store with name "$(name)" wasn't registered`);
  }
}

export default storeManager;
