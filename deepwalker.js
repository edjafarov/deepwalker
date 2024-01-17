"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.deepwalker = void 0;
var InstanceResult = /** @class */ (function () {
    function InstanceResult(result) {
        this.toValue = function (path) {
            var _a, _b;
            return path ? (_a = this === null || this === void 0 ? void 0 : this._result[0]) === null || _a === void 0 ? void 0 : _a.value[path] : (_b = this === null || this === void 0 ? void 0 : this.result[0]) === null || _b === void 0 ? void 0 : _b.value;
        };
        this.filter = function (filterFn) {
            return this.setResult(this.result.filter(filterFn));
        };
        this.map = function (mapFn) {
            return this.setResult(this.result.map(mapFn));
        };
        this.dimensionToPrefix = function (idx) {
            this.result = this.result.map(function (el) {
                var newElement = { dimensions: [], value: {} };
                //remove item from array with splice in new array
                newElement.dimensions = __spreadArray([], el.dimensions, true);
                var dimValue = newElement.dimensions.splice(idx, 1);
                //check if there are results and return error if there is no dim like that
                if (!dimValue.length) {
                    throw new Error("Dimension ".concat(idx, " does not exist in ").concat(el.dimensions.join(", ")));
                }
                var prefix = dimValue[0].replace(/\s/g, "_").toLowerCase();
                newElement.value = Object.keys(el.value).reduce(function (res, key) {
                    res["".concat(prefix, "_").concat(key)] = el.value[key];
                    return res;
                }, {});
                return newElement;
            });
            return this.setResult(this.result.reduce(function (res, el) {
                var found = res.find(function (ir) { return ir.dimensions.join() === el.dimensions.join(); });
                if (found) {
                    found.value = __assign(__assign({}, found.value), el.value);
                }
                else {
                    res.push(el);
                }
                return res;
            }, []));
        };
        this.mapDimensionsToValues = function (names) {
            return this.setResult(this.result.map(function (el) {
                return __assign(__assign({}, el), { value: Array.isArray(el.value)
                        ? __assign({ values: el.value }, Object.fromEntries(el.dimensions.map(function (dim, i) { return [names[i], dim]; }))) : __assign(__assign({}, el.value), Object.fromEntries(el.dimensions.map(function (dim, i) { return [names[i], dim]; }))) });
            }));
        };
        this.sort = function (sortFn) {
            this.result.sort(sortFn);
            return this;
        };
        this.pick = function (array) {
            this.result = this.result.map(function (el) {
                return __assign(__assign({}, el), { value: Object.fromEntries(Object.entries(el.value).filter(function (_a) {
                        var key = _a[0];
                        return array.includes(key);
                    })) });
            });
            return this;
        };
        this.flatten = function (array) {
            if (array === void 0) { array = []; }
            this.result = this.result.reduce(function (result, el) {
                var arrayOfValues = Object.keys(el.value)
                    .filter(function (key) { return array.includes(key); })
                    .map(function (key) {
                    return {
                        dimensions: el.dimensions.concat(key),
                        value: __assign(__assign({}, Object.fromEntries(Object.entries(el.value).filter(function (_a) {
                            var key = _a[0];
                            return !array.includes(key);
                        }))), { value: el.value[key] })
                    };
                });
                return result.concat(arrayOfValues);
            }, []);
            return this;
        };
        this.concat = function (instance) {
            this.result = this.result.concat(instance.result);
            return this;
        };
        this.slice = function (number) {
            this.result = this.result.slice(0, number);
            return this;
        };
        this.toValues = function () {
            return this.result.map(function (r) { return r.value; });
        };
        this.toDimensions = function (naming) {
            return this.result.map(function (r) { return r.dimensions; });
        };
        this.toString = function (transformer) {
            if (!this.result || this.result.length == 0)
                return "";
            return transformer(createResultsObject(this.result));
        };
        this.convertEach = function (converter) {
            if (!this.result || this.result.length == 0)
                return [];
            return this.result.map(converter);
        };
        this.haveResults = function () {
            if (!this.result || this.result.length == 0)
                return false;
            return true;
        };
        //function that joins the result of the deepwalker with argument. The merge happens on the dimension level
        this.join = function (instance) {
            var result = this.result.reduce(function (res, r) {
                var found = instance.result.find(function (ir) { return ir.dimensions.join() === r.dimensions.join(); });
                if (found) {
                    res.push({
                        dimensions: r.dimensions,
                        value: __assign(__assign({}, r.value), found.value)
                    });
                }
                return res;
            }, []);
            return this.setResult(result);
        };
        this.toMap = function (path) {
            return this.result.reduce(function (res, r, i) {
                var deepResult = res;
                r.dimensions.forEach(function (dim, i) {
                    if (!deepResult[dim] && i !== r.dimensions.length - 1) {
                        deepResult[dim] = {};
                    }
                    if (i === r.dimensions.length - 1)
                        deepResult[dim] = path ? r.value[path] : r.value;
                    deepResult = deepResult[dim];
                });
                return res;
            }, {});
        };
        this.setResult = function (result) {
            this.result = result;
            return this;
        };
        this.result = result;
    }
    return InstanceResult;
}());
function deepwalker(object) {
    var instance = {
        _value: object,
        _result: null,
        get: function (queryPath) {
            return new InstanceResult(walker(queryPath.split("."), object));
        },
        setResult: function (result) {
            return new InstanceResult(result);
        }
    };
    return instance;
}
exports.deepwalker = deepwalker;
function createResultsObject(results) {
    var newResultsObject = __spreadArray([], results, true);
    newResultsObject.getOne = function (dims) {
        return (results.find(function (result) {
            return !result.dimensions.filter(function (d, i) { return d !== dims[i]; }).length;
        }) || {}).value;
    };
    return newResultsObject;
}
function walker(pathArray, object, result, i) {
    if (i === void 0) { i = 0; }
    if (result && pathArray.length == 0) {
        result[i].value = object;
        return result;
    }
    if (!result)
        result = [{ dimensions: [], value: undefined }];
    var step = pathArray.shift();
    if (step === "*") {
        if (typeof object !== "object")
            return result;
        var baseDimensions_1 = __spreadArray([], result[i].dimensions, true);
        result.splice(i, 1);
        Object.keys(object).forEach(function (key, j) {
            var newResults = { dimensions: __spreadArray([], baseDimensions_1, true), value: undefined };
            newResults.dimensions.push(key);
            var resultIndex;
            if (result) {
                resultIndex = result.length;
                result[resultIndex] = newResults;
            }
            return walker(__spreadArray([], pathArray, true), object[key], result, resultIndex);
        });
        return result.filter(filterUndefineds);
    }
    return walker(pathArray, object[step || ""], result, i).filter(filterUndefineds);
}
function filterUndefineds(res) {
    return res.value !== undefined;
}
