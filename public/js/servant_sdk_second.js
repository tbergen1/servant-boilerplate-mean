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

    Servant.prototype.utilities = {};

    Servant.prototype.utilities.whatIs = function(what) {

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

    Servant.prototype.utilities.areEqual = function areEqual(json1, json2) {
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


    Servant.prototype.utilities.isUniqueArray = function(arr, indexes) {
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

    Servant.prototype.utilities.difference = function(bigSet, subSet) {
        var arr = [],
            idx = bigSet.length;
        while (idx--) {
            if (subSet.indexOf(bigSet[idx]) === -1) {
                arr.push(bigSet[idx]);
            }
        }
        return arr;
    };

    Servant.prototype.utilities.clone = function(src) {
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
        multipleOf: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.1.1.2
            if (typeof json !== "number") {
                return;
            }
            if (this.utilities.whatIs(json / schema.multipleOf) !== "integer") {
                report.addError("MULTIPLE_OF", [json, schema.multipleOf]);
            }
        },
        maximum: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.1.2.2
            if (typeof json !== "number") {
                return;
            }
            if (schema.exclusiveMaximum !== true) {
                if (json > schema.maximum) {
                    report.addError("MAXIMUM", [json, schema.maximum]);
                }
            } else {
                if (json >= schema.maximum) {
                    report.addError("MAXIMUM_EXCLUSIVE", [json, schema.maximum]);
                }
            }
        },
        exclusiveMaximum: function() {
            // covered in maximum
        },
        minimum: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.1.3.2
            if (typeof json !== "number") {
                return;
            }
            if (schema.exclusiveMinimum !== true) {
                if (json < schema.minimum) {
                    report.addError("MINIMUM", [json, schema.minimum]);
                }
            } else {
                if (json <= schema.minimum) {
                    report.addError("MINIMUM_EXCLUSIVE", [json, schema.minimum]);
                }
            }
        },
        exclusiveMinimum: function() {
            // covered in minimum
        },
        maxLength: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.2.1.2
            if (typeof json !== "string") {
                return;
            }
            if (json.length > schema.maxLength) {
                report.addError("MAX_LENGTH", [json.length, schema.maxLength]);
            }
        },
        minLength: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.2.2.2
            if (typeof json !== "string") {
                return;
            }
            if (json.length < schema.minLength) {
                report.addError("MIN_LENGTH", [json.length, schema.minLength]);
            }
        },
        pattern: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.2.3.2
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
                if (this.utilities.isUniqueArray(json, matches) === false) {
                    report.addError("ARRAY_UNIQUE", matches);
                }
            }
        },
        maxProperties: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.4.1.2
            if (this.utilities.whatIs(json) !== "object") {
                return;
            }
            var keysCount = Object.keys(json).length;
            if (keysCount > schema.maxProperties) {
                report.addError("OBJECT_PROPERTIES_MAXIMUM", [keysCount, schema.maxProperties]);
            }
        },
        minProperties: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.4.2.2
            if (this.utilities.whatIs(json) !== "object") {
                return;
            }
            var keysCount = Object.keys(json).length;
            if (keysCount < schema.minProperties) {
                report.addError("OBJECT_PROPERTIES_MINIMUM", [keysCount, schema.minProperties]);
            }
        },
        required: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.4.3.2
            if (this.utilities.whatIs(json) !== "object") {
                return;
            }
            var idx = schema.required.length;
            while (idx--) {
                var requiredPropertyName = schema.required[idx];
                if (json[requiredPropertyName] === undefined) {
                    report.addError("OBJECT_MISSING_REQUIRED_PROPERTY", [requiredPropertyName]);
                }
            }
        },
        additionalProperties: function(report, schema, json) {
            // covered in properties and patternProperties
            if (schema.properties === undefined && schema.patternProperties === undefined) {
                return this._validators.properties.call(this, report, schema, json);
            }
        },
        patternProperties: function(report, schema, json) {
            // covered in properties
            if (schema.properties === undefined) {
                return this._validators.properties.call(this, report, schema, json);
            }
        },
        properties: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.4.4.2
            if (this.utilities.whatIs(json) !== "object") {
                return;
            }
            var properties = schema.properties !== undefined ? schema.properties : {};
            var patternProperties = schema.patternProperties !== undefined ? schema.patternProperties : {};
            if (schema.additionalProperties === false) {
                // The property set of the json to validate.
                var s = Object.keys(json);
                // The property set from "properties".
                var p = Object.keys(properties);
                // The property set from "patternProperties".
                var pp = Object.keys(patternProperties);
                // remove from "s" all elements of "p", if any;
                s = this.utilities.difference(s, p);
                // for each regex in "pp", remove all elements of "s" which this regex matches.
                var idx = pp.length;
                while (idx--) {
                    var regExp = RegExp(pp[idx]),
                        idx2 = s.length;
                    while (idx2--) {
                        if (regExp.test(s[idx2]) === true) {
                            s.splice(idx2, 1);
                        }
                    }
                }
                // Validation of the json succeeds if, after these two steps, set "s" is empty.
                if (s.length > 0) {
                    report.addError("OBJECT_ADDITIONAL_PROPERTIES", [s]);
                }
            }
        },
        dependencies: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.4.5.2
            if (this.utilities.whatIs(json) !== "object") {
                return;
            }

            var keys = Object.keys(schema.dependencies),
                idx = keys.length;

            while (idx--) {
                // iterate all dependencies
                var dependencyName = keys[idx];
                if (json[dependencyName]) {
                    var dependencyDefinition = schema.dependencies[dependencyName];
                    if (this.utilities.whatIs(dependencyDefinition) === "object") {
                        // if dependency is a schema, validate against this schema
                        this._validate.call(this, report, dependencyDefinition, json);
                    } else { // Array
                        // if dependency is an array, object needs to have all properties in this array
                        var idx2 = dependencyDefinition.length;
                        while (idx2--) {
                            var requiredPropertyName = dependencyDefinition[idx2];
                            if (json[requiredPropertyName] === undefined) {
                                report.addError("OBJECT_DEPENDENCY_KEY", [requiredPropertyName, dependencyName]);
                            }
                        }
                    }
                }
            }
        },
        enum: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.1.2
            var match = false,
                idx = schema.enum.length;
            while (idx--) {
                if (this.utilities.areEqual(json, schema.enum[idx])) {
                    match = true;
                    break;
                }
            }
            if (match === false) {
                report.addError("ENUM_MISMATCH", [json]);
            }
        },
        /*
    type: function (report, schema, json) {
        // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.2.2
        // type is handled before this is called so ignore
    },
    */
        allOf: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.3.2
            var idx = schema.allOf.length;
            while (idx--) {
                if (this._validate.call(this, report, schema.allOf[idx], json) === false) {
                    break;
                }
            }
        },
        anyOf: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.4.2
            var subReports = [],
                passed = false,
                idx = schema.anyOf.length;

            while (idx-- && passed === false) {
                var subReport = new Report(report);
                subReports.push(subReport);
                passed = this._validate.call(this, subReport, schema.anyOf[idx], json);
            }

            if (passed === false) {
                report.addError("ANY_OF_MISSING", undefined, subReports);
            }
        },
        oneOf: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.5.2
            var passes = 0,
                subReports = [],
                idx = schema.oneOf.length;

            while (idx--) {
                var subReport = new Report(report);
                subReports.push(subReport);
                if (this._validate.call(this, subReport, schema.oneOf[idx], json) === true) {
                    passes++;
                }
            }

            if (passes === 0) {
                report.addError("ONE_OF_MISSING", undefined, subReports);
            } else if (passes > 1) {
                report.addError("ONE_OF_MULTIPLE");
            }
        },
        not: function(report, schema, json) {
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.6.2
            var subReport = new Report(report);
            if (this._validate.call(this, subReport, schema.not, json) === true) {
                report.addError("NOT_PASSED");
            }
        },
        definitions: function() { /*report, schema, json*/
            // http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5.7.2
            // nothing to do here
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

    Servant.prototype._recurseObject = function(report, schema, json) {

        // If "additionalProperties" is absent, it is considered present with an empty schema as a value.
        // In addition, boolean value true is considered equivalent to an empty schema.
        var additionalProperties = schema.additionalProperties;
        if (additionalProperties === true || additionalProperties === undefined) {
            additionalProperties = {};
        }

        // p - The property set from "properties".
        var p = schema.properties ? Object.keys(schema.properties) : [];

        // pp - The property set from "patternProperties". Elements of this set will be called regexes for convenience.
        var pp = schema.patternProperties ? Object.keys(schema.patternProperties) : [];

        // m - The property name of the child.
        var keys = Object.keys(json),
            idx = keys.length;

        while (idx--) {
            var m = keys[idx],
                propertyValue = json[m];

            // s - The set of schemas for the child instance.
            var s = [];

            // 1. If set "p" contains value "m", then the corresponding schema in "properties" is added to "s".
            if (p.indexOf(m) !== -1) {
                s.push(schema.properties[m]);
            }

            // 2. For each regex in "pp", if it matches "m" successfully, the corresponding schema in "patternProperties" is added to "s".
            var idx2 = pp.length;
            while (idx2--) {
                var regexString = pp[idx2];
                if (RegExp(regexString).test(m) === true) {
                    s.push(schema.patternProperties[regexString]);
                }
            }

            // 3. The schema defined by "additionalProperties" is added to "s" if and only if, at this stage, "s" is empty.
            if (s.length === 0 && additionalProperties !== false) {
                s.push(additionalProperties);
            }

            // we are passing tests even without this assert because this is covered by properties check
            // if s is empty in this stage, no additionalProperties are allowed
            // report.expect(s.length !== 0, 'E001', m);

            // Instance property value must pass all schemas from s
            idx2 = s.length;
            while (idx2--) {
                report.path.push(m);
                this._validate.call(this, report, s[idx2], propertyValue);
                report.path.pop();
            }
        }
    };

    Servant.prototype._recurseArray = function(report, schema, json) {

        var idx = json.length;

        // If "items" is an array, this situation, the schema depends on the index:
        // if the index is less than, or equal to, the size of "items",
        // the child instance must be valid against the corresponding schema in the "items" array;
        // otherwise, it must be valid against the schema defined by "additionalItems".
        if (Array.isArray(schema.items)) {

            while (idx--) {
                // equal to doesnt make sense here
                if (idx < schema.items.length) {
                    report.path.push("[" + idx + "]");
                    this._validate.call(this, report, schema.items[idx], json[idx]);
                    report.path.pop();
                } else {
                    // might be boolean, so check that it's an object
                    if (typeof schema.additionalItems === "object") {
                        report.path.push("[" + idx + "]");
                        this._validate.call(this, report, schema.additionalItems, json[idx]);
                        report.path.pop();
                    }
                }
            }

        } else if (typeof schema.items === "object") {

            // If items is a schema, then the child instance must be valid against this schema,
            // regardless of its index, and regardless of the value of "additionalItems".
            while (idx--) {
                report.path.push("[" + idx + "]");
                this._validate.call(this, report, schema.items, json[idx]);
                report.path.pop();
            }

        }
    };

    Servant.prototype._validate = function(errors, schema, json) {

        var keys = Object.keys(schema);

        // this method can be called recursively, so we need to remember our root
        var isRoot = false;
        if (!errors.rootSchema) {
            errors.rootSchema = schema;
            isRoot = true;
        }

        // type checking first
        var jsonType = this.utilities.whatIs(json);
        if (schema.type) {
            if (typeof schema.type === "string") {
                if (jsonType !== schema.type && (jsonType !== "integer" || schema.type !== "number")) {
                    console.log("error here!", jsonType, schema.type);
                    return false;
                }
            } else {
                if (schema.type.indexOf(jsonType) === -1 && (jsonType !== "integer" || schema.type.indexOf("number") === -1)) {
                    console.log("error here!", jsonType, schema.type);
                    return false;
                }
            }
        }

        // now iterate all the keys in schema and execute validation methods
        var idx = keys.length;
        while (idx--) {
            if (this._validators[keys[idx]]) {
                this._validators[keys[idx]].call(this, errors, schema, json);
                if (Object.keys(errors).length) {
                    break;
                }
            }
        }

        // Call Recursive Methods
        if (jsonType === "array") {
            this._recurseArray.call(this, errors, schema, json);
        } else if (jsonType === "object") {
            this._recurseObject.call(this, errors, schema, json);
        }

        // we don't need the root pointer anymore
        if (isRoot) {
            errors.rootSchema = undefined;
        }
    };


    Servant.prototype.validate = function(json, schema, callback) {

        // Create Errors Object
        var errors = {};

        // check if schema is a registered archetype
        if (!this._schemas[schema]) errors.general = "the archetype you entered has not been registered";

        // check if json is empty
        var keys = Object.keys(json);
        if (keys.length === 0) errors.general = "the instance you entered is empty";

        // Make Schema From Registered Archetypes
        if (typeof schema === 'string') schema = this._schemas[schema];

        var temp = this._validate(errors, schema, json, callback);

        console.log(temp);

        // Callback
        callback(errors, json);

    };



    /**
     * Reports
     */

    Servant.prototype.report = function(parentReport) {
        this.parentReport = parentReport || undefined;
        this.errors = [];
        this.path = [];
        this.asyncTasks = [];
    };

    Servant.prototype.isValid = function() {
        if (this.asyncTasks.length > 0) {
            throw new Error("Async tasks pending, can't answer isValid");
        }
        return this.errors.length === 0;
    };

    Servant.prototype.addAsyncTask = function(fn, args, asyncTaskResultProcessFn) {
        this.asyncTasks.push([fn, args, asyncTaskResultProcessFn]);
    };

    Servant.prototype.processAsyncTasks = function(timeout, callback) {

        var validationTimeout = timeout || 2000,
            tasksCount = this.asyncTasks.length,
            idx = tasksCount,
            timedOut = false,
            self = this;

        function finish() {
            process.nextTick(function() {
                var valid = self.errors.length === 0,
                    err = valid ? undefined : self.errors;
                callback(err, valid);
            });
        }

        function respond(asyncTaskResultProcessFn) {
            return function(asyncTaskResult) {
                if (timedOut) {
                    return;
                }
                asyncTaskResultProcessFn(asyncTaskResult);
                if (--tasksCount === 0) {
                    finish();
                }
            };
        }

        if (tasksCount === 0 || this.errors.length > 0) {
            finish();
            return;
        }

        while (idx--) {
            var task = this.asyncTasks[idx];
            task[0].apply(null, task[1].concat(respond(task[2])));
        }

        setTimeout(function() {
            if (tasksCount > 0) {
                timedOut = true;
                self.addError("ASYNC_TIMEOUT", [tasksCount, validationTimeout]);
                callback(self.errors, false);
            }
        }, validationTimeout);

    };

    Servant.prototype.getPath = function() {
        var path = ["#"];
        if (this.parentReport) {
            path = path.concat(this.parentReport.path);
        }
        path = path.concat(this.path);
        return path.length === 1 ? "#/" : path.join("/");
    };

    Servant.prototype.addError = function(errorCode, params, subReports) {
        if (!errorCode) {
            throw new Error("No errorCode passed into addError()");
        }
        if (!Errors[errorCode]) {
            throw new Error("No errorMessage known for code " + errorCode);
        }

        params = params || [];

        var idx = params.length,
            errorMessage = Errors[errorCode];
        while (idx--) {
            errorMessage = errorMessage.replace("{" + idx + "}", params[idx]);
        }

        var err = {
            code: errorCode,
            params: params,
            message: errorMessage,
            path: this.getPath()
        };

        if (subReports !== undefined) {
            if (!Array.isArray(subReports)) {
                subReports = [subReports];
            }
            err.inner = [];
            idx = subReports.length;
            while (idx--) {
                var subReport = subReports[idx],
                    idx2 = subReport.errors.length;
                while (idx2--) {
                    err.inner.push(subReport.errors[idx2]);
                }
            }
            if (err.inner.length === 0) {
                err.inner = undefined;
            }
        }

        this.errors.push(err);
    };



    /**
     * Save To Window Object
     */

    if (!window.Servant) {
        window.Servant = Servant;
    }

})();


// end