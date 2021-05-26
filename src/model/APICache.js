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
         * max cache time in seconds
         */
        this.MAX_CACHE_TIME = 21600;

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
     * @returns {boolean}   succesfully added
     */
    put( key, obj ) {
        const prefixedKey = this.prefixKey( key );
        let returnObj = obj;
        if ( typeof ( obj ) !== 'string' ) {
            returnObj = JSON.stringify( obj );
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
     * @param {string} key          key name
     * @returns {object|string}     the JSON object/string/null
     */
    get( key ) {
        const prefixedKey = this.prefixKey( key );
        const obj = this.userCache.get( prefixedKey );
        let returnObj = obj;
        if ( obj !== null ) {
            // object in the cache
            try {
                returnObj = JSON.parse( obj );
            } catch ( e ) {
                return returnObj; // string
            }
        }
        return returnObj; // object or null
    }

    /**
     * Prefix all cache keys with VERSION & GASProps.CACHE_BUST_PREFIX to facilitate invalidation
     *
     * @param {string} key  the base key name to apply prefix
     * @returns {string}    the prefixed key name
     */
    prefixKey( key ) {
        const prefix = `${this.SpoddyCoiner.VERSION}.${this.SpoddyCoiner.Model.GASProps.getCacheBustPrefix()}_`;
        if ( key.includes( prefix ) ) {
            return key;
        }
        return `${prefix}${key}`;
    }

    /**
     * Clear the cache by incrementing the GASProps.CACHE_BUST_PREFIX
     *
     * @returns {boolean}   cleared OK
     */
    clear() {
        return this.SpoddyCoiner.Model.GASProps.incrementCacheBustPrefix();
    }
}

module.exports = { APICache };
