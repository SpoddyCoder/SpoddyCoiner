Model.Cache = {

  /**
   * Cache time in seconds
   */
  DEFAULT_CACHE_TIME: 3600,
  MAX_CACHE_TIME: 21600,

  /**
   * The cache key for the Cache Keys Tracker
   */
  CACHE_KEYS: "cache_keys",


  /**
   * Put string or JSON object into cache by key name
   * 
   * @param {string} key              key name
   * @param {string} obj              object/string to store
   * 
   * @return {boolean}                succesfully added, true|false
   */
  put: ( key, obj ) => {
    var cache = CacheService.getUserCache();
    var key =  Model.Cache.prefixKey( key );
    if ( typeof(obj) !== "string" ) {
      obj = JSON.stringify( obj );
    }
    if( key !== Model.Cache.prefixKey( Model.Cache.CACHE_KEYS ) ) {
      Model.Cache.addToCacheKeysTracker( key );
    }
    return cache.put( key, obj, Model.Props.getCacheTime() );
  },

  /**
   * Get String or JSON object from cache by key name
   * 
   * @param {string} key              key name
   * 
   * @return {mixed}                  the JSON object/string/null
   */
  get: ( key ) => {
    var cache = CacheService.getUserCache();
    var key =  Model.Cache.prefixKey( key );
    var obj = cache.get( key );
    try {
      var json = JSON.parse( obj );
    } catch (e) {
      return obj;   // string
    }
    // init the cache_keys tracker when it's needed (can expire outside the scope of the script)
    if ( key === Model.Cache.prefixKey( Model.Cache.CACHE_KEYS ) && obj === null ) {
      Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
      return [];
    }
    return json;    // object or null
  },

  /**
   * Clear the cache, using our cache_keys tracker
   * 
   * @return {boolean}                cleared OK, true|false
   */
  clear: () => {
    var cache = CacheService.getUserCache();
    var cache_keys = Model.Cache.get( Model.Cache.CACHE_KEYS );
    if( cache_keys ) {
      cache.removeAll( cache_keys );
      Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
      return true;
    }
    return false;
  },

  /**
   * Get number of items stored in cache
   * 
   * @return (int)                    the number of items currently cached
   */
  getNumItems: () => {
    var cache_keys = Model.Cache.get( Model.Cache.CACHE_KEYS );
    return cache_keys.length;
  },

  /**
   * Prefix all cache keys with VERSION to facilitate invalidation
   * 
   * @param {string} key              the base key name to apply prefix
   * 
   * @return {string}                 the prefixed key name
   */
  prefixKey: ( key ) => {
    if ( key.includes( Controller.SpoddyCoiner.VERSION + "_") ) {
      return key;
    }
    return Controller.SpoddyCoiner.VERSION + "_" + key;
  },

  /**
   * Add key to "cache_keys" tracker array
   * 
   * @param {string} key              key name
   * 
   * @return {boolean}                was added, true|false                 
   */
  addToCacheKeysTracker: ( key ) => {
    var cache_keys = Model.Cache.get( Model.Cache.CACHE_KEYS );
    if ( cache_keys.indexOf( key ) === -1 ) {
      cache_keys.push( key );
      return Model.Cache.put( Model.Cache.CACHE_KEYS, cache_keys );
    }
    return false;
  },

};
