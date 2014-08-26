(function() {

    /**
     * Utilities
     */

    var Utils = {};

    Utils.whatIs = function(what) {

        var to = typeof what;

        if (to === "object") {
            if (what === null) {
                return "null";
            }
            if (Array.isArray(what)) {
                return "array";
            }
            return "object"; // typeof what === 'object' && what === Object(what) && !Array.isArray(what);
        }

        if (to === "number") {
            if (Number.isFinite(what)) {
                if (what % 1 === 0) {
                    return "integer";
                } else {
                    return "number";
                }
            }
            if (Number.isNaN(what)) {
                return "not-a-number";
            }
            return "unknown-number";
        }

        return to; // undefined, boolean, string, function

    };

    Utils.areEqual = function(json1, json2) {
        // Two JSON values are said to be equal if and only if:
        // both are nulls; or
        // both are booleans, and have the same value; or
        // both are strings, and have the same value; or
        // both are numbers, and have the same mathematical value; or
        if (json1 === json2) {
            return true;
        }

        var i, len;
        // both are arrays, and:
        if (Array.isArray(json1) && Array.isArray(json2)) {
            // have the same number of items; and
            if (json1.length !== json2.length) {
                return false;
            }
            // items at the same index are equal according to this definition; or
            len = json1.length;
            for (i = 0; i < len; i++) {
                if (!Utils.areEqual(json1[i], json2[i])) {
                    return false;
                }
            }
            return true;
        }

        // both are objects, and:
        if (Utils.whatIs(json1) === "object" && Utils.whatIs(json2) === "object") {
            // have the same set of property names; and
            var keys1 = Object.keys(json1);
            var keys2 = Object.keys(json2);
            if (!Utils.areEqual(keys1, keys2)) {
                return false;
            }
            // values for a same property name are equal according to this definition.
            len = keys1.length;
            for (i = 0; i < len; i++) {
                if (!Utils.areEqual(json1[keys1[i]], json2[keys1[i]])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    Utils.isUniqueArray = function(arr, indexes) {
        var i, j, l = arr.length;
        for (i = 0; i < l; i++) {
            for (j = i + 1; j < l; j++) {
                if (Utils.areEqual(arr[i], arr[j])) {
                    if (indexes) {
                        indexes.push(i, j);
                    }
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Validator
     */
    
    var basefuncs = {
        object: function(object, schema, errors, property, indent) {
            if (!schema.properties || schema.properties.length < 1) errors.schema = 'Instance cannot be empty';

            var requireds = schema.required || []; //make a list

            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    console.log(Array(indent + 1).join(" ") + "Validating " + prop);
                    if (!schema.properties[prop]) errors[prop] = prop + ' is not allowed';
                    console.log("INDENT: ", indent);
                    validateObject(object[prop], schema.properties[prop], errors, prop, indent + 1);
                    var i = requireds.indexOf(prop);
                    if (i != -1)
                        requireds.splice(i, 1);
                }
            }

            //are there still items left?
            if (requireds.length > 0)
                for (var i = 0, l = requireds.length; i < l; i++) {
                    errors[requireds[i]] = requireds[i] + ' is required';
                }
        },
        boolean: function(object, schema, errors, property) {
            // Nothing here...
        },
        string: function(object, schema, errors, property) {
            if (object.length > schema.maxLength) errors[property] = 'Must be less than ' + schema.maxLength + ' characters';
            if (object.length < schema.minLength) errors[property] = 'Must be at least ' + schema.minLength + ' characters long';
        },
        number: function(object, schema, errors, property) {
            if (object > schema.maximum) errors[property] = property + ' must be less than ' + schema.maximum;
            if (object < schema.minimum) errors[property] = property + ' must be more than ' + schema.minimum;
        },
        enum: function(object, schema, errors, property) {
            //indexOf returns -1 when object not found
            if (schema.enum.indexOf(object) == -1) errors[property] = object + ' is not an allowed option'
        },
        array: function(object, schema, errors, property, indent) {
            if (object.length > schema.maxItems) errors[property] = property + ' must have less than ' + schema.maxItems + ' items';
            if (object.length < schema.minItems) errors[property] = property + ' must have more than ' + schema.minItems + ' items';
            object.forEach(function(v, i) {
                console.log(Array(indent + 1).join(" ") + "Validating index " + i);
                validateObject(object[i], schema.items, errors, v, indent + 1);
            });
            if (schema.uniqueItems) {
                var matches = [];
                if (Utils.isUniqueArray(object, matches) === false) {
                    errors[property] = property + ' contains duplicate items';
                }
            }
        },
        date: function(object, schema, errors, property) { //borrowed from http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
            object = new Date(object);
            if (Object.prototype.toString.call(object) !== "[object Date]") errors[property] = property + ' is not a valid Date object';
            if (isNaN(object.getTime())) throw new Error("Invalid date");
        }
    };

    var aliases = {
        integer: function(object, schema, errors, property) {
            basefuncs.number(object, schema, errors, property);
            if (object % 1 != 0) throw new Error("Object is decimal where integer was expected");
        }
    }

    for (var attrname in aliases) {
        basefuncs[attrname] = aliases[attrname];
    }

    var typefuncs = basefuncs;

    var validateObject = function(object, schema, errors, property, indent) {
        // If 'type' is specified, check type of value
        if (schema.type && Utils.whatIs(object) !== schema.type) {
            errors[property] = property + ' must be a ' + schema.type;
        } else {
            typefuncs[schema.type || (schema.enum ? 'enum' : null)](object, schema, errors, property, indent || 0);
        }
    };


    /**
     *  Servant Constructor
     */

    function Servant(version, token) {
        if (!(this instanceof Servant))
            return new Servant();

        this._schemas = {}; // JSON Archetypes the user is working with
        this._token = token; // User's Servant Access Token
        this._version = version; // API Version
        this._path = 'http://api' + this._version + '.localhost:4000/data/' + this._token + '/';

        this.addSchema = function(name, schema) {
            this._schemas[name] = schema;
        };

        this.validate = function(object, name, callback) {
            var errors = {};
            validateObject(object, this._schemas[name], errors, null);

            if (Object.keys(errors).length)
                callback(errors, null);
            else
                callback(null, object);
        };

        this._callAPI = function(method, path, json, success, failed) {

            var url = this._path + path;

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState < 4)
                    return;

                if (xhr.status !== 200)
                    return failed.call(window, JSON.parse(xhr.responseText));

                if (xhr.readyState === 4) {
                    success.call(null, JSON.parse(xhr.responseText));
                }
            };

            xhr.open(method.toUpperCase(), url, true);
            if (json) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(json));
            } else {
                xhr.send();
            }
        };

        // Get User
        this.getUser = function(success, failed) {
            this._callAPI('GET', 'user', null, function(response) {
                success(response);
            }, function(error) {
                failed(error);
            })
        }

        // Get Products
        this.getProducts = function(success, failed) {
            this._callAPI('GET', '', null, function(response) {
                success(response);
            }, function(error) {
                failed(error);
            })
        }

    };


    /**
     * Save To Window Object
     */

    if (!window.Servant) {
        window.Servant = Servant;
    }

})();



// end