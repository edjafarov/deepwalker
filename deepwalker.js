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
function deepwalker(object) {
    var instance = {
        _value: object,
        _result: null,
        get: function (queryPath) {
            var instanceResult = __assign(__assign({ _result: null }, instance), { toValue: function (path) {
                    var _a, _b;
                    return path ? (_a = instanceResult === null || instanceResult === void 0 ? void 0 : instanceResult._result[0]) === null || _a === void 0 ? void 0 : _a.value[path] : (_b = instanceResult === null || instanceResult === void 0 ? void 0 : instanceResult._result[0]) === null || _b === void 0 ? void 0 : _b.value;
                }, filter: function (filterFn) {
                    return instanceResult.setResult(instanceResult._result.filter(filterFn));
                }, sort: function (sortFn) {
                    instanceResult._result.sort(sortFn);
                    return instanceResult;
                }, pick: function (array) {
                    instanceResult._result = instanceResult._result.map(function (el) {
                        return __assign(__assign({}, el), { value: Object.fromEntries(Object.entries(el.value)
                                .filter(function (_a) {
                                var key = _a[0];
                                return array.includes(key);
                            })) });
                    });
                    return instanceResult;
                }, flatten: function (array) {
                    if (array === void 0) { array = []; }
                    instanceResult._result = instanceResult._result.reduce(function (result, el) {
                        var arrayOfValues = Object.keys(el.value).filter(function (key) { return array.includes(key); }).map(function (key) {
                            return {
                                dimensions: el.dimensions.concat(key), value: __assign(__assign({}, Object.fromEntries(Object.entries(el.value)
                                    .filter(function (_a) {
                                    var key = _a[0];
                                    return !array.includes(key);
                                }))), { value: el.value[key] })
                            };
                        });
                        return result.concat(arrayOfValues);
                    }, []);
                    return instanceResult;
                }, concat: function (instance) {
                    instanceResult._result = instanceResult._result.concat(instance._result);
                    return instanceResult;
                }, slice: function (number) {
                    instanceResult._result = instanceResult._result.slice(0, number);
                    return instanceResult;
                }, toValues: function () {
                    return instanceResult._result.map(function (r) { return r.value; });
                }, toString: function (transformer) {
                    if (!instanceResult._result || instanceResult._result.length == 0)
                        return '';
                    return transformer(createResultsObject(instanceResult._result));
                }, convertEach: function (converter) {
                    if (!instanceResult._result || instanceResult._result.length == 0)
                        return [];
                    return instanceResult._result.map(converter);
                }, haveResults: function () {
                    if (!instanceResult._result || instanceResult._result.length == 0)
                        return false;
                    return true;
                }, toMap: function (path) {
                    return instanceResult._result.reduce(function (res, r, i) {
                        var deepResult = res;
                        r.dimensions.forEach(function (dim, i) {
                            if (!deepResult[dim] && i !== (r.dimensions.length - 1)) {
                                deepResult[dim] = {};
                            }
                            if (i === (r.dimensions.length - 1))
                                deepResult[dim] = path ? r.value[path] : r.value;
                            deepResult = deepResult[dim];
                        });
                        return res;
                    }, {});
                }, setResult: function (result) {
                    instanceResult._result = result;
                    return instanceResult;
                } });
            return instanceResult.setResult(walker(queryPath.split("."), object));
        }
    };
    return instance;
}
exports.deepwalker = deepwalker;
function createResultsObject(results) {
    var newResultsObject = __spreadArray([], results, true);
    newResultsObject.getOne = function (dims) {
        return (results.find(function (result) { return !result.dimensions.filter(function (d, i) { return d !== dims[i]; }).length; }) || {}).value;
    };
    return newResultsObject;
}
function walker(pathArray, object, result, i) {
    if (i === void 0) { i = 0; }
    if (pathArray.length == 0) {
        result[i].value = object;
        return result;
    }
    if (!result)
        result = [{ dimensions: [], value: undefined }];
    var step = pathArray.shift();
    if (step === "*") {
        if (typeof object !== 'object')
            return result;
        var baseDimensions_1 = __spreadArray([], result[i].dimensions, true);
        result.splice(i, 1);
        Object.keys(object).forEach(function (key, j) {
            var newResults = { dimensions: __spreadArray([], baseDimensions_1, true), value: undefined };
            newResults.dimensions.push(key);
            var resultIndex = result.length;
            result[resultIndex] = newResults;
            return walker(__spreadArray([], pathArray, true), object[key], result, resultIndex);
        });
        return result.filter(filterUndefineds);
    }
    return walker(pathArray, object[step], result, i).filter(filterUndefineds);
    ;
}
function filterUndefineds(res) {
    return res.value !== undefined;
}
