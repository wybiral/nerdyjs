try {
    global = window;
} catch (e) {
    global = self;
}

(function(global) {

    if (!(_.each || _.indexOf || _.isNumber)) {
        throw Error('ClassyJS requires underscore.js, http://underscorejs.org/');
    }

    /*
        Very basic event system used in Classy objects
    */
    function Events() {
        this.events = {};
    }

    Events.prototype.attach = function(obj) {
        var events = this;
        obj.on = function(type, callback) {
            events.on(type, callback);
            return obj;
        };
        obj.off = function(type, callback) {
            events.off(type, callback);
            return obj;
        };
        obj.trigger = function(type, data) {
            events.trigger(type, data);
            return obj;
        };
    };

    Events.prototype.on = function(type, callback) {
        var event = this.events[type];
        if (typeof event == 'undefined') {
            event = this.events[type] = [];
        }
        event.push(callback);
    };

    Events.prototype.off = function(type, callback) {
        var event = this.events[type];
        if (typeof event != 'undefined') {
            if (typeof callback == 'undefined') {
                event.splice(0, event.length);
            } else {
                event.splice(_.indexOf(event, callback), 1);
            }
        }
    };

    Events.prototype.trigger = function(type, data) {
        var event = this.events[type];
        if (typeof event != 'undefined') {
            _.each(event, function(callback) {
                callback(data);
            });
        }
    };


    /*
        Installs a property with type-checking and a change: trigger.
    */
    function property(obj, name, type) {
        var value;
        var objs = [], condition = buildCondition(type, 'arguments[0]', objs);
        var test = (new Function('__objs__',
            'return function() {return ' + condition + '}'
        ))(objs);
        Object.defineProperty(obj, name, {
            get: function() {
                return value;
            },
            set: function(newValue) {
                if (test(newValue)) {
                    obj.trigger('change:' + name, newValue);
                    value = newValue;
                } else {
                    throw TypeError(
                        'Property ' + name + ' must be of type: ' +
                        (type.name || type.toString())
                    );
                }
            }
        });
    }


    function Classy(define) {

        var properties = [],  // All installed properties
            allowInit = true, // Used to disable init for subclass prototypes
            Class;            // The Classy Class itself

        /*
            Classy instances contain the following properties:
                __class__ (the class that constructed it)
                __events__ (the Events instance associated with it)
            Subclasses contain a __super__ property referencing the super class
        */
        Class = (function() {
            if (this instanceof Class) {
                // Instantiated with "new"
                if (allowInit) {
                    this.__class__ = Class;
                    this.__events__ = new Events();
                    this.__events__.attach(this);
                    for (var i = 0; i < properties.length; i++) {
                        property(this, properties[i][0], properties[i][1]);
                    }
                    if (typeof this.init != 'undefined') {
                        this.init.apply(this, arguments);
                    }
                }
            } else {
                // Instantiated without "new"
                var instance, temp = Class;
                Class = function(args) {
                    return temp.apply(this, args);
                };
                Class.prototype = temp.prototype;
                instance = new Class(arguments);
                Class = temp;
                return instance;
            }
        });

        Class.property = function(name, type) {
            properties.push([name, type]);
        };

        Class.method = function(name, args, func) {
            var method = Class.prototype[name];
            if (typeof method == 'undefined') {
                method = Class.prototype[name] = Classy.method(name);
            }
            if (arguments.length == 1) {
                return method;
            }
            if (typeof method.when != 'undefined') {
                method.when(args, func);
            } else {
                throw Error(name + ' is already defined and is not a Classy method');
            }
            return Class;
        };

        Class.subclass = function(defineSub) {
            var SubClass = new Classy();
            var prototype = {};
            SubClass.__super__ = Class;
            allowInit = false;
            SubClass.prototype = new Class();
            for (var key in SubClass.prototype) {
                var attr = SubClass.prototype[key];
                if (attr.lookup && attr.when && attr.copy) {
                    SubClass.prototype[key] = attr.copy();
                }
            }
            if (typeof defineSub != 'undefined') {
                defineSub(SubClass, Class);
            }
            allowInit = true;
            return SubClass;
        };

        if (typeof define != 'undefined') {
            define(Class);
        }

        return Class;
    }

    var basicTypes = [
        'NaN', 'Number', 'Boolean', 'String',
        'Function', 'Array', 'Date', 'RegExp', 'Element'
    ];
    var builtinTypes = {};
    _.each(basicTypes, function(typeName) {
        var type = eval('global.' + typeName);
        if (typeof type != 'undefined') {
            builtinTypes[type] = function(arg) {
                return '_.is' + typeName + '(' + arg + ')';
            };
        }
    });

    builtinTypes[undefined] = function(arg) {
        return 'typeof ' + arg + ' == "undefined"'
    };

    builtinTypes[null] = function(arg) {
        return arg + ' === null'
    };

    builtinTypes[Object] = function(arg) {
        return 'typeof ' + arg + ' != "undefined"';
    };

    function buildCondition(type, arg, objs) {
        if (type in builtinTypes) {
            return builtinTypes[type](arg);
        } else if (type instanceof Classy.validator) {
            var index = _.indexOf(objs, type.fn);
            if (index == -1) {
                index = objs.length;
                objs.push(type.fn);
            }
            return '__objs__[' + index + '](' + arg + ')';
        } else {
            var index = _.indexOf(objs, type);
            if (index == -1) {
                index = objs.length;
                objs.push(type);
            }
            return arg + ' instanceof __objs__[' + index + ']';
        }
    }

    /*
        Build type test out of obj.
        If a non-native type is used, the test generated will be
            "arguments[i] instanceof __objs__[j]"
        Where j is the index of that type in the "obj" parameter. If the type
        isn't found in the objs parameter, it will be appended to it with the
        push method and the new index will be used.
    */
    function buildTest(obj, objs) {
        if (obj instanceof Array) {
            var tests = ['arguments.length == ' + obj.length];
            for (var i = 0; i < obj.length; i++) {
                tests.push(buildCondition(obj[i], 'arguments[' + i + ']', objs));
            };
            return tests.join(' && ');
        } else {
            return buildCondition(obj, 'arguments[0]', objs);
        }
    }

    /*
        All Classy methods are created with this function.
    */
    Classy.method = function(name) {
        return (function methodize(objs, definitions) {
            var method = function() {
                var func = method.lookup.call(this, arguments);
                if (typeof func != 'undefined') {
                    return func.apply(this, arguments);
                } else {
                    throw TypeError(
                        name + ' has no implementation for arguments: ' +
                        Array.prototype.slice.call(arguments)
                    );
                }
            };
            method.lookup = function(args) {
                var length = definitions.length, def;
                for (var i = 0; i < length; i++) {
                    def = definitions[i];
                    if (def.test.apply(this, args)) {
                        return def.func;
                    }
                }
            };
            method.when = function(expr, func) {
                if (typeof func == 'undefined') {
                    func = expr;
                    expr = 'true';
                } else {
                    expr = buildTest(expr, objs);
                }
                definitions.unshift({
                    expr: expr,
                    test: (new Function(['__objs__'],
                        'return function() {return ' + expr + '}'
                    ))(objs),
                    func: func
                });
                return method;
            };
            method.copy = function() {
                return methodize(objs.slice(0), definitions.slice(0));
            };

            return method;
        })([], []);
    };

    Classy.validator = new Classy(function(cls) {
        cls.method('init', [Function], function(fn) {
            this.fn = fn;
        });
        cls.method('init', [String], function(str) {
            this.init(new Function('x', 'return ' + str));
        });
        cls.method('and', function(that) {
            var fn = this.fn;
            return cls(function(x) {
                return fn(x) && that.fn(x);
            });
        });
        cls.method('or', function(that) {
            var fn = this.fn;
            return cls(function(x) {
                return fn(x) || that.fn(x);
            });
        });
        cls.method('not', function() {
            var fn = this.fn;
            return cls(function(x) {
                return !fn(x);
            });
        });
    });

    

    Classy.module = function(define) {
        define(global);
    };

    global.Classy = Classy;

})(global);
