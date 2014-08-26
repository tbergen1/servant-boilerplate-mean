(function() {


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
     * Utilities
     */

    Servant.prototype._utilities = {};

    Servant.prototype._utilities.whatIs = function(what) {

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

    Servant.prototype._utilities.areEqual = function areEqual(json1, json2) {
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
                if (!areEqual(json1[i], json2[i])) {
                    return false;
                }
            }
            return true;
        }

        // both are objects, and:
        if (exports.whatIs(json1) === "object" && exports.whatIs(json2) === "object") {
            // have the same set of property names; and
            var keys1 = Object.keys(json1);
            var keys2 = Object.keys(json2);
            if (!areEqual(keys1, keys2)) {
                return false;
            }
            // values for a same property name are equal according to this definition.
            len = keys1.length;
            for (i = 0; i < len; i++) {
                if (!areEqual(json1[keys1[i]], json2[keys1[i]])) {
                    return false;
                }
            }
            return true;
        }

        return false;
    };


    Servant.prototype._utilities.isUniqueArray = function(arr, indexes) {
        var i, j, l = arr.length;
        for (i = 0; i < l; i++) {
            for (j = i + 1; j < l; j++) {
                if (exports.areEqual(arr[i], arr[j])) {
                    if (indexes) {
                        indexes.push(i, j);
                    }
                    return false;
                }
            }
        }
        return true;
    };

    Servant.prototype._utilities.difference = function(bigSet, subSet) {
        var arr = [],
            idx = bigSet.length;
        while (idx--) {
            if (subSet.indexOf(bigSet[idx]) === -1) {
                arr.push(bigSet[idx]);
            }
        }
        return arr;
    };

    Servant.prototype._utilities.clone = function(src) {
        if (typeof src !== "object" || src === null) {
            return src;
        }
        var res, idx;
        if (Array.isArray(src)) {
            res = [];
            idx = src.length;
            while (idx--) {
                res[idx] = src[idx];
            }
        } else {
            res = {};
            var keys = Object.keys(src);
            idx = keys.length;
            while (idx--) {
                var key = keys[idx];
                res[key] = src[key];
            }
        }
        return res;
    };



    /**
     * Validator
     */

    Servant.prototype._validators = {
        maximum: function(errors, rules, value, property) {
            if (typeof value !== "number") {
                return;
            }
            if (rules.exclusiveMaximum !== true) {
                if (value > rules.maximum) {
                    errors[property] = 'Must be less than ' + rules.maximum;
                }
            } else {
                if (value >= rules.maximum) {
                    errors[property] = 'Must be less than ' + rules.maximum;
                }
            }
        },
        exclusiveMaximum: function() {
            // covered in maximum
        },
        minimum: function(errors, rules, value, property) {
            if (typeof value !== "number") {
                return;
            }
            if (rules.exclusiveMinimum !== true) {
                if (value < rules.minimum) {
                    errors[property] = 'Must be more than ' + rules.minimum;
                }
            } else {
                if (value <= rules.minimum) {
                    errors[property] = 'Must be more than ' + rules.minimum;
                }
            }
        },
        exclusiveMinimum: function() {
            // covered in minimum
        },
        maxLength: function(errors, rules, value, property) {
            if (typeof value !== "string") {
                return;
            }
            if (value.length > rules.maxLength) {
                errors[property] = 'Must be less than ' + rules.maxLength + ' characters';
            }
        },
        minLength: function(errors, rules, value, property) {
            if (typeof json !== "string") {
                return;
            }
            if (json.length < schema.minLength) {
                errors[property] = 'Must be at least ' + rules.minLength + ' characters or more';
            }
        },
        pattern: function(report, schema, json) {
            if (typeof json !== "string") {
                return;
            }
            if (RegExp(schema.pattern).test(json) === false) {
                report.addError("PATTERN", [schema.pattern, json]);
            }
        },
        additionalItems: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.3.1.2
            if (!Array.isArray(json)) {
                return;
            }
            // if the value of "additionalItems" is boolean value false and the value of "items" is an array,
            // the json is valid if its size is less than, or equal to, the size of "items".
            if (schema.additionalItems === false && Array.isArray(schema.items)) {
                if (json.length > schema.items.length) {
                    report.addError("ARRAY_ADDITIONAL_ITEMS");
                }
            }
        },
        items: function() { /*report, schema, json*/
            // covered in additionalItems
        },
        maxItems: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.3.2.2
            if (!Array.isArray(json)) {
                return;
            }
            if (json.length > schema.maxItems) {
                report.addError("ARRAY_LENGTH_LONG", [json.length, schema.maxItems]);
            }
        },
        minItems: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.3.3.2
            if (!Array.isArray(json)) {
                return;
            }
            if (json.length < schema.minItems) {
                report.addError("ARRAY_LENGTH_SHORT", [json.length, schema.minItems]);
            }
        },
        uniqueItems: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.3.4.2
            if (!Array.isArray(json)) {
                return;
            }
            if (schema.uniqueItems === true) {
                var matches = [];
                if (this._utilities.isUniqueArray(json, matches) === false) {
                    report.addError("ARRAY_UNIQUE", matches);
                }
            }
        },
        enum: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.1.2
            var match = false,
                idx = schema.enum.length;
            while (idx--) {
                if (this._utilities.areEqual(json, schema.enum[idx])) {
                    match = true;
                    break;
                }
            }
            if (match === false) {
                report.addError("ENUM_MISMATCH", [json]);
            }
        },
        format: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.7.2
            var formatValidatorFn = FormatValidators[schema.format];
            if (typeof formatValidatorFn === "function") {
                if (formatValidatorFn.length === 2) {
                    // async
                    report.addAsyncTask(formatValidatorFn, [json], function(result) {
                        if (result !== true) {
                            report.addError("INVALID_FORMAT", [schema.format, json]);
                        }
                    });
                } else {
                    // sync
                    if (formatValidatorFn.call(this, json) !== true) {
                        report.addError("INVALID_FORMAT", [schema.format, json]);
                    }
                }
            } else {
                report.addError("UNKNOWN_FORMAT", [schema.format]);
            }
        }
    };

    Servant.prototype._validateProperty = function(errors, rules, value, property) {

        console.log("Validating: " + property + ' Value: ' + value);

        // now iterate all the rules in schema property and execute validation methods
        var keys = Object.keys(rules);
        var idx = keys.length;
        while (idx--) {
            if (this._validators[keys[idx]]) {
                console.log("Validation Rule: ", keys[idx]);
                this._validators[keys[idx]](errors, rules, value, property);
            }
        };

    };


    Servant.prototype.validate = function(instance, schema, callback) {

        // Create Errors Object
        var errors = {};

        // check if schema is a registered archetype
        if (!this._schemas[schema]) errors.general = "The archetype you entered has not been registered";

        // Make Schema From Registered Archetypes
        if (typeof schema === 'string') schema = this._schemas[schema];

        /**
         * Validate Object Root Properties
         */
        var keys1 = Object.keys(instance);
        var idx1 = keys1.length;
        var requireds1 = schema.required; // Every Archetype Has Required Attributes
        while (idx1--) {
            // Check Required Fields
            var idx = requireds1.indexOf(keys1[idx1])
            if (idx > -1) requireds1.splice(idx, 1);
            // Check If Allowed Property, Check Type, Check If Array, Validate
            if (!schema.properties[keys1[idx1]]) {
                errors[keys1[idx1]] = keys1[idx1] + ' is not allowed';
            } else if (schema.properties[keys1[idx1]] && this._utilities.whatIs(instance[keys1[idx1]]) !== schema.properties[keys1[idx1]].type) {
                errors[keys1[idx1]] = 'Invalid type';
            } else if (schema.properties[keys1[idx1]] && this._utilities.whatIs(instance[keys1[idx1]]) === 'array') {
                // Process Array
            } else {
                // Validate
                this._validateProperty(errors, schema.properties[keys1[idx1]], instance[keys1[idx1]], keys1[idx1]);
            }
        }

        // If requireds are still there 
        if (requireds1.length) {
            requireds1.forEach(function(r, i) {
                errors[r] = r + ' is required';
            });
            return callback(errors, null);
        }

        // Callback
        if (Object.keys(instance).length) {
            callback(errors, null);
        } else {
            callback(null, instance);
        }

    }; // validate




    /**
     * Save To Window Object
     */

    if (!window.Servant) {
        window.Servant = Servant;
    }

})();


// end