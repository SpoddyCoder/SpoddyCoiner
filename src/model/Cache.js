const { Controller } = require( '../controller/SpoddyCoiner' );
const { Model } = require( '../controller/SpoddyCoiner' );

Model.Cache = {

    /**
     * Cache time in seconds
     */
    DEFAULT_CACHE_TIME: 3600,
    MAX_CACHE_TIME: 21600,

    /**
     * The cache key for the Cache Keys Tracker
     */
    CACHE_KEYS: 'cache_keys',

    /**
     * Put string or JSON object into cache by key name
     *
     * @param {string} key  key name
     * @param {string} obj  object/string to store
     * @return {boolean}    succesfully added
     */
    put: ( key, obj ) => {
        const cache = CacheService.getUserCache();
        const prefixedKey = Model.Cache.prefixKey( key );
        let returnObj = obj;
        if ( typeof ( obj ) !== 'string' ) {
            returnObj = JSON.stringify( obj );
        }
        if ( key !== Model.Cache.CACHE_KEYS ) {
            Model.Cache.addToCacheKeysTracker( prefixedKey );
        }
        return cache.put( prefixedKey, returnObj, Model.Props.getCacheTime() );
    },

    /**
     * Get String or JSON object from cache by key name
     *
     * @param {string} key      key name
     * @return {object|string}  the JSON object/string/null
     */
    get: ( key ) => {
        const cache = CacheService.getUserCache();
        const prefixedKey = Model.Cache.prefixKey( key );
        const obj = cache.get( prefixedKey );
        let returnObj = obj;
        try {
            returnObj = JSON.parse( obj );
        } catch ( e ) {
            return returnObj; // string
        }
        // init the cache_keys tracker when it's needed (can expire outside the scope of the script)
        if ( key === Model.Cache.CACHE_KEYS && obj === null ) {
            Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
            return [];
        }
        return returnObj; // object or null
    },

    /**
     * Clear the cache, using our cache_keys tracker
     *
     * @return {boolean}    cleared OK
     */
    clear: () => {
        const cache = CacheService.getUserCache();
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        if ( cacheKeys ) {
            cache.removeAll( cacheKeys );
            Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
            return true;
        }
        return false;
    },

    /**
     * Get number of items stored in cache
     *
     * @return {number}     the number of items currently cached
     */
    getNumItems: () => {
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        return cacheKeys.length;
    },

    /**
     * Prefix all cache keys with VERSION to facilitate invalidation
     *
     * @param {string} key  the base key name to apply prefix
     * @return {string}     the prefixed key name
     */
    prefixKey: ( key ) => {
        if ( key.includes( `${Controller.SpoddyCoiner.VERSION}_` ) ) {
            return key;
        }
        return `${Controller.SpoddyCoiner.VERSION}_${key}`;
    },

    /**
     * Add key to "cache_keys" tracker array
     *
     * @param {string} key  key name
     * @return {boolean}    was added, true|false
     */
    addToCacheKeysTracker: ( key ) => {
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        if ( cacheKeys.indexOf( key ) === -1 ) {
            cacheKeys.push( key );
            return Model.Cache.put( Model.Cache.CACHE_KEYS, cacheKeys );
        }
        return false;
    },

};
