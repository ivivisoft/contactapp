(function () {
    //define spine framework  name
    var Spine;
    //if has exports attr set it to Spine
    if (typeof exports !== "undefined") {
        Spine = exports;
    } else {
        //else set  it to window("this" is window)
        Spine = this.Spine = {};
    }

    //set Spine version
    Spine.version = "0.0.4";
    //set $ to jQuery or Zeptojs or the first arguments pass in
    var $ = Spine.$ = this.jQuery || this.Zepto || function () {
            return arguments[0];
        };
    //define make array method,let args to a array
    var makeArray = Spine.makeArray = function (args) {
        //slice not change the origin array
        return Array.prototype.slice.call(args, 0);
    };
    //determine the value is a array or not
    var isArray = Spine.isArray = function (value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    };

    // Shim Array, as these functions aren't in IE
    if (typeof Array.prototype.indexOf === "undefined")
        Array.prototype.indexOf = function (value) {
            for (var i = 0; i < this.length; i++)
                if (this[i] === value)
                    return i;
            return -1;
        };

    //event component(someone just a publish subscribe model)
    var Events = Spine.Events = {
        bind: function (ev, callback) {
            //many event split by " "
            var evs = ev.split(" ");
            //define message Bus
            var calls = this._callbacks || (this._callbacks = {});
            //let event and callback build relationships
            for (var i = 0; i < evs.length; i++)
                (calls[evs[i]] || (calls[evs[i]] = [])).push(callback);
            //support chain
            return this;
        },

        trigger: function () {
            //deal arguments
            var args = makeArray(arguments);
            //first element is event's name
            var ev = args.shift();
            //validate the params(bind method must be invoke at first trigger method)
            var list, calls, i, l;
            if (!(calls = this._callbacks)) return false;
            if (!(list = calls[ev])) return false;

            for (i = 0, l = list.length; i < l; i++)
                if (list[i].apply(this, args) === false)
                    break;

            return true;
        },
        //unbind all event's callback or a event's callback
        unbind: function (ev, callback) {
            //if !ev is true  unbind every callback
            if (!ev) {
                this._callbacks = {};
                return this;
            }

            var list, calls, i, l;
            if (!(calls = this._callbacks)) return this;
            if (!(list = calls[ev])) return this;
            //if callback not pass,This ev's callback will remove all
            if (!callback) {
                delete calls[ev];
                return this;
            }
            //remove ev's the specify callback
            for (i = 0, l = list.length; i < l; i++)
                if (callback === list[i]) {
                    //splice change the origin array,There is remove the element of the index is i
                    list.splice(i, 1);
                    break;
                }

            return this;
        }
    };
    // log component
    var Log = Spine.Log = {
        // a switch
        trace: true,
        //default log prefix
        logPrefix: "(App)",

        log: function () {
            if (!this.trace) return;
            if (typeof console == "undefined") return;
            //translate the arguments to array
            var args = makeArray(arguments);
            //if logPrefix is specify,the logPrefix add to the args first position
            if (this.logPrefix) args.unshift(this.logPrefix);
            //invoke console's log method to print the logs
            console.log.apply(console, args);
            // support chain
            return this;
        }
    };

    // Classes component (or prototype inheritors)
    //define Object's create method
    if (typeof Object.create !== "function")
        Object.create = function (o) {
            function F() {
            }

            F.prototype = o;
            return new F();
        };
    //define the Class component's key words,let them couldn't
    // over by include and extend method
    var moduleKeywords = ["included", "extended"];

    var Class = Spine.Class = {
        //the inherited  callback
        inherited: function () {
        },
        //the created callback
        created: function () {
        },
        //instance's method
        prototype: {
            initialize: function () {
            },
            init: function () {
            }
        },
        /**
         * define a class
         * @param include extend instance attribute
         * @param extend extend class attribute
         * @returns {Object} a class
         */
        create: function (include, extend) {
            //copy class attribute
            var object = Object.create(this);
            //specify the parent
            object.parent = this;
            //copy instance attribute
            object.prototype = object.fn = Object.create(this.prototype);

            if (include) object.include(include);
            if (extend) object.extend(extend);
            //invoke the created callback
            object.created();
            this.inherited(object);
            return object;
        },
        /**
         * create a class instance
         */
        init: function () {
            //copy the instance attribute
            var instance = Object.create(this.prototype);
            instance.parent = this;
            //invoke the instance's initialize method
            instance.initialize.apply(instance, arguments);
            //invoke the instance's init method
            instance.init.apply(instance, arguments);
            return instance;
        },
        //proxy the this object
        proxy: function (func) {
            var thisObject = this;
            return (function () {
                return func.apply(thisObject, arguments);
            });
        },
        //proxy a lot of functions once a time
        proxyAll: function () {
            var i, max;
            var functions = makeArray(arguments);
            for (i = 0, max = functions.length; i < max; i++)
                this[functions[i]] = this.proxy(this[functions[i]]);
        },
        //extend the instance attribute
        include: function (obj) {
            for (var key in obj)
                //extend the keywords
                if (moduleKeywords.indexOf(key) == -1)
                    this.fn[key] = obj[key];

            var included = obj.included;
            if (included) included.apply(this);
            return this;
        },
        //extend the class attribute
        extend: function (obj) {
            for (var key in obj)
                //extend the keywords
                if (moduleKeywords.indexOf(key) == -1)
                    this[key] = obj[key];

            var extended = obj.extended;
            if (extended) extended.apply(this);
            return this;
        }
    };
    //set some attribute to the class instance
    Class.prototype.proxy = Class.proxy;
    Class.prototype.proxyAll = Class.proxyAll;
    //set some alias
    Class.inst = Class.init;
    Class.sub = Class.create;

    // Models Component
    //generate the UUID
    Spine.guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    };
    //define Model Class
    var Model = Spine.Model = Class.create();
    //Model extend events attribute
    Model.extend(Events);
    //define Model's Class method
    Model.extend({
        setup: function (name, atts) {
            var model = Model.sub();
            if (name) model.name = name;
            if (atts) model.attributes = atts;
            return model;
        },

        created: function (sub) {
            this.records = {};
            this.attributes = this.attributes ?
                makeArray(this.attributes) : [];
        },

        find: function (id) {
            var record = this.records[id];
            if (!record) throw("Unknown record");
            return record.clone();
        },

        exists: function (id) {
            try {
                return this.find(id);
            } catch (e) {
                return false;
            }
        },

        refresh: function (values) {
            var i, il;
            values = this.fromJSON(values);
            this.records = {};

            for (i = 0, il = values.length; i < il; i++) {
                var record = values[i];
                record.newRecord = false;
                this.records[record.id] = record;
            }

            this.trigger("refresh");
            return this;
        },

        select: function (callback) {
            var result = [];

            for (var key in this.records)
                if (callback(this.records[key]))
                    result.push(this.records[key]);

            return this.cloneArray(result);
        },

        findByAttribute: function (name, value) {
            for (var key in this.records)
                if (this.records[key][name] == value)
                    return this.records[key].clone();
        },

        findAllByAttribute: function (name, value) {
            return (this.select(function (item) {
                return (item[name] == value);
            }));
        },

        each: function (callback) {
            for (var key in this.records)
                callback(this.records[key]);
        },

        all: function () {
            return this.cloneArray(this.recordsValues());
        },

        first: function () {
            var record = this.recordsValues()[0];
            return (record && record.clone());
        },

        last: function () {
            var values = this.recordsValues()
            var record = values[values.length - 1];
            return (record && record.clone());
        },

        count: function () {
            return this.recordsValues().length;
        },

        deleteAll: function () {
            for (var key in this.records)
                delete this.records[key];
        },

        destroyAll: function () {
            for (var key in this.records)
                this.records[key].destroy();
        },

        update: function (id, atts) {
            this.find(id).updateAttributes(atts);
        },

        create: function (atts) {
            var record = this.init(atts);
            return record.save();
        },

        destroy: function (id) {
            this.find(id).destroy();
        },

        sync: function (callback) {
            this.bind("change", callback);
        },

        fetch: function (callbackOrParams) {
            typeof(callbackOrParams) == "function" ?
                this.bind("fetch", callbackOrParams) :
                this.trigger("fetch", callbackOrParams);
        },

        toJSON: function () {
            return this.recordsValues();
        },

        fromJSON: function (objects) {
            if (!objects) return;
            if (typeof objects === "string")
                objects = JSON.parse(objects);
            if (isArray(objects)) {
                var results = [], i, max;
                for (i = 0, max = objects.length; i < max; i++)
                    results.push(this.init(objects[i]));
                return results;
            } else {
                return this.init(objects);
            }
        },

        // Private

        recordsValues: function () {
            var result = [];
            for (var key in this.records)
                result.push(this.records[key]);
            return result;
        },

        cloneArray: function (array) {
            var result = [];
            for (var i = 0; i < array.length; i++)
                result.push(array[i].clone());
            return result;
        }
    });

    Model.include({
        model: true,
        newRecord: true,

        init: function (atts) {
            if (atts) this.load(atts);
            this.trigger("init", this);
        },

        isNew: function () {
            return this.newRecord;
        },

        isValid: function () {
            return (!this.validate());
        },

        validate: function () {
        },

        load: function (atts) {
            for (var name in atts)
                this[name] = atts[name];
        },

        attributes: function () {
            var result = {}, i, max;
            for (i = 0, max = this.parent.attributes.length; i < max; i++) {
                var attr = this.parent.attributes[i];
                result[attr] = this[attr];
            }
            result.id = this.id;
            return result;
        },

        eql: function (rec) {
            return (rec && rec.id === this.id &&
            rec.parent === this.parent);
        },

        save: function () {
            var error = this.validate();
            if (error) {
                this.trigger("error", this, error);
                return false;
            }

            this.trigger("beforeSave", this);
            this.newRecord ? this.create() : this.update();
            this.trigger("save", this);
            return this;
        },

        updateAttribute: function (name, value) {
            this[name] = value;
            return this.save();
        },

        updateAttributes: function (atts) {
            this.load(atts);
            return this.save();
        },

        destroy: function () {
            this.trigger("beforeDestroy", this);
            delete this.parent.records[this.id];
            this.destroyed = true;
            this.trigger("destroy", this);
            this.trigger("change", this, "destroy");
        },

        dup: function () {
            var result = this.parent.init(this.attributes());
            result.newRecord = this.newRecord;
            return result;
        },

        clone: function () {
            return Object.create(this);
        },

        reload: function () {
            if (this.newRecord) return this;
            var original = this.parent.find(this.id);
            this.load(original.attributes());
            return original;
        },

        toJSON: function () {
            return (this.attributes());
        },

        exists: function () {
            return (this.id && this.id in this.parent.records);
        },

        // Private

        update: function () {
            this.trigger("beforeUpdate", this);
            var records = this.parent.records;
            records[this.id].load(this.attributes());
            var clone = records[this.id].clone();
            this.trigger("update", clone);
            this.trigger("change", clone, "update");
        },

        create: function () {
            this.trigger("beforeCreate", this);
            if (!this.id) this.id = Spine.guid();
            this.newRecord = false;
            var records = this.parent.records;
            records[this.id] = this.dup();
            var clone = records[this.id].clone();
            this.trigger("create", clone);
            this.trigger("change", clone, "create");
        },

        bind: function (events, callback) {
            return this.parent.bind(events, this.proxy(function (record) {
                if (record && this.eql(record))
                    callback.apply(this, arguments);
            }));
        },

        trigger: function () {
            return this.parent.trigger.apply(this.parent, arguments);
        }
    });

    // Controllers

    var eventSplitter = /^(\w+)\s*(.*)$/;

    var Controller = Spine.Controller = Class.create({
        tag: "div",

        initialize: function (options) {
            this.options = options;

            for (var key in this.options)
                this[key] = this.options[key];

            if (!this.el) this.el = document.createElement(this.tag);
            this.el = $(this.el);

            if (!this.events) this.events = this.parent.events;
            if (!this.elements) this.elements = this.parent.elements;

            if (this.events) this.delegateEvents();
            if (this.elements) this.refreshElements();
            if (this.proxied) this.proxyAll.apply(this, this.proxied);
        },

        $: function (selector) {
            return $(selector, this.el);
        },

        delegateEvents: function () {
            for (var key in this.events) {
                var methodName = this.events[key];
                var method = this.proxy(this[methodName]);

                var match = key.match(eventSplitter);
                var eventName = match[1], selector = match[2];

                if (selector === '') {
                    this.el.bind(eventName, method);
                } else {
                    this.el.delegate(selector, eventName, method);
                }
            }
        },

        refreshElements: function () {
            for (var key in this.elements) {
                this[this.elements[key]] = this.$(key);
            }
        },

        delay: function (func, timeout) {
            setTimeout(this.proxy(func), timeout || 0);
        }
    });

    Controller.include(Events);
    Controller.include(Log);

    Spine.App = Class.create();
    Spine.App.extend(Events);
    Controller.fn.App = Spine.App;
})();
