/*
 * @fileOverview A seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
(function (S, undefined) {
    /**
     * @namespace The KISSY global namespace object. you can use
     * <code>
     *     KISSY.each/mix
     * </code>
     * to do basic operation.
     * or
     * <code>
     *      KISSY.use("overlay,node",function(S,Overlay,Node){
     *          //
     *      })
     * </code>
     * to do complex task with modules.
     * @name KISSY
     */

    function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    var host = this,
        MIX_CIRCULAR_DETECTION = "__MIX_CIRCULAR",
        hasEnumBug = !({toString:1}.propertyIsEnumerable('toString')),
        enumProperties = [
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ],
        meta = {
            /**
             * Copies all the properties of s to r.
             * @name KISSY.mix
             * @function
             * @param {Object} r the augmented object
             * @param {Object} s the object need to augment
             * @param {Boolean|Object} [ov=true] whether overwrite existing property or config.
             * @param {Boolean} [ov.overwrite=true] whether overwrite existing property.
             * @param {String[]} [ov.whitelist] array of white-list properties
             * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
             * @param {String[]} [wl] array of white-list properties
             * @param [deep=false] {Boolean} whether recursive mix if encounter object.
             * @return {Object} the augmented object
             * @example
             * <code>
             * var t={};
             * S.mix({x:{y:2,z:4}},{x:{y:3,a:t}},{deep:true}) => {x:{y:3,z:4,a:{}}} , a!==t
             * S.mix({x:{y:2,z:4}},{x:{y:3,a:t}},{deep:true,overwrite:false}) => {x:{y:2,z:4,a:{}}} , a!==t
             * S.mix({x:{y:2,z:4}},{x:{y:3,a:t}},1) => {x:{y:3,a:t}}
             * </code>
             */
            mix:function (r, s, ov, wl, deep) {
                if (typeof ov === 'object') {
                    wl = ov['whitelist'];
                    deep = ov['deep'];
                    ov = ov['overwrite'];
                }
                var cache = [], c, i = 0;
                mixInternal(r, s, ov, wl, deep, cache);
                while (c = cache[i++]) {
                    delete c[MIX_CIRCULAR_DETECTION];
                }
                return r;
            }
        },

        mixInternal = function (r, s, ov, wl, deep, cache) {
            if (!s || !r) {
                return r;
            }

            if (ov === undefined) {
                ov = true;
            }

            var i = 0, p, len;

            if (wl && (len = wl.length)) {
                for (; i < len; i++) {
                    p = wl[i];
                    if (p in s) {
                        _mix(p, r, s, ov, deep, cache);
                    }
                }
            } else {

                s[MIX_CIRCULAR_DETECTION] = r;

                cache.push(s);

                for (p in s) {
                    if (p != MIX_CIRCULAR_DETECTION) {
                        // no hasOwnProperty judge !
                        _mix(p, r, s, ov, deep, cache);
                    }
                }

                // fix #101
                if (hasEnumBug) {
                    for (; p = enumProperties[i++];) {
                        if (hasOwnProperty(s, p)) {
                            _mix(p, r, s, ov, deep, cache);
                        }
                    }
                }
            }
            return r;
        },

        _mix = function (p, r, s, ov, deep, cache) {
            // 要求覆盖
            // 或者目的不存在
            // 或者深度mix
            if (ov || !(p in r) || deep) {
                var target = r[p],
                    src = s[p];
                // prevent never-end loop
                if (target === src) {
                    return;
                }
                // 来源是数组和对象，并且要求深度 mix
                if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                    if (src[MIX_CIRCULAR_DETECTION]) {
                        r[p] = src[MIX_CIRCULAR_DETECTION];
                    } else {
                        // 目标值为对象或数组，直接 mix
                        // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                        var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
                            target :
                            (S.isArray(src) ? [] : {});
                        // 记录循环标志
                        src[MIX_CIRCULAR_DETECTION] = r[p] = clone;
                        // 记录被记录了循环标志的对像
                        cache.push(src);
                        mixInternal(clone, src, ov, undefined, true, cache);
                    }
                } else if (src !== undefined && (ov || !(p in r))) {
                    r[p] = src;
                }
            }
        },

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
        seed = (host && host[S]) || {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    seed.Env = seed.Env || {};
    host = seed.Env.host || (seed.Env.host = host || {});

    // shortcut and meta for seed.
    // override previous kissy
    S = host[S] = meta.mix(seed, meta);

    S.mix(KISSY,
        /**
         * @lends KISSY
         */
        {
            /**
             * @private
             */
            configs:(S.configs || {}),

            /**
             * The version of the library.
             * @type {String}
             */
            version:'@VERSION@',

            /**
             * Returns a new object containing all of the properties of
             * all the supplied objects. The properties from later objects
             * will overwrite those in earlier objects. Passing in a
             * single object will create a shallow copy of it.
             * @param {...} m1 objects need to be merged
             * @return {Object} the new merged object
             */
            merge:function (m1) {
                var o = {}, i, l = arguments.length;
                for (i = 0; i < l; i++) {
                    S.mix(o, arguments[i]);
                }
                return o;
            },

            /**
             * Applies prototype properties from the supplier to the receiver.
             * @param   {Object} r received object
             * @param   {...Object} s1 object need to  augment
             *          {Boolean} [ov=true] whether overwrite existing property
             *          {String[]} [wl] array of white-list properties
             * @return  {Object} the augmented object
             */
            augment:function (r, s1) {
                var args = S.makeArray(arguments),
                    len = args.length - 2,
                    i = 1,
                    ov = args[len],
                    wl = args[len + 1];

                if (!S.isArray(wl)) {
                    ov = wl;
                    wl = undefined;
                    len++;
                }
                if (!S.isBoolean(ov)) {
                    ov = undefined;
                    len++;
                }

                for (; i < len; i++) {
                    S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
                }

                return r;
            },

            /**
             * Utility to set up the prototype, constructor and superclass properties to
             * support an inheritance strategy that can chain constructors and methods.
             * Static members will not be inherited.
             * @param r {Function} the object to modify
             * @param s {Function} the object to inherit
             * @param {Object} [px] prototype properties to add/override
             * @param {Object} [sx] static properties to add/override
             * @return r {Object}
             */
            extend:function (r, s, px, sx) {
                if (!s || !r) {
                    return r;
                }

                var create = Object.create ?
                        function (proto, c) {
                            return Object.create(proto, {
                                constructor:{
                                    value:c
                                }
                            });
                        } :
                        function (proto, c) {
                            function F() {
                            }

                            F.prototype = proto;

                            var o = new F();
                            o.constructor = c;
                            return o;
                        },
                    sp = s.prototype,
                    rp;

                // add prototype chain
                rp = create(sp, r);
                r.prototype = S.mix(rp, r.prototype);
                r.superclass = create(sp, s);

                // add prototype overrides
                if (px) {
                    S.mix(rp, px);
                }

                // add object overrides
                if (sx) {
                    S.mix(r, sx);
                }

                return r;
            },

            /****************************************************************************************

             *                            The KISSY System Framework                                *

             ****************************************************************************************/


            /**
             * Returns the namespace specified and creates it if it doesn't exist. Be careful
             * when naming packages. Reserved words may work in some browsers and not others.
             * <code>
             * S.namespace('KISSY.app'); // returns KISSY.app
             * S.namespace('app.Shop'); // returns KISSY.app.Shop
             * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
             * </code>
             * @return {Object}  A reference to the last namespace object created
             */
            namespace:function () {
                var args = S.makeArray(arguments),
                    l = args.length,
                    o = null, i, j, p,
                    global = (args[l - 1] === true && l--);

                for (i = 0; i < l; i++) {
                    p = (EMPTY + args[i]).split('.');
                    o = global ? host : this;
                    for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                        o = o[p[j]] = o[p[j]] || { };
                    }
                }
                return o;
            },

            /**
             * set KISSY configuration
             * @param {Object|String}   c Config object or config key.
             * @param {String} c.base   KISSY 's base path.
             *                          Default: get from kissy(-min).js or seed(-min).js
             * @param {String} c.tag    KISSY 's timestamp for native module.
             *                          Default: KISSY 's build time.
             * @param {Boolean} c.debug     whether to enable debug mod.
             * @param {Boolean} c.combine   whether to enable combo.
             * @param {Object} c.packages Packages definition with package name as the key.
             * @param {String} c.packages.base    Package base path.
             * @param {String} c.packages.tag     Timestamp for this package's module file.
             * @param {String} c.packages.debug     Whether force debug mode for current package.
             * @param {String} c.packages.combine     Whether allow combine for current package modules.
             * @param {Array[]} c.map file map      File url map configs.
             * @param {Array[]} c.map.0     A single map rule.
             * @param {RegExp} c.map.0.0    A regular expression to match url.
             * @param {String|Function} c.map.0.1   Replacement for String.replace.
             * @param [v] config value.
             * @example
             * // use gallery from cdn
             * <code>
             * KISSY.config({
             *      combine:true,
             *      base:'',
             *      packages:{
             *          "gallery":{
             *              base:"http://a.tbcdn.cn/s/kissy/gallery/"
             *          }
             *      },
             *      modules:{
             *          "gallery/x/y":{
             *              requires:["gallery/x/z"]
             *          }
             *      }
             * });
             * </code>
             * // use map to reduce connection count
             * <code>
             * S.config("map",[
             *  [
             *   /http:\/\/a.tbcdn.cn\/s\/kissy\/1.2.0\/(?:overlay|component|uibase|switchable)-min.js(.+)$/,
             *   "http://a.tbcdn.cn/s/kissy/1.2.0/??overlay-min.js,component-min.js,uibase-min.js,switchable-min.js$1"
             *  ]
             * ]);
             * </code>
             */
            config:function (c, v) {
                var cfg,
                    r,
                    self = this,
                    runs = [],
                    fn,
                    p,
                    Config = S.Config,
                    configs = S.configs;
                if (S.isObject(c)) {
                    for (p in c) {
                        if (c.hasOwnProperty(p)) {
                            runs.push({
                                name:p,
                                order:configs[p] && configs[p].order || 0,
                                value:c[p]
                            });
                        }
                    }

                    runs.sort(function (a1, a2) {
                        return a1.order > a2.order;
                    });

                    S.each(runs, function (r) {
                        fn = configs[p = r.name];
                        v = r.value;
                        if (fn) {
                            fn.call(self, v);
                        } else {
                            Config[p] = v;
                        }
                    });

                } else {
                    cfg = configs[c];
                    if (v === undefined) {
                        if (cfg) {
                            r = cfg.call(self);
                        } else {
                            r = Config[c];
                        }
                    } else {
                        if (cfg) {
                            r = cfg.call(self, v);
                        } else {
                            Config[c] = v;
                        }
                    }
                }
                return r;
            },

            /**
             * Prints debug info.
             * @param msg {String} the message to log.
             * @param {String} [cat] the log category for the message. Default
             *        categories are "info", "warn", "error", "time" etc.
             * @param {String} [src] the source of the the message (opt)
             */
            log:function (msg, cat, src) {
                if (S.Config.debug && msg) {
                    if (src) {
                        msg = src + ': ' + msg;
                    }
                    if (host['console'] !== undefined && console.log) {
                        console[cat && console[cat] ? cat : 'log'](msg);
                    }
                }
            },

            /**
             * Throws error message.
             */
            error:function (msg) {
                if (S.Config.debug) {
                    throw msg;
                }
            },

            /*
             * Generate a global unique id.
             * @param {String} [pre] guid prefix
             * @return {String} the guid
             */
            guid:function (pre) {
                return (pre || EMPTY) + guid++;
            },

            /**
             * Get all the property names of o as array
             * @param {Object} o
             * @returns {Array}
             */
            keys:function (o) {
                var result = [];

                for (var p in o) {
                    if (o.hasOwnProperty(p)) {
                        result.push(p);
                    }
                }

                if (hasEnumBug) {
                    S.each(enumProperties, function (name) {
                        if (hasOwnProperty(o, name)) {
                            result.push(name);
                        }
                    });
                }

                return result;
            }
        });

    /**
     * Initializes
     */
    (function () {
        var c;
        S.Env = S.Env || {};
        c = S.Config = S.Config || {};
        // NOTICE: '@DEBUG@' will replace with '' when compressing.
        // So, if loading source file, debug is on by default.
        // If loading min version, debug is turned off automatically.
        c.debug = '@DEBUG@';
        /**
         * The build time of the library
         * @type {String}
         */
        S.__BUILD_TIME = '@TIMESTAMP@';
    })();

    return S;

})('KISSY', undefined);
