// IndexedDB utility for storing user data, designs, and profile pictures
// Provides persistent storage with no size limits

const DB_NAME = 'ShoeCraftifyDB';
const DB_VERSION = 1;

// Object stores
const STORES = {
  USER: 'user',
  DESIGNS: 'designs',
  CACHE: 'cache'
};

let db = null;

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create user store (single record for current user)
      if (!database.objectStoreNames.contains(STORES.USER)) {
        database.createObjectStore(STORES.USER);
      }

      // Create designs store with index
      if (!database.objectStoreNames.contains(STORES.DESIGNS)) {
        const designStore = database.createObjectStore(STORES.DESIGNS, { keyPath: 'id' });
        designStore.createIndex('createdAt', 'createdAt', { unique: false });
        designStore.createIndex('userId', 'userId', { unique: false });
      }

      // Create cache store for temporary data
      if (!database.objectStoreNames.contains(STORES.CACHE)) {
        database.createObjectStore(STORES.CACHE);
      }
    };
  });
};

/**
 * Save user data (profile, settings, profile picture URL)
 */
export const saveUser = async (userData) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.USER], 'readwrite');
    const store = transaction.objectStore(STORES.USER);

    return new Promise((resolve, reject) => {
      const request = store.put(userData, 'currentUser');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('User saved to IndexedDB:', userData.email);
        resolve(userData);
      };
    });
  } catch (error) {
    console.error('Error saving user to IndexedDB:', error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUser = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.USER], 'readonly');
    const store = transaction.objectStore(STORES.USER);

    return new Promise((resolve, reject) => {
      const request = store.get('currentUser');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error('Error getting user from IndexedDB:', error);
    return null;
  }
};

/**
 * Clear user data
 */
export const clearUser = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.USER], 'readwrite');
    const store = transaction.objectStore(STORES.USER);

    return new Promise((resolve, reject) => {
      const request = store.delete('currentUser');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('User cleared from IndexedDB');
        resolve();
      };
    });
  } catch (error) {
    console.error('Error clearing user from IndexedDB:', error);
    throw error;
  }
};

/**
 * Save design
 */
export const saveDesign = async (design) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.DESIGNS], 'readwrite');
    const store = transaction.objectStore(STORES.DESIGNS);

    return new Promise((resolve, reject) => {
      const request = store.put(design);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Design saved to IndexedDB:', design.name);
        resolve(design);
      };
    });
  } catch (error) {
    console.error('Error saving design to IndexedDB:', error);
    throw error;
  }
};

/**
 * Get all designs for a user
 */
export const getDesigns = async (userId = null) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.DESIGNS], 'readonly');
    const store = transaction.objectStore(STORES.DESIGNS);

    return new Promise((resolve, reject) => {
      let request;
      
      if (userId) {
        const index = store.index('userId');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort by createdAt descending
        const designs = request.result.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        resolve(designs);
      };
    });
  } catch (error) {
    console.error('Error getting designs from IndexedDB:', error);
    return [];
  }
};

/**
 * Get single design by ID
 */
export const getDesign = async (designId) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.DESIGNS], 'readonly');
    const store = transaction.objectStore(STORES.DESIGNS);

    return new Promise((resolve, reject) => {
      const request = store.get(designId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error('Error getting design from IndexedDB:', error);
    return null;
  }
};

/**
 * Delete design
 */
export const deleteDesign = async (designId) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.DESIGNS], 'readwrite');
    const store = transaction.objectStore(STORES.DESIGNS);

    return new Promise((resolve, reject) => {
      const request = store.delete(designId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Design deleted from IndexedDB:', designId);
        resolve();
      };
    });
  } catch (error) {
    console.error('Error deleting design from IndexedDB:', error);
    throw error;
  }
};

/**
 * Clear all designs
 */
export const clearDesigns = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.DESIGNS], 'readwrite');
    const store = transaction.objectStore(STORES.DESIGNS);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('All designs cleared from IndexedDB');
        resolve();
      };
    });
  } catch (error) {
    console.error('Error clearing designs from IndexedDB:', error);
    throw error;
  }
};

/**
 * Save cache data (temporary storage)
 */
export const saveCache = async (key, data) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);

    return new Promise((resolve, reject) => {
      const request = store.put({ ...data, timestamp: Date.now() }, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(data);
    });
  } catch (error) {
    console.error('Error saving cache to IndexedDB:', error);
    throw error;
  }
};

/**
 * Get cache data
 */
export const getCache = async (key) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORES.CACHE], 'readonly');
    const store = transaction.objectStore(STORES.CACHE);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error('Error getting cache from IndexedDB:', error);
    return null;
  }
};

/**
 * Clear entire database
 */
export const clearDB = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction(
      [STORES.USER, STORES.DESIGNS, STORES.CACHE],
      'readwrite'
    );

    return new Promise((resolve, reject) => {
      const userStore = transaction.objectStore(STORES.USER);
      const designStore = transaction.objectStore(STORES.DESIGNS);
      const cacheStore = transaction.objectStore(STORES.CACHE);

      userStore.clear();
      designStore.clear();
      cacheStore.clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => {
        console.log('IndexedDB cleared completely');
        resolve();
      };
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    throw error;
  }
};

export default {
  initDB,
  saveUser,
  getUser,
  clearUser,
  saveDesign,
  getDesigns,
  getDesign,
  deleteDesign,
  clearDesigns,
  saveCache,
  getCache,
  clearDB
};
