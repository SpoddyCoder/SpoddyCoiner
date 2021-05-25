class APICache {
    /**
     * API Cache model
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * Cache time in seconds
         */
        this.MAX_CACHE_TIME = 21600;

        /**
         * The cache key for the Cache Keys Tracker
         */
        this.CACHE_KEYS = 'cache_keys';

        /**
         * GAS user cache service
         */
        this.userCache = CacheService.getUserCache();
    }

    /**
     * Put string or JSON object into cache by key name
     *
     * @param {string} key  key name
     * @param {string} obj  object/string to store
     * @return {boolean}    succesfully added
     */
    put( key, obj ) {
        const prefixedKey = this.prefixKey( key );
        let returnObj = obj;
        if ( typeof ( obj ) !== 'string' ) {
            returnObj = JSON.stringify( obj );
        }
        if ( key !== this.CACHE_KEYS ) {
            this.addToCacheKeysTracker( prefixedKey );
        }
        return this.userCache.put(
            prefixedKey,
            returnObj,
            this.SpoddyCoiner.Model.GASProps.getCacheTime(),
        );
    }

    /**
     * Get String or JSON object from cache by key name
     *
     * @param {string} key      key name
     * @return {object|string}  the JSON object/string/null
     */
    get( key ) {
        const prefixedKey = this.prefixKey( key );
        const obj = this.userCache.get( prefixedKey );
        let returnObj = obj;
        if ( obj !== null ) {
            // object in the cache
            if ( key !== this.CACHE_KEYS ) {
                // add it to cache_keys if not already (possible for these to become disconnected)
                this.addToCacheKeysTracker( prefixedKey );
            }
            try {
                returnObj = JSON.parse( obj );
            } catch ( e ) {
                return returnObj; // string
            }
        }
        // init the cache_keys tracker when it's needed (can expire outside the scope of the script)
        if ( key === this.CACHE_KEYS && obj === null ) {
            this.put( this.CACHE_KEYS, [] );
            return [];
        }
        return returnObj; // object or null
    }

    /**
     * Prefix all cache keys with VERSION to facilitate invalidation
     *
     * @param {string} key  the base key name to apply prefix
     * @return {string}     the prefixed key name
     */
    prefixKey( key ) {
        if ( key.includes( `${this.SpoddyCoiner.VERSION}_` ) ) {
            return key;
        }
        return `${this.SpoddyCoiner.VERSION}_${key}`;
    }

    /**
     * Clear the cache, using our cache_keys tracker
     *
     * @return {boolean}    cleared OK
     */
    clear() {
        const cacheKeys = this.get( this.CACHE_KEYS );
        if ( cacheKeys ) {
            this.userCache.removeAll( cacheKeys );
            this.put( this.CACHE_KEYS, [] );
            return true;
        }
        return false;
    }

    /**
     * Get number of items stored in cache
     *
     * @return {number}     the number of items currently cached
     */
    getNumItems() {
        return this.get( this.CACHE_KEYS ).length;
    }

    /**
     * Add key to "cache_keys" tracker array
     *
     * @param {string} key  key name
     * @return {boolean}    was added, true|false
     */
    addToCacheKeysTracker( key ) {
        const cacheKeys = this.get( this.CACHE_KEYS );
        if ( cacheKeys.indexOf( key ) === -1 ) {
            cacheKeys.push( key );
            return this.put( this.CACHE_KEYS, cacheKeys );
        }
        return false;
    }

    logCacheKeys() {
        Logger.log( this.get( this.CACHE_KEYS ) );
    }
}

module.exports = { APICache };
