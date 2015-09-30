(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var R = __webpack_require__(1);
	var flyd = __webpack_require__(2);
	var forwardTo = __webpack_require__(8);
	var Type = __webpack_require__(9);
	var patch = __webpack_require__(15).init([__webpack_require__(18), __webpack_require__(19), __webpack_require__(20), __webpack_require__(21)]);
	var h = __webpack_require__(22);
	var cuid = __webpack_require__(23);
	var filterInput = __webpack_require__(24);
	var adressForm = __webpack_require__(25);
	var tableRow = __webpack_require__(26);
	
	var _require = __webpack_require__(27);
	
	var isFormValidBool = _require.isFormValidBool;
	var isFormWrongBool = _require.isFormWrongBool;
	var makeErrorObject = _require.makeErrorObject;
	var safeJSONParse = _require.safeJSONParse;
	var mergeWithDefault = _require.mergeWithDefault;
	var findAnyMatchingString = _require.findAnyMatchingString;
	
	// Model {list: [adresses], filter: String, editing: Array, error: Object }
	
	var init = function init() {
	  var storeName = arguments.length <= 0 || arguments[0] === undefined ? 'adress-book' : arguments[0];
	
	  var initial = localStorage.getItem(storeName);
	  var getAdr = R.compose(mergeWithDefault, safeJSONParse);
	  return getAdr(initial);
	};
	
	var sync = function sync(model) {
	  var storeName = arguments.length <= 1 || arguments[1] === undefined ? 'adress-book' : arguments[1];
	
	  var data = JSON.stringify({ list: model.list });
	  localStorage.setItem(storeName, data);
	  return model;
	};
	
	var log = function log(el) {
	  console.log(el);return el;
	};
	var emptify = function emptify(list) {
	  return list.forEach(function (c) {
	    return c.value = "";
	  });
	};
	
	// Update
	
	var Action = Type({
	  Add: [Object],
	  Remove: [String],
	  StartEditing: [String, Object],
	  Modify: [String, Object],
	  Filter: [filterInput.Action],
	  Errorify: [Array]
	});
	
	var update = Action.caseOn({
	  Filter: function Filter(action, model) {
	    return _extends({}, model, { filter: filterInput.update(action, model) });
	  },
	  StartEditing: function StartEditing(id, adr, model) {
	    return _extends({}, model, { error: [], editing: [id, adr] });
	  },
	  Remove: function Remove(id, model) {
	    return sync(R.evolve({ list: R.reject(function (c) {
	        return c._id === id;
	      }) }, model));
	  },
	  Add: function Add(newAdr, model) {
	    return sync(R.evolve({
	      list: R.append(R.assoc("_id", cuid(), newAdr)),
	      editing: R.drop(2),
	      error: R.drop(2)
	    }, model));
	  },
	  Modify: function Modify(id, newData, model) {
	    return sync(R.evolve({
	      list: R.map(function (tr) {
	        return tr._id === id ? tableRow.update(tableRow.Action.Edit(newData), tr) : tr;
	      }),
	      editing: R.drop(2),
	      error: R.drop(2) }, model));
	  },
	  Errorify: function Errorify(errorData, model) {
	    return _extends({}, model, { error: errorData });
	  }
	});
	
	var SubAction = Type({
	  SubmitForm: [adressForm.Action]
	});
	var subUpdate = SubAction.caseOn({
	  SubmitForm: function SubmitForm(action, model) {
	    var _adressForm$update = adressForm.update(action, model);
	
	    var context = _adressForm$update.context;
	    var data = _adressForm$update.data;
	
	    return isFormWrongBool(data) ? Action.Errorify([data, makeErrorObject(data)]) : model.editing.length === 0 ? (emptify(context), Action.Add(data)) : Action.Modify(model.editing[0], data);
	  }
	});
	
	// View
	
	var view = R.curry(function (actions$, model) {
	  var editing = model.editing[0] || null;
	  var error = model.error[0] || null;
	  var filter = filterInput.view({ filter$: forwardTo(actions$, Action.Filter) });
	  var mainForm = adressForm.view({
	    submit$: forwardTo(actions$, R.compose(R.flip(subUpdate)(model), SubAction.SubmitForm))
	  }, error ? model.error : editing ? R.takeLast(1, model.editing) : []);
	  var table = model.list.filter(findAnyMatchingString(model.filter)).map(function (adr) {
	    return tableRow.view({
	      edit$: forwardTo(actions$, R.always(Action.StartEditing(adr._id, adr))),
	      remove$: forwardTo(actions$, R.always(Action.Remove(adr._id)))
	    }, adr, editing && editing === adr._id ? ".disabled" : "");
	  });
	  return h("div.ui.grid.container", [h("div.ui.grid.row", [h("div.five.wide.column", [filter, mainForm]), h("div.eleven.wide.column", [h("h2.ui.center.aligned.icon.header", [h("i.users.icon"), "Adress Book"]), h("table.ui.basic.selectable.single.line.table", [h("thead", [h("tr", [h("th", "First Name"), h("th", "Last Name"), h("th", "Email"), h("th.center.aligned", "Edit"), h("th.center.aligned", "Delete")])]), h("tbody", [].concat(table))])])])]);
	});
	
	// Stream$
	
	var actions$ = flyd.stream();
	var model$ = flyd.scan(R.flip(update), init(), actions$);
	var vnode$ = flyd.map(view(actions$), model$);
	//flyd.map((node) => console.log(node), vnode$);
	
	window.addEventListener('DOMContentLoaded', function () {
	  var container = document.getElementById('app');
	  flyd.scan(patch, container, vnode$);
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	//  Ramda v0.17.1
	//  https://github.com/ramda/ramda
	//  (c) 2013-2015 Scott Sauyet, Michael Hurley, and David Chambers
	//  Ramda may be freely distributed under the MIT license.
	
	;(function() {
	
	  'use strict';
	
	  /**
	     * A special placeholder value used to specify "gaps" within curried functions,
	     * allowing partial application of any combination of arguments,
	     * regardless of their positions.
	     *
	     * If `g` is a curried ternary function and `_` is `R.__`, the following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2, _)(1, 3)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @constant
	     * @memberOf R
	     * @category Function
	     * @example
	     *
	     *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
	     *      greet('Alice'); //=> 'Hello, Alice!'
	     */
	    var __ = { '@@functional/placeholder': true };
	
	    // jshint unused:vars
	    var _arity = function _arity(n, fn) {
	        // jshint unused:vars
	        switch (n) {
	        case 0:
	            return function () {
	                return fn.apply(this, arguments);
	            };
	        case 1:
	            return function (a0) {
	                return fn.apply(this, arguments);
	            };
	        case 2:
	            return function (a0, a1) {
	                return fn.apply(this, arguments);
	            };
	        case 3:
	            return function (a0, a1, a2) {
	                return fn.apply(this, arguments);
	            };
	        case 4:
	            return function (a0, a1, a2, a3) {
	                return fn.apply(this, arguments);
	            };
	        case 5:
	            return function (a0, a1, a2, a3, a4) {
	                return fn.apply(this, arguments);
	            };
	        case 6:
	            return function (a0, a1, a2, a3, a4, a5) {
	                return fn.apply(this, arguments);
	            };
	        case 7:
	            return function (a0, a1, a2, a3, a4, a5, a6) {
	                return fn.apply(this, arguments);
	            };
	        case 8:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7) {
	                return fn.apply(this, arguments);
	            };
	        case 9:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
	                return fn.apply(this, arguments);
	            };
	        case 10:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
	                return fn.apply(this, arguments);
	            };
	        default:
	            throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	        }
	    };
	
	    var _cloneRegExp = function _cloneRegExp(pattern) {
	        return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
	    };
	
	    var _complement = function _complement(f) {
	        return function () {
	            return !f.apply(this, arguments);
	        };
	    };
	
	    /**
	     * Private `concat` function to merge two array-like objects.
	     *
	     * @private
	     * @param {Array|Arguments} [set1=[]] An array-like object.
	     * @param {Array|Arguments} [set2=[]] An array-like object.
	     * @return {Array} A new, merged array.
	     * @example
	     *
	     *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     */
	    var _concat = function _concat(set1, set2) {
	        set1 = set1 || [];
	        set2 = set2 || [];
	        var idx;
	        var len1 = set1.length;
	        var len2 = set2.length;
	        var result = [];
	        idx = 0;
	        while (idx < len1) {
	            result[result.length] = set1[idx];
	            idx += 1;
	        }
	        idx = 0;
	        while (idx < len2) {
	            result[result.length] = set2[idx];
	            idx += 1;
	        }
	        return result;
	    };
	
	    var _containsWith = function _containsWith(pred, x, list) {
	        var idx = 0, len = list.length;
	        while (idx < len) {
	            if (pred(x, list[idx])) {
	                return true;
	            }
	            idx += 1;
	        }
	        return false;
	    };
	
	    /**
	     * Optimized internal two-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */
	    var _curry1 = function _curry1(fn) {
	        return function f1(a) {
	            if (arguments.length === 0) {
	                return f1;
	            } else if (a != null && a['@@functional/placeholder'] === true) {
	                return f1;
	            } else {
	                return fn.apply(this, arguments);
	            }
	        };
	    };
	
	    /**
	     * Optimized internal two-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */
	    var _curry2 = function _curry2(fn) {
	        return function f2(a, b) {
	            var n = arguments.length;
	            if (n === 0) {
	                return f2;
	            } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
	                return f2;
	            } else if (n === 1) {
	                return _curry1(function (b) {
	                    return fn(a, b);
	                });
	            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true && b != null && b['@@functional/placeholder'] === true) {
	                return f2;
	            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
	                return _curry1(function (a) {
	                    return fn(a, b);
	                });
	            } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
	                return _curry1(function (b) {
	                    return fn(a, b);
	                });
	            } else {
	                return fn(a, b);
	            }
	        };
	    };
	
	    /**
	     * Optimized internal three-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */
	    var _curry3 = function _curry3(fn) {
	        return function f3(a, b, c) {
	            var n = arguments.length;
	            if (n === 0) {
	                return f3;
	            } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
	                return f3;
	            } else if (n === 1) {
	                return _curry2(function (b, c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true && b != null && b['@@functional/placeholder'] === true) {
	                return f3;
	            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
	                return _curry2(function (a, c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
	                return _curry2(function (b, c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 2) {
	                return _curry1(function (c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && a != null && a['@@functional/placeholder'] === true && b != null && b['@@functional/placeholder'] === true && c != null && c['@@functional/placeholder'] === true) {
	                return f3;
	            } else if (n === 3 && a != null && a['@@functional/placeholder'] === true && b != null && b['@@functional/placeholder'] === true) {
	                return _curry2(function (a, b) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && a != null && a['@@functional/placeholder'] === true && c != null && c['@@functional/placeholder'] === true) {
	                return _curry2(function (a, c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && b != null && b['@@functional/placeholder'] === true && c != null && c['@@functional/placeholder'] === true) {
	                return _curry2(function (b, c) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && a != null && a['@@functional/placeholder'] === true) {
	                return _curry1(function (a) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && b != null && b['@@functional/placeholder'] === true) {
	                return _curry1(function (b) {
	                    return fn(a, b, c);
	                });
	            } else if (n === 3 && c != null && c['@@functional/placeholder'] === true) {
	                return _curry1(function (c) {
	                    return fn(a, b, c);
	                });
	            } else {
	                return fn(a, b, c);
	            }
	        };
	    };
	
	    /**
	     * Internal curryN function.
	     *
	     * @private
	     * @category Function
	     * @param {Number} length The arity of the curried function.
	     * @return {array} An array of arguments received thus far.
	     * @param {Function} fn The function to curry.
	     */
	    var _curryN = function _curryN(length, received, fn) {
	        return function () {
	            var combined = [];
	            var argsIdx = 0;
	            var left = length;
	            var combinedIdx = 0;
	            while (combinedIdx < received.length || argsIdx < arguments.length) {
	                var result;
	                if (combinedIdx < received.length && (received[combinedIdx] == null || received[combinedIdx]['@@functional/placeholder'] !== true || argsIdx >= arguments.length)) {
	                    result = received[combinedIdx];
	                } else {
	                    result = arguments[argsIdx];
	                    argsIdx += 1;
	                }
	                combined[combinedIdx] = result;
	                if (result == null || result['@@functional/placeholder'] !== true) {
	                    left -= 1;
	                }
	                combinedIdx += 1;
	            }
	            return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
	        };
	    };
	
	    var _filter = function _filter(fn, list) {
	        var idx = 0, len = list.length, result = [];
	        while (idx < len) {
	            if (fn(list[idx])) {
	                result[result.length] = list[idx];
	            }
	            idx += 1;
	        }
	        return result;
	    };
	
	    var _forceReduced = function _forceReduced(x) {
	        return {
	            '@@transducer/value': x,
	            '@@transducer/reduced': true
	        };
	    };
	
	    /**
	     * @private
	     * @param {Function} fn The strategy for extracting function names from an object
	     * @return {Function} A function that takes an object and returns an array of function names.
	     */
	    var _functionsWith = function _functionsWith(fn) {
	        return function (obj) {
	            return _filter(function (key) {
	                return typeof obj[key] === 'function';
	            }, fn(obj));
	        };
	    };
	
	    var _has = function _has(prop, obj) {
	        return Object.prototype.hasOwnProperty.call(obj, prop);
	    };
	
	    var _identity = function _identity(x) {
	        return x;
	    };
	
	    /**
	     * Tests whether or not an object is an array.
	     *
	     * @private
	     * @param {*} val The object to test.
	     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
	     * @example
	     *
	     *      _isArray([]); //=> true
	     *      _isArray(null); //=> false
	     *      _isArray({}); //=> false
	     */
	    var _isArray = Array.isArray || function _isArray(val) {
	        return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
	    };
	
	    /**
	     * Determine if the passed argument is an integer.
	     *
	     * @private
	     * @param {*} n
	     * @category Type
	     * @return {Boolean}
	     */
	    var _isInteger = Number.isInteger || function _isInteger(n) {
	        return n << 0 === n;
	    };
	
	    var _isNumber = function _isNumber(x) {
	        return Object.prototype.toString.call(x) === '[object Number]';
	    };
	
	    var _isString = function _isString(x) {
	        return Object.prototype.toString.call(x) === '[object String]';
	    };
	
	    var _isTransformer = function _isTransformer(obj) {
	        return typeof obj['@@transducer/step'] === 'function';
	    };
	
	    var _map = function _map(fn, list) {
	        var idx = 0, len = list.length, result = Array(len);
	        while (idx < len) {
	            result[idx] = fn(list[idx]);
	            idx += 1;
	        }
	        return result;
	    };
	
	    var _pipe = function _pipe(f, g) {
	        return function () {
	            return g.call(this, f.apply(this, arguments));
	        };
	    };
	
	    var _pipeP = function _pipeP(f, g) {
	        return function () {
	            var ctx = this;
	            return f.apply(ctx, arguments).then(function (x) {
	                return g.call(ctx, x);
	            });
	        };
	    };
	
	    var _quote = function _quote(s) {
	        return '"' + s.replace(/"/g, '\\"') + '"';
	    };
	
	    var _reduced = function _reduced(x) {
	        return x && x['@@transducer/reduced'] ? x : {
	            '@@transducer/value': x,
	            '@@transducer/reduced': true
	        };
	    };
	
	    /**
	     * An optimized, private array `slice` implementation.
	     *
	     * @private
	     * @param {Arguments|Array} args The array or arguments object to consider.
	     * @param {Number} [from=0] The array index to slice from, inclusive.
	     * @param {Number} [to=args.length] The array index to slice to, exclusive.
	     * @return {Array} A new, sliced array.
	     * @example
	     *
	     *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
	     *
	     *      var firstThreeArgs = function(a, b, c, d) {
	     *        return _slice(arguments, 0, 3);
	     *      };
	     *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
	     */
	    var _slice = function _slice(args, from, to) {
	        switch (arguments.length) {
	        case 1:
	            return _slice(args, 0, args.length);
	        case 2:
	            return _slice(args, from, args.length);
	        default:
	            var list = [];
	            var idx = 0;
	            var len = Math.max(0, Math.min(args.length, to) - from);
	            while (idx < len) {
	                list[idx] = args[from + idx];
	                idx += 1;
	            }
	            return list;
	        }
	    };
	
	    /**
	     * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
	     */
	    var _toISOString = function () {
	        var pad = function pad(n) {
	            return (n < 10 ? '0' : '') + n;
	        };
	        return typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
	            return d.toISOString();
	        } : function _toISOString(d) {
	            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
	        };
	    }();
	
	    var _xdropRepeatsWith = function () {
	        function XDropRepeatsWith(pred, xf) {
	            this.xf = xf;
	            this.pred = pred;
	            this.lastValue = undefined;
	            this.seenFirstValue = false;
	        }
	        XDropRepeatsWith.prototype['@@transducer/init'] = function () {
	            return this.xf['@@transducer/init']();
	        };
	        XDropRepeatsWith.prototype['@@transducer/result'] = function (result) {
	            return this.xf['@@transducer/result'](result);
	        };
	        XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
	            var sameAsLast = false;
	            if (!this.seenFirstValue) {
	                this.seenFirstValue = true;
	            } else if (this.pred(this.lastValue, input)) {
	                sameAsLast = true;
	            }
	            this.lastValue = input;
	            return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
	        };
	        return _curry2(function _xdropRepeatsWith(pred, xf) {
	            return new XDropRepeatsWith(pred, xf);
	        });
	    }();
	
	    var _xfBase = {
	        init: function () {
	            return this.xf['@@transducer/init']();
	        },
	        result: function (result) {
	            return this.xf['@@transducer/result'](result);
	        }
	    };
	
	    var _xfilter = function () {
	        function XFilter(f, xf) {
	            this.xf = xf;
	            this.f = f;
	        }
	        XFilter.prototype['@@transducer/init'] = _xfBase.init;
	        XFilter.prototype['@@transducer/result'] = _xfBase.result;
	        XFilter.prototype['@@transducer/step'] = function (result, input) {
	            return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
	        };
	        return _curry2(function _xfilter(f, xf) {
	            return new XFilter(f, xf);
	        });
	    }();
	
	    var _xfind = function () {
	        function XFind(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.found = false;
	        }
	        XFind.prototype['@@transducer/init'] = _xfBase.init;
	        XFind.prototype['@@transducer/result'] = function (result) {
	            if (!this.found) {
	                result = this.xf['@@transducer/step'](result, void 0);
	            }
	            return this.xf['@@transducer/result'](result);
	        };
	        XFind.prototype['@@transducer/step'] = function (result, input) {
	            if (this.f(input)) {
	                this.found = true;
	                result = _reduced(this.xf['@@transducer/step'](result, input));
	            }
	            return result;
	        };
	        return _curry2(function _xfind(f, xf) {
	            return new XFind(f, xf);
	        });
	    }();
	
	    var _xfindIndex = function () {
	        function XFindIndex(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.idx = -1;
	            this.found = false;
	        }
	        XFindIndex.prototype['@@transducer/init'] = _xfBase.init;
	        XFindIndex.prototype['@@transducer/result'] = function (result) {
	            if (!this.found) {
	                result = this.xf['@@transducer/step'](result, -1);
	            }
	            return this.xf['@@transducer/result'](result);
	        };
	        XFindIndex.prototype['@@transducer/step'] = function (result, input) {
	            this.idx += 1;
	            if (this.f(input)) {
	                this.found = true;
	                result = _reduced(this.xf['@@transducer/step'](result, this.idx));
	            }
	            return result;
	        };
	        return _curry2(function _xfindIndex(f, xf) {
	            return new XFindIndex(f, xf);
	        });
	    }();
	
	    var _xfindLast = function () {
	        function XFindLast(f, xf) {
	            this.xf = xf;
	            this.f = f;
	        }
	        XFindLast.prototype['@@transducer/init'] = _xfBase.init;
	        XFindLast.prototype['@@transducer/result'] = function (result) {
	            return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
	        };
	        XFindLast.prototype['@@transducer/step'] = function (result, input) {
	            if (this.f(input)) {
	                this.last = input;
	            }
	            return result;
	        };
	        return _curry2(function _xfindLast(f, xf) {
	            return new XFindLast(f, xf);
	        });
	    }();
	
	    var _xfindLastIndex = function () {
	        function XFindLastIndex(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.idx = -1;
	            this.lastIdx = -1;
	        }
	        XFindLastIndex.prototype['@@transducer/init'] = _xfBase.init;
	        XFindLastIndex.prototype['@@transducer/result'] = function (result) {
	            return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
	        };
	        XFindLastIndex.prototype['@@transducer/step'] = function (result, input) {
	            this.idx += 1;
	            if (this.f(input)) {
	                this.lastIdx = this.idx;
	            }
	            return result;
	        };
	        return _curry2(function _xfindLastIndex(f, xf) {
	            return new XFindLastIndex(f, xf);
	        });
	    }();
	
	    var _xmap = function () {
	        function XMap(f, xf) {
	            this.xf = xf;
	            this.f = f;
	        }
	        XMap.prototype['@@transducer/init'] = _xfBase.init;
	        XMap.prototype['@@transducer/result'] = _xfBase.result;
	        XMap.prototype['@@transducer/step'] = function (result, input) {
	            return this.xf['@@transducer/step'](result, this.f(input));
	        };
	        return _curry2(function _xmap(f, xf) {
	            return new XMap(f, xf);
	        });
	    }();
	
	    var _xtake = function () {
	        function XTake(n, xf) {
	            this.xf = xf;
	            this.n = n;
	        }
	        XTake.prototype['@@transducer/init'] = _xfBase.init;
	        XTake.prototype['@@transducer/result'] = _xfBase.result;
	        XTake.prototype['@@transducer/step'] = function (result, input) {
	            if (this.n === 0) {
	                return _reduced(result);
	            } else {
	                this.n -= 1;
	                return this.xf['@@transducer/step'](result, input);
	            }
	        };
	        return _curry2(function _xtake(n, xf) {
	            return new XTake(n, xf);
	        });
	    }();
	
	    var _xtakeWhile = function () {
	        function XTakeWhile(f, xf) {
	            this.xf = xf;
	            this.f = f;
	        }
	        XTakeWhile.prototype['@@transducer/init'] = _xfBase.init;
	        XTakeWhile.prototype['@@transducer/result'] = _xfBase.result;
	        XTakeWhile.prototype['@@transducer/step'] = function (result, input) {
	            return this.f(input) ? this.xf['@@transducer/step'](result, input) : _reduced(result);
	        };
	        return _curry2(function _xtakeWhile(f, xf) {
	            return new XTakeWhile(f, xf);
	        });
	    }();
	
	    var _xwrap = function () {
	        function XWrap(fn) {
	            this.f = fn;
	        }
	        XWrap.prototype['@@transducer/init'] = function () {
	            throw new Error('init not implemented on XWrap');
	        };
	        XWrap.prototype['@@transducer/result'] = function (acc) {
	            return acc;
	        };
	        XWrap.prototype['@@transducer/step'] = function (acc, x) {
	            return this.f(acc, x);
	        };
	        return function _xwrap(fn) {
	            return new XWrap(fn);
	        };
	    }();
	
	    /**
	     * Adds two numbers. Equivalent to `a + b` but curried.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Number}
	     * @see R.subtract
	     * @example
	     *
	     *      R.add(2, 3);       //=>  5
	     *      R.add(7)(10);      //=> 17
	     */
	    var add = _curry2(function add(a, b) {
	        return a + b;
	    });
	
	    /**
	     * Applies a function to the value at the given index of an array,
	     * returning a new copy of the array with the element at the given
	     * index replaced with the result of the function application.
	     * @see R.update
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> a) -> Number -> [a] -> [a]
	     * @param {Function} fn The function to apply.
	     * @param {Number} idx The index.
	     * @param {Array|Arguments} list An array-like object whose value
	     *        at the supplied index will be replaced.
	     * @return {Array} A copy of the supplied array-like object with
	     *         the element at index `idx` replaced with the value
	     *         returned by applying `fn` to the existing element.
	     * @example
	     *
	     *      R.adjust(R.add(10), 1, [0, 1, 2]);     //=> [0, 11, 2]
	     *      R.adjust(R.add(10))(1)([0, 1, 2]);     //=> [0, 11, 2]
	     */
	    var adjust = _curry3(function adjust(fn, idx, list) {
	        if (idx >= list.length || idx < -list.length) {
	            return list;
	        }
	        var start = idx < 0 ? list.length : 0;
	        var _idx = start + idx;
	        var _list = _concat(list);
	        _list[_idx] = fn(list[_idx]);
	        return _list;
	    });
	
	    /**
	     * Returns a function that always returns the given value. Note that for
	     * non-primitives the value returned is a reference to the original value.
	     *
	     * This function is known as `const`, `constant`, or `K` (for K combinator)
	     * in other languages and libraries.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig a -> (* -> a)
	     * @param {*} val The value to wrap in a function
	     * @return {Function} A Function :: * -> val.
	     * @example
	     *
	     *      var t = R.always('Tee');
	     *      t(); //=> 'Tee'
	     */
	    var always = _curry1(function always(val) {
	        return function () {
	            return val;
	        };
	    });
	
	    /**
	     * Returns a new list, composed of n-tuples of consecutive elements
	     * If `n` is greater than the length of the list, an empty list is returned.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [[a]]
	     * @param {Number} n The size of the tuples to create
	     * @param {Array} list The list to split into `n`-tuples
	     * @return {Array} The new list.
	     * @example
	     *
	     *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
	     *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
	     *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
	     */
	    var aperture = _curry2(function aperture(n, list) {
	        var idx = 0;
	        var limit = list.length - (n - 1);
	        var acc = new Array(limit >= 0 ? limit : 0);
	        while (idx < limit) {
	            acc[idx] = _slice(list, idx, idx + n);
	            idx += 1;
	        }
	        return acc;
	    });
	
	    /**
	     * Returns a new list containing the contents of the given list, followed by the given
	     * element.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} el The element to add to the end of the new list.
	     * @param {Array} list The list whose contents will be added to the beginning of the output
	     *        list.
	     * @return {Array} A new list containing the contents of the old list followed by `el`.
	     * @see R.prepend
	     * @example
	     *
	     *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
	     *      R.append('tests', []); //=> ['tests']
	     *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
	     */
	    var append = _curry2(function append(el, list) {
	        return _concat(list, [el]);
	    });
	
	    /**
	     * Applies function `fn` to the argument list `args`. This is useful for
	     * creating a fixed-arity function from a variadic function. `fn` should
	     * be a bound function if context is significant.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (*... -> a) -> [*] -> a
	     * @param {Function} fn
	     * @param {Array} args
	     * @return {*}
	     * @see R.call, R.unapply
	     * @example
	     *
	     *      var nums = [1, 2, 3, -99, 42, 6, 7];
	     *      R.apply(Math.max, nums); //=> 42
	     */
	    var apply = _curry2(function apply(fn, args) {
	        return fn.apply(this, args);
	    });
	
	    /**
	     * Makes a shallow clone of an object, setting or overriding the specified
	     * property with the given value.  Note that this copies and flattens
	     * prototype properties onto the new object as well.  All non-primitive
	     * properties are copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig String -> a -> {k: v} -> {k: v}
	     * @param {String} prop the property name to set
	     * @param {*} val the new value
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original except for the specified property.
	     * @see R.dissoc
	     * @example
	     *
	     *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
	     */
	    var assoc = _curry3(function assoc(prop, val, obj) {
	        var result = {};
	        for (var p in obj) {
	            result[p] = obj[p];
	        }
	        result[prop] = val;
	        return result;
	    });
	
	    /**
	     * Makes a shallow clone of an object, setting or overriding the nodes
	     * required to create the given path, and placing the specific value at the
	     * tail end of that path.  Note that this copies and flattens prototype
	     * properties onto the new object as well.  All non-primitive properties
	     * are copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [String] -> a -> {k: v} -> {k: v}
	     * @param {Array} path the path to set
	     * @param {*} val the new value
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original except along the specified path.
	     * @see R.dissocPath
	     * @example
	     *
	     *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
	     */
	    var assocPath = _curry3(function assocPath(path, val, obj) {
	        switch (path.length) {
	        case 0:
	            return obj;
	        case 1:
	            return assoc(path[0], val, obj);
	        default:
	            return assoc(path[0], assocPath(_slice(path, 1), val, Object(obj[path[0]])), obj);
	        }
	    });
	
	    /**
	     * Creates a function that is bound to a context.
	     * Note: `R.bind` does not provide the additional argument-binding capabilities of
	     * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @category Object
	     * @see R.partial
	     * @sig (* -> *) -> {*} -> (* -> *)
	     * @param {Function} fn The function to bind to context
	     * @param {Object} thisObj The context to bind `fn` to
	     * @return {Function} A function that will execute in the context of `thisObj`.
	     */
	    var bind = _curry2(function bind(fn, thisObj) {
	        return _arity(fn.length, function () {
	            return fn.apply(thisObj, arguments);
	        });
	    });
	
	    /**
	     * A function wrapping calls to the two functions in an `&&` operation, returning the result of the first
	     * function if it is false-y and the result of the second function otherwise.  Note that this is
	     * short-circuited, meaning that the second function will not be invoked if the first returns a false-y
	     * value.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
	     * @param {Function} f a predicate
	     * @param {Function} g another predicate
	     * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
	     * @see R.and
	     * @example
	     *
	     *      var gt10 = function(x) { return x > 10; };
	     *      var even = function(x) { return x % 2 === 0 };
	     *      var f = R.both(gt10, even);
	     *      f(100); //=> true
	     *      f(101); //=> false
	     */
	    var both = _curry2(function both(f, g) {
	        return function _both() {
	            return f.apply(this, arguments) && g.apply(this, arguments);
	        };
	    });
	
	    /**
	     * Makes a comparator function out of a function that reports whether the first element is less than the second.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a, b -> Boolean) -> (a, b -> Number)
	     * @param {Function} pred A predicate function of arity two.
	     * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`.
	     * @example
	     *
	     *      var cmp = R.comparator(function(a, b) {
	     *        return a.age < b.age;
	     *      });
	     *      var people = [
	     *        // ...
	     *      ];
	     *      R.sort(cmp, people);
	     */
	    var comparator = _curry1(function comparator(pred) {
	        return function (a, b) {
	            return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
	        };
	    });
	
	    /**
	     * Takes a function `f` and returns a function `g` such that:
	     *
	     *   - applying `g` to zero or more arguments will give __true__ if applying
	     *     the same arguments to `f` gives a logical __false__ value; and
	     *
	     *   - applying `g` to zero or more arguments will give __false__ if applying
	     *     the same arguments to `f` gives a logical __true__ value.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig (*... -> *) -> (*... -> Boolean)
	     * @param {Function} f
	     * @return {Function}
	     * @see R.not
	     * @example
	     *
	     *      var isEven = function(n) { return n % 2 === 0; };
	     *      var isOdd = R.complement(isEven);
	     *      isOdd(21); //=> true
	     *      isOdd(42); //=> false
	     */
	    var complement = _curry1(_complement);
	
	    /**
	     * Returns a function, `fn`, which encapsulates if/else-if/else logic.
	     * `R.cond` takes a list of [predicate, transform] pairs. All of the
	     * arguments to `fn` are applied to each of the predicates in turn
	     * until one returns a "truthy" value, at which point `fn` returns the
	     * result of applying its arguments to the corresponding transformer.
	     * If none of the predicates matches, `fn` returns undefined.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
	     * @param {Array} pairs
	     * @return {Function}
	     * @example
	     *
	     *      var fn = R.cond([
	     *        [R.equals(0),   R.always('water freezes at 0°C')],
	     *        [R.equals(100), R.always('water boils at 100°C')],
	     *        [R.T,           function(temp) { return 'nothing special happens at ' + temp + '°C'; }]
	     *      ]);
	     *      fn(0); //=> 'water freezes at 0°C'
	     *      fn(50); //=> 'nothing special happens at 50°C'
	     *      fn(100); //=> 'water boils at 100°C'
	     */
	    var cond = _curry1(function cond(pairs) {
	        return function () {
	            var idx = 0;
	            while (idx < pairs.length) {
	                if (pairs[idx][0].apply(this, arguments)) {
	                    return pairs[idx][1].apply(this, arguments);
	                }
	                idx += 1;
	            }
	        };
	    });
	
	    /**
	     * Returns `true` if the `x` is found in the `list`, using `pred` as an
	     * equality predicate for `x`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a, a -> Boolean) -> a -> [a] -> Boolean
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {*} x The item to find
	     * @param {Array} list The list to iterate over
	     * @return {Boolean} `true` if `x` is in `list`, else `false`.
	     * @example
	     *
	     *      var xs = [{x: 12}, {x: 11}, {x: 10}];
	     *      R.containsWith(function(a, b) { return a.x === b.x; }, {x: 10}, xs); //=> true
	     *      R.containsWith(function(a, b) { return a.x === b.x; }, {x: 1}, xs); //=> false
	     */
	    var containsWith = _curry3(_containsWith);
	
	    /**
	     * Counts the elements of a list according to how many match each value
	     * of a key generated by the supplied function. Returns an object
	     * mapping the keys produced by `fn` to the number of occurrences in
	     * the list. Note that all keys are coerced to strings because of how
	     * JavaScript objects work.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig (a -> String) -> [a] -> {*}
	     * @param {Function} fn The function used to map values to keys.
	     * @param {Array} list The list to count elements from.
	     * @return {Object} An object mapping keys to number of occurrences in the list.
	     * @example
	     *
	     *      var numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
	     *      var letters = R.split('', 'abcABCaaaBBc');
	     *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
	     *      R.countBy(R.toLower)(letters);   //=> {'a': 5, 'b': 4, 'c': 3}
	     */
	    var countBy = _curry2(function countBy(fn, list) {
	        var counts = {};
	        var len = list.length;
	        var idx = 0;
	        while (idx < len) {
	            var key = fn(list[idx]);
	            counts[key] = (_has(key, counts) ? counts[key] : 0) + 1;
	            idx += 1;
	        }
	        return counts;
	    });
	
	    /**
	     * Creates an object containing a single key:value pair.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig String -> a -> {String:a}
	     * @param {String} key
	     * @param {*} val
	     * @return {Object}
	     * @example
	     *
	     *      var matchPhrases = R.compose(
	     *        R.createMapEntry('must'),
	     *        R.map(R.createMapEntry('match_phrase'))
	     *      );
	     *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
	     */
	    var createMapEntry = _curry2(function createMapEntry(key, val) {
	        var obj = {};
	        obj[key] = val;
	        return obj;
	    });
	
	    /**
	     * Returns a curried equivalent of the provided function, with the
	     * specified arity. The curried function has two unusual capabilities.
	     * First, its arguments needn't be provided one at a time. If `g` is
	     * `R.curryN(3, f)`, the following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`,
	     * the following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> (* -> a) -> (* -> a)
	     * @param {Number} length The arity for the returned function.
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curry
	     * @example
	     *
	     *      var addFourNumbers = function() {
	     *        return R.sum([].slice.call(arguments, 0, 4));
	     *      };
	     *
	     *      var curriedAddFourNumbers = R.curryN(4, addFourNumbers);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */
	    var curryN = _curry2(function curryN(length, fn) {
	        if (length === 1) {
	            return _curry1(fn);
	        }
	        return _arity(length, _curryN(length, [], fn));
	    });
	
	    /**
	     * Decrements its argument.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @see R.inc
	     * @example
	     *
	     *      R.dec(42); //=> 41
	     */
	    var dec = add(-1);
	
	    /**
	     * Returns the second argument if it is not null or undefined. If it is null
	     * or undefined, the first (default) argument is returned.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig a -> b -> a | b
	     * @param {a} val The default value.
	     * @param {b} val The value to return if it is not null or undefined
	     * @return {*} The the second value or the default value
	     * @example
	     *
	     *      var defaultTo42 = defaultTo(42);
	     *
	     *      defaultTo42(null);  //=> 42
	     *      defaultTo42(undefined);  //=> 42
	     *      defaultTo42('Ramda');  //=> 'Ramda'
	     */
	    var defaultTo = _curry2(function defaultTo(d, v) {
	        return v == null ? d : v;
	    });
	
	    /**
	     * Finds the set (i.e. no duplicates) of all elements in the first list not contained in the second list.
	     * Duplication is determined according to the value returned by applying the supplied predicate to two list
	     * elements.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig (a,a -> Boolean) -> [a] -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @see R.difference
	     * @return {Array} The elements in `list1` that are not in `list2`.
	     * @example
	     *
	     *      function cmp(x, y) { return x.a === y.a; }
	     *      var l1 = [{a: 1}, {a: 2}, {a: 3}];
	     *      var l2 = [{a: 3}, {a: 4}];
	     *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
	     */
	    var differenceWith = _curry3(function differenceWith(pred, first, second) {
	        var out = [];
	        var idx = 0;
	        var firstLen = first.length;
	        var containsPred = containsWith(pred);
	        while (idx < firstLen) {
	            if (!containsPred(first[idx], second) && !containsPred(first[idx], out)) {
	                out[out.length] = first[idx];
	            }
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns a new object that does not contain a `prop` property.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig String -> {k: v} -> {k: v}
	     * @param {String} prop the name of the property to dissociate
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original but without the specified property
	     * @see R.assoc
	     * @example
	     *
	     *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
	     */
	    var dissoc = _curry2(function dissoc(prop, obj) {
	        var result = {};
	        for (var p in obj) {
	            if (p !== prop) {
	                result[p] = obj[p];
	            }
	        }
	        return result;
	    });
	
	    /**
	     * Makes a shallow clone of an object, omitting the property at the
	     * given path. Note that this copies and flattens prototype properties
	     * onto the new object as well.  All non-primitive properties are copied
	     * by reference.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [String] -> {k: v} -> {k: v}
	     * @param {Array} path the path to set
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object without the property at path
	     * @see R.assocPath
	     * @example
	     *
	     *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
	     */
	    var dissocPath = _curry2(function dissocPath(path, obj) {
	        switch (path.length) {
	        case 0:
	            return obj;
	        case 1:
	            return dissoc(path[0], obj);
	        default:
	            var head = path[0];
	            var tail = _slice(path, 1);
	            return obj[head] == null ? obj : assoc(head, dissocPath(tail, obj[head]), obj);
	        }
	    });
	
	    /**
	     * Divides two numbers. Equivalent to `a / b`.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a / b`.
	     * @see R.multiply
	     * @example
	     *
	     *      R.divide(71, 100); //=> 0.71
	     *
	     *      var half = R.divide(R.__, 2);
	     *      half(42); //=> 21
	     *
	     *      var reciprocal = R.divide(1);
	     *      reciprocal(4);   //=> 0.25
	     */
	    var divide = _curry2(function divide(a, b) {
	        return a / b;
	    });
	
	    /**
	     * Returns a new list containing all but last the`n` elements of a given list,
	     * passing each value from the right to the supplied predicate function, skipping
	     * elements while the predicate function returns `true`. The predicate function
	     * is passed one argument: (value)*.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.takeLastWhile
	     * @example
	     *
	     *      var lteThree = function(x) {
	     *        return x <= 3;
	     *      };
	     *
	     *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2]
	     */
	    var dropLastWhile = _curry2(function dropLastWhile(pred, list) {
	        var idx = list.length - 1;
	        while (idx >= 0 && pred(list[idx])) {
	            idx -= 1;
	        }
	        return _slice(list, 0, idx + 1);
	    });
	
	    /**
	     * A function wrapping calls to the two functions in an `||` operation, returning the result of the first
	     * function if it is truth-y and the result of the second function otherwise.  Note that this is
	     * short-circuited, meaning that the second function will not be invoked if the first returns a truth-y
	     * value.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
	     * @param {Function} f a predicate
	     * @param {Function} g another predicate
	     * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
	     * @see R.or
	     * @example
	     *
	     *      var gt10 = function(x) { return x > 10; };
	     *      var even = function(x) { return x % 2 === 0 };
	     *      var f = R.either(gt10, even);
	     *      f(101); //=> true
	     *      f(8); //=> true
	     */
	    var either = _curry2(function either(f, g) {
	        return function _either() {
	            return f.apply(this, arguments) || g.apply(this, arguments);
	        };
	    });
	
	    /**
	     * Returns the empty value of its argument's type. Ramda defines the empty
	     * value of Array (`[]`), Object (`{}`), and String (`''`). Other types are
	     * supported if they define `<Type>.empty` and/or `<Type>.prototype.empty`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig a -> a
	     * @param {*} x
	     * @return {*}
	     * @example
	     *
	     *      R.empty(Just(42));      //=> Nothing()
	     *      R.empty([1, 2, 3]);     //=> []
	     *      R.empty('unicorns');    //=> ''
	     *      R.empty({x: 1, y: 2});  //=> {}
	     */
	    var empty = _curry1(function empty(x) {
	        if (x != null && typeof x.empty === 'function') {
	            return x.empty();
	        } else if (x != null && typeof x.constructor != null && typeof x.constructor.empty === 'function') {
	            return x.constructor.empty();
	        } else {
	            switch (Object.prototype.toString.call(x)) {
	            case '[object Array]':
	                return [];
	            case '[object Object]':
	                return {};
	            case '[object String]':
	                return '';
	            }
	        }
	    });
	
	    /**
	     * Creates a new object by recursively evolving a shallow copy of `object`, according to the
	     * `transformation` functions. All non-primitive properties are copied by reference.
	     *
	     * A `tranformation` function will not be invoked if its corresponding key does not exist in
	     * the evolved object.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: (v -> v)} -> {k: v} -> {k: v}
	     * @param {Object} transformations The object specifying transformation functions to apply
	     *        to the object.
	     * @param {Object} object The object to be transformed.
	     * @return {Object} The transformed object.
	     * @example
	     *
	     *      var tomato  = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
	     *      var transformations = {
	     *        firstName: R.trim,
	     *        lastName: R.trim, // Will not get invoked.
	     *        data: {elapsed: R.add(1), remaining: R.add(-1)}
	     *      };
	     *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
	     */
	    var evolve = _curry2(function evolve(transformations, object) {
	        var transformation, key, type, result = {};
	        for (key in object) {
	            transformation = transformations[key];
	            type = typeof transformation;
	            result[key] = type === 'function' ? transformation(object[key]) : type === 'object' ? evolve(transformations[key], object[key]) : object[key];
	        }
	        return result;
	    });
	
	    /**
	     * Creates a new object out of a list key-value pairs.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [[k,v]] -> {k: v}
	     * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
	     * @return {Object} The object made by pairing up `keys` and `values`.
	     * @see R.toPairs
	     * @example
	     *
	     *      R.fromPairs([['a', 1], ['b', 2],  ['c', 3]]); //=> {a: 1, b: 2, c: 3}
	     */
	    var fromPairs = _curry1(function fromPairs(pairs) {
	        var idx = 0, len = pairs.length, out = {};
	        while (idx < len) {
	            if (_isArray(pairs[idx]) && pairs[idx].length) {
	                out[pairs[idx][0]] = pairs[idx][1];
	            }
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns `true` if the first argument is greater than the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @see R.lt
	     * @example
	     *
	     *      R.gt(2, 1); //=> true
	     *      R.gt(2, 2); //=> false
	     *      R.gt(2, 3); //=> false
	     *      R.gt('a', 'z'); //=> false
	     *      R.gt('z', 'a'); //=> true
	     */
	    var gt = _curry2(function gt(a, b) {
	        return a > b;
	    });
	
	    /**
	     * Returns `true` if the first argument is greater than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.lte
	     * @example
	     *
	     *      R.gte(2, 1); //=> true
	     *      R.gte(2, 2); //=> true
	     *      R.gte(2, 3); //=> false
	     *      R.gte('a', 'z'); //=> false
	     *      R.gte('z', 'a'); //=> true
	     */
	    var gte = _curry2(function gte(a, b) {
	        return a >= b;
	    });
	
	    /**
	     * Returns whether or not an object has an own property with
	     * the specified name
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig s -> {s: x} -> Boolean
	     * @param {String} prop The name of the property to check for.
	     * @param {Object} obj The object to query.
	     * @return {Boolean} Whether the property exists.
	     * @example
	     *
	     *      var hasName = R.has('name');
	     *      hasName({name: 'alice'});   //=> true
	     *      hasName({name: 'bob'});     //=> true
	     *      hasName({});                //=> false
	     *
	     *      var point = {x: 0, y: 0};
	     *      var pointHas = R.has(R.__, point);
	     *      pointHas('x');  //=> true
	     *      pointHas('y');  //=> true
	     *      pointHas('z');  //=> false
	     */
	    var has = _curry2(_has);
	
	    /**
	     * Returns whether or not an object or its prototype chain has
	     * a property with the specified name
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig s -> {s: x} -> Boolean
	     * @param {String} prop The name of the property to check for.
	     * @param {Object} obj The object to query.
	     * @return {Boolean} Whether the property exists.
	     * @example
	     *
	     *      function Rectangle(width, height) {
	     *        this.width = width;
	     *        this.height = height;
	     *      }
	     *      Rectangle.prototype.area = function() {
	     *        return this.width * this.height;
	     *      };
	     *
	     *      var square = new Rectangle(2, 2);
	     *      R.hasIn('width', square);  //=> true
	     *      R.hasIn('area', square);  //=> true
	     */
	    var hasIn = _curry2(function hasIn(prop, obj) {
	        return prop in obj;
	    });
	
	    /**
	     * Returns true if its arguments are identical, false otherwise. Values are
	     * identical if they reference the same memory. `NaN` is identical to `NaN`;
	     * `0` and `-0` are not identical.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      var o = {};
	     *      R.identical(o, o); //=> true
	     *      R.identical(1, 1); //=> true
	     *      R.identical(1, '1'); //=> false
	     *      R.identical([], []); //=> false
	     *      R.identical(0, -0); //=> false
	     *      R.identical(NaN, NaN); //=> true
	     */
	    // SameValue algorithm
	    // Steps 1-5, 7-10
	    // Steps 6.b-6.e: +0 != -0
	    // Step 6.a: NaN == NaN
	    var identical = _curry2(function identical(a, b) {
	        // SameValue algorithm
	        if (a === b) {
	            // Steps 1-5, 7-10
	            // Steps 6.b-6.e: +0 != -0
	            return a !== 0 || 1 / a === 1 / b;
	        } else {
	            // Step 6.a: NaN == NaN
	            return a !== a && b !== b;
	        }
	    });
	
	    /**
	     * A function that does nothing but return the parameter supplied to it. Good as a default
	     * or placeholder function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig a -> a
	     * @param {*} x The value to return.
	     * @return {*} The input value, `x`.
	     * @example
	     *
	     *      R.identity(1); //=> 1
	     *
	     *      var obj = {};
	     *      R.identity(obj) === obj; //=> true
	     */
	    var identity = _curry1(_identity);
	
	    /**
	     * Creates a function that will process either the `onTrue` or the `onFalse` function depending
	     * upon the result of the `condition` predicate.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
	     * @param {Function} condition A predicate function
	     * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
	     * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
	     * @return {Function} A new unary function that will process either the `onTrue` or the `onFalse`
	     *                    function depending upon the result of the `condition` predicate.
	     * @example
	     *
	     *      // Flatten all arrays in the list but leave other values alone.
	     *      var flattenArrays = R.map(R.ifElse(Array.isArray, R.flatten, R.identity));
	     *
	     *      flattenArrays([[0], [[10], [8]], 1234, {}]); //=> [[0], [10, 8], 1234, {}]
	     *      flattenArrays([[[10], 123], [8, [10]], "hello"]); //=> [[10, 123], [8, 10], "hello"]
	     */
	    var ifElse = _curry3(function ifElse(condition, onTrue, onFalse) {
	        return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
	            return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
	        });
	    });
	
	    /**
	     * Increments its argument.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @see R.dec
	     * @example
	     *
	     *      R.inc(42); //=> 43
	     */
	    var inc = add(1);
	
	    /**
	     * Inserts the supplied element into the list, at index `index`.  _Note
	     * that this is not destructive_: it returns a copy of the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> a -> [a] -> [a]
	     * @param {Number} index The position to insert the element
	     * @param {*} elt The element to insert into the Array
	     * @param {Array} list The list to insert into
	     * @return {Array} A new Array with `elt` inserted at `index`.
	     * @example
	     *
	     *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
	     */
	    var insert = _curry3(function insert(idx, elt, list) {
	        idx = idx < list.length && idx >= 0 ? idx : list.length;
	        var result = _slice(list);
	        result.splice(idx, 0, elt);
	        return result;
	    });
	
	    /**
	     * Inserts the sub-list into the list, at index `index`.  _Note  that this
	     * is not destructive_: it returns a copy of the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [a] -> [a]
	     * @param {Number} index The position to insert the sub-list
	     * @param {Array} elts The sub-list to insert into the Array
	     * @param {Array} list The list to insert the sub-list into
	     * @return {Array} A new Array with `elts` inserted starting at `index`.
	     * @example
	     *
	     *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
	     */
	    var insertAll = _curry3(function insertAll(idx, elts, list) {
	        idx = idx < list.length && idx >= 0 ? idx : list.length;
	        return _concat(_concat(_slice(list, 0, idx), elts), _slice(list, idx));
	    });
	
	    /**
	     * See if an object (`val`) is an instance of the supplied constructor.
	     * This function will check up the inheritance chain, if any.
	     *
	     * @func
	     * @memberOf R
	     * @category Type
	     * @sig (* -> {*}) -> a -> Boolean
	     * @param {Object} ctor A constructor
	     * @param {*} val The value to test
	     * @return {Boolean}
	     * @example
	     *
	     *      R.is(Object, {}); //=> true
	     *      R.is(Number, 1); //=> true
	     *      R.is(Object, 1); //=> false
	     *      R.is(String, 's'); //=> true
	     *      R.is(String, new String('')); //=> true
	     *      R.is(Object, new String('')); //=> true
	     *      R.is(Object, 's'); //=> false
	     *      R.is(Number, {}); //=> false
	     */
	    var is = _curry2(function is(Ctor, val) {
	        return val != null && val.constructor === Ctor || val instanceof Ctor;
	    });
	
	    /**
	     * Tests whether or not an object is similar to an array.
	     *
	     * @func
	     * @memberOf R
	     * @category Type
	     * @category List
	     * @sig * -> Boolean
	     * @param {*} x The object to test.
	     * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
	     * @example
	     *
	     *      R.isArrayLike([]); //=> true
	     *      R.isArrayLike(true); //=> false
	     *      R.isArrayLike({}); //=> false
	     *      R.isArrayLike({length: 10}); //=> false
	     *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
	     */
	    var isArrayLike = _curry1(function isArrayLike(x) {
	        if (_isArray(x)) {
	            return true;
	        }
	        if (!x) {
	            return false;
	        }
	        if (typeof x !== 'object') {
	            return false;
	        }
	        if (x instanceof String) {
	            return false;
	        }
	        if (x.nodeType === 1) {
	            return !!x.length;
	        }
	        if (x.length === 0) {
	            return true;
	        }
	        if (x.length > 0) {
	            return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
	        }
	        return false;
	    });
	
	    /**
	     * Reports whether the list has zero elements.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig [a] -> Boolean
	     * @param {Array} list
	     * @return {Boolean}
	     * @example
	     *
	     *      R.isEmpty([1, 2, 3]);   //=> false
	     *      R.isEmpty([]);          //=> true
	     *      R.isEmpty('');          //=> true
	     *      R.isEmpty(null);        //=> false
	     *      R.isEmpty(R.keys({}));  //=> true
	     *      R.isEmpty({});          //=> false ({} does not have a length property)
	     *      R.isEmpty({length: 0}); //=> true
	     */
	    var isEmpty = _curry1(function isEmpty(list) {
	        return Object(list).length === 0;
	    });
	
	    /**
	     * Checks if the input value is `null` or `undefined`.
	     *
	     * @func
	     * @memberOf R
	     * @category Type
	     * @sig * -> Boolean
	     * @param {*} x The value to test.
	     * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
	     * @example
	     *
	     *      R.isNil(null); //=> true
	     *      R.isNil(undefined); //=> true
	     *      R.isNil(0); //=> false
	     *      R.isNil([]); //=> false
	     */
	    var isNil = _curry1(function isNil(x) {
	        return x == null;
	    });
	
	    /**
	     * Returns a list containing the names of all the enumerable own
	     * properties of the supplied object.
	     * Note that the order of the output array is not guaranteed to be
	     * consistent across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: v} -> [k]
	     * @param {Object} obj The object to extract properties from
	     * @return {Array} An array of the object's own properties.
	     * @example
	     *
	     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
	     */
	    // cover IE < 9 keys issues
	    var keys = function () {
	        // cover IE < 9 keys issues
	        var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
	        var nonEnumerableProps = [
	            'constructor',
	            'valueOf',
	            'isPrototypeOf',
	            'toString',
	            'propertyIsEnumerable',
	            'hasOwnProperty',
	            'toLocaleString'
	        ];
	        var contains = function contains(list, item) {
	            var idx = 0;
	            while (idx < list.length) {
	                if (list[idx] === item) {
	                    return true;
	                }
	                idx += 1;
	            }
	            return false;
	        };
	        return typeof Object.keys === 'function' ? _curry1(function keys(obj) {
	            return Object(obj) !== obj ? [] : Object.keys(obj);
	        }) : _curry1(function keys(obj) {
	            if (Object(obj) !== obj) {
	                return [];
	            }
	            var prop, ks = [], nIdx;
	            for (prop in obj) {
	                if (_has(prop, obj)) {
	                    ks[ks.length] = prop;
	                }
	            }
	            if (hasEnumBug) {
	                nIdx = nonEnumerableProps.length - 1;
	                while (nIdx >= 0) {
	                    prop = nonEnumerableProps[nIdx];
	                    if (_has(prop, obj) && !contains(ks, prop)) {
	                        ks[ks.length] = prop;
	                    }
	                    nIdx -= 1;
	                }
	            }
	            return ks;
	        });
	    }();
	
	    /**
	     * Returns a list containing the names of all the
	     * properties of the supplied object, including prototype properties.
	     * Note that the order of the output array is not guaranteed to be
	     * consistent across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: v} -> [k]
	     * @param {Object} obj The object to extract properties from
	     * @return {Array} An array of the object's own and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.keysIn(f); //=> ['x', 'y']
	     */
	    var keysIn = _curry1(function keysIn(obj) {
	        var prop, ks = [];
	        for (prop in obj) {
	            ks[ks.length] = prop;
	        }
	        return ks;
	    });
	
	    /**
	     * Returns the number of elements in the array by returning `list.length`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> Number
	     * @param {Array} list The array to inspect.
	     * @return {Number} The length of the array.
	     * @example
	     *
	     *      R.length([]); //=> 0
	     *      R.length([1, 2, 3]); //=> 3
	     */
	    var length = _curry1(function length(list) {
	        return list != null && is(Number, list.length) ? list.length : NaN;
	    });
	
	    /**
	     * Returns `true` if the first argument is less than the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @see R.gt
	     * @example
	     *
	     *      R.lt(2, 1); //=> false
	     *      R.lt(2, 2); //=> false
	     *      R.lt(2, 3); //=> true
	     *      R.lt('a', 'z'); //=> true
	     *      R.lt('z', 'a'); //=> false
	     */
	    var lt = _curry2(function lt(a, b) {
	        return a < b;
	    });
	
	    /**
	     * Returns `true` if the first argument is less than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.gte
	     * @example
	     *
	     *      R.lte(2, 1); //=> false
	     *      R.lte(2, 2); //=> true
	     *      R.lte(2, 3); //=> true
	     *      R.lte('a', 'z'); //=> true
	     *      R.lte('z', 'a'); //=> false
	     */
	    var lte = _curry2(function lte(a, b) {
	        return a <= b;
	    });
	
	    /**
	     * The mapAccum function behaves like a combination of map and reduce; it applies a
	     * function to each element of a list, passing an accumulating parameter from left to
	     * right, and returning a final value of this accumulator together with the new list.
	     *
	     * The iterator function receives two arguments, *acc* and *value*, and should return
	     * a tuple *[acc, value]*.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var digits = ['1', '2', '3', '4'];
	     *      var append = function(a, b) {
	     *        return [a + b, a + b];
	     *      }
	     *
	     *      R.mapAccum(append, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
	     */
	    var mapAccum = _curry3(function mapAccum(fn, acc, list) {
	        var idx = 0, len = list.length, result = [], tuple = [acc];
	        while (idx < len) {
	            tuple = fn(tuple[0], list[idx]);
	            result[idx] = tuple[1];
	            idx += 1;
	        }
	        return [
	            tuple[0],
	            result
	        ];
	    });
	
	    /**
	     * The mapAccumRight function behaves like a combination of map and reduce; it applies a
	     * function to each element of a list, passing an accumulating parameter from right
	     * to left, and returning a final value of this accumulator together with the new list.
	     *
	     * Similar to `mapAccum`, except moves through the input list from the right to the
	     * left.
	     *
	     * The iterator function receives two arguments, *acc* and *value*, and should return
	     * a tuple *[acc, value]*.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var digits = ['1', '2', '3', '4'];
	     *      var append = function(a, b) {
	     *        return [a + b, a + b];
	     *      }
	     *
	     *      R.mapAccumRight(append, 0, digits); //=> ['04321', ['04321', '0432', '043', '04']]
	     */
	    var mapAccumRight = _curry3(function mapAccumRight(fn, acc, list) {
	        var idx = list.length - 1, result = [], tuple = [acc];
	        while (idx >= 0) {
	            tuple = fn(tuple[0], list[idx]);
	            result[idx] = tuple[1];
	            idx -= 1;
	        }
	        return [
	            tuple[0],
	            result
	        ];
	    });
	
	    /**
	     * Tests a regular expression against a String. Note that this function
	     * will return an empty array when there are no matches. This differs
	     * from [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
	     * which returns `null` when there are no matches.
	     *
	     * @func
	     * @memberOf R
	     * @see R.test
	     * @category String
	     * @sig RegExp -> String -> [String | Undefined]
	     * @param {RegExp} rx A regular expression.
	     * @param {String} str The string to match against
	     * @return {Array} The list of matches or empty array.
	     * @example
	     *
	     *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
	     *      R.match(/a/, 'b'); //=> []
	     *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
	     */
	    var match = _curry2(function match(rx, str) {
	        return str.match(rx) || [];
	    });
	
	    /**
	     * mathMod behaves like the modulo operator should mathematically, unlike the `%`
	     * operator (and by extension, R.modulo). So while "-17 % 5" is -2,
	     * mathMod(-17, 5) is 3. mathMod requires Integer arguments, and returns NaN
	     * when the modulus is zero or negative.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} m The dividend.
	     * @param {Number} p the modulus.
	     * @return {Number} The result of `b mod a`.
	     * @example
	     *
	     *      R.mathMod(-17, 5);  //=> 3
	     *      R.mathMod(17, 5);   //=> 2
	     *      R.mathMod(17, -5);  //=> NaN
	     *      R.mathMod(17, 0);   //=> NaN
	     *      R.mathMod(17.2, 5); //=> NaN
	     *      R.mathMod(17, 5.3); //=> NaN
	     *
	     *      var clock = R.mathMod(R.__, 12);
	     *      clock(15); //=> 3
	     *      clock(24); //=> 0
	     *
	     *      var seventeenMod = R.mathMod(17);
	     *      seventeenMod(3);  //=> 2
	     *      seventeenMod(4);  //=> 1
	     *      seventeenMod(10); //=> 7
	     */
	    var mathMod = _curry2(function mathMod(m, p) {
	        if (!_isInteger(m)) {
	            return NaN;
	        }
	        if (!_isInteger(p) || p < 1) {
	            return NaN;
	        }
	        return (m % p + p) % p;
	    });
	
	    /**
	     * Returns the larger of its two arguments.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> a
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.maxBy, R.min
	     * @example
	     *
	     *      R.max(789, 123); //=> 789
	     *      R.max('a', 'b'); //=> 'b'
	     */
	    var max = _curry2(function max(a, b) {
	        return b > a ? b : a;
	    });
	
	    /**
	     * Takes a function and two values, and returns whichever value produces
	     * the larger result when passed to the provided function.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord b => (a -> b) -> a -> a -> a
	     * @param {Function} f
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.max, R.minBy
	     * @example
	     *
	     *      R.maxBy(function(n) { return n * n; }, -3, 2); //=> -3
	     */
	    var maxBy = _curry3(function maxBy(f, a, b) {
	        return f(b) > f(a) ? b : a;
	    });
	
	    /**
	     * Create a new object with the own properties of `a`
	     * merged with the own properties of object `b`.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: v} -> {k: v} -> {k: v}
	     * @param {Object} a
	     * @param {Object} b
	     * @return {Object}
	     * @example
	     *
	     *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
	     *      //=> { 'name': 'fred', 'age': 40 }
	     *
	     *      var resetToDefault = R.merge(R.__, {x: 0});
	     *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
	     */
	    var merge = _curry2(function merge(a, b) {
	        var result = {};
	        var ks = keys(a);
	        var idx = 0;
	        while (idx < ks.length) {
	            result[ks[idx]] = a[ks[idx]];
	            idx += 1;
	        }
	        ks = keys(b);
	        idx = 0;
	        while (idx < ks.length) {
	            result[ks[idx]] = b[ks[idx]];
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Returns the smaller of its two arguments.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord a => a -> a -> a
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.minBy, R.max
	     * @example
	     *
	     *      R.min(789, 123); //=> 123
	     *      R.min('a', 'b'); //=> 'a'
	     */
	    var min = _curry2(function min(a, b) {
	        return b < a ? b : a;
	    });
	
	    /**
	     * Takes a function and two values, and returns whichever value produces
	     * the smaller result when passed to the provided function.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord b => (a -> b) -> a -> a -> a
	     * @param {Function} f
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.min, R.maxBy
	     * @example
	     *
	     *      R.minBy(function(n) { return n * n; }, -3, 2); //=> 2
	     */
	    var minBy = _curry3(function minBy(f, a, b) {
	        return f(b) < f(a) ? b : a;
	    });
	
	    /**
	     * Divides the second parameter by the first and returns the remainder.
	     * Note that this functions preserves the JavaScript-style behavior for
	     * modulo. For mathematical modulo see `mathMod`
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The value to the divide.
	     * @param {Number} b The pseudo-modulus
	     * @return {Number} The result of `b % a`.
	     * @see R.mathMod
	     * @example
	     *
	     *      R.modulo(17, 3); //=> 2
	     *      // JS behavior:
	     *      R.modulo(-17, 3); //=> -2
	     *      R.modulo(17, -3); //=> 2
	     *
	     *      var isOdd = R.modulo(R.__, 2);
	     *      isOdd(42); //=> 0
	     *      isOdd(21); //=> 1
	     */
	    var modulo = _curry2(function modulo(a, b) {
	        return a % b;
	    });
	
	    /**
	     * Multiplies two numbers. Equivalent to `a * b` but curried.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a * b`.
	     * @see R.divide
	     * @example
	     *
	     *      var double = R.multiply(2);
	     *      var triple = R.multiply(3);
	     *      double(3);       //=>  6
	     *      triple(4);       //=> 12
	     *      R.multiply(2, 5);  //=> 10
	     */
	    var multiply = _curry2(function multiply(a, b) {
	        return a * b;
	    });
	
	    /**
	     * Wraps a function of any arity (including nullary) in a function that accepts exactly `n`
	     * parameters. Any extraneous parameters will not be passed to the supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> (* -> a) -> (* -> a)
	     * @param {Number} n The desired arity of the new function.
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity `n`.
	     * @example
	     *
	     *      var takesTwoArgs = function(a, b) {
	     *        return [a, b];
	     *      };
	     *      takesTwoArgs.length; //=> 2
	     *      takesTwoArgs(1, 2); //=> [1, 2]
	     *
	     *      var takesOneArg = R.nAry(1, takesTwoArgs);
	     *      takesOneArg.length; //=> 1
	     *      // Only `n` arguments are passed to the wrapped function
	     *      takesOneArg(1, 2); //=> [1, undefined]
	     */
	    var nAry = _curry2(function nAry(n, fn) {
	        switch (n) {
	        case 0:
	            return function () {
	                return fn.call(this);
	            };
	        case 1:
	            return function (a0) {
	                return fn.call(this, a0);
	            };
	        case 2:
	            return function (a0, a1) {
	                return fn.call(this, a0, a1);
	            };
	        case 3:
	            return function (a0, a1, a2) {
	                return fn.call(this, a0, a1, a2);
	            };
	        case 4:
	            return function (a0, a1, a2, a3) {
	                return fn.call(this, a0, a1, a2, a3);
	            };
	        case 5:
	            return function (a0, a1, a2, a3, a4) {
	                return fn.call(this, a0, a1, a2, a3, a4);
	            };
	        case 6:
	            return function (a0, a1, a2, a3, a4, a5) {
	                return fn.call(this, a0, a1, a2, a3, a4, a5);
	            };
	        case 7:
	            return function (a0, a1, a2, a3, a4, a5, a6) {
	                return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
	            };
	        case 8:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7) {
	                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
	            };
	        case 9:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
	                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
	            };
	        case 10:
	            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
	                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
	            };
	        default:
	            throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
	        }
	    });
	
	    /**
	     * Negates its argument.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @example
	     *
	     *      R.negate(42); //=> -42
	     */
	    var negate = _curry1(function negate(n) {
	        return -n;
	    });
	
	    /**
	     * A function that returns the `!` of its argument. It will return `true` when
	     * passed false-y value, and `false` when passed a truth-y one.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig * -> Boolean
	     * @param {*} a any value
	     * @return {Boolean} the logical inverse of passed argument.
	     * @see R.complement
	     * @example
	     *
	     *      R.not(true); //=> false
	     *      R.not(false); //=> true
	     *      R.not(0); => true
	     *      R.not(1); => false
	     */
	    var not = _curry1(function not(a) {
	        return !a;
	    });
	
	    /**
	     * Returns the nth element of the given list or string.
	     * If n is negative the element at index length + n is returned.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> a | Undefined
	     * @sig Number -> String -> String
	     * @param {Number} offset
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      var list = ['foo', 'bar', 'baz', 'quux'];
	     *      R.nth(1, list); //=> 'bar'
	     *      R.nth(-1, list); //=> 'quux'
	     *      R.nth(-99, list); //=> undefined
	     *
	     *      R.nth('abc', 2); //=> 'c'
	     *      R.nth('abc', 3); //=> ''
	     */
	    var nth = _curry2(function nth(offset, list) {
	        var idx = offset < 0 ? list.length + offset : offset;
	        return _isString(list) ? list.charAt(idx) : list[idx];
	    });
	
	    /**
	     * Returns a function which returns its nth argument.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> *... -> *
	     * @param {Number} n
	     * @return {Function}
	     * @example
	     *
	     *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
	     *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
	     */
	    var nthArg = _curry1(function nthArg(n) {
	        return function () {
	            return nth(n, arguments);
	        };
	    });
	
	    /**
	     * Returns the nth character of the given string.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {String} str
	     * @return {String}
	     * @deprecated since v0.16.0
	     * @example
	     *
	     *      R.nthChar(2, 'Ramda'); //=> 'm'
	     *      R.nthChar(-2, 'Ramda'); //=> 'd'
	     */
	    var nthChar = _curry2(function nthChar(n, str) {
	        return str.charAt(n < 0 ? str.length + n : n);
	    });
	
	    /**
	     * Returns the character code of the nth character of the given string.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig Number -> String -> Number
	     * @param {Number} n
	     * @param {String} str
	     * @return {Number}
	     * @deprecated since v0.16.0
	     * @example
	     *
	     *      R.nthCharCode(2, 'Ramda'); //=> 'm'.charCodeAt(0)
	     *      R.nthCharCode(-2, 'Ramda'); //=> 'd'.charCodeAt(0)
	     */
	    var nthCharCode = _curry2(function nthCharCode(n, str) {
	        return str.charCodeAt(n < 0 ? str.length + n : n);
	    });
	
	    /**
	     * Returns a singleton array containing the value provided.
	     *
	     * Note this `of` is different from the ES6 `of`; See
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig a -> [a]
	     * @param {*} x any value
	     * @return {Array} An array wrapping `x`.
	     * @example
	     *
	     *      R.of(null); //=> [null]
	     *      R.of([42]); //=> [[42]]
	     */
	    var of = _curry1(function of(x) {
	        return [x];
	    });
	
	    /**
	     * Accepts a function `fn` and returns a function that guards invocation of `fn` such that
	     * `fn` can only ever be called once, no matter how many times the returned function is
	     * invoked.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a... -> b) -> (a... -> b)
	     * @param {Function} fn The function to wrap in a call-only-once wrapper.
	     * @return {Function} The wrapped function.
	     * @example
	     *
	     *      var addOneOnce = R.once(function(x){ return x + 1; });
	     *      addOneOnce(10); //=> 11
	     *      addOneOnce(addOneOnce(50)); //=> 11
	     */
	    var once = _curry1(function once(fn) {
	        var called = false, result;
	        return function () {
	            if (called) {
	                return result;
	            }
	            called = true;
	            result = fn.apply(this, arguments);
	            return result;
	        };
	    });
	
	    /**
	     * Returns the result of "setting" the portion of the given data structure
	     * focused by the given lens to the given value.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> (a -> a) -> s -> s
	     * @param {Lens} lens
	     * @param {*} v
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var headLens = R.lensIndex(0);
	     *
	     *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
	     */
	    var over = function () {
	        var Identity = function (x) {
	            return {
	                value: x,
	                map: function (f) {
	                    return Identity(f(x));
	                }
	            };
	        };
	        return _curry3(function over(lens, f, x) {
	            return lens(function (y) {
	                return Identity(f(y));
	            })(x).value;
	        });
	    }();
	
	    /**
	     * Retrieve the value at a given path.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [String] -> {k: v} -> v | Undefined
	     * @param {Array} path The path to use.
	     * @return {*} The data at `path`.
	     * @example
	     *
	     *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
	     *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
	     */
	    var path = _curry2(function path(paths, obj) {
	        if (obj == null) {
	            return;
	        } else {
	            var val = obj;
	            for (var idx = 0, len = paths.length; idx < len && val != null; idx += 1) {
	                val = val[paths[idx]];
	            }
	            return val;
	        }
	    });
	
	    /**
	     * Returns a partial copy of an object containing only the keys specified.  If the key does not exist, the
	     * property is ignored.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [k] -> {k: v} -> {k: v}
	     * @param {Array} names an array of String property names to copy onto a new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties from `names` on it.
	     * @see R.omit
	     * @example
	     *
	     *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
	     *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
	     */
	    var pick = _curry2(function pick(names, obj) {
	        var result = {};
	        var idx = 0;
	        while (idx < names.length) {
	            if (names[idx] in obj) {
	                result[names[idx]] = obj[names[idx]];
	            }
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Similar to `pick` except that this one includes a `key: undefined` pair for properties that don't exist.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [k] -> {k: v} -> {k: v}
	     * @param {Array} names an array of String property names to copy onto a new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties from `names` on it.
	     * @see R.pick
	     * @example
	     *
	     *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
	     *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
	     */
	    var pickAll = _curry2(function pickAll(names, obj) {
	        var result = {};
	        var idx = 0;
	        var len = names.length;
	        while (idx < len) {
	            var name = names[idx];
	            result[name] = obj[name];
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Returns a partial copy of an object containing only the keys that
	     * satisfy the supplied predicate.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig (v, k -> Boolean) -> {k: v} -> {k: v}
	     * @param {Function} pred A predicate to determine whether or not a key
	     *        should be included on the output object.
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties that satisfy `pred`
	     *         on it.
	     * @see R.pick
	     * @example
	     *
	     *      var isUpperCase = function(val, key) { return key.toUpperCase() === key; }
	     *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
	     */
	    var pickBy = _curry2(function pickBy(test, obj) {
	        var result = {};
	        for (var prop in obj) {
	            if (test(obj[prop], prop, obj)) {
	                result[prop] = obj[prop];
	            }
	        }
	        return result;
	    });
	
	    /**
	     * Returns a new list with the given element at the front, followed by the contents of the
	     * list.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} el The item to add to the head of the output list.
	     * @param {Array} list The array to add to the tail of the output list.
	     * @return {Array} A new array.
	     * @see R.append
	     * @example
	     *
	     *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
	     */
	    var prepend = _curry2(function prepend(el, list) {
	        return _concat([el], list);
	    });
	
	    /**
	     * Returns a function that when supplied an object returns the indicated property of that object, if it exists.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig s -> {s: a} -> a | Undefined
	     * @param {String} p The property name
	     * @param {Object} obj The object to query
	     * @return {*} The value at `obj.p`.
	     * @example
	     *
	     *      R.prop('x', {x: 100}); //=> 100
	     *      R.prop('x', {}); //=> undefined
	     */
	    var prop = _curry2(function prop(p, obj) {
	        return obj[p];
	    });
	
	    /**
	     * If the given, non-null object has an own property with the specified name,
	     * returns the value of that property.
	     * Otherwise returns the provided default value.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig a -> String -> Object -> a
	     * @param {*} val The default value.
	     * @param {String} p The name of the property to return.
	     * @param {Object} obj The object to query.
	     * @return {*} The value of given property of the supplied object or the default value.
	     * @example
	     *
	     *      var alice = {
	     *        name: 'ALICE',
	     *        age: 101
	     *      };
	     *      var favorite = R.prop('favoriteLibrary');
	     *      var favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
	     *
	     *      favorite(alice);  //=> undefined
	     *      favoriteWithDefault(alice);  //=> 'Ramda'
	     */
	    var propOr = _curry3(function propOr(val, p, obj) {
	        return obj != null && _has(p, obj) ? obj[p] : val;
	    });
	
	    /**
	     * Returns `true` if the specified object property satisfies the given
	     * predicate; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
	     * @param {Function} pred
	     * @param {String} name
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.propEq
	     * @see R.propIs
	     * @example
	     *
	     *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
	     */
	    var propSatisfies = _curry3(function propSatisfies(pred, name, obj) {
	        return pred(obj[name]);
	    });
	
	    /**
	     * Acts as multiple `prop`: array of keys in, array of values out. Preserves order.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [k] -> {k: v} -> [v]
	     * @param {Array} ps The property names to fetch
	     * @param {Object} obj The object to query
	     * @return {Array} The corresponding values or partially applied function.
	     * @example
	     *
	     *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
	     *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
	     *
	     *      var fullName = R.compose(R.join(' '), R.props(['first', 'last']));
	     *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
	     */
	    var props = _curry2(function props(ps, obj) {
	        var len = ps.length;
	        var out = [];
	        var idx = 0;
	        while (idx < len) {
	            out[idx] = obj[ps[idx]];
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns a list of numbers from `from` (inclusive) to `to`
	     * (exclusive).
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> Number -> [Number]
	     * @param {Number} from The first number in the list.
	     * @param {Number} to One more than the last number in the list.
	     * @return {Array} The list of numbers in tthe set `[a, b)`.
	     * @example
	     *
	     *      R.range(1, 5);    //=> [1, 2, 3, 4]
	     *      R.range(50, 53);  //=> [50, 51, 52]
	     */
	    var range = _curry2(function range(from, to) {
	        if (!(_isNumber(from) && _isNumber(to))) {
	            throw new TypeError('Both arguments to range must be numbers');
	        }
	        var result = [];
	        var n = from;
	        while (n < to) {
	            result.push(n);
	            n += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Returns a single item by iterating through the list, successively calling the iterator
	     * function and passing it an accumulator value and the current value from the array, and
	     * then passing the result to the next call.
	     *
	     * Similar to `reduce`, except moves through the input list from the right to the left.
	     *
	     * The iterator function receives two values: *(acc, value)*
	     *
	     * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse arrays), unlike
	     * the native `Array.prototype.reduce` method. For more details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a,b -> a) -> a -> [b] -> a
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var pairs = [ ['a', 1], ['b', 2], ['c', 3] ];
	     *      var flattenPairs = function(acc, pair) {
	     *        return acc.concat(pair);
	     *      };
	     *
	     *      R.reduceRight(flattenPairs, [], pairs); //=> [ 'c', 3, 'b', 2, 'a', 1 ]
	     */
	    var reduceRight = _curry3(function reduceRight(fn, acc, list) {
	        var idx = list.length - 1;
	        while (idx >= 0) {
	            acc = fn(acc, list[idx]);
	            idx -= 1;
	        }
	        return acc;
	    });
	
	    /**
	     * Returns a value wrapped to indicate that it is the final value of the
	     * reduce and transduce functions.  The returned value
	     * should be considered a black box: the internal structure is not
	     * guaranteed to be stable.
	     *
	     * Note: this optimization is unavailable to functions not explicitly listed
	     * above.  For instance, it is not currently supported by reduceIndexed,
	     * reduceRight, or reduceRightIndexed.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.reduce, R.transduce
	     * @sig a -> *
	     * @param {*} x The final value of the reduce.
	     * @return {*} The wrapped value.
	     * @example
	     *
	     *      R.reduce(
	     *        R.pipe(R.add, R.ifElse(R.lte(10), R.reduced, R.identity)),
	     *        0,
	     *        [1, 2, 3, 4, 5]) // 10
	     */
	    var reduced = _curry1(_reduced);
	
	    /**
	     * Removes the sub-list of `list` starting at index `start` and containing
	     * `count` elements.  _Note that this is not destructive_: it returns a
	     * copy of the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> Number -> [a] -> [a]
	     * @param {Number} start The position to start removing elements
	     * @param {Number} count The number of elements to remove
	     * @param {Array} list The list to remove from
	     * @return {Array} A new Array with `count` elements from `start` removed.
	     * @example
	     *
	     *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
	     */
	    var remove = _curry3(function remove(start, count, list) {
	        return _concat(_slice(list, 0, Math.min(start, list.length)), _slice(list, Math.min(list.length, start + count)));
	    });
	
	    /**
	     * Replace a substring or regex match in a string with a replacement.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig RegExp|String -> String -> String -> String
	     * @param {RegExp|String} pattern A regular expression or a substring to match.
	     * @param {String} replacement The string to replace the matches with.
	     * @param {String} str The String to do the search and replacement in.
	     * @return {String} The result.
	     * @example
	     *
	     *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
	     *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
	     *
	     *      // Use the "g" (global) flag to replace all occurrences:
	     *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
	     */
	    var replace = _curry3(function replace(regex, replacement, str) {
	        return str.replace(regex, replacement);
	    });
	
	    /**
	     * Returns a new list with the same elements as the original list, just
	     * in the reverse order.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [a]
	     * @param {Array} list The list to reverse.
	     * @return {Array} A copy of the list in reverse order.
	     * @example
	     *
	     *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
	     *      R.reverse([1, 2]);     //=> [2, 1]
	     *      R.reverse([1]);        //=> [1]
	     *      R.reverse([]);         //=> []
	     */
	    var reverse = _curry1(function reverse(list) {
	        return _slice(list).reverse();
	    });
	
	    /**
	     * Scan is similar to reduce, but returns a list of successively reduced values from the left
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a,b -> a) -> a -> [b] -> [a]
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {Array} A list of all intermediately reduced values.
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
	     */
	    var scan = _curry3(function scan(fn, acc, list) {
	        var idx = 0, len = list.length, result = [acc];
	        while (idx < len) {
	            acc = fn(acc, list[idx]);
	            result[idx + 1] = acc;
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Returns the result of "setting" the portion of the given data structure
	     * focused by the given lens to the given value.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> a -> s -> s
	     * @param {Lens} lens
	     * @param {*} v
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
	     *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
	     */
	    var set = _curry3(function set(lens, v, x) {
	        return over(lens, always(v), x);
	    });
	
	    /**
	     * Returns a copy of the list, sorted according to the comparator function, which should accept two values at a
	     * time and return a negative number if the first value is smaller, a positive number if it's larger, and zero
	     * if they are equal.  Please note that this is a **copy** of the list.  It does not modify the original.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a,a -> Number) -> [a] -> [a]
	     * @param {Function} comparator A sorting function :: a -> b -> Int
	     * @param {Array} list The list to sort
	     * @return {Array} a new array with its elements sorted by the comparator function.
	     * @example
	     *
	     *      var diff = function(a, b) { return a - b; };
	     *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
	     */
	    var sort = _curry2(function sort(comparator, list) {
	        return _slice(list).sort(comparator);
	    });
	
	    /**
	     * Sorts the list according to the supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig Ord b => (a -> b) -> [a] -> [a]
	     * @param {Function} fn
	     * @param {Array} list The list to sort.
	     * @return {Array} A new list sorted by the keys generated by `fn`.
	     * @example
	     *
	     *      var sortByFirstItem = R.sortBy(prop(0));
	     *      var sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
	     *      var pairs = [[-1, 1], [-2, 2], [-3, 3]];
	     *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
	     *      var alice = {
	     *        name: 'ALICE',
	     *        age: 101
	     *      };
	     *      var bob = {
	     *        name: 'Bob',
	     *        age: -10
	     *      };
	     *      var clara = {
	     *        name: 'clara',
	     *        age: 314.159
	     *      };
	     *      var people = [clara, bob, alice];
	     *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
	     */
	    var sortBy = _curry2(function sortBy(fn, list) {
	        return _slice(list).sort(function (a, b) {
	            var aa = fn(a);
	            var bb = fn(b);
	            return aa < bb ? -1 : aa > bb ? 1 : 0;
	        });
	    });
	
	    /**
	     * Subtracts two numbers. Equivalent to `a - b` but curried.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a - b`.
	     * @see R.add
	     * @example
	     *
	     *      R.subtract(10, 8); //=> 2
	     *
	     *      var minus5 = R.subtract(R.__, 5);
	     *      minus5(17); //=> 12
	     *
	     *      var complementaryAngle = R.subtract(90);
	     *      complementaryAngle(30); //=> 60
	     *      complementaryAngle(72); //=> 18
	     */
	    var subtract = _curry2(function subtract(a, b) {
	        return a - b;
	    });
	
	    /**
	     * Returns a new list containing the last `n` elements of a given list, passing each value
	     * to the supplied predicate function, and terminating when the predicate function returns
	     * `false`. Excludes the element that caused the predicate function to fail. The predicate
	     * function is passed one argument: *(value)*.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.dropLastWhile
	     * @example
	     *
	     *      var isNotOne = function(x) {
	     *        return !(x === 1);
	     *      };
	     *
	     *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
	     */
	    var takeLastWhile = _curry2(function takeLastWhile(fn, list) {
	        var idx = list.length - 1;
	        while (idx >= 0 && fn(list[idx])) {
	            idx -= 1;
	        }
	        return _slice(list, idx + 1, Infinity);
	    });
	
	    /**
	     * Runs the given function with the supplied object, then returns the object.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a -> *) -> a -> a
	     * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
	     * @param {*} x
	     * @return {*} `x`.
	     * @example
	     *
	     *      var sayX = function(x) { console.log('x is ' + x); };
	     *      R.tap(sayX, 100); //=> 100
	     *      //-> 'x is 100'
	     */
	    var tap = _curry2(function tap(fn, x) {
	        fn(x);
	        return x;
	    });
	
	    /**
	     * Determines whether a given string matches a given regular expression.
	     *
	     * @func
	     * @memberOf R
	     * @see R.match
	     * @category String
	     * @sig RegExp -> String -> Boolean
	     * @param {RegExp} pattern
	     * @param {String} str
	     * @return {Boolean}
	     * @example
	     *
	     *      R.test(/^x/, 'xyz'); //=> true
	     *      R.test(/^y/, 'xyz'); //=> false
	     */
	    var test = _curry2(function test(pattern, str) {
	        return _cloneRegExp(pattern).test(str);
	    });
	
	    /**
	     * Calls an input function `n` times, returning an array containing the results of those
	     * function calls.
	     *
	     * `fn` is passed one argument: The current value of `n`, which begins at `0` and is
	     * gradually incremented to `n - 1`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (i -> a) -> i -> [a]
	     * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
	     * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
	     * @return {Array} An array containing the return values of all calls to `fn`.
	     * @example
	     *
	     *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
	     */
	    var times = _curry2(function times(fn, n) {
	        var len = Number(n);
	        var list = new Array(len);
	        var idx = 0;
	        while (idx < len) {
	            list[idx] = fn(idx);
	            idx += 1;
	        }
	        return list;
	    });
	
	    /**
	     * Converts an object into an array of key, value arrays.
	     * Only the object's own properties are used.
	     * Note that the order of the output array is not guaranteed to be
	     * consistent across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {String: *} -> [[String,*]]
	     * @param {Object} obj The object to extract from
	     * @return {Array} An array of key, value arrays from the object's own properties.
	     * @see R.fromPairs
	     * @example
	     *
	     *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
	     */
	    var toPairs = _curry1(function toPairs(obj) {
	        var pairs = [];
	        for (var prop in obj) {
	            if (_has(prop, obj)) {
	                pairs[pairs.length] = [
	                    prop,
	                    obj[prop]
	                ];
	            }
	        }
	        return pairs;
	    });
	
	    /**
	     * Converts an object into an array of key, value arrays.
	     * The object's own properties and prototype properties are used.
	     * Note that the order of the output array is not guaranteed to be
	     * consistent across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {String: *} -> [[String,*]]
	     * @param {Object} obj The object to extract from
	     * @return {Array} An array of key, value arrays from the object's own
	     *         and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
	     */
	    var toPairsIn = _curry1(function toPairsIn(obj) {
	        var pairs = [];
	        for (var prop in obj) {
	            pairs[pairs.length] = [
	                prop,
	                obj[prop]
	            ];
	        }
	        return pairs;
	    });
	
	    /**
	     * Removes (strips) whitespace from both ends of the string.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to trim.
	     * @return {String} Trimmed version of `str`.
	     * @example
	     *
	     *      R.trim('   xyz  '); //=> 'xyz'
	     *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
	     */
	    var trim = function () {
	        var ws = '\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
	        var zeroWidth = '\u200B';
	        var hasProtoTrim = typeof String.prototype.trim === 'function';
	        if (!hasProtoTrim || (ws.trim() || !zeroWidth.trim())) {
	            return _curry1(function trim(str) {
	                var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
	                var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
	                return str.replace(beginRx, '').replace(endRx, '');
	            });
	        } else {
	            return _curry1(function trim(str) {
	                return str.trim();
	            });
	        }
	    }();
	
	    /**
	     * Gives a single-word string description of the (native) type of a value, returning such
	     * answers as 'Object', 'Number', 'Array', or 'Null'.  Does not attempt to distinguish user
	     * Object types any further, reporting them all as 'Object'.
	     *
	     * @func
	     * @memberOf R
	     * @category Type
	     * @sig (* -> {*}) -> String
	     * @param {*} val The value to test
	     * @return {String}
	     * @example
	     *
	     *      R.type({}); //=> "Object"
	     *      R.type(1); //=> "Number"
	     *      R.type(false); //=> "Boolean"
	     *      R.type('s'); //=> "String"
	     *      R.type(null); //=> "Null"
	     *      R.type([]); //=> "Array"
	     *      R.type(/[A-z]/); //=> "RegExp"
	     */
	    var type = _curry1(function type(val) {
	        return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
	    });
	
	    /**
	     * Takes a function `fn`, which takes a single array argument, and returns
	     * a function which:
	     *
	     *   - takes any number of positional arguments;
	     *   - passes these arguments to `fn` as an array; and
	     *   - returns the result.
	     *
	     * In other words, R.unapply derives a variadic function from a function
	     * which takes an array. R.unapply is the inverse of R.apply.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig ([*...] -> a) -> (*... -> a)
	     * @param {Function} fn
	     * @return {Function}
	     * @see R.apply
	     * @example
	     *
	     *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
	     */
	    var unapply = _curry1(function unapply(fn) {
	        return function () {
	            return fn(_slice(arguments));
	        };
	    });
	
	    /**
	     * Wraps a function of any arity (including nullary) in a function that accepts exactly 1
	     * parameter. Any extraneous parameters will not be passed to the supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (* -> b) -> (a -> b)
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity 1.
	     * @example
	     *
	     *      var takesTwoArgs = function(a, b) {
	     *        return [a, b];
	     *      };
	     *      takesTwoArgs.length; //=> 2
	     *      takesTwoArgs(1, 2); //=> [1, 2]
	     *
	     *      var takesOneArg = R.unary(takesTwoArgs);
	     *      takesOneArg.length; //=> 1
	     *      // Only 1 argument is passed to the wrapped function
	     *      takesOneArg(1, 2); //=> [1, undefined]
	     */
	    var unary = _curry1(function unary(fn) {
	        return nAry(1, fn);
	    });
	
	    /**
	     * Returns a function of arity `n` from a (manually) curried function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> (a -> b) -> (a -> c)
	     * @param {Number} length The arity for the returned function.
	     * @param {Function} fn The function to uncurry.
	     * @return {Function} A new function.
	     * @see R.curry
	     * @example
	     *
	     *      var addFour = function(a) {
	     *        return function(b) {
	     *          return function(c) {
	     *            return function(d) {
	     *              return a + b + c + d;
	     *            };
	     *          };
	     *        };
	     *      };
	     *
	     *      var uncurriedAddFour = R.uncurryN(4, addFour);
	     *      curriedAddFour(1, 2, 3, 4); //=> 10
	     */
	    var uncurryN = _curry2(function uncurryN(depth, fn) {
	        return curryN(depth, function () {
	            var currentDepth = 1;
	            var value = fn;
	            var idx = 0;
	            var endIdx;
	            while (currentDepth <= depth && typeof value === 'function') {
	                endIdx = currentDepth === depth ? arguments.length : idx + value.length;
	                value = value.apply(this, _slice(arguments, idx, endIdx));
	                currentDepth += 1;
	                idx = endIdx;
	            }
	            return value;
	        });
	    });
	
	    /**
	     * Builds a list from a seed value. Accepts an iterator function, which returns either false
	     * to stop iteration or an array of length 2 containing the value to add to the resulting
	     * list and the seed to be used in the next call to the iterator function.
	     *
	     * The iterator function receives one argument: *(seed)*.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> [b]) -> * -> [b]
	     * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
	     *        either false to quit iteration or an array of length two to proceed. The element
	     *        at index 0 of this array will be added to the resulting array, and the element
	     *        at index 1 will be passed to the next call to `fn`.
	     * @param {*} seed The seed value.
	     * @return {Array} The final list.
	     * @example
	     *
	     *      var f = function(n) { return n > 50 ? false : [-n, n + 10] };
	     *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
	     */
	    var unfold = _curry2(function unfold(fn, seed) {
	        var pair = fn(seed);
	        var result = [];
	        while (pair && pair.length) {
	            result[result.length] = pair[0];
	            pair = fn(pair[1]);
	        }
	        return result;
	    });
	
	    /**
	     * Returns a new list containing only one copy of each element in the original list, based
	     * upon the value returned by applying the supplied predicate to two list elements. Prefers
	     * the first item if two items compare equal based on the predicate.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a, a -> Boolean) -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      var strEq = function(a, b) { return String(a) === String(b); };
	     *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
	     *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
	     *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
	     *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
	     */
	    var uniqWith = _curry2(function uniqWith(pred, list) {
	        var idx = 0, len = list.length;
	        var result = [], item;
	        while (idx < len) {
	            item = list[idx];
	            if (!_containsWith(pred, item, result)) {
	                result[result.length] = item;
	            }
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Returns a new copy of the array with the element at the
	     * provided index replaced with the given value.
	     * @see R.adjust
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> a -> [a] -> [a]
	     * @param {Number} idx The index to update.
	     * @param {*} x The value to exist at the given index of the returned array.
	     * @param {Array|Arguments} list The source array-like object to be updated.
	     * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
	     * @example
	     *
	     *      R.update(1, 11, [0, 1, 2]);     //=> [0, 11, 2]
	     *      R.update(1)(11)([0, 1, 2]);     //=> [0, 11, 2]
	     */
	    var update = _curry3(function update(idx, x, list) {
	        return adjust(always(x), idx, list);
	    });
	
	    /**
	     * Returns a list of all the enumerable own properties of the supplied object.
	     * Note that the order of the output array is not guaranteed across
	     * different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: v} -> [v]
	     * @param {Object} obj The object to extract values from
	     * @return {Array} An array of the values of the object's own properties.
	     * @example
	     *
	     *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
	     */
	    var values = _curry1(function values(obj) {
	        var props = keys(obj);
	        var len = props.length;
	        var vals = [];
	        var idx = 0;
	        while (idx < len) {
	            vals[idx] = obj[props[idx]];
	            idx += 1;
	        }
	        return vals;
	    });
	
	    /**
	     * Returns a list of all the properties, including prototype properties,
	     * of the supplied object.
	     * Note that the order of the output array is not guaranteed to be
	     * consistent across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {k: v} -> [v]
	     * @param {Object} obj The object to extract values from
	     * @return {Array} An array of the values of the object's own and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.valuesIn(f); //=> ['X', 'Y']
	     */
	    var valuesIn = _curry1(function valuesIn(obj) {
	        var prop, vs = [];
	        for (prop in obj) {
	            vs[vs.length] = obj[prop];
	        }
	        return vs;
	    });
	
	    /**
	     * Returns a "view" of the given data structure, determined by the given lens.
	     * The lens's focus determines which portion of the data structure is visible.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> s -> a
	     * @param {Lens} lens
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.view(xLens, {x: 1, y: 2});  //=> 1
	     *      R.view(xLens, {x: 4, y: 2});  //=> 4
	     */
	    var view = function () {
	        var Const = function (x) {
	            return {
	                value: x,
	                map: function () {
	                    return this;
	                }
	            };
	        };
	        return _curry2(function view(lens, x) {
	            return lens(Const)(x).value;
	        });
	    }();
	
	    /**
	     * Takes a spec object and a test object; returns true if the test satisfies
	     * the spec. Each of the spec's own properties must be a predicate function.
	     * Each predicate is applied to the value of the corresponding property of
	     * the test object. `where` returns true if all the predicates return true,
	     * false otherwise.
	     *
	     * `where` is well suited to declaratively expressing constraints for other
	     * functions such as `filter` and `find`.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
	     * @param {Object} spec
	     * @param {Object} testObj
	     * @return {Boolean}
	     * @example
	     *
	     *      // pred :: Object -> Boolean
	     *      var pred = R.where({
	     *        a: R.equals('foo'),
	     *        b: R.complement(R.equals('bar')),
	     *        x: R.gt(_, 10),
	     *        y: R.lt(_, 20)
	     *      });
	     *
	     *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
	     *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
	     */
	    var where = _curry2(function where(spec, testObj) {
	        for (var prop in spec) {
	            if (_has(prop, spec) && !spec[prop](testObj[prop])) {
	                return false;
	            }
	        }
	        return true;
	    });
	
	    /**
	     * Wrap a function inside another to allow you to make adjustments to the parameters, or do
	     * other processing either before the internal function is called or with its results.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a... -> b) -> ((a... -> b) -> a... -> c) -> (a... -> c)
	     * @param {Function} fn The function to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @return {Function} The wrapped function.
	     * @example
	     *
	     *      var greet = function(name) {return 'Hello ' + name;};
	     *
	     *      var shoutedGreet = R.wrap(greet, function(gr, name) {
	     *        return gr(name).toUpperCase();
	     *      });
	     *      shoutedGreet("Kathy"); //=> "HELLO KATHY"
	     *
	     *      var shortenedGreet = R.wrap(greet, function(gr, name) {
	     *        return gr(name.substring(0, 3));
	     *      });
	     *      shortenedGreet("Robert"); //=> "Hello Rob"
	     */
	    var wrap = _curry2(function wrap(fn, wrapper) {
	        return curryN(fn.length, function () {
	            return wrapper.apply(this, _concat([fn], arguments));
	        });
	    });
	
	    /**
	     * Creates a new list out of the two supplied by creating each possible
	     * pair from the lists.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [b] -> [[a,b]]
	     * @param {Array} as The first list.
	     * @param {Array} bs The second list.
	     * @return {Array} The list made by combining each possible pair from
	     *         `as` and `bs` into pairs (`[a, b]`).
	     * @example
	     *
	     *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
	     */
	    // = xprodWith(prepend); (takes about 3 times as long...)
	    var xprod = _curry2(function xprod(a, b) {
	        // = xprodWith(prepend); (takes about 3 times as long...)
	        var idx = 0;
	        var ilen = a.length;
	        var j;
	        var jlen = b.length;
	        var result = [];
	        while (idx < ilen) {
	            j = 0;
	            while (j < jlen) {
	                result[result.length] = [
	                    a[idx],
	                    b[j]
	                ];
	                j += 1;
	            }
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Creates a new list out of the two supplied by pairing up
	     * equally-positioned items from both lists.  The returned list is
	     * truncated to the length of the shorter of the two input lists.
	     * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [b] -> [[a,b]]
	     * @param {Array} list1 The first array to consider.
	     * @param {Array} list2 The second array to consider.
	     * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
	     * @example
	     *
	     *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
	     */
	    var zip = _curry2(function zip(a, b) {
	        var rv = [];
	        var idx = 0;
	        var len = Math.min(a.length, b.length);
	        while (idx < len) {
	            rv[idx] = [
	                a[idx],
	                b[idx]
	            ];
	            idx += 1;
	        }
	        return rv;
	    });
	
	    /**
	     * Creates a new object out of a list of keys and a list of values.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [String] -> [*] -> {String: *}
	     * @param {Array} keys The array that will be properties on the output object.
	     * @param {Array} values The list of values on the output object.
	     * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
	     * @example
	     *
	     *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
	     */
	    var zipObj = _curry2(function zipObj(keys, values) {
	        var idx = 0, len = keys.length, out = {};
	        while (idx < len) {
	            out[keys[idx]] = values[idx];
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Creates a new list out of the two supplied by applying the function to
	     * each equally-positioned pair in the lists. The returned list is
	     * truncated to the length of the shorter of the two input lists.
	     *
	     * @function
	     * @memberOf R
	     * @category List
	     * @sig (a,b -> c) -> [a] -> [b] -> [c]
	     * @param {Function} fn The function used to combine the two elements into one value.
	     * @param {Array} list1 The first array to consider.
	     * @param {Array} list2 The second array to consider.
	     * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
	     *         using `fn`.
	     * @example
	     *
	     *      var f = function(x, y) {
	     *        // ...
	     *      };
	     *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
	     *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
	     */
	    var zipWith = _curry3(function zipWith(fn, a, b) {
	        var rv = [], idx = 0, len = Math.min(a.length, b.length);
	        while (idx < len) {
	            rv[idx] = fn(a[idx], b[idx]);
	            idx += 1;
	        }
	        return rv;
	    });
	
	    /**
	     * A function that always returns `false`. Any passed in parameters are ignored.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig * -> false
	     * @return {Boolean} false
	     * @see R.always, R.T
	     * @example
	     *
	     *      R.F(); //=> false
	     */
	    var F = always(false);
	
	    /**
	     * A function that always returns `true`. Any passed in parameters are ignored.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig * -> true
	     * @return {Boolean} `true`.
	     * @see R.always, R.F
	     * @example
	     *
	     *      R.T(); //=> true
	     */
	    var T = always(true);
	
	    /**
	     * Similar to hasMethod, this checks whether a function has a [methodname]
	     * function. If it isn't an array it will execute that function otherwise it will
	     * default to the ramda implementation.
	     *
	     * @private
	     * @param {Function} fn ramda implemtation
	     * @param {String} methodname property to check for a custom implementation
	     * @return {Object} Whatever the return value of the method is.
	     */
	    var _checkForMethod = function _checkForMethod(methodname, fn) {
	        return function () {
	            var length = arguments.length;
	            if (length === 0) {
	                return fn();
	            }
	            var obj = arguments[length - 1];
	            return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
	        };
	    };
	
	    /**
	     * Copies an object.
	     *
	     * @private
	     * @param {*} value The value to be copied
	     * @param {Array} refFrom Array containing the source references
	     * @param {Array} refTo Array containing the copied source references
	     * @return {*} The copied value.
	     */
	    var _clone = function _clone(value, refFrom, refTo) {
	        var copy = function copy(copiedValue) {
	            var len = refFrom.length;
	            var idx = 0;
	            while (idx < len) {
	                if (value === refFrom[idx]) {
	                    return refTo[idx];
	                }
	                idx += 1;
	            }
	            refFrom[idx + 1] = value;
	            refTo[idx + 1] = copiedValue;
	            for (var key in value) {
	                copiedValue[key] = _clone(value[key], refFrom, refTo);
	            }
	            return copiedValue;
	        };
	        switch (type(value)) {
	        case 'Object':
	            return copy({});
	        case 'Array':
	            return copy([]);
	        case 'Date':
	            return new Date(value);
	        case 'RegExp':
	            return _cloneRegExp(value);
	        default:
	            return value;
	        }
	    };
	
	    var _createPartialApplicator = function _createPartialApplicator(concat) {
	        return function (fn) {
	            var args = _slice(arguments, 1);
	            return _arity(Math.max(0, fn.length - args.length), function () {
	                return fn.apply(this, concat(args, arguments));
	            });
	        };
	    };
	
	    /**
	     * Returns a function that dispatches with different strategies based on the
	     * object in list position (last argument). If it is an array, executes [fn].
	     * Otherwise, if it has a  function with [methodname], it will execute that
	     * function (functor case). Otherwise, if it is a transformer, uses transducer
	     * [xf] to return a new transformer (transducer case). Otherwise, it will
	     * default to executing [fn].
	     *
	     * @private
	     * @param {String} methodname property to check for a custom implementation
	     * @param {Function} xf transducer to initialize if object is transformer
	     * @param {Function} fn default ramda implementation
	     * @return {Function} A function that dispatches on object in list position
	     */
	    var _dispatchable = function _dispatchable(methodname, xf, fn) {
	        return function () {
	            var length = arguments.length;
	            if (length === 0) {
	                return fn();
	            }
	            var obj = arguments[length - 1];
	            if (!_isArray(obj)) {
	                var args = _slice(arguments, 0, length - 1);
	                if (typeof obj[methodname] === 'function') {
	                    return obj[methodname].apply(obj, args);
	                }
	                if (_isTransformer(obj)) {
	                    var transducer = xf.apply(null, args);
	                    return transducer(obj);
	                }
	            }
	            return fn.apply(this, arguments);
	        };
	    };
	
	    // The algorithm used to handle cyclic structures is
	    // inspired by underscore's isEqual
	    // RegExp equality algorithm: http://stackoverflow.com/a/10776635
	    var _equals = function _equals(a, b, stackA, stackB) {
	        var typeA = type(a);
	        if (typeA !== type(b)) {
	            return false;
	        }
	        if (typeA === 'Boolean' || typeA === 'Number' || typeA === 'String') {
	            return typeof a === 'object' ? typeof b === 'object' && identical(a.valueOf(), b.valueOf()) : identical(a, b);
	        }
	        if (identical(a, b)) {
	            return true;
	        }
	        if (typeA === 'RegExp') {
	            // RegExp equality algorithm: http://stackoverflow.com/a/10776635
	            return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode;
	        }
	        if (Object(a) === a) {
	            if (typeA === 'Date' && a.getTime() !== b.getTime()) {
	                return false;
	            }
	            var keysA = keys(a);
	            if (keysA.length !== keys(b).length) {
	                return false;
	            }
	            var idx = stackA.length - 1;
	            while (idx >= 0) {
	                if (stackA[idx] === a) {
	                    return stackB[idx] === b;
	                }
	                idx -= 1;
	            }
	            stackA[stackA.length] = a;
	            stackB[stackB.length] = b;
	            idx = keysA.length - 1;
	            while (idx >= 0) {
	                var key = keysA[idx];
	                if (!_has(key, b) || !_equals(b[key], a[key], stackA, stackB)) {
	                    return false;
	                }
	                idx -= 1;
	            }
	            stackA.pop();
	            stackB.pop();
	            return true;
	        }
	        return false;
	    };
	
	    /**
	     * Private function that determines whether or not a provided object has a given method.
	     * Does not ignore methods stored on the object's prototype chain. Used for dynamically
	     * dispatching Ramda methods to non-Array objects.
	     *
	     * @private
	     * @param {String} methodName The name of the method to check for.
	     * @param {Object} obj The object to test.
	     * @return {Boolean} `true` has a given method, `false` otherwise.
	     * @example
	     *
	     *      var person = { name: 'John' };
	     *      person.shout = function() { alert(this.name); };
	     *
	     *      _hasMethod('shout', person); //=> true
	     *      _hasMethod('foo', person); //=> false
	     */
	    var _hasMethod = function _hasMethod(methodName, obj) {
	        return obj != null && !_isArray(obj) && typeof obj[methodName] === 'function';
	    };
	
	    /**
	     * `_makeFlat` is a helper function that returns a one-level or fully recursive function
	     * based on the flag passed in.
	     *
	     * @private
	     */
	    var _makeFlat = function _makeFlat(recursive) {
	        return function flatt(list) {
	            var value, result = [], idx = 0, j, ilen = list.length, jlen;
	            while (idx < ilen) {
	                if (isArrayLike(list[idx])) {
	                    value = recursive ? flatt(list[idx]) : list[idx];
	                    j = 0;
	                    jlen = value.length;
	                    while (j < jlen) {
	                        result[result.length] = value[j];
	                        j += 1;
	                    }
	                } else {
	                    result[result.length] = list[idx];
	                }
	                idx += 1;
	            }
	            return result;
	        };
	    };
	
	    var _reduce = function () {
	        function _arrayReduce(xf, acc, list) {
	            var idx = 0, len = list.length;
	            while (idx < len) {
	                acc = xf['@@transducer/step'](acc, list[idx]);
	                if (acc && acc['@@transducer/reduced']) {
	                    acc = acc['@@transducer/value'];
	                    break;
	                }
	                idx += 1;
	            }
	            return xf['@@transducer/result'](acc);
	        }
	        function _iterableReduce(xf, acc, iter) {
	            var step = iter.next();
	            while (!step.done) {
	                acc = xf['@@transducer/step'](acc, step.value);
	                if (acc && acc['@@transducer/reduced']) {
	                    acc = acc['@@transducer/value'];
	                    break;
	                }
	                step = iter.next();
	            }
	            return xf['@@transducer/result'](acc);
	        }
	        function _methodReduce(xf, acc, obj) {
	            return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));
	        }
	        var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
	        return function _reduce(fn, acc, list) {
	            if (typeof fn === 'function') {
	                fn = _xwrap(fn);
	            }
	            if (isArrayLike(list)) {
	                return _arrayReduce(fn, acc, list);
	            }
	            if (typeof list.reduce === 'function') {
	                return _methodReduce(fn, acc, list);
	            }
	            if (list[symIterator] != null) {
	                return _iterableReduce(fn, acc, list[symIterator]());
	            }
	            if (typeof list.next === 'function') {
	                return _iterableReduce(fn, acc, list);
	            }
	            throw new TypeError('reduce: list must be array or iterable');
	        };
	    }();
	
	    var _stepCat = function () {
	        var _stepCatArray = {
	            '@@transducer/init': Array,
	            '@@transducer/step': function (xs, x) {
	                return _concat(xs, [x]);
	            },
	            '@@transducer/result': _identity
	        };
	        var _stepCatString = {
	            '@@transducer/init': String,
	            '@@transducer/step': function (a, b) {
	                return a + b;
	            },
	            '@@transducer/result': _identity
	        };
	        var _stepCatObject = {
	            '@@transducer/init': Object,
	            '@@transducer/step': function (result, input) {
	                return merge(result, isArrayLike(input) ? createMapEntry(input[0], input[1]) : input);
	            },
	            '@@transducer/result': _identity
	        };
	        return function _stepCat(obj) {
	            if (_isTransformer(obj)) {
	                return obj;
	            }
	            if (isArrayLike(obj)) {
	                return _stepCatArray;
	            }
	            if (typeof obj === 'string') {
	                return _stepCatString;
	            }
	            if (typeof obj === 'object') {
	                return _stepCatObject;
	            }
	            throw new Error('Cannot create transformer for ' + obj);
	        };
	    }();
	
	    var _xall = function () {
	        function XAll(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.all = true;
	        }
	        XAll.prototype['@@transducer/init'] = _xfBase.init;
	        XAll.prototype['@@transducer/result'] = function (result) {
	            if (this.all) {
	                result = this.xf['@@transducer/step'](result, true);
	            }
	            return this.xf['@@transducer/result'](result);
	        };
	        XAll.prototype['@@transducer/step'] = function (result, input) {
	            if (!this.f(input)) {
	                this.all = false;
	                result = _reduced(this.xf['@@transducer/step'](result, false));
	            }
	            return result;
	        };
	        return _curry2(function _xall(f, xf) {
	            return new XAll(f, xf);
	        });
	    }();
	
	    var _xany = function () {
	        function XAny(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.any = false;
	        }
	        XAny.prototype['@@transducer/init'] = _xfBase.init;
	        XAny.prototype['@@transducer/result'] = function (result) {
	            if (!this.any) {
	                result = this.xf['@@transducer/step'](result, false);
	            }
	            return this.xf['@@transducer/result'](result);
	        };
	        XAny.prototype['@@transducer/step'] = function (result, input) {
	            if (this.f(input)) {
	                this.any = true;
	                result = _reduced(this.xf['@@transducer/step'](result, true));
	            }
	            return result;
	        };
	        return _curry2(function _xany(f, xf) {
	            return new XAny(f, xf);
	        });
	    }();
	
	    var _xdrop = function () {
	        function XDrop(n, xf) {
	            this.xf = xf;
	            this.n = n;
	        }
	        XDrop.prototype['@@transducer/init'] = _xfBase.init;
	        XDrop.prototype['@@transducer/result'] = _xfBase.result;
	        XDrop.prototype['@@transducer/step'] = function (result, input) {
	            if (this.n > 0) {
	                this.n -= 1;
	                return result;
	            }
	            return this.xf['@@transducer/step'](result, input);
	        };
	        return _curry2(function _xdrop(n, xf) {
	            return new XDrop(n, xf);
	        });
	    }();
	
	    var _xdropWhile = function () {
	        function XDropWhile(f, xf) {
	            this.xf = xf;
	            this.f = f;
	        }
	        XDropWhile.prototype['@@transducer/init'] = _xfBase.init;
	        XDropWhile.prototype['@@transducer/result'] = _xfBase.result;
	        XDropWhile.prototype['@@transducer/step'] = function (result, input) {
	            if (this.f) {
	                if (this.f(input)) {
	                    return result;
	                }
	                this.f = null;
	            }
	            return this.xf['@@transducer/step'](result, input);
	        };
	        return _curry2(function _xdropWhile(f, xf) {
	            return new XDropWhile(f, xf);
	        });
	    }();
	
	    var _xgroupBy = function () {
	        function XGroupBy(f, xf) {
	            this.xf = xf;
	            this.f = f;
	            this.inputs = {};
	        }
	        XGroupBy.prototype['@@transducer/init'] = _xfBase.init;
	        XGroupBy.prototype['@@transducer/result'] = function (result) {
	            var key;
	            for (key in this.inputs) {
	                if (_has(key, this.inputs)) {
	                    result = this.xf['@@transducer/step'](result, this.inputs[key]);
	                    if (result['@@transducer/reduced']) {
	                        result = result['@@transducer/value'];
	                        break;
	                    }
	                }
	            }
	            return this.xf['@@transducer/result'](result);
	        };
	        XGroupBy.prototype['@@transducer/step'] = function (result, input) {
	            var key = this.f(input);
	            this.inputs[key] = this.inputs[key] || [
	                key,
	                []
	            ];
	            this.inputs[key][1] = append(input, this.inputs[key][1]);
	            return result;
	        };
	        return _curry2(function _xgroupBy(f, xf) {
	            return new XGroupBy(f, xf);
	        });
	    }();
	
	    /**
	     * Creates a new list iteration function from an existing one by adding two new parameters
	     * to its callback function: the current index, and the entire list.
	     *
	     * This would turn, for instance, Ramda's simple `map` function into one that more closely
	     * resembles `Array.prototype.map`.  Note that this will only work for functions in which
	     * the iteration callback function is the first parameter, and where the list is the last
	     * parameter.  (This latter might be unimportant if the list parameter is not used.)
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @category List
	     * @sig ((a ... -> b) ... -> [a] -> *) -> (a ..., Int, [a] -> b) ... -> [a] -> *)
	     * @param {Function} fn A list iteration function that does not pass index or list to its callback
	     * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
	     * @example
	     *
	     *      var mapIndexed = R.addIndex(R.map);
	     *      mapIndexed(function(val, idx) {return idx + '-' + val;}, ['f', 'o', 'o', 'b', 'a', 'r']);
	     *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
	     */
	    var addIndex = _curry1(function addIndex(fn) {
	        return curryN(fn.length, function () {
	            var idx = 0;
	            var origFn = arguments[0];
	            var list = arguments[arguments.length - 1];
	            var args = _slice(arguments);
	            args[0] = function () {
	                var result = origFn.apply(this, _concat(arguments, [
	                    idx,
	                    list
	                ]));
	                idx += 1;
	                return result;
	            };
	            return fn.apply(this, args);
	        });
	    });
	
	    /**
	     * Returns `true` if all elements of the list match the predicate, `false` if there are any
	     * that don't.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
	     *         otherwise.
	     * @see R.any, R.none
	     * @example
	     *
	     *      var lessThan2 = R.flip(R.lt)(2);
	     *      var lessThan3 = R.flip(R.lt)(3);
	     *      R.all(lessThan2)([1, 2]); //=> false
	     *      R.all(lessThan3)([1, 2]); //=> true
	     */
	    var all = _curry2(_dispatchable('all', _xall, function all(fn, list) {
	        var idx = 0;
	        while (idx < list.length) {
	            if (!fn(list[idx])) {
	                return false;
	            }
	            idx += 1;
	        }
	        return true;
	    }));
	
	    /**
	     * A function that returns the first argument if it's falsy otherwise the second
	     * argument. Note that this is NOT short-circuited, meaning that if expressions
	     * are passed they are both evaluated.
	     *
	     * Dispatches to the `and` method of the first argument if applicable.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig * -> * -> *
	     * @param {*} a any value
	     * @param {*} b any other value
	     * @return {*} the first argument if falsy otherwise the second argument.
	     * @see R.both
	     * @example
	     *
	     *      R.and(false, true); //=> false
	     *      R.and(0, []); //=> 0
	     *      R.and(null, ''); => null
	     */
	    var and = _curry2(function and(a, b) {
	        return _hasMethod('and', a) ? a.and(b) : a && b;
	    });
	
	    /**
	     * Returns `true` if at least one of elements of the list match the predicate, `false`
	     * otherwise.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
	     *         otherwise.
	     * @see R.all, R.none
	     * @example
	     *
	     *      var lessThan0 = R.flip(R.lt)(0);
	     *      var lessThan2 = R.flip(R.lt)(2);
	     *      R.any(lessThan0)([1, 2]); //=> false
	     *      R.any(lessThan2)([1, 2]); //=> true
	     */
	    var any = _curry2(_dispatchable('any', _xany, function any(fn, list) {
	        var idx = 0;
	        while (idx < list.length) {
	            if (fn(list[idx])) {
	                return true;
	            }
	            idx += 1;
	        }
	        return false;
	    }));
	
	    /**
	     * Wraps a function of any arity (including nullary) in a function that accepts exactly 2
	     * parameters. Any extraneous parameters will not be passed to the supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (* -> c) -> (a, b -> c)
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity 2.
	     * @example
	     *
	     *      var takesThreeArgs = function(a, b, c) {
	     *        return [a, b, c];
	     *      };
	     *      takesThreeArgs.length; //=> 3
	     *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
	     *
	     *      var takesTwoArgs = R.binary(takesThreeArgs);
	     *      takesTwoArgs.length; //=> 2
	     *      // Only 2 arguments are passed to the wrapped function
	     *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
	     */
	    var binary = _curry1(function binary(fn) {
	        return nAry(2, fn);
	    });
	
	    /**
	     * Creates a deep copy of the value which may contain (nested) `Array`s and
	     * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
	     * not copied, but assigned by their reference.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {*} -> {*}
	     * @param {*} value The object or array to clone
	     * @return {*} A new object or array.
	     * @example
	     *
	     *      var objects = [{}, {}, {}];
	     *      var objectsClone = R.clone(objects);
	     *      objects[0] === objectsClone[0]; //=> false
	     */
	    var clone = _curry1(function clone(value) {
	        return _clone(value, [], []);
	    });
	
	    /**
	     * Returns a new list consisting of the elements of the first list followed by the elements
	     * of the second.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [a] -> [a]
	     * @param {Array} list1 The first list to merge.
	     * @param {Array} list2 The second set to merge.
	     * @return {Array} A new array consisting of the contents of `list1` followed by the
	     *         contents of `list2`. If, instead of an Array for `list1`, you pass an
	     *         object with a `concat` method on it, `concat` will call `list1.concat`
	     *         and pass it the value of `list2`.
	     *
	     * @example
	     *
	     *      R.concat([], []); //=> []
	     *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     *      R.concat('ABC', 'DEF'); // 'ABCDEF'
	     */
	    var concat = _curry2(function concat(set1, set2) {
	        if (_isArray(set2)) {
	            return _concat(set1, set2);
	        } else if (_hasMethod('concat', set1)) {
	            return set1.concat(set2);
	        } else {
	            throw new TypeError('can\'t concat ' + typeof set1);
	        }
	    });
	
	    /**
	     * Returns a curried equivalent of the provided function. The curried
	     * function has two unusual capabilities. First, its arguments needn't
	     * be provided one at a time. If `f` is a ternary function and `g` is
	     * `R.curry(f)`, the following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`,
	     * the following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (* -> a) -> (* -> a)
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curryN
	     * @example
	     *
	     *      var addFourNumbers = function(a, b, c, d) {
	     *        return a + b + c + d;
	     *      };
	     *
	     *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */
	    var curry = _curry1(function curry(fn) {
	        return curryN(fn.length, fn);
	    });
	
	    /**
	     * Returns a new list containing the last `n` elements of a given list, passing each value
	     * to the supplied predicate function, skipping elements while the predicate function returns
	     * `true`. The predicate function is passed one argument: *(value)*.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.takeWhile
	     * @example
	     *
	     *      var lteTwo = function(x) {
	     *        return x <= 2;
	     *      };
	     *
	     *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
	     */
	    var dropWhile = _curry2(_dispatchable('dropWhile', _xdropWhile, function dropWhile(pred, list) {
	        var idx = 0, len = list.length;
	        while (idx < len && pred(list[idx])) {
	            idx += 1;
	        }
	        return _slice(list, idx);
	    }));
	
	    /**
	     * Returns `true` if its arguments are equivalent, `false` otherwise.
	     * Dispatches to an `equals` method if present. Handles cyclical data
	     * structures.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig a -> b -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      R.equals(1, 1); //=> true
	     *      R.equals(1, '1'); //=> false
	     *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
	     *
	     *      var a = {}; a.v = a;
	     *      var b = {}; b.v = b;
	     *      R.equals(a, b); //=> true
	     */
	    var equals = _curry2(function equals(a, b) {
	        return _hasMethod('equals', a) ? a.equals(b) : _hasMethod('equals', b) ? b.equals(a) : _equals(a, b, [], []);
	    });
	
	    /**
	     * Returns a new list containing only those items that match a given predicate function.
	     * The predicate function is passed one argument: *(value)*.
	     *
	     * Note that `R.filter` does not skip deleted or unassigned indices, unlike the native
	     * `Array.prototype.filter` method. For more details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Description
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} The new filtered array.
	     * @see R.reject
	     * @example
	     *
	     *      var isEven = function(n) {
	     *        return n % 2 === 0;
	     *      };
	     *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
	     */
	    var filter = _curry2(_dispatchable('filter', _xfilter, _filter));
	
	    /**
	     * Returns the first element of the list which matches the predicate, or `undefined` if no
	     * element matches.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> a | undefined
	     * @param {Function} fn The predicate function used to determine if the element is the
	     *        desired one.
	     * @param {Array} list The array to consider.
	     * @return {Object} The element found, or `undefined`.
	     * @example
	     *
	     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
	     *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
	     *      R.find(R.propEq('a', 4))(xs); //=> undefined
	     */
	    var find = _curry2(_dispatchable('find', _xfind, function find(fn, list) {
	        var idx = 0;
	        var len = list.length;
	        while (idx < len) {
	            if (fn(list[idx])) {
	                return list[idx];
	            }
	            idx += 1;
	        }
	    }));
	
	    /**
	     * Returns the index of the first element of the list which matches the predicate, or `-1`
	     * if no element matches.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Number
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Number} The index of the element found, or `-1`.
	     * @example
	     *
	     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
	     *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
	     *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
	     */
	    var findIndex = _curry2(_dispatchable('findIndex', _xfindIndex, function findIndex(fn, list) {
	        var idx = 0;
	        var len = list.length;
	        while (idx < len) {
	            if (fn(list[idx])) {
	                return idx;
	            }
	            idx += 1;
	        }
	        return -1;
	    }));
	
	    /**
	     * Returns the last element of the list which matches the predicate, or `undefined` if no
	     * element matches.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> a | undefined
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Object} The element found, or `undefined`.
	     * @example
	     *
	     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
	     *      R.findLast(R.propEq('a', 1))(xs); //=> {a: 1, b: 1}
	     *      R.findLast(R.propEq('a', 4))(xs); //=> undefined
	     */
	    var findLast = _curry2(_dispatchable('findLast', _xfindLast, function findLast(fn, list) {
	        var idx = list.length - 1;
	        while (idx >= 0) {
	            if (fn(list[idx])) {
	                return list[idx];
	            }
	            idx -= 1;
	        }
	    }));
	
	    /**
	     * Returns the index of the last element of the list which matches the predicate, or
	     * `-1` if no element matches.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Number
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Number} The index of the element found, or `-1`.
	     * @example
	     *
	     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
	     *      R.findLastIndex(R.propEq('a', 1))(xs); //=> 1
	     *      R.findLastIndex(R.propEq('a', 4))(xs); //=> -1
	     */
	    var findLastIndex = _curry2(_dispatchable('findLastIndex', _xfindLastIndex, function findLastIndex(fn, list) {
	        var idx = list.length - 1;
	        while (idx >= 0) {
	            if (fn(list[idx])) {
	                return idx;
	            }
	            idx -= 1;
	        }
	        return -1;
	    }));
	
	    /**
	     * Returns a new list by pulling every item out of it (and all its sub-arrays) and putting
	     * them in a new array, depth-first.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [b]
	     * @param {Array} list The array to consider.
	     * @return {Array} The flattened list.
	     * @see R.unnest
	     * @example
	     *
	     *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
	     *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	     */
	    var flatten = _curry1(_makeFlat(true));
	
	    /**
	     * Returns a new function much like the supplied one, except that the first two arguments'
	     * order is reversed.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
	     * @param {Function} fn The function to invoke with its first two parameters reversed.
	     * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
	     * @example
	     *
	     *      var mergeThree = function(a, b, c) {
	     *        return ([]).concat(a, b, c);
	     *      };
	     *
	     *      mergeThree(1, 2, 3); //=> [1, 2, 3]
	     *
	     *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
	     */
	    var flip = _curry1(function flip(fn) {
	        return curry(function (a, b) {
	            var args = _slice(arguments);
	            args[0] = b;
	            args[1] = a;
	            return fn.apply(this, args);
	        });
	    });
	
	    /**
	     * Iterate over an input `list`, calling a provided function `fn` for each element in the
	     * list.
	     *
	     * `fn` receives one argument: *(value)*.
	     *
	     * Note: `R.forEach` does not skip deleted or unassigned indices (sparse arrays), unlike
	     * the native `Array.prototype.forEach` method. For more details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
	     *
	     * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns the original
	     * array. In some libraries this function is named `each`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> *) -> [a] -> [a]
	     * @param {Function} fn The function to invoke. Receives one argument, `value`.
	     * @param {Array} list The list to iterate over.
	     * @return {Array} The original list.
	     * @example
	     *
	     *      var printXPlusFive = function(x) { console.log(x + 5); };
	     *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
	     *      //-> 6
	     *      //-> 7
	     *      //-> 8
	     */
	    var forEach = _curry2(_checkForMethod('forEach', function forEach(fn, list) {
	        var len = list.length;
	        var idx = 0;
	        while (idx < len) {
	            fn(list[idx]);
	            idx += 1;
	        }
	        return list;
	    }));
	
	    /**
	     * Returns a list of function names of object's own functions
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {*} -> [String]
	     * @param {Object} obj The objects with functions in it
	     * @return {Array} A list of the object's own properties that map to functions.
	     * @example
	     *
	     *      R.functions(R); // returns list of ramda's own function names
	     *
	     *      var F = function() { this.x = function(){}; this.y = 1; }
	     *      F.prototype.z = function() {};
	     *      F.prototype.a = 100;
	     *      R.functions(new F()); //=> ["x"]
	     */
	    var functions = _curry1(_functionsWith(keys));
	
	    /**
	     * Returns a list of function names of object's own and prototype functions
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {*} -> [String]
	     * @param {Object} obj The objects with functions in it
	     * @return {Array} A list of the object's own properties and prototype
	     *         properties that map to functions.
	     * @example
	     *
	     *      R.functionsIn(R); // returns list of ramda's own and prototype function names
	     *
	     *      var F = function() { this.x = function(){}; this.y = 1; }
	     *      F.prototype.z = function() {};
	     *      F.prototype.a = 100;
	     *      R.functionsIn(new F()); //=> ["x", "z"]
	     */
	    var functionsIn = _curry1(_functionsWith(keysIn));
	
	    /**
	     * Splits a list into sub-lists stored in an object, based on the result of calling a String-returning function
	     * on each element, and grouping the results according to values returned.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> String) -> [a] -> {String: [a]}
	     * @param {Function} fn Function :: a -> String
	     * @param {Array} list The array to group
	     * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
	     *         that produced that key when passed to `fn`.
	     * @example
	     *
	     *      var byGrade = R.groupBy(function(student) {
	     *        var score = student.score;
	     *        return score < 65 ? 'F' :
	     *               score < 70 ? 'D' :
	     *               score < 80 ? 'C' :
	     *               score < 90 ? 'B' : 'A';
	     *      });
	     *      var students = [{name: 'Abby', score: 84},
	     *                      {name: 'Eddy', score: 58},
	     *                      // ...
	     *                      {name: 'Jack', score: 69}];
	     *      byGrade(students);
	     *      // {
	     *      //   'A': [{name: 'Dianne', score: 99}],
	     *      //   'B': [{name: 'Abby', score: 84}]
	     *      //   // ...,
	     *      //   'F': [{name: 'Eddy', score: 58}]
	     *      // }
	     */
	    var groupBy = _curry2(_dispatchable('groupBy', _xgroupBy, function groupBy(fn, list) {
	        return _reduce(function (acc, elt) {
	            var key = fn(elt);
	            acc[key] = append(elt, acc[key] || (acc[key] = []));
	            return acc;
	        }, {}, list);
	    }));
	
	    /**
	     * Returns the first element of the given list or string. In some libraries
	     * this function is named `first`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.tail, R.init, R.last
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
	     *      R.head([]); //=> undefined
	     *
	     *      R.head('abc'); //=> 'a'
	     *      R.head(''); //=> ''
	     */
	    var head = nth(0);
	
	    /**
	     * Combines two lists into a set (i.e. no duplicates) composed of those
	     * elements common to both lists.  Duplication is determined according
	     * to the value returned by applying the supplied predicate to two list
	     * elements.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig (a,a -> Boolean) -> [a] -> [a] -> [a]
	     * @param {Function} pred A predicate function that determines whether
	     *        the two supplied elements are equal.
	     * @param {Array} list1 One list of items to compare
	     * @param {Array} list2 A second list of items to compare
	     * @see R.intersection
	     * @return {Array} A new list containing those elements common to both lists.
	     * @example
	     *
	     *      var buffaloSpringfield = [
	     *        {id: 824, name: 'Richie Furay'},
	     *        {id: 956, name: 'Dewey Martin'},
	     *        {id: 313, name: 'Bruce Palmer'},
	     *        {id: 456, name: 'Stephen Stills'},
	     *        {id: 177, name: 'Neil Young'}
	     *      ];
	     *      var csny = [
	     *        {id: 204, name: 'David Crosby'},
	     *        {id: 456, name: 'Stephen Stills'},
	     *        {id: 539, name: 'Graham Nash'},
	     *        {id: 177, name: 'Neil Young'}
	     *      ];
	     *
	     *      var sameId = function(o1, o2) {return o1.id === o2.id;};
	     *
	     *      R.intersectionWith(sameId, buffaloSpringfield, csny);
	     *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
	     */
	    var intersectionWith = _curry3(function intersectionWith(pred, list1, list2) {
	        var results = [], idx = 0;
	        while (idx < list1.length) {
	            if (_containsWith(pred, list1[idx], list2)) {
	                results[results.length] = list1[idx];
	            }
	            idx += 1;
	        }
	        return uniqWith(pred, results);
	    });
	
	    /**
	     * Creates a new list with the separator interposed between elements.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} separator The element to add to the list.
	     * @param {Array} list The list to be interposed.
	     * @return {Array} The new list.
	     * @example
	     *
	     *      R.intersperse('n', ['ba', 'a', 'a']); //=> ['ba', 'n', 'a', 'n', 'a']
	     */
	    var intersperse = _curry2(_checkForMethod('intersperse', function intersperse(separator, list) {
	        var out = [];
	        var idx = 0;
	        var length = list.length;
	        while (idx < length) {
	            if (idx === length - 1) {
	                out.push(list[idx]);
	            } else {
	                out.push(list[idx], separator);
	            }
	            idx += 1;
	        }
	        return out;
	    }));
	
	    /**
	     * Transforms the items of the list with the transducer and appends the transformed items to
	     * the accumulator using an appropriate iterator function based on the accumulator type.
	     *
	     * The accumulator can be an array, string, object or a transformer. Iterated items will
	     * be appended to arrays and concatenated to strings. Objects will be merged directly or 2-item
	     * arrays will be merged as key, value pairs.
	     *
	     * The accumulator can also be a transformer object that provides a 2-arity reducing iterator
	     * function, step, 0-arity initial value function, init, and 1-arity result extraction function
	     * result. The step function is used as the iterator function in reduce. The result function is
	     * used to convert the final accumulator into the return type and in most cases is R.identity.
	     * The init function is used to provide the initial accumulator.
	     *
	     * The iteration is performed with R.reduce after initializing the transducer.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> (b -> b) -> [c] -> a
	     * @param {*} acc The initial accumulator value.
	     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
	     *
	     *      R.into([], transducer, numbers); //=> [2, 3]
	     *
	     *      var intoArray = R.into([]);
	     *      intoArray(transducer, numbers); //=> [2, 3]
	     */
	    var into = _curry3(function into(acc, xf, list) {
	        return _isTransformer(acc) ? _reduce(xf(acc), acc['@@transducer/init'](), list) : _reduce(xf(_stepCat(acc)), acc, list);
	    });
	
	    /**
	     * Same as R.invertObj, however this accounts for objects
	     * with duplicate values by putting the values into an
	     * array.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {s: x} -> {x: [ s, ... ]}
	     * @param {Object} obj The object or array to invert
	     * @return {Object} out A new object with keys
	     * in an array.
	     * @example
	     *
	     *      var raceResultsByFirstName = {
	     *        first: 'alice',
	     *        second: 'jake',
	     *        third: 'alice',
	     *      };
	     *      R.invert(raceResultsByFirstName);
	     *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
	     */
	    var invert = _curry1(function invert(obj) {
	        var props = keys(obj);
	        var len = props.length;
	        var idx = 0;
	        var out = {};
	        while (idx < len) {
	            var key = props[idx];
	            var val = obj[key];
	            var list = _has(val, out) ? out[val] : out[val] = [];
	            list[list.length] = key;
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns a new object with the keys of the given object
	     * as values, and the values of the given object as keys.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {s: x} -> {x: s}
	     * @param {Object} obj The object or array to invert
	     * @return {Object} out A new object
	     * @example
	     *
	     *      var raceResults = {
	     *        first: 'alice',
	     *        second: 'jake'
	     *      };
	     *      R.invertObj(raceResults);
	     *      //=> { 'alice': 'first', 'jake':'second' }
	     *
	     *      // Alternatively:
	     *      var raceResults = ['alice', 'jake'];
	     *      R.invertObj(raceResults);
	     *      //=> { 'alice': '0', 'jake':'1' }
	     */
	    var invertObj = _curry1(function invertObj(obj) {
	        var props = keys(obj);
	        var len = props.length;
	        var idx = 0;
	        var out = {};
	        while (idx < len) {
	            var key = props[idx];
	            out[obj[key]] = key;
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns the last element of the given list or string.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.init, R.head, R.tail
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
	     *      R.last([]); //=> undefined
	     *
	     *      R.last('abc'); //=> 'c'
	     *      R.last(''); //=> ''
	     */
	    var last = nth(-1);
	
	    /**
	     * Returns the position of the last occurrence of an item in
	     * an array, or -1 if the item is not included in the array.
	     * `R.equals` is used to determine equality.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> Number
	     * @param {*} target The item to find.
	     * @param {Array} xs The array to search in.
	     * @return {Number} the index of the target, or -1 if the target is not found.
	     * @see R.indexOf
	     * @example
	     *
	     *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
	     *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
	     */
	    var lastIndexOf = _curry2(function lastIndexOf(target, xs) {
	        if (_hasMethod('lastIndexOf', xs)) {
	            return xs.lastIndexOf(target);
	        } else {
	            var idx = xs.length - 1;
	            while (idx >= 0) {
	                if (equals(xs[idx], target)) {
	                    return idx;
	                }
	                idx -= 1;
	            }
	            return -1;
	        }
	    });
	
	    /**
	     * Returns a new list, constructed by applying the supplied function to every element of the
	     * supplied list.
	     *
	     * Note: `R.map` does not skip deleted or unassigned indices (sparse arrays), unlike the
	     * native `Array.prototype.map` method. For more details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Description
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> b) -> [a] -> [b]
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {Array} list The list to be iterated over.
	     * @return {Array} The new list.
	     * @example
	     *
	     *      var double = function(x) {
	     *        return x * 2;
	     *      };
	     *
	     *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	     */
	    var map = _curry2(_dispatchable('map', _xmap, _map));
	
	    /**
	     * Map, but for objects. Creates an object with the same keys as `obj` and values
	     * generated by running each property of `obj` through `fn`. `fn` is passed one argument:
	     * *(value)*.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig (v -> v) -> {k: v} -> {k: v}
	     * @param {Function} fn A function called for each property in `obj`. Its return value will
	     * become a new property on the return object.
	     * @param {Object} obj The object to iterate over.
	     * @return {Object} A new object with the same keys as `obj` and values that are the result
	     *         of running each property through `fn`.
	     * @example
	     *
	     *      var values = { x: 1, y: 2, z: 3 };
	     *      var double = function(num) {
	     *        return num * 2;
	     *      };
	     *
	     *      R.mapObj(double, values); //=> { x: 2, y: 4, z: 6 }
	     */
	    var mapObj = _curry2(function mapObj(fn, obj) {
	        return _reduce(function (acc, key) {
	            acc[key] = fn(obj[key]);
	            return acc;
	        }, {}, keys(obj));
	    });
	
	    /**
	     * Like `mapObj`, but but passes additional arguments to the predicate function. The
	     * predicate function is passed three arguments: *(value, key, obj)*.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig (v, k, {k: v} -> v) -> {k: v} -> {k: v}
	     * @param {Function} fn A function called for each property in `obj`. Its return value will
	     *        become a new property on the return object.
	     * @param {Object} obj The object to iterate over.
	     * @return {Object} A new object with the same keys as `obj` and values that are the result
	     *         of running each property through `fn`.
	     * @example
	     *
	     *      var values = { x: 1, y: 2, z: 3 };
	     *      var prependKeyAndDouble = function(num, key, obj) {
	     *        return key + (num * 2);
	     *      };
	     *
	     *      R.mapObjIndexed(prependKeyAndDouble, values); //=> { x: 'x2', y: 'y4', z: 'z6' }
	     */
	    var mapObjIndexed = _curry2(function mapObjIndexed(fn, obj) {
	        return _reduce(function (acc, key) {
	            acc[key] = fn(obj[key], key, obj);
	            return acc;
	        }, {}, keys(obj));
	    });
	
	    /**
	     * Returns `true` if no elements of the list match the predicate,
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
	     * @see R.all, R.any
	     * @example
	     *
	     *      R.none(R.isNaN, [1, 2, 3]); //=> true
	     *      R.none(R.isNaN, [1, 2, 3, NaN]); //=> false
	     */
	    var none = _curry2(_complement(_dispatchable('any', _xany, any)));
	
	    /**
	     * A function that returns the first truthy of two arguments otherwise the
	     * last argument. Note that this is NOT short-circuited, meaning that if
	     * expressions are passed they are both evaluated.
	     *
	     * Dispatches to the `or` method of the first argument if applicable.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig * -> * -> *
	     * @param {*} a any value
	     * @param {*} b any other value
	     * @return {*} the first truthy argument, otherwise the last argument.
	     * @see R.either
	     * @example
	     *
	     *      R.or(false, true); //=> true
	     *      R.or(0, []); //=> []
	     *      R.or(null, ''); => ''
	     */
	    var or = _curry2(function or(a, b) {
	        return _hasMethod('or', a) ? a.or(b) : a || b;
	    });
	
	    /**
	     * Accepts as its arguments a function and any number of values and returns a function that,
	     * when invoked, calls the original function with all of the values prepended to the
	     * original function's arguments list. In some libraries this function is named `applyLeft`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a -> b -> ... -> i -> j -> ... -> m -> n) -> a -> b-> ... -> i -> (j -> ... -> m -> n)
	     * @param {Function} fn The function to invoke.
	     * @param {...*} [args] Arguments to prepend to `fn` when the returned function is invoked.
	     * @return {Function} A new function wrapping `fn`. When invoked, it will call `fn`
	     *         with `args` prepended to `fn`'s arguments list.
	     * @example
	     *
	     *      var multiply = function(a, b) { return a * b; };
	     *      var double = R.partial(multiply, 2);
	     *      double(2); //=> 4
	     *
	     *      var greet = function(salutation, title, firstName, lastName) {
	     *        return salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
	     *      };
	     *      var sayHello = R.partial(greet, 'Hello');
	     *      var sayHelloToMs = R.partial(sayHello, 'Ms.');
	     *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
	     */
	    var partial = curry(_createPartialApplicator(_concat));
	
	    /**
	     * Accepts as its arguments a function and any number of values and returns a function that,
	     * when invoked, calls the original function with all of the values appended to the original
	     * function's arguments list.
	     *
	     * Note that `partialRight` is the opposite of `partial`: `partialRight` fills `fn`'s arguments
	     * from the right to the left.  In some libraries this function is named `applyRight`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (a -> b-> ... -> i -> j -> ... -> m -> n) -> j -> ... -> m -> n -> (a -> b-> ... -> i)
	     * @param {Function} fn The function to invoke.
	     * @param {...*} [args] Arguments to append to `fn` when the returned function is invoked.
	     * @return {Function} A new function wrapping `fn`. When invoked, it will call `fn` with
	     *         `args` appended to `fn`'s arguments list.
	     * @example
	     *
	     *      var greet = function(salutation, title, firstName, lastName) {
	     *        return salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
	     *      };
	     *      var greetMsJaneJones = R.partialRight(greet, 'Ms.', 'Jane', 'Jones');
	     *
	     *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
	     */
	    var partialRight = curry(_createPartialApplicator(flip(_concat)));
	
	    /**
	     * Takes a predicate and a list and returns the pair of lists of
	     * elements which do and do not satisfy the predicate, respectively.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [[a],[a]]
	     * @param {Function} pred A predicate to determine which array the element belongs to.
	     * @param {Array} list The array to partition.
	     * @return {Array} A nested array, containing first an array of elements that satisfied the predicate,
	     *         and second an array of elements that did not satisfy.
	     * @example
	     *
	     *      R.partition(R.contains('s'), ['sss', 'ttt', 'foo', 'bars']);
	     *      //=> [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
	     */
	    var partition = _curry2(function partition(pred, list) {
	        return _reduce(function (acc, elt) {
	            var xs = acc[pred(elt) ? 0 : 1];
	            xs[xs.length] = elt;
	            return acc;
	        }, [
	            [],
	            []
	        ], list);
	    });
	
	    /**
	     * Determines whether a nested path on an object has a specific value,
	     * in `R.equals` terms. Most likely used to filter a list.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig [String] -> * -> {String: *} -> Boolean
	     * @param {Array} path The path of the nested property to use
	     * @param {*} val The value to compare the nested property with
	     * @param {Object} obj The object to check the nested property in
	     * @return {Boolean} `true` if the value equals the nested object property,
	     *         `false` otherwise.
	     * @example
	     *
	     *      var user1 = { address: { zipCode: 90210 } };
	     *      var user2 = { address: { zipCode: 55555 } };
	     *      var user3 = { name: 'Bob' };
	     *      var users = [ user1, user2, user3 ];
	     *      var isFamous = R.pathEq(['address', 'zipCode'], 90210);
	     *      R.filter(isFamous, users); //=> [ user1 ]
	     */
	    var pathEq = _curry3(function pathEq(_path, val, obj) {
	        return equals(path(_path, obj), val);
	    });
	
	    /**
	     * Returns a new list by plucking the same named property off all objects in the list supplied.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig k -> [{k: v}] -> [v]
	     * @param {Number|String} key The key name to pluck off of each object.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of values for the given key.
	     * @example
	     *
	     *      R.pluck('a')([{a: 1}, {a: 2}]); //=> [1, 2]
	     *      R.pluck(0)([[1, 2], [3, 4]]);   //=> [1, 3]
	     */
	    var pluck = _curry2(function pluck(p, list) {
	        return map(prop(p), list);
	    });
	
	    /**
	     * Returns `true` if the specified object property is equal, in `R.equals`
	     * terms, to the given value; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig String -> a -> Object -> Boolean
	     * @param {String} name
	     * @param {*} val
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.equals, R.propSatisfies
	     * @example
	     *
	     *      var abby = {name: 'Abby', age: 7, hair: 'blond'};
	     *      var fred = {name: 'Fred', age: 12, hair: 'brown'};
	     *      var rusty = {name: 'Rusty', age: 10, hair: 'brown'};
	     *      var alois = {name: 'Alois', age: 15, disposition: 'surly'};
	     *      var kids = [abby, fred, rusty, alois];
	     *      var hasBrownHair = R.propEq('hair', 'brown');
	     *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
	     */
	    var propEq = _curry3(function propEq(name, val, obj) {
	        return propSatisfies(equals(val), name, obj);
	    });
	
	    /**
	     * Returns `true` if the specified object property is of the given type;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category Type
	     * @sig Type -> String -> Object -> Boolean
	     * @param {Function} type
	     * @param {String} name
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.is
	     * @see R.propSatisfies
	     * @example
	     *
	     *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
	     *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
	     *      R.propIs(Number, 'x', {});            //=> false
	     */
	    var propIs = _curry3(function propIs(type, name, obj) {
	        return propSatisfies(is(type), name, obj);
	    });
	
	    /**
	     * Returns a single item by iterating through the list, successively calling the iterator
	     * function and passing it an accumulator value and the current value from the array, and
	     * then passing the result to the next call.
	     *
	     * The iterator function receives two values: *(acc, value)*.  It may use `R.reduced` to
	     * shortcut the iteration.
	     *
	     * Note: `R.reduce` does not skip deleted or unassigned indices (sparse arrays), unlike
	     * the native `Array.prototype.reduce` method. For more details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
	     * @see R.reduced
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a,b -> a) -> a -> [b] -> a
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var numbers = [1, 2, 3];
	     *      var add = function(a, b) {
	     *        return a + b;
	     *      };
	     *
	     *      R.reduce(add, 10, numbers); //=> 16
	     */
	    var reduce = _curry3(_reduce);
	
	    /**
	     * Similar to `filter`, except that it keeps only values for which the given predicate
	     * function returns falsy. The predicate function is passed one argument: *(value)*.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} The new filtered array.
	     * @see R.filter
	     * @example
	     *
	     *      var isOdd = function(n) {
	     *        return n % 2 === 1;
	     *      };
	     *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
	     */
	    var reject = _curry2(function reject(fn, list) {
	        return filter(_complement(fn), list);
	    });
	
	    /**
	     * Returns a fixed list of size `n` containing a specified identical value.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> n -> [a]
	     * @param {*} value The value to repeat.
	     * @param {Number} n The desired size of the output list.
	     * @return {Array} A new array containing `n` `value`s.
	     * @example
	     *
	     *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
	     *
	     *      var obj = {};
	     *      var repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
	     *      repeatedObjs[0] === repeatedObjs[1]; //=> true
	     */
	    var repeat = _curry2(function repeat(value, n) {
	        return times(always(value), n);
	    });
	
	    /**
	     * Returns the elements of the given list or string (or object with a `slice`
	     * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> Number -> [a] -> [a]
	     * @sig Number -> Number -> String -> String
	     * @param {Number} fromIndex The start index (inclusive).
	     * @param {Number} toIndex The end index (exclusive).
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
	     *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
	     *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
	     *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
	     *      R.slice(0, 3, 'ramda');                     //=> 'ram'
	     */
	    var slice = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
	        return Array.prototype.slice.call(list, fromIndex, toIndex);
	    }));
	
	    /**
	     * Splits a collection into slices of the specified length.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [[a]]
	     * @sig Number -> String -> [String]
	     * @param {Number} n
	     * @param {Array} list
	     * @return {Array}
	     * @example
	     *
	     *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
	     *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
	     */
	    var splitEvery = _curry2(function splitEvery(n, list) {
	        if (n <= 0) {
	            throw new Error('First argument to splitEvery must be a positive integer');
	        }
	        var result = [];
	        var idx = 0;
	        while (idx < list.length) {
	            result.push(slice(idx, idx += n, list));
	        }
	        return result;
	    });
	
	    /**
	     * Adds together all the elements of a list.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list An array of numbers
	     * @return {Number} The sum of all the numbers in the list.
	     * @see R.reduce
	     * @example
	     *
	     *      R.sum([2,4,6,8,100,1]); //=> 121
	     */
	    var sum = reduce(add, 0);
	
	    /**
	     * Returns all but the first element of the given list or string (or object
	     * with a `tail` method).
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.head, R.init, R.last
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.tail([1, 2, 3]);  //=> [2, 3]
	     *      R.tail([1, 2]);     //=> [2]
	     *      R.tail([1]);        //=> []
	     *      R.tail([]);         //=> []
	     *
	     *      R.tail('abc');  //=> 'bc'
	     *      R.tail('ab');   //=> 'b'
	     *      R.tail('a');    //=> ''
	     *      R.tail('');     //=> ''
	     */
	    var tail = _checkForMethod('tail', slice(1, Infinity));
	
	    /**
	     * Returns the first `n` elements of the given list, string, or
	     * transducer/transformer (or object with a `take` method).
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {*} list
	     * @return {*}
	     * @see R.drop
	     * @example
	     *
	     *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
	     *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
	     *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.take(3, 'ramda');               //=> 'ram'
	     *
	     *      var personnel = [
	     *        'Dave Brubeck',
	     *        'Paul Desmond',
	     *        'Eugene Wright',
	     *        'Joe Morello',
	     *        'Gerry Mulligan',
	     *        'Bob Bates',
	     *        'Joe Dodge',
	     *        'Ron Crotty'
	     *      ];
	     *
	     *      var takeFive = R.take(5);
	     *      takeFive(personnel);
	     *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
	     */
	    var take = _curry2(_dispatchable('take', _xtake, function take(n, xs) {
	        return slice(0, n < 0 ? Infinity : n, xs);
	    }));
	
	    /**
	     * Returns a new list containing the first `n` elements of a given list, passing each value
	     * to the supplied predicate function, and terminating when the predicate function returns
	     * `false`. Excludes the element that caused the predicate function to fail. The predicate
	     * function is passed one argument: *(value)*.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.dropWhile
	     * @example
	     *
	     *      var isNotFour = function(x) {
	     *        return !(x === 4);
	     *      };
	     *
	     *      R.takeWhile(isNotFour, [1, 2, 3, 4]); //=> [1, 2, 3]
	     */
	    var takeWhile = _curry2(_dispatchable('takeWhile', _xtakeWhile, function takeWhile(fn, list) {
	        var idx = 0, len = list.length;
	        while (idx < len && fn(list[idx])) {
	            idx += 1;
	        }
	        return _slice(list, 0, idx);
	    }));
	
	    /**
	     * Initializes a transducer using supplied iterator function. Returns a single item by
	     * iterating through the list, successively calling the transformed iterator function and
	     * passing it an accumulator value and the current value from the array, and then passing
	     * the result to the next call.
	     *
	     * The iterator function receives two values: *(acc, value)*. It will be wrapped as a
	     * transformer to initialize the transducer. A transformer can be passed directly in place
	     * of an iterator function.  In both cases, iteration may be stopped early with the
	     * `R.reduced` function.
	     *
	     * A transducer is a function that accepts a transformer and returns a transformer and can
	     * be composed directly.
	     *
	     * A transformer is an an object that provides a 2-arity reducing iterator function, step,
	     * 0-arity initial value function, init, and 1-arity result extraction function, result.
	     * The step function is used as the iterator function in reduce. The result function is used
	     * to convert the final accumulator into the return type and in most cases is R.identity.
	     * The init function can be used to provide an initial accumulator, but is ignored by transduce.
	     *
	     * The iteration is performed with R.reduce after initializing the transducer.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.reduce, R.reduced, R.into
	     * @sig (c -> c) -> (a,b -> a) -> a -> [b] -> a
	     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array. Wrapped as transformer, if necessary, and used to
	     *        initialize the transducer
	     * @param {*} acc The initial accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
	     *
	     *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
	     */
	    var transduce = curryN(4, function transduce(xf, fn, acc, list) {
	        return _reduce(xf(typeof fn === 'function' ? _xwrap(fn) : fn), acc, list);
	    });
	
	    /**
	     * Combines two lists into a set (i.e. no duplicates) composed of the elements of each list.  Duplication is
	     * determined according to the value returned by applying the supplied predicate to two list elements.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig (a,a -> Boolean) -> [a] -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The first and second lists concatenated, with
	     *         duplicates removed.
	     * @see R.union
	     * @example
	     *
	     *      function cmp(x, y) { return x.a === y.a; }
	     *      var l1 = [{a: 1}, {a: 2}];
	     *      var l2 = [{a: 1}, {a: 4}];
	     *      R.unionWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
	     */
	    var unionWith = _curry3(function unionWith(pred, list1, list2) {
	        return uniqWith(pred, _concat(list1, list2));
	    });
	
	    /**
	     * Returns a new list containing only one copy of each element in the original list.
	     * `R.equals` is used to determine equality.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [a]
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
	     *      R.uniq([1, '1']);     //=> [1, '1']
	     *      R.uniq([[42], [42]]); //=> [[42]]
	     */
	    var uniq = uniqWith(equals);
	
	    /**
	     * Returns a new list by pulling every item at the first level of nesting out, and putting
	     * them in a new array.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [b]
	     * @param {Array} list The array to consider.
	     * @return {Array} The flattened list.
	     * @see R.flatten
	     * @example
	     *
	     *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
	     *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
	     */
	    var unnest = _curry1(_makeFlat(false));
	
	    /**
	     * Accepts a function `fn` and any number of transformer functions and returns a new
	     * function. When the new function is invoked, it calls the function `fn` with parameters
	     * consisting of the result of calling each supplied handler on successive arguments to the
	     * new function.
	     *
	     * If more arguments are passed to the returned function than transformer functions, those
	     * arguments are passed directly to `fn` as additional parameters. If you expect additional
	     * arguments that don't need to be transformed, although you can ignore them, it's best to
	     * pass an identity function so that the new function reports the correct arity.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (x1 -> x2 -> ... -> z) -> ((a -> x1), (b -> x2), ...) -> (a -> b -> ... -> z)
	     * @param {Function} fn The function to wrap.
	     * @param {...Function} transformers A variable number of transformer functions
	     * @return {Function} The wrapped function.
	     * @example
	     *
	     *      var double = function(y) { return y * 2; };
	     *      var square = function(x) { return x * x; };
	     *      var add = function(a, b) { return a + b; };
	     *      // Adds any number of arguments together
	     *      var addAll = function() {
	     *        return R.reduce(add, 0, arguments);
	     *      };
	     *
	     *      // Basic example
	     *      var addDoubleAndSquare = R.useWith(addAll, double, square);
	     *
	     *      //≅ addAll(double(10), square(5));
	     *      addDoubleAndSquare(10, 5); //=> 45
	     *
	     *      // Example of passing more arguments than transformers
	     *      //≅ addAll(double(10), square(5), 100);
	     *      addDoubleAndSquare(10, 5, 100); //=> 145
	     *
	     *      // If there are extra _expected_ arguments that don't need to be transformed, although
	     *      // you can ignore them, it might be best to pass in the identity function so that the new
	     *      // function correctly reports arity.
	     *      var addDoubleAndSquareWithExtraParams = R.useWith(addAll, double, square, R.identity);
	     *      // addDoubleAndSquareWithExtraParams.length //=> 3
	     *      //≅ addAll(double(10), square(5), R.identity(100));
	     *      addDoubleAndSquare(10, 5, 100); //=> 145
	     */
	    /*, transformers */
	    var useWith = curry(function useWith(fn) {
	        var transformers = _slice(arguments, 1);
	        var tlen = transformers.length;
	        return curry(_arity(tlen, function () {
	            var args = [], idx = 0;
	            while (idx < tlen) {
	                args[idx] = transformers[idx](arguments[idx]);
	                idx += 1;
	            }
	            return fn.apply(this, args.concat(_slice(arguments, tlen)));
	        }));
	    });
	
	    /**
	     * Takes a spec object and a test object; returns true if the test satisfies
	     * the spec, false otherwise. An object satisfies the spec if, for each of the
	     * spec's own properties, accessing that property of the object gives the same
	     * value (in `R.equals` terms) as accessing that property of the spec.
	     *
	     * `whereEq` is a specialization of [`where`](#where).
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig {String: *} -> {String: *} -> Boolean
	     * @param {Object} spec
	     * @param {Object} testObj
	     * @return {Boolean}
	     * @see R.where
	     * @example
	     *
	     *      // pred :: Object -> Boolean
	     *      var pred = R.whereEq({a: 1, b: 2});
	     *
	     *      pred({a: 1});              //=> false
	     *      pred({a: 1, b: 2});        //=> true
	     *      pred({a: 1, b: 2, c: 3});  //=> true
	     *      pred({a: 1, b: 1});        //=> false
	     */
	    var whereEq = _curry2(function whereEq(spec, testObj) {
	        return where(mapObj(equals, spec), testObj);
	    });
	
	    var _flatCat = function () {
	        var preservingReduced = function (xf) {
	            return {
	                '@@transducer/init': _xfBase.init,
	                '@@transducer/result': function (result) {
	                    return xf['@@transducer/result'](result);
	                },
	                '@@transducer/step': function (result, input) {
	                    var ret = xf['@@transducer/step'](result, input);
	                    return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
	                }
	            };
	        };
	        return function _xcat(xf) {
	            var rxf = preservingReduced(xf);
	            return {
	                '@@transducer/init': _xfBase.init,
	                '@@transducer/result': function (result) {
	                    return rxf['@@transducer/result'](result);
	                },
	                '@@transducer/step': function (result, input) {
	                    return !isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
	                }
	            };
	        };
	    }();
	
	    var _indexOf = function _indexOf(list, item, from) {
	        var idx = from;
	        while (idx < list.length) {
	            if (equals(list[idx], item)) {
	                return idx;
	            }
	            idx += 1;
	        }
	        return -1;
	    };
	
	    /**
	     * Create a predicate wrapper which will call a pick function (all/any) for each predicate
	     *
	     * @private
	     * @see R.all
	     * @see R.any
	     */
	    // Call function immediately if given arguments
	    // Return a function which will call the predicates with the provided arguments
	    var _predicateWrap = function _predicateWrap(predPicker) {
	        return function (preds) {
	            var predIterator = function () {
	                var args = arguments;
	                return predPicker(function (predicate) {
	                    return predicate.apply(null, args);
	                }, preds);
	            };
	            return arguments.length > 1 ? // Call function immediately if given arguments
	            predIterator.apply(null, _slice(arguments, 1)) : // Return a function which will call the predicates with the provided arguments
	            _arity(Math.max.apply(Math, pluck('length', preds)), predIterator);
	        };
	    };
	
	    var _xchain = _curry2(function _xchain(f, xf) {
	        return map(f, _flatCat(xf));
	    });
	
	    /**
	     * Given a list of predicates, returns a new predicate that will be true exactly when all of them are.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
	     * @param {Array} list An array of predicate functions
	     * @param {*} optional Any arguments to pass into the predicates
	     * @return {Function} a function that applies its arguments to each of
	     *         the predicates, returning `true` if all are satisfied.
	     * @see R.anyPass
	     * @example
	     *
	     *      var gt10 = function(x) { return x > 10; };
	     *      var even = function(x) { return x % 2 === 0};
	     *      var f = R.allPass([gt10, even]);
	     *      f(11); //=> false
	     *      f(12); //=> true
	     */
	    var allPass = _curry1(_predicateWrap(all));
	
	    /**
	     * Given a list of predicates returns a new predicate that will be true exactly when any one of them is.
	     *
	     * @func
	     * @memberOf R
	     * @category Logic
	     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
	     * @param {Array} list An array of predicate functions
	     * @param {*} optional Any arguments to pass into the predicates
	     * @return {Function} A function that applies its arguments to each of the predicates, returning
	     *         `true` if all are satisfied.
	     * @see R.allPass
	     * @example
	     *
	     *      var gt10 = function(x) { return x > 10; };
	     *      var even = function(x) { return x % 2 === 0};
	     *      var f = R.anyPass([gt10, even]);
	     *      f(11); //=> true
	     *      f(8); //=> true
	     *      f(9); //=> false
	     */
	    var anyPass = _curry1(_predicateWrap(any));
	
	    /**
	     * ap applies a list of functions to a list of values.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig [f] -> [a] -> [f a]
	     * @param {Array} fns An array of functions
	     * @param {Array} vs An array of values
	     * @return {Array} An array of results of applying each of `fns` to all of `vs` in turn.
	     * @example
	     *
	     *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
	     */
	    var ap = _curry2(function ap(fns, vs) {
	        return _hasMethod('ap', fns) ? fns.ap(vs) : _reduce(function (acc, fn) {
	            return _concat(acc, map(fn, vs));
	        }, [], fns);
	    });
	
	    /**
	     * Returns the result of calling its first argument with the remaining
	     * arguments. This is occasionally useful as a converging function for
	     * `R.converge`: the left branch can produce a function while the right
	     * branch produces a value to be passed to that function as an argument.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (*... -> a),*... -> a
	     * @param {Function} fn The function to apply to the remaining arguments.
	     * @param {...*} args Any number of positional arguments.
	     * @return {*}
	     * @see R.apply
	     * @example
	     *
	     *      var indentN = R.pipe(R.times(R.always(' ')),
	     *                           R.join(''),
	     *                           R.replace(/^(?!$)/gm));
	     *
	     *      var format = R.converge(R.call,
	     *                              R.pipe(R.prop('indent'), indentN),
	     *                              R.prop('value'));
	     *
	     *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
	     */
	    var call = curry(function call(fn) {
	        return fn.apply(this, _slice(arguments, 1));
	    });
	
	    /**
	     * `chain` maps a function over a list and concatenates the results.
	     * This implementation is compatible with the
	     * Fantasy-land Chain spec, and will work with types that implement that spec.
	     * `chain` is also known as `flatMap` in some libraries
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> [b]) -> [a] -> [b]
	     * @param {Function} fn
	     * @param {Array} list
	     * @return {Array}
	     * @example
	     *
	     *      var duplicate = function(n) {
	     *        return [n, n];
	     *      };
	     *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
	     */
	    var chain = _curry2(_dispatchable('chain', _xchain, function chain(fn, list) {
	        return unnest(map(fn, list));
	    }));
	
	    /**
	     * Turns a list of Functors into a Functor of a list, applying
	     * a mapping function to the elements of the list along the way.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.commute
	     * @sig Functor f => (f a -> f b) -> (x -> f x) -> [f a] -> f [b]
	     * @param {Function} fn The transformation function
	     * @param {Function} of A function that returns the data type to return
	     * @param {Array} list An array of functors of the same type
	     * @return {*}
	     * @example
	     *
	     *      R.commuteMap(R.map(R.add(10)), R.of, [[1], [2, 3]]);   //=> [[11, 12], [11, 13]]
	     *      R.commuteMap(R.map(R.add(10)), R.of, [[1, 2], [3]]);   //=> [[11, 13], [12, 13]]
	     *      R.commuteMap(R.map(R.add(10)), R.of, [[1], [2], [3]]); //=> [[11, 12, 13]]
	     *      R.commuteMap(R.map(R.add(10)), Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([11, 12, 13])
	     *      R.commuteMap(R.map(R.add(10)), Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
	     */
	    var commuteMap = _curry3(function commuteMap(fn, of, list) {
	        function consF(acc, ftor) {
	            return ap(map(append, fn(ftor)), acc);
	        }
	        return _reduce(consF, of([]), list);
	    });
	
	    /**
	     * Wraps a constructor function inside a curried function that can be called with the same
	     * arguments and returns the same type. The arity of the function returned is specified
	     * to allow using variadic constructor functions.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> (* -> {*}) -> (* -> {*})
	     * @param {Number} n The arity of the constructor function.
	     * @param {Function} Fn The constructor function to wrap.
	     * @return {Function} A wrapped, curried constructor function.
	     * @example
	     *
	     *      // Variadic constructor function
	     *      var Widget = function() {
	     *        this.children = Array.prototype.slice.call(arguments);
	     *        // ...
	     *      };
	     *      Widget.prototype = {
	     *        // ...
	     *      };
	     *      var allConfigs = [
	     *        // ...
	     *      ];
	     *      R.map(R.constructN(1, Widget), allConfigs); // a list of Widgets
	     */
	    var constructN = _curry2(function constructN(n, Fn) {
	        if (n > 10) {
	            throw new Error('Constructor with greater than ten arguments');
	        }
	        if (n === 0) {
	            return function () {
	                return new Fn();
	            };
	        }
	        return curry(nAry(n, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
	            switch (arguments.length) {
	            case 1:
	                return new Fn($0);
	            case 2:
	                return new Fn($0, $1);
	            case 3:
	                return new Fn($0, $1, $2);
	            case 4:
	                return new Fn($0, $1, $2, $3);
	            case 5:
	                return new Fn($0, $1, $2, $3, $4);
	            case 6:
	                return new Fn($0, $1, $2, $3, $4, $5);
	            case 7:
	                return new Fn($0, $1, $2, $3, $4, $5, $6);
	            case 8:
	                return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
	            case 9:
	                return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
	            case 10:
	                return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
	            }
	        }));
	    });
	
	    /**
	     * Accepts at least three functions and returns a new function. When invoked, this new
	     * function will invoke the first function, `after`, passing as its arguments the
	     * results of invoking the subsequent functions with whatever arguments are passed to
	     * the new function.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (x1 -> x2 -> ... -> z) -> ((a -> b -> ... -> x1), (a -> b -> ... -> x2), ...) -> (a -> b -> ... -> z)
	     * @param {Function} after A function. `after` will be invoked with the return values of
	     *        `fn1` and `fn2` as its arguments.
	     * @param {...Function} functions A variable number of functions.
	     * @return {Function} A new function.
	     * @example
	     *
	     *      var add = function(a, b) { return a + b; };
	     *      var multiply = function(a, b) { return a * b; };
	     *      var subtract = function(a, b) { return a - b; };
	     *
	     *      //≅ multiply( add(1, 2), subtract(1, 2) );
	     *      R.converge(multiply, add, subtract)(1, 2); //=> -3
	     *
	     *      var add3 = function(a, b, c) { return a + b + c; };
	     *      R.converge(add3, multiply, add, subtract)(1, 2); //=> 4
	     */
	    var converge = curryN(3, function converge(after) {
	        var fns = _slice(arguments, 1);
	        return curryN(Math.max.apply(Math, pluck('length', fns)), function () {
	            var args = arguments;
	            var context = this;
	            return after.apply(context, _map(function (fn) {
	                return fn.apply(context, args);
	            }, fns));
	        });
	    });
	
	    /**
	     * Returns all but the first `n` elements of the given list, string, or
	     * transducer/transformer (or object with a `drop` method).
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.transduce
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {*} list
	     * @return {*}
	     * @see R.take
	     * @example
	     *
	     *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
	     *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
	     *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(3, 'ramda');               //=> 'da'
	     */
	    var drop = _curry2(_dispatchable('drop', _xdrop, function drop(n, xs) {
	        return slice(Math.max(0, n), Infinity, xs);
	    }));
	
	    /**
	     * Returns a list containing all but the last `n` elements of the given `list`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n The number of elements of `xs` to skip.
	     * @param {Array} xs The collection to consider.
	     * @return {Array}
	     * @see R.takeLast
	     * @example
	     *
	     *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
	     *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
	     *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
	     *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
	     *      R.dropLast(3, 'ramda');               //=> 'ra'
	     */
	    var dropLast = _curry2(function dropLast(n, xs) {
	        return take(n < xs.length ? xs.length - n : 0, xs);
	    });
	
	    /**
	     * Returns a new list without any consecutively repeating elements. Equality is
	     * determined by applying the supplied predicate two consecutive elements.
	     * The first element in a series of equal element is the one being preserved.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a, a -> Boolean) -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list The array to consider.
	     * @return {Array} `list` without repeating elements.
	     * @example
	     *
	     *      function lengthEq(x, y) { return Math.abs(x) === Math.abs(y); };
	     *      var l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
	     *      R.dropRepeatsWith(lengthEq, l); //=> [1, 3, 4, -5, 3]
	     */
	    var dropRepeatsWith = _curry2(_dispatchable('dropRepeatsWith', _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
	        var result = [];
	        var idx = 1;
	        var len = list.length;
	        if (len !== 0) {
	            result[0] = list[0];
	            while (idx < len) {
	                if (!pred(last(result), list[idx])) {
	                    result[result.length] = list[idx];
	                }
	                idx += 1;
	            }
	        }
	        return result;
	    }));
	
	    /**
	     * Reports whether two objects have the same value, in `R.equals` terms,
	     * for the specified property. Useful as a curried predicate.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig k -> {k: v} -> {k: v} -> Boolean
	     * @param {String} prop The name of the property to compare
	     * @param {Object} obj1
	     * @param {Object} obj2
	     * @return {Boolean}
	     *
	     * @example
	     *
	     *      var o1 = { a: 1, b: 2, c: 3, d: 4 };
	     *      var o2 = { a: 10, b: 20, c: 3, d: 40 };
	     *      R.eqProps('a', o1, o2); //=> false
	     *      R.eqProps('c', o1, o2); //=> true
	     */
	    var eqProps = _curry3(function eqProps(prop, obj1, obj2) {
	        return equals(obj1[prop], obj2[prop]);
	    });
	
	    /**
	     * Returns the position of the first occurrence of an item in an array,
	     * or -1 if the item is not included in the array. `R.equals` is used to
	     * determine equality.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> Number
	     * @param {*} target The item to find.
	     * @param {Array} xs The array to search in.
	     * @return {Number} the index of the target, or -1 if the target is not found.
	     * @see R.lastIndexOf
	     * @example
	     *
	     *      R.indexOf(3, [1,2,3,4]); //=> 2
	     *      R.indexOf(10, [1,2,3,4]); //=> -1
	     */
	    var indexOf = _curry2(function indexOf(target, xs) {
	        return _hasMethod('indexOf', xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
	    });
	
	    /**
	     * Returns all but the last element of the given list or string.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.last, R.head, R.tail
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.init([1, 2, 3]);  //=> [1, 2]
	     *      R.init([1, 2]);     //=> [1]
	     *      R.init([1]);        //=> []
	     *      R.init([]);         //=> []
	     *
	     *      R.init('abc');  //=> 'ab'
	     *      R.init('ab');   //=> 'a'
	     *      R.init('a');    //=> ''
	     *      R.init('');     //=> ''
	     */
	    var init = slice(0, -1);
	
	    /**
	     * Returns `true` if all elements are unique, in `R.equals` terms,
	     * otherwise `false`.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> Boolean
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if all elements are unique, else `false`.
	     * @example
	     *
	     *      R.isSet(['1', 1]); //=> true
	     *      R.isSet([1, 1]);   //=> false
	     *      R.isSet([[42], [42]]); //=> false
	     */
	    var isSet = _curry1(function isSet(list) {
	        var len = list.length;
	        var idx = 0;
	        while (idx < len) {
	            if (_indexOf(list, list[idx], idx + 1) >= 0) {
	                return false;
	            }
	            idx += 1;
	        }
	        return true;
	    });
	
	    /**
	     * Returns a lens for the given getter and setter functions. The getter "gets"
	     * the value of the focus; the setter "sets" the value of the focus. The setter
	     * should not mutate the data structure.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
	     * @param {Function} getter
	     * @param {Function} setter
	     * @return {Lens}
	     * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lens(R.prop('x'), R.assoc('x'));
	     *
	     *      R.view(xLens, {x: 1, y: 2});            //=> 1
	     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
	     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
	     */
	    var lens = _curry2(function lens(getter, setter) {
	        return function (f) {
	            return function (s) {
	                return map(function (v) {
	                    return setter(v, s);
	                }, f(getter(s)));
	            };
	        };
	    });
	
	    /**
	     * Returns a lens whose focus is the specified index.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Number -> Lens s a
	     * @param {Number} n
	     * @return {Lens}
	     * @see R.view, R.set, R.over
	     * @example
	     *
	     *      var headLens = R.lensIndex(0);
	     *
	     *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
	     *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
	     *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
	     */
	    var lensIndex = _curry1(function lensIndex(n) {
	        return lens(nth(n), update(n));
	    });
	
	    /**
	     * Returns a lens whose focus is the specified property.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @typedef Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig String -> Lens s a
	     * @param {String} k
	     * @return {Lens}
	     * @see R.view, R.set, R.over
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.view(xLens, {x: 1, y: 2});            //=> 1
	     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
	     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
	     */
	    var lensProp = _curry1(function lensProp(k) {
	        return lens(prop(k), assoc(k));
	    });
	
	    /**
	     * "lifts" a function to be the specified arity, so that it may "map over" that many
	     * lists (or other Functors).
	     *
	     * @func
	     * @memberOf R
	     * @see R.lift
	     * @category Function
	     * @sig Number -> (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The function `fn` applicable to mappable objects.
	     * @example
	     *
	     *      var madd3 = R.liftN(3, R.curryN(3, function() {
	     *        return R.reduce(R.add, 0, arguments);
	     *      }));
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     */
	    var liftN = _curry2(function liftN(arity, fn) {
	        var lifted = curryN(arity, fn);
	        return curryN(arity, function () {
	            return _reduce(ap, map(lifted, arguments[0]), _slice(arguments, 1));
	        });
	    });
	
	    /**
	     * Returns the mean of the given list of numbers.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list
	     * @return {Number}
	     * @example
	     *
	     *      R.mean([2, 7, 9]); //=> 6
	     *      R.mean([]); //=> NaN
	     */
	    var mean = _curry1(function mean(list) {
	        return sum(list) / list.length;
	    });
	
	    /**
	     * Returns the median of the given list of numbers.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list
	     * @return {Number}
	     * @example
	     *
	     *      R.median([2, 9, 7]); //=> 7
	     *      R.median([7, 2, 10, 9]); //=> 8
	     *      R.median([]); //=> NaN
	     */
	    var median = _curry1(function median(list) {
	        var len = list.length;
	        if (len === 0) {
	            return NaN;
	        }
	        var width = 2 - len % 2;
	        var idx = (len - width) / 2;
	        return mean(_slice(list).sort(function (a, b) {
	            return a < b ? -1 : a > b ? 1 : 0;
	        }).slice(idx, idx + width));
	    });
	
	    /**
	     * Merges a list of objects together into one object.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [{k: v}] -> {k: v}
	     * @param {Array} list An array of objects
	     * @return {Object} A merged object.
	     * @see R.reduce
	     * @example
	     *
	     *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
	     *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
	     */
	    var mergeAll = _curry1(function mergeAll(list) {
	        return reduce(merge, {}, list);
	    });
	
	    /**
	     * Performs left-to-right function composition. The leftmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * In some libraries this function is named `sequence`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> (a -> b -> ... -> n -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.compose
	     * @example
	     *
	     *      var f = R.pipe(Math.pow, R.negate, R.inc);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     */
	    var pipe = function pipe() {
	        if (arguments.length === 0) {
	            throw new Error('pipe requires at least one argument');
	        }
	        return curryN(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
	    };
	
	    /**
	     * Performs left-to-right composition of one or more Promise-returning
	     * functions. The leftmost function may have any arity; the remaining
	     * functions must be unary.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig ((a -> Promise b), (b -> Promise c), ..., (y -> Promise z)) -> (a -> Promise z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.composeP
	     * @example
	     *
	     *      //  followersForUser :: String -> Promise [User]
	     *      var followersForUser = R.pipeP(db.getUserById, db.getFollowers);
	     */
	    var pipeP = function pipeP() {
	        if (arguments.length === 0) {
	            throw new Error('pipeP requires at least one argument');
	        }
	        return curryN(arguments[0].length, reduce(_pipeP, arguments[0], tail(arguments)));
	    };
	
	    /**
	     * Multiplies together all the elements of a list.
	     *
	     * @func
	     * @memberOf R
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list An array of numbers
	     * @return {Number} The product of all the numbers in the list.
	     * @see R.reduce
	     * @example
	     *
	     *      R.product([2,4,6,8,100,1]); //=> 38400
	     */
	    var product = reduce(multiply, 1);
	
	    /**
	     * Reasonable analog to SQL `select` statement.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @category Relation
	     * @sig [k] -> [{k: v}] -> [{k: v}]
	     * @param {Array} props The property names to project
	     * @param {Array} objs The objects to query
	     * @return {Array} An array of objects with just the `props` properties.
	     * @example
	     *
	     *      var abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
	     *      var fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
	     *      var kids = [abby, fred];
	     *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
	     */
	    // passing `identity` gives correct arity
	    var project = useWith(_map, pickAll, identity);
	
	    /**
	     * Returns a new list containing the last `n` elements of the given list.
	     * If `n > list.length`, returns a list of `list.length` elements.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n The number of elements to return.
	     * @param {Array} xs The collection to consider.
	     * @return {Array}
	     * @see R.dropLast
	     * @example
	     *
	     *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
	     *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['for', 'baz']
	     *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.takeLast(3, 'ramda');               //=> 'mda'
	     */
	    var takeLast = _curry2(function takeLast(n, xs) {
	        return drop(n >= 0 ? xs.length - n : 0, xs);
	    });
	
	    var _contains = function _contains(a, list) {
	        return _indexOf(list, a, 0) >= 0;
	    };
	
	    //  mapPairs :: (Object, [String]) -> [String]
	    // Function, RegExp, user-defined types
	    var _toString = function _toString(x, seen) {
	        var recur = function recur(y) {
	            var xs = seen.concat([x]);
	            return _contains(y, xs) ? '<Circular>' : _toString(y, xs);
	        };
	        //  mapPairs :: (Object, [String]) -> [String]
	        var mapPairs = function (obj, keys) {
	            return _map(function (k) {
	                return _quote(k) + ': ' + recur(obj[k]);
	            }, keys.slice().sort());
	        };
	        switch (Object.prototype.toString.call(x)) {
	        case '[object Arguments]':
	            return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
	        case '[object Array]':
	            return '[' + _map(recur, x).concat(mapPairs(x, reject(test(/^\d+$/), keys(x)))).join(', ') + ']';
	        case '[object Boolean]':
	            return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
	        case '[object Date]':
	            return 'new Date(' + _quote(_toISOString(x)) + ')';
	        case '[object Null]':
	            return 'null';
	        case '[object Number]':
	            return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
	        case '[object String]':
	            return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
	        case '[object Undefined]':
	            return 'undefined';
	        default:
	            return typeof x.constructor === 'function' && x.constructor.name !== 'Object' && typeof x.toString === 'function' && x.toString() !== '[object Object]' ? x.toString() : // Function, RegExp, user-defined types
	            '{' + mapPairs(x, keys(x)).join(', ') + '}';
	        }
	    };
	
	    /**
	     * Turns a list of Functors into a Functor of a list.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @see R.commuteMap
	     * @sig Functor f => (x -> f x) -> [f a] -> f [a]
	     * @param {Function} of A function that returns the data type to return
	     * @param {Array} list An array of functors of the same type
	     * @return {*}
	     * @example
	     *
	     *      R.commute(R.of, [[1], [2, 3]]);   //=> [[1, 2], [1, 3]]
	     *      R.commute(R.of, [[1, 2], [3]]);   //=> [[1, 3], [2, 3]]
	     *      R.commute(R.of, [[1], [2], [3]]); //=> [[1, 2, 3]]
	     *      R.commute(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
	     *      R.commute(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
	     */
	    var commute = commuteMap(identity);
	
	    /**
	     * Performs right-to-left function composition. The rightmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> (a -> b -> ... -> n -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.pipe
	     * @example
	     *
	     *      var f = R.compose(R.inc, R.negate, Math.pow);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     */
	    var compose = function compose() {
	        if (arguments.length === 0) {
	            throw new Error('compose requires at least one argument');
	        }
	        return pipe.apply(this, reverse(arguments));
	    };
	
	    /**
	     * Returns the right-to-left Kleisli composition of the provided functions,
	     * each of which must return a value of a type supported by [`chain`](#chain).
	     *
	     * `R.composeK(h, g, f)` is equivalent to `R.compose(R.chain(h), R.chain(g), R.chain(f))`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @see R.pipeK
	     * @sig Chain m => ((y -> m z), (x -> m y), ..., (a -> m b)) -> (m a -> m z)
	     * @param {...Function}
	     * @return {Function}
	     * @example
	     *
	     *      //  parseJson :: String -> Maybe *
	     *      //  get :: String -> Object -> Maybe *
	     *
	     *      //  getStateCode :: Maybe String -> Maybe String
	     *      var getStateCode = R.composeK(
	     *        R.compose(Maybe.of, R.toUpper),
	     *        get('state'),
	     *        get('address'),
	     *        get('user'),
	     *        parseJson
	     *      );
	     *
	     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
	     *      //=> Just('NY')
	     *      getStateCode(Maybe.of('[Invalid JSON]'));
	     *      //=> Nothing()
	     */
	    var composeK = function composeK() {
	        return arguments.length === 0 ? identity : compose.apply(this, map(chain, arguments));
	    };
	
	    /**
	     * Performs right-to-left composition of one or more Promise-returning
	     * functions. The rightmost function may have any arity; the remaining
	     * functions must be unary.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig ((y -> Promise z), (x -> Promise y), ..., (a -> Promise b)) -> (a -> Promise z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.pipeP
	     * @example
	     *
	     *      //  followersForUser :: String -> Promise [User]
	     *      var followersForUser = R.composeP(db.getFollowers, db.getUserById);
	     */
	    var composeP = function composeP() {
	        if (arguments.length === 0) {
	            throw new Error('composeP requires at least one argument');
	        }
	        return pipeP.apply(this, reverse(arguments));
	    };
	
	    /**
	     * Wraps a constructor function inside a curried function that can be called with the same
	     * arguments and returns the same type.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (* -> {*}) -> (* -> {*})
	     * @param {Function} Fn The constructor function to wrap.
	     * @return {Function} A wrapped, curried constructor function.
	     * @example
	     *
	     *      // Constructor function
	     *      var Widget = function(config) {
	     *        // ...
	     *      };
	     *      Widget.prototype = {
	     *        // ...
	     *      };
	     *      var allConfigs = [
	     *        // ...
	     *      ];
	     *      R.map(R.construct(Widget), allConfigs); // a list of Widgets
	     */
	    var construct = _curry1(function construct(Fn) {
	        return constructN(Fn.length, Fn);
	    });
	
	    /**
	     * Returns `true` if the specified value is equal, in `R.equals` terms,
	     * to at least one element of the given list; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig a -> [a] -> Boolean
	     * @param {Object} a The item to compare against.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the item is in the list, `false` otherwise.
	     *
	     * @example
	     *
	     *      R.contains(3, [1, 2, 3]); //=> true
	     *      R.contains(4, [1, 2, 3]); //=> false
	     *      R.contains([42], [[42]]); //=> true
	     */
	    var contains = _curry2(_contains);
	
	    /**
	     * Finds the set (i.e. no duplicates) of all elements in the first list not contained in the second list.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig [a] -> [a] -> [a]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` that are not in `list2`.
	     * @see R.differenceWith
	     * @example
	     *
	     *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
	     *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
	     */
	    var difference = _curry2(function difference(first, second) {
	        var out = [];
	        var idx = 0;
	        var firstLen = first.length;
	        while (idx < firstLen) {
	            if (!_contains(first[idx], second) && !_contains(first[idx], out)) {
	                out[out.length] = first[idx];
	            }
	            idx += 1;
	        }
	        return out;
	    });
	
	    /**
	     * Returns a new list without any consecutively repeating elements.
	     * `R.equals` is used to determine equality.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     * @see R.transduce
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig [a] -> [a]
	     * @param {Array} list The array to consider.
	     * @return {Array} `list` without repeating elements.
	     * @example
	     *
	     *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
	     */
	    var dropRepeats = _curry1(_dispatchable('dropRepeats', _xdropRepeatsWith(equals), dropRepeatsWith(equals)));
	
	    /**
	     * Combines two lists into a set (i.e. no duplicates) composed of those elements common to both lists.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig [a] -> [a] -> [a]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @see R.intersectionWith
	     * @return {Array} The list of elements found in both `list1` and `list2`.
	     * @example
	     *
	     *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
	     */
	    var intersection = _curry2(function intersection(list1, list2) {
	        return uniq(_filter(flip(_contains)(list1), list2));
	    });
	
	    /**
	     * "lifts" a function of arity > 1 so that it may "map over" an Array or
	     * other Functor.
	     *
	     * @func
	     * @memberOf R
	     * @see R.liftN
	     * @category Function
	     * @sig (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The function `fn` applicable to mappable objects.
	     * @example
	     *
	     *      var madd3 = R.lift(R.curry(function(a, b, c) {
	     *        return a + b + c;
	     *      }));
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     *
	     *      var madd5 = R.lift(R.curry(function(a, b, c, d, e) {
	     *        return a + b + c + d + e;
	     *      }));
	     *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
	     */
	    var lift = _curry1(function lift(fn) {
	        return liftN(fn.length, fn);
	    });
	
	    /**
	     * Returns a partial copy of an object omitting the keys specified.
	     *
	     * @func
	     * @memberOf R
	     * @category Object
	     * @sig [String] -> {String: *} -> {String: *}
	     * @param {Array} names an array of String property names to omit from the new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with properties from `names` not on it.
	     * @see R.pick
	     * @example
	     *
	     *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
	     */
	    var omit = _curry2(function omit(names, obj) {
	        var result = {};
	        for (var prop in obj) {
	            if (!_contains(prop, names)) {
	                result[prop] = obj[prop];
	            }
	        }
	        return result;
	    });
	
	    /**
	     * Returns the left-to-right Kleisli composition of the provided functions,
	     * each of which must return a value of a type supported by [`chain`](#chain).
	     *
	     * `R.pipeK(f, g, h)` is equivalent to `R.pipe(R.chain(f), R.chain(g), R.chain(h))`.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @see R.composeK
	     * @sig Chain m => ((a -> m b), (b -> m c), ..., (y -> m z)) -> (m a -> m z)
	     * @param {...Function}
	     * @return {Function}
	     * @example
	     *
	     *      //  parseJson :: String -> Maybe *
	     *      //  get :: String -> Object -> Maybe *
	     *
	     *      //  getStateCode :: Maybe String -> Maybe String
	     *      var getStateCode = R.pipeK(
	     *        parseJson,
	     *        get('user'),
	     *        get('address'),
	     *        get('state'),
	     *        R.compose(Maybe.of, R.toUpper)
	     *      );
	     *
	     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
	     *      //=> Just('NY')
	     *      getStateCode(Maybe.of('[Invalid JSON]'));
	     *      //=> Nothing()
	     */
	    var pipeK = function pipeK() {
	        return composeK.apply(this, reverse(arguments));
	    };
	
	    /**
	     * Returns the string representation of the given value. `eval`'ing the output
	     * should result in a value equivalent to the input value. Many of the built-in
	     * `toString` methods do not satisfy this requirement.
	     *
	     * If the given value is an `[object Object]` with a `toString` method other
	     * than `Object.prototype.toString`, this method is invoked with no arguments
	     * to produce the return value. This means user-defined constructor functions
	     * can provide a suitable `toString` method. For example:
	     *
	     *     function Point(x, y) {
	     *       this.x = x;
	     *       this.y = y;
	     *     }
	     *
	     *     Point.prototype.toString = function() {
	     *       return 'new Point(' + this.x + ', ' + this.y + ')';
	     *     };
	     *
	     *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig * -> String
	     * @param {*} val
	     * @return {String}
	     * @example
	     *
	     *      R.toString(42); //=> '42'
	     *      R.toString('abc'); //=> '"abc"'
	     *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
	     *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
	     *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
	     */
	    var toString = _curry1(function toString(val) {
	        return _toString(val, []);
	    });
	
	    /**
	     * Combines two lists into a set (i.e. no duplicates) composed of the
	     * elements of each list.
	     *
	     * @func
	     * @memberOf R
	     * @category Relation
	     * @sig [a] -> [a] -> [a]
	     * @param {Array} as The first list.
	     * @param {Array} bs The second list.
	     * @return {Array} The first and second lists concatenated, with
	     *         duplicates removed.
	     * @example
	     *
	     *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
	     */
	    var union = _curry2(compose(uniq, _concat));
	
	    /**
	     * Returns a new list containing only one copy of each element in the
	     * original list, based upon the value returned by applying the supplied
	     * function to each list element. Prefers the first item if the supplied
	     * function produces the same value on two items. `R.equals` is used for
	     * comparison.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig (a -> b) -> [a] -> [a]
	     * @param {Function} fn A function used to produce a value to use during comparisons.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
	     */
	    var uniqBy = _curry2(function uniqBy(fn, list) {
	        var idx = 0, applied = [], result = [], appliedItem, item;
	        while (idx < list.length) {
	            item = list[idx];
	            appliedItem = fn(item);
	            if (!_contains(appliedItem, applied)) {
	                result.push(item);
	                applied.push(appliedItem);
	            }
	            idx += 1;
	        }
	        return result;
	    });
	
	    /**
	     * Turns a named method with a specified arity into a function
	     * that can be called directly supplied with arguments and a target object.
	     *
	     * The returned function is curried and accepts `arity + 1` parameters where
	     * the final parameter is the target object.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
	     * @param {Number} arity Number of arguments the returned function should take
	     *        before the target object.
	     * @param {Function} method Name of the method to call.
	     * @return {Function} A new curried function.
	     * @example
	     *
	     *      var sliceFrom = R.invoker(1, 'slice');
	     *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
	     *      var sliceFrom6 = R.invoker(2, 'slice')(6);
	     *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
	     */
	    var invoker = _curry2(function invoker(arity, method) {
	        return curryN(arity + 1, function () {
	            var target = arguments[arity];
	            if (target != null && is(Function, target[method])) {
	                return target[method].apply(target, _slice(arguments, 0, arity));
	            }
	            throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
	        });
	    });
	
	    /**
	     * Returns a string made by inserting the `separator` between each
	     * element and concatenating all the elements into a single string.
	     *
	     * @func
	     * @memberOf R
	     * @category List
	     * @sig String -> [a] -> String
	     * @param {Number|String} separator The string used to separate the elements.
	     * @param {Array} xs The elements to join into a string.
	     * @return {String} str The string made by concatenating `xs` with `separator`.
	     * @see R.split
	     * @example
	     *
	     *      var spacer = R.join(' ');
	     *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
	     *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
	     */
	    var join = invoker(1, 'join');
	
	    /**
	     * Creates a new function that, when invoked, caches the result of calling `fn` for a given
	     * argument set and returns the result. Subsequent calls to the memoized `fn` with the same
	     * argument set will not result in an additional call to `fn`; instead, the cached result
	     * for that set of arguments will be returned.
	     *
	     * @func
	     * @memberOf R
	     * @category Function
	     * @sig (*... -> a) -> (*... -> a)
	     * @param {Function} fn The function to memoize.
	     * @return {Function} Memoized version of `fn`.
	     * @example
	     *
	     *      var count = 0;
	     *      var factorial = R.memoize(function(n) {
	     *        count += 1;
	     *        return R.product(R.range(1, n + 1));
	     *      });
	     *      factorial(5); //=> 120
	     *      factorial(5); //=> 120
	     *      factorial(5); //=> 120
	     *      count; //=> 1
	     */
	    var memoize = _curry1(function memoize(fn) {
	        var cache = {};
	        return function () {
	            var key = toString(arguments);
	            if (!_has(key, cache)) {
	                cache[key] = fn.apply(this, arguments);
	            }
	            return cache[key];
	        };
	    });
	
	    /**
	     * Splits a string into an array of strings based on the given
	     * separator.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig String -> String -> [String]
	     * @param {String} sep The separator string.
	     * @param {String} str The string to separate into an array.
	     * @return {Array} The array of strings from `str` separated by `str`.
	     * @see R.join
	     * @example
	     *
	     *      var pathComponents = R.split('/');
	     *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
	     *
	     *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
	     */
	    var split = invoker(1, 'split');
	
	    /**
	     * The lower case version of a string.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to lower case.
	     * @return {String} The lower case version of `str`.
	     * @see R.toUpper
	     * @example
	     *
	     *      R.toLower('XYZ'); //=> 'xyz'
	     */
	    var toLower = invoker(0, 'toLowerCase');
	
	    /**
	     * The upper case version of a string.
	     *
	     * @func
	     * @memberOf R
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to upper case.
	     * @return {String} The upper case version of `str`.
	     * @see R.toLower
	     * @example
	     *
	     *      R.toUpper('abc'); //=> 'ABC'
	     */
	    var toUpper = invoker(0, 'toUpperCase');
	
	    var R = {
	        F: F,
	        T: T,
	        __: __,
	        add: add,
	        addIndex: addIndex,
	        adjust: adjust,
	        all: all,
	        allPass: allPass,
	        always: always,
	        and: and,
	        any: any,
	        anyPass: anyPass,
	        ap: ap,
	        aperture: aperture,
	        append: append,
	        apply: apply,
	        assoc: assoc,
	        assocPath: assocPath,
	        binary: binary,
	        bind: bind,
	        both: both,
	        call: call,
	        chain: chain,
	        clone: clone,
	        commute: commute,
	        commuteMap: commuteMap,
	        comparator: comparator,
	        complement: complement,
	        compose: compose,
	        composeK: composeK,
	        composeP: composeP,
	        concat: concat,
	        cond: cond,
	        construct: construct,
	        constructN: constructN,
	        contains: contains,
	        containsWith: containsWith,
	        converge: converge,
	        countBy: countBy,
	        createMapEntry: createMapEntry,
	        curry: curry,
	        curryN: curryN,
	        dec: dec,
	        defaultTo: defaultTo,
	        difference: difference,
	        differenceWith: differenceWith,
	        dissoc: dissoc,
	        dissocPath: dissocPath,
	        divide: divide,
	        drop: drop,
	        dropLast: dropLast,
	        dropLastWhile: dropLastWhile,
	        dropRepeats: dropRepeats,
	        dropRepeatsWith: dropRepeatsWith,
	        dropWhile: dropWhile,
	        either: either,
	        empty: empty,
	        eqProps: eqProps,
	        equals: equals,
	        evolve: evolve,
	        filter: filter,
	        find: find,
	        findIndex: findIndex,
	        findLast: findLast,
	        findLastIndex: findLastIndex,
	        flatten: flatten,
	        flip: flip,
	        forEach: forEach,
	        fromPairs: fromPairs,
	        functions: functions,
	        functionsIn: functionsIn,
	        groupBy: groupBy,
	        gt: gt,
	        gte: gte,
	        has: has,
	        hasIn: hasIn,
	        head: head,
	        identical: identical,
	        identity: identity,
	        ifElse: ifElse,
	        inc: inc,
	        indexOf: indexOf,
	        init: init,
	        insert: insert,
	        insertAll: insertAll,
	        intersection: intersection,
	        intersectionWith: intersectionWith,
	        intersperse: intersperse,
	        into: into,
	        invert: invert,
	        invertObj: invertObj,
	        invoker: invoker,
	        is: is,
	        isArrayLike: isArrayLike,
	        isEmpty: isEmpty,
	        isNil: isNil,
	        isSet: isSet,
	        join: join,
	        keys: keys,
	        keysIn: keysIn,
	        last: last,
	        lastIndexOf: lastIndexOf,
	        length: length,
	        lens: lens,
	        lensIndex: lensIndex,
	        lensProp: lensProp,
	        lift: lift,
	        liftN: liftN,
	        lt: lt,
	        lte: lte,
	        map: map,
	        mapAccum: mapAccum,
	        mapAccumRight: mapAccumRight,
	        mapObj: mapObj,
	        mapObjIndexed: mapObjIndexed,
	        match: match,
	        mathMod: mathMod,
	        max: max,
	        maxBy: maxBy,
	        mean: mean,
	        median: median,
	        memoize: memoize,
	        merge: merge,
	        mergeAll: mergeAll,
	        min: min,
	        minBy: minBy,
	        modulo: modulo,
	        multiply: multiply,
	        nAry: nAry,
	        negate: negate,
	        none: none,
	        not: not,
	        nth: nth,
	        nthArg: nthArg,
	        nthChar: nthChar,
	        nthCharCode: nthCharCode,
	        of: of,
	        omit: omit,
	        once: once,
	        or: or,
	        over: over,
	        partial: partial,
	        partialRight: partialRight,
	        partition: partition,
	        path: path,
	        pathEq: pathEq,
	        pick: pick,
	        pickAll: pickAll,
	        pickBy: pickBy,
	        pipe: pipe,
	        pipeK: pipeK,
	        pipeP: pipeP,
	        pluck: pluck,
	        prepend: prepend,
	        product: product,
	        project: project,
	        prop: prop,
	        propEq: propEq,
	        propIs: propIs,
	        propOr: propOr,
	        propSatisfies: propSatisfies,
	        props: props,
	        range: range,
	        reduce: reduce,
	        reduceRight: reduceRight,
	        reduced: reduced,
	        reject: reject,
	        remove: remove,
	        repeat: repeat,
	        replace: replace,
	        reverse: reverse,
	        scan: scan,
	        set: set,
	        slice: slice,
	        sort: sort,
	        sortBy: sortBy,
	        split: split,
	        splitEvery: splitEvery,
	        subtract: subtract,
	        sum: sum,
	        tail: tail,
	        take: take,
	        takeLast: takeLast,
	        takeLastWhile: takeLastWhile,
	        takeWhile: takeWhile,
	        tap: tap,
	        test: test,
	        times: times,
	        toLower: toLower,
	        toPairs: toPairs,
	        toPairsIn: toPairsIn,
	        toString: toString,
	        toUpper: toUpper,
	        transduce: transduce,
	        trim: trim,
	        type: type,
	        unapply: unapply,
	        unary: unary,
	        uncurryN: uncurryN,
	        unfold: unfold,
	        union: union,
	        unionWith: unionWith,
	        uniq: uniq,
	        uniqBy: uniqBy,
	        uniqWith: uniqWith,
	        unnest: unnest,
	        update: update,
	        useWith: useWith,
	        values: values,
	        valuesIn: valuesIn,
	        view: view,
	        where: where,
	        whereEq: whereEq,
	        wrap: wrap,
	        xprod: xprod,
	        zip: zip,
	        zipObj: zipObj,
	        zipWith: zipWith
	    };
	
	  /* TEST_ENTRY_POINT */
	
	  if (true) {
	    module.exports = R;
	  } else if (typeof define === 'function' && define.amd) {
	    define(function() { return R; });
	  } else {
	    this.R = R;
	  }
	
	}.call(this));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var curryN = __webpack_require__(3);
	
	'use strict';
	
	function isFunction(obj) {
	  return !!(obj && obj.constructor && obj.call && obj.apply);
	}
	
	// Globals
	var toUpdate = [];
	var inStream;
	
	function map(f, s) {
	  return stream([s], function(self) { self(f(s.val)); });
	}
	
	function on(f, s) {
	  stream([s], function() { f(s.val); });
	}
	
	function boundMap(f) { return map(f, this); }
	
	var scan = curryN(3, function(f, acc, s) {
	  var ns = stream([s], function() {
	    return (acc = f(acc, s()));
	  });
	  if (!ns.hasVal) ns(acc);
	  return ns;
	});
	
	var merge = curryN(2, function(s1, s2) {
	  var s = immediate(stream([s1, s2], function(n, changed) {
	    return changed[0] ? changed[0]()
	         : s1.hasVal  ? s1()
	                      : s2();
	  }));
	  endsOn(stream([s1.end, s2.end], function(self, changed) {
	    return true;
	  }), s);
	  return s;
	});
	
	function ap(s2) {
	  var s1 = this;
	  return stream([s1, s2], function() { return s1()(s2()); });
	}
	
	function initialDepsNotMet(stream) {
	  stream.depsMet = stream.deps.every(function(s) {
	    return s.hasVal;
	  });
	  return !stream.depsMet;
	}
	
	function updateStream(s) {
	  if ((s.depsMet !== true && initialDepsNotMet(s)) ||
	      (s.end !== undefined && s.end.val === true)) return;
	  if (inStream !== undefined) {
	    toUpdate.push(s);
	    return;
	  }
	  inStream = s;
	  var returnVal = s.fn(s, s.depsChanged);
	  if (returnVal !== undefined) {
	    s(returnVal);
	  }
	  inStream = undefined;
	  if (s.depsChanged !== undefined) s.depsChanged = [];
	  s.shouldUpdate = false;
	  if (flushing === false) flushUpdate();
	}
	
	var order = [];
	var orderNextIdx = -1;
	
	function findDeps(s) {
	  var i, listeners = s.listeners;
	  if (s.queued === false) {
	    s.queued = true;
	    for (i = 0; i < listeners.length; ++i) {
	      findDeps(listeners[i]);
	    }
	    order[++orderNextIdx] = s;
	  }
	}
	
	function updateDeps(s) {
	  var i, o, list, listeners = s.listeners;
	  for (i = 0; i < listeners.length; ++i) {
	    list = listeners[i];
	    if (list.end === s) {
	      endStream(list);
	    } else {
	      if (list.depsChanged !== undefined) list.depsChanged.push(s);
	      list.shouldUpdate = true;
	      findDeps(list);
	    }
	  }
	  for (; orderNextIdx >= 0; --orderNextIdx) {
	    o = order[orderNextIdx];
	    if (o.shouldUpdate === true) updateStream(o);
	    o.queued = false;
	  }
	}
	
	var flushing = false;
	
	function flushUpdate() {
	  flushing = true;
	  while (toUpdate.length > 0) {
	    var s = toUpdate.shift();
	    if (s.vals.length > 0) s.val = s.vals.shift();
	    updateDeps(s);
	  }
	  flushing = false;
	}
	
	function isStream(stream) {
	  return isFunction(stream) && 'hasVal' in stream;
	}
	
	function streamToString() {
	  return 'stream(' + this.val + ')';
	}
	
	function updateStreamValue(s, n) {
	  if (n !== undefined && n !== null && isFunction(n.then)) {
	    n.then(s);
	    return;
	  }
	  s.val = n;
	  s.hasVal = true;
	  if (inStream === undefined) {
	    flushing = true;
	    updateDeps(s);
	    if (toUpdate.length > 0) flushUpdate(); else flushing = false;
	  } else if (inStream === s) {
	    markListeners(s, s.listeners);
	  } else {
	    s.vals.push(n);
	    toUpdate.push(s);
	  }
	}
	
	function markListeners(s, lists) {
	  var i, list;
	  for (i = 0; i < lists.length; ++i) {
	    list = lists[i];
	    if (list.end !== s) {
	      if (list.depsChanged !== undefined) {
	        list.depsChanged.push(s);
	      }
	      list.shouldUpdate = true;
	    } else {
	      endStream(list);
	    }
	  }
	}
	
	function createStream() {
	  function s(n) {
	    return arguments.length > 0 ? (updateStreamValue(s, n), s)
	                                : s.val;
	  }
	  s.hasVal = false;
	  s.val = undefined;
	  s.vals = [];
	  s.listeners = [];
	  s.queued = false;
	  s.end = undefined;
	
	  s.map = boundMap;
	  s.ap = ap;
	  s.of = stream;
	  s.toString = streamToString;
	
	  return s;
	}
	
	function addListeners(deps, s) {
	  for (var i = 0; i < deps.length; ++i) {
	    deps[i].listeners.push(s);
	  }
	}
	
	function createDependentStream(deps, fn) {
	  var s = createStream();
	  s.fn = fn;
	  s.deps = deps;
	  s.depsMet = false;
	  s.depsChanged = fn.length > 1 ? [] : undefined;
	  s.shouldUpdate = false;
	  addListeners(deps, s);
	  return s;
	}
	
	function immediate(s) {
	  if (s.depsMet === false) {
	    s.depsMet = true;
	    updateStream(s);
	  }
	  return s;
	}
	
	function removeListener(s, listeners) {
	  var idx = listeners.indexOf(s);
	  listeners[idx] = listeners[listeners.length - 1];
	  listeners.length--;
	}
	
	function detachDeps(s) {
	  for (var i = 0; i < s.deps.length; ++i) {
	    removeListener(s, s.deps[i].listeners);
	  }
	  s.deps.length = 0;
	}
	
	function endStream(s) {
	  if (s.deps !== undefined) detachDeps(s);
	  if (s.end !== undefined) detachDeps(s.end);
	}
	
	function endsOn(endS, s) {
	  detachDeps(s.end);
	  endS.listeners.push(s.end);
	  s.end.deps.push(endS);
	  return s;
	}
	
	function trueFn() { return true; }
	
	function stream(arg, fn) {
	  var i, s, deps, depEndStreams;
	  var endStream = createDependentStream([], trueFn);
	  if (arguments.length > 1) {
	    deps = []; depEndStreams = [];
	    for (i = 0; i < arg.length; ++i) {
	      if (arg[i] !== undefined) {
	        deps.push(arg[i]);
	        if (arg[i].end !== undefined) depEndStreams.push(arg[i].end);
	      }
	    }
	    s = createDependentStream(deps, fn);
	    s.end = endStream;
	    endStream.listeners.push(s);
	    addListeners(depEndStreams, endStream);
	    endStream.deps = depEndStreams;
	    updateStream(s);
	  } else {
	    s = createStream();
	    s.end = endStream;
	    endStream.listeners.push(s);
	    if (arguments.length === 1) s(arg);
	  }
	  return s;
	}
	
	var transduce = curryN(2, function(xform, source) {
	  xform = xform(new StreamTransformer());
	  return stream([source], function(self) {
	    var res = xform['@@transducer/step'](undefined, source());
	    if (res && res['@@transducer/reduced'] === true) {
	      self.end(true);
	      return res['@@transducer/value'];
	    } else {
	      return res;
	    }
	  });
	});
	
	function StreamTransformer() { }
	StreamTransformer.prototype['@@transducer/init'] = function() { };
	StreamTransformer.prototype['@@transducer/result'] = function() { };
	StreamTransformer.prototype['@@transducer/step'] = function(s, v) { return v; };
	
	module.exports = {
	  stream: stream,
	  isStream: isStream,
	  transduce: transduce,
	  merge: merge,
	  scan: scan,
	  endsOn: endsOn,
	  map: curryN(2, map),
	  on: curryN(2, on),
	  curryN: curryN,
	  immediate: immediate,
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(4);
	var _curry1 = __webpack_require__(5);
	var _curry2 = __webpack_require__(6);
	var _curryN = __webpack_require__(7);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the
	 * specified arity. The curried function has two unusual capabilities.
	 * First, its arguments needn't be provided one at a time. If `g` is
	 * `R.curryN(3, f)`, the following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`,
	 * the following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var addFourNumbers = function() {
	 *        return R.sum([].slice.call(arguments, 0, 4));
	 *      };
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  if (length === 1) {
	    return _curry1(fn);
	  }
	  return _arity(length, _curryN(length, [], fn));
	});


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function _arity(n, fn) {
	  // jshint unused:vars
	  switch (n) {
	    case 0: return function() { return fn.apply(this, arguments); };
	    case 1: return function(a0) { return fn.apply(this, arguments); };
	    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
	    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
	    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
	    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
	    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
	    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	  }
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0) {
	      return f1;
	    } else if (a != null && a['@@functional/placeholder'] === true) {
	      return f1;
	    } else {
	      return fn.apply(this, arguments);
	    }
	  };
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(5);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    var n = arguments.length;
	    if (n === 0) {
	      return f2;
	    } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
	      return f2;
	    } else if (n === 1) {
	      return _curry1(function(b) { return fn(a, b); });
	    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true &&
	                          b != null && b['@@functional/placeholder'] === true) {
	      return f2;
	    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
	      return _curry1(function(a) { return fn(a, b); });
	    } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
	      return _curry1(function(b) { return fn(a, b); });
	    } else {
	      return fn(a, b);
	    }
	  };
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(4);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @return {array} An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (received[combinedIdx] == null ||
	           received[combinedIdx]['@@functional/placeholder'] !== true ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (result == null || result['@@functional/placeholder'] !== true) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var flyd = __webpack_require__(2);
	
	module.exports = flyd.curryN(2, function(targ, fn) {
	  var s = flyd.stream();
	  flyd.map(function(v) { targ(fn(v)); }, s);
	  return s;
	});


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var curryN = __webpack_require__(10);
	
	function isString(s) { return typeof s === 'string'; }
	function isNumber(n) { return typeof n === 'number'; }
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	function isFunction(f) { return typeof f === 'function'; }
	var isArray = Array.isArray || function(a) { return 'length' in a; };
	
	var mapConstrToFn = curryN(2, function(group, constr) {
	  return constr === String    ? isString
	       : constr === Number    ? isNumber
	       : constr === Object    ? isObject
	       : constr === Array     ? isArray
	       : constr === Function  ? isFunction
	       : constr === undefined ? group
	                              : constr;
	});
	
	function Constructor(group, name, validators) {
	  validators = validators.map(mapConstrToFn(group));
	  var constructor = curryN(validators.length, function() {
	    var val = [], v, validator;
	    for (var i = 0; i < arguments.length; ++i) {
	      v = arguments[i];
	      validator = validators[i];
	      if ((typeof validator === 'function' && validator(v)) ||
	          (v !== undefined && v !== null && v.of === validator)) {
	        val[i] = arguments[i];
	      } else {
	        throw new TypeError('wrong value ' + v + ' passed to location ' + i + ' in ' + name);
	      }
	    }
	    val.of = group;
	    val.name = name;
	    return val;
	  });
	  return constructor;
	}
	
	function rawCase(type, cases, action, arg) {
	  if (type !== action.of) throw new TypeError('wrong type passed to case');
	  var name = action.name in cases ? action.name
	           : '_' in cases         ? '_'
	                                  : undefined;
	  if (name === undefined) {
	    throw new Error('unhandled value passed to case');
	  } else {
	    return cases[name].apply(undefined, arg !== undefined ? action.concat([arg]) : action);
	  }
	}
	
	var typeCase = curryN(3, rawCase);
	var caseOn = curryN(4, rawCase);
	
	function Type(desc) {
	  var obj = {};
	  for (var key in desc) {
	    obj[key] = Constructor(obj, key, desc[key]);
	  }
	  obj.case = typeCase(obj);
	  obj.caseOn = caseOn(obj);
	  return obj;
	}
	
	module.exports = Type;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(11);
	var _curryN = __webpack_require__(13);
	var arity = __webpack_require__(14);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the
	 * specified arity. The curried function has two unusual capabilities.
	 * First, its arguments needn't be provided one at a time. If `g` is
	 * `R.curryN(3, f)`, the following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`,
	 * the following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var addFourNumbers = function() {
	 *        return R.sum([].slice.call(arguments, 0, 4));
	 *      };
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  return arity(length, _curryN(length, [], fn));
	});


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(12);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    var n = arguments.length;
	    if (n === 0) {
	      return f2;
	    } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
	      return f2;
	    } else if (n === 1) {
	      return _curry1(function(b) { return fn(a, b); });
	    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true &&
	                          b != null && b['@@functional/placeholder'] === true) {
	      return f2;
	    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
	      return _curry1(function(a) { return fn(a, b); });
	    } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
	      return _curry1(function(b) { return fn(a, b); });
	    } else {
	      return fn(a, b);
	    }
	  };
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0) {
	      return f1;
	    } else if (a != null && a['@@functional/placeholder'] === true) {
	      return f1;
	    } else {
	      return fn(a);
	    }
	  };
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var arity = __webpack_require__(14);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @return {array} An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (received[combinedIdx] == null ||
	           received[combinedIdx]['@@functional/placeholder'] !== true ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (result == null || result['@@functional/placeholder'] !== true) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined) : arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(11);
	
	
	/**
	 * Wraps a function of any arity (including nullary) in a function that accepts exactly `n`
	 * parameters. Unlike `nAry`, which passes only `n` arguments to the wrapped function,
	 * functions produced by `arity` will pass all provided arguments to the wrapped function.
	 *
	 * @func
	 * @memberOf R
	 * @sig (Number, (* -> *)) -> (* -> *)
	 * @category Function
	 * @param {Number} n The desired arity of the returned function.
	 * @param {Function} fn The function to wrap.
	 * @return {Function} A new function wrapping `fn`. The new function is
	 *         guaranteed to be of arity `n`.
	 * @deprecated since v0.15.0
	 * @example
	 *
	 *      var takesTwoArgs = function(a, b) {
	 *        return [a, b];
	 *      };
	 *      takesTwoArgs.length; //=> 2
	 *      takesTwoArgs(1, 2); //=> [1, 2]
	 *
	 *      var takesOneArg = R.arity(1, takesTwoArgs);
	 *      takesOneArg.length; //=> 1
	 *      // All arguments are passed through to the wrapped function
	 *      takesOneArg(1, 2); //=> [1, 2]
	 */
	module.exports = _curry2(function(n, fn) {
	  // jshint unused:vars
	  switch (n) {
	    case 0: return function() {return fn.apply(this, arguments);};
	    case 1: return function(a0) {return fn.apply(this, arguments);};
	    case 2: return function(a0, a1) {return fn.apply(this, arguments);};
	    case 3: return function(a0, a1, a2) {return fn.apply(this, arguments);};
	    case 4: return function(a0, a1, a2, a3) {return fn.apply(this, arguments);};
	    case 5: return function(a0, a1, a2, a3, a4) {return fn.apply(this, arguments);};
	    case 6: return function(a0, a1, a2, a3, a4, a5) {return fn.apply(this, arguments);};
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) {return fn.apply(this, arguments);};
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) {return fn.apply(this, arguments);};
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {return fn.apply(this, arguments);};
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {return fn.apply(this, arguments);};
	    default: throw new Error('First argument to arity must be a non-negative integer no greater than ten');
	  }
	});


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// jshint newcap: false
	/* global require, module, document, Element */
	'use strict';
	
	var VNode = __webpack_require__(16);
	var is = __webpack_require__(17);
	
	function isUndef(s) { return s === undefined; }
	function isDef(s) { return s !== undefined; }
	
	function emptyNodeAt(elm) {
	  return VNode(elm.tagName, {}, [], undefined, elm);
	}
	
	var emptyNode = VNode('', {}, [], undefined, undefined);
	
	var insertedVnodeQueue;
	
	function sameVnode(vnode1, vnode2) {
	  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
	}
	
	function createKeyToOldIdx(children, beginIdx, endIdx) {
	  var i, map = {}, key;
	  for (i = beginIdx; i <= endIdx; ++i) {
	    key = children[i].key;
	    if (isDef(key)) map[key] = i;
	  }
	  return map;
	}
	
	function createRmCb(childElm, listeners) {
	  return function() {
	    if (--listeners === 0) childElm.parentElement.removeChild(childElm);
	  };
	}
	
	var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
	
	function init(modules) {
	  var i, j, cbs = {};
	  for (i = 0; i < hooks.length; ++i) {
	    cbs[hooks[i]] = [];
	    for (j = 0; j < modules.length; ++j) {
	      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
	    }
	  }
	
	  function createElm(vnode) {
	    var i, data = vnode.data;
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
	      if (isDef(i = data.vnode)) vnode = i;
	    }
	    var elm, children = vnode.children, sel = vnode.sel;
	    if (isDef(sel)) {
	      // Parse selector
	      var hashIdx = sel.indexOf('#');
	      var dotIdx = sel.indexOf('.', hashIdx);
	      var hash = hashIdx > 0 ? hashIdx : sel.length;
	      var dot = dotIdx > 0 ? dotIdx : sel.length;
	      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
	      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? document.createElementNS(i, tag)
	                                                          : document.createElement(tag);
	      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
	      if (dotIdx > 0) elm.className = sel.slice(dot+1).replace(/\./g, ' ');
	      if (is.array(children)) {
	        for (i = 0; i < children.length; ++i) {
	          elm.appendChild(createElm(children[i]));
	        }
	      } else if (is.primitive(vnode.text)) {
	        elm.appendChild(document.createTextNode(vnode.text));
	      }
	      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
	      i = vnode.data.hook; // Reuse variable
	      if (isDef(i)) {
	        if (i.create) i.create(emptyNode, vnode);
	        if (i.insert) insertedVnodeQueue.push(vnode);
	      }
	    } else {
	      elm = vnode.elm = document.createTextNode(vnode.text);
	    }
	    return vnode.elm;
	  }
	
	  function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      parentElm.insertBefore(createElm(vnodes[startIdx]), before);
	    }
	  }
	
	  function invokeDestroyHook(vnode) {
	    var i = vnode.data, j;
	    if (isDef(i)) {
	      if (isDef(i = i.hook) && isDef(i = i.destroy)) i(vnode);
	      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
	      if (isDef(i = vnode.children)) {
	        for (j = 0; j < vnode.children.length; ++j) {
	          invokeDestroyHook(vnode.children[j]);
	        }
	      }
	    }
	  }
	
	  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      var i, listeners, rm, ch = vnodes[startIdx];
	      if (isDef(ch)) {
	        if (isDef(ch.sel)) {
	          invokeDestroyHook(ch);
	          listeners = cbs.remove.length + 1;
	          rm = createRmCb(ch.elm, listeners);
	          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
	          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
	            i(ch, rm);
	          } else {
	            rm();
	          }
	        } else { // Text node
	          parentElm.removeChild(ch.elm);
	        }
	      }
	    }
	  }
	
	  function updateChildren(parentElm, oldCh, newCh) {
	    var oldStartIdx = 0, newStartIdx = 0;
	    var oldEndIdx = oldCh.length - 1;
	    var oldStartVnode = oldCh[0];
	    var oldEndVnode = oldCh[oldEndIdx];
	    var newEndIdx = newCh.length - 1;
	    var newStartVnode = newCh[0];
	    var newEndVnode = newCh[newEndIdx];
	    var oldKeyToIdx, idxInOld, elmToMove, before;
	
	    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	      if (isUndef(oldStartVnode)) {
	        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
	      } else if (isUndef(oldEndVnode)) {
	        oldEndVnode = oldCh[--oldEndIdx];
	      } else if (sameVnode(oldStartVnode, newStartVnode)) {
	        patchVnode(oldStartVnode, newStartVnode);
	        oldStartVnode = oldCh[++oldStartIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else if (sameVnode(oldEndVnode, newEndVnode)) {
	        patchVnode(oldEndVnode, newEndVnode);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
	        patchVnode(oldStartVnode, newEndVnode);
	        parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
	        oldStartVnode = oldCh[++oldStartIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
	        patchVnode(oldEndVnode, newStartVnode);
	        parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else {
	        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
	        idxInOld = oldKeyToIdx[newStartVnode.key];
	        if (isUndef(idxInOld)) { // New element
	          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
	          newStartVnode = newCh[++newStartIdx];
	        } else {
	          elmToMove = oldCh[idxInOld];
	          patchVnode(elmToMove, newStartVnode);
	          oldCh[idxInOld] = undefined;
	          parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
	          newStartVnode = newCh[++newStartIdx];
	        }
	      }
	    }
	    if (oldStartIdx > oldEndIdx) {
	      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
	      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
	    } else if (newStartIdx > newEndIdx) {
	      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	    }
	  }
	
	  function patchVnode(oldVnode, vnode) {
	    var i, hook;
	    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
	      i(oldVnode, vnode);
	    }
	    if (isDef(i = oldVnode.data) && isDef(i = i.vnode)) oldVnode = i;
	    if (isDef(i = vnode.data) && isDef(i = i.vnode)) vnode = i;
	    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
	    if (oldVnode === vnode) return;
	    if (isDef(vnode.data)) {
	      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
	      i = vnode.data.hook;
	      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
	    }
	    if (isUndef(vnode.text)) {
	      if (isDef(oldCh) && isDef(ch)) {
	        if (oldCh !== ch) updateChildren(elm, oldCh, ch);
	      } else if (isDef(ch)) {
	        addVnodes(elm, null, ch, 0, ch.length - 1);
	      } else if (isDef(oldCh)) {
	        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
	      }
	    } else if (oldVnode.text !== vnode.text) {
	      elm.textContent = vnode.text;
	    }
	    if (isDef(hook) && isDef(i = hook.postpatch)) {
	      i(oldVnode, vnode);
	    }
	    return vnode;
	  }
	
	  return function(oldVnode, vnode) {
	    var i;
	    insertedVnodeQueue = [];
	    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
	    if (oldVnode instanceof Element) {
	      if (oldVnode.parentElement !== null) {
	        createElm(vnode);
	        oldVnode.parentElement.replaceChild(vnode.elm, oldVnode);
	      } else {
	        oldVnode = emptyNodeAt(oldVnode);
	        patchVnode(oldVnode, vnode);
	      }
	    } else {
	      patchVnode(oldVnode, vnode);
	    }
	    for (i = 0; i < insertedVnodeQueue.length; ++i) {
	      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
	    }
	    insertedVnodeQueue = undefined;
	    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
	    return vnode;
	  };
	}
	
	module.exports = {init: init};


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(sel, data, children, text, elm) {
	  var key = data === undefined ? undefined : data.key;
	  return {sel: sel, data: data, children: children,
	          text: text, elm: elm, key: key};
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = {
	  array: Array.isArray,
	  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	function updateClass(oldVnode, vnode) {
	  var cur, name, elm = vnode.elm,
	      oldClass = oldVnode.data.class || {},
	      klass = vnode.data.class || {};
	  for (name in klass) {
	    cur = klass[name];
	    if (cur !== oldClass[name]) {
	      elm.classList[cur ? 'add' : 'remove'](name);
	    }
	  }
	}
	
	module.exports = {create: updateClass, update: updateClass};


/***/ },
/* 19 */
/***/ function(module, exports) {

	function updateProps(oldVnode, vnode) {
	  var key, cur, old, elm = vnode.elm,
	      oldProps = oldVnode.data.props || {}, props = vnode.data.props || {};
	  for (key in props) {
	    cur = props[key];
	    old = oldProps[key];
	    if (old !== cur) {
	      elm[key] = cur;
	    }
	  }
	}
	
	module.exports = {create: updateProps, update: updateProps};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(17);
	
	function arrInvoker(arr) {
	  return function() {
	    // Special case when length is two, for performance
	    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1));
	  };
	}
	
	function fnInvoker(o) {
	  return function(ev) { o.fn(ev); };
	}
	
	function updateEventListeners(oldVnode, vnode) {
	  var name, cur, old, elm = vnode.elm,
	      oldOn = oldVnode.data.on || {}, on = vnode.data.on;
	  if (!on) return;
	  for (name in on) {
	    cur = on[name];
	    old = oldOn[name];
	    if (old === undefined) {
	      if (is.array(cur)) {
	        elm.addEventListener(name, arrInvoker(cur));
	      } else {
	        cur = {fn: cur};
	        on[name] = cur;
	        elm.addEventListener(name, fnInvoker(cur));
	      }
	    } else if (is.array(old)) {
	      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
	      old.length = cur.length;
	      for (var i = 0; i < old.length; ++i) old[i] = cur[i];
	      on[name]  = old;
	    } else {
	      old.fn = cur;
	      on[name] = old;
	    }
	  }
	}
	
	module.exports = {create: updateEventListeners, update: updateEventListeners};


/***/ },
/* 21 */
/***/ function(module, exports) {

	var raf = requestAnimationFrame || setTimeout;
	var nextFrame = function(fn) { raf(function() { raf(fn); }); };
	
	function setNextFrame(obj, prop, val) {
	  nextFrame(function() { obj[prop] = val; });
	}
	
	function updateStyle(oldVnode, vnode) {
	  var cur, name, elm = vnode.elm,
	      oldStyle = oldVnode.data.style || {},
	      style = vnode.data.style || {},
	      oldHasDel = 'delayed' in oldStyle;
	  for (name in style) {
	    cur = style[name];
	    if (name === 'delayed') {
	      for (name in style.delayed) {
	        cur = style.delayed[name];
	        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
	          setNextFrame(elm.style, name, cur);
	        }
	      }
	    } else if (name !== 'remove' && cur !== oldStyle[name]) {
	      elm.style[name] = cur;
	    }
	  }
	}
	
	function applyDestroyStyle(vnode) {
	  var style, name, elm = vnode.elm, s = vnode.data.style;
	  if (!s || !(style = s.destroy)) return;
	  for (name in style) {
	    elm.style[name] = style[name];
	  }
	}
	
	function applyRemoveStyle(vnode, rm) {
	  var s = vnode.data.style;
	  if (!s || !s.remove) {
	    rm();
	    return;
	  }
	  var name, elm = vnode.elm, idx, i = 0, maxDur = 0,
	      compStyle, style = s.remove, amount = 0, applied = [];
	  for (name in style) {
	    applied.push(name);
	    elm.style[name] = style[name];
	  }
	  compStyle = getComputedStyle(elm);
	  var props = compStyle['transition-property'].split(', ');
	  for (; i < props.length; ++i) {
	    if(applied.indexOf(props[i]) !== -1) amount++;
	  }
	  elm.addEventListener('transitionend', function(ev) {
	    if (ev.target === elm) --amount;
	    if (amount === 0) rm();
	  });
	}
	
	module.exports = {create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var VNode = __webpack_require__(16);
	var is = __webpack_require__(17);
	
	module.exports = function h(sel, b, c) {
	  var data = {}, children, text, i;
	  if (arguments.length === 3) {
	    data = b;
	    if (is.array(c)) { children = c; }
	    else if (is.primitive(c)) { text = c; }
	  } else if (arguments.length === 2) {
	    if (is.array(b)) { children = b; }
	    else if (is.primitive(b)) { text = b; }
	    else { data = b; }
	  }
	  if (is.array(children)) {
	    for (i = 0; i < children.length; ++i) {
	      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
	    }
	  }
	  return VNode(sel, data, children, text, undefined);
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * cuid.js
	 * Collision-resistant UID generator for browsers and node.
	 * Sequential for fast db lookups and recency sorting.
	 * Safe for element IDs and server-side lookups.
	 *
	 * Extracted from CLCTR
	 *
	 * Copyright (c) Eric Elliott 2012
	 * MIT License
	 */
	
	/*global window, navigator, document, require, process, module */
	(function (app) {
	  'use strict';
	  var namespace = 'cuid',
	    c = 0,
	    blockSize = 4,
	    base = 36,
	    discreteValues = Math.pow(base, blockSize),
	
	    pad = function pad(num, size) {
	      var s = "000000000" + num;
	      return s.substr(s.length-size);
	    },
	
	    randomBlock = function randomBlock() {
	      return pad((Math.random() *
	            discreteValues << 0)
	            .toString(base), blockSize);
	    },
	
	    safeCounter = function () {
	      c = (c < discreteValues) ? c : 0;
	      c++; // this is not subliminal
	      return c - 1;
	    },
	
	    api = function cuid() {
	      // Starting with a lowercase letter makes
	      // it HTML element ID friendly.
	      var letter = 'c', // hard-coded allows for sequential access
	
	        // timestamp
	        // warning: this exposes the exact date and time
	        // that the uid was created.
	        timestamp = (new Date().getTime()).toString(base),
	
	        // Prevent same-machine collisions.
	        counter,
	
	        // A few chars to generate distinct ids for different
	        // clients (so different computers are far less
	        // likely to generate the same id)
	        fingerprint = api.fingerprint(),
	
	        // Grab some more chars from Math.random()
	        random = randomBlock() + randomBlock();
	
	        counter = pad(safeCounter().toString(base), blockSize);
	
	      return  (letter + timestamp + counter + fingerprint + random);
	    };
	
	  api.slug = function slug() {
	    var date = new Date().getTime().toString(36),
	      counter,
	      print = api.fingerprint().slice(0,1) +
	        api.fingerprint().slice(-1),
	      random = randomBlock().slice(-2);
	
	      counter = safeCounter().toString(36).slice(-4);
	
	    return date.slice(-2) +
	      counter + print + random;
	  };
	
	  api.globalCount = function globalCount() {
	    // We want to cache the results of this
	    var cache = (function calc() {
	        var i,
	          count = 0;
	
	        for (i in window) {
	          count++;
	        }
	
	        return count;
	      }());
	
	    api.globalCount = function () { return cache; };
	    return cache;
	  };
	
	  api.fingerprint = function browserPrint() {
	    return pad((navigator.mimeTypes.length +
	      navigator.userAgent.length).toString(36) +
	      api.globalCount().toString(36), 4);
	  };
	
	  // don't change anything from here down.
	  if (app.register) {
	    app.register(namespace, api);
	  } else if (true) {
	    module.exports = api;
	  } else {
	    app[namespace] = api;
	  }
	
	}(this.applitude || this));


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var R = __webpack_require__(1);
	var Type = __webpack_require__(9);
	var h = __webpack_require__(22);
	var grabText = function grabText(e) {
	  return e.target.value;
	};
	var checkLength = function checkLength(str) {
	  return str.length > 2 ? str : "";
	};
	
	// model
	
	var init = function init(_) {
	  return '';
	};
	
	// update
	
	var Action = Type({
	  Input: [Object]
	});
	var update = Action.caseOn({
	  Input: R.compose(checkLength, grabText)
	});
	
	// view
	
	var view = function view(_ref) {
	  var filter$ = _ref.filter$;
	  return h("div.ui.segment", [h("dib.ui.horizontal.divider", "SEARCH CONTACT"), h("div.ui.icon.input.fluid", [h('input', {
	    props: { placeholder: "Search", type: "text" },
	    on: { input: R.compose(filter$, Action.Input) }
	  }), h("i.search.icon")])]);
	};
	
	exports['default'] = { view: view, init: init, update: update, Action: Action };
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	var R = __webpack_require__(1);
	var Type = __webpack_require__(9);
	var h = __webpack_require__(22);
	
	// model
	
	var init = function init() {
	  return { email: '', firstname: '', lastname: '' };
	};
	var preventDeafult = function preventDeafult(e) {
	  e.preventDefault();return e;
	};
	
	// update
	
	var Action = Type({
	  Submit: [Object]
	});
	var update = Action.caseOn({
	  Submit: function Submit(e) {
	    var _e$target$elements = e.target.elements;
	    var email = _e$target$elements.email;
	    var firstname = _e$target$elements.firstname;
	    var lastname = _e$target$elements.lastname;
	
	    var data = { email: email.value,
	      firstname: firstname.value,
	      lastname: lastname.value };
	    return { data: data, context: [email, firstname, lastname] };
	  }
	});
	
	// view
	
	var makeField = function makeField(_ref) {
	  var id = _ref.id;
	  var placeholder = _ref.placeholder;
	  var value = _ref.value;
	  var error = _ref.error;
	  var _ref$icoName = _ref.icoName;
	  var icoName = _ref$icoName === undefined ? ".user" : _ref$icoName;
	  return h('div.field' + error, [h('div.ui.icon.input', [h('input' + id, {
	    props: {
	      type: "text",
	      form: "form",
	      placeholder: placeholder,
	      value: value },
	    value: value }), h('i.icon' + icoName)])]);
	};
	
	var view = function view(_ref2, _ref3) {
	  var submit$ = _ref2.submit$;
	
	  var _ref32 = _slicedToArray(_ref3, 2);
	
	  var _ref32$0 = _ref32[0];
	  _ref32$0 = _ref32$0 === undefined ? {} : _ref32$0;
	  var _ref32$0$email = _ref32$0.email;
	  var email = _ref32$0$email === undefined ? "" : _ref32$0$email;
	  var _ref32$0$firstname = _ref32$0.firstname;
	  var firstname = _ref32$0$firstname === undefined ? "" : _ref32$0$firstname;
	  var _ref32$0$lastname = _ref32$0.lastname;
	  var lastname = _ref32$0$lastname === undefined ? "" : _ref32$0$lastname;
	  var _ref32$1 = _ref32[1];
	  _ref32$1 = _ref32$1 === undefined ? {} : _ref32$1;
	  var _ref32$1$emailError = _ref32$1.emailError;
	  var emailError = _ref32$1$emailError === undefined ? "" : _ref32$1$emailError;
	  var _ref32$1$firstnameError = _ref32$1.firstnameError;
	  var firstnameError = _ref32$1$firstnameError === undefined ? "" : _ref32$1$firstnameError;
	  var _ref32$1$lastnameError = _ref32$1.lastnameError;
	  var lastnameError = _ref32$1$lastnameError === undefined ? "" : _ref32$1$lastnameError;
	  return h("div.ui.segment", [h("dib.ui.horizontal.divider", "ADD CONTACT"), h("form.ui.form", { on: { submit: R.compose(submit$, Action.Submit, preventDeafult) }, key: "11111" }, [makeField({ id: "#firstname",
	    placeholder: "First name",
	    error: firstnameError,
	    value: firstname }), makeField({ id: "#lastname",
	    placeholder: "Last name",
	    error: lastnameError,
	    value: lastname }), makeField({ id: "#email",
	    placeholder: "Email",
	    error: emailError,
	    icoName: ".at",
	    value: email }), h("button.ui.basic.button.fluid", { props: { type: "submit" } }, [h("i.add.user.icon"), "  Save"])])]);
	};
	
	exports['default'] = { view: view, init: init, update: update, Action: Action };
	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var R = __webpack_require__(1);
	var Type = __webpack_require__(9);
	var h = __webpack_require__(22);
	
	// model
	
	var init = function init(_) {
	  return { email: "key@key.com", firstname: "key", lastname: "key", _id: "test_id1106306" };
	};
	
	// update
	
	var Action = Type({
	  Edit: [Object]
	});
	
	var update = Action.caseOn({
	  Edit: function Edit(newAdr, model) {
	    return R.merge(model, newAdr);
	  }
	});
	
	// view
	
	var view = function view(_ref, item) {
	  var edit$ = _ref.edit$;
	  var remove$ = _ref.remove$;
	  var disabled = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
	  return h('tr.' + item._id + disabled, [h("td", '' + item.firstname), h("td", '' + item.lastname), h("td", '' + item.email), h("td.center.aligned", [h('i.edit.icon.large.link', {
	    on: { click: edit$ }
	  })]), h("td.center.aligned", [h('i.remove.user.large.icon.link', {
	    on: { click: remove$ }
	  })])]);
	};
	
	exports['default'] = { view: view, init: init, update: update, Action: Action };
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _ramda = __webpack_require__(1);
	
	var _ramda2 = _interopRequireDefault(_ramda);
	
	var _dataValidation = __webpack_require__(28);
	
	function isNameValid(label, name) {
	  if (label === undefined) label = "";
	
	  return (/^[\d\w]+$/.test(name) ? (0, _dataValidation.Success)(name) : (0, _dataValidation.Failure)([[label, ".error"]])
	  );
	}
	
	function isEmailValid(email) {
	  return (/^\S+@\S+\.\S+/.test(email) ? (0, _dataValidation.Success)(email) : (0, _dataValidation.Failure)([["emailError", ".error"]])
	  );
	}
	
	function isFormValid(_ref) {
	  var firstname = _ref.firstname;
	  var lastname = _ref.lastname;
	  var email = _ref.email;
	
	  return (0, _dataValidation.Success)(_ramda2["default"].curry(function (fname, lname, email) {
	    return [fname, lname, email];
	  })).ap(isNameValid("firstnameError", firstname)).ap(isNameValid("lastnameError", lastname)).ap(isEmailValid(email));
	}
	
	function isFormValidBool(form) {
	  return isFormValid(form).isSuccess;
	}
	
	function isFormWrongBool(form) {
	  return isFormValid(form).isFailure;
	}
	
	function makeErrorObject(form) {
	  var formChecked = isFormValid(form);
	  return formChecked.isFailure ? _ramda2["default"].fromPairs(formChecked.merge()) : {};
	}
	
	////////////////
	
	function deepFreeze(o) {
	  var prop, propKey;
	  Object.freeze(o);
	  for (propKey in o) {
	    prop = o[propKey];
	    if (!o.hasOwnProperty(propKey) || !(typeof prop === 'object') || Object.isFrozen(prop)) {
	      continue;
	    }
	    deepFreeze(prop);
	  }
	  return o;
	}
	
	var addDefaultUniq = function addDefaultUniq(defItem, key, items) {
	  return _ramda2["default"].containsWith(function (a, b) {
	    return a[key] === b[key];
	  }, defItem, items) ? items : _ramda2["default"].append(defItem, items);
	};
	
	var safeJSONParse = function safeJSONParse(str) {
	  return JSON.parse(str) || { list: [] };
	};
	var mergeWithDefault = function mergeWithDefault(adresses) {
	  var defaultAdresses = [{ email: "key@key.com", firstname: "key", lastname: "key", _id: "test_id1106306" }];
	  return { list: addDefaultUniq(defaultAdresses[0], "_id", adresses.list), filter: '', editing: [], error: [] };
	};
	
	var findAnyMatchingString = function findAnyMatchingString(str) {
	  return _ramda2["default"].compose(_ramda2["default"].any(_ramda2["default"].test(RegExp(str))), _ramda2["default"].values);
	};
	
	exports["default"] = {
	  isFormValidBool: isFormValidBool,
	  isFormWrongBool: isFormWrongBool,
	  makeErrorObject: makeErrorObject,
	  deepFreeze: deepFreeze,
	  safeJSONParse: safeJSONParse,
	  mergeWithDefault: mergeWithDefault,
	  findAnyMatchingString: findAnyMatchingString
	};
	module.exports = exports["default"];

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
	//
	// Permission is hereby granted, free of charge, to any person
	// obtaining a copy of this software and associated documentation files
	// (the "Software"), to deal in the Software without restriction,
	// including without limitation the rights to use, copy, modify, merge,
	// publish, distribute, sublicense, and/or sell copies of the Software,
	// and to permit persons to whom the Software is furnished to do so,
	// subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be
	// included in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	module.exports = __webpack_require__(29)

/***/ },
/* 29 */
/***/ function(module, exports) {

	// Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
	//
	// Permission is hereby granted, free of charge, to any person
	// obtaining a copy of this software and associated documentation files
	// (the "Software"), to deal in the Software without restriction,
	// including without limitation the rights to use, copy, modify, merge,
	// publish, distribute, sublicense, and/or sell copies of the Software,
	// and to permit persons to whom the Software is furnished to do so,
	// subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be
	// included in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	/**
	 * @module lib/validation
	 */
	module.exports = Validation
	
	// -- Aliases ----------------------------------------------------------
	var clone         = Object.create
	var unimplemented = function(){ throw new Error('Not implemented.') }
	var noop          = function(){ return this                         }
	
	
	// -- Implementation ---------------------------------------------------
	
	/**
	 * The `Validation[α, β]` is a disjunction that's more appropriate for
	 * validating inputs, or any use case where you want to aggregate failures. Not
	 * only does the `Validation` provide a better terminology for working with
	 * such cases (`Failure` and `Success` versus `Failure` and `Success`), it also
	 * allows one to easily aggregate failures and successes as an Applicative
	 * Functor.
	 *
	 * @class
	 * @summary
	 * Validation[α, β] <: Applicative[β]
	 *                   , Functor[β]
	 *                   , Show
	 *                   , Eq
	 */
	function Validation() { }
	
	Failure.prototype = clone(Validation.prototype)
	function Failure(a) {
	  this.value = a
	}
	
	Success.prototype = clone(Validation.prototype)
	function Success(a) {
	  this.value = a
	}
	
	// -- Constructors -----------------------------------------------------
	
	/**
	 * Constructs a new `Validation[α, β]` structure holding a `Failure` value.
	 *
	 * @summary a → Validation[α, β]
	 */
	Validation.Failure = function(a) {
	  return new Failure(a)
	}
	Validation.prototype.Failure = Validation.Failure
	
	/**
	 * Constructs a new `Etiher[α, β]` structure holding a `Success` value.
	 *
	 * @summary β → Validation[α, β]
	 */
	Validation.Success = function(a) {
	  return new Success(a)
	}
	Validation.prototype.Success = Validation.Success
	
	
	// -- Conversions ------------------------------------------------------
	
	/**
	 * Constructs a new `Validation[α, β]` structure from a nullable type.
	 *
	 * Takes the `Failure` case if the value is `null` or `undefined`. Takes the
	 * `Success` case otherwise.
	 *
	 * @summary α → Validation[α, α]
	 */
	Validation.fromNullable = function(a) {
	  return a != null?       this.Success(a)
	  :      /* otherwise */  this.Failure(a)
	}
	Validation.prototype.fromNullable = Validation.fromNullable
	
	/**
	 * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
	 *
	 * @summary Either[α, β] → Validation[α, β]
	 */
	Validation.fromEither = function(a) {
	  return a.fold(this.Failure.bind(this), this.Success.bind(this))
	}
	
	
	// -- Predicates -------------------------------------------------------
	
	/**
	 * True if the `Validation[α, β]` contains a `Failure` value.
	 *
	 * @summary Boolean
	 */
	Validation.prototype.isFailure = false
	Failure.prototype.isFailure    = true
	
	/**
	 * True if the `Validation[α, β]` contains a `Success` value.
	 *
	 * @summary Boolean
	 */
	Validation.prototype.isSuccess = false
	Success.prototype.isSuccess    = true
	
	
	// -- Applicative ------------------------------------------------------
	
	/**
	 * Creates a new `Validation[α, β]` instance holding the `Success` value `b`.
	 *
	 * `b` can be any value, including `null`, `undefined` or another
	 * `Validation[α, β]` structure.
	 *
	 * @summary β → Validation[α, β]
	 */
	Validation.of = function(a) {
	  return this.Success(a)
	}
	Validation.prototype.of = Validation.of
	
	
	/**
	 * Applies the function inside the `Success` case of the `Validation[α, β]` structure
	 * to another applicative type.
	 *
	 * The `Validation[α, β]` should contain a function value, otherwise a `TypeError`
	 * is thrown.
	 *
	 * @method
	 * @summary (@Validation[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
	 */
	Validation.prototype.ap = unimplemented
	
	Failure.prototype.ap = function(b) {
	  return b.isFailure?     this.Failure(this.value.concat(b.value))
	  :      /* otherwise */  this
	}
	
	Success.prototype.ap = function(b) {
	  return b.isFailure?     b
	  :      /* otherwise */  b.map(this.value)
	}
	
	
	// -- Functor ----------------------------------------------------------
	
	/**
	 * Transforms the `Success` value of the `Validation[α, β]` structure using a regular
	 * unary function.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => (β → γ) → Validation[α, γ]
	 */
	Validation.prototype.map = unimplemented
	Failure.prototype.map    = noop
	
	Success.prototype.map = function(f) {
	  return this.of(f(this.value))
	}
	
	
	// -- Show -------------------------------------------------------------
	
	/**
	 * Returns a textual representation of the `Validation[α, β]` structure.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => Void → String
	 */
	Validation.prototype.toString = unimplemented
	
	Failure.prototype.toString = function() {
	  return 'Validation.Failure(' + this.value + ')'
	}
	
	Success.prototype.toString = function() {
	  return 'Validation.Success(' + this.value + ')'
	}
	
	
	// -- Eq ---------------------------------------------------------------
	
	/**
	 * Tests if an `Validation[α, β]` structure is equal to another `Validation[α, β]`
	 * structure.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => Validation[α, β] → Boolean
	 */
	Validation.prototype.isEqual = unimplemented
	
	Failure.prototype.isEqual = function(a) {
	  return a.isFailure && (a.value === this.value)
	}
	
	Success.prototype.isEqual = function(a) {
	  return a.isSuccess && (a.value === this.value)
	}
	
	
	// -- Extracting and recovering ----------------------------------------
	
	/**
	 * Extracts the `Success` value out of the `Validation[α, β]` structure, if it
	 * exists. Otherwise throws a `TypeError`.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => Void → β         :: partial, throws
	 * @see {@link module:lib/validation~Validation#getOrElse} — A getter that can handle failures.
	 * @see {@link module:lib/validation~Validation#merge} — The convergence of both values.
	 * @throws {TypeError} if the structure has no `Success` value.
	 */
	Validation.prototype.get = unimplemented
	
	Failure.prototype.get = function() {
	  throw new TypeError("Can't extract the value of a Failure(a).")
	}
	
	Success.prototype.get = function() {
	  return this.value
	}
	
	
	/**
	 * Extracts the `Success` value out of the `Validation[α, β]` structure. If the
	 * structure doesn't have a `Success` value, returns the given default.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => β → β
	 */
	Validation.prototype.getOrElse = unimplemented
	
	Failure.prototype.getOrElse = function(a) {
	  return a
	}
	
	Success.prototype.getOrElse = function(_) {
	  return this.value
	}
	
	
	/**
	 * Transforms a `Failure` value into a new `Validation[α, β]` structure. Does nothing
	 * if the structure contain a `Success` value.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => (α → Validation[γ, β]) → Validation[γ, β]
	 */
	Validation.prototype.orElse = unimplemented
	Success.prototype.orElse    = noop
	
	Failure.prototype.orElse = function(f) {
	  return f(this.value)
	}
	
	
	/**
	 * Returns the value of whichever side of the disjunction that is present.
	 *
	 * @summary (@Validation[α, α]) => Void → α
	 */
	Validation.prototype.merge = function() {
	  return this.value
	}
	
	
	// -- Folds and Extended Transformations -------------------------------
	
	/**
	 * Applies a function to each case in this data structure.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => (α → γ), (β → γ) → γ
	 */
	Validation.prototype.fold = unimplemented
	
	Failure.prototype.fold = function(f, _) {
	  return f(this.value)
	}
	
	Success.prototype.fold = function(_, g) {
	  return g(this.value)
	}
	
	/**
	 * Catamorphism.
	 * 
	 * @method
	 * @summary (@Validation[α, β]) => { Success: α → γ, Failure: α → γ } → γ
	 */
	Validation.prototype.cata = unimplemented
	
	Failure.prototype.cata = function(pattern) {
	  return pattern.Failure(this.value)
	}
	
	Success.prototype.cata = function(pattern) {
	  return pattern.Success(this.value)
	}
	
	
	/**
	 * Swaps the disjunction values.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => Void → Validation[β, α]
	 */
	Validation.prototype.swap = unimplemented
	
	Failure.prototype.swap = function() {
	  return this.Success(this.value)
	}
	
	Success.prototype.swap = function() {
	  return this.Failure(this.value)
	}
	
	
	/**
	 * Maps both sides of the disjunction.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => (α → γ), (β → δ) → Validation[γ, δ]
	 */
	Validation.prototype.bimap = unimplemented
	
	Failure.prototype.bimap = function(f, _) {
	  return this.Failure(f(this.value))
	}
	
	Success.prototype.bimap = function(_, g) {
	  return this.Success(g(this.value))
	}
	
	
	/**
	 * Maps the failure side of the disjunction.
	 *
	 * @method
	 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
	 */
	Validation.prototype.failureMap = unimplemented
	Success.prototype.failureMap    = noop
	
	Failure.prototype.failureMap = function(f) {
	  return this.Failure(f(this.value))
	}
	
	/**
	 * Maps the failure side of the disjunction.
	 *
	 * @method
	 * @deprecated in favour of {@link module:lib/validation~Validation#failureMap}
	 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
	 */
	Validation.prototype.leftMap = Validation.prototype.failureMap
	Success.prototype.leftMap    = Success.prototype.failureMap
	Failure.prototype.leftMap    = Failure.prototype.failureMap

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA0MWM0ODBmNTVhNzMyZmI2NGYyOSIsIndlYnBhY2s6Ly8vZDovX3Byb2cvanVyU3R2LmdpdGh1Yi5pby9hZHJlc3NCb29rLUVsbV9hcmNoL3NyYy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yYW1kYS9kaXN0L3JhbWRhLmpzIiwid2VicGFjazovLy8uL34vZmx5ZC9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yYW1kYS9zcmMvY3VycnlOLmpzIiwid2VicGFjazovLy8uL34vcmFtZGEvc3JjL2ludGVybmFsL19hcml0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzIiwid2VicGFjazovLy8uL34vcmFtZGEvc3JjL2ludGVybmFsL19jdXJyeTIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yYW1kYS9zcmMvaW50ZXJuYWwvX2N1cnJ5Ti5qcyIsIndlYnBhY2s6Ly8vLi9+L2ZseWQvbW9kdWxlL2ZvcndhcmR0by9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3VuaW9uLXR5cGUvdW5pb24tdHlwZS5qcyIsIndlYnBhY2s6Ly8vLi9+L3VuaW9uLXR5cGUvfi9yYW1kYS9zcmMvY3VycnlOLmpzIiwid2VicGFjazovLy8uL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkyLmpzIiwid2VicGFjazovLy8uL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzIiwid2VicGFjazovLy8uL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnlOLmpzIiwid2VicGFjazovLy8uL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9hcml0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwid2VicGFjazovLy8uL34vc25hYmJkb20vdm5vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zbmFiYmRvbS9pcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwid2VicGFjazovLy8uL34vc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zbmFiYmRvbS9oLmpzIiwid2VicGFjazovLy8uL34vY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIndlYnBhY2s6Ly8vZDovX3Byb2cvanVyU3R2LmdpdGh1Yi5pby9hZHJlc3NCb29rLUVsbV9hcmNoL3NyYy9maWx0ZXJJbnB1dC5qcyIsIndlYnBhY2s6Ly8vZDovX3Byb2cvanVyU3R2LmdpdGh1Yi5pby9hZHJlc3NCb29rLUVsbV9hcmNoL3NyYy9hZHJlc3NGb3JtLmpzIiwid2VicGFjazovLy9kOi9fcHJvZy9qdXJTdHYuZ2l0aHViLmlvL2FkcmVzc0Jvb2stRWxtX2FyY2gvc3JjL3RhYmxlUm93LmpzIiwid2VicGFjazovLy9kOi9fcHJvZy9qdXJTdHYuZ2l0aHViLmlvL2FkcmVzc0Jvb2stRWxtX2FyY2gvc3JjL2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9kYXRhLnZhbGlkYXRpb24vbGliL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vZGF0YS52YWxpZGF0aW9uL2xpYi92YWxpZGF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsU0FBUztBQUN4QixpQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZSxTQUFTO0FBQ3hCLGlCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCLGNBQWE7QUFDYjtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCLGNBQWE7QUFDYjtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsU0FBUztBQUN4QixpQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQixjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlLE9BQU87QUFDdEIsaUJBQWdCLE1BQU07QUFDdEIsZ0JBQWUsU0FBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFlLFNBQVM7QUFDeEIsaUJBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZSxFQUFFO0FBQ2pCLGlCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQSwwQkFBeUI7QUFDekIsNEJBQTJCO0FBQzNCLHdCQUF1QixFQUFFO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsRUFBRTtBQUNqQjtBQUNBLGlCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZSxnQkFBZ0I7QUFDL0IsZ0JBQWUsT0FBTztBQUN0QixnQkFBZSxPQUFPO0FBQ3RCLGlCQUFnQixNQUFNO0FBQ3RCO0FBQ0E7QUFDQSwyQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVCxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVCxNQUFLOztB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSCx3QkFBdUIsVUFBVSxFQUFFO0FBQ25DLElBQUc7QUFDSDtBQUNBOztBQUVBLEVBQUM7Ozs7Ozs7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QUNBO0FBQ0E7QUFDQSx3QkFBdUI7O0FBRXZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUyxpREFBaUQ7QUFDMUQsVUFBUyw2Q0FBNkM7QUFDdEQsYUFBWSxVQUFVO0FBQ3RCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQW9DLGlDQUFpQztBQUNyRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIHtcblx0XHR2YXIgYSA9IGZhY3RvcnkoKTtcblx0XHRmb3IodmFyIGkgaW4gYSkgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiByb290KVtpXSA9IGFbaV07XG5cdH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNDFjNDgwZjU1YTczMmZiNjRmMjlcbiAqKi8iLCJjb25zdCBSID0gcmVxdWlyZSgncmFtZGEnKTtcclxuY29uc3QgZmx5ZCA9IHJlcXVpcmUoJ2ZseWQnKTtcclxuY29uc3QgZm9yd2FyZFRvID0gcmVxdWlyZSgnZmx5ZC9tb2R1bGUvZm9yd2FyZHRvJyk7XHJcbmNvbnN0IFR5cGUgPSByZXF1aXJlKCd1bmlvbi10eXBlJyk7XHJcbmNvbnN0IHBhdGNoID0gcmVxdWlyZSgnc25hYmJkb20nKS5pbml0KFtcclxuICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJyksXHJcbiAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3N0eWxlJyksXHJcbl0pO1xyXG5jb25zdCBoID0gcmVxdWlyZSgnc25hYmJkb20vaCcpO1xyXG5jb25zdCBjdWlkID0gcmVxdWlyZSgnY3VpZCcpO1xyXG5jb25zdCBmaWx0ZXJJbnB1dCA9IHJlcXVpcmUoJy4vZmlsdGVySW5wdXQnKTtcclxuY29uc3QgYWRyZXNzRm9ybSA9IHJlcXVpcmUoJy4vYWRyZXNzRm9ybScpO1xyXG5jb25zdCB0YWJsZVJvdyA9IHJlcXVpcmUoJy4vdGFibGVSb3cnKTtcclxuY29uc3QgeyBpc0Zvcm1WYWxpZEJvb2wsXHJcbiAgaXNGb3JtV3JvbmdCb29sLFxyXG4gIG1ha2VFcnJvck9iamVjdCxcclxuICBzYWZlSlNPTlBhcnNlLFxyXG4gIG1lcmdlV2l0aERlZmF1bHQsXHJcbiAgZmluZEFueU1hdGNoaW5nU3RyaW5nIH0gPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcclxuXHJcbi8vIE1vZGVsIHtsaXN0OiBbYWRyZXNzZXNdLCBmaWx0ZXI6IFN0cmluZywgZWRpdGluZzogQXJyYXksIGVycm9yOiBPYmplY3QgfVxyXG5cclxuY29uc3QgaW5pdCA9ICggc3RvcmVOYW1lID0gJ2FkcmVzcy1ib29rJyApID0+IHtcclxuICB2YXIgaW5pdGlhbCA9ICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yZU5hbWUpO1xyXG4gIGxldCBnZXRBZHIgPSBSLmNvbXBvc2UoIG1lcmdlV2l0aERlZmF1bHQsIHNhZmVKU09OUGFyc2UgKTtcclxuICByZXR1cm4gZ2V0QWRyKGluaXRpYWwpO1xyXG59XHJcblxyXG5jb25zdCBzeW5jID0gKG1vZGVsLCBzdG9yZU5hbWUgPSAnYWRyZXNzLWJvb2snKSA9PiB7XHJcbiAgbGV0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7bGlzdDogbW9kZWwubGlzdH0pO1xyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JlTmFtZSwgZGF0YSk7XHJcbiAgcmV0dXJuIG1vZGVsO1xyXG59XHJcblxyXG5jb25zdCBsb2cgPSBlbCA9PiB7Y29uc29sZS5sb2coZWwpOyByZXR1cm4gZWw7fVxyXG5jb25zdCBlbXB0aWZ5ID0gKGxpc3QpID0+IGxpc3QuZm9yRWFjaCggYyA9PiBjLnZhbHVlID0gXCJcIilcclxuXHJcbi8vIFVwZGF0ZVxyXG5cclxuY29uc3QgQWN0aW9uID0gVHlwZSh7XHJcbiAgQWRkOiBbT2JqZWN0XSxcclxuICBSZW1vdmU6IFtTdHJpbmddLFxyXG4gIFN0YXJ0RWRpdGluZzogW1N0cmluZywgT2JqZWN0XSxcclxuICBNb2RpZnk6IFtTdHJpbmcsIE9iamVjdF0sXHJcbiAgRmlsdGVyOiBbZmlsdGVySW5wdXQuQWN0aW9uXSxcclxuICBFcnJvcmlmeTogW0FycmF5XVxyXG59KTtcclxuXHJcbmNvbnN0IHVwZGF0ZSA9IEFjdGlvbi5jYXNlT24oe1xyXG4gIEZpbHRlcjogKGFjdGlvbiwgbW9kZWwpID0+ICh7Li4ubW9kZWwsIGZpbHRlcjogZmlsdGVySW5wdXQudXBkYXRlKGFjdGlvbiwgbW9kZWwpfSksXHJcbiAgU3RhcnRFZGl0aW5nOiAoaWQsIGFkciwgbW9kZWwpID0+ICh7Li4ubW9kZWwsIGVycm9yOiBbXSwgZWRpdGluZzogW2lkLCBhZHJdfSksXHJcbiAgUmVtb3ZlOiAoaWQsIG1vZGVsKSA9PiBzeW5jKCBSLmV2b2x2ZSh7bGlzdDogUi5yZWplY3QoKGMpID0+IGMuX2lkID09PSBpZCl9LCBtb2RlbCkgKSxcclxuICBBZGQ6IChuZXdBZHIsIG1vZGVsKSA9PiBzeW5jKCBSLmV2b2x2ZSh7XHJcbiAgICAgIGxpc3Q6IFIuYXBwZW5kKCBSLmFzc29jKFwiX2lkXCIsIGN1aWQoKSwgbmV3QWRyKSApLFxyXG4gICAgICBlZGl0aW5nOlIuZHJvcCgyKSxcclxuICAgICAgZXJyb3I6Ui5kcm9wKDIpXHJcbiAgICB9LCBtb2RlbCkgKSxcclxuICBNb2RpZnk6IChpZCwgbmV3RGF0YSwgbW9kZWwpID0+IHN5bmMoIFIuZXZvbHZlKHtcclxuICAgIGxpc3Q6IFIubWFwKCB0ciA9PiAodHIuX2lkID09PSBpZCA/XHJcbiAgICAgIHRhYmxlUm93LnVwZGF0ZSh0YWJsZVJvdy5BY3Rpb24uRWRpdChuZXdEYXRhKSwgdHIpIDogdHIpICksXHJcbiAgICBlZGl0aW5nOlIuZHJvcCgyKSxcclxuICAgIGVycm9yOlIuZHJvcCgyKX0sIG1vZGVsKSApLFxyXG4gIEVycm9yaWZ5OiAoZXJyb3JEYXRhLCBtb2RlbCkgPT4gKHsuLi5tb2RlbCwgZXJyb3I6IGVycm9yRGF0YX0pXHJcbn0pO1xyXG5cclxuY29uc3QgU3ViQWN0aW9uID0gVHlwZSh7XHJcbiAgU3VibWl0Rm9ybTogW2FkcmVzc0Zvcm0uQWN0aW9uXVxyXG59KTtcclxuY29uc3Qgc3ViVXBkYXRlID0gIFN1YkFjdGlvbi5jYXNlT24oe1xyXG4gIFN1Ym1pdEZvcm06IChhY3Rpb24sIG1vZGVsKSA9PiB7XHJcbiAgICBsZXQge2NvbnRleHQsIGRhdGF9ID0gYWRyZXNzRm9ybS51cGRhdGUoYWN0aW9uLCBtb2RlbCk7XHJcbiAgICByZXR1cm4gaXNGb3JtV3JvbmdCb29sKGRhdGEpID9cclxuICAgICAgQWN0aW9uLkVycm9yaWZ5KFtkYXRhLCBtYWtlRXJyb3JPYmplY3QoZGF0YSldKSA6XHJcbiAgICAgICAgbW9kZWwuZWRpdGluZy5sZW5ndGggPT09IDAgP1xyXG4gICAgICAgICAgKCBlbXB0aWZ5KGNvbnRleHQpICwgQWN0aW9uLkFkZChkYXRhKSApIDpcclxuICAgICAgICAgICAgQWN0aW9uLk1vZGlmeShtb2RlbC5lZGl0aW5nWzBdLCBkYXRhKVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBWaWV3XHJcblxyXG5jb25zdCB2aWV3ID0gUi5jdXJyeSgoYWN0aW9ucyQsIG1vZGVsKSA9PiB7XHJcbiAgbGV0IGVkaXRpbmcgPSBtb2RlbC5lZGl0aW5nWzBdIHx8IG51bGw7XHJcbiAgbGV0IGVycm9yID0gbW9kZWwuZXJyb3JbMF0gfHwgbnVsbDtcclxuICBsZXQgZmlsdGVyID0gZmlsdGVySW5wdXQudmlldyh7ZmlsdGVyJDogZm9yd2FyZFRvKGFjdGlvbnMkLCBBY3Rpb24uRmlsdGVyKX0pO1xyXG4gIGxldCBtYWluRm9ybSA9IGFkcmVzc0Zvcm0udmlldyh7XHJcbiAgICBzdWJtaXQkOiBmb3J3YXJkVG8oYWN0aW9ucyQsIFIuY29tcG9zZSggUi5mbGlwKHN1YlVwZGF0ZSkobW9kZWwpLCBTdWJBY3Rpb24uU3VibWl0Rm9ybSApKVxyXG4gIH0sIGVycm9yID8gIG1vZGVsLmVycm9yIDogZWRpdGluZyA/IFIudGFrZUxhc3QoMSwgbW9kZWwuZWRpdGluZykgOiBbXSk7XHJcbiAgbGV0IHRhYmxlID0gbW9kZWwubGlzdC5maWx0ZXIoIGZpbmRBbnlNYXRjaGluZ1N0cmluZyhtb2RlbC5maWx0ZXIpIClcclxuICAgIC5tYXAoIGFkciA9PiB0YWJsZVJvdy52aWV3KHtcclxuICAgICAgZWRpdCQ6IGZvcndhcmRUbyhhY3Rpb25zJCwgUi5hbHdheXMoQWN0aW9uLlN0YXJ0RWRpdGluZyhhZHIuX2lkLCBhZHIpKSksXHJcbiAgICAgIHJlbW92ZSQ6IGZvcndhcmRUbyhhY3Rpb25zJCwgUi5hbHdheXMoQWN0aW9uLlJlbW92ZShhZHIuX2lkKSkpXHJcbiAgICB9LCBhZHIsIGVkaXRpbmcgJiYgIGVkaXRpbmcgPT09IGFkci5faWQgPyBcIi5kaXNhYmxlZFwiIDogXCJcIikgKTtcclxuICByZXR1cm4gaChcImRpdi51aS5ncmlkLmNvbnRhaW5lclwiLFtcclxuICAgIGgoXCJkaXYudWkuZ3JpZC5yb3dcIixbXHJcbiAgICAgICAgaChcImRpdi5maXZlLndpZGUuY29sdW1uXCIsIFtcclxuICAgICAgICAgICAgZmlsdGVyLFxyXG4gICAgICAgICAgICBtYWluRm9ybVxyXG4gICAgICAgICAgXSksXHJcbiAgICAgICAgaChcImRpdi5lbGV2ZW4ud2lkZS5jb2x1bW5cIiwgW1xyXG4gICAgICAgICAgICBoKFwiaDIudWkuY2VudGVyLmFsaWduZWQuaWNvbi5oZWFkZXJcIiwgWyBoKFwiaS51c2Vycy5pY29uXCIpLCBcIkFkcmVzcyBCb29rXCIgXSksXHJcbiAgICAgICAgICAgIGgoXCJ0YWJsZS51aS5iYXNpYy5zZWxlY3RhYmxlLnNpbmdsZS5saW5lLnRhYmxlXCIsXHJcbiAgICAgICAgICAgICAgW2goXCJ0aGVhZFwiLCBbIGgoXCJ0clwiLCBbXHJcbiAgICAgICAgICAgICAgICAgIGgoXCJ0aFwiLCBcIkZpcnN0IE5hbWVcIiksXHJcbiAgICAgICAgICAgICAgICAgIGgoXCJ0aFwiLCBcIkxhc3QgTmFtZVwiKSxcclxuICAgICAgICAgICAgICAgICAgaChcInRoXCIsIFwiRW1haWxcIiksXHJcbiAgICAgICAgICAgICAgICAgIGgoXCJ0aC5jZW50ZXIuYWxpZ25lZFwiLCBcIkVkaXRcIiksXHJcbiAgICAgICAgICAgICAgICAgIGgoXCJ0aC5jZW50ZXIuYWxpZ25lZFwiLCBcIkRlbGV0ZVwiKVxyXG4gICAgICAgICAgICAgICAgXSkgXSksXHJcbiAgICAgICAgICAgICAgICBoKFwidGJvZHlcIiwgW10uY29uY2F0KHRhYmxlKSlcclxuICAgICAgICAgICAgICBdKV0pXHJcbiAgICAgICAgICBdKVxyXG4gICAgICBdKTtcclxufSk7XHJcblxyXG4vLyBTdHJlYW0kXHJcblxyXG5jb25zdCBhY3Rpb25zJCA9IGZseWQuc3RyZWFtKCk7XHJcbmNvbnN0IG1vZGVsJCA9IGZseWQuc2NhbihSLmZsaXAodXBkYXRlKSwgaW5pdCgpLCBhY3Rpb25zJCk7XHJcbmNvbnN0IHZub2RlJCA9IGZseWQubWFwKHZpZXcoYWN0aW9ucyQpLCBtb2RlbCQpO1xyXG4vL2ZseWQubWFwKChub2RlKSA9PiBjb25zb2xlLmxvZyhub2RlKSwgdm5vZGUkKTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpO1xyXG4gIGZseWQuc2NhbihwYXRjaCwgY29udGFpbmVyLCB2bm9kZSQpO1xyXG59KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogZDovX3Byb2cvanVyU3R2LmdpdGh1Yi5pby9hZHJlc3NCb29rLUVsbV9hcmNoL3NyYy9hcHAuanNcbiAqKi8iLCIvLyAgUmFtZGEgdjAuMTcuMVxuLy8gIGh0dHBzOi8vZ2l0aHViLmNvbS9yYW1kYS9yYW1kYVxuLy8gIChjKSAyMDEzLTIwMTUgU2NvdHQgU2F1eWV0LCBNaWNoYWVsIEh1cmxleSwgYW5kIERhdmlkIENoYW1iZXJzXG4vLyAgUmFtZGEgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbjsoZnVuY3Rpb24oKSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgICAqIEEgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSB1c2VkIHRvIHNwZWNpZnkgXCJnYXBzXCIgd2l0aGluIGN1cnJpZWQgZnVuY3Rpb25zLFxuICAgICAqIGFsbG93aW5nIHBhcnRpYWwgYXBwbGljYXRpb24gb2YgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyxcbiAgICAgKiByZWdhcmRsZXNzIG9mIHRoZWlyIHBvc2l0aW9ucy5cbiAgICAgKlxuICAgICAqIElmIGBnYCBpcyBhIGN1cnJpZWQgdGVybmFyeSBmdW5jdGlvbiBhbmQgYF9gIGlzIGBSLl9fYCwgdGhlIGZvbGxvd2luZyBhcmUgZXF1aXZhbGVudDpcbiAgICAgKlxuICAgICAqICAgLSBgZygxLCAyLCAzKWBcbiAgICAgKiAgIC0gYGcoXywgMiwgMykoMSlgXG4gICAgICogICAtIGBnKF8sIF8sIDMpKDEpKDIpYFxuICAgICAqICAgLSBgZyhfLCBfLCAzKSgxLCAyKWBcbiAgICAgKiAgIC0gYGcoXywgMiwgXykoMSwgMylgXG4gICAgICogICAtIGBnKF8sIDIpKDEpKDMpYFxuICAgICAqICAgLSBgZyhfLCAyKSgxLCAzKWBcbiAgICAgKiAgIC0gYGcoXywgMikoXywgMykoMSlgXG4gICAgICpcbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBncmVldCA9IFIucmVwbGFjZSgne25hbWV9JywgUi5fXywgJ0hlbGxvLCB7bmFtZX0hJyk7XG4gICAgICogICAgICBncmVldCgnQWxpY2UnKTsgLy89PiAnSGVsbG8sIEFsaWNlISdcbiAgICAgKi9cbiAgICB2YXIgX18gPSB7ICdAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInOiB0cnVlIH07XG5cbiAgICAvLyBqc2hpbnQgdW51c2VkOnZhcnNcbiAgICB2YXIgX2FyaXR5ID0gZnVuY3Rpb24gX2FyaXR5KG4sIGZuKSB7XG4gICAgICAgIC8vIGpzaGludCB1bnVzZWQ6dmFyc1xuICAgICAgICBzd2l0Y2ggKG4pIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBfYXJpdHkgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyIG5vIGdyZWF0ZXIgdGhhbiB0ZW4nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgX2Nsb25lUmVnRXhwID0gZnVuY3Rpb24gX2Nsb25lUmVnRXhwKHBhdHRlcm4pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocGF0dGVybi5zb3VyY2UsIChwYXR0ZXJuLmdsb2JhbCA/ICdnJyA6ICcnKSArIChwYXR0ZXJuLmlnbm9yZUNhc2UgPyAnaScgOiAnJykgKyAocGF0dGVybi5tdWx0aWxpbmUgPyAnbScgOiAnJykgKyAocGF0dGVybi5zdGlja3kgPyAneScgOiAnJykgKyAocGF0dGVybi51bmljb2RlID8gJ3UnIDogJycpKTtcbiAgICB9O1xuXG4gICAgdmFyIF9jb21wbGVtZW50ID0gZnVuY3Rpb24gX2NvbXBsZW1lbnQoZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICFmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFByaXZhdGUgYGNvbmNhdGAgZnVuY3Rpb24gdG8gbWVyZ2UgdHdvIGFycmF5LWxpa2Ugb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheXxBcmd1bWVudHN9IFtzZXQxPVtdXSBBbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fEFyZ3VtZW50c30gW3NldDI9W11dIEFuIGFycmF5LWxpa2Ugb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldywgbWVyZ2VkIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIF9jb25jYXQoWzQsIDUsIDZdLCBbMSwgMiwgM10pOyAvLz0+IFs0LCA1LCA2LCAxLCAyLCAzXVxuICAgICAqL1xuICAgIHZhciBfY29uY2F0ID0gZnVuY3Rpb24gX2NvbmNhdChzZXQxLCBzZXQyKSB7XG4gICAgICAgIHNldDEgPSBzZXQxIHx8IFtdO1xuICAgICAgICBzZXQyID0gc2V0MiB8fCBbXTtcbiAgICAgICAgdmFyIGlkeDtcbiAgICAgICAgdmFyIGxlbjEgPSBzZXQxLmxlbmd0aDtcbiAgICAgICAgdmFyIGxlbjIgPSBzZXQyLmxlbmd0aDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBpZHggPSAwO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGVuMSkge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gc2V0MVtpZHhdO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbjIpIHtcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHNldDJbaWR4XTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHZhciBfY29udGFpbnNXaXRoID0gZnVuY3Rpb24gX2NvbnRhaW5zV2l0aChwcmVkLCB4LCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKHByZWQoeCwgbGlzdFtpZHhdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBPcHRpbWl6ZWQgaW50ZXJuYWwgdHdvLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIHZhciBfY3VycnkxID0gZnVuY3Rpb24gX2N1cnJ5MShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZjEoYSkge1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZjE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE9wdGltaXplZCBpbnRlcm5hbCB0d28tYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gICAgICovXG4gICAgdmFyIF9jdXJyeTIgPSBmdW5jdGlvbiBfY3VycnkyKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBmMihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmMjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMSAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZjI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmMjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKGEsIGIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE9wdGltaXplZCBpbnRlcm5hbCB0aHJlZS1hcml0eSBjdXJyeSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICB2YXIgX2N1cnJ5MyA9IGZ1bmN0aW9uIF9jdXJyeTMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGYzKGEsIGIsIGMpIHtcbiAgICAgICAgICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGYzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuID09PSAxICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmMztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIChiLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGYzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiAoYiwgYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYiwgYyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYiwgYyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJiBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZjM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiYgYyAhPSBudWxsICYmIGNbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gKGEsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKGEsIGIsIGMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuID09PSAzICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJiBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiAoYiwgYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYiwgYyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKGEsIGIsIGMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuID09PSAzICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uIChiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oYSwgYiwgYyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgY3VycnlOIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBhcml0eSBvZiB0aGUgY3VycmllZCBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHJlY2VpdmVkIHRodXMgZmFyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAgICAgKi9cbiAgICB2YXIgX2N1cnJ5TiA9IGZ1bmN0aW9uIF9jdXJyeU4obGVuZ3RoLCByZWNlaXZlZCwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb21iaW5lZCA9IFtdO1xuICAgICAgICAgICAgdmFyIGFyZ3NJZHggPSAwO1xuICAgICAgICAgICAgdmFyIGxlZnQgPSBsZW5ndGg7XG4gICAgICAgICAgICB2YXIgY29tYmluZWRJZHggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGNvbWJpbmVkSWR4IDwgcmVjZWl2ZWQubGVuZ3RoIHx8IGFyZ3NJZHggPCBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAoY29tYmluZWRJZHggPCByZWNlaXZlZC5sZW5ndGggJiYgKHJlY2VpdmVkW2NvbWJpbmVkSWR4XSA9PSBudWxsIHx8IHJlY2VpdmVkW2NvbWJpbmVkSWR4XVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gIT09IHRydWUgfHwgYXJnc0lkeCA+PSBhcmd1bWVudHMubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZWNlaXZlZFtjb21iaW5lZElkeF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXJndW1lbnRzW2FyZ3NJZHhdO1xuICAgICAgICAgICAgICAgICAgICBhcmdzSWR4ICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbWJpbmVkW2NvbWJpbmVkSWR4XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09IG51bGwgfHwgcmVzdWx0WydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbWJpbmVkSWR4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA8PSAwID8gZm4uYXBwbHkodGhpcywgY29tYmluZWQpIDogX2FyaXR5KGxlZnQsIF9jdXJyeU4obGVuZ3RoLCBjb21iaW5lZCwgZm4pKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgdmFyIF9maWx0ZXIgPSBmdW5jdGlvbiBfZmlsdGVyKGZuLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aCwgcmVzdWx0ID0gW107XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gbGlzdFtpZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdmFyIF9mb3JjZVJlZHVjZWQgPSBmdW5jdGlvbiBfZm9yY2VSZWR1Y2VkKHgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdAQHRyYW5zZHVjZXIvdmFsdWUnOiB4LFxuICAgICAgICAgICAgJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJzogdHJ1ZVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBzdHJhdGVneSBmb3IgZXh0cmFjdGluZyBmdW5jdGlvbiBuYW1lcyBmcm9tIGFuIG9iamVjdFxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gb2JqZWN0IGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIGZ1bmN0aW9uIG5hbWVzLlxuICAgICAqL1xuICAgIHZhciBfZnVuY3Rpb25zV2l0aCA9IGZ1bmN0aW9uIF9mdW5jdGlvbnNXaXRoKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmpba2V5XSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICAgIH0sIGZuKG9iaikpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgX2hhcyA9IGZ1bmN0aW9uIF9oYXMocHJvcCwgb2JqKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbiAgICB9O1xuXG4gICAgdmFyIF9pZGVudGl0eSA9IGZ1bmN0aW9uIF9pZGVudGl0eSh4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCBhbiBvYmplY3QgaXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsIFRoZSBvYmplY3QgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYHZhbGAgaXMgYW4gYXJyYXksIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIF9pc0FycmF5KFtdKTsgLy89PiB0cnVlXG4gICAgICogICAgICBfaXNBcnJheShudWxsKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgX2lzQXJyYXkoe30pOyAvLz0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBfaXNBcnJheSh2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbC5sZW5ndGggPj0gMCAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIHRoZSBwYXNzZWQgYXJndW1lbnQgaXMgYW4gaW50ZWdlci5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSBuXG4gICAgICogQGNhdGVnb3J5IFR5cGVcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIHZhciBfaXNJbnRlZ2VyID0gTnVtYmVyLmlzSW50ZWdlciB8fCBmdW5jdGlvbiBfaXNJbnRlZ2VyKG4pIHtcbiAgICAgICAgcmV0dXJuIG4gPDwgMCA9PT0gbjtcbiAgICB9O1xuXG4gICAgdmFyIF9pc051bWJlciA9IGZ1bmN0aW9uIF9pc051bWJlcih4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IE51bWJlcl0nO1xuICAgIH07XG5cbiAgICB2YXIgX2lzU3RyaW5nID0gZnVuY3Rpb24gX2lzU3RyaW5nKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG4gICAgfTtcblxuICAgIHZhciBfaXNUcmFuc2Zvcm1lciA9IGZ1bmN0aW9uIF9pc1RyYW5zZm9ybWVyKG9iaikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ialsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuXG4gICAgdmFyIF9tYXAgPSBmdW5jdGlvbiBfbWFwKGZuLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aCwgcmVzdWx0ID0gQXJyYXkobGVuKTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgcmVzdWx0W2lkeF0gPSBmbihsaXN0W2lkeF0pO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdmFyIF9waXBlID0gZnVuY3Rpb24gX3BpcGUoZiwgZykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGcuY2FsbCh0aGlzLCBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgX3BpcGVQID0gZnVuY3Rpb24gX3BpcGVQKGYsIGcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdHggPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpLnRoZW4oZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZy5jYWxsKGN0eCwgeCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgdmFyIF9xdW90ZSA9IGZ1bmN0aW9uIF9xdW90ZShzKSB7XG4gICAgICAgIHJldHVybiAnXCInICsgcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInO1xuICAgIH07XG5cbiAgICB2YXIgX3JlZHVjZWQgPSBmdW5jdGlvbiBfcmVkdWNlZCh4KSB7XG4gICAgICAgIHJldHVybiB4ICYmIHhbJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJ10gPyB4IDoge1xuICAgICAgICAgICAgJ0BAdHJhbnNkdWNlci92YWx1ZSc6IHgsXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3JlZHVjZWQnOiB0cnVlXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFuIG9wdGltaXplZCwgcHJpdmF0ZSBhcnJheSBgc2xpY2VgIGltcGxlbWVudGF0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FyZ3VtZW50c3xBcnJheX0gYXJncyBUaGUgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdCB0byBjb25zaWRlci5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2Zyb209MF0gVGhlIGFycmF5IGluZGV4IHRvIHNsaWNlIGZyb20sIGluY2x1c2l2ZS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3RvPWFyZ3MubGVuZ3RoXSBUaGUgYXJyYXkgaW5kZXggdG8gc2xpY2UgdG8sIGV4Y2x1c2l2ZS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBuZXcsIHNsaWNlZCBhcnJheS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBfc2xpY2UoWzEsIDIsIDMsIDQsIDVdLCAxLCAzKTsgLy89PiBbMiwgM11cbiAgICAgKlxuICAgICAqICAgICAgdmFyIGZpcnN0VGhyZWVBcmdzID0gZnVuY3Rpb24oYSwgYiwgYywgZCkge1xuICAgICAqICAgICAgICByZXR1cm4gX3NsaWNlKGFyZ3VtZW50cywgMCwgMyk7XG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgZmlyc3RUaHJlZUFyZ3MoMSwgMiwgMywgNCk7IC8vPT4gWzEsIDIsIDNdXG4gICAgICovXG4gICAgdmFyIF9zbGljZSA9IGZ1bmN0aW9uIF9zbGljZShhcmdzLCBmcm9tLCB0bykge1xuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIF9zbGljZShhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBfc2xpY2UoYXJncywgZnJvbSwgYXJncy5sZW5ndGgpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICAgICAgdmFyIGxlbiA9IE1hdGgubWF4KDAsIE1hdGgubWluKGFyZ3MubGVuZ3RoLCB0bykgLSBmcm9tKTtcbiAgICAgICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgICAgICBsaXN0W2lkeF0gPSBhcmdzW2Zyb20gKyBpZHhdO1xuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUG9seWZpbGwgZnJvbSA8aHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRGF0ZS90b0lTT1N0cmluZz4uXG4gICAgICovXG4gICAgdmFyIF90b0lTT1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhZCA9IGZ1bmN0aW9uIHBhZChuKSB7XG4gICAgICAgICAgICByZXR1cm4gKG4gPCAxMCA/ICcwJyA6ICcnKSArIG47XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0eXBlb2YgRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicgPyBmdW5jdGlvbiBfdG9JU09TdHJpbmcoZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSA6IGZ1bmN0aW9uIF90b0lTT1N0cmluZyhkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC5nZXRVVENGdWxsWWVhcigpICsgJy0nICsgcGFkKGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICsgcGFkKGQuZ2V0VVRDRGF0ZSgpKSArICdUJyArIHBhZChkLmdldFVUQ0hvdXJzKCkpICsgJzonICsgcGFkKGQuZ2V0VVRDTWludXRlcygpKSArICc6JyArIHBhZChkLmdldFVUQ1NlY29uZHMoKSkgKyAnLicgKyAoZC5nZXRVVENNaWxsaXNlY29uZHMoKSAvIDEwMDApLnRvRml4ZWQoMykuc2xpY2UoMiwgNSkgKyAnWic7XG4gICAgICAgIH07XG4gICAgfSgpO1xuXG4gICAgdmFyIF94ZHJvcFJlcGVhdHNXaXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRHJvcFJlcGVhdHNXaXRoKHByZWQsIHhmKSB7XG4gICAgICAgICAgICB0aGlzLnhmID0geGY7XG4gICAgICAgICAgICB0aGlzLnByZWQgPSBwcmVkO1xuICAgICAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNlZW5GaXJzdFZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgWERyb3BSZXBlYXRzV2l0aC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL2luaXQnXSgpO1xuICAgICAgICB9O1xuICAgICAgICBYRHJvcFJlcGVhdHNXaXRoLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShyZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgICBYRHJvcFJlcGVhdHNXaXRoLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgc2FtZUFzTGFzdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnNlZW5GaXJzdFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWVuRmlyc3RWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJlZCh0aGlzLmxhc3RWYWx1ZSwgaW5wdXQpKSB7XG4gICAgICAgICAgICAgICAgc2FtZUFzTGFzdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxhc3RWYWx1ZSA9IGlucHV0O1xuICAgICAgICAgICAgcmV0dXJuIHNhbWVBc0xhc3QgPyByZXN1bHQgOiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvc3RlcCddKHJlc3VsdCwgaW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiBfeGRyb3BSZXBlYXRzV2l0aChwcmVkLCB4Zikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBYRHJvcFJlcGVhdHNXaXRoKHByZWQsIHhmKTtcbiAgICAgICAgfSk7XG4gICAgfSgpO1xuXG4gICAgdmFyIF94ZkJhc2UgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvaW5pdCddKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBfeGZpbHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWEZpbHRlcihmLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5mID0gZjtcbiAgICAgICAgfVxuICAgICAgICBYRmlsdGVyLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgICAgICAgWEZpbHRlci5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IF94ZkJhc2UucmVzdWx0O1xuICAgICAgICBYRmlsdGVyLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mKGlucHV0KSA/IHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBpbnB1dCkgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIF94ZmlsdGVyKGYsIHhmKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFhGaWx0ZXIoZiwgeGYpO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3hmaW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRmluZChmLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5mID0gZjtcbiAgICAgICAgICAgIHRoaXMuZm91bmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBYRmluZC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBfeGZCYXNlLmluaXQ7XG4gICAgICAgIFhGaW5kLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZvdW5kKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKHJlc3VsdCk7XG4gICAgICAgIH07XG4gICAgICAgIFhGaW5kLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5mKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IF9yZWR1Y2VkKHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBpbnB1dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gX3hmaW5kKGYsIHhmKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFhGaW5kKGYsIHhmKTtcbiAgICAgICAgfSk7XG4gICAgfSgpO1xuXG4gICAgdmFyIF94ZmluZEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRmluZEluZGV4KGYsIHhmKSB7XG4gICAgICAgICAgICB0aGlzLnhmID0geGY7XG4gICAgICAgICAgICB0aGlzLmYgPSBmO1xuICAgICAgICAgICAgdGhpcy5pZHggPSAtMTtcbiAgICAgICAgICAgIHRoaXMuZm91bmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBYRmluZEluZGV4LnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgICAgICAgWEZpbmRJbmRleC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3VuZCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKHJlc3VsdCk7XG4gICAgICAgIH07XG4gICAgICAgIFhGaW5kSW5kZXgucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvc3RlcCddID0gZnVuY3Rpb24gKHJlc3VsdCwgaW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuaWR4ICs9IDE7XG4gICAgICAgICAgICBpZiAodGhpcy5mKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IF9yZWR1Y2VkKHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCB0aGlzLmlkeCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gX3hmaW5kSW5kZXgoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWEZpbmRJbmRleChmLCB4Zik7XG4gICAgICAgIH0pO1xuICAgIH0oKTtcblxuICAgIHZhciBfeGZpbmRMYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRmluZExhc3QoZiwgeGYpIHtcbiAgICAgICAgICAgIHRoaXMueGYgPSB4ZjtcbiAgICAgICAgICAgIHRoaXMuZiA9IGY7XG4gICAgICAgIH1cbiAgICAgICAgWEZpbmRMYXN0LnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgICAgICAgWEZpbmRMYXN0LnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSh0aGlzLnhmWydAQHRyYW5zZHVjZXIvc3RlcCddKHJlc3VsdCwgdGhpcy5sYXN0KSk7XG4gICAgICAgIH07XG4gICAgICAgIFhGaW5kTGFzdC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSBpbnB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIF94ZmluZExhc3QoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWEZpbmRMYXN0KGYsIHhmKTtcbiAgICAgICAgfSk7XG4gICAgfSgpO1xuXG4gICAgdmFyIF94ZmluZExhc3RJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWEZpbmRMYXN0SW5kZXgoZiwgeGYpIHtcbiAgICAgICAgICAgIHRoaXMueGYgPSB4ZjtcbiAgICAgICAgICAgIHRoaXMuZiA9IGY7XG4gICAgICAgICAgICB0aGlzLmlkeCA9IC0xO1xuICAgICAgICAgICAgdGhpcy5sYXN0SWR4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgWEZpbmRMYXN0SW5kZXgucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gX3hmQmFzZS5pbml0O1xuICAgICAgICBYRmluZExhc3RJbmRleC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10odGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIHRoaXMubGFzdElkeCkpO1xuICAgICAgICB9O1xuICAgICAgICBYRmluZExhc3RJbmRleC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5pZHggKz0gMTtcbiAgICAgICAgICAgIGlmICh0aGlzLmYoaW5wdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0SWR4ID0gdGhpcy5pZHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiBfeGZpbmRMYXN0SW5kZXgoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWEZpbmRMYXN0SW5kZXgoZiwgeGYpO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3htYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFhNYXAoZiwgeGYpIHtcbiAgICAgICAgICAgIHRoaXMueGYgPSB4ZjtcbiAgICAgICAgICAgIHRoaXMuZiA9IGY7XG4gICAgICAgIH1cbiAgICAgICAgWE1hcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBfeGZCYXNlLmluaXQ7XG4gICAgICAgIFhNYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBfeGZCYXNlLnJlc3VsdDtcbiAgICAgICAgWE1hcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCB0aGlzLmYoaW5wdXQpKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gX3htYXAoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWE1hcChmLCB4Zik7XG4gICAgICAgIH0pO1xuICAgIH0oKTtcblxuICAgIHZhciBfeHRha2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFhUYWtlKG4sIHhmKSB7XG4gICAgICAgICAgICB0aGlzLnhmID0geGY7XG4gICAgICAgICAgICB0aGlzLm4gPSBuO1xuICAgICAgICB9XG4gICAgICAgIFhUYWtlLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgICAgICAgWFRha2UucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBfeGZCYXNlLnJlc3VsdDtcbiAgICAgICAgWFRha2UucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvc3RlcCddID0gZnVuY3Rpb24gKHJlc3VsdCwgaW5wdXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm4gPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZHVjZWQocmVzdWx0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uIC09IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIF94dGFrZShuLCB4Zikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBYVGFrZShuLCB4Zik7XG4gICAgICAgIH0pO1xuICAgIH0oKTtcblxuICAgIHZhciBfeHRha2VXaGlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWFRha2VXaGlsZShmLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5mID0gZjtcbiAgICAgICAgfVxuICAgICAgICBYVGFrZVdoaWxlLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgICAgICAgWFRha2VXaGlsZS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IF94ZkJhc2UucmVzdWx0O1xuICAgICAgICBYVGFrZVdoaWxlLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mKGlucHV0KSA/IHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBpbnB1dCkgOiBfcmVkdWNlZChyZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiBfeHRha2VXaGlsZShmLCB4Zikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBYVGFrZVdoaWxlKGYsIHhmKTtcbiAgICAgICAgfSk7XG4gICAgfSgpO1xuXG4gICAgdmFyIF94d3JhcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWFdyYXAoZm4pIHtcbiAgICAgICAgICAgIHRoaXMuZiA9IGZuO1xuICAgICAgICB9XG4gICAgICAgIFhXcmFwLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5pdCBub3QgaW1wbGVtZW50ZWQgb24gWFdyYXAnKTtcbiAgICAgICAgfTtcbiAgICAgICAgWFdyYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBmdW5jdGlvbiAoYWNjKSB7XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9O1xuICAgICAgICBYV3JhcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAoYWNjLCB4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mKGFjYywgeCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBfeHdyYXAoZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWFdyYXAoZm4pO1xuICAgICAgICB9O1xuICAgIH0oKTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdHdvIG51bWJlcnMuIEVxdWl2YWxlbnQgdG8gYGEgKyBiYCBidXQgY3VycmllZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTWF0aFxuICAgICAqIEBzaWcgTnVtYmVyIC0+IE51bWJlciAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBiXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBzZWUgUi5zdWJ0cmFjdFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuYWRkKDIsIDMpOyAgICAgICAvLz0+ICA1XG4gICAgICogICAgICBSLmFkZCg3KSgxMCk7ICAgICAgLy89PiAxN1xuICAgICAqL1xuICAgIHZhciBhZGQgPSBfY3VycnkyKGZ1bmN0aW9uIGFkZChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgYSBmdW5jdGlvbiB0byB0aGUgdmFsdWUgYXQgdGhlIGdpdmVuIGluZGV4IG9mIGFuIGFycmF5LFxuICAgICAqIHJldHVybmluZyBhIG5ldyBjb3B5IG9mIHRoZSBhcnJheSB3aXRoIHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlblxuICAgICAqIGluZGV4IHJlcGxhY2VkIHdpdGggdGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24gYXBwbGljYXRpb24uXG4gICAgICogQHNlZSBSLnVwZGF0ZVxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBhKSAtPiBOdW1iZXIgLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBhcHBseS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IFRoZSBpbmRleC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fEFyZ3VtZW50c30gbGlzdCBBbiBhcnJheS1saWtlIG9iamVjdCB3aG9zZSB2YWx1ZVxuICAgICAqICAgICAgICBhdCB0aGUgc3VwcGxpZWQgaW5kZXggd2lsbCBiZSByZXBsYWNlZC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBjb3B5IG9mIHRoZSBzdXBwbGllZCBhcnJheS1saWtlIG9iamVjdCB3aXRoXG4gICAgICogICAgICAgICB0aGUgZWxlbWVudCBhdCBpbmRleCBgaWR4YCByZXBsYWNlZCB3aXRoIHRoZSB2YWx1ZVxuICAgICAqICAgICAgICAgcmV0dXJuZWQgYnkgYXBwbHlpbmcgYGZuYCB0byB0aGUgZXhpc3RpbmcgZWxlbWVudC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmFkanVzdChSLmFkZCgxMCksIDEsIFswLCAxLCAyXSk7ICAgICAvLz0+IFswLCAxMSwgMl1cbiAgICAgKiAgICAgIFIuYWRqdXN0KFIuYWRkKDEwKSkoMSkoWzAsIDEsIDJdKTsgICAgIC8vPT4gWzAsIDExLCAyXVxuICAgICAqL1xuICAgIHZhciBhZGp1c3QgPSBfY3VycnkzKGZ1bmN0aW9uIGFkanVzdChmbiwgaWR4LCBsaXN0KSB7XG4gICAgICAgIGlmIChpZHggPj0gbGlzdC5sZW5ndGggfHwgaWR4IDwgLWxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhcnQgPSBpZHggPCAwID8gbGlzdC5sZW5ndGggOiAwO1xuICAgICAgICB2YXIgX2lkeCA9IHN0YXJ0ICsgaWR4O1xuICAgICAgICB2YXIgX2xpc3QgPSBfY29uY2F0KGxpc3QpO1xuICAgICAgICBfbGlzdFtfaWR4XSA9IGZuKGxpc3RbX2lkeF0pO1xuICAgICAgICByZXR1cm4gX2xpc3Q7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBhbHdheXMgcmV0dXJucyB0aGUgZ2l2ZW4gdmFsdWUuIE5vdGUgdGhhdCBmb3JcbiAgICAgKiBub24tcHJpbWl0aXZlcyB0aGUgdmFsdWUgcmV0dXJuZWQgaXMgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIHZhbHVlLlxuICAgICAqXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyBrbm93biBhcyBgY29uc3RgLCBgY29uc3RhbnRgLCBvciBgS2AgKGZvciBLIGNvbWJpbmF0b3IpXG4gICAgICogaW4gb3RoZXIgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBhIC0+ICgqIC0+IGEpXG4gICAgICogQHBhcmFtIHsqfSB2YWwgVGhlIHZhbHVlIHRvIHdyYXAgaW4gYSBmdW5jdGlvblxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIEZ1bmN0aW9uIDo6ICogLT4gdmFsLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB0ID0gUi5hbHdheXMoJ1RlZScpO1xuICAgICAqICAgICAgdCgpOyAvLz0+ICdUZWUnXG4gICAgICovXG4gICAgdmFyIGFsd2F5cyA9IF9jdXJyeTEoZnVuY3Rpb24gYWx3YXlzKHZhbCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgbGlzdCwgY29tcG9zZWQgb2Ygbi10dXBsZXMgb2YgY29uc2VjdXRpdmUgZWxlbWVudHNcbiAgICAgKiBJZiBgbmAgaXMgZ3JlYXRlciB0aGFuIHRoZSBsZW5ndGggb2YgdGhlIGxpc3QsIGFuIGVtcHR5IGxpc3QgaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIE51bWJlciAtPiBbYV0gLT4gW1thXV1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbiBUaGUgc2l6ZSBvZiB0aGUgdHVwbGVzIHRvIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gc3BsaXQgaW50byBgbmAtdHVwbGVzXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBuZXcgbGlzdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmFwZXJ0dXJlKDIsIFsxLCAyLCAzLCA0LCA1XSk7IC8vPT4gW1sxLCAyXSwgWzIsIDNdLCBbMywgNF0sIFs0LCA1XV1cbiAgICAgKiAgICAgIFIuYXBlcnR1cmUoMywgWzEsIDIsIDMsIDQsIDVdKTsgLy89PiBbWzEsIDIsIDNdLCBbMiwgMywgNF0sIFszLCA0LCA1XV1cbiAgICAgKiAgICAgIFIuYXBlcnR1cmUoNywgWzEsIDIsIDMsIDQsIDVdKTsgLy89PiBbXVxuICAgICAqL1xuICAgIHZhciBhcGVydHVyZSA9IF9jdXJyeTIoZnVuY3Rpb24gYXBlcnR1cmUobiwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgdmFyIGxpbWl0ID0gbGlzdC5sZW5ndGggLSAobiAtIDEpO1xuICAgICAgICB2YXIgYWNjID0gbmV3IEFycmF5KGxpbWl0ID49IDAgPyBsaW1pdCA6IDApO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGltaXQpIHtcbiAgICAgICAgICAgIGFjY1tpZHhdID0gX3NsaWNlKGxpc3QsIGlkeCwgaWR4ICsgbik7XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBnaXZlbiBsaXN0LCBmb2xsb3dlZCBieSB0aGUgZ2l2ZW5cbiAgICAgKiBlbGVtZW50LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBhIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0geyp9IGVsIFRoZSBlbGVtZW50IHRvIGFkZCB0byB0aGUgZW5kIG9mIHRoZSBuZXcgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHdob3NlIGNvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgb3V0cHV0XG4gICAgICogICAgICAgIGxpc3QuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IGxpc3QgY29udGFpbmluZyB0aGUgY29udGVudHMgb2YgdGhlIG9sZCBsaXN0IGZvbGxvd2VkIGJ5IGBlbGAuXG4gICAgICogQHNlZSBSLnByZXBlbmRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmFwcGVuZCgndGVzdHMnLCBbJ3dyaXRlJywgJ21vcmUnXSk7IC8vPT4gWyd3cml0ZScsICdtb3JlJywgJ3Rlc3RzJ11cbiAgICAgKiAgICAgIFIuYXBwZW5kKCd0ZXN0cycsIFtdKTsgLy89PiBbJ3Rlc3RzJ11cbiAgICAgKiAgICAgIFIuYXBwZW5kKFsndGVzdHMnXSwgWyd3cml0ZScsICdtb3JlJ10pOyAvLz0+IFsnd3JpdGUnLCAnbW9yZScsIFsndGVzdHMnXV1cbiAgICAgKi9cbiAgICB2YXIgYXBwZW5kID0gX2N1cnJ5MihmdW5jdGlvbiBhcHBlbmQoZWwsIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIF9jb25jYXQobGlzdCwgW2VsXSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGZ1bmN0aW9uIGBmbmAgdG8gdGhlIGFyZ3VtZW50IGxpc3QgYGFyZ3NgLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAgICAgKiBjcmVhdGluZyBhIGZpeGVkLWFyaXR5IGZ1bmN0aW9uIGZyb20gYSB2YXJpYWRpYyBmdW5jdGlvbi4gYGZuYCBzaG91bGRcbiAgICAgKiBiZSBhIGJvdW5kIGZ1bmN0aW9uIGlmIGNvbnRleHQgaXMgc2lnbmlmaWNhbnQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoKi4uLiAtPiBhKSAtPiBbKl0gLT4gYVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQHNlZSBSLmNhbGwsIFIudW5hcHBseVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBudW1zID0gWzEsIDIsIDMsIC05OSwgNDIsIDYsIDddO1xuICAgICAqICAgICAgUi5hcHBseShNYXRoLm1heCwgbnVtcyk7IC8vPT4gNDJcbiAgICAgKi9cbiAgICB2YXIgYXBwbHkgPSBfY3VycnkyKGZ1bmN0aW9uIGFwcGx5KGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgc2hhbGxvdyBjbG9uZSBvZiBhbiBvYmplY3QsIHNldHRpbmcgb3Igb3ZlcnJpZGluZyB0aGUgc3BlY2lmaWVkXG4gICAgICogcHJvcGVydHkgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUuICBOb3RlIHRoYXQgdGhpcyBjb3BpZXMgYW5kIGZsYXR0ZW5zXG4gICAgICogcHJvdG90eXBlIHByb3BlcnRpZXMgb250byB0aGUgbmV3IG9iamVjdCBhcyB3ZWxsLiAgQWxsIG5vbi1wcmltaXRpdmVcbiAgICAgKiBwcm9wZXJ0aWVzIGFyZSBjb3BpZWQgYnkgcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIFN0cmluZyAtPiBhIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcCB0aGUgcHJvcGVydHkgbmFtZSB0byBzZXRcbiAgICAgKiBAcGFyYW0geyp9IHZhbCB0aGUgbmV3IHZhbHVlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiB0aGUgb2JqZWN0IHRvIGNsb25lXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBhIG5ldyBvYmplY3Qgc2ltaWxhciB0byB0aGUgb3JpZ2luYWwgZXhjZXB0IGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LlxuICAgICAqIEBzZWUgUi5kaXNzb2NcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmFzc29jKCdjJywgMywge2E6IDEsIGI6IDJ9KTsgLy89PiB7YTogMSwgYjogMiwgYzogM31cbiAgICAgKi9cbiAgICB2YXIgYXNzb2MgPSBfY3VycnkzKGZ1bmN0aW9uIGFzc29jKHByb3AsIHZhbCwgb2JqKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgICAgIHJlc3VsdFtwXSA9IG9ialtwXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbcHJvcF0gPSB2YWw7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIHNoYWxsb3cgY2xvbmUgb2YgYW4gb2JqZWN0LCBzZXR0aW5nIG9yIG92ZXJyaWRpbmcgdGhlIG5vZGVzXG4gICAgICogcmVxdWlyZWQgdG8gY3JlYXRlIHRoZSBnaXZlbiBwYXRoLCBhbmQgcGxhY2luZyB0aGUgc3BlY2lmaWMgdmFsdWUgYXQgdGhlXG4gICAgICogdGFpbCBlbmQgb2YgdGhhdCBwYXRoLiAgTm90ZSB0aGF0IHRoaXMgY29waWVzIGFuZCBmbGF0dGVucyBwcm90b3R5cGVcbiAgICAgKiBwcm9wZXJ0aWVzIG9udG8gdGhlIG5ldyBvYmplY3QgYXMgd2VsbC4gIEFsbCBub24tcHJpbWl0aXZlIHByb3BlcnRpZXNcbiAgICAgKiBhcmUgY29waWVkIGJ5IHJlZmVyZW5jZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBbU3RyaW5nXSAtPiBhIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYXRoIHRoZSBwYXRoIHRvIHNldFxuICAgICAqIEBwYXJhbSB7Kn0gdmFsIHRoZSBuZXcgdmFsdWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIHRoZSBvYmplY3QgdG8gY2xvbmVcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGEgbmV3IG9iamVjdCBzaW1pbGFyIHRvIHRoZSBvcmlnaW5hbCBleGNlcHQgYWxvbmcgdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgICAqIEBzZWUgUi5kaXNzb2NQYXRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5hc3NvY1BhdGgoWydhJywgJ2InLCAnYyddLCA0Miwge2E6IHtiOiB7YzogMH19fSk7IC8vPT4ge2E6IHtiOiB7YzogNDJ9fX1cbiAgICAgKi9cbiAgICB2YXIgYXNzb2NQYXRoID0gX2N1cnJ5MyhmdW5jdGlvbiBhc3NvY1BhdGgocGF0aCwgdmFsLCBvYmopIHtcbiAgICAgICAgc3dpdGNoIChwYXRoLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gYXNzb2MocGF0aFswXSwgdmFsLCBvYmopO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGFzc29jKHBhdGhbMF0sIGFzc29jUGF0aChfc2xpY2UocGF0aCwgMSksIHZhbCwgT2JqZWN0KG9ialtwYXRoWzBdXSkpLCBvYmopO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpcyBib3VuZCB0byBhIGNvbnRleHQuXG4gICAgICogTm90ZTogYFIuYmluZGAgZG9lcyBub3QgcHJvdmlkZSB0aGUgYWRkaXRpb25hbCBhcmd1bWVudC1iaW5kaW5nIGNhcGFiaWxpdGllcyBvZlxuICAgICAqIFtGdW5jdGlvbi5wcm90b3R5cGUuYmluZF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYmluZCkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzZWUgUi5wYXJ0aWFsXG4gICAgICogQHNpZyAoKiAtPiAqKSAtPiB7Kn0gLT4gKCogLT4gKilcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmluZCB0byBjb250ZXh0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHRoaXNPYmogVGhlIGNvbnRleHQgdG8gYmluZCBgZm5gIHRvXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdGhhdCB3aWxsIGV4ZWN1dGUgaW4gdGhlIGNvbnRleHQgb2YgYHRoaXNPYmpgLlxuICAgICAqL1xuICAgIHZhciBiaW5kID0gX2N1cnJ5MihmdW5jdGlvbiBiaW5kKGZuLCB0aGlzT2JqKSB7XG4gICAgICAgIHJldHVybiBfYXJpdHkoZm4ubGVuZ3RoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJndW1lbnRzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBIGZ1bmN0aW9uIHdyYXBwaW5nIGNhbGxzIHRvIHRoZSB0d28gZnVuY3Rpb25zIGluIGFuIGAmJmAgb3BlcmF0aW9uLCByZXR1cm5pbmcgdGhlIHJlc3VsdCBvZiB0aGUgZmlyc3RcbiAgICAgKiBmdW5jdGlvbiBpZiBpdCBpcyBmYWxzZS15IGFuZCB0aGUgcmVzdWx0IG9mIHRoZSBzZWNvbmQgZnVuY3Rpb24gb3RoZXJ3aXNlLiAgTm90ZSB0aGF0IHRoaXMgaXNcbiAgICAgKiBzaG9ydC1jaXJjdWl0ZWQsIG1lYW5pbmcgdGhhdCB0aGUgc2Vjb25kIGZ1bmN0aW9uIHdpbGwgbm90IGJlIGludm9rZWQgaWYgdGhlIGZpcnN0IHJldHVybnMgYSBmYWxzZS15XG4gICAgICogdmFsdWUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyAoKi4uLiAtPiBCb29sZWFuKSAtPiAoKi4uLiAtPiBCb29sZWFuKSAtPiAoKi4uLiAtPiBCb29sZWFuKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGYgYSBwcmVkaWNhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBnIGFub3RoZXIgcHJlZGljYXRlXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBhcHBsaWVzIGl0cyBhcmd1bWVudHMgdG8gYGZgIGFuZCBgZ2AgYW5kIGAmJmBzIHRoZWlyIG91dHB1dHMgdG9nZXRoZXIuXG4gICAgICogQHNlZSBSLmFuZFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBndDEwID0gZnVuY3Rpb24oeCkgeyByZXR1cm4geCA+IDEwOyB9O1xuICAgICAqICAgICAgdmFyIGV2ZW4gPSBmdW5jdGlvbih4KSB7IHJldHVybiB4ICUgMiA9PT0gMCB9O1xuICAgICAqICAgICAgdmFyIGYgPSBSLmJvdGgoZ3QxMCwgZXZlbik7XG4gICAgICogICAgICBmKDEwMCk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgZigxMDEpOyAvLz0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIGJvdGggPSBfY3VycnkyKGZ1bmN0aW9uIGJvdGgoZiwgZykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gX2JvdGgoKSB7XG4gICAgICAgICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpICYmIGcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgY29tcGFyYXRvciBmdW5jdGlvbiBvdXQgb2YgYSBmdW5jdGlvbiB0aGF0IHJlcG9ydHMgd2hldGhlciB0aGUgZmlyc3QgZWxlbWVudCBpcyBsZXNzIHRoYW4gdGhlIHNlY29uZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIChhLCBiIC0+IEJvb2xlYW4pIC0+IChhLCBiIC0+IE51bWJlcilcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIGZ1bmN0aW9uIG9mIGFyaXR5IHR3by5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBGdW5jdGlvbiA6OiBhIC0+IGIgLT4gSW50IHRoYXQgcmV0dXJucyBgLTFgIGlmIGEgPCBiLCBgMWAgaWYgYiA8IGEsIG90aGVyd2lzZSBgMGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGNtcCA9IFIuY29tcGFyYXRvcihmdW5jdGlvbihhLCBiKSB7XG4gICAgICogICAgICAgIHJldHVybiBhLmFnZSA8IGIuYWdlO1xuICAgICAqICAgICAgfSk7XG4gICAgICogICAgICB2YXIgcGVvcGxlID0gW1xuICAgICAqICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgIF07XG4gICAgICogICAgICBSLnNvcnQoY21wLCBwZW9wbGUpO1xuICAgICAqL1xuICAgIHZhciBjb21wYXJhdG9yID0gX2N1cnJ5MShmdW5jdGlvbiBjb21wYXJhdG9yKHByZWQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJlZChhLCBiKSA/IC0xIDogcHJlZChiLCBhKSA/IDEgOiAwO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBmdW5jdGlvbiBgZmAgYW5kIHJldHVybnMgYSBmdW5jdGlvbiBgZ2Agc3VjaCB0aGF0OlxuICAgICAqXG4gICAgICogICAtIGFwcGx5aW5nIGBnYCB0byB6ZXJvIG9yIG1vcmUgYXJndW1lbnRzIHdpbGwgZ2l2ZSBfX3RydWVfXyBpZiBhcHBseWluZ1xuICAgICAqICAgICB0aGUgc2FtZSBhcmd1bWVudHMgdG8gYGZgIGdpdmVzIGEgbG9naWNhbCBfX2ZhbHNlX18gdmFsdWU7IGFuZFxuICAgICAqXG4gICAgICogICAtIGFwcGx5aW5nIGBnYCB0byB6ZXJvIG9yIG1vcmUgYXJndW1lbnRzIHdpbGwgZ2l2ZSBfX2ZhbHNlX18gaWYgYXBwbHlpbmdcbiAgICAgKiAgICAgdGhlIHNhbWUgYXJndW1lbnRzIHRvIGBmYCBnaXZlcyBhIGxvZ2ljYWwgX190cnVlX18gdmFsdWUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyAoKi4uLiAtPiAqKSAtPiAoKi4uLiAtPiBCb29sZWFuKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAc2VlIFIubm90XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGlzRXZlbiA9IGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4gJSAyID09PSAwOyB9O1xuICAgICAqICAgICAgdmFyIGlzT2RkID0gUi5jb21wbGVtZW50KGlzRXZlbik7XG4gICAgICogICAgICBpc09kZCgyMSk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgaXNPZGQoNDIpOyAvLz0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIGNvbXBsZW1lbnQgPSBfY3VycnkxKF9jb21wbGVtZW50KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiwgYGZuYCwgd2hpY2ggZW5jYXBzdWxhdGVzIGlmL2Vsc2UtaWYvZWxzZSBsb2dpYy5cbiAgICAgKiBgUi5jb25kYCB0YWtlcyBhIGxpc3Qgb2YgW3ByZWRpY2F0ZSwgdHJhbnNmb3JtXSBwYWlycy4gQWxsIG9mIHRoZVxuICAgICAqIGFyZ3VtZW50cyB0byBgZm5gIGFyZSBhcHBsaWVkIHRvIGVhY2ggb2YgdGhlIHByZWRpY2F0ZXMgaW4gdHVyblxuICAgICAqIHVudGlsIG9uZSByZXR1cm5zIGEgXCJ0cnV0aHlcIiB2YWx1ZSwgYXQgd2hpY2ggcG9pbnQgYGZuYCByZXR1cm5zIHRoZVxuICAgICAqIHJlc3VsdCBvZiBhcHBseWluZyBpdHMgYXJndW1lbnRzIHRvIHRoZSBjb3JyZXNwb25kaW5nIHRyYW5zZm9ybWVyLlxuICAgICAqIElmIG5vbmUgb2YgdGhlIHByZWRpY2F0ZXMgbWF0Y2hlcywgYGZuYCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTG9naWNcbiAgICAgKiBAc2lnIFtbKCouLi4gLT4gQm9vbGVhbiksKCouLi4gLT4gKildXSAtPiAoKi4uLiAtPiAqKVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGZuID0gUi5jb25kKFtcbiAgICAgKiAgICAgICAgW1IuZXF1YWxzKDApLCAgIFIuYWx3YXlzKCd3YXRlciBmcmVlemVzIGF0IDDCsEMnKV0sXG4gICAgICogICAgICAgIFtSLmVxdWFscygxMDApLCBSLmFsd2F5cygnd2F0ZXIgYm9pbHMgYXQgMTAwwrBDJyldLFxuICAgICAqICAgICAgICBbUi5ULCAgICAgICAgICAgZnVuY3Rpb24odGVtcCkgeyByZXR1cm4gJ25vdGhpbmcgc3BlY2lhbCBoYXBwZW5zIGF0ICcgKyB0ZW1wICsgJ8KwQyc7IH1dXG4gICAgICogICAgICBdKTtcbiAgICAgKiAgICAgIGZuKDApOyAvLz0+ICd3YXRlciBmcmVlemVzIGF0IDDCsEMnXG4gICAgICogICAgICBmbig1MCk7IC8vPT4gJ25vdGhpbmcgc3BlY2lhbCBoYXBwZW5zIGF0IDUwwrBDJ1xuICAgICAqICAgICAgZm4oMTAwKTsgLy89PiAnd2F0ZXIgYm9pbHMgYXQgMTAwwrBDJ1xuICAgICAqL1xuICAgIHZhciBjb25kID0gX2N1cnJ5MShmdW5jdGlvbiBjb25kKHBhaXJzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpZHggPCBwYWlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFpcnNbaWR4XVswXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWlyc1tpZHhdWzFdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB4YCBpcyBmb3VuZCBpbiB0aGUgYGxpc3RgLCB1c2luZyBgcHJlZGAgYXMgYW5cbiAgICAgKiBlcXVhbGl0eSBwcmVkaWNhdGUgZm9yIGB4YC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGEsIGEgLT4gQm9vbGVhbikgLT4gYSAtPiBbYV0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWQgQSBwcmVkaWNhdGUgdXNlZCB0byB0ZXN0IHdoZXRoZXIgdHdvIGl0ZW1zIGFyZSBlcXVhbC5cbiAgICAgKiBAcGFyYW0geyp9IHggVGhlIGl0ZW0gdG8gZmluZFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gaXRlcmF0ZSBvdmVyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB4YCBpcyBpbiBgbGlzdGAsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgeHMgPSBbe3g6IDEyfSwge3g6IDExfSwge3g6IDEwfV07XG4gICAgICogICAgICBSLmNvbnRhaW5zV2l0aChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhLnggPT09IGIueDsgfSwge3g6IDEwfSwgeHMpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuY29udGFpbnNXaXRoKGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEueCA9PT0gYi54OyB9LCB7eDogMX0sIHhzKTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBjb250YWluc1dpdGggPSBfY3VycnkzKF9jb250YWluc1dpdGgpO1xuXG4gICAgLyoqXG4gICAgICogQ291bnRzIHRoZSBlbGVtZW50cyBvZiBhIGxpc3QgYWNjb3JkaW5nIHRvIGhvdyBtYW55IG1hdGNoIGVhY2ggdmFsdWVcbiAgICAgKiBvZiBhIGtleSBnZW5lcmF0ZWQgYnkgdGhlIHN1cHBsaWVkIGZ1bmN0aW9uLiBSZXR1cm5zIGFuIG9iamVjdFxuICAgICAqIG1hcHBpbmcgdGhlIGtleXMgcHJvZHVjZWQgYnkgYGZuYCB0byB0aGUgbnVtYmVyIG9mIG9jY3VycmVuY2VzIGluXG4gICAgICogdGhlIGxpc3QuIE5vdGUgdGhhdCBhbGwga2V5cyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGJlY2F1c2Ugb2YgaG93XG4gICAgICogSmF2YVNjcmlwdCBvYmplY3RzIHdvcmsuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyAoYSAtPiBTdHJpbmcpIC0+IFthXSAtPiB7Kn1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdXNlZCB0byBtYXAgdmFsdWVzIHRvIGtleXMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgbGlzdCB0byBjb3VudCBlbGVtZW50cyBmcm9tLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IG1hcHBpbmcga2V5cyB0byBudW1iZXIgb2Ygb2NjdXJyZW5jZXMgaW4gdGhlIGxpc3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG51bWJlcnMgPSBbMS4wLCAxLjEsIDEuMiwgMi4wLCAzLjAsIDIuMl07XG4gICAgICogICAgICB2YXIgbGV0dGVycyA9IFIuc3BsaXQoJycsICdhYmNBQkNhYWFCQmMnKTtcbiAgICAgKiAgICAgIFIuY291bnRCeShNYXRoLmZsb29yKShudW1iZXJzKTsgICAgLy89PiB7JzEnOiAzLCAnMic6IDIsICczJzogMX1cbiAgICAgKiAgICAgIFIuY291bnRCeShSLnRvTG93ZXIpKGxldHRlcnMpOyAgIC8vPT4geydhJzogNSwgJ2InOiA0LCAnYyc6IDN9XG4gICAgICovXG4gICAgdmFyIGNvdW50QnkgPSBfY3VycnkyKGZ1bmN0aW9uIGNvdW50QnkoZm4sIGxpc3QpIHtcbiAgICAgICAgdmFyIGNvdW50cyA9IHt9O1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gZm4obGlzdFtpZHhdKTtcbiAgICAgICAgICAgIGNvdW50c1trZXldID0gKF9oYXMoa2V5LCBjb3VudHMpID8gY291bnRzW2tleV0gOiAwKSArIDE7XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnRzO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgY29udGFpbmluZyBhIHNpbmdsZSBrZXk6dmFsdWUgcGFpci5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBTdHJpbmcgLT4gYSAtPiB7U3RyaW5nOmF9XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBtYXRjaFBocmFzZXMgPSBSLmNvbXBvc2UoXG4gICAgICogICAgICAgIFIuY3JlYXRlTWFwRW50cnkoJ211c3QnKSxcbiAgICAgKiAgICAgICAgUi5tYXAoUi5jcmVhdGVNYXBFbnRyeSgnbWF0Y2hfcGhyYXNlJykpXG4gICAgICogICAgICApO1xuICAgICAqICAgICAgbWF0Y2hQaHJhc2VzKFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4ge211c3Q6IFt7bWF0Y2hfcGhyYXNlOiAnZm9vJ30sIHttYXRjaF9waHJhc2U6ICdiYXInfSwge21hdGNoX3BocmFzZTogJ2Jheid9XX1cbiAgICAgKi9cbiAgICB2YXIgY3JlYXRlTWFwRW50cnkgPSBfY3VycnkyKGZ1bmN0aW9uIGNyZWF0ZU1hcEVudHJ5KGtleSwgdmFsKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgb2JqW2tleV0gPSB2YWw7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY3VycmllZCBlcXVpdmFsZW50IG9mIHRoZSBwcm92aWRlZCBmdW5jdGlvbiwgd2l0aCB0aGVcbiAgICAgKiBzcGVjaWZpZWQgYXJpdHkuIFRoZSBjdXJyaWVkIGZ1bmN0aW9uIGhhcyB0d28gdW51c3VhbCBjYXBhYmlsaXRpZXMuXG4gICAgICogRmlyc3QsIGl0cyBhcmd1bWVudHMgbmVlZG4ndCBiZSBwcm92aWRlZCBvbmUgYXQgYSB0aW1lLiBJZiBgZ2AgaXNcbiAgICAgKiBgUi5jdXJyeU4oMywgZilgLCB0aGUgZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICAgICAqXG4gICAgICogICAtIGBnKDEpKDIpKDMpYFxuICAgICAqICAgLSBgZygxKSgyLCAzKWBcbiAgICAgKiAgIC0gYGcoMSwgMikoMylgXG4gICAgICogICAtIGBnKDEsIDIsIDMpYFxuICAgICAqXG4gICAgICogU2Vjb25kbHksIHRoZSBzcGVjaWFsIHBsYWNlaG9sZGVyIHZhbHVlIGBSLl9fYCBtYXkgYmUgdXNlZCB0byBzcGVjaWZ5XG4gICAgICogXCJnYXBzXCIsIGFsbG93aW5nIHBhcnRpYWwgYXBwbGljYXRpb24gb2YgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyxcbiAgICAgKiByZWdhcmRsZXNzIG9mIHRoZWlyIHBvc2l0aW9ucy4gSWYgYGdgIGlzIGFzIGFib3ZlIGFuZCBgX2AgaXMgYFIuX19gLFxuICAgICAqIHRoZSBmb2xsb3dpbmcgYXJlIGVxdWl2YWxlbnQ6XG4gICAgICpcbiAgICAgKiAgIC0gYGcoMSwgMiwgMylgXG4gICAgICogICAtIGBnKF8sIDIsIDMpKDEpYFxuICAgICAqICAgLSBgZyhfLCBfLCAzKSgxKSgyKWBcbiAgICAgKiAgIC0gYGcoXywgXywgMykoMSwgMilgXG4gICAgICogICAtIGBnKF8sIDIpKDEpKDMpYFxuICAgICAqICAgLSBgZyhfLCAyKSgxLCAzKWBcbiAgICAgKiAgIC0gYGcoXywgMikoXywgMykoMSlgXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBOdW1iZXIgLT4gKCogLT4gYSkgLT4gKCogLT4gYSlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBhcml0eSBmb3IgdGhlIHJldHVybmVkIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcsIGN1cnJpZWQgZnVuY3Rpb24uXG4gICAgICogQHNlZSBSLmN1cnJ5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGFkZEZvdXJOdW1iZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgIHJldHVybiBSLnN1bShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgNCkpO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGN1cnJpZWRBZGRGb3VyTnVtYmVycyA9IFIuY3VycnlOKDQsIGFkZEZvdXJOdW1iZXJzKTtcbiAgICAgKiAgICAgIHZhciBmID0gY3VycmllZEFkZEZvdXJOdW1iZXJzKDEsIDIpO1xuICAgICAqICAgICAgdmFyIGcgPSBmKDMpO1xuICAgICAqICAgICAgZyg0KTsgLy89PiAxMFxuICAgICAqL1xuICAgIHZhciBjdXJyeU4gPSBfY3VycnkyKGZ1bmN0aW9uIGN1cnJ5TihsZW5ndGgsIGZuKSB7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBfY3VycnkxKGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2FyaXR5KGxlbmd0aCwgX2N1cnJ5TihsZW5ndGgsIFtdLCBmbikpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogRGVjcmVtZW50cyBpdHMgYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE1hdGhcbiAgICAgKiBAc2lnIE51bWJlciAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gblxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAc2VlIFIuaW5jXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5kZWMoNDIpOyAvLz0+IDQxXG4gICAgICovXG4gICAgdmFyIGRlYyA9IGFkZCgtMSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzZWNvbmQgYXJndW1lbnQgaWYgaXQgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkLiBJZiBpdCBpcyBudWxsXG4gICAgICogb3IgdW5kZWZpbmVkLCB0aGUgZmlyc3QgKGRlZmF1bHQpIGFyZ3VtZW50IGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMb2dpY1xuICAgICAqIEBzaWcgYSAtPiBiIC0+IGEgfCBiXG4gICAgICogQHBhcmFtIHthfSB2YWwgVGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICogQHBhcmFtIHtifSB2YWwgVGhlIHZhbHVlIHRvIHJldHVybiBpZiBpdCBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgdGhlIHNlY29uZCB2YWx1ZSBvciB0aGUgZGVmYXVsdCB2YWx1ZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBkZWZhdWx0VG80MiA9IGRlZmF1bHRUbyg0Mik7XG4gICAgICpcbiAgICAgKiAgICAgIGRlZmF1bHRUbzQyKG51bGwpOyAgLy89PiA0MlxuICAgICAqICAgICAgZGVmYXVsdFRvNDIodW5kZWZpbmVkKTsgIC8vPT4gNDJcbiAgICAgKiAgICAgIGRlZmF1bHRUbzQyKCdSYW1kYScpOyAgLy89PiAnUmFtZGEnXG4gICAgICovXG4gICAgdmFyIGRlZmF1bHRUbyA9IF9jdXJyeTIoZnVuY3Rpb24gZGVmYXVsdFRvKGQsIHYpIHtcbiAgICAgICAgcmV0dXJuIHYgPT0gbnVsbCA/IGQgOiB2O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHNldCAoaS5lLiBubyBkdXBsaWNhdGVzKSBvZiBhbGwgZWxlbWVudHMgaW4gdGhlIGZpcnN0IGxpc3Qgbm90IGNvbnRhaW5lZCBpbiB0aGUgc2Vjb25kIGxpc3QuXG4gICAgICogRHVwbGljYXRpb24gaXMgZGV0ZXJtaW5lZCBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlIHJldHVybmVkIGJ5IGFwcGx5aW5nIHRoZSBzdXBwbGllZCBwcmVkaWNhdGUgdG8gdHdvIGxpc3RcbiAgICAgKiBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIChhLGEgLT4gQm9vbGVhbikgLT4gW2FdIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIHVzZWQgdG8gdGVzdCB3aGV0aGVyIHR3byBpdGVtcyBhcmUgZXF1YWwuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDEgVGhlIGZpcnN0IGxpc3QuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDIgVGhlIHNlY29uZCBsaXN0LlxuICAgICAqIEBzZWUgUi5kaWZmZXJlbmNlXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBlbGVtZW50cyBpbiBgbGlzdDFgIHRoYXQgYXJlIG5vdCBpbiBgbGlzdDJgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIGZ1bmN0aW9uIGNtcCh4LCB5KSB7IHJldHVybiB4LmEgPT09IHkuYTsgfVxuICAgICAqICAgICAgdmFyIGwxID0gW3thOiAxfSwge2E6IDJ9LCB7YTogM31dO1xuICAgICAqICAgICAgdmFyIGwyID0gW3thOiAzfSwge2E6IDR9XTtcbiAgICAgKiAgICAgIFIuZGlmZmVyZW5jZVdpdGgoY21wLCBsMSwgbDIpOyAvLz0+IFt7YTogMX0sIHthOiAyfV1cbiAgICAgKi9cbiAgICB2YXIgZGlmZmVyZW5jZVdpdGggPSBfY3VycnkzKGZ1bmN0aW9uIGRpZmZlcmVuY2VXaXRoKHByZWQsIGZpcnN0LCBzZWNvbmQpIHtcbiAgICAgICAgdmFyIG91dCA9IFtdO1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgdmFyIGZpcnN0TGVuID0gZmlyc3QubGVuZ3RoO1xuICAgICAgICB2YXIgY29udGFpbnNQcmVkID0gY29udGFpbnNXaXRoKHByZWQpO1xuICAgICAgICB3aGlsZSAoaWR4IDwgZmlyc3RMZW4pIHtcbiAgICAgICAgICAgIGlmICghY29udGFpbnNQcmVkKGZpcnN0W2lkeF0sIHNlY29uZCkgJiYgIWNvbnRhaW5zUHJlZChmaXJzdFtpZHhdLCBvdXQpKSB7XG4gICAgICAgICAgICAgICAgb3V0W291dC5sZW5ndGhdID0gZmlyc3RbaWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IG9iamVjdCB0aGF0IGRvZXMgbm90IGNvbnRhaW4gYSBgcHJvcGAgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzaWcgU3RyaW5nIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcCB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZGlzc29jaWF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogdGhlIG9iamVjdCB0byBjbG9uZVxuICAgICAqIEByZXR1cm4ge09iamVjdH0gYSBuZXcgb2JqZWN0IHNpbWlsYXIgdG8gdGhlIG9yaWdpbmFsIGJ1dCB3aXRob3V0IHRoZSBzcGVjaWZpZWQgcHJvcGVydHlcbiAgICAgKiBAc2VlIFIuYXNzb2NcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmRpc3NvYygnYicsIHthOiAxLCBiOiAyLCBjOiAzfSk7IC8vPT4ge2E6IDEsIGM6IDN9XG4gICAgICovXG4gICAgdmFyIGRpc3NvYyA9IF9jdXJyeTIoZnVuY3Rpb24gZGlzc29jKHByb3AsIG9iaikge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAodmFyIHAgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAocCAhPT0gcHJvcCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtwXSA9IG9ialtwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBzaGFsbG93IGNsb25lIG9mIGFuIG9iamVjdCwgb21pdHRpbmcgdGhlIHByb3BlcnR5IGF0IHRoZVxuICAgICAqIGdpdmVuIHBhdGguIE5vdGUgdGhhdCB0aGlzIGNvcGllcyBhbmQgZmxhdHRlbnMgcHJvdG90eXBlIHByb3BlcnRpZXNcbiAgICAgKiBvbnRvIHRoZSBuZXcgb2JqZWN0IGFzIHdlbGwuICBBbGwgbm9uLXByaW1pdGl2ZSBwcm9wZXJ0aWVzIGFyZSBjb3BpZWRcbiAgICAgKiBieSByZWZlcmVuY2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzaWcgW1N0cmluZ10gLT4ge2s6IHZ9IC0+IHtrOiB2fVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhdGggdGhlIHBhdGggdG8gc2V0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiB0aGUgb2JqZWN0IHRvIGNsb25lXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBhIG5ldyBvYmplY3Qgd2l0aG91dCB0aGUgcHJvcGVydHkgYXQgcGF0aFxuICAgICAqIEBzZWUgUi5hc3NvY1BhdGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmRpc3NvY1BhdGgoWydhJywgJ2InLCAnYyddLCB7YToge2I6IHtjOiA0Mn19fSk7IC8vPT4ge2E6IHtiOiB7fX19XG4gICAgICovXG4gICAgdmFyIGRpc3NvY1BhdGggPSBfY3VycnkyKGZ1bmN0aW9uIGRpc3NvY1BhdGgocGF0aCwgb2JqKSB7XG4gICAgICAgIHN3aXRjaCAocGF0aC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIGRpc3NvYyhwYXRoWzBdLCBvYmopO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFyIGhlYWQgPSBwYXRoWzBdO1xuICAgICAgICAgICAgdmFyIHRhaWwgPSBfc2xpY2UocGF0aCwgMSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2hlYWRdID09IG51bGwgPyBvYmogOiBhc3NvYyhoZWFkLCBkaXNzb2NQYXRoKHRhaWwsIG9ialtoZWFkXSksIG9iaik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIERpdmlkZXMgdHdvIG51bWJlcnMuIEVxdWl2YWxlbnQgdG8gYGEgLyBiYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTWF0aFxuICAgICAqIEBzaWcgTnVtYmVyIC0+IE51bWJlciAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgdmFsdWUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSByZXN1bHQgb2YgYGEgLyBiYC5cbiAgICAgKiBAc2VlIFIubXVsdGlwbHlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmRpdmlkZSg3MSwgMTAwKTsgLy89PiAwLjcxXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBoYWxmID0gUi5kaXZpZGUoUi5fXywgMik7XG4gICAgICogICAgICBoYWxmKDQyKTsgLy89PiAyMVxuICAgICAqXG4gICAgICogICAgICB2YXIgcmVjaXByb2NhbCA9IFIuZGl2aWRlKDEpO1xuICAgICAqICAgICAgcmVjaXByb2NhbCg0KTsgICAvLz0+IDAuMjVcbiAgICAgKi9cbiAgICB2YXIgZGl2aWRlID0gX2N1cnJ5MihmdW5jdGlvbiBkaXZpZGUoYSwgYikge1xuICAgICAgICByZXR1cm4gYSAvIGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGxpc3QgY29udGFpbmluZyBhbGwgYnV0IGxhc3QgdGhlYG5gIGVsZW1lbnRzIG9mIGEgZ2l2ZW4gbGlzdCxcbiAgICAgKiBwYXNzaW5nIGVhY2ggdmFsdWUgZnJvbSB0aGUgcmlnaHQgdG8gdGhlIHN1cHBsaWVkIHByZWRpY2F0ZSBmdW5jdGlvbiwgc2tpcHBpbmdcbiAgICAgKiBlbGVtZW50cyB3aGlsZSB0aGUgcHJlZGljYXRlIGZ1bmN0aW9uIHJldHVybnMgYHRydWVgLiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uXG4gICAgICogaXMgcGFzc2VkIG9uZSBhcmd1bWVudDogKHZhbHVlKSouXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IGFycmF5LlxuICAgICAqIEBzZWUgUi50YWtlTGFzdFdoaWxlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGx0ZVRocmVlID0gZnVuY3Rpb24oeCkge1xuICAgICAqICAgICAgICByZXR1cm4geCA8PSAzO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgUi5kcm9wTGFzdFdoaWxlKGx0ZVRocmVlLCBbMSwgMiwgMywgNCwgMywgMiwgMV0pOyAvLz0+IFsxLCAyXVxuICAgICAqL1xuICAgIHZhciBkcm9wTGFzdFdoaWxlID0gX2N1cnJ5MihmdW5jdGlvbiBkcm9wTGFzdFdoaWxlKHByZWQsIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IGxpc3QubGVuZ3RoIC0gMTtcbiAgICAgICAgd2hpbGUgKGlkeCA+PSAwICYmIHByZWQobGlzdFtpZHhdKSkge1xuICAgICAgICAgICAgaWR4IC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9zbGljZShsaXN0LCAwLCBpZHggKyAxKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gd3JhcHBpbmcgY2FsbHMgdG8gdGhlIHR3byBmdW5jdGlvbnMgaW4gYW4gYHx8YCBvcGVyYXRpb24sIHJldHVybmluZyB0aGUgcmVzdWx0IG9mIHRoZSBmaXJzdFxuICAgICAqIGZ1bmN0aW9uIGlmIGl0IGlzIHRydXRoLXkgYW5kIHRoZSByZXN1bHQgb2YgdGhlIHNlY29uZCBmdW5jdGlvbiBvdGhlcndpc2UuICBOb3RlIHRoYXQgdGhpcyBpc1xuICAgICAqIHNob3J0LWNpcmN1aXRlZCwgbWVhbmluZyB0aGF0IHRoZSBzZWNvbmQgZnVuY3Rpb24gd2lsbCBub3QgYmUgaW52b2tlZCBpZiB0aGUgZmlyc3QgcmV0dXJucyBhIHRydXRoLXlcbiAgICAgKiB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTG9naWNcbiAgICAgKiBAc2lnICgqLi4uIC0+IEJvb2xlYW4pIC0+ICgqLi4uIC0+IEJvb2xlYW4pIC0+ICgqLi4uIC0+IEJvb2xlYW4pXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZiBhIHByZWRpY2F0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGcgYW5vdGhlciBwcmVkaWNhdGVcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgaXRzIGFyZ3VtZW50cyB0byBgZmAgYW5kIGBnYCBhbmQgYHx8YHMgdGhlaXIgb3V0cHV0cyB0b2dldGhlci5cbiAgICAgKiBAc2VlIFIub3JcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgZ3QxMCA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggPiAxMDsgfTtcbiAgICAgKiAgICAgIHZhciBldmVuID0gZnVuY3Rpb24oeCkgeyByZXR1cm4geCAlIDIgPT09IDAgfTtcbiAgICAgKiAgICAgIHZhciBmID0gUi5laXRoZXIoZ3QxMCwgZXZlbik7XG4gICAgICogICAgICBmKDEwMSk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgZig4KTsgLy89PiB0cnVlXG4gICAgICovXG4gICAgdmFyIGVpdGhlciA9IF9jdXJyeTIoZnVuY3Rpb24gZWl0aGVyKGYsIGcpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIF9laXRoZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IGcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGVtcHR5IHZhbHVlIG9mIGl0cyBhcmd1bWVudCdzIHR5cGUuIFJhbWRhIGRlZmluZXMgdGhlIGVtcHR5XG4gICAgICogdmFsdWUgb2YgQXJyYXkgKGBbXWApLCBPYmplY3QgKGB7fWApLCBhbmQgU3RyaW5nIChgJydgKS4gT3RoZXIgdHlwZXMgYXJlXG4gICAgICogc3VwcG9ydGVkIGlmIHRoZXkgZGVmaW5lIGA8VHlwZT4uZW1wdHlgIGFuZC9vciBgPFR5cGU+LnByb3RvdHlwZS5lbXB0eWAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBhIC0+IGFcbiAgICAgKiBAcGFyYW0geyp9IHhcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuZW1wdHkoSnVzdCg0MikpOyAgICAgIC8vPT4gTm90aGluZygpXG4gICAgICogICAgICBSLmVtcHR5KFsxLCAyLCAzXSk7ICAgICAvLz0+IFtdXG4gICAgICogICAgICBSLmVtcHR5KCd1bmljb3JucycpOyAgICAvLz0+ICcnXG4gICAgICogICAgICBSLmVtcHR5KHt4OiAxLCB5OiAyfSk7ICAvLz0+IHt9XG4gICAgICovXG4gICAgdmFyIGVtcHR5ID0gX2N1cnJ5MShmdW5jdGlvbiBlbXB0eSh4KSB7XG4gICAgICAgIGlmICh4ICE9IG51bGwgJiYgdHlwZW9mIHguZW1wdHkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmVtcHR5KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoeCAhPSBudWxsICYmIHR5cGVvZiB4LmNvbnN0cnVjdG9yICE9IG51bGwgJiYgdHlwZW9mIHguY29uc3RydWN0b3IuZW1wdHkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmNvbnN0cnVjdG9yLmVtcHR5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSkge1xuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBBcnJheV0nOlxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IGJ5IHJlY3Vyc2l2ZWx5IGV2b2x2aW5nIGEgc2hhbGxvdyBjb3B5IG9mIGBvYmplY3RgLCBhY2NvcmRpbmcgdG8gdGhlXG4gICAgICogYHRyYW5zZm9ybWF0aW9uYCBmdW5jdGlvbnMuIEFsbCBub24tcHJpbWl0aXZlIHByb3BlcnRpZXMgYXJlIGNvcGllZCBieSByZWZlcmVuY2UuXG4gICAgICpcbiAgICAgKiBBIGB0cmFuZm9ybWF0aW9uYCBmdW5jdGlvbiB3aWxsIG5vdCBiZSBpbnZva2VkIGlmIGl0cyBjb3JyZXNwb25kaW5nIGtleSBkb2VzIG5vdCBleGlzdCBpblxuICAgICAqIHRoZSBldm9sdmVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7azogKHYgLT4gdil9IC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdHJhbnNmb3JtYXRpb25zIFRoZSBvYmplY3Qgc3BlY2lmeWluZyB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbnMgdG8gYXBwbHlcbiAgICAgKiAgICAgICAgdG8gdGhlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgdHJhbnNmb3JtZWQuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdHJhbnNmb3JtZWQgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB0b21hdG8gID0ge2ZpcnN0TmFtZTogJyAgVG9tYXRvICcsIGRhdGE6IHtlbGFwc2VkOiAxMDAsIHJlbWFpbmluZzogMTQwMH0sIGlkOjEyM307XG4gICAgICogICAgICB2YXIgdHJhbnNmb3JtYXRpb25zID0ge1xuICAgICAqICAgICAgICBmaXJzdE5hbWU6IFIudHJpbSxcbiAgICAgKiAgICAgICAgbGFzdE5hbWU6IFIudHJpbSwgLy8gV2lsbCBub3QgZ2V0IGludm9rZWQuXG4gICAgICogICAgICAgIGRhdGE6IHtlbGFwc2VkOiBSLmFkZCgxKSwgcmVtYWluaW5nOiBSLmFkZCgtMSl9XG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgUi5ldm9sdmUodHJhbnNmb3JtYXRpb25zLCB0b21hdG8pOyAvLz0+IHtmaXJzdE5hbWU6ICdUb21hdG8nLCBkYXRhOiB7ZWxhcHNlZDogMTAxLCByZW1haW5pbmc6IDEzOTl9LCBpZDoxMjN9XG4gICAgICovXG4gICAgdmFyIGV2b2x2ZSA9IF9jdXJyeTIoZnVuY3Rpb24gZXZvbHZlKHRyYW5zZm9ybWF0aW9ucywgb2JqZWN0KSB7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1hdGlvbiwga2V5LCB0eXBlLCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbiA9IHRyYW5zZm9ybWF0aW9uc1trZXldO1xuICAgICAgICAgICAgdHlwZSA9IHR5cGVvZiB0cmFuc2Zvcm1hdGlvbjtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdHlwZSA9PT0gJ2Z1bmN0aW9uJyA/IHRyYW5zZm9ybWF0aW9uKG9iamVjdFtrZXldKSA6IHR5cGUgPT09ICdvYmplY3QnID8gZXZvbHZlKHRyYW5zZm9ybWF0aW9uc1trZXldLCBvYmplY3Rba2V5XSkgOiBvYmplY3Rba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBvYmplY3Qgb3V0IG9mIGEgbGlzdCBrZXktdmFsdWUgcGFpcnMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIFtbayx2XV0gLT4ge2s6IHZ9XG4gICAgICogQHBhcmFtIHtBcnJheX0gcGFpcnMgQW4gYXJyYXkgb2YgdHdvLWVsZW1lbnQgYXJyYXlzIHRoYXQgd2lsbCBiZSB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIHRoZSBvdXRwdXQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG9iamVjdCBtYWRlIGJ5IHBhaXJpbmcgdXAgYGtleXNgIGFuZCBgdmFsdWVzYC5cbiAgICAgKiBAc2VlIFIudG9QYWlyc1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuZnJvbVBhaXJzKFtbJ2EnLCAxXSwgWydiJywgMl0sICBbJ2MnLCAzXV0pOyAvLz0+IHthOiAxLCBiOiAyLCBjOiAzfVxuICAgICAqL1xuICAgIHZhciBmcm9tUGFpcnMgPSBfY3VycnkxKGZ1bmN0aW9uIGZyb21QYWlycyhwYWlycykge1xuICAgICAgICB2YXIgaWR4ID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoLCBvdXQgPSB7fTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKF9pc0FycmF5KHBhaXJzW2lkeF0pICYmIHBhaXJzW2lkeF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0W3BhaXJzW2lkeF1bMF1dID0gcGFpcnNbaWR4XVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQ7XG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYSA9PiBhIC0+IGEgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7Kn0gYVxuICAgICAqIEBwYXJhbSB7Kn0gYlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICogQHNlZSBSLmx0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5ndCgyLCAxKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmd0KDIsIDIpOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmd0KDIsIDMpOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmd0KCdhJywgJ3onKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5ndCgneicsICdhJyk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBndCA9IF9jdXJyeTIoZnVuY3Rpb24gZ3QoYSwgYikge1xuICAgICAgICByZXR1cm4gYSA+IGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBzZWNvbmQ7XG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYSA9PiBhIC0+IGEgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBzZWUgUi5sdGVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmd0ZSgyLCAxKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmd0ZSgyLCAyKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmd0ZSgyLCAzKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5ndGUoJ2EnLCAneicpOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmd0ZSgneicsICdhJyk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBndGUgPSBfY3VycnkyKGZ1bmN0aW9uIGd0ZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBhID49IGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBoYXMgYW4gb3duIHByb3BlcnR5IHdpdGhcbiAgICAgKiB0aGUgc3BlY2lmaWVkIG5hbWVcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBzIC0+IHtzOiB4fSAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3AgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrIGZvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciB0aGUgcHJvcGVydHkgZXhpc3RzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBoYXNOYW1lID0gUi5oYXMoJ25hbWUnKTtcbiAgICAgKiAgICAgIGhhc05hbWUoe25hbWU6ICdhbGljZSd9KTsgICAvLz0+IHRydWVcbiAgICAgKiAgICAgIGhhc05hbWUoe25hbWU6ICdib2InfSk7ICAgICAvLz0+IHRydWVcbiAgICAgKiAgICAgIGhhc05hbWUoe30pOyAgICAgICAgICAgICAgICAvLz0+IGZhbHNlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBwb2ludCA9IHt4OiAwLCB5OiAwfTtcbiAgICAgKiAgICAgIHZhciBwb2ludEhhcyA9IFIuaGFzKFIuX18sIHBvaW50KTtcbiAgICAgKiAgICAgIHBvaW50SGFzKCd4Jyk7ICAvLz0+IHRydWVcbiAgICAgKiAgICAgIHBvaW50SGFzKCd5Jyk7ICAvLz0+IHRydWVcbiAgICAgKiAgICAgIHBvaW50SGFzKCd6Jyk7ICAvLz0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIGhhcyA9IF9jdXJyeTIoX2hhcyk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluIGhhc1xuICAgICAqIGEgcHJvcGVydHkgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBzIC0+IHtzOiB4fSAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3AgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrIGZvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciB0aGUgcHJvcGVydHkgZXhpc3RzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIGZ1bmN0aW9uIFJlY3RhbmdsZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICogICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgKiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICogICAgICB9XG4gICAgICogICAgICBSZWN0YW5nbGUucHJvdG90eXBlLmFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIHRoaXMud2lkdGggKiB0aGlzLmhlaWdodDtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzcXVhcmUgPSBuZXcgUmVjdGFuZ2xlKDIsIDIpO1xuICAgICAqICAgICAgUi5oYXNJbignd2lkdGgnLCBzcXVhcmUpOyAgLy89PiB0cnVlXG4gICAgICogICAgICBSLmhhc0luKCdhcmVhJywgc3F1YXJlKTsgIC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBoYXNJbiA9IF9jdXJyeTIoZnVuY3Rpb24gaGFzSW4ocHJvcCwgb2JqKSB7XG4gICAgICAgIHJldHVybiBwcm9wIGluIG9iajtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBpdHMgYXJndW1lbnRzIGFyZSBpZGVudGljYWwsIGZhbHNlIG90aGVyd2lzZS4gVmFsdWVzIGFyZVxuICAgICAqIGlkZW50aWNhbCBpZiB0aGV5IHJlZmVyZW5jZSB0aGUgc2FtZSBtZW1vcnkuIGBOYU5gIGlzIGlkZW50aWNhbCB0byBgTmFOYDtcbiAgICAgKiBgMGAgYW5kIGAtMGAgYXJlIG5vdCBpZGVudGljYWwuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBhIC0+IGEgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7Kn0gYVxuICAgICAqIEBwYXJhbSB7Kn0gYlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG8gPSB7fTtcbiAgICAgKiAgICAgIFIuaWRlbnRpY2FsKG8sIG8pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaWRlbnRpY2FsKDEsIDEpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaWRlbnRpY2FsKDEsICcxJyk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaWRlbnRpY2FsKFtdLCBbXSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaWRlbnRpY2FsKDAsIC0wKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5pZGVudGljYWwoTmFOLCBOYU4pOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICAvLyBTYW1lVmFsdWUgYWxnb3JpdGhtXG4gICAgLy8gU3RlcHMgMS01LCA3LTEwXG4gICAgLy8gU3RlcHMgNi5iLTYuZTogKzAgIT0gLTBcbiAgICAvLyBTdGVwIDYuYTogTmFOID09IE5hTlxuICAgIHZhciBpZGVudGljYWwgPSBfY3VycnkyKGZ1bmN0aW9uIGlkZW50aWNhbChhLCBiKSB7XG4gICAgICAgIC8vIFNhbWVWYWx1ZSBhbGdvcml0aG1cbiAgICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgIC8vIFN0ZXBzIDEtNSwgNy0xMFxuICAgICAgICAgICAgLy8gU3RlcHMgNi5iLTYuZTogKzAgIT0gLTBcbiAgICAgICAgICAgIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFN0ZXAgNi5hOiBOYU4gPT0gTmFOXG4gICAgICAgICAgICByZXR1cm4gYSAhPT0gYSAmJiBiICE9PSBiO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBIGZ1bmN0aW9uIHRoYXQgZG9lcyBub3RoaW5nIGJ1dCByZXR1cm4gdGhlIHBhcmFtZXRlciBzdXBwbGllZCB0byBpdC4gR29vZCBhcyBhIGRlZmF1bHRcbiAgICAgKiBvciBwbGFjZWhvbGRlciBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIGEgLT4gYVxuICAgICAqIEBwYXJhbSB7Kn0geCBUaGUgdmFsdWUgdG8gcmV0dXJuLlxuICAgICAqIEByZXR1cm4geyp9IFRoZSBpbnB1dCB2YWx1ZSwgYHhgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaWRlbnRpdHkoMSk7IC8vPT4gMVxuICAgICAqXG4gICAgICogICAgICB2YXIgb2JqID0ge307XG4gICAgICogICAgICBSLmlkZW50aXR5KG9iaikgPT09IG9iajsgLy89PiB0cnVlXG4gICAgICovXG4gICAgdmFyIGlkZW50aXR5ID0gX2N1cnJ5MShfaWRlbnRpdHkpO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBwcm9jZXNzIGVpdGhlciB0aGUgYG9uVHJ1ZWAgb3IgdGhlIGBvbkZhbHNlYCBmdW5jdGlvbiBkZXBlbmRpbmdcbiAgICAgKiB1cG9uIHRoZSByZXN1bHQgb2YgdGhlIGBjb25kaXRpb25gIHByZWRpY2F0ZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTG9naWNcbiAgICAgKiBAc2lnICgqLi4uIC0+IEJvb2xlYW4pIC0+ICgqLi4uIC0+ICopIC0+ICgqLi4uIC0+ICopIC0+ICgqLi4uIC0+ICopXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZGl0aW9uIEEgcHJlZGljYXRlIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb25UcnVlIEEgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gdGhlIGBjb25kaXRpb25gIGV2YWx1YXRlcyB0byBhIHRydXRoeSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZhbHNlIEEgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gdGhlIGBjb25kaXRpb25gIGV2YWx1YXRlcyB0byBhIGZhbHN5IHZhbHVlLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIG5ldyB1bmFyeSBmdW5jdGlvbiB0aGF0IHdpbGwgcHJvY2VzcyBlaXRoZXIgdGhlIGBvblRydWVgIG9yIHRoZSBgb25GYWxzZWBcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZGVwZW5kaW5nIHVwb24gdGhlIHJlc3VsdCBvZiB0aGUgYGNvbmRpdGlvbmAgcHJlZGljYXRlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIC8vIEZsYXR0ZW4gYWxsIGFycmF5cyBpbiB0aGUgbGlzdCBidXQgbGVhdmUgb3RoZXIgdmFsdWVzIGFsb25lLlxuICAgICAqICAgICAgdmFyIGZsYXR0ZW5BcnJheXMgPSBSLm1hcChSLmlmRWxzZShBcnJheS5pc0FycmF5LCBSLmZsYXR0ZW4sIFIuaWRlbnRpdHkpKTtcbiAgICAgKlxuICAgICAqICAgICAgZmxhdHRlbkFycmF5cyhbWzBdLCBbWzEwXSwgWzhdXSwgMTIzNCwge31dKTsgLy89PiBbWzBdLCBbMTAsIDhdLCAxMjM0LCB7fV1cbiAgICAgKiAgICAgIGZsYXR0ZW5BcnJheXMoW1tbMTBdLCAxMjNdLCBbOCwgWzEwXV0sIFwiaGVsbG9cIl0pOyAvLz0+IFtbMTAsIDEyM10sIFs4LCAxMF0sIFwiaGVsbG9cIl1cbiAgICAgKi9cbiAgICB2YXIgaWZFbHNlID0gX2N1cnJ5MyhmdW5jdGlvbiBpZkVsc2UoY29uZGl0aW9uLCBvblRydWUsIG9uRmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJ5TihNYXRoLm1heChjb25kaXRpb24ubGVuZ3RoLCBvblRydWUubGVuZ3RoLCBvbkZhbHNlLmxlbmd0aCksIGZ1bmN0aW9uIF9pZkVsc2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZGl0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgPyBvblRydWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IG9uRmFsc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBJbmNyZW1lbnRzIGl0cyBhcmd1bWVudC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTWF0aFxuICAgICAqIEBzaWcgTnVtYmVyIC0+IE51bWJlclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBzZWUgUi5kZWNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmluYyg0Mik7IC8vPT4gNDNcbiAgICAgKi9cbiAgICB2YXIgaW5jID0gYWRkKDEpO1xuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgc3VwcGxpZWQgZWxlbWVudCBpbnRvIHRoZSBsaXN0LCBhdCBpbmRleCBgaW5kZXhgLiAgX05vdGVcbiAgICAgKiB0aGF0IHRoaXMgaXMgbm90IGRlc3RydWN0aXZlXzogaXQgcmV0dXJucyBhIGNvcHkgb2YgdGhlIGxpc3Qgd2l0aCB0aGUgY2hhbmdlcy5cbiAgICAgKiA8c21hbGw+Tm8gbGlzdHMgaGF2ZSBiZWVuIGhhcm1lZCBpbiB0aGUgYXBwbGljYXRpb24gb2YgdGhpcyBmdW5jdGlvbi48L3NtYWxsPlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gYSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBwb3NpdGlvbiB0byBpbnNlcnQgdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0geyp9IGVsdCBUaGUgZWxlbWVudCB0byBpbnNlcnQgaW50byB0aGUgQXJyYXlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGluc2VydCBpbnRvXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IEFycmF5IHdpdGggYGVsdGAgaW5zZXJ0ZWQgYXQgYGluZGV4YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmluc2VydCgyLCAneCcsIFsxLDIsMyw0XSk7IC8vPT4gWzEsMiwneCcsMyw0XVxuICAgICAqL1xuICAgIHZhciBpbnNlcnQgPSBfY3VycnkzKGZ1bmN0aW9uIGluc2VydChpZHgsIGVsdCwgbGlzdCkge1xuICAgICAgICBpZHggPSBpZHggPCBsaXN0Lmxlbmd0aCAmJiBpZHggPj0gMCA/IGlkeCA6IGxpc3QubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0ID0gX3NsaWNlKGxpc3QpO1xuICAgICAgICByZXN1bHQuc3BsaWNlKGlkeCwgMCwgZWx0KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIHN1Yi1saXN0IGludG8gdGhlIGxpc3QsIGF0IGluZGV4IGBpbmRleGAuICBfTm90ZSAgdGhhdCB0aGlzXG4gICAgICogaXMgbm90IGRlc3RydWN0aXZlXzogaXQgcmV0dXJucyBhIGNvcHkgb2YgdGhlIGxpc3Qgd2l0aCB0aGUgY2hhbmdlcy5cbiAgICAgKiA8c21hbGw+Tm8gbGlzdHMgaGF2ZSBiZWVuIGhhcm1lZCBpbiB0aGUgYXBwbGljYXRpb24gb2YgdGhpcyBmdW5jdGlvbi48L3NtYWxsPlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gW2FdIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIHBvc2l0aW9uIHRvIGluc2VydCB0aGUgc3ViLWxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBlbHRzIFRoZSBzdWItbGlzdCB0byBpbnNlcnQgaW50byB0aGUgQXJyYXlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGluc2VydCB0aGUgc3ViLWxpc3QgaW50b1xuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBBcnJheSB3aXRoIGBlbHRzYCBpbnNlcnRlZCBzdGFydGluZyBhdCBgaW5kZXhgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaW5zZXJ0QWxsKDIsIFsneCcsJ3knLCd6J10sIFsxLDIsMyw0XSk7IC8vPT4gWzEsMiwneCcsJ3knLCd6JywzLDRdXG4gICAgICovXG4gICAgdmFyIGluc2VydEFsbCA9IF9jdXJyeTMoZnVuY3Rpb24gaW5zZXJ0QWxsKGlkeCwgZWx0cywgbGlzdCkge1xuICAgICAgICBpZHggPSBpZHggPCBsaXN0Lmxlbmd0aCAmJiBpZHggPj0gMCA/IGlkeCA6IGxpc3QubGVuZ3RoO1xuICAgICAgICByZXR1cm4gX2NvbmNhdChfY29uY2F0KF9zbGljZShsaXN0LCAwLCBpZHgpLCBlbHRzKSwgX3NsaWNlKGxpc3QsIGlkeCkpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU2VlIGlmIGFuIG9iamVjdCAoYHZhbGApIGlzIGFuIGluc3RhbmNlIG9mIHRoZSBzdXBwbGllZCBjb25zdHJ1Y3Rvci5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgY2hlY2sgdXAgdGhlIGluaGVyaXRhbmNlIGNoYWluLCBpZiBhbnkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFR5cGVcbiAgICAgKiBAc2lnICgqIC0+IHsqfSkgLT4gYSAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGN0b3IgQSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7Kn0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmlzKE9iamVjdCwge30pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaXMoTnVtYmVyLCAxKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmlzKE9iamVjdCwgMSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaXMoU3RyaW5nLCAncycpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaXMoU3RyaW5nLCBuZXcgU3RyaW5nKCcnKSk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5pcyhPYmplY3QsIG5ldyBTdHJpbmcoJycpKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmlzKE9iamVjdCwgJ3MnKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5pcyhOdW1iZXIsIHt9KTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBpcyA9IF9jdXJyeTIoZnVuY3Rpb24gaXMoQ3RvciwgdmFsKSB7XG4gICAgICAgIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwuY29uc3RydWN0b3IgPT09IEN0b3IgfHwgdmFsIGluc3RhbmNlb2YgQ3RvcjtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBpcyBzaW1pbGFyIHRvIGFuIGFycmF5LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBUeXBlXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnICogLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7Kn0geCBUaGUgb2JqZWN0IHRvIHRlc3QuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB4YCBoYXMgYSBudW1lcmljIGxlbmd0aCBwcm9wZXJ0eSBhbmQgZXh0cmVtZSBpbmRpY2VzIGRlZmluZWQ7IGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaXNBcnJheUxpa2UoW10pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaXNBcnJheUxpa2UodHJ1ZSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaXNBcnJheUxpa2Uoe30pOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmlzQXJyYXlMaWtlKHtsZW5ndGg6IDEwfSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaXNBcnJheUxpa2UoezA6ICd6ZXJvJywgOTogJ25pbmUnLCBsZW5ndGg6IDEwfSk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBpc0FycmF5TGlrZSA9IF9jdXJyeTEoZnVuY3Rpb24gaXNBcnJheUxpa2UoeCkge1xuICAgICAgICBpZiAoX2lzQXJyYXkoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgheCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh4Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gISF4Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh4Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB4Lmhhc093blByb3BlcnR5KDApICYmIHguaGFzT3duUHJvcGVydHkoeC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXBvcnRzIHdoZXRoZXIgdGhlIGxpc3QgaGFzIHplcm8gZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyBbYV0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaXNFbXB0eShbMSwgMiwgM10pOyAgIC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuaXNFbXB0eShbXSk7ICAgICAgICAgIC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5pc0VtcHR5KCcnKTsgICAgICAgICAgLy89PiB0cnVlXG4gICAgICogICAgICBSLmlzRW1wdHkobnVsbCk7ICAgICAgICAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmlzRW1wdHkoUi5rZXlzKHt9KSk7ICAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaXNFbXB0eSh7fSk7ICAgICAgICAgIC8vPT4gZmFsc2UgKHt9IGRvZXMgbm90IGhhdmUgYSBsZW5ndGggcHJvcGVydHkpXG4gICAgICogICAgICBSLmlzRW1wdHkoe2xlbmd0aDogMH0pOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgaXNFbXB0eSA9IF9jdXJyeTEoZnVuY3Rpb24gaXNFbXB0eShsaXN0KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QobGlzdCkubGVuZ3RoID09PSAwO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBpbnB1dCB2YWx1ZSBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFR5cGVcbiAgICAgKiBAc2lnICogLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7Kn0geCBUaGUgdmFsdWUgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYHhgIGlzIGB1bmRlZmluZWRgIG9yIGBudWxsYCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5pc05pbChudWxsKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmlzTmlsKHVuZGVmaW5lZCk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5pc05pbCgwKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5pc05pbChbXSk7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgaXNOaWwgPSBfY3VycnkxKGZ1bmN0aW9uIGlzTmlsKHgpIHtcbiAgICAgICAgcmV0dXJuIHggPT0gbnVsbDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsaXN0IGNvbnRhaW5pbmcgdGhlIG5hbWVzIG9mIGFsbCB0aGUgZW51bWVyYWJsZSBvd25cbiAgICAgKiBwcm9wZXJ0aWVzIG9mIHRoZSBzdXBwbGllZCBvYmplY3QuXG4gICAgICogTm90ZSB0aGF0IHRoZSBvcmRlciBvZiB0aGUgb3V0cHV0IGFycmF5IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlXG4gICAgICogY29uc2lzdGVudCBhY3Jvc3MgZGlmZmVyZW50IEpTIHBsYXRmb3Jtcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7azogdn0gLT4gW2tdXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGV4dHJhY3QgcHJvcGVydGllcyBmcm9tXG4gICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIHRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmtleXMoe2E6IDEsIGI6IDIsIGM6IDN9KTsgLy89PiBbJ2EnLCAnYicsICdjJ11cbiAgICAgKi9cbiAgICAvLyBjb3ZlciBJRSA8IDkga2V5cyBpc3N1ZXNcbiAgICB2YXIga2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gY292ZXIgSUUgPCA5IGtleXMgaXNzdWVzXG4gICAgICAgIHZhciBoYXNFbnVtQnVnID0gIXsgdG9TdHJpbmc6IG51bGwgfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgICAgICAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFtcbiAgICAgICAgICAgICdjb25zdHJ1Y3RvcicsXG4gICAgICAgICAgICAndmFsdWVPZicsXG4gICAgICAgICAgICAnaXNQcm90b3R5cGVPZicsXG4gICAgICAgICAgICAndG9TdHJpbmcnLFxuICAgICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgICAgICAgICAgICdoYXNPd25Qcm9wZXJ0eScsXG4gICAgICAgICAgICAndG9Mb2NhbGVTdHJpbmcnXG4gICAgICAgIF07XG4gICAgICAgIHZhciBjb250YWlucyA9IGZ1bmN0aW9uIGNvbnRhaW5zKGxpc3QsIGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RbaWR4XSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgPyBfY3VycnkxKGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0KG9iaikgIT09IG9iaiA/IFtdIDogT2JqZWN0LmtleXMob2JqKTtcbiAgICAgICAgfSkgOiBfY3VycnkxKGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0KG9iaikgIT09IG9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcm9wLCBrcyA9IFtdLCBuSWR4O1xuICAgICAgICAgICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChfaGFzKHByb3AsIG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAga3Nba3MubGVuZ3RoXSA9IHByb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0VudW1CdWcpIHtcbiAgICAgICAgICAgICAgICBuSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5JZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25JZHhdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2hhcyhwcm9wLCBvYmopICYmICFjb250YWlucyhrcywgcHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtzW2tzLmxlbmd0aF0gPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5JZHggLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ga3M7XG4gICAgICAgIH0pO1xuICAgIH0oKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsaXN0IGNvbnRhaW5pbmcgdGhlIG5hbWVzIG9mIGFsbCB0aGVcbiAgICAgKiBwcm9wZXJ0aWVzIG9mIHRoZSBzdXBwbGllZCBvYmplY3QsIGluY2x1ZGluZyBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAgICAgKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmVcbiAgICAgKiBjb25zaXN0ZW50IGFjcm9zcyBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtrOiB2fSAtPiBba11cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCBwcm9wZXJ0aWVzIGZyb21cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgdGhlIG9iamVjdCdzIG93biBhbmQgcHJvdG90eXBlIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIEYgPSBmdW5jdGlvbigpIHsgdGhpcy54ID0gJ1gnOyB9O1xuICAgICAqICAgICAgRi5wcm90b3R5cGUueSA9ICdZJztcbiAgICAgKiAgICAgIHZhciBmID0gbmV3IEYoKTtcbiAgICAgKiAgICAgIFIua2V5c0luKGYpOyAvLz0+IFsneCcsICd5J11cbiAgICAgKi9cbiAgICB2YXIga2V5c0luID0gX2N1cnJ5MShmdW5jdGlvbiBrZXlzSW4ob2JqKSB7XG4gICAgICAgIHZhciBwcm9wLCBrcyA9IFtdO1xuICAgICAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICAgICAgICBrc1trcy5sZW5ndGhdID0gcHJvcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga3M7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGFycmF5IGJ5IHJldHVybmluZyBgbGlzdC5sZW5ndGhgLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBbYV0gLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubGVuZ3RoKFtdKTsgLy89PiAwXG4gICAgICogICAgICBSLmxlbmd0aChbMSwgMiwgM10pOyAvLz0+IDNcbiAgICAgKi9cbiAgICB2YXIgbGVuZ3RoID0gX2N1cnJ5MShmdW5jdGlvbiBsZW5ndGgobGlzdCkge1xuICAgICAgICByZXR1cm4gbGlzdCAhPSBudWxsICYmIGlzKE51bWJlciwgbGlzdC5sZW5ndGgpID8gbGlzdC5sZW5ndGggOiBOYU47XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbGVzcyB0aGFuIHRoZSBzZWNvbmQ7XG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYSA9PiBhIC0+IGEgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7Kn0gYVxuICAgICAqIEBwYXJhbSB7Kn0gYlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICogQHNlZSBSLmd0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5sdCgyLCAxKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5sdCgyLCAyKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5sdCgyLCAzKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmx0KCdhJywgJ3onKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmx0KCd6JywgJ2EnKTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBsdCA9IF9jdXJyeTIoZnVuY3Rpb24gbHQoYSwgYikge1xuICAgICAgICByZXR1cm4gYSA8IGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBzZWNvbmQ7XG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYSA9PiBhIC0+IGEgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBzZWUgUi5ndGVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmx0ZSgyLCAxKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5sdGUoMiwgMik7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5sdGUoMiwgMyk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5sdGUoJ2EnLCAneicpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIubHRlKCd6JywgJ2EnKTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBsdGUgPSBfY3VycnkyKGZ1bmN0aW9uIGx0ZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBhIDw9IGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFwQWNjdW0gZnVuY3Rpb24gYmVoYXZlcyBsaWtlIGEgY29tYmluYXRpb24gb2YgbWFwIGFuZCByZWR1Y2U7IGl0IGFwcGxpZXMgYVxuICAgICAqIGZ1bmN0aW9uIHRvIGVhY2ggZWxlbWVudCBvZiBhIGxpc3QsIHBhc3NpbmcgYW4gYWNjdW11bGF0aW5nIHBhcmFtZXRlciBmcm9tIGxlZnQgdG9cbiAgICAgKiByaWdodCwgYW5kIHJldHVybmluZyBhIGZpbmFsIHZhbHVlIG9mIHRoaXMgYWNjdW11bGF0b3IgdG9nZXRoZXIgd2l0aCB0aGUgbmV3IGxpc3QuXG4gICAgICpcbiAgICAgKiBUaGUgaXRlcmF0b3IgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIGFyZ3VtZW50cywgKmFjYyogYW5kICp2YWx1ZSosIGFuZCBzaG91bGQgcmV0dXJuXG4gICAgICogYSB0dXBsZSAqW2FjYywgdmFsdWVdKi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGFjYyAtPiB4IC0+IChhY2MsIHkpKSAtPiBhY2MgLT4gW3hdIC0+IChhY2MsIFt5XSlcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGV2ZXJ5IGVsZW1lbnQgb2YgdGhlIGlucHV0IGBsaXN0YC5cbiAgICAgKiBAcGFyYW0geyp9IGFjYyBUaGUgYWNjdW11bGF0b3IgdmFsdWUuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgbGlzdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIGZpbmFsLCBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgZGlnaXRzID0gWycxJywgJzInLCAnMycsICc0J107XG4gICAgICogICAgICB2YXIgYXBwZW5kID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgICAgICByZXR1cm4gW2EgKyBiLCBhICsgYl07XG4gICAgICogICAgICB9XG4gICAgICpcbiAgICAgKiAgICAgIFIubWFwQWNjdW0oYXBwZW5kLCAwLCBkaWdpdHMpOyAvLz0+IFsnMDEyMzQnLCBbJzAxJywgJzAxMicsICcwMTIzJywgJzAxMjM0J11dXG4gICAgICovXG4gICAgdmFyIG1hcEFjY3VtID0gX2N1cnJ5MyhmdW5jdGlvbiBtYXBBY2N1bShmbiwgYWNjLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aCwgcmVzdWx0ID0gW10sIHR1cGxlID0gW2FjY107XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIHR1cGxlID0gZm4odHVwbGVbMF0sIGxpc3RbaWR4XSk7XG4gICAgICAgICAgICByZXN1bHRbaWR4XSA9IHR1cGxlWzFdO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHR1cGxlWzBdLFxuICAgICAgICAgICAgcmVzdWx0XG4gICAgICAgIF07XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFwQWNjdW1SaWdodCBmdW5jdGlvbiBiZWhhdmVzIGxpa2UgYSBjb21iaW5hdGlvbiBvZiBtYXAgYW5kIHJlZHVjZTsgaXQgYXBwbGllcyBhXG4gICAgICogZnVuY3Rpb24gdG8gZWFjaCBlbGVtZW50IG9mIGEgbGlzdCwgcGFzc2luZyBhbiBhY2N1bXVsYXRpbmcgcGFyYW1ldGVyIGZyb20gcmlnaHRcbiAgICAgKiB0byBsZWZ0LCBhbmQgcmV0dXJuaW5nIGEgZmluYWwgdmFsdWUgb2YgdGhpcyBhY2N1bXVsYXRvciB0b2dldGhlciB3aXRoIHRoZSBuZXcgbGlzdC5cbiAgICAgKlxuICAgICAqIFNpbWlsYXIgdG8gYG1hcEFjY3VtYCwgZXhjZXB0IG1vdmVzIHRocm91Z2ggdGhlIGlucHV0IGxpc3QgZnJvbSB0aGUgcmlnaHQgdG8gdGhlXG4gICAgICogbGVmdC5cbiAgICAgKlxuICAgICAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiByZWNlaXZlcyB0d28gYXJndW1lbnRzLCAqYWNjKiBhbmQgKnZhbHVlKiwgYW5kIHNob3VsZCByZXR1cm5cbiAgICAgKiBhIHR1cGxlICpbYWNjLCB2YWx1ZV0qLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYWNjIC0+IHggLT4gKGFjYywgeSkpIC0+IGFjYyAtPiBbeF0gLT4gKGFjYywgW3ldKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gZXZlcnkgZWxlbWVudCBvZiB0aGUgaW5wdXQgYGxpc3RgLlxuICAgICAqIEBwYXJhbSB7Kn0gYWNjIFRoZSBhY2N1bXVsYXRvciB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgZmluYWwsIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBkaWdpdHMgPSBbJzEnLCAnMicsICczJywgJzQnXTtcbiAgICAgKiAgICAgIHZhciBhcHBlbmQgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICogICAgICAgIHJldHVybiBbYSArIGIsIGEgKyBiXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKlxuICAgICAqICAgICAgUi5tYXBBY2N1bVJpZ2h0KGFwcGVuZCwgMCwgZGlnaXRzKTsgLy89PiBbJzA0MzIxJywgWycwNDMyMScsICcwNDMyJywgJzA0MycsICcwNCddXVxuICAgICAqL1xuICAgIHZhciBtYXBBY2N1bVJpZ2h0ID0gX2N1cnJ5MyhmdW5jdGlvbiBtYXBBY2N1bVJpZ2h0KGZuLCBhY2MsIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IGxpc3QubGVuZ3RoIC0gMSwgcmVzdWx0ID0gW10sIHR1cGxlID0gW2FjY107XG4gICAgICAgIHdoaWxlIChpZHggPj0gMCkge1xuICAgICAgICAgICAgdHVwbGUgPSBmbih0dXBsZVswXSwgbGlzdFtpZHhdKTtcbiAgICAgICAgICAgIHJlc3VsdFtpZHhdID0gdHVwbGVbMV07XG4gICAgICAgICAgICBpZHggLT0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdHVwbGVbMF0sXG4gICAgICAgICAgICByZXN1bHRcbiAgICAgICAgXTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGEgcmVndWxhciBleHByZXNzaW9uIGFnYWluc3QgYSBTdHJpbmcuIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uXG4gICAgICogd2lsbCByZXR1cm4gYW4gZW1wdHkgYXJyYXkgd2hlbiB0aGVyZSBhcmUgbm8gbWF0Y2hlcy4gVGhpcyBkaWZmZXJzXG4gICAgICogZnJvbSBbYFN0cmluZy5wcm90b3R5cGUubWF0Y2hgXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmcvbWF0Y2gpXG4gICAgICogd2hpY2ggcmV0dXJucyBgbnVsbGAgd2hlbiB0aGVyZSBhcmUgbm8gbWF0Y2hlcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAc2VlIFIudGVzdFxuICAgICAqIEBjYXRlZ29yeSBTdHJpbmdcbiAgICAgKiBAc2lnIFJlZ0V4cCAtPiBTdHJpbmcgLT4gW1N0cmluZyB8IFVuZGVmaW5lZF1cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gcnggQSByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIG1hdGNoIGFnYWluc3RcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGxpc3Qgb2YgbWF0Y2hlcyBvciBlbXB0eSBhcnJheS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1hdGNoKC8oW2Etel1hKS9nLCAnYmFuYW5hcycpOyAvLz0+IFsnYmEnLCAnbmEnLCAnbmEnXVxuICAgICAqICAgICAgUi5tYXRjaCgvYS8sICdiJyk7IC8vPT4gW11cbiAgICAgKiAgICAgIFIubWF0Y2goL2EvLCBudWxsKTsgLy89PiBUeXBlRXJyb3I6IG51bGwgZG9lcyBub3QgaGF2ZSBhIG1ldGhvZCBuYW1lZCBcIm1hdGNoXCJcbiAgICAgKi9cbiAgICB2YXIgbWF0Y2ggPSBfY3VycnkyKGZ1bmN0aW9uIG1hdGNoKHJ4LCBzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5tYXRjaChyeCkgfHwgW107XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBtYXRoTW9kIGJlaGF2ZXMgbGlrZSB0aGUgbW9kdWxvIG9wZXJhdG9yIHNob3VsZCBtYXRoZW1hdGljYWxseSwgdW5saWtlIHRoZSBgJWBcbiAgICAgKiBvcGVyYXRvciAoYW5kIGJ5IGV4dGVuc2lvbiwgUi5tb2R1bG8pLiBTbyB3aGlsZSBcIi0xNyAlIDVcIiBpcyAtMixcbiAgICAgKiBtYXRoTW9kKC0xNywgNSkgaXMgMy4gbWF0aE1vZCByZXF1aXJlcyBJbnRlZ2VyIGFyZ3VtZW50cywgYW5kIHJldHVybnMgTmFOXG4gICAgICogd2hlbiB0aGUgbW9kdWx1cyBpcyB6ZXJvIG9yIG5lZ2F0aXZlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBNYXRoXG4gICAgICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyIC0+IE51bWJlclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBtIFRoZSBkaXZpZGVuZC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcCB0aGUgbW9kdWx1cy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSByZXN1bHQgb2YgYGIgbW9kIGFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubWF0aE1vZCgtMTcsIDUpOyAgLy89PiAzXG4gICAgICogICAgICBSLm1hdGhNb2QoMTcsIDUpOyAgIC8vPT4gMlxuICAgICAqICAgICAgUi5tYXRoTW9kKDE3LCAtNSk7ICAvLz0+IE5hTlxuICAgICAqICAgICAgUi5tYXRoTW9kKDE3LCAwKTsgICAvLz0+IE5hTlxuICAgICAqICAgICAgUi5tYXRoTW9kKDE3LjIsIDUpOyAvLz0+IE5hTlxuICAgICAqICAgICAgUi5tYXRoTW9kKDE3LCA1LjMpOyAvLz0+IE5hTlxuICAgICAqXG4gICAgICogICAgICB2YXIgY2xvY2sgPSBSLm1hdGhNb2QoUi5fXywgMTIpO1xuICAgICAqICAgICAgY2xvY2soMTUpOyAvLz0+IDNcbiAgICAgKiAgICAgIGNsb2NrKDI0KTsgLy89PiAwXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzZXZlbnRlZW5Nb2QgPSBSLm1hdGhNb2QoMTcpO1xuICAgICAqICAgICAgc2V2ZW50ZWVuTW9kKDMpOyAgLy89PiAyXG4gICAgICogICAgICBzZXZlbnRlZW5Nb2QoNCk7ICAvLz0+IDFcbiAgICAgKiAgICAgIHNldmVudGVlbk1vZCgxMCk7IC8vPT4gN1xuICAgICAqL1xuICAgIHZhciBtYXRoTW9kID0gX2N1cnJ5MihmdW5jdGlvbiBtYXRoTW9kKG0sIHApIHtcbiAgICAgICAgaWYgKCFfaXNJbnRlZ2VyKG0pKSB7XG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzSW50ZWdlcihwKSB8fCBwIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG0gJSBwICsgcCkgJSBwO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGFyZ2VyIG9mIGl0cyB0d28gYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBSZWxhdGlvblxuICAgICAqIEBzaWcgT3JkIGEgPT4gYSAtPiBhIC0+IGFcbiAgICAgKiBAcGFyYW0geyp9IGFcbiAgICAgKiBAcGFyYW0geyp9IGJcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5tYXhCeSwgUi5taW5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1heCg3ODksIDEyMyk7IC8vPT4gNzg5XG4gICAgICogICAgICBSLm1heCgnYScsICdiJyk7IC8vPT4gJ2InXG4gICAgICovXG4gICAgdmFyIG1heCA9IF9jdXJyeTIoZnVuY3Rpb24gbWF4KGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIgPiBhID8gYiA6IGE7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBhIGZ1bmN0aW9uIGFuZCB0d28gdmFsdWVzLCBhbmQgcmV0dXJucyB3aGljaGV2ZXIgdmFsdWUgcHJvZHVjZXNcbiAgICAgKiB0aGUgbGFyZ2VyIHJlc3VsdCB3aGVuIHBhc3NlZCB0byB0aGUgcHJvdmlkZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYiA9PiAoYSAtPiBiKSAtPiBhIC0+IGEgLT4gYVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZcbiAgICAgKiBAcGFyYW0geyp9IGFcbiAgICAgKiBAcGFyYW0geyp9IGJcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5tYXgsIFIubWluQnlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1heEJ5KGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4gKiBuOyB9LCAtMywgMik7IC8vPT4gLTNcbiAgICAgKi9cbiAgICB2YXIgbWF4QnkgPSBfY3VycnkzKGZ1bmN0aW9uIG1heEJ5KGYsIGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGYoYikgPiBmKGEpID8gYiA6IGE7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgb2JqZWN0IHdpdGggdGhlIG93biBwcm9wZXJ0aWVzIG9mIGBhYFxuICAgICAqIG1lcmdlZCB3aXRoIHRoZSBvd24gcHJvcGVydGllcyBvZiBvYmplY3QgYGJgLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtrOiB2fSAtPiB7azogdn0gLT4ge2s6IHZ9XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1lcmdlKHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiAxMCB9LCB7ICdhZ2UnOiA0MCB9KTtcbiAgICAgKiAgICAgIC8vPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH1cbiAgICAgKlxuICAgICAqICAgICAgdmFyIHJlc2V0VG9EZWZhdWx0ID0gUi5tZXJnZShSLl9fLCB7eDogMH0pO1xuICAgICAqICAgICAgcmVzZXRUb0RlZmF1bHQoe3g6IDUsIHk6IDJ9KTsgLy89PiB7eDogMCwgeTogMn1cbiAgICAgKi9cbiAgICB2YXIgbWVyZ2UgPSBfY3VycnkyKGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICB2YXIga3MgPSBrZXlzKGEpO1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGtzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2tzW2lkeF1dID0gYVtrc1tpZHhdXTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGtzID0ga2V5cyhiKTtcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGtzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2tzW2lkeF1dID0gYltrc1tpZHhdXTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzbWFsbGVyIG9mIGl0cyB0d28gYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBSZWxhdGlvblxuICAgICAqIEBzaWcgT3JkIGEgPT4gYSAtPiBhIC0+IGFcbiAgICAgKiBAcGFyYW0geyp9IGFcbiAgICAgKiBAcGFyYW0geyp9IGJcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5taW5CeSwgUi5tYXhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1pbig3ODksIDEyMyk7IC8vPT4gMTIzXG4gICAgICogICAgICBSLm1pbignYScsICdiJyk7IC8vPT4gJ2EnXG4gICAgICovXG4gICAgdmFyIG1pbiA9IF9jdXJyeTIoZnVuY3Rpb24gbWluKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIgPCBhID8gYiA6IGE7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBhIGZ1bmN0aW9uIGFuZCB0d28gdmFsdWVzLCBhbmQgcmV0dXJucyB3aGljaGV2ZXIgdmFsdWUgcHJvZHVjZXNcbiAgICAgKiB0aGUgc21hbGxlciByZXN1bHQgd2hlbiBwYXNzZWQgdG8gdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBSZWxhdGlvblxuICAgICAqIEBzaWcgT3JkIGIgPT4gKGEgLT4gYikgLT4gYSAtPiBhIC0+IGFcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmXG4gICAgICogQHBhcmFtIHsqfSBhXG4gICAgICogQHBhcmFtIHsqfSBiXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAc2VlIFIubWluLCBSLm1heEJ5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5taW5CeShmdW5jdGlvbihuKSB7IHJldHVybiBuICogbjsgfSwgLTMsIDIpOyAvLz0+IDJcbiAgICAgKi9cbiAgICB2YXIgbWluQnkgPSBfY3VycnkzKGZ1bmN0aW9uIG1pbkJ5KGYsIGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGYoYikgPCBmKGEpID8gYiA6IGE7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGVzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIGJ5IHRoZSBmaXJzdCBhbmQgcmV0dXJucyB0aGUgcmVtYWluZGVyLlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9ucyBwcmVzZXJ2ZXMgdGhlIEphdmFTY3JpcHQtc3R5bGUgYmVoYXZpb3IgZm9yXG4gICAgICogbW9kdWxvLiBGb3IgbWF0aGVtYXRpY2FsIG1vZHVsbyBzZWUgYG1hdGhNb2RgXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE1hdGhcbiAgICAgKiBAc2lnIE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIHZhbHVlIHRvIHRoZSBkaXZpZGUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHBzZXVkby1tb2R1bHVzXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcmVzdWx0IG9mIGBiICUgYWAuXG4gICAgICogQHNlZSBSLm1hdGhNb2RcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1vZHVsbygxNywgMyk7IC8vPT4gMlxuICAgICAqICAgICAgLy8gSlMgYmVoYXZpb3I6XG4gICAgICogICAgICBSLm1vZHVsbygtMTcsIDMpOyAvLz0+IC0yXG4gICAgICogICAgICBSLm1vZHVsbygxNywgLTMpOyAvLz0+IDJcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGlzT2RkID0gUi5tb2R1bG8oUi5fXywgMik7XG4gICAgICogICAgICBpc09kZCg0Mik7IC8vPT4gMFxuICAgICAqICAgICAgaXNPZGQoMjEpOyAvLz0+IDFcbiAgICAgKi9cbiAgICB2YXIgbW9kdWxvID0gX2N1cnJ5MihmdW5jdGlvbiBtb2R1bG8oYSwgYikge1xuICAgICAgICByZXR1cm4gYSAlIGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBsaWVzIHR3byBudW1iZXJzLiBFcXVpdmFsZW50IHRvIGBhICogYmAgYnV0IGN1cnJpZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE1hdGhcbiAgICAgKiBAc2lnIE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgdmFsdWUuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcmVzdWx0IG9mIGBhICogYmAuXG4gICAgICogQHNlZSBSLmRpdmlkZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBkb3VibGUgPSBSLm11bHRpcGx5KDIpO1xuICAgICAqICAgICAgdmFyIHRyaXBsZSA9IFIubXVsdGlwbHkoMyk7XG4gICAgICogICAgICBkb3VibGUoMyk7ICAgICAgIC8vPT4gIDZcbiAgICAgKiAgICAgIHRyaXBsZSg0KTsgICAgICAgLy89PiAxMlxuICAgICAqICAgICAgUi5tdWx0aXBseSgyLCA1KTsgIC8vPT4gMTBcbiAgICAgKi9cbiAgICB2YXIgbXVsdGlwbHkgPSBfY3VycnkyKGZ1bmN0aW9uIG11bHRpcGx5KGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgKiBiO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYSBmdW5jdGlvbiBvZiBhbnkgYXJpdHkgKGluY2x1ZGluZyBudWxsYXJ5KSBpbiBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBleGFjdGx5IGBuYFxuICAgICAqIHBhcmFtZXRlcnMuIEFueSBleHRyYW5lb3VzIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgcGFzc2VkIHRvIHRoZSBzdXBwbGllZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIE51bWJlciAtPiAoKiAtPiBhKSAtPiAoKiAtPiBhKVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuIFRoZSBkZXNpcmVkIGFyaXR5IG9mIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIGBmbmAuIFRoZSBuZXcgZnVuY3Rpb24gaXMgZ3VhcmFudGVlZCB0byBiZSBvZlxuICAgICAqICAgICAgICAgYXJpdHkgYG5gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB0YWtlc1R3b0FyZ3MgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICogICAgICAgIHJldHVybiBbYSwgYl07XG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgdGFrZXNUd29BcmdzLmxlbmd0aDsgLy89PiAyXG4gICAgICogICAgICB0YWtlc1R3b0FyZ3MoMSwgMik7IC8vPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB0YWtlc09uZUFyZyA9IFIubkFyeSgxLCB0YWtlc1R3b0FyZ3MpO1xuICAgICAqICAgICAgdGFrZXNPbmVBcmcubGVuZ3RoOyAvLz0+IDFcbiAgICAgKiAgICAgIC8vIE9ubHkgYG5gIGFyZ3VtZW50cyBhcmUgcGFzc2VkIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uXG4gICAgICogICAgICB0YWtlc09uZUFyZygxLCAyKTsgLy89PiBbMSwgdW5kZWZpbmVkXVxuICAgICAqL1xuICAgIHZhciBuQXJ5ID0gX2N1cnJ5MihmdW5jdGlvbiBuQXJ5KG4sIGZuKSB7XG4gICAgICAgIHN3aXRjaCAobikge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgYTAsIGExKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwLCBhMSwgYTIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhMCwgYTEsIGEyLCBhMykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwLCBhMSwgYTIsIGEzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgYTAsIGExLCBhMiwgYTMsIGE0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhMCwgYTEsIGEyLCBhMywgYTQsIGE1LCBhNikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCwgYTkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBhMCwgYTEsIGEyLCBhMywgYTQsIGE1LCBhNiwgYTcsIGE4LCBhOSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBuQXJ5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciBubyBncmVhdGVyIHRoYW4gdGVuJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIE5lZ2F0ZXMgaXRzIGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBNYXRoXG4gICAgICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5uZWdhdGUoNDIpOyAvLz0+IC00MlxuICAgICAqL1xuICAgIHZhciBuZWdhdGUgPSBfY3VycnkxKGZ1bmN0aW9uIG5lZ2F0ZShuKSB7XG4gICAgICAgIHJldHVybiAtbjtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBgIWAgb2YgaXRzIGFyZ3VtZW50LiBJdCB3aWxsIHJldHVybiBgdHJ1ZWAgd2hlblxuICAgICAqIHBhc3NlZCBmYWxzZS15IHZhbHVlLCBhbmQgYGZhbHNlYCB3aGVuIHBhc3NlZCBhIHRydXRoLXkgb25lLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMb2dpY1xuICAgICAqIEBzaWcgKiAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHsqfSBhIGFueSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRoZSBsb2dpY2FsIGludmVyc2Ugb2YgcGFzc2VkIGFyZ3VtZW50LlxuICAgICAqIEBzZWUgUi5jb21wbGVtZW50XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5ub3QodHJ1ZSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIubm90KGZhbHNlKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLm5vdCgwKTsgPT4gdHJ1ZVxuICAgICAqICAgICAgUi5ub3QoMSk7ID0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIG5vdCA9IF9jdXJyeTEoZnVuY3Rpb24gbm90KGEpIHtcbiAgICAgICAgcmV0dXJuICFhO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnRoIGVsZW1lbnQgb2YgdGhlIGdpdmVuIGxpc3Qgb3Igc3RyaW5nLlxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUgdGhlIGVsZW1lbnQgYXQgaW5kZXggbGVuZ3RoICsgbiBpcyByZXR1cm5lZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgTnVtYmVyIC0+IFthXSAtPiBhIHwgVW5kZWZpbmVkXG4gICAgICogQHNpZyBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKiBAcGFyYW0geyp9IGxpc3RcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBsaXN0ID0gWydmb28nLCAnYmFyJywgJ2JheicsICdxdXV4J107XG4gICAgICogICAgICBSLm50aCgxLCBsaXN0KTsgLy89PiAnYmFyJ1xuICAgICAqICAgICAgUi5udGgoLTEsIGxpc3QpOyAvLz0+ICdxdXV4J1xuICAgICAqICAgICAgUi5udGgoLTk5LCBsaXN0KTsgLy89PiB1bmRlZmluZWRcbiAgICAgKlxuICAgICAqICAgICAgUi5udGgoJ2FiYycsIDIpOyAvLz0+ICdjJ1xuICAgICAqICAgICAgUi5udGgoJ2FiYycsIDMpOyAvLz0+ICcnXG4gICAgICovXG4gICAgdmFyIG50aCA9IF9jdXJyeTIoZnVuY3Rpb24gbnRoKG9mZnNldCwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gb2Zmc2V0IDwgMCA/IGxpc3QubGVuZ3RoICsgb2Zmc2V0IDogb2Zmc2V0O1xuICAgICAgICByZXR1cm4gX2lzU3RyaW5nKGxpc3QpID8gbGlzdC5jaGFyQXQoaWR4KSA6IGxpc3RbaWR4XTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGl0cyBudGggYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBOdW1iZXIgLT4gKi4uLiAtPiAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm50aEFyZygxKSgnYScsICdiJywgJ2MnKTsgLy89PiAnYidcbiAgICAgKiAgICAgIFIubnRoQXJnKC0xKSgnYScsICdiJywgJ2MnKTsgLy89PiAnYydcbiAgICAgKi9cbiAgICB2YXIgbnRoQXJnID0gX2N1cnJ5MShmdW5jdGlvbiBudGhBcmcobikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG50aChuLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnRoIGNoYXJhY3RlciBvZiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBTdHJpbmdcbiAgICAgKiBAc2lnIE51bWJlciAtPiBTdHJpbmcgLT4gU3RyaW5nXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIHYwLjE2LjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm50aENoYXIoMiwgJ1JhbWRhJyk7IC8vPT4gJ20nXG4gICAgICogICAgICBSLm50aENoYXIoLTIsICdSYW1kYScpOyAvLz0+ICdkJ1xuICAgICAqL1xuICAgIHZhciBudGhDaGFyID0gX2N1cnJ5MihmdW5jdGlvbiBudGhDaGFyKG4sIHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLmNoYXJBdChuIDwgMCA/IHN0ci5sZW5ndGggKyBuIDogbik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjaGFyYWN0ZXIgY29kZSBvZiB0aGUgbnRoIGNoYXJhY3RlciBvZiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBTdHJpbmdcbiAgICAgKiBAc2lnIE51bWJlciAtPiBTdHJpbmcgLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIHYwLjE2LjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm50aENoYXJDb2RlKDIsICdSYW1kYScpOyAvLz0+ICdtJy5jaGFyQ29kZUF0KDApXG4gICAgICogICAgICBSLm50aENoYXJDb2RlKC0yLCAnUmFtZGEnKTsgLy89PiAnZCcuY2hhckNvZGVBdCgwKVxuICAgICAqL1xuICAgIHZhciBudGhDaGFyQ29kZSA9IF9jdXJyeTIoZnVuY3Rpb24gbnRoQ2hhckNvZGUobiwgc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIuY2hhckNvZGVBdChuIDwgMCA/IHN0ci5sZW5ndGggKyBuIDogbik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc2luZ2xldG9uIGFycmF5IGNvbnRhaW5pbmcgdGhlIHZhbHVlIHByb3ZpZGVkLlxuICAgICAqXG4gICAgICogTm90ZSB0aGlzIGBvZmAgaXMgZGlmZmVyZW50IGZyb20gdGhlIEVTNiBgb2ZgOyBTZWVcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9vZlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgYSAtPiBbYV1cbiAgICAgKiBAcGFyYW0geyp9IHggYW55IHZhbHVlXG4gICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IHdyYXBwaW5nIGB4YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm9mKG51bGwpOyAvLz0+IFtudWxsXVxuICAgICAqICAgICAgUi5vZihbNDJdKTsgLy89PiBbWzQyXV1cbiAgICAgKi9cbiAgICB2YXIgb2YgPSBfY3VycnkxKGZ1bmN0aW9uIG9mKHgpIHtcbiAgICAgICAgcmV0dXJuIFt4XTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFjY2VwdHMgYSBmdW5jdGlvbiBgZm5gIGFuZCByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBndWFyZHMgaW52b2NhdGlvbiBvZiBgZm5gIHN1Y2ggdGhhdFxuICAgICAqIGBmbmAgY2FuIG9ubHkgZXZlciBiZSBjYWxsZWQgb25jZSwgbm8gbWF0dGVyIGhvdyBtYW55IHRpbWVzIHRoZSByZXR1cm5lZCBmdW5jdGlvbiBpc1xuICAgICAqIGludm9rZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoYS4uLiAtPiBiKSAtPiAoYS4uLiAtPiBiKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byB3cmFwIGluIGEgY2FsbC1vbmx5LW9uY2Ugd3JhcHBlci5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHdyYXBwZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGFkZE9uZU9uY2UgPSBSLm9uY2UoZnVuY3Rpb24oeCl7IHJldHVybiB4ICsgMTsgfSk7XG4gICAgICogICAgICBhZGRPbmVPbmNlKDEwKTsgLy89PiAxMVxuICAgICAqICAgICAgYWRkT25lT25jZShhZGRPbmVPbmNlKDUwKSk7IC8vPT4gMTFcbiAgICAgKi9cbiAgICB2YXIgb25jZSA9IF9jdXJyeTEoZnVuY3Rpb24gb25jZShmbikge1xuICAgICAgICB2YXIgY2FsbGVkID0gZmFsc2UsIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChjYWxsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcmVzdWx0IG9mIFwic2V0dGluZ1wiIHRoZSBwb3J0aW9uIG9mIHRoZSBnaXZlbiBkYXRhIHN0cnVjdHVyZVxuICAgICAqIGZvY3VzZWQgYnkgdGhlIGdpdmVuIGxlbnMgdG8gdGhlIGdpdmVuIHZhbHVlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAdHlwZWRlZiBMZW5zIHMgYSA9IEZ1bmN0b3IgZiA9PiAoYSAtPiBmIGEpIC0+IHMgLT4gZiBzXG4gICAgICogQHNpZyBMZW5zIHMgYSAtPiAoYSAtPiBhKSAtPiBzIC0+IHNcbiAgICAgKiBAcGFyYW0ge0xlbnN9IGxlbnNcbiAgICAgKiBAcGFyYW0geyp9IHZcbiAgICAgKiBAcGFyYW0geyp9IHhcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5wcm9wLCBSLmxlbnNJbmRleCwgUi5sZW5zUHJvcFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBoZWFkTGVucyA9IFIubGVuc0luZGV4KDApO1xuICAgICAqXG4gICAgICogICAgICBSLm92ZXIoaGVhZExlbnMsIFIudG9VcHBlciwgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbJ0ZPTycsICdiYXInLCAnYmF6J11cbiAgICAgKi9cbiAgICB2YXIgb3ZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIElkZW50aXR5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHgsXG4gICAgICAgICAgICAgICAgbWFwOiBmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSWRlbnRpdHkoZih4KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTMoZnVuY3Rpb24gb3ZlcihsZW5zLCBmLCB4KSB7XG4gICAgICAgICAgICByZXR1cm4gbGVucyhmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBJZGVudGl0eShmKHkpKTtcbiAgICAgICAgICAgIH0pKHgpLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSB0aGUgdmFsdWUgYXQgYSBnaXZlbiBwYXRoLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIFtTdHJpbmddIC0+IHtrOiB2fSAtPiB2IHwgVW5kZWZpbmVkXG4gICAgICogQHBhcmFtIHtBcnJheX0gcGF0aCBUaGUgcGF0aCB0byB1c2UuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIGRhdGEgYXQgYHBhdGhgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucGF0aChbJ2EnLCAnYiddLCB7YToge2I6IDJ9fSk7IC8vPT4gMlxuICAgICAqICAgICAgUi5wYXRoKFsnYScsICdiJ10sIHtjOiB7YjogMn19KTsgLy89PiB1bmRlZmluZWRcbiAgICAgKi9cbiAgICB2YXIgcGF0aCA9IF9jdXJyeTIoZnVuY3Rpb24gcGF0aChwYXRocywgb2JqKSB7XG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbCA9IG9iajtcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDAsIGxlbiA9IHBhdGhzLmxlbmd0aDsgaWR4IDwgbGVuICYmIHZhbCAhPSBudWxsOyBpZHggKz0gMSkge1xuICAgICAgICAgICAgICAgIHZhbCA9IHZhbFtwYXRoc1tpZHhdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYXJ0aWFsIGNvcHkgb2YgYW4gb2JqZWN0IGNvbnRhaW5pbmcgb25seSB0aGUga2V5cyBzcGVjaWZpZWQuICBJZiB0aGUga2V5IGRvZXMgbm90IGV4aXN0LCB0aGVcbiAgICAgKiBwcm9wZXJ0eSBpcyBpZ25vcmVkLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIFtrXSAtPiB7azogdn0gLT4ge2s6IHZ9XG4gICAgICogQHBhcmFtIHtBcnJheX0gbmFtZXMgYW4gYXJyYXkgb2YgU3RyaW5nIHByb3BlcnR5IG5hbWVzIHRvIGNvcHkgb250byBhIG5ldyBvYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gY29weSBmcm9tXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyBvYmplY3Qgd2l0aCBvbmx5IHByb3BlcnRpZXMgZnJvbSBgbmFtZXNgIG9uIGl0LlxuICAgICAqIEBzZWUgUi5vbWl0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5waWNrKFsnYScsICdkJ10sIHthOiAxLCBiOiAyLCBjOiAzLCBkOiA0fSk7IC8vPT4ge2E6IDEsIGQ6IDR9XG4gICAgICogICAgICBSLnBpY2soWydhJywgJ2UnLCAnZiddLCB7YTogMSwgYjogMiwgYzogMywgZDogNH0pOyAvLz0+IHthOiAxfVxuICAgICAqL1xuICAgIHZhciBwaWNrID0gX2N1cnJ5MihmdW5jdGlvbiBwaWNrKG5hbWVzLCBvYmopIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKG5hbWVzW2lkeF0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W25hbWVzW2lkeF1dID0gb2JqW25hbWVzW2lkeF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFNpbWlsYXIgdG8gYHBpY2tgIGV4Y2VwdCB0aGF0IHRoaXMgb25lIGluY2x1ZGVzIGEgYGtleTogdW5kZWZpbmVkYCBwYWlyIGZvciBwcm9wZXJ0aWVzIHRoYXQgZG9uJ3QgZXhpc3QuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzaWcgW2tdIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBuYW1lcyBhbiBhcnJheSBvZiBTdHJpbmcgcHJvcGVydHkgbmFtZXMgdG8gY29weSBvbnRvIGEgbmV3IG9iamVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBjb3B5IGZyb21cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IG9iamVjdCB3aXRoIG9ubHkgcHJvcGVydGllcyBmcm9tIGBuYW1lc2Agb24gaXQuXG4gICAgICogQHNlZSBSLnBpY2tcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnBpY2tBbGwoWydhJywgJ2QnXSwge2E6IDEsIGI6IDIsIGM6IDMsIGQ6IDR9KTsgLy89PiB7YTogMSwgZDogNH1cbiAgICAgKiAgICAgIFIucGlja0FsbChbJ2EnLCAnZScsICdmJ10sIHthOiAxLCBiOiAyLCBjOiAzLCBkOiA0fSk7IC8vPT4ge2E6IDEsIGU6IHVuZGVmaW5lZCwgZjogdW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHZhciBwaWNrQWxsID0gX2N1cnJ5MihmdW5jdGlvbiBwaWNrQWxsKG5hbWVzLCBvYmopIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IG5hbWVzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBuYW1lc1tpZHhdO1xuICAgICAgICAgICAgcmVzdWx0W25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYXJ0aWFsIGNvcHkgb2YgYW4gb2JqZWN0IGNvbnRhaW5pbmcgb25seSB0aGUga2V5cyB0aGF0XG4gICAgICogc2F0aXNmeSB0aGUgc3VwcGxpZWQgcHJlZGljYXRlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnICh2LCBrIC0+IEJvb2xlYW4pIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIHRvIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCBhIGtleVxuICAgICAqICAgICAgICBzaG91bGQgYmUgaW5jbHVkZWQgb24gdGhlIG91dHB1dCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGNvcHkgZnJvbVxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgb2JqZWN0IHdpdGggb25seSBwcm9wZXJ0aWVzIHRoYXQgc2F0aXNmeSBgcHJlZGBcbiAgICAgKiAgICAgICAgIG9uIGl0LlxuICAgICAqIEBzZWUgUi5waWNrXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGlzVXBwZXJDYXNlID0gZnVuY3Rpb24odmFsLCBrZXkpIHsgcmV0dXJuIGtleS50b1VwcGVyQ2FzZSgpID09PSBrZXk7IH1cbiAgICAgKiAgICAgIFIucGlja0J5KGlzVXBwZXJDYXNlLCB7YTogMSwgYjogMiwgQTogMywgQjogNH0pOyAvLz0+IHtBOiAzLCBCOiA0fVxuICAgICAqL1xuICAgIHZhciBwaWNrQnkgPSBfY3VycnkyKGZ1bmN0aW9uIHBpY2tCeSh0ZXN0LCBvYmopIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKHRlc3Qob2JqW3Byb3BdLCBwcm9wLCBvYmopKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BdID0gb2JqW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGxpc3Qgd2l0aCB0aGUgZ2l2ZW4gZWxlbWVudCBhdCB0aGUgZnJvbnQsIGZvbGxvd2VkIGJ5IHRoZSBjb250ZW50cyBvZiB0aGVcbiAgICAgKiBsaXN0LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBhIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0geyp9IGVsIFRoZSBpdGVtIHRvIGFkZCB0byB0aGUgaGVhZCBvZiB0aGUgb3V0cHV0IGxpc3QuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gYWRkIHRvIHRoZSB0YWlsIG9mIHRoZSBvdXRwdXQgbGlzdC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBuZXcgYXJyYXkuXG4gICAgICogQHNlZSBSLmFwcGVuZFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucHJlcGVuZCgnZmVlJywgWydmaScsICdmbycsICdmdW0nXSk7IC8vPT4gWydmZWUnLCAnZmknLCAnZm8nLCAnZnVtJ11cbiAgICAgKi9cbiAgICB2YXIgcHJlcGVuZCA9IF9jdXJyeTIoZnVuY3Rpb24gcHJlcGVuZChlbCwgbGlzdCkge1xuICAgICAgICByZXR1cm4gX2NvbmNhdChbZWxdLCBsaXN0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdoZW4gc3VwcGxpZWQgYW4gb2JqZWN0IHJldHVybnMgdGhlIGluZGljYXRlZCBwcm9wZXJ0eSBvZiB0aGF0IG9iamVjdCwgaWYgaXQgZXhpc3RzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHMgLT4ge3M6IGF9IC0+IGEgfCBVbmRlZmluZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcCBUaGUgcHJvcGVydHkgbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBxdWVyeVxuICAgICAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSBhdCBgb2JqLnBgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucHJvcCgneCcsIHt4OiAxMDB9KTsgLy89PiAxMDBcbiAgICAgKiAgICAgIFIucHJvcCgneCcsIHt9KTsgLy89PiB1bmRlZmluZWRcbiAgICAgKi9cbiAgICB2YXIgcHJvcCA9IF9jdXJyeTIoZnVuY3Rpb24gcHJvcChwLCBvYmopIHtcbiAgICAgICAgcmV0dXJuIG9ialtwXTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIElmIHRoZSBnaXZlbiwgbm9uLW51bGwgb2JqZWN0IGhhcyBhbiBvd24gcHJvcGVydHkgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUsXG4gICAgICogcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhhdCBwcm9wZXJ0eS5cbiAgICAgKiBPdGhlcndpc2UgcmV0dXJucyB0aGUgcHJvdmlkZWQgZGVmYXVsdCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBhIC0+IFN0cmluZyAtPiBPYmplY3QgLT4gYVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsIFRoZSBkZWZhdWx0IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byByZXR1cm4uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICAgICAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSBvZiBnaXZlbiBwcm9wZXJ0eSBvZiB0aGUgc3VwcGxpZWQgb2JqZWN0IG9yIHRoZSBkZWZhdWx0IHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBhbGljZSA9IHtcbiAgICAgKiAgICAgICAgbmFtZTogJ0FMSUNFJyxcbiAgICAgKiAgICAgICAgYWdlOiAxMDFcbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICB2YXIgZmF2b3JpdGUgPSBSLnByb3AoJ2Zhdm9yaXRlTGlicmFyeScpO1xuICAgICAqICAgICAgdmFyIGZhdm9yaXRlV2l0aERlZmF1bHQgPSBSLnByb3BPcignUmFtZGEnLCAnZmF2b3JpdGVMaWJyYXJ5Jyk7XG4gICAgICpcbiAgICAgKiAgICAgIGZhdm9yaXRlKGFsaWNlKTsgIC8vPT4gdW5kZWZpbmVkXG4gICAgICogICAgICBmYXZvcml0ZVdpdGhEZWZhdWx0KGFsaWNlKTsgIC8vPT4gJ1JhbWRhJ1xuICAgICAqL1xuICAgIHZhciBwcm9wT3IgPSBfY3VycnkzKGZ1bmN0aW9uIHByb3BPcih2YWwsIHAsIG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgX2hhcyhwLCBvYmopID8gb2JqW3BdIDogdmFsO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgcHJvcGVydHkgc2F0aXNmaWVzIHRoZSBnaXZlblxuICAgICAqIHByZWRpY2F0ZTsgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyAoYSAtPiBCb29sZWFuKSAtPiBTdHJpbmcgLT4ge1N0cmluZzogYX0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAc2VlIFIucHJvcEVxXG4gICAgICogQHNlZSBSLnByb3BJc1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucHJvcFNhdGlzZmllcyh4ID0+IHggPiAwLCAneCcsIHt4OiAxLCB5OiAyfSk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBwcm9wU2F0aXNmaWVzID0gX2N1cnJ5MyhmdW5jdGlvbiBwcm9wU2F0aXNmaWVzKHByZWQsIG5hbWUsIG9iaikge1xuICAgICAgICByZXR1cm4gcHJlZChvYmpbbmFtZV0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQWN0cyBhcyBtdWx0aXBsZSBgcHJvcGA6IGFycmF5IG9mIGtleXMgaW4sIGFycmF5IG9mIHZhbHVlcyBvdXQuIFByZXNlcnZlcyBvcmRlci5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBba10gLT4ge2s6IHZ9IC0+IFt2XVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBmZXRjaFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBxdWVyeVxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgY29ycmVzcG9uZGluZyB2YWx1ZXMgb3IgcGFydGlhbGx5IGFwcGxpZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5wcm9wcyhbJ3gnLCAneSddLCB7eDogMSwgeTogMn0pOyAvLz0+IFsxLCAyXVxuICAgICAqICAgICAgUi5wcm9wcyhbJ2MnLCAnYScsICdiJ10sIHtiOiAyLCBhOiAxfSk7IC8vPT4gW3VuZGVmaW5lZCwgMSwgMl1cbiAgICAgKlxuICAgICAqICAgICAgdmFyIGZ1bGxOYW1lID0gUi5jb21wb3NlKFIuam9pbignICcpLCBSLnByb3BzKFsnZmlyc3QnLCAnbGFzdCddKSk7XG4gICAgICogICAgICBmdWxsTmFtZSh7bGFzdDogJ0J1bGxldC1Ub290aCcsIGFnZTogMzMsIGZpcnN0OiAnVG9ueSd9KTsgLy89PiAnVG9ueSBCdWxsZXQtVG9vdGgnXG4gICAgICovXG4gICAgdmFyIHByb3BzID0gX2N1cnJ5MihmdW5jdGlvbiBwcm9wcyhwcywgb2JqKSB7XG4gICAgICAgIHZhciBsZW4gPSBwcy5sZW5ndGg7XG4gICAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIG91dFtpZHhdID0gb2JqW3BzW2lkeF1dO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIG51bWJlcnMgZnJvbSBgZnJvbWAgKGluY2x1c2l2ZSkgdG8gYHRvYFxuICAgICAqIChleGNsdXNpdmUpLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyIC0+IFtOdW1iZXJdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGZyb20gVGhlIGZpcnN0IG51bWJlciBpbiB0aGUgbGlzdC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdG8gT25lIG1vcmUgdGhhbiB0aGUgbGFzdCBudW1iZXIgaW4gdGhlIGxpc3QuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG9mIG51bWJlcnMgaW4gdHRoZSBzZXQgYFthLCBiKWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5yYW5nZSgxLCA1KTsgICAgLy89PiBbMSwgMiwgMywgNF1cbiAgICAgKiAgICAgIFIucmFuZ2UoNTAsIDUzKTsgIC8vPT4gWzUwLCA1MSwgNTJdXG4gICAgICovXG4gICAgdmFyIHJhbmdlID0gX2N1cnJ5MihmdW5jdGlvbiByYW5nZShmcm9tLCB0bykge1xuICAgICAgICBpZiAoIShfaXNOdW1iZXIoZnJvbSkgJiYgX2lzTnVtYmVyKHRvKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvdGggYXJndW1lbnRzIHRvIHJhbmdlIG11c3QgYmUgbnVtYmVycycpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgdmFyIG4gPSBmcm9tO1xuICAgICAgICB3aGlsZSAobiA8IHRvKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChuKTtcbiAgICAgICAgICAgIG4gKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHNpbmdsZSBpdGVtIGJ5IGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBsaXN0LCBzdWNjZXNzaXZlbHkgY2FsbGluZyB0aGUgaXRlcmF0b3JcbiAgICAgKiBmdW5jdGlvbiBhbmQgcGFzc2luZyBpdCBhbiBhY2N1bXVsYXRvciB2YWx1ZSBhbmQgdGhlIGN1cnJlbnQgdmFsdWUgZnJvbSB0aGUgYXJyYXksIGFuZFxuICAgICAqIHRoZW4gcGFzc2luZyB0aGUgcmVzdWx0IHRvIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBTaW1pbGFyIHRvIGByZWR1Y2VgLCBleGNlcHQgbW92ZXMgdGhyb3VnaCB0aGUgaW5wdXQgbGlzdCBmcm9tIHRoZSByaWdodCB0byB0aGUgbGVmdC5cbiAgICAgKlxuICAgICAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiByZWNlaXZlcyB0d28gdmFsdWVzOiAqKGFjYywgdmFsdWUpKlxuICAgICAqXG4gICAgICogTm90ZTogYFIucmVkdWNlUmlnaHRgIGRvZXMgbm90IHNraXAgZGVsZXRlZCBvciB1bmFzc2lnbmVkIGluZGljZXMgKHNwYXJzZSBhcnJheXMpLCB1bmxpa2VcbiAgICAgKiB0aGUgbmF0aXZlIGBBcnJheS5wcm90b3R5cGUucmVkdWNlYCBtZXRob2QuIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcyBiZWhhdmlvciwgc2VlOlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3JlZHVjZVJpZ2h0I0Rlc2NyaXB0aW9uXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhLGIgLT4gYSkgLT4gYSAtPiBbYl0gLT4gYVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBpdGVyYXRvciBmdW5jdGlvbi4gUmVjZWl2ZXMgdHdvIHZhbHVlcywgdGhlIGFjY3VtdWxhdG9yIGFuZCB0aGVcbiAgICAgKiAgICAgICAgY3VycmVudCBlbGVtZW50IGZyb20gdGhlIGFycmF5LlxuICAgICAqIEBwYXJhbSB7Kn0gYWNjIFRoZSBhY2N1bXVsYXRvciB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgZmluYWwsIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBwYWlycyA9IFsgWydhJywgMV0sIFsnYicsIDJdLCBbJ2MnLCAzXSBdO1xuICAgICAqICAgICAgdmFyIGZsYXR0ZW5QYWlycyA9IGZ1bmN0aW9uKGFjYywgcGFpcikge1xuICAgICAqICAgICAgICByZXR1cm4gYWNjLmNvbmNhdChwYWlyKTtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIFIucmVkdWNlUmlnaHQoZmxhdHRlblBhaXJzLCBbXSwgcGFpcnMpOyAvLz0+IFsgJ2MnLCAzLCAnYicsIDIsICdhJywgMSBdXG4gICAgICovXG4gICAgdmFyIHJlZHVjZVJpZ2h0ID0gX2N1cnJ5MyhmdW5jdGlvbiByZWR1Y2VSaWdodChmbiwgYWNjLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSBsaXN0Lmxlbmd0aCAtIDE7XG4gICAgICAgIHdoaWxlIChpZHggPj0gMCkge1xuICAgICAgICAgICAgYWNjID0gZm4oYWNjLCBsaXN0W2lkeF0pO1xuICAgICAgICAgICAgaWR4IC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB2YWx1ZSB3cmFwcGVkIHRvIGluZGljYXRlIHRoYXQgaXQgaXMgdGhlIGZpbmFsIHZhbHVlIG9mIHRoZVxuICAgICAqIHJlZHVjZSBhbmQgdHJhbnNkdWNlIGZ1bmN0aW9ucy4gIFRoZSByZXR1cm5lZCB2YWx1ZVxuICAgICAqIHNob3VsZCBiZSBjb25zaWRlcmVkIGEgYmxhY2sgYm94OiB0aGUgaW50ZXJuYWwgc3RydWN0dXJlIGlzIG5vdFxuICAgICAqIGd1YXJhbnRlZWQgdG8gYmUgc3RhYmxlLlxuICAgICAqXG4gICAgICogTm90ZTogdGhpcyBvcHRpbWl6YXRpb24gaXMgdW5hdmFpbGFibGUgdG8gZnVuY3Rpb25zIG5vdCBleHBsaWNpdGx5IGxpc3RlZFxuICAgICAqIGFib3ZlLiAgRm9yIGluc3RhbmNlLCBpdCBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBieSByZWR1Y2VJbmRleGVkLFxuICAgICAqIHJlZHVjZVJpZ2h0LCBvciByZWR1Y2VSaWdodEluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2VlIFIucmVkdWNlLCBSLnRyYW5zZHVjZVxuICAgICAqIEBzaWcgYSAtPiAqXG4gICAgICogQHBhcmFtIHsqfSB4IFRoZSBmaW5hbCB2YWx1ZSBvZiB0aGUgcmVkdWNlLlxuICAgICAqIEByZXR1cm4geyp9IFRoZSB3cmFwcGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucmVkdWNlKFxuICAgICAqICAgICAgICBSLnBpcGUoUi5hZGQsIFIuaWZFbHNlKFIubHRlKDEwKSwgUi5yZWR1Y2VkLCBSLmlkZW50aXR5KSksXG4gICAgICogICAgICAgIDAsXG4gICAgICogICAgICAgIFsxLCAyLCAzLCA0LCA1XSkgLy8gMTBcbiAgICAgKi9cbiAgICB2YXIgcmVkdWNlZCA9IF9jdXJyeTEoX3JlZHVjZWQpO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgc3ViLWxpc3Qgb2YgYGxpc3RgIHN0YXJ0aW5nIGF0IGluZGV4IGBzdGFydGAgYW5kIGNvbnRhaW5pbmdcbiAgICAgKiBgY291bnRgIGVsZW1lbnRzLiAgX05vdGUgdGhhdCB0aGlzIGlzIG5vdCBkZXN0cnVjdGl2ZV86IGl0IHJldHVybnMgYVxuICAgICAqIGNvcHkgb2YgdGhlIGxpc3Qgd2l0aCB0aGUgY2hhbmdlcy5cbiAgICAgKiA8c21hbGw+Tm8gbGlzdHMgaGF2ZSBiZWVuIGhhcm1lZCBpbiB0aGUgYXBwbGljYXRpb24gb2YgdGhpcyBmdW5jdGlvbi48L3NtYWxsPlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnQgVGhlIHBvc2l0aW9uIHRvIHN0YXJ0IHJlbW92aW5nIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gcmVtb3ZlXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgbGlzdCB0byByZW1vdmUgZnJvbVxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBBcnJheSB3aXRoIGBjb3VudGAgZWxlbWVudHMgZnJvbSBgc3RhcnRgIHJlbW92ZWQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5yZW1vdmUoMiwgMywgWzEsMiwzLDQsNSw2LDcsOF0pOyAvLz0+IFsxLDIsNiw3LDhdXG4gICAgICovXG4gICAgdmFyIHJlbW92ZSA9IF9jdXJyeTMoZnVuY3Rpb24gcmVtb3ZlKHN0YXJ0LCBjb3VudCwgbGlzdCkge1xuICAgICAgICByZXR1cm4gX2NvbmNhdChfc2xpY2UobGlzdCwgMCwgTWF0aC5taW4oc3RhcnQsIGxpc3QubGVuZ3RoKSksIF9zbGljZShsaXN0LCBNYXRoLm1pbihsaXN0Lmxlbmd0aCwgc3RhcnQgKyBjb3VudCkpKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2UgYSBzdWJzdHJpbmcgb3IgcmVnZXggbWF0Y2ggaW4gYSBzdHJpbmcgd2l0aCBhIHJlcGxhY2VtZW50LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBTdHJpbmdcbiAgICAgKiBAc2lnIFJlZ0V4cHxTdHJpbmcgLT4gU3RyaW5nIC0+IFN0cmluZyAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0ge1JlZ0V4cHxTdHJpbmd9IHBhdHRlcm4gQSByZWd1bGFyIGV4cHJlc3Npb24gb3IgYSBzdWJzdHJpbmcgdG8gbWF0Y2guXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcGxhY2VtZW50IFRoZSBzdHJpbmcgdG8gcmVwbGFjZSB0aGUgbWF0Y2hlcyB3aXRoLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byBkbyB0aGUgc2VhcmNoIGFuZCByZXBsYWNlbWVudCBpbi5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSByZXN1bHQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5yZXBsYWNlKCdmb28nLCAnYmFyJywgJ2ZvbyBmb28gZm9vJyk7IC8vPT4gJ2JhciBmb28gZm9vJ1xuICAgICAqICAgICAgUi5yZXBsYWNlKC9mb28vLCAnYmFyJywgJ2ZvbyBmb28gZm9vJyk7IC8vPT4gJ2JhciBmb28gZm9vJ1xuICAgICAqXG4gICAgICogICAgICAvLyBVc2UgdGhlIFwiZ1wiIChnbG9iYWwpIGZsYWcgdG8gcmVwbGFjZSBhbGwgb2NjdXJyZW5jZXM6XG4gICAgICogICAgICBSLnJlcGxhY2UoL2Zvby9nLCAnYmFyJywgJ2ZvbyBmb28gZm9vJyk7IC8vPT4gJ2JhciBiYXIgYmFyJ1xuICAgICAqL1xuICAgIHZhciByZXBsYWNlID0gX2N1cnJ5MyhmdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCByZXBsYWNlbWVudCwgc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleCwgcmVwbGFjZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IHdpdGggdGhlIHNhbWUgZWxlbWVudHMgYXMgdGhlIG9yaWdpbmFsIGxpc3QsIGp1c3RcbiAgICAgKiBpbiB0aGUgcmV2ZXJzZSBvcmRlci5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gcmV2ZXJzZS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBjb3B5IG9mIHRoZSBsaXN0IGluIHJldmVyc2Ugb3JkZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5yZXZlcnNlKFsxLCAyLCAzXSk7ICAvLz0+IFszLCAyLCAxXVxuICAgICAqICAgICAgUi5yZXZlcnNlKFsxLCAyXSk7ICAgICAvLz0+IFsyLCAxXVxuICAgICAqICAgICAgUi5yZXZlcnNlKFsxXSk7ICAgICAgICAvLz0+IFsxXVxuICAgICAqICAgICAgUi5yZXZlcnNlKFtdKTsgICAgICAgICAvLz0+IFtdXG4gICAgICovXG4gICAgdmFyIHJldmVyc2UgPSBfY3VycnkxKGZ1bmN0aW9uIHJldmVyc2UobGlzdCkge1xuICAgICAgICByZXR1cm4gX3NsaWNlKGxpc3QpLnJldmVyc2UoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFNjYW4gaXMgc2ltaWxhciB0byByZWR1Y2UsIGJ1dCByZXR1cm5zIGEgbGlzdCBvZiBzdWNjZXNzaXZlbHkgcmVkdWNlZCB2YWx1ZXMgZnJvbSB0aGUgbGVmdFxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSxiIC0+IGEpIC0+IGEgLT4gW2JdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBpdGVyYXRvciBmdW5jdGlvbi4gUmVjZWl2ZXMgdHdvIHZhbHVlcywgdGhlIGFjY3VtdWxhdG9yIGFuZCB0aGVcbiAgICAgKiAgICAgICAgY3VycmVudCBlbGVtZW50IGZyb20gdGhlIGFycmF5XG4gICAgICogQHBhcmFtIHsqfSBhY2MgVGhlIGFjY3VtdWxhdG9yIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIGxpc3Qgb2YgYWxsIGludGVybWVkaWF0ZWx5IHJlZHVjZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBudW1iZXJzID0gWzEsIDIsIDMsIDRdO1xuICAgICAqICAgICAgdmFyIGZhY3RvcmlhbHMgPSBSLnNjYW4oUi5tdWx0aXBseSwgMSwgbnVtYmVycyk7IC8vPT4gWzEsIDEsIDIsIDYsIDI0XVxuICAgICAqL1xuICAgIHZhciBzY2FuID0gX2N1cnJ5MyhmdW5jdGlvbiBzY2FuKGZuLCBhY2MsIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IDAsIGxlbiA9IGxpc3QubGVuZ3RoLCByZXN1bHQgPSBbYWNjXTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgYWNjID0gZm4oYWNjLCBsaXN0W2lkeF0pO1xuICAgICAgICAgICAgcmVzdWx0W2lkeCArIDFdID0gYWNjO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHJlc3VsdCBvZiBcInNldHRpbmdcIiB0aGUgcG9ydGlvbiBvZiB0aGUgZ2l2ZW4gZGF0YSBzdHJ1Y3R1cmVcbiAgICAgKiBmb2N1c2VkIGJ5IHRoZSBnaXZlbiBsZW5zIHRvIHRoZSBnaXZlbiB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHR5cGVkZWYgTGVucyBzIGEgPSBGdW5jdG9yIGYgPT4gKGEgLT4gZiBhKSAtPiBzIC0+IGYgc1xuICAgICAqIEBzaWcgTGVucyBzIGEgLT4gYSAtPiBzIC0+IHNcbiAgICAgKiBAcGFyYW0ge0xlbnN9IGxlbnNcbiAgICAgKiBAcGFyYW0geyp9IHZcbiAgICAgKiBAcGFyYW0geyp9IHhcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5wcm9wLCBSLmxlbnNJbmRleCwgUi5sZW5zUHJvcFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB4TGVucyA9IFIubGVuc1Byb3AoJ3gnKTtcbiAgICAgKlxuICAgICAqICAgICAgUi5zZXQoeExlbnMsIDQsIHt4OiAxLCB5OiAyfSk7ICAvLz0+IHt4OiA0LCB5OiAyfVxuICAgICAqICAgICAgUi5zZXQoeExlbnMsIDgsIHt4OiAxLCB5OiAyfSk7ICAvLz0+IHt4OiA4LCB5OiAyfVxuICAgICAqL1xuICAgIHZhciBzZXQgPSBfY3VycnkzKGZ1bmN0aW9uIHNldChsZW5zLCB2LCB4KSB7XG4gICAgICAgIHJldHVybiBvdmVyKGxlbnMsIGFsd2F5cyh2KSwgeCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgbGlzdCwgc29ydGVkIGFjY29yZGluZyB0byB0aGUgY29tcGFyYXRvciBmdW5jdGlvbiwgd2hpY2ggc2hvdWxkIGFjY2VwdCB0d28gdmFsdWVzIGF0IGFcbiAgICAgKiB0aW1lIGFuZCByZXR1cm4gYSBuZWdhdGl2ZSBudW1iZXIgaWYgdGhlIGZpcnN0IHZhbHVlIGlzIHNtYWxsZXIsIGEgcG9zaXRpdmUgbnVtYmVyIGlmIGl0J3MgbGFyZ2VyLCBhbmQgemVyb1xuICAgICAqIGlmIHRoZXkgYXJlIGVxdWFsLiAgUGxlYXNlIG5vdGUgdGhhdCB0aGlzIGlzIGEgKipjb3B5Kiogb2YgdGhlIGxpc3QuICBJdCBkb2VzIG5vdCBtb2RpZnkgdGhlIG9yaWdpbmFsLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSxhIC0+IE51bWJlcikgLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbXBhcmF0b3IgQSBzb3J0aW5nIGZ1bmN0aW9uIDo6IGEgLT4gYiAtPiBJbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIHNvcnRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYSBuZXcgYXJyYXkgd2l0aCBpdHMgZWxlbWVudHMgc29ydGVkIGJ5IHRoZSBjb21wYXJhdG9yIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBkaWZmID0gZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGI7IH07XG4gICAgICogICAgICBSLnNvcnQoZGlmZiwgWzQsMiw3LDVdKTsgLy89PiBbMiwgNCwgNSwgN11cbiAgICAgKi9cbiAgICB2YXIgc29ydCA9IF9jdXJyeTIoZnVuY3Rpb24gc29ydChjb21wYXJhdG9yLCBsaXN0KSB7XG4gICAgICAgIHJldHVybiBfc2xpY2UobGlzdCkuc29ydChjb21wYXJhdG9yKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFNvcnRzIHRoZSBsaXN0IGFjY29yZGluZyB0byB0aGUgc3VwcGxpZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBPcmQgYiA9PiAoYSAtPiBiKSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIHNvcnQuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IGxpc3Qgc29ydGVkIGJ5IHRoZSBrZXlzIGdlbmVyYXRlZCBieSBgZm5gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzb3J0QnlGaXJzdEl0ZW0gPSBSLnNvcnRCeShwcm9wKDApKTtcbiAgICAgKiAgICAgIHZhciBzb3J0QnlOYW1lQ2FzZUluc2Vuc2l0aXZlID0gUi5zb3J0QnkoUi5jb21wb3NlKFIudG9Mb3dlciwgUi5wcm9wKCduYW1lJykpKTtcbiAgICAgKiAgICAgIHZhciBwYWlycyA9IFtbLTEsIDFdLCBbLTIsIDJdLCBbLTMsIDNdXTtcbiAgICAgKiAgICAgIHNvcnRCeUZpcnN0SXRlbShwYWlycyk7IC8vPT4gW1stMywgM10sIFstMiwgMl0sIFstMSwgMV1dXG4gICAgICogICAgICB2YXIgYWxpY2UgPSB7XG4gICAgICogICAgICAgIG5hbWU6ICdBTElDRScsXG4gICAgICogICAgICAgIGFnZTogMTAxXG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgdmFyIGJvYiA9IHtcbiAgICAgKiAgICAgICAgbmFtZTogJ0JvYicsXG4gICAgICogICAgICAgIGFnZTogLTEwXG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgdmFyIGNsYXJhID0ge1xuICAgICAqICAgICAgICBuYW1lOiAnY2xhcmEnLFxuICAgICAqICAgICAgICBhZ2U6IDMxNC4xNTlcbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICB2YXIgcGVvcGxlID0gW2NsYXJhLCBib2IsIGFsaWNlXTtcbiAgICAgKiAgICAgIHNvcnRCeU5hbWVDYXNlSW5zZW5zaXRpdmUocGVvcGxlKTsgLy89PiBbYWxpY2UsIGJvYiwgY2xhcmFdXG4gICAgICovXG4gICAgdmFyIHNvcnRCeSA9IF9jdXJyeTIoZnVuY3Rpb24gc29ydEJ5KGZuLCBsaXN0KSB7XG4gICAgICAgIHJldHVybiBfc2xpY2UobGlzdCkuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIGFhID0gZm4oYSk7XG4gICAgICAgICAgICB2YXIgYmIgPSBmbihiKTtcbiAgICAgICAgICAgIHJldHVybiBhYSA8IGJiID8gLTEgOiBhYSA+IGJiID8gMSA6IDA7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3RzIHR3byBudW1iZXJzLiBFcXVpdmFsZW50IHRvIGBhIC0gYmAgYnV0IGN1cnJpZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE1hdGhcbiAgICAgKiBAc2lnIE51bWJlciAtPiBOdW1iZXIgLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgdmFsdWUuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcmVzdWx0IG9mIGBhIC0gYmAuXG4gICAgICogQHNlZSBSLmFkZFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuc3VidHJhY3QoMTAsIDgpOyAvLz0+IDJcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG1pbnVzNSA9IFIuc3VidHJhY3QoUi5fXywgNSk7XG4gICAgICogICAgICBtaW51czUoMTcpOyAvLz0+IDEyXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBjb21wbGVtZW50YXJ5QW5nbGUgPSBSLnN1YnRyYWN0KDkwKTtcbiAgICAgKiAgICAgIGNvbXBsZW1lbnRhcnlBbmdsZSgzMCk7IC8vPT4gNjBcbiAgICAgKiAgICAgIGNvbXBsZW1lbnRhcnlBbmdsZSg3Mik7IC8vPT4gMThcbiAgICAgKi9cbiAgICB2YXIgc3VidHJhY3QgPSBfY3VycnkyKGZ1bmN0aW9uIHN1YnRyYWN0KGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIGxhc3QgYG5gIGVsZW1lbnRzIG9mIGEgZ2l2ZW4gbGlzdCwgcGFzc2luZyBlYWNoIHZhbHVlXG4gICAgICogdG8gdGhlIHN1cHBsaWVkIHByZWRpY2F0ZSBmdW5jdGlvbiwgYW5kIHRlcm1pbmF0aW5nIHdoZW4gdGhlIHByZWRpY2F0ZSBmdW5jdGlvbiByZXR1cm5zXG4gICAgICogYGZhbHNlYC4gRXhjbHVkZXMgdGhlIGVsZW1lbnQgdGhhdCBjYXVzZWQgdGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBmYWlsLiBUaGUgcHJlZGljYXRlXG4gICAgICogZnVuY3Rpb24gaXMgcGFzc2VkIG9uZSBhcmd1bWVudDogKih2YWx1ZSkqLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBCb29sZWFuKSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBhcnJheS5cbiAgICAgKiBAc2VlIFIuZHJvcExhc3RXaGlsZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBpc05vdE9uZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuICEoeCA9PT0gMSk7XG4gICAgICogICAgICB9O1xuICAgICAqXG4gICAgICogICAgICBSLnRha2VMYXN0V2hpbGUoaXNOb3RPbmUsIFsxLCAyLCAzLCA0XSk7IC8vPT4gWzIsIDMsIDRdXG4gICAgICovXG4gICAgdmFyIHRha2VMYXN0V2hpbGUgPSBfY3VycnkyKGZ1bmN0aW9uIHRha2VMYXN0V2hpbGUoZm4sIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IGxpc3QubGVuZ3RoIC0gMTtcbiAgICAgICAgd2hpbGUgKGlkeCA+PSAwICYmIGZuKGxpc3RbaWR4XSkpIHtcbiAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfc2xpY2UobGlzdCwgaWR4ICsgMSwgSW5maW5pdHkpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUnVucyB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2l0aCB0aGUgc3VwcGxpZWQgb2JqZWN0LCB0aGVuIHJldHVybnMgdGhlIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIChhIC0+ICopIC0+IGEgLT4gYVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdpdGggYHhgLiBUaGUgcmV0dXJuIHZhbHVlIG9mIGBmbmAgd2lsbCBiZSB0aHJvd24gYXdheS5cbiAgICAgKiBAcGFyYW0geyp9IHhcbiAgICAgKiBAcmV0dXJuIHsqfSBgeGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHNheVggPSBmdW5jdGlvbih4KSB7IGNvbnNvbGUubG9nKCd4IGlzICcgKyB4KTsgfTtcbiAgICAgKiAgICAgIFIudGFwKHNheVgsIDEwMCk7IC8vPT4gMTAwXG4gICAgICogICAgICAvLy0+ICd4IGlzIDEwMCdcbiAgICAgKi9cbiAgICB2YXIgdGFwID0gX2N1cnJ5MihmdW5jdGlvbiB0YXAoZm4sIHgpIHtcbiAgICAgICAgZm4oeCk7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgYSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQHNlZSBSLm1hdGNoXG4gICAgICogQGNhdGVnb3J5IFN0cmluZ1xuICAgICAqIEBzaWcgUmVnRXhwIC0+IFN0cmluZyAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtSZWdFeHB9IHBhdHRlcm5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnRlc3QoL154LywgJ3h5eicpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIudGVzdCgvXnkvLCAneHl6Jyk7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgdGVzdCA9IF9jdXJyeTIoZnVuY3Rpb24gdGVzdChwYXR0ZXJuLCBzdHIpIHtcbiAgICAgICAgcmV0dXJuIF9jbG9uZVJlZ0V4cChwYXR0ZXJuKS50ZXN0KHN0cik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyBhbiBpbnB1dCBmdW5jdGlvbiBgbmAgdGltZXMsIHJldHVybmluZyBhbiBhcnJheSBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIHRob3NlXG4gICAgICogZnVuY3Rpb24gY2FsbHMuXG4gICAgICpcbiAgICAgKiBgZm5gIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6IFRoZSBjdXJyZW50IHZhbHVlIG9mIGBuYCwgd2hpY2ggYmVnaW5zIGF0IGAwYCBhbmQgaXNcbiAgICAgKiBncmFkdWFsbHkgaW5jcmVtZW50ZWQgdG8gYG4gLSAxYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGkgLT4gYSkgLT4gaSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLiBQYXNzZWQgb25lIGFyZ3VtZW50LCB0aGUgY3VycmVudCB2YWx1ZSBvZiBgbmAuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG4gQSB2YWx1ZSBiZXR3ZWVuIGAwYCBhbmQgYG4gLSAxYC4gSW5jcmVtZW50cyBhZnRlciBlYWNoIGZ1bmN0aW9uIGNhbGwuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHJldHVybiB2YWx1ZXMgb2YgYWxsIGNhbGxzIHRvIGBmbmAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi50aW1lcyhSLmlkZW50aXR5LCA1KTsgLy89PiBbMCwgMSwgMiwgMywgNF1cbiAgICAgKi9cbiAgICB2YXIgdGltZXMgPSBfY3VycnkyKGZ1bmN0aW9uIHRpbWVzKGZuLCBuKSB7XG4gICAgICAgIHZhciBsZW4gPSBOdW1iZXIobik7XG4gICAgICAgIHZhciBsaXN0ID0gbmV3IEFycmF5KGxlbik7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgICAgICBsaXN0W2lkeF0gPSBmbihpZHgpO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBvYmplY3QgaW50byBhbiBhcnJheSBvZiBrZXksIHZhbHVlIGFycmF5cy5cbiAgICAgKiBPbmx5IHRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcyBhcmUgdXNlZC5cbiAgICAgKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmVcbiAgICAgKiBjb25zaXN0ZW50IGFjcm9zcyBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtTdHJpbmc6ICp9IC0+IFtbU3RyaW5nLCpdXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBleHRyYWN0IGZyb21cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2Yga2V5LCB2YWx1ZSBhcnJheXMgZnJvbSB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gICAgICogQHNlZSBSLmZyb21QYWlyc1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudG9QYWlycyh7YTogMSwgYjogMiwgYzogM30pOyAvLz0+IFtbJ2EnLCAxXSwgWydiJywgMl0sIFsnYycsIDNdXVxuICAgICAqL1xuICAgIHZhciB0b1BhaXJzID0gX2N1cnJ5MShmdW5jdGlvbiB0b1BhaXJzKG9iaikge1xuICAgICAgICB2YXIgcGFpcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChfaGFzKHByb3AsIG9iaikpIHtcbiAgICAgICAgICAgICAgICBwYWlyc1twYWlycy5sZW5ndGhdID0gW1xuICAgICAgICAgICAgICAgICAgICBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBvYmpbcHJvcF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYWlycztcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIG9iamVjdCBpbnRvIGFuIGFycmF5IG9mIGtleSwgdmFsdWUgYXJyYXlzLlxuICAgICAqIFRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcyBhbmQgcHJvdG90eXBlIHByb3BlcnRpZXMgYXJlIHVzZWQuXG4gICAgICogTm90ZSB0aGF0IHRoZSBvcmRlciBvZiB0aGUgb3V0cHV0IGFycmF5IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlXG4gICAgICogY29uc2lzdGVudCBhY3Jvc3MgZGlmZmVyZW50IEpTIHBsYXRmb3Jtcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7U3RyaW5nOiAqfSAtPiBbW1N0cmluZywqXV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCBmcm9tXG4gICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIGtleSwgdmFsdWUgYXJyYXlzIGZyb20gdGhlIG9iamVjdCdzIG93blxuICAgICAqICAgICAgICAgYW5kIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBGID0gZnVuY3Rpb24oKSB7IHRoaXMueCA9ICdYJzsgfTtcbiAgICAgKiAgICAgIEYucHJvdG90eXBlLnkgPSAnWSc7XG4gICAgICogICAgICB2YXIgZiA9IG5ldyBGKCk7XG4gICAgICogICAgICBSLnRvUGFpcnNJbihmKTsgLy89PiBbWyd4JywnWCddLCBbJ3knLCdZJ11dXG4gICAgICovXG4gICAgdmFyIHRvUGFpcnNJbiA9IF9jdXJyeTEoZnVuY3Rpb24gdG9QYWlyc0luKG9iaikge1xuICAgICAgICB2YXIgcGFpcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIHBhaXJzW3BhaXJzLmxlbmd0aF0gPSBbXG4gICAgICAgICAgICAgICAgcHJvcCxcbiAgICAgICAgICAgICAgICBvYmpbcHJvcF1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhaXJzO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyAoc3RyaXBzKSB3aGl0ZXNwYWNlIGZyb20gYm90aCBlbmRzIG9mIHRoZSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFN0cmluZ1xuICAgICAqIEBzaWcgU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byB0cmltLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gVHJpbW1lZCB2ZXJzaW9uIG9mIGBzdHJgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudHJpbSgnICAgeHl6ICAnKTsgLy89PiAneHl6J1xuICAgICAqICAgICAgUi5tYXAoUi50cmltLCBSLnNwbGl0KCcsJywgJ3gsIHksIHonKSk7IC8vPT4gWyd4JywgJ3knLCAneiddXG4gICAgICovXG4gICAgdmFyIHRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3cyA9ICdcXHRcXG5cXHgwQlxcZlxcciBcXHhBMFxcdTE2ODBcXHUxODBFXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwMycgKyAnXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdTIwMjgnICsgJ1xcdTIwMjlcXHVGRUZGJztcbiAgICAgICAgdmFyIHplcm9XaWR0aCA9ICdcXHUyMDBCJztcbiAgICAgICAgdmFyIGhhc1Byb3RvVHJpbSA9IHR5cGVvZiBTdHJpbmcucHJvdG90eXBlLnRyaW0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgIGlmICghaGFzUHJvdG9UcmltIHx8ICh3cy50cmltKCkgfHwgIXplcm9XaWR0aC50cmltKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiB0cmltKHN0cikge1xuICAgICAgICAgICAgICAgIHZhciBiZWdpblJ4ID0gbmV3IFJlZ0V4cCgnXlsnICsgd3MgKyAnXVsnICsgd3MgKyAnXSonKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kUnggPSBuZXcgUmVnRXhwKCdbJyArIHdzICsgJ11bJyArIHdzICsgJ10qJCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHIucmVwbGFjZShiZWdpblJ4LCAnJykucmVwbGFjZShlbmRSeCwgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbiB0cmltKHN0cikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHIudHJpbSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KCk7XG5cbiAgICAvKipcbiAgICAgKiBHaXZlcyBhIHNpbmdsZS13b3JkIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgKG5hdGl2ZSkgdHlwZSBvZiBhIHZhbHVlLCByZXR1cm5pbmcgc3VjaFxuICAgICAqIGFuc3dlcnMgYXMgJ09iamVjdCcsICdOdW1iZXInLCAnQXJyYXknLCBvciAnTnVsbCcuICBEb2VzIG5vdCBhdHRlbXB0IHRvIGRpc3Rpbmd1aXNoIHVzZXJcbiAgICAgKiBPYmplY3QgdHlwZXMgYW55IGZ1cnRoZXIsIHJlcG9ydGluZyB0aGVtIGFsbCBhcyAnT2JqZWN0Jy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgVHlwZVxuICAgICAqIEBzaWcgKCogLT4geyp9KSAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnR5cGUoe30pOyAvLz0+IFwiT2JqZWN0XCJcbiAgICAgKiAgICAgIFIudHlwZSgxKTsgLy89PiBcIk51bWJlclwiXG4gICAgICogICAgICBSLnR5cGUoZmFsc2UpOyAvLz0+IFwiQm9vbGVhblwiXG4gICAgICogICAgICBSLnR5cGUoJ3MnKTsgLy89PiBcIlN0cmluZ1wiXG4gICAgICogICAgICBSLnR5cGUobnVsbCk7IC8vPT4gXCJOdWxsXCJcbiAgICAgKiAgICAgIFIudHlwZShbXSk7IC8vPT4gXCJBcnJheVwiXG4gICAgICogICAgICBSLnR5cGUoL1tBLXpdLyk7IC8vPT4gXCJSZWdFeHBcIlxuICAgICAqL1xuICAgIHZhciB0eXBlID0gX2N1cnJ5MShmdW5jdGlvbiB0eXBlKHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsID09PSBudWxsID8gJ051bGwnIDogdmFsID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLnNsaWNlKDgsIC0xKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgZnVuY3Rpb24gYGZuYCwgd2hpY2ggdGFrZXMgYSBzaW5nbGUgYXJyYXkgYXJndW1lbnQsIGFuZCByZXR1cm5zXG4gICAgICogYSBmdW5jdGlvbiB3aGljaDpcbiAgICAgKlxuICAgICAqICAgLSB0YWtlcyBhbnkgbnVtYmVyIG9mIHBvc2l0aW9uYWwgYXJndW1lbnRzO1xuICAgICAqICAgLSBwYXNzZXMgdGhlc2UgYXJndW1lbnRzIHRvIGBmbmAgYXMgYW4gYXJyYXk7IGFuZFxuICAgICAqICAgLSByZXR1cm5zIHRoZSByZXN1bHQuXG4gICAgICpcbiAgICAgKiBJbiBvdGhlciB3b3JkcywgUi51bmFwcGx5IGRlcml2ZXMgYSB2YXJpYWRpYyBmdW5jdGlvbiBmcm9tIGEgZnVuY3Rpb25cbiAgICAgKiB3aGljaCB0YWtlcyBhbiBhcnJheS4gUi51bmFwcGx5IGlzIHRoZSBpbnZlcnNlIG9mIFIuYXBwbHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoWyouLi5dIC0+IGEpIC0+ICgqLi4uIC0+IGEpXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAc2VlIFIuYXBwbHlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnVuYXBwbHkoSlNPTi5zdHJpbmdpZnkpKDEsIDIsIDMpOyAvLz0+ICdbMSwyLDNdJ1xuICAgICAqL1xuICAgIHZhciB1bmFwcGx5ID0gX2N1cnJ5MShmdW5jdGlvbiB1bmFwcGx5KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oX3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYSBmdW5jdGlvbiBvZiBhbnkgYXJpdHkgKGluY2x1ZGluZyBudWxsYXJ5KSBpbiBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBleGFjdGx5IDFcbiAgICAgKiBwYXJhbWV0ZXIuIEFueSBleHRyYW5lb3VzIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgcGFzc2VkIHRvIHRoZSBzdXBwbGllZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICgqIC0+IGIpIC0+IChhIC0+IGIpXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIGBmbmAuIFRoZSBuZXcgZnVuY3Rpb24gaXMgZ3VhcmFudGVlZCB0byBiZSBvZlxuICAgICAqICAgICAgICAgYXJpdHkgMS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgdGFrZXNUd29BcmdzID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgICAgICByZXR1cm4gW2EsIGJdO1xuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIHRha2VzVHdvQXJncy5sZW5ndGg7IC8vPT4gMlxuICAgICAqICAgICAgdGFrZXNUd29BcmdzKDEsIDIpOyAvLz0+IFsxLCAyXVxuICAgICAqXG4gICAgICogICAgICB2YXIgdGFrZXNPbmVBcmcgPSBSLnVuYXJ5KHRha2VzVHdvQXJncyk7XG4gICAgICogICAgICB0YWtlc09uZUFyZy5sZW5ndGg7IC8vPT4gMVxuICAgICAqICAgICAgLy8gT25seSAxIGFyZ3VtZW50IGlzIHBhc3NlZCB0byB0aGUgd3JhcHBlZCBmdW5jdGlvblxuICAgICAqICAgICAgdGFrZXNPbmVBcmcoMSwgMik7IC8vPT4gWzEsIHVuZGVmaW5lZF1cbiAgICAgKi9cbiAgICB2YXIgdW5hcnkgPSBfY3VycnkxKGZ1bmN0aW9uIHVuYXJ5KGZuKSB7XG4gICAgICAgIHJldHVybiBuQXJ5KDEsIGZuKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiBvZiBhcml0eSBgbmAgZnJvbSBhIChtYW51YWxseSkgY3VycmllZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIE51bWJlciAtPiAoYSAtPiBiKSAtPiAoYSAtPiBjKVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIGFyaXR5IGZvciB0aGUgcmV0dXJuZWQgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHVuY3VycnkuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBzZWUgUi5jdXJyeVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBhZGRGb3VyID0gZnVuY3Rpb24oYSkge1xuICAgICAqICAgICAgICByZXR1cm4gZnVuY3Rpb24oYikge1xuICAgICAqICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgICogICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAqICAgICAgICAgICAgICByZXR1cm4gYSArIGIgKyBjICsgZDtcbiAgICAgKiAgICAgICAgICAgIH07XG4gICAgICogICAgICAgICAgfTtcbiAgICAgKiAgICAgICAgfTtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIHZhciB1bmN1cnJpZWRBZGRGb3VyID0gUi51bmN1cnJ5Tig0LCBhZGRGb3VyKTtcbiAgICAgKiAgICAgIGN1cnJpZWRBZGRGb3VyKDEsIDIsIDMsIDQpOyAvLz0+IDEwXG4gICAgICovXG4gICAgdmFyIHVuY3VycnlOID0gX2N1cnJ5MihmdW5jdGlvbiB1bmN1cnJ5TihkZXB0aCwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGN1cnJ5TihkZXB0aCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnREZXB0aCA9IDE7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBmbjtcbiAgICAgICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICAgICAgdmFyIGVuZElkeDtcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50RGVwdGggPD0gZGVwdGggJiYgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgZW5kSWR4ID0gY3VycmVudERlcHRoID09PSBkZXB0aCA/IGFyZ3VtZW50cy5sZW5ndGggOiBpZHggKyB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5hcHBseSh0aGlzLCBfc2xpY2UoYXJndW1lbnRzLCBpZHgsIGVuZElkeCkpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnREZXB0aCArPSAxO1xuICAgICAgICAgICAgICAgIGlkeCA9IGVuZElkeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgYSBsaXN0IGZyb20gYSBzZWVkIHZhbHVlLiBBY2NlcHRzIGFuIGl0ZXJhdG9yIGZ1bmN0aW9uLCB3aGljaCByZXR1cm5zIGVpdGhlciBmYWxzZVxuICAgICAqIHRvIHN0b3AgaXRlcmF0aW9uIG9yIGFuIGFycmF5IG9mIGxlbmd0aCAyIGNvbnRhaW5pbmcgdGhlIHZhbHVlIHRvIGFkZCB0byB0aGUgcmVzdWx0aW5nXG4gICAgICogbGlzdCBhbmQgdGhlIHNlZWQgdG8gYmUgdXNlZCBpbiB0aGUgbmV4dCBjYWxsIHRvIHRoZSBpdGVyYXRvciBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiByZWNlaXZlcyBvbmUgYXJndW1lbnQ6ICooc2VlZCkqLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBbYl0pIC0+ICogLT4gW2JdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGl0ZXJhdG9yIGZ1bmN0aW9uLiByZWNlaXZlcyBvbmUgYXJndW1lbnQsIGBzZWVkYCwgYW5kIHJldHVybnNcbiAgICAgKiAgICAgICAgZWl0aGVyIGZhbHNlIHRvIHF1aXQgaXRlcmF0aW9uIG9yIGFuIGFycmF5IG9mIGxlbmd0aCB0d28gdG8gcHJvY2VlZC4gVGhlIGVsZW1lbnRcbiAgICAgKiAgICAgICAgYXQgaW5kZXggMCBvZiB0aGlzIGFycmF5IHdpbGwgYmUgYWRkZWQgdG8gdGhlIHJlc3VsdGluZyBhcnJheSwgYW5kIHRoZSBlbGVtZW50XG4gICAgICogICAgICAgIGF0IGluZGV4IDEgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIG5leHQgY2FsbCB0byBgZm5gLlxuICAgICAqIEBwYXJhbSB7Kn0gc2VlZCBUaGUgc2VlZCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGZpbmFsIGxpc3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGYgPSBmdW5jdGlvbihuKSB7IHJldHVybiBuID4gNTAgPyBmYWxzZSA6IFstbiwgbiArIDEwXSB9O1xuICAgICAqICAgICAgUi51bmZvbGQoZiwgMTApOyAvLz0+IFstMTAsIC0yMCwgLTMwLCAtNDAsIC01MF1cbiAgICAgKi9cbiAgICB2YXIgdW5mb2xkID0gX2N1cnJ5MihmdW5jdGlvbiB1bmZvbGQoZm4sIHNlZWQpIHtcbiAgICAgICAgdmFyIHBhaXIgPSBmbihzZWVkKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB3aGlsZSAocGFpciAmJiBwYWlyLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gcGFpclswXTtcbiAgICAgICAgICAgIHBhaXIgPSBmbihwYWlyWzFdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgb25seSBvbmUgY29weSBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIG9yaWdpbmFsIGxpc3QsIGJhc2VkXG4gICAgICogdXBvbiB0aGUgdmFsdWUgcmV0dXJuZWQgYnkgYXBwbHlpbmcgdGhlIHN1cHBsaWVkIHByZWRpY2F0ZSB0byB0d28gbGlzdCBlbGVtZW50cy4gUHJlZmVyc1xuICAgICAqIHRoZSBmaXJzdCBpdGVtIGlmIHR3byBpdGVtcyBjb21wYXJlIGVxdWFsIGJhc2VkIG9uIHRoZSBwcmVkaWNhdGUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhLCBhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIHVzZWQgdG8gdGVzdCB3aGV0aGVyIHR3byBpdGVtcyBhcmUgZXF1YWwuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gY29uc2lkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG9mIHVuaXF1ZSBpdGVtcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgc3RyRXEgPSBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBTdHJpbmcoYSkgPT09IFN0cmluZyhiKTsgfTtcbiAgICAgKiAgICAgIFIudW5pcVdpdGgoc3RyRXEpKFsxLCAnMScsIDIsIDFdKTsgLy89PiBbMSwgMl1cbiAgICAgKiAgICAgIFIudW5pcVdpdGgoc3RyRXEpKFt7fSwge31dKTsgICAgICAgLy89PiBbe31dXG4gICAgICogICAgICBSLnVuaXFXaXRoKHN0ckVxKShbMSwgJzEnLCAxXSk7ICAgIC8vPT4gWzFdXG4gICAgICogICAgICBSLnVuaXFXaXRoKHN0ckVxKShbJzEnLCAxLCAxXSk7ICAgIC8vPT4gWycxJ11cbiAgICAgKi9cbiAgICB2YXIgdW5pcVdpdGggPSBfY3VycnkyKGZ1bmN0aW9uIHVuaXFXaXRoKHByZWQsIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IDAsIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sIGl0ZW07XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIGl0ZW0gPSBsaXN0W2lkeF07XG4gICAgICAgICAgICBpZiAoIV9jb250YWluc1dpdGgocHJlZCwgaXRlbSwgcmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBjb3B5IG9mIHRoZSBhcnJheSB3aXRoIHRoZSBlbGVtZW50IGF0IHRoZVxuICAgICAqIHByb3ZpZGVkIGluZGV4IHJlcGxhY2VkIHdpdGggdGhlIGdpdmVuIHZhbHVlLlxuICAgICAqIEBzZWUgUi5hZGp1c3RcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgTnVtYmVyIC0+IGEgLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggVGhlIGluZGV4IHRvIHVwZGF0ZS5cbiAgICAgKiBAcGFyYW0geyp9IHggVGhlIHZhbHVlIHRvIGV4aXN0IGF0IHRoZSBnaXZlbiBpbmRleCBvZiB0aGUgcmV0dXJuZWQgYXJyYXkuXG4gICAgICogQHBhcmFtIHtBcnJheXxBcmd1bWVudHN9IGxpc3QgVGhlIHNvdXJjZSBhcnJheS1saWtlIG9iamVjdCB0byBiZSB1cGRhdGVkLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIGNvcHkgb2YgYGxpc3RgIHdpdGggdGhlIHZhbHVlIGF0IGluZGV4IGBpZHhgIHJlcGxhY2VkIHdpdGggYHhgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudXBkYXRlKDEsIDExLCBbMCwgMSwgMl0pOyAgICAgLy89PiBbMCwgMTEsIDJdXG4gICAgICogICAgICBSLnVwZGF0ZSgxKSgxMSkoWzAsIDEsIDJdKTsgICAgIC8vPT4gWzAsIDExLCAyXVxuICAgICAqL1xuICAgIHZhciB1cGRhdGUgPSBfY3VycnkzKGZ1bmN0aW9uIHVwZGF0ZShpZHgsIHgsIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIGFkanVzdChhbHdheXMoeCksIGlkeCwgbGlzdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgb2YgdGhlIHN1cHBsaWVkIG9iamVjdC5cbiAgICAgKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzXG4gICAgICogZGlmZmVyZW50IEpTIHBsYXRmb3Jtcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7azogdn0gLT4gW3ZdXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGV4dHJhY3QgdmFsdWVzIGZyb21cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgdGhlIHZhbHVlcyBvZiB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi52YWx1ZXMoe2E6IDEsIGI6IDIsIGM6IDN9KTsgLy89PiBbMSwgMiwgM11cbiAgICAgKi9cbiAgICB2YXIgdmFsdWVzID0gX2N1cnJ5MShmdW5jdGlvbiB2YWx1ZXMob2JqKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IGtleXMob2JqKTtcbiAgICAgICAgdmFyIGxlbiA9IHByb3BzLmxlbmd0aDtcbiAgICAgICAgdmFyIHZhbHMgPSBbXTtcbiAgICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhbHNbaWR4XSA9IG9ialtwcm9wc1tpZHhdXTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxzO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzLCBpbmNsdWRpbmcgcHJvdG90eXBlIHByb3BlcnRpZXMsXG4gICAgICogb2YgdGhlIHN1cHBsaWVkIG9iamVjdC5cbiAgICAgKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmVcbiAgICAgKiBjb25zaXN0ZW50IGFjcm9zcyBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtrOiB2fSAtPiBbdl1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCB2YWx1ZXMgZnJvbVxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiB0aGUgdmFsdWVzIG9mIHRoZSBvYmplY3QncyBvd24gYW5kIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBGID0gZnVuY3Rpb24oKSB7IHRoaXMueCA9ICdYJzsgfTtcbiAgICAgKiAgICAgIEYucHJvdG90eXBlLnkgPSAnWSc7XG4gICAgICogICAgICB2YXIgZiA9IG5ldyBGKCk7XG4gICAgICogICAgICBSLnZhbHVlc0luKGYpOyAvLz0+IFsnWCcsICdZJ11cbiAgICAgKi9cbiAgICB2YXIgdmFsdWVzSW4gPSBfY3VycnkxKGZ1bmN0aW9uIHZhbHVlc0luKG9iaikge1xuICAgICAgICB2YXIgcHJvcCwgdnMgPSBbXTtcbiAgICAgICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgdnNbdnMubGVuZ3RoXSA9IG9ialtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdnM7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgXCJ2aWV3XCIgb2YgdGhlIGdpdmVuIGRhdGEgc3RydWN0dXJlLCBkZXRlcm1pbmVkIGJ5IHRoZSBnaXZlbiBsZW5zLlxuICAgICAqIFRoZSBsZW5zJ3MgZm9jdXMgZGV0ZXJtaW5lcyB3aGljaCBwb3J0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZSBpcyB2aXNpYmxlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAdHlwZWRlZiBMZW5zIHMgYSA9IEZ1bmN0b3IgZiA9PiAoYSAtPiBmIGEpIC0+IHMgLT4gZiBzXG4gICAgICogQHNpZyBMZW5zIHMgYSAtPiBzIC0+IGFcbiAgICAgKiBAcGFyYW0ge0xlbnN9IGxlbnNcbiAgICAgKiBAcGFyYW0geyp9IHhcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBzZWUgUi5wcm9wLCBSLmxlbnNJbmRleCwgUi5sZW5zUHJvcFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB4TGVucyA9IFIubGVuc1Byb3AoJ3gnKTtcbiAgICAgKlxuICAgICAqICAgICAgUi52aWV3KHhMZW5zLCB7eDogMSwgeTogMn0pOyAgLy89PiAxXG4gICAgICogICAgICBSLnZpZXcoeExlbnMsIHt4OiA0LCB5OiAyfSk7ICAvLz0+IDRcbiAgICAgKi9cbiAgICB2YXIgdmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIENvbnN0ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHgsXG4gICAgICAgICAgICAgICAgbWFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIHZpZXcobGVucywgeCkge1xuICAgICAgICAgICAgcmV0dXJuIGxlbnMoQ29uc3QpKHgpLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBhIHNwZWMgb2JqZWN0IGFuZCBhIHRlc3Qgb2JqZWN0OyByZXR1cm5zIHRydWUgaWYgdGhlIHRlc3Qgc2F0aXNmaWVzXG4gICAgICogdGhlIHNwZWMuIEVhY2ggb2YgdGhlIHNwZWMncyBvd24gcHJvcGVydGllcyBtdXN0IGJlIGEgcHJlZGljYXRlIGZ1bmN0aW9uLlxuICAgICAqIEVhY2ggcHJlZGljYXRlIGlzIGFwcGxpZWQgdG8gdGhlIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9mXG4gICAgICogdGhlIHRlc3Qgb2JqZWN0LiBgd2hlcmVgIHJldHVybnMgdHJ1ZSBpZiBhbGwgdGhlIHByZWRpY2F0ZXMgcmV0dXJuIHRydWUsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogYHdoZXJlYCBpcyB3ZWxsIHN1aXRlZCB0byBkZWNsYXJhdGl2ZWx5IGV4cHJlc3NpbmcgY29uc3RyYWludHMgZm9yIG90aGVyXG4gICAgICogZnVuY3Rpb25zIHN1Y2ggYXMgYGZpbHRlcmAgYW5kIGBmaW5kYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7U3RyaW5nOiAoKiAtPiBCb29sZWFuKX0gLT4ge1N0cmluZzogKn0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcGVjXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHRlc3RPYmpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIC8vIHByZWQgOjogT2JqZWN0IC0+IEJvb2xlYW5cbiAgICAgKiAgICAgIHZhciBwcmVkID0gUi53aGVyZSh7XG4gICAgICogICAgICAgIGE6IFIuZXF1YWxzKCdmb28nKSxcbiAgICAgKiAgICAgICAgYjogUi5jb21wbGVtZW50KFIuZXF1YWxzKCdiYXInKSksXG4gICAgICogICAgICAgIHg6IFIuZ3QoXywgMTApLFxuICAgICAqICAgICAgICB5OiBSLmx0KF8sIDIwKVxuICAgICAqICAgICAgfSk7XG4gICAgICpcbiAgICAgKiAgICAgIHByZWQoe2E6ICdmb28nLCBiOiAneHh4JywgeDogMTEsIHk6IDE5fSk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgcHJlZCh7YTogJ3h4eCcsIGI6ICd4eHgnLCB4OiAxMSwgeTogMTl9KTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgcHJlZCh7YTogJ2ZvbycsIGI6ICdiYXInLCB4OiAxMSwgeTogMTl9KTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgcHJlZCh7YTogJ2ZvbycsIGI6ICd4eHgnLCB4OiAxMCwgeTogMTl9KTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgcHJlZCh7YTogJ2ZvbycsIGI6ICd4eHgnLCB4OiAxMSwgeTogMjB9KTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciB3aGVyZSA9IF9jdXJyeTIoZnVuY3Rpb24gd2hlcmUoc3BlYywgdGVzdE9iaikge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNwZWMpIHtcbiAgICAgICAgICAgIGlmIChfaGFzKHByb3AsIHNwZWMpICYmICFzcGVjW3Byb3BdKHRlc3RPYmpbcHJvcF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogV3JhcCBhIGZ1bmN0aW9uIGluc2lkZSBhbm90aGVyIHRvIGFsbG93IHlvdSB0byBtYWtlIGFkanVzdG1lbnRzIHRvIHRoZSBwYXJhbWV0ZXJzLCBvciBkb1xuICAgICAqIG90aGVyIHByb2Nlc3NpbmcgZWl0aGVyIGJlZm9yZSB0aGUgaW50ZXJuYWwgZnVuY3Rpb24gaXMgY2FsbGVkIG9yIHdpdGggaXRzIHJlc3VsdHMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoYS4uLiAtPiBiKSAtPiAoKGEuLi4gLT4gYikgLT4gYS4uLiAtPiBjKSAtPiAoYS4uLiAtPiBjKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHdyYXBwZXIgVGhlIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBncmVldCA9IGZ1bmN0aW9uKG5hbWUpIHtyZXR1cm4gJ0hlbGxvICcgKyBuYW1lO307XG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzaG91dGVkR3JlZXQgPSBSLndyYXAoZ3JlZXQsIGZ1bmN0aW9uKGdyLCBuYW1lKSB7XG4gICAgICogICAgICAgIHJldHVybiBncihuYW1lKS50b1VwcGVyQ2FzZSgpO1xuICAgICAqICAgICAgfSk7XG4gICAgICogICAgICBzaG91dGVkR3JlZXQoXCJLYXRoeVwiKTsgLy89PiBcIkhFTExPIEtBVEhZXCJcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHNob3J0ZW5lZEdyZWV0ID0gUi53cmFwKGdyZWV0LCBmdW5jdGlvbihnciwgbmFtZSkge1xuICAgICAqICAgICAgICByZXR1cm4gZ3IobmFtZS5zdWJzdHJpbmcoMCwgMykpO1xuICAgICAqICAgICAgfSk7XG4gICAgICogICAgICBzaG9ydGVuZWRHcmVldChcIlJvYmVydFwiKTsgLy89PiBcIkhlbGxvIFJvYlwiXG4gICAgICovXG4gICAgdmFyIHdyYXAgPSBfY3VycnkyKGZ1bmN0aW9uIHdyYXAoZm4sIHdyYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJ5Tihmbi5sZW5ndGgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVyLmFwcGx5KHRoaXMsIF9jb25jYXQoW2ZuXSwgYXJndW1lbnRzKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBsaXN0IG91dCBvZiB0aGUgdHdvIHN1cHBsaWVkIGJ5IGNyZWF0aW5nIGVhY2ggcG9zc2libGVcbiAgICAgKiBwYWlyIGZyb20gdGhlIGxpc3RzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBbYV0gLT4gW2JdIC0+IFtbYSxiXV1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcyBUaGUgZmlyc3QgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBicyBUaGUgc2Vjb25kIGxpc3QuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG1hZGUgYnkgY29tYmluaW5nIGVhY2ggcG9zc2libGUgcGFpciBmcm9tXG4gICAgICogICAgICAgICBgYXNgIGFuZCBgYnNgIGludG8gcGFpcnMgKGBbYSwgYl1gKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnhwcm9kKFsxLCAyXSwgWydhJywgJ2InXSk7IC8vPT4gW1sxLCAnYSddLCBbMSwgJ2InXSwgWzIsICdhJ10sIFsyLCAnYiddXVxuICAgICAqL1xuICAgIC8vID0geHByb2RXaXRoKHByZXBlbmQpOyAodGFrZXMgYWJvdXQgMyB0aW1lcyBhcyBsb25nLi4uKVxuICAgIHZhciB4cHJvZCA9IF9jdXJyeTIoZnVuY3Rpb24geHByb2QoYSwgYikge1xuICAgICAgICAvLyA9IHhwcm9kV2l0aChwcmVwZW5kKTsgKHRha2VzIGFib3V0IDMgdGltZXMgYXMgbG9uZy4uLilcbiAgICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICAgIHZhciBpbGVuID0gYS5sZW5ndGg7XG4gICAgICAgIHZhciBqO1xuICAgICAgICB2YXIgamxlbiA9IGIubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHdoaWxlIChpZHggPCBpbGVuKSB7XG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChqIDwgamxlbikge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgYVtpZHhdLFxuICAgICAgICAgICAgICAgICAgICBiW2pdXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBqICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBsaXN0IG91dCBvZiB0aGUgdHdvIHN1cHBsaWVkIGJ5IHBhaXJpbmcgdXBcbiAgICAgKiBlcXVhbGx5LXBvc2l0aW9uZWQgaXRlbXMgZnJvbSBib3RoIGxpc3RzLiAgVGhlIHJldHVybmVkIGxpc3QgaXNcbiAgICAgKiB0cnVuY2F0ZWQgdG8gdGhlIGxlbmd0aCBvZiB0aGUgc2hvcnRlciBvZiB0aGUgdHdvIGlucHV0IGxpc3RzLlxuICAgICAqIE5vdGU6IGB6aXBgIGlzIGVxdWl2YWxlbnQgdG8gYHppcFdpdGgoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gW2EsIGJdIH0pYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgW2FdIC0+IFtiXSAtPiBbW2EsYl1dXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDEgVGhlIGZpcnN0IGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QyIFRoZSBzZWNvbmQgYXJyYXkgdG8gY29uc2lkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG1hZGUgYnkgcGFpcmluZyB1cCBzYW1lLWluZGV4ZWQgZWxlbWVudHMgb2YgYGxpc3QxYCBhbmQgYGxpc3QyYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnppcChbMSwgMiwgM10sIFsnYScsICdiJywgJ2MnXSk7IC8vPT4gW1sxLCAnYSddLCBbMiwgJ2InXSwgWzMsICdjJ11dXG4gICAgICovXG4gICAgdmFyIHppcCA9IF9jdXJyeTIoZnVuY3Rpb24gemlwKGEsIGIpIHtcbiAgICAgICAgdmFyIHJ2ID0gW107XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgbGVuID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgcnZbaWR4XSA9IFtcbiAgICAgICAgICAgICAgICBhW2lkeF0sXG4gICAgICAgICAgICAgICAgYltpZHhdXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJ2O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBvYmplY3Qgb3V0IG9mIGEgbGlzdCBvZiBrZXlzIGFuZCBhIGxpc3Qgb2YgdmFsdWVzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBbU3RyaW5nXSAtPiBbKl0gLT4ge1N0cmluZzogKn1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBrZXlzIFRoZSBhcnJheSB0aGF0IHdpbGwgYmUgcHJvcGVydGllcyBvbiB0aGUgb3V0cHV0IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgVGhlIGxpc3Qgb2YgdmFsdWVzIG9uIHRoZSBvdXRwdXQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG9iamVjdCBtYWRlIGJ5IHBhaXJpbmcgdXAgc2FtZS1pbmRleGVkIGVsZW1lbnRzIG9mIGBrZXlzYCBhbmQgYHZhbHVlc2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi56aXBPYmooWydhJywgJ2InLCAnYyddLCBbMSwgMiwgM10pOyAvLz0+IHthOiAxLCBiOiAyLCBjOiAzfVxuICAgICAqL1xuICAgIHZhciB6aXBPYmogPSBfY3VycnkyKGZ1bmN0aW9uIHppcE9iaihrZXlzLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGlkeCA9IDAsIGxlbiA9IGtleXMubGVuZ3RoLCBvdXQgPSB7fTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgb3V0W2tleXNbaWR4XV0gPSB2YWx1ZXNbaWR4XTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGxpc3Qgb3V0IG9mIHRoZSB0d28gc3VwcGxpZWQgYnkgYXBwbHlpbmcgdGhlIGZ1bmN0aW9uIHRvXG4gICAgICogZWFjaCBlcXVhbGx5LXBvc2l0aW9uZWQgcGFpciBpbiB0aGUgbGlzdHMuIFRoZSByZXR1cm5lZCBsaXN0IGlzXG4gICAgICogdHJ1bmNhdGVkIHRvIHRoZSBsZW5ndGggb2YgdGhlIHNob3J0ZXIgb2YgdGhlIHR3byBpbnB1dCBsaXN0cy5cbiAgICAgKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhLGIgLT4gYykgLT4gW2FdIC0+IFtiXSAtPiBbY11cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdXNlZCB0byBjb21iaW5lIHRoZSB0d28gZWxlbWVudHMgaW50byBvbmUgdmFsdWUuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDEgVGhlIGZpcnN0IGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QyIFRoZSBzZWNvbmQgYXJyYXkgdG8gY29uc2lkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG1hZGUgYnkgY29tYmluaW5nIHNhbWUtaW5kZXhlZCBlbGVtZW50cyBvZiBgbGlzdDFgIGFuZCBgbGlzdDJgXG4gICAgICogICAgICAgICB1c2luZyBgZm5gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBmID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAqICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICBSLnppcFdpdGgoZiwgWzEsIDIsIDNdLCBbJ2EnLCAnYicsICdjJ10pO1xuICAgICAqICAgICAgLy89PiBbZigxLCAnYScpLCBmKDIsICdiJyksIGYoMywgJ2MnKV1cbiAgICAgKi9cbiAgICB2YXIgemlwV2l0aCA9IF9jdXJyeTMoZnVuY3Rpb24gemlwV2l0aChmbiwgYSwgYikge1xuICAgICAgICB2YXIgcnYgPSBbXSwgaWR4ID0gMCwgbGVuID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgcnZbaWR4XSA9IGZuKGFbaWR4XSwgYltpZHhdKTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydjtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gdGhhdCBhbHdheXMgcmV0dXJucyBgZmFsc2VgLiBBbnkgcGFzc2VkIGluIHBhcmFtZXRlcnMgYXJlIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAqIC0+IGZhbHNlXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gZmFsc2VcbiAgICAgKiBAc2VlIFIuYWx3YXlzLCBSLlRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLkYoKTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBGID0gYWx3YXlzKGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gdGhhdCBhbHdheXMgcmV0dXJucyBgdHJ1ZWAuIEFueSBwYXNzZWQgaW4gcGFyYW1ldGVycyBhcmUgaWdub3JlZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICogLT4gdHJ1ZVxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYC5cbiAgICAgKiBAc2VlIFIuYWx3YXlzLCBSLkZcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLlQoKTsgLy89PiB0cnVlXG4gICAgICovXG4gICAgdmFyIFQgPSBhbHdheXModHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIHRvIGhhc01ldGhvZCwgdGhpcyBjaGVja3Mgd2hldGhlciBhIGZ1bmN0aW9uIGhhcyBhIFttZXRob2RuYW1lXVxuICAgICAqIGZ1bmN0aW9uLiBJZiBpdCBpc24ndCBhbiBhcnJheSBpdCB3aWxsIGV4ZWN1dGUgdGhhdCBmdW5jdGlvbiBvdGhlcndpc2UgaXQgd2lsbFxuICAgICAqIGRlZmF1bHQgdG8gdGhlIHJhbWRhIGltcGxlbWVudGF0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiByYW1kYSBpbXBsZW10YXRpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kbmFtZSBwcm9wZXJ0eSB0byBjaGVjayBmb3IgYSBjdXN0b20gaW1wbGVtZW50YXRpb25cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFdoYXRldmVyIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIG1ldGhvZCBpcy5cbiAgICAgKi9cbiAgICB2YXIgX2NoZWNrRm9yTWV0aG9kID0gZnVuY3Rpb24gX2NoZWNrRm9yTWV0aG9kKG1ldGhvZG5hbWUsIGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvYmogPSBhcmd1bWVudHNbbGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gX2lzQXJyYXkob2JqKSB8fCB0eXBlb2Ygb2JqW21ldGhvZG5hbWVdICE9PSAnZnVuY3Rpb24nID8gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IG9ialttZXRob2RuYW1lXS5hcHBseShvYmosIF9zbGljZShhcmd1bWVudHMsIDAsIGxlbmd0aCAtIDEpKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29waWVzIGFuIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgY29waWVkXG4gICAgICogQHBhcmFtIHtBcnJheX0gcmVmRnJvbSBBcnJheSBjb250YWluaW5nIHRoZSBzb3VyY2UgcmVmZXJlbmNlc1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IHJlZlRvIEFycmF5IGNvbnRhaW5pbmcgdGhlIGNvcGllZCBzb3VyY2UgcmVmZXJlbmNlc1xuICAgICAqIEByZXR1cm4geyp9IFRoZSBjb3BpZWQgdmFsdWUuXG4gICAgICovXG4gICAgdmFyIF9jbG9uZSA9IGZ1bmN0aW9uIF9jbG9uZSh2YWx1ZSwgcmVmRnJvbSwgcmVmVG8pIHtcbiAgICAgICAgdmFyIGNvcHkgPSBmdW5jdGlvbiBjb3B5KGNvcGllZFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gcmVmRnJvbS5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHJlZkZyb21baWR4XSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVmVG9baWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZGcm9tW2lkeCArIDFdID0gdmFsdWU7XG4gICAgICAgICAgICByZWZUb1tpZHggKyAxXSA9IGNvcGllZFZhbHVlO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29waWVkVmFsdWVba2V5XSA9IF9jbG9uZSh2YWx1ZVtrZXldLCByZWZGcm9tLCByZWZUbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29waWVkVmFsdWU7XG4gICAgICAgIH07XG4gICAgICAgIHN3aXRjaCAodHlwZSh2YWx1ZSkpIHtcbiAgICAgICAgY2FzZSAnT2JqZWN0JzpcbiAgICAgICAgICAgIHJldHVybiBjb3B5KHt9KTtcbiAgICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICAgICAgcmV0dXJuIGNvcHkoW10pO1xuICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICAgIGNhc2UgJ1JlZ0V4cCc6XG4gICAgICAgICAgICByZXR1cm4gX2Nsb25lUmVnRXhwKHZhbHVlKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgX2NyZWF0ZVBhcnRpYWxBcHBsaWNhdG9yID0gZnVuY3Rpb24gX2NyZWF0ZVBhcnRpYWxBcHBsaWNhdG9yKGNvbmNhdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIF9hcml0eShNYXRoLm1heCgwLCBmbi5sZW5ndGggLSBhcmdzLmxlbmd0aCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgY29uY2F0KGFyZ3MsIGFyZ3VtZW50cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGRpc3BhdGNoZXMgd2l0aCBkaWZmZXJlbnQgc3RyYXRlZ2llcyBiYXNlZCBvbiB0aGVcbiAgICAgKiBvYmplY3QgaW4gbGlzdCBwb3NpdGlvbiAobGFzdCBhcmd1bWVudCkuIElmIGl0IGlzIGFuIGFycmF5LCBleGVjdXRlcyBbZm5dLlxuICAgICAqIE90aGVyd2lzZSwgaWYgaXQgaGFzIGEgIGZ1bmN0aW9uIHdpdGggW21ldGhvZG5hbWVdLCBpdCB3aWxsIGV4ZWN1dGUgdGhhdFxuICAgICAqIGZ1bmN0aW9uIChmdW5jdG9yIGNhc2UpLiBPdGhlcndpc2UsIGlmIGl0IGlzIGEgdHJhbnNmb3JtZXIsIHVzZXMgdHJhbnNkdWNlclxuICAgICAqIFt4Zl0gdG8gcmV0dXJuIGEgbmV3IHRyYW5zZm9ybWVyICh0cmFuc2R1Y2VyIGNhc2UpLiBPdGhlcndpc2UsIGl0IHdpbGxcbiAgICAgKiBkZWZhdWx0IHRvIGV4ZWN1dGluZyBbZm5dLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kbmFtZSBwcm9wZXJ0eSB0byBjaGVjayBmb3IgYSBjdXN0b20gaW1wbGVtZW50YXRpb25cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB4ZiB0cmFuc2R1Y2VyIHRvIGluaXRpYWxpemUgaWYgb2JqZWN0IGlzIHRyYW5zZm9ybWVyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gZGVmYXVsdCByYW1kYSBpbXBsZW1lbnRhdGlvblxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgZGlzcGF0Y2hlcyBvbiBvYmplY3QgaW4gbGlzdCBwb3NpdGlvblxuICAgICAqL1xuICAgIHZhciBfZGlzcGF0Y2hhYmxlID0gZnVuY3Rpb24gX2Rpc3BhdGNoYWJsZShtZXRob2RuYW1lLCB4ZiwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9iaiA9IGFyZ3VtZW50c1tsZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gX3NsaWNlKGFyZ3VtZW50cywgMCwgbGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpbbWV0aG9kbmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9ialttZXRob2RuYW1lXS5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX2lzVHJhbnNmb3JtZXIob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNkdWNlciA9IHhmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNkdWNlcihvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBUaGUgYWxnb3JpdGhtIHVzZWQgdG8gaGFuZGxlIGN5Y2xpYyBzdHJ1Y3R1cmVzIGlzXG4gICAgLy8gaW5zcGlyZWQgYnkgdW5kZXJzY29yZSdzIGlzRXF1YWxcbiAgICAvLyBSZWdFeHAgZXF1YWxpdHkgYWxnb3JpdGhtOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDc3NjYzNVxuICAgIHZhciBfZXF1YWxzID0gZnVuY3Rpb24gX2VxdWFscyhhLCBiLCBzdGFja0EsIHN0YWNrQikge1xuICAgICAgICB2YXIgdHlwZUEgPSB0eXBlKGEpO1xuICAgICAgICBpZiAodHlwZUEgIT09IHR5cGUoYikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZUEgPT09ICdCb29sZWFuJyB8fCB0eXBlQSA9PT0gJ051bWJlcicgfHwgdHlwZUEgPT09ICdTdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGEgPT09ICdvYmplY3QnID8gdHlwZW9mIGIgPT09ICdvYmplY3QnICYmIGlkZW50aWNhbChhLnZhbHVlT2YoKSwgYi52YWx1ZU9mKCkpIDogaWRlbnRpY2FsKGEsIGIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZGVudGljYWwoYSwgYikpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlQSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgICAgICAgIC8vIFJlZ0V4cCBlcXVhbGl0eSBhbGdvcml0aG06IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEwNzc2NjM1XG4gICAgICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT09IGIuc291cmNlICYmIGEuZ2xvYmFsID09PSBiLmdsb2JhbCAmJiBhLmlnbm9yZUNhc2UgPT09IGIuaWdub3JlQ2FzZSAmJiBhLm11bHRpbGluZSA9PT0gYi5tdWx0aWxpbmUgJiYgYS5zdGlja3kgPT09IGIuc3RpY2t5ICYmIGEudW5pY29kZSA9PT0gYi51bmljb2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYmplY3QoYSkgPT09IGEpIHtcbiAgICAgICAgICAgIGlmICh0eXBlQSA9PT0gJ0RhdGUnICYmIGEuZ2V0VGltZSgpICE9PSBiLmdldFRpbWUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBrZXlzQSA9IGtleXMoYSk7XG4gICAgICAgICAgICBpZiAoa2V5c0EubGVuZ3RoICE9PSBrZXlzKGIpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpZHggPSBzdGFja0EubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChpZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFja0FbaWR4XSA9PT0gYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tCW2lkeF0gPT09IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2tBW3N0YWNrQS5sZW5ndGhdID0gYTtcbiAgICAgICAgICAgIHN0YWNrQltzdGFja0IubGVuZ3RoXSA9IGI7XG4gICAgICAgICAgICBpZHggPSBrZXlzQS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGtleXNBW2lkeF07XG4gICAgICAgICAgICAgICAgaWYgKCFfaGFzKGtleSwgYikgfHwgIV9lcXVhbHMoYltrZXldLCBhW2tleV0sIHN0YWNrQSwgc3RhY2tCKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2tBLnBvcCgpO1xuICAgICAgICAgICAgc3RhY2tCLnBvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBhIHByb3ZpZGVkIG9iamVjdCBoYXMgYSBnaXZlbiBtZXRob2QuXG4gICAgICogRG9lcyBub3QgaWdub3JlIG1ldGhvZHMgc3RvcmVkIG9uIHRoZSBvYmplY3QncyBwcm90b3R5cGUgY2hhaW4uIFVzZWQgZm9yIGR5bmFtaWNhbGx5XG4gICAgICogZGlzcGF0Y2hpbmcgUmFtZGEgbWV0aG9kcyB0byBub24tQXJyYXkgb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZE5hbWUgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjaGVjayBmb3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHRlc3QuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGhhcyBhIGdpdmVuIG1ldGhvZCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHBlcnNvbiA9IHsgbmFtZTogJ0pvaG4nIH07XG4gICAgICogICAgICBwZXJzb24uc2hvdXQgPSBmdW5jdGlvbigpIHsgYWxlcnQodGhpcy5uYW1lKTsgfTtcbiAgICAgKlxuICAgICAqICAgICAgX2hhc01ldGhvZCgnc2hvdXQnLCBwZXJzb24pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIF9oYXNNZXRob2QoJ2ZvbycsIHBlcnNvbik7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgX2hhc01ldGhvZCA9IGZ1bmN0aW9uIF9oYXNNZXRob2QobWV0aG9kTmFtZSwgb2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiAhX2lzQXJyYXkob2JqKSAmJiB0eXBlb2Ygb2JqW21ldGhvZE5hbWVdID09PSAnZnVuY3Rpb24nO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBgX21ha2VGbGF0YCBpcyBhIGhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBvbmUtbGV2ZWwgb3IgZnVsbHkgcmVjdXJzaXZlIGZ1bmN0aW9uXG4gICAgICogYmFzZWQgb24gdGhlIGZsYWcgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB2YXIgX21ha2VGbGF0ID0gZnVuY3Rpb24gX21ha2VGbGF0KHJlY3Vyc2l2ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZmxhdHQobGlzdCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlLCByZXN1bHQgPSBbXSwgaWR4ID0gMCwgaiwgaWxlbiA9IGxpc3QubGVuZ3RoLCBqbGVuO1xuICAgICAgICAgICAgd2hpbGUgKGlkeCA8IGlsZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UobGlzdFtpZHhdKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlY3Vyc2l2ZSA/IGZsYXR0KGxpc3RbaWR4XSkgOiBsaXN0W2lkeF07XG4gICAgICAgICAgICAgICAgICAgIGogPSAwO1xuICAgICAgICAgICAgICAgICAgICBqbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGpsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHZhbHVlW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaiArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gbGlzdFtpZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHZhciBfcmVkdWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBfYXJyYXlSZWR1Y2UoeGYsIGFjYywgbGlzdCkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IDAsIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgICAgIGFjYyA9IHhmWydAQHRyYW5zZHVjZXIvc3RlcCddKGFjYywgbGlzdFtpZHhdKTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjICYmIGFjY1snQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICBhY2MgPSBhY2NbJ0BAdHJhbnNkdWNlci92YWx1ZSddO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShhY2MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pdGVyYWJsZVJlZHVjZSh4ZiwgYWNjLCBpdGVyKSB7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IGl0ZXIubmV4dCgpO1xuICAgICAgICAgICAgd2hpbGUgKCFzdGVwLmRvbmUpIHtcbiAgICAgICAgICAgICAgICBhY2MgPSB4ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShhY2MsIHN0ZXAudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChhY2MgJiYgYWNjWydAQHRyYW5zZHVjZXIvcmVkdWNlZCddKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjYyA9IGFjY1snQEB0cmFuc2R1Y2VyL3ZhbHVlJ107XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGVwID0gaXRlci5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShhY2MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9tZXRob2RSZWR1Y2UoeGYsIGFjYywgb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShvYmoucmVkdWNlKGJpbmQoeGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10sIHhmKSwgYWNjKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN5bUl0ZXJhdG9yID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgPyBTeW1ib2wuaXRlcmF0b3IgOiAnQEBpdGVyYXRvcic7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBfcmVkdWNlKGZuLCBhY2MsIGxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBmbiA9IF94d3JhcChmbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UobGlzdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2FycmF5UmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0LnJlZHVjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfbWV0aG9kUmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3Rbc3ltSXRlcmF0b3JdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3Rbc3ltSXRlcmF0b3JdKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0Lm5leHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVkdWNlOiBsaXN0IG11c3QgYmUgYXJyYXkgb3IgaXRlcmFibGUnKTtcbiAgICAgICAgfTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3N0ZXBDYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfc3RlcENhdEFycmF5ID0ge1xuICAgICAgICAgICAgJ0BAdHJhbnNkdWNlci9pbml0JzogQXJyYXksXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3N0ZXAnOiBmdW5jdGlvbiAoeHMsIHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2NvbmNhdCh4cywgW3hdKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc6IF9pZGVudGl0eVxuICAgICAgICB9O1xuICAgICAgICB2YXIgX3N0ZXBDYXRTdHJpbmcgPSB7XG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL2luaXQnOiBTdHJpbmcsXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3N0ZXAnOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc6IF9pZGVudGl0eVxuICAgICAgICB9O1xuICAgICAgICB2YXIgX3N0ZXBDYXRPYmplY3QgPSB7XG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL2luaXQnOiBPYmplY3QsXG4gICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3N0ZXAnOiBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZShyZXN1bHQsIGlzQXJyYXlMaWtlKGlucHV0KSA/IGNyZWF0ZU1hcEVudHJ5KGlucHV0WzBdLCBpbnB1dFsxXSkgOiBpbnB1dCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ0BAdHJhbnNkdWNlci9yZXN1bHQnOiBfaWRlbnRpdHlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIF9zdGVwQ2F0KG9iaikge1xuICAgICAgICAgICAgaWYgKF9pc1RyYW5zZm9ybWVyKG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3N0ZXBDYXRBcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfc3RlcENhdFN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfc3RlcENhdE9iamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSB0cmFuc2Zvcm1lciBmb3IgJyArIG9iaik7XG4gICAgICAgIH07XG4gICAgfSgpO1xuXG4gICAgdmFyIF94YWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYQWxsKGYsIHhmKSB7XG4gICAgICAgICAgICB0aGlzLnhmID0geGY7XG4gICAgICAgICAgICB0aGlzLmYgPSBmO1xuICAgICAgICAgICAgdGhpcy5hbGwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIFhBbGwucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gX3hmQmFzZS5pbml0O1xuICAgICAgICBYQWxsLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShyZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgICBYQWxsLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IF9yZWR1Y2VkKHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gX3hhbGwoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWEFsbChmLCB4Zik7XG4gICAgICAgIH0pO1xuICAgIH0oKTtcblxuICAgIHZhciBfeGFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWEFueShmLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5mID0gZjtcbiAgICAgICAgICAgIHRoaXMuYW55ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgWEFueS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBfeGZCYXNlLmluaXQ7XG4gICAgICAgIFhBbnkucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYW55KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10ocmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgICAgWEFueS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gX3JlZHVjZWQodGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIHRydWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIF94YW55KGYsIHhmKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFhBbnkoZiwgeGYpO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3hkcm9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRHJvcChuLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5uID0gbjtcbiAgICAgICAgfVxuICAgICAgICBYRHJvcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBfeGZCYXNlLmluaXQ7XG4gICAgICAgIFhEcm9wLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gX3hmQmFzZS5yZXN1bHQ7XG4gICAgICAgIFhEcm9wLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5uID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubiAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIGlucHV0KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24gX3hkcm9wKG4sIHhmKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFhEcm9wKG4sIHhmKTtcbiAgICAgICAgfSk7XG4gICAgfSgpO1xuXG4gICAgdmFyIF94ZHJvcFdoaWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYRHJvcFdoaWxlKGYsIHhmKSB7XG4gICAgICAgICAgICB0aGlzLnhmID0geGY7XG4gICAgICAgICAgICB0aGlzLmYgPSBmO1xuICAgICAgICB9XG4gICAgICAgIFhEcm9wV2hpbGUucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gX3hmQmFzZS5pbml0O1xuICAgICAgICBYRHJvcFdoaWxlLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gX3hmQmFzZS5yZXN1bHQ7XG4gICAgICAgIFhEcm9wV2hpbGUucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvc3RlcCddID0gZnVuY3Rpb24gKHJlc3VsdCwgaW5wdXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmYpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mKGlucHV0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmYgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCBpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uIF94ZHJvcFdoaWxlKGYsIHhmKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFhEcm9wV2hpbGUoZiwgeGYpO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3hncm91cEJ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBYR3JvdXBCeShmLCB4Zikge1xuICAgICAgICAgICAgdGhpcy54ZiA9IHhmO1xuICAgICAgICAgICAgdGhpcy5mID0gZjtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgWEdyb3VwQnkucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gX3hmQmFzZS5pbml0O1xuICAgICAgICBYR3JvdXBCeS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmlucHV0cykge1xuICAgICAgICAgICAgICAgIGlmIChfaGFzKGtleSwgdGhpcy5pbnB1dHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMueGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10ocmVzdWx0LCB0aGlzLmlucHV0c1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdFsnQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0WydAQHRyYW5zZHVjZXIvdmFsdWUnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMueGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShyZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgICBYR3JvdXBCeS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuZihpbnB1dCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1trZXldID0gdGhpcy5pbnB1dHNba2V5XSB8fCBbXG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIFtdXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNba2V5XVsxXSA9IGFwcGVuZChpbnB1dCwgdGhpcy5pbnB1dHNba2V5XVsxXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbiBfeGdyb3VwQnkoZiwgeGYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWEdyb3VwQnkoZiwgeGYpO1xuICAgICAgICB9KTtcbiAgICB9KCk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGxpc3QgaXRlcmF0aW9uIGZ1bmN0aW9uIGZyb20gYW4gZXhpc3Rpbmcgb25lIGJ5IGFkZGluZyB0d28gbmV3IHBhcmFtZXRlcnNcbiAgICAgKiB0byBpdHMgY2FsbGJhY2sgZnVuY3Rpb246IHRoZSBjdXJyZW50IGluZGV4LCBhbmQgdGhlIGVudGlyZSBsaXN0LlxuICAgICAqXG4gICAgICogVGhpcyB3b3VsZCB0dXJuLCBmb3IgaW5zdGFuY2UsIFJhbWRhJ3Mgc2ltcGxlIGBtYXBgIGZ1bmN0aW9uIGludG8gb25lIHRoYXQgbW9yZSBjbG9zZWx5XG4gICAgICogcmVzZW1ibGVzIGBBcnJheS5wcm90b3R5cGUubWFwYC4gIE5vdGUgdGhhdCB0aGlzIHdpbGwgb25seSB3b3JrIGZvciBmdW5jdGlvbnMgaW4gd2hpY2hcbiAgICAgKiB0aGUgaXRlcmF0aW9uIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIGFuZCB3aGVyZSB0aGUgbGlzdCBpcyB0aGUgbGFzdFxuICAgICAqIHBhcmFtZXRlci4gIChUaGlzIGxhdHRlciBtaWdodCBiZSB1bmltcG9ydGFudCBpZiB0aGUgbGlzdCBwYXJhbWV0ZXIgaXMgbm90IHVzZWQuKVxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoKGEgLi4uIC0+IGIpIC4uLiAtPiBbYV0gLT4gKikgLT4gKGEgLi4uLCBJbnQsIFthXSAtPiBiKSAuLi4gLT4gW2FdIC0+ICopXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBsaXN0IGl0ZXJhdGlvbiBmdW5jdGlvbiB0aGF0IGRvZXMgbm90IHBhc3MgaW5kZXggb3IgbGlzdCB0byBpdHMgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQW4gYWx0ZXJlZCBsaXN0IGl0ZXJhdGlvbiBmdW5jdGlvbiB0aGF0IHBhc3NlcyAoaXRlbSwgaW5kZXgsIGxpc3QpIHRvIGl0cyBjYWxsYmFja1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBtYXBJbmRleGVkID0gUi5hZGRJbmRleChSLm1hcCk7XG4gICAgICogICAgICBtYXBJbmRleGVkKGZ1bmN0aW9uKHZhbCwgaWR4KSB7cmV0dXJuIGlkeCArICctJyArIHZhbDt9LCBbJ2YnLCAnbycsICdvJywgJ2InLCAnYScsICdyJ10pO1xuICAgICAqICAgICAgLy89PiBbJzAtZicsICcxLW8nLCAnMi1vJywgJzMtYicsICc0LWEnLCAnNS1yJ11cbiAgICAgKi9cbiAgICB2YXIgYWRkSW5kZXggPSBfY3VycnkxKGZ1bmN0aW9uIGFkZEluZGV4KGZuKSB7XG4gICAgICAgIHJldHVybiBjdXJyeU4oZm4ubGVuZ3RoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgICAgIHZhciBvcmlnRm4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9zbGljZShhcmd1bWVudHMpO1xuICAgICAgICAgICAgYXJnc1swXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gb3JpZ0ZuLmFwcGx5KHRoaXMsIF9jb25jYXQoYXJndW1lbnRzLCBbXG4gICAgICAgICAgICAgICAgICAgIGlkeCxcbiAgICAgICAgICAgICAgICAgICAgbGlzdFxuICAgICAgICAgICAgICAgIF0pKTtcbiAgICAgICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBhbGwgZWxlbWVudHMgb2YgdGhlIGxpc3QgbWF0Y2ggdGhlIHByZWRpY2F0ZSwgYGZhbHNlYCBpZiB0aGVyZSBhcmUgYW55XG4gICAgICogdGhhdCBkb24ndC5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIHByZWRpY2F0ZSBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIHByZWRpY2F0ZSBpcyBzYXRpc2ZpZWQgYnkgZXZlcnkgZWxlbWVudCwgYGZhbHNlYFxuICAgICAqICAgICAgICAgb3RoZXJ3aXNlLlxuICAgICAqIEBzZWUgUi5hbnksIFIubm9uZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBsZXNzVGhhbjIgPSBSLmZsaXAoUi5sdCkoMik7XG4gICAgICogICAgICB2YXIgbGVzc1RoYW4zID0gUi5mbGlwKFIubHQpKDMpO1xuICAgICAqICAgICAgUi5hbGwobGVzc1RoYW4yKShbMSwgMl0pOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmFsbChsZXNzVGhhbjMpKFsxLCAyXSk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBhbGwgPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ2FsbCcsIF94YWxsLCBmdW5jdGlvbiBhbGwoZm4sIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChpZHggPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCFmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGlmIGl0J3MgZmFsc3kgb3RoZXJ3aXNlIHRoZSBzZWNvbmRcbiAgICAgKiBhcmd1bWVudC4gTm90ZSB0aGF0IHRoaXMgaXMgTk9UIHNob3J0LWNpcmN1aXRlZCwgbWVhbmluZyB0aGF0IGlmIGV4cHJlc3Npb25zXG4gICAgICogYXJlIHBhc3NlZCB0aGV5IGFyZSBib3RoIGV2YWx1YXRlZC5cbiAgICAgKlxuICAgICAqIERpc3BhdGNoZXMgdG8gdGhlIGBhbmRgIG1ldGhvZCBvZiB0aGUgZmlyc3QgYXJndW1lbnQgaWYgYXBwbGljYWJsZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTG9naWNcbiAgICAgKiBAc2lnICogLT4gKiAtPiAqXG4gICAgICogQHBhcmFtIHsqfSBhIGFueSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7Kn0gYiBhbnkgb3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgZmlyc3QgYXJndW1lbnQgaWYgZmFsc3kgb3RoZXJ3aXNlIHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgICogQHNlZSBSLmJvdGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmFuZChmYWxzZSwgdHJ1ZSk7IC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIuYW5kKDAsIFtdKTsgLy89PiAwXG4gICAgICogICAgICBSLmFuZChudWxsLCAnJyk7ID0+IG51bGxcbiAgICAgKi9cbiAgICB2YXIgYW5kID0gX2N1cnJ5MihmdW5jdGlvbiBhbmQoYSwgYikge1xuICAgICAgICByZXR1cm4gX2hhc01ldGhvZCgnYW5kJywgYSkgPyBhLmFuZChiKSA6IGEgJiYgYjtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGF0IGxlYXN0IG9uZSBvZiBlbGVtZW50cyBvZiB0aGUgbGlzdCBtYXRjaCB0aGUgcHJlZGljYXRlLCBgZmFsc2VgXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQWN0cyBhcyBhIHRyYW5zZHVjZXIgaWYgYSB0cmFuc2Zvcm1lciBpcyBnaXZlbiBpbiBsaXN0IHBvc2l0aW9uLlxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGEgLT4gQm9vbGVhbikgLT4gW2FdIC0+IEJvb2xlYW5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgcHJlZGljYXRlIGlzIHNhdGlzZmllZCBieSBhdCBsZWFzdCBvbmUgZWxlbWVudCwgYGZhbHNlYFxuICAgICAqICAgICAgICAgb3RoZXJ3aXNlLlxuICAgICAqIEBzZWUgUi5hbGwsIFIubm9uZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBsZXNzVGhhbjAgPSBSLmZsaXAoUi5sdCkoMCk7XG4gICAgICogICAgICB2YXIgbGVzc1RoYW4yID0gUi5mbGlwKFIubHQpKDIpO1xuICAgICAqICAgICAgUi5hbnkobGVzc1RoYW4wKShbMSwgMl0pOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmFueShsZXNzVGhhbjIpKFsxLCAyXSk7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBhbnkgPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ2FueScsIF94YW55LCBmdW5jdGlvbiBhbnkoZm4sIGxpc3QpIHtcbiAgICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChpZHggPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGZuKGxpc3RbaWR4XSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhIGZ1bmN0aW9uIG9mIGFueSBhcml0eSAoaW5jbHVkaW5nIG51bGxhcnkpIGluIGEgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIGV4YWN0bHkgMlxuICAgICAqIHBhcmFtZXRlcnMuIEFueSBleHRyYW5lb3VzIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgcGFzc2VkIHRvIHRoZSBzdXBwbGllZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICgqIC0+IGMpIC0+IChhLCBiIC0+IGMpXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIGBmbmAuIFRoZSBuZXcgZnVuY3Rpb24gaXMgZ3VhcmFudGVlZCB0byBiZSBvZlxuICAgICAqICAgICAgICAgYXJpdHkgMi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgdGFrZXNUaHJlZUFyZ3MgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgICogICAgICAgIHJldHVybiBbYSwgYiwgY107XG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgdGFrZXNUaHJlZUFyZ3MubGVuZ3RoOyAvLz0+IDNcbiAgICAgKiAgICAgIHRha2VzVGhyZWVBcmdzKDEsIDIsIDMpOyAvLz0+IFsxLCAyLCAzXVxuICAgICAqXG4gICAgICogICAgICB2YXIgdGFrZXNUd29BcmdzID0gUi5iaW5hcnkodGFrZXNUaHJlZUFyZ3MpO1xuICAgICAqICAgICAgdGFrZXNUd29BcmdzLmxlbmd0aDsgLy89PiAyXG4gICAgICogICAgICAvLyBPbmx5IDIgYXJndW1lbnRzIGFyZSBwYXNzZWQgdG8gdGhlIHdyYXBwZWQgZnVuY3Rpb25cbiAgICAgKiAgICAgIHRha2VzVHdvQXJncygxLCAyLCAzKTsgLy89PiBbMSwgMiwgdW5kZWZpbmVkXVxuICAgICAqL1xuICAgIHZhciBiaW5hcnkgPSBfY3VycnkxKGZ1bmN0aW9uIGJpbmFyeShmbikge1xuICAgICAgICByZXR1cm4gbkFyeSgyLCBmbik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZGVlcCBjb3B5IG9mIHRoZSB2YWx1ZSB3aGljaCBtYXkgY29udGFpbiAobmVzdGVkKSBgQXJyYXlgcyBhbmRcbiAgICAgKiBgT2JqZWN0YHMsIGBOdW1iZXJgcywgYFN0cmluZ2BzLCBgQm9vbGVhbmBzIGFuZCBgRGF0ZWBzLiBgRnVuY3Rpb25gcyBhcmVcbiAgICAgKiBub3QgY29waWVkLCBidXQgYXNzaWduZWQgYnkgdGhlaXIgcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHsqfSAtPiB7Kn1cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBvYmplY3Qgb3IgYXJyYXkgdG8gY2xvbmVcbiAgICAgKiBAcmV0dXJuIHsqfSBBIG5ldyBvYmplY3Qgb3IgYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG9iamVjdHMgPSBbe30sIHt9LCB7fV07XG4gICAgICogICAgICB2YXIgb2JqZWN0c0Nsb25lID0gUi5jbG9uZShvYmplY3RzKTtcbiAgICAgKiAgICAgIG9iamVjdHNbMF0gPT09IG9iamVjdHNDbG9uZVswXTsgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBjbG9uZSA9IF9jdXJyeTEoZnVuY3Rpb24gY2xvbmUodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIF9jbG9uZSh2YWx1ZSwgW10sIFtdKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgbGlzdCBjb25zaXN0aW5nIG9mIHRoZSBlbGVtZW50cyBvZiB0aGUgZmlyc3QgbGlzdCBmb2xsb3dlZCBieSB0aGUgZWxlbWVudHNcbiAgICAgKiBvZiB0aGUgc2Vjb25kLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBbYV0gLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QxIFRoZSBmaXJzdCBsaXN0IHRvIG1lcmdlLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QyIFRoZSBzZWNvbmQgc2V0IHRvIG1lcmdlLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBhcnJheSBjb25zaXN0aW5nIG9mIHRoZSBjb250ZW50cyBvZiBgbGlzdDFgIGZvbGxvd2VkIGJ5IHRoZVxuICAgICAqICAgICAgICAgY29udGVudHMgb2YgYGxpc3QyYC4gSWYsIGluc3RlYWQgb2YgYW4gQXJyYXkgZm9yIGBsaXN0MWAsIHlvdSBwYXNzIGFuXG4gICAgICogICAgICAgICBvYmplY3Qgd2l0aCBhIGBjb25jYXRgIG1ldGhvZCBvbiBpdCwgYGNvbmNhdGAgd2lsbCBjYWxsIGBsaXN0MS5jb25jYXRgXG4gICAgICogICAgICAgICBhbmQgcGFzcyBpdCB0aGUgdmFsdWUgb2YgYGxpc3QyYC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuY29uY2F0KFtdLCBbXSk7IC8vPT4gW11cbiAgICAgKiAgICAgIFIuY29uY2F0KFs0LCA1LCA2XSwgWzEsIDIsIDNdKTsgLy89PiBbNCwgNSwgNiwgMSwgMiwgM11cbiAgICAgKiAgICAgIFIuY29uY2F0KCdBQkMnLCAnREVGJyk7IC8vICdBQkNERUYnXG4gICAgICovXG4gICAgdmFyIGNvbmNhdCA9IF9jdXJyeTIoZnVuY3Rpb24gY29uY2F0KHNldDEsIHNldDIpIHtcbiAgICAgICAgaWYgKF9pc0FycmF5KHNldDIpKSB7XG4gICAgICAgICAgICByZXR1cm4gX2NvbmNhdChzZXQxLCBzZXQyKTtcbiAgICAgICAgfSBlbHNlIGlmIChfaGFzTWV0aG9kKCdjb25jYXQnLCBzZXQxKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNldDEuY29uY2F0KHNldDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FuXFwndCBjb25jYXQgJyArIHR5cGVvZiBzZXQxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGN1cnJpZWQgZXF1aXZhbGVudCBvZiB0aGUgcHJvdmlkZWQgZnVuY3Rpb24uIFRoZSBjdXJyaWVkXG4gICAgICogZnVuY3Rpb24gaGFzIHR3byB1bnVzdWFsIGNhcGFiaWxpdGllcy4gRmlyc3QsIGl0cyBhcmd1bWVudHMgbmVlZG4ndFxuICAgICAqIGJlIHByb3ZpZGVkIG9uZSBhdCBhIHRpbWUuIElmIGBmYCBpcyBhIHRlcm5hcnkgZnVuY3Rpb24gYW5kIGBnYCBpc1xuICAgICAqIGBSLmN1cnJ5KGYpYCwgdGhlIGZvbGxvd2luZyBhcmUgZXF1aXZhbGVudDpcbiAgICAgKlxuICAgICAqICAgLSBgZygxKSgyKSgzKWBcbiAgICAgKiAgIC0gYGcoMSkoMiwgMylgXG4gICAgICogICAtIGBnKDEsIDIpKDMpYFxuICAgICAqICAgLSBgZygxLCAyLCAzKWBcbiAgICAgKlxuICAgICAqIFNlY29uZGx5LCB0aGUgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSBgUi5fX2AgbWF5IGJlIHVzZWQgdG8gc3BlY2lmeVxuICAgICAqIFwiZ2Fwc1wiLCBhbGxvd2luZyBwYXJ0aWFsIGFwcGxpY2F0aW9uIG9mIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMsXG4gICAgICogcmVnYXJkbGVzcyBvZiB0aGVpciBwb3NpdGlvbnMuIElmIGBnYCBpcyBhcyBhYm92ZSBhbmQgYF9gIGlzIGBSLl9fYCxcbiAgICAgKiB0aGUgZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICAgICAqXG4gICAgICogICAtIGBnKDEsIDIsIDMpYFxuICAgICAqICAgLSBgZyhfLCAyLCAzKSgxKWBcbiAgICAgKiAgIC0gYGcoXywgXywgMykoMSkoMilgXG4gICAgICogICAtIGBnKF8sIF8sIDMpKDEsIDIpYFxuICAgICAqICAgLSBgZyhfLCAyKSgxKSgzKWBcbiAgICAgKiAgIC0gYGcoXywgMikoMSwgMylgXG4gICAgICogICAtIGBnKF8sIDIpKF8sIDMpKDEpYFxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgKCogLT4gYSkgLT4gKCogLT4gYSlcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3LCBjdXJyaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBzZWUgUi5jdXJyeU5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgYWRkRm91ck51bWJlcnMgPSBmdW5jdGlvbihhLCBiLCBjLCBkKSB7XG4gICAgICogICAgICAgIHJldHVybiBhICsgYiArIGMgKyBkO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGN1cnJpZWRBZGRGb3VyTnVtYmVycyA9IFIuY3VycnkoYWRkRm91ck51bWJlcnMpO1xuICAgICAqICAgICAgdmFyIGYgPSBjdXJyaWVkQWRkRm91ck51bWJlcnMoMSwgMik7XG4gICAgICogICAgICB2YXIgZyA9IGYoMyk7XG4gICAgICogICAgICBnKDQpOyAvLz0+IDEwXG4gICAgICovXG4gICAgdmFyIGN1cnJ5ID0gX2N1cnJ5MShmdW5jdGlvbiBjdXJyeShmbikge1xuICAgICAgICByZXR1cm4gY3VycnlOKGZuLmxlbmd0aCwgZm4pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIGxhc3QgYG5gIGVsZW1lbnRzIG9mIGEgZ2l2ZW4gbGlzdCwgcGFzc2luZyBlYWNoIHZhbHVlXG4gICAgICogdG8gdGhlIHN1cHBsaWVkIHByZWRpY2F0ZSBmdW5jdGlvbiwgc2tpcHBpbmcgZWxlbWVudHMgd2hpbGUgdGhlIHByZWRpY2F0ZSBmdW5jdGlvbiByZXR1cm5zXG4gICAgICogYHRydWVgLiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6ICoodmFsdWUpKi5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IGFycmF5LlxuICAgICAqIEBzZWUgUi50YWtlV2hpbGVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgbHRlVHdvID0gZnVuY3Rpb24oeCkge1xuICAgICAqICAgICAgICByZXR1cm4geCA8PSAyO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgUi5kcm9wV2hpbGUobHRlVHdvLCBbMSwgMiwgMywgNCwgMywgMiwgMV0pOyAvLz0+IFszLCA0LCAzLCAyLCAxXVxuICAgICAqL1xuICAgIHZhciBkcm9wV2hpbGUgPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ2Ryb3BXaGlsZScsIF94ZHJvcFdoaWxlLCBmdW5jdGlvbiBkcm9wV2hpbGUocHJlZCwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gMCwgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4gJiYgcHJlZChsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3NsaWNlKGxpc3QsIGlkeCk7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgaXRzIGFyZ3VtZW50cyBhcmUgZXF1aXZhbGVudCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogRGlzcGF0Y2hlcyB0byBhbiBgZXF1YWxzYCBtZXRob2QgaWYgcHJlc2VudC4gSGFuZGxlcyBjeWNsaWNhbCBkYXRhXG4gICAgICogc3RydWN0dXJlcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIGEgLT4gYiAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHsqfSBhXG4gICAgICogQHBhcmFtIHsqfSBiXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmVxdWFscygxLCAxKTsgLy89PiB0cnVlXG4gICAgICogICAgICBSLmVxdWFscygxLCAnMScpOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmVxdWFscyhbMSwgMiwgM10sIFsxLCAyLCAzXSk7IC8vPT4gdHJ1ZVxuICAgICAqXG4gICAgICogICAgICB2YXIgYSA9IHt9OyBhLnYgPSBhO1xuICAgICAqICAgICAgdmFyIGIgPSB7fTsgYi52ID0gYjtcbiAgICAgKiAgICAgIFIuZXF1YWxzKGEsIGIpOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgZXF1YWxzID0gX2N1cnJ5MihmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICAgICAgICByZXR1cm4gX2hhc01ldGhvZCgnZXF1YWxzJywgYSkgPyBhLmVxdWFscyhiKSA6IF9oYXNNZXRob2QoJ2VxdWFscycsIGIpID8gYi5lcXVhbHMoYSkgOiBfZXF1YWxzKGEsIGIsIFtdLCBbXSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGxpc3QgY29udGFpbmluZyBvbmx5IHRob3NlIGl0ZW1zIHRoYXQgbWF0Y2ggYSBnaXZlbiBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gICAgICogVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiBpcyBwYXNzZWQgb25lIGFyZ3VtZW50OiAqKHZhbHVlKSouXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgYFIuZmlsdGVyYCBkb2VzIG5vdCBza2lwIGRlbGV0ZWQgb3IgdW5hc3NpZ25lZCBpbmRpY2VzLCB1bmxpa2UgdGhlIG5hdGl2ZVxuICAgICAqIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyYCBtZXRob2QuIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcyBiZWhhdmlvciwgc2VlOlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbHRlciNEZXNjcmlwdGlvblxuICAgICAqXG4gICAgICogQWN0cyBhcyBhIHRyYW5zZHVjZXIgaWYgYSB0cmFuc2Zvcm1lciBpcyBnaXZlbiBpbiBsaXN0IHBvc2l0aW9uLlxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGEgLT4gQm9vbGVhbikgLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAgICAgKiBAc2VlIFIucmVqZWN0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGlzRXZlbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIG4gJSAyID09PSAwO1xuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIFIuZmlsdGVyKGlzRXZlbiwgWzEsIDIsIDMsIDRdKTsgLy89PiBbMiwgNF1cbiAgICAgKi9cbiAgICB2YXIgZmlsdGVyID0gX2N1cnJ5MihfZGlzcGF0Y2hhYmxlKCdmaWx0ZXInLCBfeGZpbHRlciwgX2ZpbHRlcikpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgbGlzdCB3aGljaCBtYXRjaGVzIHRoZSBwcmVkaWNhdGUsIG9yIGB1bmRlZmluZWRgIGlmIG5vXG4gICAgICogZWxlbWVudCBtYXRjaGVzLlxuICAgICAqXG4gICAgICogQWN0cyBhcyBhIHRyYW5zZHVjZXIgaWYgYSB0cmFuc2Zvcm1lciBpcyBnaXZlbiBpbiBsaXN0IHBvc2l0aW9uLlxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGEgLT4gQm9vbGVhbikgLT4gW2FdIC0+IGEgfCB1bmRlZmluZWRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBlbGVtZW50IGlzIHRoZVxuICAgICAqICAgICAgICBkZXNpcmVkIG9uZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBlbGVtZW50IGZvdW5kLCBvciBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgeHMgPSBbe2E6IDF9LCB7YTogMn0sIHthOiAzfV07XG4gICAgICogICAgICBSLmZpbmQoUi5wcm9wRXEoJ2EnLCAyKSkoeHMpOyAvLz0+IHthOiAyfVxuICAgICAqICAgICAgUi5maW5kKFIucHJvcEVxKCdhJywgNCkpKHhzKTsgLy89PiB1bmRlZmluZWRcbiAgICAgKi9cbiAgICB2YXIgZmluZCA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnZmluZCcsIF94ZmluZCwgZnVuY3Rpb24gZmluZChmbiwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoZm4obGlzdFtpZHhdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0W2lkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBsaXN0IHdoaWNoIG1hdGNoZXMgdGhlIHByZWRpY2F0ZSwgb3IgYC0xYFxuICAgICAqIGlmIG5vIGVsZW1lbnQgbWF0Y2hlcy5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBlbGVtZW50IGlzIHRoZVxuICAgICAqIGRlc2lyZWQgb25lLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGZvdW5kLCBvciBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB4cyA9IFt7YTogMX0sIHthOiAyfSwge2E6IDN9XTtcbiAgICAgKiAgICAgIFIuZmluZEluZGV4KFIucHJvcEVxKCdhJywgMikpKHhzKTsgLy89PiAxXG4gICAgICogICAgICBSLmZpbmRJbmRleChSLnByb3BFcSgnYScsIDQpKSh4cyk7IC8vPT4gLTFcbiAgICAgKi9cbiAgICB2YXIgZmluZEluZGV4ID0gX2N1cnJ5MihfZGlzcGF0Y2hhYmxlKCdmaW5kSW5kZXgnLCBfeGZpbmRJbmRleCwgZnVuY3Rpb24gZmluZEluZGV4KGZuLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGxpc3Qgd2hpY2ggbWF0Y2hlcyB0aGUgcHJlZGljYXRlLCBvciBgdW5kZWZpbmVkYCBpZiBub1xuICAgICAqIGVsZW1lbnQgbWF0Y2hlcy5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBhIHwgdW5kZWZpbmVkXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgZWxlbWVudCBpcyB0aGVcbiAgICAgKiBkZXNpcmVkIG9uZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBlbGVtZW50IGZvdW5kLCBvciBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgeHMgPSBbe2E6IDEsIGI6IDB9LCB7YToxLCBiOiAxfV07XG4gICAgICogICAgICBSLmZpbmRMYXN0KFIucHJvcEVxKCdhJywgMSkpKHhzKTsgLy89PiB7YTogMSwgYjogMX1cbiAgICAgKiAgICAgIFIuZmluZExhc3QoUi5wcm9wRXEoJ2EnLCA0KSkoeHMpOyAvLz0+IHVuZGVmaW5lZFxuICAgICAqL1xuICAgIHZhciBmaW5kTGFzdCA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnZmluZExhc3QnLCBfeGZpbmRMYXN0LCBmdW5jdGlvbiBmaW5kTGFzdChmbiwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gbGlzdC5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIGlmIChmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RbaWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICB9XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgbGlzdCB3aGljaCBtYXRjaGVzIHRoZSBwcmVkaWNhdGUsIG9yXG4gICAgICogYC0xYCBpZiBubyBlbGVtZW50IG1hdGNoZXMuXG4gICAgICpcbiAgICAgKiBBY3RzIGFzIGEgdHJhbnNkdWNlciBpZiBhIHRyYW5zZm9ybWVyIGlzIGdpdmVuIGluIGxpc3QgcG9zaXRpb24uXG4gICAgICogQHNlZSBSLnRyYW5zZHVjZVxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBCb29sZWFuKSAtPiBbYV0gLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgZWxlbWVudCBpcyB0aGVcbiAgICAgKiBkZXNpcmVkIG9uZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBmb3VuZCwgb3IgYC0xYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgeHMgPSBbe2E6IDEsIGI6IDB9LCB7YToxLCBiOiAxfV07XG4gICAgICogICAgICBSLmZpbmRMYXN0SW5kZXgoUi5wcm9wRXEoJ2EnLCAxKSkoeHMpOyAvLz0+IDFcbiAgICAgKiAgICAgIFIuZmluZExhc3RJbmRleChSLnByb3BFcSgnYScsIDQpKSh4cyk7IC8vPT4gLTFcbiAgICAgKi9cbiAgICB2YXIgZmluZExhc3RJbmRleCA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnZmluZExhc3RJbmRleCcsIF94ZmluZExhc3RJbmRleCwgZnVuY3Rpb24gZmluZExhc3RJbmRleChmbiwgbGlzdCkge1xuICAgICAgICB2YXIgaWR4ID0gbGlzdC5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIGlmIChmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGxpc3QgYnkgcHVsbGluZyBldmVyeSBpdGVtIG91dCBvZiBpdCAoYW5kIGFsbCBpdHMgc3ViLWFycmF5cykgYW5kIHB1dHRpbmdcbiAgICAgKiB0aGVtIGluIGEgbmV3IGFycmF5LCBkZXB0aC1maXJzdC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgW2FdIC0+IFtiXVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgZmxhdHRlbmVkIGxpc3QuXG4gICAgICogQHNlZSBSLnVubmVzdFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuZmxhdHRlbihbMSwgMiwgWzMsIDRdLCA1LCBbNiwgWzcsIDgsIFs5LCBbMTAsIDExXSwgMTJdXV1dKTtcbiAgICAgKiAgICAgIC8vPT4gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTJdXG4gICAgICovXG4gICAgdmFyIGZsYXR0ZW4gPSBfY3VycnkxKF9tYWtlRmxhdCh0cnVlKSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIG11Y2ggbGlrZSB0aGUgc3VwcGxpZWQgb25lLCBleGNlcHQgdGhhdCB0aGUgZmlyc3QgdHdvIGFyZ3VtZW50cydcbiAgICAgKiBvcmRlciBpcyByZXZlcnNlZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIChhIC0+IGIgLT4gYyAtPiAuLi4gLT4geikgLT4gKGIgLT4gYSAtPiBjIC0+IC4uLiAtPiB6KVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBpbnZva2Ugd2l0aCBpdHMgZmlyc3QgdHdvIHBhcmFtZXRlcnMgcmV2ZXJzZWQuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHJlc3VsdCBvZiBpbnZva2luZyBgZm5gIHdpdGggaXRzIGZpcnN0IHR3byBwYXJhbWV0ZXJzJyBvcmRlciByZXZlcnNlZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgbWVyZ2VUaHJlZSA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIChbXSkuY29uY2F0KGEsIGIsIGMpO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgbWVyZ2VUaHJlZSgxLCAyLCAzKTsgLy89PiBbMSwgMiwgM11cbiAgICAgKlxuICAgICAqICAgICAgUi5mbGlwKG1lcmdlVGhyZWUpKDEsIDIsIDMpOyAvLz0+IFsyLCAxLCAzXVxuICAgICAqL1xuICAgIHZhciBmbGlwID0gX2N1cnJ5MShmdW5jdGlvbiBmbGlwKGZuKSB7XG4gICAgICAgIHJldHVybiBjdXJyeShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGFyZ3NbMF0gPSBiO1xuICAgICAgICAgICAgYXJnc1sxXSA9IGE7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZSBvdmVyIGFuIGlucHV0IGBsaXN0YCwgY2FsbGluZyBhIHByb3ZpZGVkIGZ1bmN0aW9uIGBmbmAgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGVcbiAgICAgKiBsaXN0LlxuICAgICAqXG4gICAgICogYGZuYCByZWNlaXZlcyBvbmUgYXJndW1lbnQ6ICoodmFsdWUpKi5cbiAgICAgKlxuICAgICAqIE5vdGU6IGBSLmZvckVhY2hgIGRvZXMgbm90IHNraXAgZGVsZXRlZCBvciB1bmFzc2lnbmVkIGluZGljZXMgKHNwYXJzZSBhcnJheXMpLCB1bmxpa2VcbiAgICAgKiB0aGUgbmF0aXZlIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kLiBGb3IgbW9yZSBkZXRhaWxzIG9uIHRoaXMgYmVoYXZpb3IsIHNlZTpcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mb3JFYWNoI0Rlc2NyaXB0aW9uXG4gICAgICpcbiAgICAgKiBBbHNvIG5vdGUgdGhhdCwgdW5saWtlIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAsIFJhbWRhJ3MgYGZvckVhY2hgIHJldHVybnMgdGhlIG9yaWdpbmFsXG4gICAgICogYXJyYXkuIEluIHNvbWUgbGlicmFyaWVzIHRoaXMgZnVuY3Rpb24gaXMgbmFtZWQgYGVhY2hgLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiAqKSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGludm9rZS4gUmVjZWl2ZXMgb25lIGFyZ3VtZW50LCBgdmFsdWVgLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgb3JpZ2luYWwgbGlzdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgcHJpbnRYUGx1c0ZpdmUgPSBmdW5jdGlvbih4KSB7IGNvbnNvbGUubG9nKHggKyA1KTsgfTtcbiAgICAgKiAgICAgIFIuZm9yRWFjaChwcmludFhQbHVzRml2ZSwgWzEsIDIsIDNdKTsgLy89PiBbMSwgMiwgM11cbiAgICAgKiAgICAgIC8vLT4gNlxuICAgICAqICAgICAgLy8tPiA3XG4gICAgICogICAgICAvLy0+IDhcbiAgICAgKi9cbiAgICB2YXIgZm9yRWFjaCA9IF9jdXJyeTIoX2NoZWNrRm9yTWV0aG9kKCdmb3JFYWNoJywgZnVuY3Rpb24gZm9yRWFjaChmbiwgbGlzdCkge1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgICAgICBmbihsaXN0W2lkeF0pO1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgZnVuY3Rpb24gbmFtZXMgb2Ygb2JqZWN0J3Mgb3duIGZ1bmN0aW9uc1xuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHsqfSAtPiBbU3RyaW5nXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdHMgd2l0aCBmdW5jdGlvbnMgaW4gaXRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBsaXN0IG9mIHRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcyB0aGF0IG1hcCB0byBmdW5jdGlvbnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5mdW5jdGlvbnMoUik7IC8vIHJldHVybnMgbGlzdCBvZiByYW1kYSdzIG93biBmdW5jdGlvbiBuYW1lc1xuICAgICAqXG4gICAgICogICAgICB2YXIgRiA9IGZ1bmN0aW9uKCkgeyB0aGlzLnggPSBmdW5jdGlvbigpe307IHRoaXMueSA9IDE7IH1cbiAgICAgKiAgICAgIEYucHJvdG90eXBlLnogPSBmdW5jdGlvbigpIHt9O1xuICAgICAqICAgICAgRi5wcm90b3R5cGUuYSA9IDEwMDtcbiAgICAgKiAgICAgIFIuZnVuY3Rpb25zKG5ldyBGKCkpOyAvLz0+IFtcInhcIl1cbiAgICAgKi9cbiAgICB2YXIgZnVuY3Rpb25zID0gX2N1cnJ5MShfZnVuY3Rpb25zV2l0aChrZXlzKSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBmdW5jdGlvbiBuYW1lcyBvZiBvYmplY3QncyBvd24gYW5kIHByb3RvdHlwZSBmdW5jdGlvbnNcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyB7Kn0gLT4gW1N0cmluZ11cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3RzIHdpdGggZnVuY3Rpb25zIGluIGl0XG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbGlzdCBvZiB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMgYW5kIHByb3RvdHlwZVxuICAgICAqICAgICAgICAgcHJvcGVydGllcyB0aGF0IG1hcCB0byBmdW5jdGlvbnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5mdW5jdGlvbnNJbihSKTsgLy8gcmV0dXJucyBsaXN0IG9mIHJhbWRhJ3Mgb3duIGFuZCBwcm90b3R5cGUgZnVuY3Rpb24gbmFtZXNcbiAgICAgKlxuICAgICAqICAgICAgdmFyIEYgPSBmdW5jdGlvbigpIHsgdGhpcy54ID0gZnVuY3Rpb24oKXt9OyB0aGlzLnkgPSAxOyB9XG4gICAgICogICAgICBGLnByb3RvdHlwZS56ID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgKiAgICAgIEYucHJvdG90eXBlLmEgPSAxMDA7XG4gICAgICogICAgICBSLmZ1bmN0aW9uc0luKG5ldyBGKCkpOyAvLz0+IFtcInhcIiwgXCJ6XCJdXG4gICAgICovXG4gICAgdmFyIGZ1bmN0aW9uc0luID0gX2N1cnJ5MShfZnVuY3Rpb25zV2l0aChrZXlzSW4pKTtcblxuICAgIC8qKlxuICAgICAqIFNwbGl0cyBhIGxpc3QgaW50byBzdWItbGlzdHMgc3RvcmVkIGluIGFuIG9iamVjdCwgYmFzZWQgb24gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIGEgU3RyaW5nLXJldHVybmluZyBmdW5jdGlvblxuICAgICAqIG9uIGVhY2ggZWxlbWVudCwgYW5kIGdyb3VwaW5nIHRoZSByZXN1bHRzIGFjY29yZGluZyB0byB2YWx1ZXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBBY3RzIGFzIGEgdHJhbnNkdWNlciBpZiBhIHRyYW5zZm9ybWVyIGlzIGdpdmVuIGluIGxpc3QgcG9zaXRpb24uXG4gICAgICogQHNlZSBSLnRyYW5zZHVjZVxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBTdHJpbmcpIC0+IFthXSAtPiB7U3RyaW5nOiBbYV19XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gOjogYSAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBncm91cFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIG91dHB1dCBvZiBgZm5gIGZvciBrZXlzLCBtYXBwZWQgdG8gYXJyYXlzIG9mIGVsZW1lbnRzXG4gICAgICogICAgICAgICB0aGF0IHByb2R1Y2VkIHRoYXQga2V5IHdoZW4gcGFzc2VkIHRvIGBmbmAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGJ5R3JhZGUgPSBSLmdyb3VwQnkoZnVuY3Rpb24oc3R1ZGVudCkge1xuICAgICAqICAgICAgICB2YXIgc2NvcmUgPSBzdHVkZW50LnNjb3JlO1xuICAgICAqICAgICAgICByZXR1cm4gc2NvcmUgPCA2NSA/ICdGJyA6XG4gICAgICogICAgICAgICAgICAgICBzY29yZSA8IDcwID8gJ0QnIDpcbiAgICAgKiAgICAgICAgICAgICAgIHNjb3JlIDwgODAgPyAnQycgOlxuICAgICAqICAgICAgICAgICAgICAgc2NvcmUgPCA5MCA/ICdCJyA6ICdBJztcbiAgICAgKiAgICAgIH0pO1xuICAgICAqICAgICAgdmFyIHN0dWRlbnRzID0gW3tuYW1lOiAnQWJieScsIHNjb3JlOiA4NH0sXG4gICAgICogICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdFZGR5Jywgc2NvcmU6IDU4fSxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ0phY2snLCBzY29yZTogNjl9XTtcbiAgICAgKiAgICAgIGJ5R3JhZGUoc3R1ZGVudHMpO1xuICAgICAqICAgICAgLy8ge1xuICAgICAqICAgICAgLy8gICAnQSc6IFt7bmFtZTogJ0RpYW5uZScsIHNjb3JlOiA5OX1dLFxuICAgICAqICAgICAgLy8gICAnQic6IFt7bmFtZTogJ0FiYnknLCBzY29yZTogODR9XVxuICAgICAqICAgICAgLy8gICAvLyAuLi4sXG4gICAgICogICAgICAvLyAgICdGJzogW3tuYW1lOiAnRWRkeScsIHNjb3JlOiA1OH1dXG4gICAgICogICAgICAvLyB9XG4gICAgICovXG4gICAgdmFyIGdyb3VwQnkgPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ2dyb3VwQnknLCBfeGdyb3VwQnksIGZ1bmN0aW9uIGdyb3VwQnkoZm4sIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIF9yZWR1Y2UoZnVuY3Rpb24gKGFjYywgZWx0KSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gZm4oZWx0KTtcbiAgICAgICAgICAgIGFjY1trZXldID0gYXBwZW5kKGVsdCwgYWNjW2tleV0gfHwgKGFjY1trZXldID0gW10pKTtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9LCBsaXN0KTtcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0IG9yIHN0cmluZy4gSW4gc29tZSBsaWJyYXJpZXNcbiAgICAgKiB0aGlzIGZ1bmN0aW9uIGlzIG5hbWVkIGBmaXJzdGAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2VlIFIudGFpbCwgUi5pbml0LCBSLmxhc3RcbiAgICAgKiBAc2lnIFthXSAtPiBhIHwgVW5kZWZpbmVkXG4gICAgICogQHNpZyBTdHJpbmcgLT4gU3RyaW5nXG4gICAgICogQHBhcmFtIHsqfSBsaXN0XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmhlYWQoWydmaScsICdmbycsICdmdW0nXSk7IC8vPT4gJ2ZpJ1xuICAgICAqICAgICAgUi5oZWFkKFtdKTsgLy89PiB1bmRlZmluZWRcbiAgICAgKlxuICAgICAqICAgICAgUi5oZWFkKCdhYmMnKTsgLy89PiAnYSdcbiAgICAgKiAgICAgIFIuaGVhZCgnJyk7IC8vPT4gJydcbiAgICAgKi9cbiAgICB2YXIgaGVhZCA9IG50aCgwKTtcblxuICAgIC8qKlxuICAgICAqIENvbWJpbmVzIHR3byBsaXN0cyBpbnRvIGEgc2V0IChpLmUuIG5vIGR1cGxpY2F0ZXMpIGNvbXBvc2VkIG9mIHRob3NlXG4gICAgICogZWxlbWVudHMgY29tbW9uIHRvIGJvdGggbGlzdHMuICBEdXBsaWNhdGlvbiBpcyBkZXRlcm1pbmVkIGFjY29yZGluZ1xuICAgICAqIHRvIHRoZSB2YWx1ZSByZXR1cm5lZCBieSBhcHBseWluZyB0aGUgc3VwcGxpZWQgcHJlZGljYXRlIHRvIHR3byBsaXN0XG4gICAgICogZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyAoYSxhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZCBBIHByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hldGhlclxuICAgICAqICAgICAgICB0aGUgdHdvIHN1cHBsaWVkIGVsZW1lbnRzIGFyZSBlcXVhbC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0MSBPbmUgbGlzdCBvZiBpdGVtcyB0byBjb21wYXJlXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDIgQSBzZWNvbmQgbGlzdCBvZiBpdGVtcyB0byBjb21wYXJlXG4gICAgICogQHNlZSBSLmludGVyc2VjdGlvblxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhvc2UgZWxlbWVudHMgY29tbW9uIHRvIGJvdGggbGlzdHMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGJ1ZmZhbG9TcHJpbmdmaWVsZCA9IFtcbiAgICAgKiAgICAgICAge2lkOiA4MjQsIG5hbWU6ICdSaWNoaWUgRnVyYXknfSxcbiAgICAgKiAgICAgICAge2lkOiA5NTYsIG5hbWU6ICdEZXdleSBNYXJ0aW4nfSxcbiAgICAgKiAgICAgICAge2lkOiAzMTMsIG5hbWU6ICdCcnVjZSBQYWxtZXInfSxcbiAgICAgKiAgICAgICAge2lkOiA0NTYsIG5hbWU6ICdTdGVwaGVuIFN0aWxscyd9LFxuICAgICAqICAgICAgICB7aWQ6IDE3NywgbmFtZTogJ05laWwgWW91bmcnfVxuICAgICAqICAgICAgXTtcbiAgICAgKiAgICAgIHZhciBjc255ID0gW1xuICAgICAqICAgICAgICB7aWQ6IDIwNCwgbmFtZTogJ0RhdmlkIENyb3NieSd9LFxuICAgICAqICAgICAgICB7aWQ6IDQ1NiwgbmFtZTogJ1N0ZXBoZW4gU3RpbGxzJ30sXG4gICAgICogICAgICAgIHtpZDogNTM5LCBuYW1lOiAnR3JhaGFtIE5hc2gnfSxcbiAgICAgKiAgICAgICAge2lkOiAxNzcsIG5hbWU6ICdOZWlsIFlvdW5nJ31cbiAgICAgKiAgICAgIF07XG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzYW1lSWQgPSBmdW5jdGlvbihvMSwgbzIpIHtyZXR1cm4gbzEuaWQgPT09IG8yLmlkO307XG4gICAgICpcbiAgICAgKiAgICAgIFIuaW50ZXJzZWN0aW9uV2l0aChzYW1lSWQsIGJ1ZmZhbG9TcHJpbmdmaWVsZCwgY3NueSk7XG4gICAgICogICAgICAvLz0+IFt7aWQ6IDQ1NiwgbmFtZTogJ1N0ZXBoZW4gU3RpbGxzJ30sIHtpZDogMTc3LCBuYW1lOiAnTmVpbCBZb3VuZyd9XVxuICAgICAqL1xuICAgIHZhciBpbnRlcnNlY3Rpb25XaXRoID0gX2N1cnJ5MyhmdW5jdGlvbiBpbnRlcnNlY3Rpb25XaXRoKHByZWQsIGxpc3QxLCBsaXN0Mikge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdLCBpZHggPSAwO1xuICAgICAgICB3aGlsZSAoaWR4IDwgbGlzdDEubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoX2NvbnRhaW5zV2l0aChwcmVkLCBsaXN0MVtpZHhdLCBsaXN0MikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoXSA9IGxpc3QxW2lkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5pcVdpdGgocHJlZCwgcmVzdWx0cyk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGxpc3Qgd2l0aCB0aGUgc2VwYXJhdG9yIGludGVycG9zZWQgYmV0d2VlbiBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgYSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHsqfSBzZXBhcmF0b3IgVGhlIGVsZW1lbnQgdG8gYWRkIHRvIHRoZSBsaXN0LlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gYmUgaW50ZXJwb3NlZC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIG5ldyBsaXN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaW50ZXJzcGVyc2UoJ24nLCBbJ2JhJywgJ2EnLCAnYSddKTsgLy89PiBbJ2JhJywgJ24nLCAnYScsICduJywgJ2EnXVxuICAgICAqL1xuICAgIHZhciBpbnRlcnNwZXJzZSA9IF9jdXJyeTIoX2NoZWNrRm9yTWV0aG9kKCdpbnRlcnNwZXJzZScsIGZ1bmN0aW9uIGludGVyc3BlcnNlKHNlcGFyYXRvciwgbGlzdCkge1xuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChpZHggPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBvdXQucHVzaChsaXN0W2lkeF0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQucHVzaChsaXN0W2lkeF0sIHNlcGFyYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0pKTtcblxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybXMgdGhlIGl0ZW1zIG9mIHRoZSBsaXN0IHdpdGggdGhlIHRyYW5zZHVjZXIgYW5kIGFwcGVuZHMgdGhlIHRyYW5zZm9ybWVkIGl0ZW1zIHRvXG4gICAgICogdGhlIGFjY3VtdWxhdG9yIHVzaW5nIGFuIGFwcHJvcHJpYXRlIGl0ZXJhdG9yIGZ1bmN0aW9uIGJhc2VkIG9uIHRoZSBhY2N1bXVsYXRvciB0eXBlLlxuICAgICAqXG4gICAgICogVGhlIGFjY3VtdWxhdG9yIGNhbiBiZSBhbiBhcnJheSwgc3RyaW5nLCBvYmplY3Qgb3IgYSB0cmFuc2Zvcm1lci4gSXRlcmF0ZWQgaXRlbXMgd2lsbFxuICAgICAqIGJlIGFwcGVuZGVkIHRvIGFycmF5cyBhbmQgY29uY2F0ZW5hdGVkIHRvIHN0cmluZ3MuIE9iamVjdHMgd2lsbCBiZSBtZXJnZWQgZGlyZWN0bHkgb3IgMi1pdGVtXG4gICAgICogYXJyYXlzIHdpbGwgYmUgbWVyZ2VkIGFzIGtleSwgdmFsdWUgcGFpcnMuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjdW11bGF0b3IgY2FuIGFsc28gYmUgYSB0cmFuc2Zvcm1lciBvYmplY3QgdGhhdCBwcm92aWRlcyBhIDItYXJpdHkgcmVkdWNpbmcgaXRlcmF0b3JcbiAgICAgKiBmdW5jdGlvbiwgc3RlcCwgMC1hcml0eSBpbml0aWFsIHZhbHVlIGZ1bmN0aW9uLCBpbml0LCBhbmQgMS1hcml0eSByZXN1bHQgZXh0cmFjdGlvbiBmdW5jdGlvblxuICAgICAqIHJlc3VsdC4gVGhlIHN0ZXAgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgaXRlcmF0b3IgZnVuY3Rpb24gaW4gcmVkdWNlLiBUaGUgcmVzdWx0IGZ1bmN0aW9uIGlzXG4gICAgICogdXNlZCB0byBjb252ZXJ0IHRoZSBmaW5hbCBhY2N1bXVsYXRvciBpbnRvIHRoZSByZXR1cm4gdHlwZSBhbmQgaW4gbW9zdCBjYXNlcyBpcyBSLmlkZW50aXR5LlxuICAgICAqIFRoZSBpbml0IGZ1bmN0aW9uIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgaW5pdGlhbCBhY2N1bXVsYXRvci5cbiAgICAgKlxuICAgICAqIFRoZSBpdGVyYXRpb24gaXMgcGVyZm9ybWVkIHdpdGggUi5yZWR1Y2UgYWZ0ZXIgaW5pdGlhbGl6aW5nIHRoZSB0cmFuc2R1Y2VyLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBhIC0+IChiIC0+IGIpIC0+IFtjXSAtPiBhXG4gICAgICogQHBhcmFtIHsqfSBhY2MgVGhlIGluaXRpYWwgYWNjdW11bGF0b3IgdmFsdWUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0geGYgVGhlIHRyYW5zZHVjZXIgZnVuY3Rpb24uIFJlY2VpdmVzIGEgdHJhbnNmb3JtZXIgYW5kIHJldHVybnMgYSB0cmFuc2Zvcm1lci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgZmluYWwsIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBudW1iZXJzID0gWzEsIDIsIDMsIDRdO1xuICAgICAqICAgICAgdmFyIHRyYW5zZHVjZXIgPSBSLmNvbXBvc2UoUi5tYXAoUi5hZGQoMSkpLCBSLnRha2UoMikpO1xuICAgICAqXG4gICAgICogICAgICBSLmludG8oW10sIHRyYW5zZHVjZXIsIG51bWJlcnMpOyAvLz0+IFsyLCAzXVxuICAgICAqXG4gICAgICogICAgICB2YXIgaW50b0FycmF5ID0gUi5pbnRvKFtdKTtcbiAgICAgKiAgICAgIGludG9BcnJheSh0cmFuc2R1Y2VyLCBudW1iZXJzKTsgLy89PiBbMiwgM11cbiAgICAgKi9cbiAgICB2YXIgaW50byA9IF9jdXJyeTMoZnVuY3Rpb24gaW50byhhY2MsIHhmLCBsaXN0KSB7XG4gICAgICAgIHJldHVybiBfaXNUcmFuc2Zvcm1lcihhY2MpID8gX3JlZHVjZSh4ZihhY2MpLCBhY2NbJ0BAdHJhbnNkdWNlci9pbml0J10oKSwgbGlzdCkgOiBfcmVkdWNlKHhmKF9zdGVwQ2F0KGFjYykpLCBhY2MsIGxpc3QpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU2FtZSBhcyBSLmludmVydE9iaiwgaG93ZXZlciB0aGlzIGFjY291bnRzIGZvciBvYmplY3RzXG4gICAgICogd2l0aCBkdXBsaWNhdGUgdmFsdWVzIGJ5IHB1dHRpbmcgdGhlIHZhbHVlcyBpbnRvIGFuXG4gICAgICogYXJyYXkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzaWcge3M6IHh9IC0+IHt4OiBbIHMsIC4uLiBdfVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCBvciBhcnJheSB0byBpbnZlcnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IG91dCBBIG5ldyBvYmplY3Qgd2l0aCBrZXlzXG4gICAgICogaW4gYW4gYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHJhY2VSZXN1bHRzQnlGaXJzdE5hbWUgPSB7XG4gICAgICogICAgICAgIGZpcnN0OiAnYWxpY2UnLFxuICAgICAqICAgICAgICBzZWNvbmQ6ICdqYWtlJyxcbiAgICAgKiAgICAgICAgdGhpcmQ6ICdhbGljZScsXG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgUi5pbnZlcnQocmFjZVJlc3VsdHNCeUZpcnN0TmFtZSk7XG4gICAgICogICAgICAvLz0+IHsgJ2FsaWNlJzogWydmaXJzdCcsICd0aGlyZCddLCAnamFrZSc6WydzZWNvbmQnXSB9XG4gICAgICovXG4gICAgdmFyIGludmVydCA9IF9jdXJyeTEoZnVuY3Rpb24gaW52ZXJ0KG9iaikge1xuICAgICAgICB2YXIgcHJvcHMgPSBrZXlzKG9iaik7XG4gICAgICAgIHZhciBsZW4gPSBwcm9wcy5sZW5ndGg7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgb3V0ID0ge307XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wc1tpZHhdO1xuICAgICAgICAgICAgdmFyIHZhbCA9IG9ialtrZXldO1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBfaGFzKHZhbCwgb3V0KSA/IG91dFt2YWxdIDogb3V0W3ZhbF0gPSBbXTtcbiAgICAgICAgICAgIGxpc3RbbGlzdC5sZW5ndGhdID0ga2V5O1xuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgb2JqZWN0IHdpdGggdGhlIGtleXMgb2YgdGhlIGdpdmVuIG9iamVjdFxuICAgICAqIGFzIHZhbHVlcywgYW5kIHRoZSB2YWx1ZXMgb2YgdGhlIGdpdmVuIG9iamVjdCBhcyBrZXlzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtzOiB4fSAtPiB7eDogc31cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3Qgb3IgYXJyYXkgdG8gaW52ZXJ0XG4gICAgICogQHJldHVybiB7T2JqZWN0fSBvdXQgQSBuZXcgb2JqZWN0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHJhY2VSZXN1bHRzID0ge1xuICAgICAqICAgICAgICBmaXJzdDogJ2FsaWNlJyxcbiAgICAgKiAgICAgICAgc2Vjb25kOiAnamFrZSdcbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICBSLmludmVydE9iaihyYWNlUmVzdWx0cyk7XG4gICAgICogICAgICAvLz0+IHsgJ2FsaWNlJzogJ2ZpcnN0JywgJ2pha2UnOidzZWNvbmQnIH1cbiAgICAgKlxuICAgICAqICAgICAgLy8gQWx0ZXJuYXRpdmVseTpcbiAgICAgKiAgICAgIHZhciByYWNlUmVzdWx0cyA9IFsnYWxpY2UnLCAnamFrZSddO1xuICAgICAqICAgICAgUi5pbnZlcnRPYmoocmFjZVJlc3VsdHMpO1xuICAgICAqICAgICAgLy89PiB7ICdhbGljZSc6ICcwJywgJ2pha2UnOicxJyB9XG4gICAgICovXG4gICAgdmFyIGludmVydE9iaiA9IF9jdXJyeTEoZnVuY3Rpb24gaW52ZXJ0T2JqKG9iaikge1xuICAgICAgICB2YXIgcHJvcHMgPSBrZXlzKG9iaik7XG4gICAgICAgIHZhciBsZW4gPSBwcm9wcy5sZW5ndGg7XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgb3V0ID0ge307XG4gICAgICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wc1tpZHhdO1xuICAgICAgICAgICAgb3V0W29ialtrZXldXSA9IGtleTtcbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGdpdmVuIGxpc3Qgb3Igc3RyaW5nLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNlZSBSLmluaXQsIFIuaGVhZCwgUi50YWlsXG4gICAgICogQHNpZyBbYV0gLT4gYSB8IFVuZGVmaW5lZFxuICAgICAqIEBzaWcgU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gbGlzdFxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5sYXN0KFsnZmknLCAnZm8nLCAnZnVtJ10pOyAvLz0+ICdmdW0nXG4gICAgICogICAgICBSLmxhc3QoW10pOyAvLz0+IHVuZGVmaW5lZFxuICAgICAqXG4gICAgICogICAgICBSLmxhc3QoJ2FiYycpOyAvLz0+ICdjJ1xuICAgICAqICAgICAgUi5sYXN0KCcnKTsgLy89PiAnJ1xuICAgICAqL1xuICAgIHZhciBsYXN0ID0gbnRoKC0xKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpblxuICAgICAqIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAgICAqIGBSLmVxdWFsc2AgaXMgdXNlZCB0byBkZXRlcm1pbmUgZXF1YWxpdHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIGEgLT4gW2FdIC0+IE51bWJlclxuICAgICAqIEBwYXJhbSB7Kn0gdGFyZ2V0IFRoZSBpdGVtIHRvIGZpbmQuXG4gICAgICogQHBhcmFtIHtBcnJheX0geHMgVGhlIGFycmF5IHRvIHNlYXJjaCBpbi5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBpbmRleCBvZiB0aGUgdGFyZ2V0LCBvciAtMSBpZiB0aGUgdGFyZ2V0IGlzIG5vdCBmb3VuZC5cbiAgICAgKiBAc2VlIFIuaW5kZXhPZlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubGFzdEluZGV4T2YoMywgWy0xLDMsMywwLDEsMiwzLDRdKTsgLy89PiA2XG4gICAgICogICAgICBSLmxhc3RJbmRleE9mKDEwLCBbMSwyLDMsNF0pOyAvLz0+IC0xXG4gICAgICovXG4gICAgdmFyIGxhc3RJbmRleE9mID0gX2N1cnJ5MihmdW5jdGlvbiBsYXN0SW5kZXhPZih0YXJnZXQsIHhzKSB7XG4gICAgICAgIGlmIChfaGFzTWV0aG9kKCdsYXN0SW5kZXhPZicsIHhzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHhzLmxhc3RJbmRleE9mKHRhcmdldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0geHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChpZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChlcXVhbHMoeHNbaWR4XSwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWR4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0LCBjb25zdHJ1Y3RlZCBieSBhcHBseWluZyB0aGUgc3VwcGxpZWQgZnVuY3Rpb24gdG8gZXZlcnkgZWxlbWVudCBvZiB0aGVcbiAgICAgKiBzdXBwbGllZCBsaXN0LlxuICAgICAqXG4gICAgICogTm90ZTogYFIubWFwYCBkb2VzIG5vdCBza2lwIGRlbGV0ZWQgb3IgdW5hc3NpZ25lZCBpbmRpY2VzIChzcGFyc2UgYXJyYXlzKSwgdW5saWtlIHRoZVxuICAgICAqIG5hdGl2ZSBgQXJyYXkucHJvdG90eXBlLm1hcGAgbWV0aG9kLiBGb3IgbW9yZSBkZXRhaWxzIG9uIHRoaXMgYmVoYXZpb3IsIHNlZTpcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9tYXAjRGVzY3JpcHRpb25cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IGIpIC0+IFthXSAtPiBbYl1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGV2ZXJ5IGVsZW1lbnQgb2YgdGhlIGlucHV0IGBsaXN0YC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGJlIGl0ZXJhdGVkIG92ZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBuZXcgbGlzdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgZG91YmxlID0gZnVuY3Rpb24oeCkge1xuICAgICAqICAgICAgICByZXR1cm4geCAqIDI7XG4gICAgICogICAgICB9O1xuICAgICAqXG4gICAgICogICAgICBSLm1hcChkb3VibGUsIFsxLCAyLCAzXSk7IC8vPT4gWzIsIDQsIDZdXG4gICAgICovXG4gICAgdmFyIG1hcCA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnbWFwJywgX3htYXAsIF9tYXApKTtcblxuICAgIC8qKlxuICAgICAqIE1hcCwgYnV0IGZvciBvYmplY3RzLiBDcmVhdGVzIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIGtleXMgYXMgYG9iamAgYW5kIHZhbHVlc1xuICAgICAqIGdlbmVyYXRlZCBieSBydW5uaW5nIGVhY2ggcHJvcGVydHkgb2YgYG9iamAgdGhyb3VnaCBgZm5gLiBgZm5gIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6XG4gICAgICogKih2YWx1ZSkqLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnICh2IC0+IHYpIC0+IHtrOiB2fSAtPiB7azogdn1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIGNhbGxlZCBmb3IgZWFjaCBwcm9wZXJ0eSBpbiBgb2JqYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAgICogYmVjb21lIGEgbmV3IHByb3BlcnR5IG9uIHRoZSByZXR1cm4gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyBvYmplY3Qgd2l0aCB0aGUgc2FtZSBrZXlzIGFzIGBvYmpgIGFuZCB2YWx1ZXMgdGhhdCBhcmUgdGhlIHJlc3VsdFxuICAgICAqICAgICAgICAgb2YgcnVubmluZyBlYWNoIHByb3BlcnR5IHRocm91Z2ggYGZuYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgdmFsdWVzID0geyB4OiAxLCB5OiAyLCB6OiAzIH07XG4gICAgICogICAgICB2YXIgZG91YmxlID0gZnVuY3Rpb24obnVtKSB7XG4gICAgICogICAgICAgIHJldHVybiBudW0gKiAyO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgUi5tYXBPYmooZG91YmxlLCB2YWx1ZXMpOyAvLz0+IHsgeDogMiwgeTogNCwgejogNiB9XG4gICAgICovXG4gICAgdmFyIG1hcE9iaiA9IF9jdXJyeTIoZnVuY3Rpb24gbWFwT2JqKGZuLCBvYmopIHtcbiAgICAgICAgcmV0dXJuIF9yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgICAgICBhY2Nba2V5XSA9IGZuKG9ialtrZXldKTtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9LCBrZXlzKG9iaikpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogTGlrZSBgbWFwT2JqYCwgYnV0IGJ1dCBwYXNzZXMgYWRkaXRpb25hbCBhcmd1bWVudHMgdG8gdGhlIHByZWRpY2F0ZSBmdW5jdGlvbi4gVGhlXG4gICAgICogcHJlZGljYXRlIGZ1bmN0aW9uIGlzIHBhc3NlZCB0aHJlZSBhcmd1bWVudHM6ICoodmFsdWUsIGtleSwgb2JqKSouXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBzaWcgKHYsIGssIHtrOiB2fSAtPiB2KSAtPiB7azogdn0gLT4ge2s6IHZ9XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiBjYWxsZWQgZm9yIGVhY2ggcHJvcGVydHkgaW4gYG9iamAuIEl0cyByZXR1cm4gdmFsdWUgd2lsbFxuICAgICAqICAgICAgICBiZWNvbWUgYSBuZXcgcHJvcGVydHkgb24gdGhlIHJldHVybiBvYmplY3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IG9iamVjdCB3aXRoIHRoZSBzYW1lIGtleXMgYXMgYG9iamAgYW5kIHZhbHVlcyB0aGF0IGFyZSB0aGUgcmVzdWx0XG4gICAgICogICAgICAgICBvZiBydW5uaW5nIGVhY2ggcHJvcGVydHkgdGhyb3VnaCBgZm5gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB2YWx1ZXMgPSB7IHg6IDEsIHk6IDIsIHo6IDMgfTtcbiAgICAgKiAgICAgIHZhciBwcmVwZW5kS2V5QW5kRG91YmxlID0gZnVuY3Rpb24obnVtLCBrZXksIG9iaikge1xuICAgICAqICAgICAgICByZXR1cm4ga2V5ICsgKG51bSAqIDIpO1xuICAgICAqICAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICAgUi5tYXBPYmpJbmRleGVkKHByZXBlbmRLZXlBbmREb3VibGUsIHZhbHVlcyk7IC8vPT4geyB4OiAneDInLCB5OiAneTQnLCB6OiAnejYnIH1cbiAgICAgKi9cbiAgICB2YXIgbWFwT2JqSW5kZXhlZCA9IF9jdXJyeTIoZnVuY3Rpb24gbWFwT2JqSW5kZXhlZChmbiwgb2JqKSB7XG4gICAgICAgIHJldHVybiBfcmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICAgICAgYWNjW2tleV0gPSBmbihvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30sIGtleXMob2JqKSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBubyBlbGVtZW50cyBvZiB0aGUgbGlzdCBtYXRjaCB0aGUgcHJlZGljYXRlLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBCb29sZWFuKSAtPiBbYV0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gY29uc2lkZXIuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBwcmVkaWNhdGUgaXMgbm90IHNhdGlzZmllZCBieSBldmVyeSBlbGVtZW50LCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAc2VlIFIuYWxsLCBSLmFueVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubm9uZShSLmlzTmFOLCBbMSwgMiwgM10pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIubm9uZShSLmlzTmFOLCBbMSwgMiwgMywgTmFOXSk7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgbm9uZSA9IF9jdXJyeTIoX2NvbXBsZW1lbnQoX2Rpc3BhdGNoYWJsZSgnYW55JywgX3hhbnksIGFueSkpKTtcblxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBmaXJzdCB0cnV0aHkgb2YgdHdvIGFyZ3VtZW50cyBvdGhlcndpc2UgdGhlXG4gICAgICogbGFzdCBhcmd1bWVudC4gTm90ZSB0aGF0IHRoaXMgaXMgTk9UIHNob3J0LWNpcmN1aXRlZCwgbWVhbmluZyB0aGF0IGlmXG4gICAgICogZXhwcmVzc2lvbnMgYXJlIHBhc3NlZCB0aGV5IGFyZSBib3RoIGV2YWx1YXRlZC5cbiAgICAgKlxuICAgICAqIERpc3BhdGNoZXMgdG8gdGhlIGBvcmAgbWV0aG9kIG9mIHRoZSBmaXJzdCBhcmd1bWVudCBpZiBhcHBsaWNhYmxlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMb2dpY1xuICAgICAqIEBzaWcgKiAtPiAqIC0+ICpcbiAgICAgKiBAcGFyYW0geyp9IGEgYW55IHZhbHVlXG4gICAgICogQHBhcmFtIHsqfSBiIGFueSBvdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm4geyp9IHRoZSBmaXJzdCB0cnV0aHkgYXJndW1lbnQsIG90aGVyd2lzZSB0aGUgbGFzdCBhcmd1bWVudC5cbiAgICAgKiBAc2VlIFIuZWl0aGVyXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5vcihmYWxzZSwgdHJ1ZSk7IC8vPT4gdHJ1ZVxuICAgICAqICAgICAgUi5vcigwLCBbXSk7IC8vPT4gW11cbiAgICAgKiAgICAgIFIub3IobnVsbCwgJycpOyA9PiAnJ1xuICAgICAqL1xuICAgIHZhciBvciA9IF9jdXJyeTIoZnVuY3Rpb24gb3IoYSwgYikge1xuICAgICAgICByZXR1cm4gX2hhc01ldGhvZCgnb3InLCBhKSA/IGEub3IoYikgOiBhIHx8IGI7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBY2NlcHRzIGFzIGl0cyBhcmd1bWVudHMgYSBmdW5jdGlvbiBhbmQgYW55IG51bWJlciBvZiB2YWx1ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0LFxuICAgICAqIHdoZW4gaW52b2tlZCwgY2FsbHMgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggYWxsIG9mIHRoZSB2YWx1ZXMgcHJlcGVuZGVkIHRvIHRoZVxuICAgICAqIG9yaWdpbmFsIGZ1bmN0aW9uJ3MgYXJndW1lbnRzIGxpc3QuIEluIHNvbWUgbGlicmFyaWVzIHRoaXMgZnVuY3Rpb24gaXMgbmFtZWQgYGFwcGx5TGVmdGAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoYSAtPiBiIC0+IC4uLiAtPiBpIC0+IGogLT4gLi4uIC0+IG0gLT4gbikgLT4gYSAtPiBiLT4gLi4uIC0+IGkgLT4gKGogLT4gLi4uIC0+IG0gLT4gbilcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIEFyZ3VtZW50cyB0byBwcmVwZW5kIHRvIGBmbmAgd2hlbiB0aGUgcmV0dXJuZWQgZnVuY3Rpb24gaXMgaW52b2tlZC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24gd3JhcHBpbmcgYGZuYC4gV2hlbiBpbnZva2VkLCBpdCB3aWxsIGNhbGwgYGZuYFxuICAgICAqICAgICAgICAgd2l0aCBgYXJnc2AgcHJlcGVuZGVkIHRvIGBmbmAncyBhcmd1bWVudHMgbGlzdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgbXVsdGlwbHkgPSBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhICogYjsgfTtcbiAgICAgKiAgICAgIHZhciBkb3VibGUgPSBSLnBhcnRpYWwobXVsdGlwbHksIDIpO1xuICAgICAqICAgICAgZG91YmxlKDIpOyAvLz0+IDRcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGdyZWV0ID0gZnVuY3Rpb24oc2FsdXRhdGlvbiwgdGl0bGUsIGZpcnN0TmFtZSwgbGFzdE5hbWUpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIHNhbHV0YXRpb24gKyAnLCAnICsgdGl0bGUgKyAnICcgKyBmaXJzdE5hbWUgKyAnICcgKyBsYXN0TmFtZSArICchJztcbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICB2YXIgc2F5SGVsbG8gPSBSLnBhcnRpYWwoZ3JlZXQsICdIZWxsbycpO1xuICAgICAqICAgICAgdmFyIHNheUhlbGxvVG9NcyA9IFIucGFydGlhbChzYXlIZWxsbywgJ01zLicpO1xuICAgICAqICAgICAgc2F5SGVsbG9Ub01zKCdKYW5lJywgJ0pvbmVzJyk7IC8vPT4gJ0hlbGxvLCBNcy4gSmFuZSBKb25lcyEnXG4gICAgICovXG4gICAgdmFyIHBhcnRpYWwgPSBjdXJyeShfY3JlYXRlUGFydGlhbEFwcGxpY2F0b3IoX2NvbmNhdCkpO1xuXG4gICAgLyoqXG4gICAgICogQWNjZXB0cyBhcyBpdHMgYXJndW1lbnRzIGEgZnVuY3Rpb24gYW5kIGFueSBudW1iZXIgb2YgdmFsdWVzIGFuZCByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCxcbiAgICAgKiB3aGVuIGludm9rZWQsIGNhbGxzIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIGFsbCBvZiB0aGUgdmFsdWVzIGFwcGVuZGVkIHRvIHRoZSBvcmlnaW5hbFxuICAgICAqIGZ1bmN0aW9uJ3MgYXJndW1lbnRzIGxpc3QuXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgYHBhcnRpYWxSaWdodGAgaXMgdGhlIG9wcG9zaXRlIG9mIGBwYXJ0aWFsYDogYHBhcnRpYWxSaWdodGAgZmlsbHMgYGZuYCdzIGFyZ3VtZW50c1xuICAgICAqIGZyb20gdGhlIHJpZ2h0IHRvIHRoZSBsZWZ0LiAgSW4gc29tZSBsaWJyYXJpZXMgdGhpcyBmdW5jdGlvbiBpcyBuYW1lZCBgYXBwbHlSaWdodGAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoYSAtPiBiLT4gLi4uIC0+IGkgLT4gaiAtPiAuLi4gLT4gbSAtPiBuKSAtPiBqIC0+IC4uLiAtPiBtIC0+IG4gLT4gKGEgLT4gYi0+IC4uLiAtPiBpKVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnc10gQXJndW1lbnRzIHRvIGFwcGVuZCB0byBgZm5gIHdoZW4gdGhlIHJldHVybmVkIGZ1bmN0aW9uIGlzIGludm9rZWQuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIGBmbmAuIFdoZW4gaW52b2tlZCwgaXQgd2lsbCBjYWxsIGBmbmAgd2l0aFxuICAgICAqICAgICAgICAgYGFyZ3NgIGFwcGVuZGVkIHRvIGBmbmAncyBhcmd1bWVudHMgbGlzdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgZ3JlZXQgPSBmdW5jdGlvbihzYWx1dGF0aW9uLCB0aXRsZSwgZmlyc3ROYW1lLCBsYXN0TmFtZSkge1xuICAgICAqICAgICAgICByZXR1cm4gc2FsdXRhdGlvbiArICcsICcgKyB0aXRsZSArICcgJyArIGZpcnN0TmFtZSArICcgJyArIGxhc3ROYW1lICsgJyEnO1xuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIHZhciBncmVldE1zSmFuZUpvbmVzID0gUi5wYXJ0aWFsUmlnaHQoZ3JlZXQsICdNcy4nLCAnSmFuZScsICdKb25lcycpO1xuICAgICAqXG4gICAgICogICAgICBncmVldE1zSmFuZUpvbmVzKCdIZWxsbycpOyAvLz0+ICdIZWxsbywgTXMuIEphbmUgSm9uZXMhJ1xuICAgICAqL1xuICAgIHZhciBwYXJ0aWFsUmlnaHQgPSBjdXJyeShfY3JlYXRlUGFydGlhbEFwcGxpY2F0b3IoZmxpcChfY29uY2F0KSkpO1xuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBwcmVkaWNhdGUgYW5kIGEgbGlzdCBhbmQgcmV0dXJucyB0aGUgcGFpciBvZiBsaXN0cyBvZlxuICAgICAqIGVsZW1lbnRzIHdoaWNoIGRvIGFuZCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLCByZXNwZWN0aXZlbHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbW2FdLFthXV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIHRvIGRldGVybWluZSB3aGljaCBhcnJheSB0aGUgZWxlbWVudCBiZWxvbmdzIHRvLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIHBhcnRpdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQSBuZXN0ZWQgYXJyYXksIGNvbnRhaW5pbmcgZmlyc3QgYW4gYXJyYXkgb2YgZWxlbWVudHMgdGhhdCBzYXRpc2ZpZWQgdGhlIHByZWRpY2F0ZSxcbiAgICAgKiAgICAgICAgIGFuZCBzZWNvbmQgYW4gYXJyYXkgb2YgZWxlbWVudHMgdGhhdCBkaWQgbm90IHNhdGlzZnkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5wYXJ0aXRpb24oUi5jb250YWlucygncycpLCBbJ3NzcycsICd0dHQnLCAnZm9vJywgJ2JhcnMnXSk7XG4gICAgICogICAgICAvLz0+IFsgWyAnc3NzJywgJ2JhcnMnIF0sICBbICd0dHQnLCAnZm9vJyBdIF1cbiAgICAgKi9cbiAgICB2YXIgcGFydGl0aW9uID0gX2N1cnJ5MihmdW5jdGlvbiBwYXJ0aXRpb24ocHJlZCwgbGlzdCkge1xuICAgICAgICByZXR1cm4gX3JlZHVjZShmdW5jdGlvbiAoYWNjLCBlbHQpIHtcbiAgICAgICAgICAgIHZhciB4cyA9IGFjY1twcmVkKGVsdCkgPyAwIDogMV07XG4gICAgICAgICAgICB4c1t4cy5sZW5ndGhdID0gZWx0O1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW1xuICAgICAgICAgICAgW10sXG4gICAgICAgICAgICBbXVxuICAgICAgICBdLCBsaXN0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBhIG5lc3RlZCBwYXRoIG9uIGFuIG9iamVjdCBoYXMgYSBzcGVjaWZpYyB2YWx1ZSxcbiAgICAgKiBpbiBgUi5lcXVhbHNgIHRlcm1zLiBNb3N0IGxpa2VseSB1c2VkIHRvIGZpbHRlciBhIGxpc3QuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gICAgICogQHNpZyBbU3RyaW5nXSAtPiAqIC0+IHtTdHJpbmc6ICp9IC0+IEJvb2xlYW5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBuZXN0ZWQgcHJvcGVydHkgdG8gdXNlXG4gICAgICogQHBhcmFtIHsqfSB2YWwgVGhlIHZhbHVlIHRvIGNvbXBhcmUgdGhlIG5lc3RlZCBwcm9wZXJ0eSB3aXRoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGNoZWNrIHRoZSBuZXN0ZWQgcHJvcGVydHkgaW5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGVxdWFscyB0aGUgbmVzdGVkIG9iamVjdCBwcm9wZXJ0eSxcbiAgICAgKiAgICAgICAgIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB1c2VyMSA9IHsgYWRkcmVzczogeyB6aXBDb2RlOiA5MDIxMCB9IH07XG4gICAgICogICAgICB2YXIgdXNlcjIgPSB7IGFkZHJlc3M6IHsgemlwQ29kZTogNTU1NTUgfSB9O1xuICAgICAqICAgICAgdmFyIHVzZXIzID0geyBuYW1lOiAnQm9iJyB9O1xuICAgICAqICAgICAgdmFyIHVzZXJzID0gWyB1c2VyMSwgdXNlcjIsIHVzZXIzIF07XG4gICAgICogICAgICB2YXIgaXNGYW1vdXMgPSBSLnBhdGhFcShbJ2FkZHJlc3MnLCAnemlwQ29kZSddLCA5MDIxMCk7XG4gICAgICogICAgICBSLmZpbHRlcihpc0ZhbW91cywgdXNlcnMpOyAvLz0+IFsgdXNlcjEgXVxuICAgICAqL1xuICAgIHZhciBwYXRoRXEgPSBfY3VycnkzKGZ1bmN0aW9uIHBhdGhFcShfcGF0aCwgdmFsLCBvYmopIHtcbiAgICAgICAgcmV0dXJuIGVxdWFscyhwYXRoKF9wYXRoLCBvYmopLCB2YWwpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGJ5IHBsdWNraW5nIHRoZSBzYW1lIG5hbWVkIHByb3BlcnR5IG9mZiBhbGwgb2JqZWN0cyBpbiB0aGUgbGlzdCBzdXBwbGllZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgayAtPiBbe2s6IHZ9XSAtPiBbdl1cbiAgICAgKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IGtleSBUaGUga2V5IG5hbWUgdG8gcGx1Y2sgb2ZmIG9mIGVhY2ggb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgbGlzdCBvZiB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBrZXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5wbHVjaygnYScpKFt7YTogMX0sIHthOiAyfV0pOyAvLz0+IFsxLCAyXVxuICAgICAqICAgICAgUi5wbHVjaygwKShbWzEsIDJdLCBbMywgNF1dKTsgICAvLz0+IFsxLCAzXVxuICAgICAqL1xuICAgIHZhciBwbHVjayA9IF9jdXJyeTIoZnVuY3Rpb24gcGx1Y2socCwgbGlzdCkge1xuICAgICAgICByZXR1cm4gbWFwKHByb3AocCksIGxpc3QpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgcHJvcGVydHkgaXMgZXF1YWwsIGluIGBSLmVxdWFsc2BcbiAgICAgKiB0ZXJtcywgdG8gdGhlIGdpdmVuIHZhbHVlOyBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIFN0cmluZyAtPiBhIC0+IE9iamVjdCAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0geyp9IHZhbFxuICAgICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAc2VlIFIuZXF1YWxzLCBSLnByb3BTYXRpc2ZpZXNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgYWJieSA9IHtuYW1lOiAnQWJieScsIGFnZTogNywgaGFpcjogJ2Jsb25kJ307XG4gICAgICogICAgICB2YXIgZnJlZCA9IHtuYW1lOiAnRnJlZCcsIGFnZTogMTIsIGhhaXI6ICdicm93bid9O1xuICAgICAqICAgICAgdmFyIHJ1c3R5ID0ge25hbWU6ICdSdXN0eScsIGFnZTogMTAsIGhhaXI6ICdicm93bid9O1xuICAgICAqICAgICAgdmFyIGFsb2lzID0ge25hbWU6ICdBbG9pcycsIGFnZTogMTUsIGRpc3Bvc2l0aW9uOiAnc3VybHknfTtcbiAgICAgKiAgICAgIHZhciBraWRzID0gW2FiYnksIGZyZWQsIHJ1c3R5LCBhbG9pc107XG4gICAgICogICAgICB2YXIgaGFzQnJvd25IYWlyID0gUi5wcm9wRXEoJ2hhaXInLCAnYnJvd24nKTtcbiAgICAgKiAgICAgIFIuZmlsdGVyKGhhc0Jyb3duSGFpciwga2lkcyk7IC8vPT4gW2ZyZWQsIHJ1c3R5XVxuICAgICAqL1xuICAgIHZhciBwcm9wRXEgPSBfY3VycnkzKGZ1bmN0aW9uIHByb3BFcShuYW1lLCB2YWwsIG9iaikge1xuICAgICAgICByZXR1cm4gcHJvcFNhdGlzZmllcyhlcXVhbHModmFsKSwgbmFtZSwgb2JqKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBzcGVjaWZpZWQgb2JqZWN0IHByb3BlcnR5IGlzIG9mIHRoZSBnaXZlbiB0eXBlO1xuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBUeXBlXG4gICAgICogQHNpZyBUeXBlIC0+IFN0cmluZyAtPiBPYmplY3QgLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHR5cGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAc2VlIFIuaXNcbiAgICAgKiBAc2VlIFIucHJvcFNhdGlzZmllc1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIucHJvcElzKE51bWJlciwgJ3gnLCB7eDogMSwgeTogMn0pOyAgLy89PiB0cnVlXG4gICAgICogICAgICBSLnByb3BJcyhOdW1iZXIsICd4Jywge3g6ICdmb28nfSk7ICAgIC8vPT4gZmFsc2VcbiAgICAgKiAgICAgIFIucHJvcElzKE51bWJlciwgJ3gnLCB7fSk7ICAgICAgICAgICAgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciBwcm9wSXMgPSBfY3VycnkzKGZ1bmN0aW9uIHByb3BJcyh0eXBlLCBuYW1lLCBvYmopIHtcbiAgICAgICAgcmV0dXJuIHByb3BTYXRpc2ZpZXMoaXModHlwZSksIG5hbWUsIG9iaik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc2luZ2xlIGl0ZW0gYnkgaXRlcmF0aW5nIHRocm91Z2ggdGhlIGxpc3QsIHN1Y2Nlc3NpdmVseSBjYWxsaW5nIHRoZSBpdGVyYXRvclxuICAgICAqIGZ1bmN0aW9uIGFuZCBwYXNzaW5nIGl0IGFuIGFjY3VtdWxhdG9yIHZhbHVlIGFuZCB0aGUgY3VycmVudCB2YWx1ZSBmcm9tIHRoZSBhcnJheSwgYW5kXG4gICAgICogdGhlbiBwYXNzaW5nIHRoZSByZXN1bHQgdG8gdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiByZWNlaXZlcyB0d28gdmFsdWVzOiAqKGFjYywgdmFsdWUpKi4gIEl0IG1heSB1c2UgYFIucmVkdWNlZGAgdG9cbiAgICAgKiBzaG9ydGN1dCB0aGUgaXRlcmF0aW9uLlxuICAgICAqXG4gICAgICogTm90ZTogYFIucmVkdWNlYCBkb2VzIG5vdCBza2lwIGRlbGV0ZWQgb3IgdW5hc3NpZ25lZCBpbmRpY2VzIChzcGFyc2UgYXJyYXlzKSwgdW5saWtlXG4gICAgICogdGhlIG5hdGl2ZSBgQXJyYXkucHJvdG90eXBlLnJlZHVjZWAgbWV0aG9kLiBGb3IgbW9yZSBkZXRhaWxzIG9uIHRoaXMgYmVoYXZpb3IsIHNlZTpcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9yZWR1Y2UjRGVzY3JpcHRpb25cbiAgICAgKiBAc2VlIFIucmVkdWNlZFxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSxiIC0+IGEpIC0+IGEgLT4gW2JdIC0+IGFcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgaXRlcmF0b3IgZnVuY3Rpb24uIFJlY2VpdmVzIHR3byB2YWx1ZXMsIHRoZSBhY2N1bXVsYXRvciBhbmQgdGhlXG4gICAgICogICAgICAgIGN1cnJlbnQgZWxlbWVudCBmcm9tIHRoZSBhcnJheS5cbiAgICAgKiBAcGFyYW0geyp9IGFjYyBUaGUgYWNjdW11bGF0b3IgdmFsdWUuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgbGlzdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIGZpbmFsLCBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgbnVtYmVycyA9IFsxLCAyLCAzXTtcbiAgICAgKiAgICAgIHZhciBhZGQgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICogICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIFIucmVkdWNlKGFkZCwgMTAsIG51bWJlcnMpOyAvLz0+IDE2XG4gICAgICovXG4gICAgdmFyIHJlZHVjZSA9IF9jdXJyeTMoX3JlZHVjZSk7XG5cbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIHRvIGBmaWx0ZXJgLCBleGNlcHQgdGhhdCBpdCBrZWVwcyBvbmx5IHZhbHVlcyBmb3Igd2hpY2ggdGhlIGdpdmVuIHByZWRpY2F0ZVxuICAgICAqIGZ1bmN0aW9uIHJldHVybnMgZmFsc3kuIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24gaXMgcGFzc2VkIG9uZSBhcmd1bWVudDogKih2YWx1ZSkqLlxuICAgICAqXG4gICAgICogQWN0cyBhcyBhIHRyYW5zZHVjZXIgaWYgYSB0cmFuc2Zvcm1lciBpcyBnaXZlbiBpbiBsaXN0IHBvc2l0aW9uLlxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgKGEgLT4gQm9vbGVhbikgLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAgICAgKiBAc2VlIFIuZmlsdGVyXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGlzT2RkID0gZnVuY3Rpb24obikge1xuICAgICAqICAgICAgICByZXR1cm4gbiAlIDIgPT09IDE7XG4gICAgICogICAgICB9O1xuICAgICAqICAgICAgUi5yZWplY3QoaXNPZGQsIFsxLCAyLCAzLCA0XSk7IC8vPT4gWzIsIDRdXG4gICAgICovXG4gICAgdmFyIHJlamVjdCA9IF9jdXJyeTIoZnVuY3Rpb24gcmVqZWN0KGZuLCBsaXN0KSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXIoX2NvbXBsZW1lbnQoZm4pLCBsaXN0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmaXhlZCBsaXN0IG9mIHNpemUgYG5gIGNvbnRhaW5pbmcgYSBzcGVjaWZpZWQgaWRlbnRpY2FsIHZhbHVlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBhIC0+IG4gLT4gW2FdXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmVwZWF0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuIFRoZSBkZXNpcmVkIHNpemUgb2YgdGhlIG91dHB1dCBsaXN0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIG5ldyBhcnJheSBjb250YWluaW5nIGBuYCBgdmFsdWVgcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnJlcGVhdCgnaGknLCA1KTsgLy89PiBbJ2hpJywgJ2hpJywgJ2hpJywgJ2hpJywgJ2hpJ11cbiAgICAgKlxuICAgICAqICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAqICAgICAgdmFyIHJlcGVhdGVkT2JqcyA9IFIucmVwZWF0KG9iaiwgNSk7IC8vPT4gW3t9LCB7fSwge30sIHt9LCB7fV1cbiAgICAgKiAgICAgIHJlcGVhdGVkT2Jqc1swXSA9PT0gcmVwZWF0ZWRPYmpzWzFdOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgcmVwZWF0ID0gX2N1cnJ5MihmdW5jdGlvbiByZXBlYXQodmFsdWUsIG4pIHtcbiAgICAgICAgcmV0dXJuIHRpbWVzKGFsd2F5cyh2YWx1ZSksIG4pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZWxlbWVudHMgb2YgdGhlIGdpdmVuIGxpc3Qgb3Igc3RyaW5nIChvciBvYmplY3Qgd2l0aCBhIGBzbGljZWBcbiAgICAgKiBtZXRob2QpIGZyb20gYGZyb21JbmRleGAgKGluY2x1c2l2ZSkgdG8gYHRvSW5kZXhgIChleGNsdXNpdmUpLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAc2lnIE51bWJlciAtPiBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBmcm9tSW5kZXggVGhlIHN0YXJ0IGluZGV4IChpbmNsdXNpdmUpLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0b0luZGV4IFRoZSBlbmQgaW5kZXggKGV4Y2x1c2l2ZSkuXG4gICAgICogQHBhcmFtIHsqfSBsaXN0XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnNsaWNlKDEsIDMsIFsnYScsICdiJywgJ2MnLCAnZCddKTsgICAgICAgIC8vPT4gWydiJywgJ2MnXVxuICAgICAqICAgICAgUi5zbGljZSgxLCBJbmZpbml0eSwgWydhJywgJ2InLCAnYycsICdkJ10pOyAvLz0+IFsnYicsICdjJywgJ2QnXVxuICAgICAqICAgICAgUi5zbGljZSgwLCAtMSwgWydhJywgJ2InLCAnYycsICdkJ10pOyAgICAgICAvLz0+IFsnYScsICdiJywgJ2MnXVxuICAgICAqICAgICAgUi5zbGljZSgtMywgLTEsIFsnYScsICdiJywgJ2MnLCAnZCddKTsgICAgICAvLz0+IFsnYicsICdjJ11cbiAgICAgKiAgICAgIFIuc2xpY2UoMCwgMywgJ3JhbWRhJyk7ICAgICAgICAgICAgICAgICAgICAgLy89PiAncmFtJ1xuICAgICAqL1xuICAgIHZhciBzbGljZSA9IF9jdXJyeTMoX2NoZWNrRm9yTWV0aG9kKCdzbGljZScsIGZ1bmN0aW9uIHNsaWNlKGZyb21JbmRleCwgdG9JbmRleCwgbGlzdCkge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobGlzdCwgZnJvbUluZGV4LCB0b0luZGV4KTtcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdHMgYSBjb2xsZWN0aW9uIGludG8gc2xpY2VzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gW2FdIC0+IFtbYV1dXG4gICAgICogQHNpZyBOdW1iZXIgLT4gU3RyaW5nIC0+IFtTdHJpbmddXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0XG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5zcGxpdEV2ZXJ5KDMsIFsxLCAyLCAzLCA0LCA1LCA2LCA3XSk7IC8vPT4gW1sxLCAyLCAzXSwgWzQsIDUsIDZdLCBbN11dXG4gICAgICogICAgICBSLnNwbGl0RXZlcnkoMywgJ2Zvb2JhcmJheicpOyAvLz0+IFsnZm9vJywgJ2JhcicsICdiYXonXVxuICAgICAqL1xuICAgIHZhciBzcGxpdEV2ZXJ5ID0gX2N1cnJ5MihmdW5jdGlvbiBzcGxpdEV2ZXJ5KG4sIGxpc3QpIHtcbiAgICAgICAgaWYgKG4gPD0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBzcGxpdEV2ZXJ5IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChzbGljZShpZHgsIGlkeCArPSBuLCBsaXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdG9nZXRoZXIgYWxsIHRoZSBlbGVtZW50cyBvZiBhIGxpc3QuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE1hdGhcbiAgICAgKiBAc2lnIFtOdW1iZXJdIC0+IE51bWJlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgQW4gYXJyYXkgb2YgbnVtYmVyc1xuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHN1bSBvZiBhbGwgdGhlIG51bWJlcnMgaW4gdGhlIGxpc3QuXG4gICAgICogQHNlZSBSLnJlZHVjZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuc3VtKFsyLDQsNiw4LDEwMCwxXSk7IC8vPT4gMTIxXG4gICAgICovXG4gICAgdmFyIHN1bSA9IHJlZHVjZShhZGQsIDApO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0IG9yIHN0cmluZyAob3Igb2JqZWN0XG4gICAgICogd2l0aCBhIGB0YWlsYCBtZXRob2QpLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNlZSBSLmhlYWQsIFIuaW5pdCwgUi5sYXN0XG4gICAgICogQHNpZyBbYV0gLT4gW2FdXG4gICAgICogQHNpZyBTdHJpbmcgLT4gU3RyaW5nXG4gICAgICogQHBhcmFtIHsqfSBsaXN0XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnRhaWwoWzEsIDIsIDNdKTsgIC8vPT4gWzIsIDNdXG4gICAgICogICAgICBSLnRhaWwoWzEsIDJdKTsgICAgIC8vPT4gWzJdXG4gICAgICogICAgICBSLnRhaWwoWzFdKTsgICAgICAgIC8vPT4gW11cbiAgICAgKiAgICAgIFIudGFpbChbXSk7ICAgICAgICAgLy89PiBbXVxuICAgICAqXG4gICAgICogICAgICBSLnRhaWwoJ2FiYycpOyAgLy89PiAnYmMnXG4gICAgICogICAgICBSLnRhaWwoJ2FiJyk7ICAgLy89PiAnYidcbiAgICAgKiAgICAgIFIudGFpbCgnYScpOyAgICAvLz0+ICcnXG4gICAgICogICAgICBSLnRhaWwoJycpOyAgICAgLy89PiAnJ1xuICAgICAqL1xuICAgIHZhciB0YWlsID0gX2NoZWNrRm9yTWV0aG9kKCd0YWlsJywgc2xpY2UoMSwgSW5maW5pdHkpKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGBuYCBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gbGlzdCwgc3RyaW5nLCBvclxuICAgICAqIHRyYW5zZHVjZXIvdHJhbnNmb3JtZXIgKG9yIG9iamVjdCB3aXRoIGEgYHRha2VgIG1ldGhvZCkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIE51bWJlciAtPiBbYV0gLT4gW2FdXG4gICAgICogQHNpZyBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gICAgICogQHBhcmFtIHsqfSBsaXN0XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAc2VlIFIuZHJvcFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudGFrZSgxLCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9vJ11cbiAgICAgKiAgICAgIFIudGFrZSgyLCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9vJywgJ2JhciddXG4gICAgICogICAgICBSLnRha2UoMywgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbJ2ZvbycsICdiYXInLCAnYmF6J11cbiAgICAgKiAgICAgIFIudGFrZSg0LCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9vJywgJ2JhcicsICdiYXonXVxuICAgICAqICAgICAgUi50YWtlKDMsICdyYW1kYScpOyAgICAgICAgICAgICAgIC8vPT4gJ3JhbSdcbiAgICAgKlxuICAgICAqICAgICAgdmFyIHBlcnNvbm5lbCA9IFtcbiAgICAgKiAgICAgICAgJ0RhdmUgQnJ1YmVjaycsXG4gICAgICogICAgICAgICdQYXVsIERlc21vbmQnLFxuICAgICAqICAgICAgICAnRXVnZW5lIFdyaWdodCcsXG4gICAgICogICAgICAgICdKb2UgTW9yZWxsbycsXG4gICAgICogICAgICAgICdHZXJyeSBNdWxsaWdhbicsXG4gICAgICogICAgICAgICdCb2IgQmF0ZXMnLFxuICAgICAqICAgICAgICAnSm9lIERvZGdlJyxcbiAgICAgKiAgICAgICAgJ1JvbiBDcm90dHknXG4gICAgICogICAgICBdO1xuICAgICAqXG4gICAgICogICAgICB2YXIgdGFrZUZpdmUgPSBSLnRha2UoNSk7XG4gICAgICogICAgICB0YWtlRml2ZShwZXJzb25uZWwpO1xuICAgICAqICAgICAgLy89PiBbJ0RhdmUgQnJ1YmVjaycsICdQYXVsIERlc21vbmQnLCAnRXVnZW5lIFdyaWdodCcsICdKb2UgTW9yZWxsbycsICdHZXJyeSBNdWxsaWdhbiddXG4gICAgICovXG4gICAgdmFyIHRha2UgPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ3Rha2UnLCBfeHRha2UsIGZ1bmN0aW9uIHRha2UobiwgeHMpIHtcbiAgICAgICAgcmV0dXJuIHNsaWNlKDAsIG4gPCAwID8gSW5maW5pdHkgOiBuLCB4cyk7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIGZpcnN0IGBuYCBlbGVtZW50cyBvZiBhIGdpdmVuIGxpc3QsIHBhc3NpbmcgZWFjaCB2YWx1ZVxuICAgICAqIHRvIHRoZSBzdXBwbGllZCBwcmVkaWNhdGUgZnVuY3Rpb24sIGFuZCB0ZXJtaW5hdGluZyB3aGVuIHRoZSBwcmVkaWNhdGUgZnVuY3Rpb24gcmV0dXJuc1xuICAgICAqIGBmYWxzZWAuIEV4Y2x1ZGVzIHRoZSBlbGVtZW50IHRoYXQgY2F1c2VkIHRoZSBwcmVkaWNhdGUgZnVuY3Rpb24gdG8gZmFpbC4gVGhlIHByZWRpY2F0ZVxuICAgICAqIGZ1bmN0aW9uIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6ICoodmFsdWUpKi5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgbmV3IGFycmF5LlxuICAgICAqIEBzZWUgUi5kcm9wV2hpbGVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgaXNOb3RGb3VyID0gZnVuY3Rpb24oeCkge1xuICAgICAqICAgICAgICByZXR1cm4gISh4ID09PSA0KTtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIFIudGFrZVdoaWxlKGlzTm90Rm91ciwgWzEsIDIsIDMsIDRdKTsgLy89PiBbMSwgMiwgM11cbiAgICAgKi9cbiAgICB2YXIgdGFrZVdoaWxlID0gX2N1cnJ5MihfZGlzcGF0Y2hhYmxlKCd0YWtlV2hpbGUnLCBfeHRha2VXaGlsZSwgZnVuY3Rpb24gdGFrZVdoaWxlKGZuLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbiAmJiBmbihsaXN0W2lkeF0pKSB7XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3NsaWNlKGxpc3QsIDAsIGlkeCk7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSB0cmFuc2R1Y2VyIHVzaW5nIHN1cHBsaWVkIGl0ZXJhdG9yIGZ1bmN0aW9uLiBSZXR1cm5zIGEgc2luZ2xlIGl0ZW0gYnlcbiAgICAgKiBpdGVyYXRpbmcgdGhyb3VnaCB0aGUgbGlzdCwgc3VjY2Vzc2l2ZWx5IGNhbGxpbmcgdGhlIHRyYW5zZm9ybWVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFuZFxuICAgICAqIHBhc3NpbmcgaXQgYW4gYWNjdW11bGF0b3IgdmFsdWUgYW5kIHRoZSBjdXJyZW50IHZhbHVlIGZyb20gdGhlIGFycmF5LCBhbmQgdGhlbiBwYXNzaW5nXG4gICAgICogdGhlIHJlc3VsdCB0byB0aGUgbmV4dCBjYWxsLlxuICAgICAqXG4gICAgICogVGhlIGl0ZXJhdG9yIGZ1bmN0aW9uIHJlY2VpdmVzIHR3byB2YWx1ZXM6ICooYWNjLCB2YWx1ZSkqLiBJdCB3aWxsIGJlIHdyYXBwZWQgYXMgYVxuICAgICAqIHRyYW5zZm9ybWVyIHRvIGluaXRpYWxpemUgdGhlIHRyYW5zZHVjZXIuIEEgdHJhbnNmb3JtZXIgY2FuIGJlIHBhc3NlZCBkaXJlY3RseSBpbiBwbGFjZVxuICAgICAqIG9mIGFuIGl0ZXJhdG9yIGZ1bmN0aW9uLiAgSW4gYm90aCBjYXNlcywgaXRlcmF0aW9uIG1heSBiZSBzdG9wcGVkIGVhcmx5IHdpdGggdGhlXG4gICAgICogYFIucmVkdWNlZGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBBIHRyYW5zZHVjZXIgaXMgYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSB0cmFuc2Zvcm1lciBhbmQgcmV0dXJucyBhIHRyYW5zZm9ybWVyIGFuZCBjYW5cbiAgICAgKiBiZSBjb21wb3NlZCBkaXJlY3RseS5cbiAgICAgKlxuICAgICAqIEEgdHJhbnNmb3JtZXIgaXMgYW4gYW4gb2JqZWN0IHRoYXQgcHJvdmlkZXMgYSAyLWFyaXR5IHJlZHVjaW5nIGl0ZXJhdG9yIGZ1bmN0aW9uLCBzdGVwLFxuICAgICAqIDAtYXJpdHkgaW5pdGlhbCB2YWx1ZSBmdW5jdGlvbiwgaW5pdCwgYW5kIDEtYXJpdHkgcmVzdWx0IGV4dHJhY3Rpb24gZnVuY3Rpb24sIHJlc3VsdC5cbiAgICAgKiBUaGUgc3RlcCBmdW5jdGlvbiBpcyB1c2VkIGFzIHRoZSBpdGVyYXRvciBmdW5jdGlvbiBpbiByZWR1Y2UuIFRoZSByZXN1bHQgZnVuY3Rpb24gaXMgdXNlZFxuICAgICAqIHRvIGNvbnZlcnQgdGhlIGZpbmFsIGFjY3VtdWxhdG9yIGludG8gdGhlIHJldHVybiB0eXBlIGFuZCBpbiBtb3N0IGNhc2VzIGlzIFIuaWRlbnRpdHkuXG4gICAgICogVGhlIGluaXQgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSBhbiBpbml0aWFsIGFjY3VtdWxhdG9yLCBidXQgaXMgaWdub3JlZCBieSB0cmFuc2R1Y2UuXG4gICAgICpcbiAgICAgKiBUaGUgaXRlcmF0aW9uIGlzIHBlcmZvcm1lZCB3aXRoIFIucmVkdWNlIGFmdGVyIGluaXRpYWxpemluZyB0aGUgdHJhbnNkdWNlci5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzZWUgUi5yZWR1Y2UsIFIucmVkdWNlZCwgUi5pbnRvXG4gICAgICogQHNpZyAoYyAtPiBjKSAtPiAoYSxiIC0+IGEpIC0+IGEgLT4gW2JdIC0+IGFcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB4ZiBUaGUgdHJhbnNkdWNlciBmdW5jdGlvbi4gUmVjZWl2ZXMgYSB0cmFuc2Zvcm1lciBhbmQgcmV0dXJucyBhIHRyYW5zZm9ybWVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBpdGVyYXRvciBmdW5jdGlvbi4gUmVjZWl2ZXMgdHdvIHZhbHVlcywgdGhlIGFjY3VtdWxhdG9yIGFuZCB0aGVcbiAgICAgKiAgICAgICAgY3VycmVudCBlbGVtZW50IGZyb20gdGhlIGFycmF5LiBXcmFwcGVkIGFzIHRyYW5zZm9ybWVyLCBpZiBuZWNlc3NhcnksIGFuZCB1c2VkIHRvXG4gICAgICogICAgICAgIGluaXRpYWxpemUgdGhlIHRyYW5zZHVjZXJcbiAgICAgKiBAcGFyYW0geyp9IGFjYyBUaGUgaW5pdGlhbCBhY2N1bXVsYXRvciB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgZmluYWwsIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBudW1iZXJzID0gWzEsIDIsIDMsIDRdO1xuICAgICAqICAgICAgdmFyIHRyYW5zZHVjZXIgPSBSLmNvbXBvc2UoUi5tYXAoUi5hZGQoMSkpLCBSLnRha2UoMikpO1xuICAgICAqXG4gICAgICogICAgICBSLnRyYW5zZHVjZSh0cmFuc2R1Y2VyLCBSLmZsaXAoUi5hcHBlbmQpLCBbXSwgbnVtYmVycyk7IC8vPT4gWzIsIDNdXG4gICAgICovXG4gICAgdmFyIHRyYW5zZHVjZSA9IGN1cnJ5Tig0LCBmdW5jdGlvbiB0cmFuc2R1Y2UoeGYsIGZuLCBhY2MsIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIF9yZWR1Y2UoeGYodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nID8gX3h3cmFwKGZuKSA6IGZuKSwgYWNjLCBsaXN0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENvbWJpbmVzIHR3byBsaXN0cyBpbnRvIGEgc2V0IChpLmUuIG5vIGR1cGxpY2F0ZXMpIGNvbXBvc2VkIG9mIHRoZSBlbGVtZW50cyBvZiBlYWNoIGxpc3QuICBEdXBsaWNhdGlvbiBpc1xuICAgICAqIGRldGVybWluZWQgYWNjb3JkaW5nIHRvIHRoZSB2YWx1ZSByZXR1cm5lZCBieSBhcHBseWluZyB0aGUgc3VwcGxpZWQgcHJlZGljYXRlIHRvIHR3byBsaXN0IGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBSZWxhdGlvblxuICAgICAqIEBzaWcgKGEsYSAtPiBCb29sZWFuKSAtPiBbYV0gLT4gW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWQgQSBwcmVkaWNhdGUgdXNlZCB0byB0ZXN0IHdoZXRoZXIgdHdvIGl0ZW1zIGFyZSBlcXVhbC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0MSBUaGUgZmlyc3QgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0MiBUaGUgc2Vjb25kIGxpc3QuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBmaXJzdCBhbmQgc2Vjb25kIGxpc3RzIGNvbmNhdGVuYXRlZCwgd2l0aFxuICAgICAqICAgICAgICAgZHVwbGljYXRlcyByZW1vdmVkLlxuICAgICAqIEBzZWUgUi51bmlvblxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIGZ1bmN0aW9uIGNtcCh4LCB5KSB7IHJldHVybiB4LmEgPT09IHkuYTsgfVxuICAgICAqICAgICAgdmFyIGwxID0gW3thOiAxfSwge2E6IDJ9XTtcbiAgICAgKiAgICAgIHZhciBsMiA9IFt7YTogMX0sIHthOiA0fV07XG4gICAgICogICAgICBSLnVuaW9uV2l0aChjbXAsIGwxLCBsMik7IC8vPT4gW3thOiAxfSwge2E6IDJ9LCB7YTogNH1dXG4gICAgICovXG4gICAgdmFyIHVuaW9uV2l0aCA9IF9jdXJyeTMoZnVuY3Rpb24gdW5pb25XaXRoKHByZWQsIGxpc3QxLCBsaXN0Mikge1xuICAgICAgICByZXR1cm4gdW5pcVdpdGgocHJlZCwgX2NvbmNhdChsaXN0MSwgbGlzdDIpKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgbGlzdCBjb250YWluaW5nIG9ubHkgb25lIGNvcHkgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBvcmlnaW5hbCBsaXN0LlxuICAgICAqIGBSLmVxdWFsc2AgaXMgdXNlZCB0byBkZXRlcm1pbmUgZXF1YWxpdHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGxpc3Qgb2YgdW5pcXVlIGl0ZW1zLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudW5pcShbMSwgMSwgMiwgMV0pOyAvLz0+IFsxLCAyXVxuICAgICAqICAgICAgUi51bmlxKFsxLCAnMSddKTsgICAgIC8vPT4gWzEsICcxJ11cbiAgICAgKiAgICAgIFIudW5pcShbWzQyXSwgWzQyXV0pOyAvLz0+IFtbNDJdXVxuICAgICAqL1xuICAgIHZhciB1bmlxID0gdW5pcVdpdGgoZXF1YWxzKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgbGlzdCBieSBwdWxsaW5nIGV2ZXJ5IGl0ZW0gYXQgdGhlIGZpcnN0IGxldmVsIG9mIG5lc3Rpbmcgb3V0LCBhbmQgcHV0dGluZ1xuICAgICAqIHRoZW0gaW4gYSBuZXcgYXJyYXkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIFthXSAtPiBbYl1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGZsYXR0ZW5lZCBsaXN0LlxuICAgICAqIEBzZWUgUi5mbGF0dGVuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi51bm5lc3QoWzEsIFsyXSwgW1szXV1dKTsgLy89PiBbMSwgMiwgWzNdXVxuICAgICAqICAgICAgUi51bm5lc3QoW1sxLCAyXSwgWzMsIDRdLCBbNSwgNl1dKTsgLy89PiBbMSwgMiwgMywgNCwgNSwgNl1cbiAgICAgKi9cbiAgICB2YXIgdW5uZXN0ID0gX2N1cnJ5MShfbWFrZUZsYXQoZmFsc2UpKTtcblxuICAgIC8qKlxuICAgICAqIEFjY2VwdHMgYSBmdW5jdGlvbiBgZm5gIGFuZCBhbnkgbnVtYmVyIG9mIHRyYW5zZm9ybWVyIGZ1bmN0aW9ucyBhbmQgcmV0dXJucyBhIG5ld1xuICAgICAqIGZ1bmN0aW9uLiBXaGVuIHRoZSBuZXcgZnVuY3Rpb24gaXMgaW52b2tlZCwgaXQgY2FsbHMgdGhlIGZ1bmN0aW9uIGBmbmAgd2l0aCBwYXJhbWV0ZXJzXG4gICAgICogY29uc2lzdGluZyBvZiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgZWFjaCBzdXBwbGllZCBoYW5kbGVyIG9uIHN1Y2Nlc3NpdmUgYXJndW1lbnRzIHRvIHRoZVxuICAgICAqIG5ldyBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIElmIG1vcmUgYXJndW1lbnRzIGFyZSBwYXNzZWQgdG8gdGhlIHJldHVybmVkIGZ1bmN0aW9uIHRoYW4gdHJhbnNmb3JtZXIgZnVuY3Rpb25zLCB0aG9zZVxuICAgICAqIGFyZ3VtZW50cyBhcmUgcGFzc2VkIGRpcmVjdGx5IHRvIGBmbmAgYXMgYWRkaXRpb25hbCBwYXJhbWV0ZXJzLiBJZiB5b3UgZXhwZWN0IGFkZGl0aW9uYWxcbiAgICAgKiBhcmd1bWVudHMgdGhhdCBkb24ndCBuZWVkIHRvIGJlIHRyYW5zZm9ybWVkLCBhbHRob3VnaCB5b3UgY2FuIGlnbm9yZSB0aGVtLCBpdCdzIGJlc3QgdG9cbiAgICAgKiBwYXNzIGFuIGlkZW50aXR5IGZ1bmN0aW9uIHNvIHRoYXQgdGhlIG5ldyBmdW5jdGlvbiByZXBvcnRzIHRoZSBjb3JyZWN0IGFyaXR5LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgKHgxIC0+IHgyIC0+IC4uLiAtPiB6KSAtPiAoKGEgLT4geDEpLCAoYiAtPiB4MiksIC4uLikgLT4gKGEgLT4gYiAtPiAuLi4gLT4geilcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSB0cmFuc2Zvcm1lcnMgQSB2YXJpYWJsZSBudW1iZXIgb2YgdHJhbnNmb3JtZXIgZnVuY3Rpb25zXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBkb3VibGUgPSBmdW5jdGlvbih5KSB7IHJldHVybiB5ICogMjsgfTtcbiAgICAgKiAgICAgIHZhciBzcXVhcmUgPSBmdW5jdGlvbih4KSB7IHJldHVybiB4ICogeDsgfTtcbiAgICAgKiAgICAgIHZhciBhZGQgPSBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhICsgYjsgfTtcbiAgICAgKiAgICAgIC8vIEFkZHMgYW55IG51bWJlciBvZiBhcmd1bWVudHMgdG9nZXRoZXJcbiAgICAgKiAgICAgIHZhciBhZGRBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIFIucmVkdWNlKGFkZCwgMCwgYXJndW1lbnRzKTtcbiAgICAgKiAgICAgIH07XG4gICAgICpcbiAgICAgKiAgICAgIC8vIEJhc2ljIGV4YW1wbGVcbiAgICAgKiAgICAgIHZhciBhZGREb3VibGVBbmRTcXVhcmUgPSBSLnVzZVdpdGgoYWRkQWxsLCBkb3VibGUsIHNxdWFyZSk7XG4gICAgICpcbiAgICAgKiAgICAgIC8v4omFIGFkZEFsbChkb3VibGUoMTApLCBzcXVhcmUoNSkpO1xuICAgICAqICAgICAgYWRkRG91YmxlQW5kU3F1YXJlKDEwLCA1KTsgLy89PiA0NVxuICAgICAqXG4gICAgICogICAgICAvLyBFeGFtcGxlIG9mIHBhc3NpbmcgbW9yZSBhcmd1bWVudHMgdGhhbiB0cmFuc2Zvcm1lcnNcbiAgICAgKiAgICAgIC8v4omFIGFkZEFsbChkb3VibGUoMTApLCBzcXVhcmUoNSksIDEwMCk7XG4gICAgICogICAgICBhZGREb3VibGVBbmRTcXVhcmUoMTAsIDUsIDEwMCk7IC8vPT4gMTQ1XG4gICAgICpcbiAgICAgKiAgICAgIC8vIElmIHRoZXJlIGFyZSBleHRyYSBfZXhwZWN0ZWRfIGFyZ3VtZW50cyB0aGF0IGRvbid0IG5lZWQgdG8gYmUgdHJhbnNmb3JtZWQsIGFsdGhvdWdoXG4gICAgICogICAgICAvLyB5b3UgY2FuIGlnbm9yZSB0aGVtLCBpdCBtaWdodCBiZSBiZXN0IHRvIHBhc3MgaW4gdGhlIGlkZW50aXR5IGZ1bmN0aW9uIHNvIHRoYXQgdGhlIG5ld1xuICAgICAqICAgICAgLy8gZnVuY3Rpb24gY29ycmVjdGx5IHJlcG9ydHMgYXJpdHkuXG4gICAgICogICAgICB2YXIgYWRkRG91YmxlQW5kU3F1YXJlV2l0aEV4dHJhUGFyYW1zID0gUi51c2VXaXRoKGFkZEFsbCwgZG91YmxlLCBzcXVhcmUsIFIuaWRlbnRpdHkpO1xuICAgICAqICAgICAgLy8gYWRkRG91YmxlQW5kU3F1YXJlV2l0aEV4dHJhUGFyYW1zLmxlbmd0aCAvLz0+IDNcbiAgICAgKiAgICAgIC8v4omFIGFkZEFsbChkb3VibGUoMTApLCBzcXVhcmUoNSksIFIuaWRlbnRpdHkoMTAwKSk7XG4gICAgICogICAgICBhZGREb3VibGVBbmRTcXVhcmUoMTAsIDUsIDEwMCk7IC8vPT4gMTQ1XG4gICAgICovXG4gICAgLyosIHRyYW5zZm9ybWVycyAqL1xuICAgIHZhciB1c2VXaXRoID0gY3VycnkoZnVuY3Rpb24gdXNlV2l0aChmbikge1xuICAgICAgICB2YXIgdHJhbnNmb3JtZXJzID0gX3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHZhciB0bGVuID0gdHJhbnNmb3JtZXJzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGN1cnJ5KF9hcml0eSh0bGVuLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdLCBpZHggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGlkeCA8IHRsZW4pIHtcbiAgICAgICAgICAgICAgICBhcmdzW2lkeF0gPSB0cmFuc2Zvcm1lcnNbaWR4XShhcmd1bWVudHNbaWR4XSk7XG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoX3NsaWNlKGFyZ3VtZW50cywgdGxlbikpKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBzcGVjIG9iamVjdCBhbmQgYSB0ZXN0IG9iamVjdDsgcmV0dXJucyB0cnVlIGlmIHRoZSB0ZXN0IHNhdGlzZmllc1xuICAgICAqIHRoZSBzcGVjLCBmYWxzZSBvdGhlcndpc2UuIEFuIG9iamVjdCBzYXRpc2ZpZXMgdGhlIHNwZWMgaWYsIGZvciBlYWNoIG9mIHRoZVxuICAgICAqIHNwZWMncyBvd24gcHJvcGVydGllcywgYWNjZXNzaW5nIHRoYXQgcHJvcGVydHkgb2YgdGhlIG9iamVjdCBnaXZlcyB0aGUgc2FtZVxuICAgICAqIHZhbHVlIChpbiBgUi5lcXVhbHNgIHRlcm1zKSBhcyBhY2Nlc3NpbmcgdGhhdCBwcm9wZXJ0eSBvZiB0aGUgc3BlYy5cbiAgICAgKlxuICAgICAqIGB3aGVyZUVxYCBpcyBhIHNwZWNpYWxpemF0aW9uIG9mIFtgd2hlcmVgXSgjd2hlcmUpLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIHtTdHJpbmc6ICp9IC0+IHtTdHJpbmc6ICp9IC0+IEJvb2xlYW5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3BlY1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0ZXN0T2JqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAc2VlIFIud2hlcmVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICAvLyBwcmVkIDo6IE9iamVjdCAtPiBCb29sZWFuXG4gICAgICogICAgICB2YXIgcHJlZCA9IFIud2hlcmVFcSh7YTogMSwgYjogMn0pO1xuICAgICAqXG4gICAgICogICAgICBwcmVkKHthOiAxfSk7ICAgICAgICAgICAgICAvLz0+IGZhbHNlXG4gICAgICogICAgICBwcmVkKHthOiAxLCBiOiAyfSk7ICAgICAgICAvLz0+IHRydWVcbiAgICAgKiAgICAgIHByZWQoe2E6IDEsIGI6IDIsIGM6IDN9KTsgIC8vPT4gdHJ1ZVxuICAgICAqICAgICAgcHJlZCh7YTogMSwgYjogMX0pOyAgICAgICAgLy89PiBmYWxzZVxuICAgICAqL1xuICAgIHZhciB3aGVyZUVxID0gX2N1cnJ5MihmdW5jdGlvbiB3aGVyZUVxKHNwZWMsIHRlc3RPYmopIHtcbiAgICAgICAgcmV0dXJuIHdoZXJlKG1hcE9iaihlcXVhbHMsIHNwZWMpLCB0ZXN0T2JqKTtcbiAgICB9KTtcblxuICAgIHZhciBfZmxhdENhdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXNlcnZpbmdSZWR1Y2VkID0gZnVuY3Rpb24gKHhmKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdAQHRyYW5zZHVjZXIvaW5pdCc6IF94ZkJhc2UuaW5pdCxcbiAgICAgICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10ocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdAQHRyYW5zZHVjZXIvc3RlcCc6IGZ1bmN0aW9uIChyZXN1bHQsIGlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXQgPSB4ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShyZXN1bHQsIGlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldFsnQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSA/IF9mb3JjZVJlZHVjZWQocmV0KSA6IHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gX3hjYXQoeGYpIHtcbiAgICAgICAgICAgIHZhciByeGYgPSBwcmVzZXJ2aW5nUmVkdWNlZCh4Zik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdAQHRyYW5zZHVjZXIvaW5pdCc6IF94ZkJhc2UuaW5pdCxcbiAgICAgICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ4ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnQEB0cmFuc2R1Y2VyL3N0ZXAnOiBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWlzQXJyYXlMaWtlKGlucHV0KSA/IF9yZWR1Y2UocnhmLCByZXN1bHQsIFtpbnB1dF0pIDogX3JlZHVjZShyeGYsIHJlc3VsdCwgaW5wdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSgpO1xuXG4gICAgdmFyIF9pbmRleE9mID0gZnVuY3Rpb24gX2luZGV4T2YobGlzdCwgaXRlbSwgZnJvbSkge1xuICAgICAgICB2YXIgaWR4ID0gZnJvbTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoZXF1YWxzKGxpc3RbaWR4XSwgaXRlbSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWR4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBwcmVkaWNhdGUgd3JhcHBlciB3aGljaCB3aWxsIGNhbGwgYSBwaWNrIGZ1bmN0aW9uIChhbGwvYW55KSBmb3IgZWFjaCBwcmVkaWNhdGVcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSBSLmFsbFxuICAgICAqIEBzZWUgUi5hbnlcbiAgICAgKi9cbiAgICAvLyBDYWxsIGZ1bmN0aW9uIGltbWVkaWF0ZWx5IGlmIGdpdmVuIGFyZ3VtZW50c1xuICAgIC8vIFJldHVybiBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgY2FsbCB0aGUgcHJlZGljYXRlcyB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgICB2YXIgX3ByZWRpY2F0ZVdyYXAgPSBmdW5jdGlvbiBfcHJlZGljYXRlV3JhcChwcmVkUGlja2VyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocHJlZHMpIHtcbiAgICAgICAgICAgIHZhciBwcmVkSXRlcmF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWRQaWNrZXIoZnVuY3Rpb24gKHByZWRpY2F0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlZGljYXRlLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0sIHByZWRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyAvLyBDYWxsIGZ1bmN0aW9uIGltbWVkaWF0ZWx5IGlmIGdpdmVuIGFyZ3VtZW50c1xuICAgICAgICAgICAgcHJlZEl0ZXJhdG9yLmFwcGx5KG51bGwsIF9zbGljZShhcmd1bWVudHMsIDEpKSA6IC8vIFJldHVybiBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgY2FsbCB0aGUgcHJlZGljYXRlcyB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgICAgICAgICAgIF9hcml0eShNYXRoLm1heC5hcHBseShNYXRoLCBwbHVjaygnbGVuZ3RoJywgcHJlZHMpKSwgcHJlZEl0ZXJhdG9yKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgdmFyIF94Y2hhaW4gPSBfY3VycnkyKGZ1bmN0aW9uIF94Y2hhaW4oZiwgeGYpIHtcbiAgICAgICAgcmV0dXJuIG1hcChmLCBfZmxhdENhdCh4ZikpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBsaXN0IG9mIHByZWRpY2F0ZXMsIHJldHVybnMgYSBuZXcgcHJlZGljYXRlIHRoYXQgd2lsbCBiZSB0cnVlIGV4YWN0bHkgd2hlbiBhbGwgb2YgdGhlbSBhcmUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyBbKCouLi4gLT4gQm9vbGVhbildIC0+ICgqLi4uIC0+IEJvb2xlYW4pXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBBbiBhcnJheSBvZiBwcmVkaWNhdGUgZnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHsqfSBvcHRpb25hbCBBbnkgYXJndW1lbnRzIHRvIHBhc3MgaW50byB0aGUgcHJlZGljYXRlc1xuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBpdHMgYXJndW1lbnRzIHRvIGVhY2ggb2ZcbiAgICAgKiAgICAgICAgIHRoZSBwcmVkaWNhdGVzLCByZXR1cm5pbmcgYHRydWVgIGlmIGFsbCBhcmUgc2F0aXNmaWVkLlxuICAgICAqIEBzZWUgUi5hbnlQYXNzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGd0MTAgPSBmdW5jdGlvbih4KSB7IHJldHVybiB4ID4gMTA7IH07XG4gICAgICogICAgICB2YXIgZXZlbiA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJSAyID09PSAwfTtcbiAgICAgKiAgICAgIHZhciBmID0gUi5hbGxQYXNzKFtndDEwLCBldmVuXSk7XG4gICAgICogICAgICBmKDExKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgZigxMik7IC8vPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBhbGxQYXNzID0gX2N1cnJ5MShfcHJlZGljYXRlV3JhcChhbGwpKTtcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgbGlzdCBvZiBwcmVkaWNhdGVzIHJldHVybnMgYSBuZXcgcHJlZGljYXRlIHRoYXQgd2lsbCBiZSB0cnVlIGV4YWN0bHkgd2hlbiBhbnkgb25lIG9mIHRoZW0gaXMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExvZ2ljXG4gICAgICogQHNpZyBbKCouLi4gLT4gQm9vbGVhbildIC0+ICgqLi4uIC0+IEJvb2xlYW4pXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBBbiBhcnJheSBvZiBwcmVkaWNhdGUgZnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHsqfSBvcHRpb25hbCBBbnkgYXJndW1lbnRzIHRvIHBhc3MgaW50byB0aGUgcHJlZGljYXRlc1xuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBpdHMgYXJndW1lbnRzIHRvIGVhY2ggb2YgdGhlIHByZWRpY2F0ZXMsIHJldHVybmluZ1xuICAgICAqICAgICAgICAgYHRydWVgIGlmIGFsbCBhcmUgc2F0aXNmaWVkLlxuICAgICAqIEBzZWUgUi5hbGxQYXNzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGd0MTAgPSBmdW5jdGlvbih4KSB7IHJldHVybiB4ID4gMTA7IH07XG4gICAgICogICAgICB2YXIgZXZlbiA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJSAyID09PSAwfTtcbiAgICAgKiAgICAgIHZhciBmID0gUi5hbnlQYXNzKFtndDEwLCBldmVuXSk7XG4gICAgICogICAgICBmKDExKTsgLy89PiB0cnVlXG4gICAgICogICAgICBmKDgpOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIGYoOSk7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgYW55UGFzcyA9IF9jdXJyeTEoX3ByZWRpY2F0ZVdyYXAoYW55KSk7XG5cbiAgICAvKipcbiAgICAgKiBhcCBhcHBsaWVzIGEgbGlzdCBvZiBmdW5jdGlvbnMgdG8gYSBsaXN0IG9mIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnIFtmXSAtPiBbYV0gLT4gW2YgYV1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBmbnMgQW4gYXJyYXkgb2YgZnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheX0gdnMgQW4gYXJyYXkgb2YgdmFsdWVzXG4gICAgICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIHJlc3VsdHMgb2YgYXBwbHlpbmcgZWFjaCBvZiBgZm5zYCB0byBhbGwgb2YgYHZzYCBpbiB0dXJuLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuYXAoW1IubXVsdGlwbHkoMiksIFIuYWRkKDMpXSwgWzEsMiwzXSk7IC8vPT4gWzIsIDQsIDYsIDQsIDUsIDZdXG4gICAgICovXG4gICAgdmFyIGFwID0gX2N1cnJ5MihmdW5jdGlvbiBhcChmbnMsIHZzKSB7XG4gICAgICAgIHJldHVybiBfaGFzTWV0aG9kKCdhcCcsIGZucykgPyBmbnMuYXAodnMpIDogX3JlZHVjZShmdW5jdGlvbiAoYWNjLCBmbikge1xuICAgICAgICAgICAgcmV0dXJuIF9jb25jYXQoYWNjLCBtYXAoZm4sIHZzKSk7XG4gICAgICAgIH0sIFtdLCBmbnMpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgaXRzIGZpcnN0IGFyZ3VtZW50IHdpdGggdGhlIHJlbWFpbmluZ1xuICAgICAqIGFyZ3VtZW50cy4gVGhpcyBpcyBvY2Nhc2lvbmFsbHkgdXNlZnVsIGFzIGEgY29udmVyZ2luZyBmdW5jdGlvbiBmb3JcbiAgICAgKiBgUi5jb252ZXJnZWA6IHRoZSBsZWZ0IGJyYW5jaCBjYW4gcHJvZHVjZSBhIGZ1bmN0aW9uIHdoaWxlIHRoZSByaWdodFxuICAgICAqIGJyYW5jaCBwcm9kdWNlcyBhIHZhbHVlIHRvIGJlIHBhc3NlZCB0byB0aGF0IGZ1bmN0aW9uIGFzIGFuIGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgKCouLi4gLT4gYSksKi4uLiAtPiBhXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIHRoZSByZW1haW5pbmcgYXJndW1lbnRzLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gYXJncyBBbnkgbnVtYmVyIG9mIHBvc2l0aW9uYWwgYXJndW1lbnRzLlxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQHNlZSBSLmFwcGx5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGluZGVudE4gPSBSLnBpcGUoUi50aW1lcyhSLmFsd2F5cygnICcpKSxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFIuam9pbignJyksXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBSLnJlcGxhY2UoL14oPyEkKS9nbSkpO1xuICAgICAqXG4gICAgICogICAgICB2YXIgZm9ybWF0ID0gUi5jb252ZXJnZShSLmNhbGwsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLnBpcGUoUi5wcm9wKCdpbmRlbnQnKSwgaW5kZW50TiksXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLnByb3AoJ3ZhbHVlJykpO1xuICAgICAqXG4gICAgICogICAgICBmb3JtYXQoe2luZGVudDogMiwgdmFsdWU6ICdmb29cXG5iYXJcXG5iYXpcXG4nfSk7IC8vPT4gJyAgZm9vXFxuICBiYXJcXG4gIGJhelxcbidcbiAgICAgKi9cbiAgICB2YXIgY2FsbCA9IGN1cnJ5KGZ1bmN0aW9uIGNhbGwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIF9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGBjaGFpbmAgbWFwcyBhIGZ1bmN0aW9uIG92ZXIgYSBsaXN0IGFuZCBjb25jYXRlbmF0ZXMgdGhlIHJlc3VsdHMuXG4gICAgICogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBjb21wYXRpYmxlIHdpdGggdGhlXG4gICAgICogRmFudGFzeS1sYW5kIENoYWluIHNwZWMsIGFuZCB3aWxsIHdvcmsgd2l0aCB0eXBlcyB0aGF0IGltcGxlbWVudCB0aGF0IHNwZWMuXG4gICAgICogYGNoYWluYCBpcyBhbHNvIGtub3duIGFzIGBmbGF0TWFwYCBpbiBzb21lIGxpYnJhcmllc1xuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBbYl0pIC0+IFthXSAtPiBbYl1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3RcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgZHVwbGljYXRlID0gZnVuY3Rpb24obikge1xuICAgICAqICAgICAgICByZXR1cm4gW24sIG5dO1xuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIFIuY2hhaW4oZHVwbGljYXRlLCBbMSwgMiwgM10pOyAvLz0+IFsxLCAxLCAyLCAyLCAzLCAzXVxuICAgICAqL1xuICAgIHZhciBjaGFpbiA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnY2hhaW4nLCBfeGNoYWluLCBmdW5jdGlvbiBjaGFpbihmbiwgbGlzdCkge1xuICAgICAgICByZXR1cm4gdW5uZXN0KG1hcChmbiwgbGlzdCkpO1xuICAgIH0pKTtcblxuICAgIC8qKlxuICAgICAqIFR1cm5zIGEgbGlzdCBvZiBGdW5jdG9ycyBpbnRvIGEgRnVuY3RvciBvZiBhIGxpc3QsIGFwcGx5aW5nXG4gICAgICogYSBtYXBwaW5nIGZ1bmN0aW9uIHRvIHRoZSBlbGVtZW50cyBvZiB0aGUgbGlzdCBhbG9uZyB0aGUgd2F5LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNlZSBSLmNvbW11dGVcbiAgICAgKiBAc2lnIEZ1bmN0b3IgZiA9PiAoZiBhIC0+IGYgYikgLT4gKHggLT4gZiB4KSAtPiBbZiBhXSAtPiBmIFtiXVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9mIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBkYXRhIHR5cGUgdG8gcmV0dXJuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBBbiBhcnJheSBvZiBmdW5jdG9ycyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmNvbW11dGVNYXAoUi5tYXAoUi5hZGQoMTApKSwgUi5vZiwgW1sxXSwgWzIsIDNdXSk7ICAgLy89PiBbWzExLCAxMl0sIFsxMSwgMTNdXVxuICAgICAqICAgICAgUi5jb21tdXRlTWFwKFIubWFwKFIuYWRkKDEwKSksIFIub2YsIFtbMSwgMl0sIFszXV0pOyAgIC8vPT4gW1sxMSwgMTNdLCBbMTIsIDEzXV1cbiAgICAgKiAgICAgIFIuY29tbXV0ZU1hcChSLm1hcChSLmFkZCgxMCkpLCBSLm9mLCBbWzFdLCBbMl0sIFszXV0pOyAvLz0+IFtbMTEsIDEyLCAxM11dXG4gICAgICogICAgICBSLmNvbW11dGVNYXAoUi5tYXAoUi5hZGQoMTApKSwgTWF5YmUub2YsIFtKdXN0KDEpLCBKdXN0KDIpLCBKdXN0KDMpXSk7ICAgLy89PiBKdXN0KFsxMSwgMTIsIDEzXSlcbiAgICAgKiAgICAgIFIuY29tbXV0ZU1hcChSLm1hcChSLmFkZCgxMCkpLCBNYXliZS5vZiwgW0p1c3QoMSksIEp1c3QoMiksIE5vdGhpbmcoKV0pOyAvLz0+IE5vdGhpbmcoKVxuICAgICAqL1xuICAgIHZhciBjb21tdXRlTWFwID0gX2N1cnJ5MyhmdW5jdGlvbiBjb21tdXRlTWFwKGZuLCBvZiwgbGlzdCkge1xuICAgICAgICBmdW5jdGlvbiBjb25zRihhY2MsIGZ0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBhcChtYXAoYXBwZW5kLCBmbihmdG9yKSksIGFjYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWR1Y2UoY29uc0YsIG9mKFtdKSwgbGlzdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGluc2lkZSBhIGN1cnJpZWQgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIHdpdGggdGhlIHNhbWVcbiAgICAgKiBhcmd1bWVudHMgYW5kIHJldHVybnMgdGhlIHNhbWUgdHlwZS4gVGhlIGFyaXR5IG9mIHRoZSBmdW5jdGlvbiByZXR1cm5lZCBpcyBzcGVjaWZpZWRcbiAgICAgKiB0byBhbGxvdyB1c2luZyB2YXJpYWRpYyBjb25zdHJ1Y3RvciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBOdW1iZXIgLT4gKCogLT4geyp9KSAtPiAoKiAtPiB7Kn0pXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG4gVGhlIGFyaXR5IG9mIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBGbiBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gdG8gd3JhcC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSB3cmFwcGVkLCBjdXJyaWVkIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIC8vIFZhcmlhZGljIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gICAgICogICAgICB2YXIgV2lkZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgIHRoaXMuY2hpbGRyZW4gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAqICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICBXaWRnZXQucHJvdG90eXBlID0ge1xuICAgICAqICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgIH07XG4gICAgICogICAgICB2YXIgYWxsQ29uZmlncyA9IFtcbiAgICAgKiAgICAgICAgLy8gLi4uXG4gICAgICogICAgICBdO1xuICAgICAqICAgICAgUi5tYXAoUi5jb25zdHJ1Y3ROKDEsIFdpZGdldCksIGFsbENvbmZpZ3MpOyAvLyBhIGxpc3Qgb2YgV2lkZ2V0c1xuICAgICAqL1xuICAgIHZhciBjb25zdHJ1Y3ROID0gX2N1cnJ5MihmdW5jdGlvbiBjb25zdHJ1Y3ROKG4sIEZuKSB7XG4gICAgICAgIGlmIChuID4gMTApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uc3RydWN0b3Igd2l0aCBncmVhdGVyIHRoYW4gdGVuIGFyZ3VtZW50cycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRm4oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJ5KG5BcnkobiwgZnVuY3Rpb24gKCQwLCAkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwLCAkMSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGbigkMCwgJDEsICQyKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwLCAkMSwgJDIsICQzKTtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwLCAkMSwgJDIsICQzLCAkNCk7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGbigkMCwgJDEsICQyLCAkMywgJDQsICQ1KTtcbiAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwLCAkMSwgJDIsICQzLCAkNCwgJDUsICQ2KTtcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZuKCQwLCAkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNyk7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGbigkMCwgJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4KTtcbiAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGbigkMCwgJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4LCAkOSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFjY2VwdHMgYXQgbGVhc3QgdGhyZWUgZnVuY3Rpb25zIGFuZCByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uLiBXaGVuIGludm9rZWQsIHRoaXMgbmV3XG4gICAgICogZnVuY3Rpb24gd2lsbCBpbnZva2UgdGhlIGZpcnN0IGZ1bmN0aW9uLCBgYWZ0ZXJgLCBwYXNzaW5nIGFzIGl0cyBhcmd1bWVudHMgdGhlXG4gICAgICogcmVzdWx0cyBvZiBpbnZva2luZyB0aGUgc3Vic2VxdWVudCBmdW5jdGlvbnMgd2l0aCB3aGF0ZXZlciBhcmd1bWVudHMgYXJlIHBhc3NlZCB0b1xuICAgICAqIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoeDEgLT4geDIgLT4gLi4uIC0+IHopIC0+ICgoYSAtPiBiIC0+IC4uLiAtPiB4MSksIChhIC0+IGIgLT4gLi4uIC0+IHgyKSwgLi4uKSAtPiAoYSAtPiBiIC0+IC4uLiAtPiB6KVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGFmdGVyIEEgZnVuY3Rpb24uIGBhZnRlcmAgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIHJldHVybiB2YWx1ZXMgb2ZcbiAgICAgKiAgICAgICAgYGZuMWAgYW5kIGBmbjJgIGFzIGl0cyBhcmd1bWVudHMuXG4gICAgICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gZnVuY3Rpb25zIEEgdmFyaWFibGUgbnVtYmVyIG9mIGZ1bmN0aW9ucy5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGFkZCA9IGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgKyBiOyB9O1xuICAgICAqICAgICAgdmFyIG11bHRpcGx5ID0gZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAqIGI7IH07XG4gICAgICogICAgICB2YXIgc3VidHJhY3QgPSBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYjsgfTtcbiAgICAgKlxuICAgICAqICAgICAgLy/iiYUgbXVsdGlwbHkoIGFkZCgxLCAyKSwgc3VidHJhY3QoMSwgMikgKTtcbiAgICAgKiAgICAgIFIuY29udmVyZ2UobXVsdGlwbHksIGFkZCwgc3VidHJhY3QpKDEsIDIpOyAvLz0+IC0zXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBhZGQzID0gZnVuY3Rpb24oYSwgYiwgYykgeyByZXR1cm4gYSArIGIgKyBjOyB9O1xuICAgICAqICAgICAgUi5jb252ZXJnZShhZGQzLCBtdWx0aXBseSwgYWRkLCBzdWJ0cmFjdCkoMSwgMik7IC8vPT4gNFxuICAgICAqL1xuICAgIHZhciBjb252ZXJnZSA9IGN1cnJ5TigzLCBmdW5jdGlvbiBjb252ZXJnZShhZnRlcikge1xuICAgICAgICB2YXIgZm5zID0gX3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHJldHVybiBjdXJyeU4oTWF0aC5tYXguYXBwbHkoTWF0aCwgcGx1Y2soJ2xlbmd0aCcsIGZucykpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBhZnRlci5hcHBseShjb250ZXh0LCBfbWFwKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH0sIGZucykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGJ1dCB0aGUgZmlyc3QgYG5gIGVsZW1lbnRzIG9mIHRoZSBnaXZlbiBsaXN0LCBzdHJpbmcsIG9yXG4gICAgICogdHJhbnNkdWNlci90cmFuc2Zvcm1lciAob3Igb2JqZWN0IHdpdGggYSBgZHJvcGAgbWV0aG9kKS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKiBAc2lnIE51bWJlciAtPiBbYV0gLT4gW2FdXG4gICAgICogQHNpZyBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gICAgICogQHBhcmFtIHsqfSBsaXN0XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAc2VlIFIudGFrZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuZHJvcCgxLCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnYmFyJywgJ2JheiddXG4gICAgICogICAgICBSLmRyb3AoMiwgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbJ2JheiddXG4gICAgICogICAgICBSLmRyb3AoMywgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbXVxuICAgICAqICAgICAgUi5kcm9wKDQsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gW11cbiAgICAgKiAgICAgIFIuZHJvcCgzLCAncmFtZGEnKTsgICAgICAgICAgICAgICAvLz0+ICdkYSdcbiAgICAgKi9cbiAgICB2YXIgZHJvcCA9IF9jdXJyeTIoX2Rpc3BhdGNoYWJsZSgnZHJvcCcsIF94ZHJvcCwgZnVuY3Rpb24gZHJvcChuLCB4cykge1xuICAgICAgICByZXR1cm4gc2xpY2UoTWF0aC5tYXgoMCwgbiksIEluZmluaXR5LCB4cyk7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGxpc3QgY29udGFpbmluZyBhbGwgYnV0IHRoZSBsYXN0IGBuYCBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYGxpc3RgLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gW2FdIC0+IFthXVxuICAgICAqIEBzaWcgTnVtYmVyIC0+IFN0cmluZyAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbiBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIG9mIGB4c2AgdG8gc2tpcC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB4cyBUaGUgY29sbGVjdGlvbiB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKiBAc2VlIFIudGFrZUxhc3RcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmRyb3BMYXN0KDEsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydmb28nLCAnYmFyJ11cbiAgICAgKiAgICAgIFIuZHJvcExhc3QoMiwgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbJ2ZvbyddXG4gICAgICogICAgICBSLmRyb3BMYXN0KDMsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gW11cbiAgICAgKiAgICAgIFIuZHJvcExhc3QoNCwgWydmb28nLCAnYmFyJywgJ2JheiddKTsgLy89PiBbXVxuICAgICAqICAgICAgUi5kcm9wTGFzdCgzLCAncmFtZGEnKTsgICAgICAgICAgICAgICAvLz0+ICdyYSdcbiAgICAgKi9cbiAgICB2YXIgZHJvcExhc3QgPSBfY3VycnkyKGZ1bmN0aW9uIGRyb3BMYXN0KG4sIHhzKSB7XG4gICAgICAgIHJldHVybiB0YWtlKG4gPCB4cy5sZW5ndGggPyB4cy5sZW5ndGggLSBuIDogMCwgeHMpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IHdpdGhvdXQgYW55IGNvbnNlY3V0aXZlbHkgcmVwZWF0aW5nIGVsZW1lbnRzLiBFcXVhbGl0eSBpc1xuICAgICAqIGRldGVybWluZWQgYnkgYXBwbHlpbmcgdGhlIHN1cHBsaWVkIHByZWRpY2F0ZSB0d28gY29uc2VjdXRpdmUgZWxlbWVudHMuXG4gICAgICogVGhlIGZpcnN0IGVsZW1lbnQgaW4gYSBzZXJpZXMgb2YgZXF1YWwgZWxlbWVudCBpcyB0aGUgb25lIGJlaW5nIHByZXNlcnZlZC5cbiAgICAgKlxuICAgICAqIEFjdHMgYXMgYSB0cmFuc2R1Y2VyIGlmIGEgdHJhbnNmb3JtZXIgaXMgZ2l2ZW4gaW4gbGlzdCBwb3NpdGlvbi5cbiAgICAgKiBAc2VlIFIudHJhbnNkdWNlXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIChhLCBhIC0+IEJvb2xlYW4pIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIEEgcHJlZGljYXRlIHVzZWQgdG8gdGVzdCB3aGV0aGVyIHR3byBpdGVtcyBhcmUgZXF1YWwuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gY29uc2lkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGBsaXN0YCB3aXRob3V0IHJlcGVhdGluZyBlbGVtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBmdW5jdGlvbiBsZW5ndGhFcSh4LCB5KSB7IHJldHVybiBNYXRoLmFicyh4KSA9PT0gTWF0aC5hYnMoeSk7IH07XG4gICAgICogICAgICB2YXIgbCA9IFsxLCAtMSwgMSwgMywgNCwgLTQsIC00LCAtNSwgNSwgMywgM107XG4gICAgICogICAgICBSLmRyb3BSZXBlYXRzV2l0aChsZW5ndGhFcSwgbCk7IC8vPT4gWzEsIDMsIDQsIC01LCAzXVxuICAgICAqL1xuICAgIHZhciBkcm9wUmVwZWF0c1dpdGggPSBfY3VycnkyKF9kaXNwYXRjaGFibGUoJ2Ryb3BSZXBlYXRzV2l0aCcsIF94ZHJvcFJlcGVhdHNXaXRoLCBmdW5jdGlvbiBkcm9wUmVwZWF0c1dpdGgocHJlZCwgbGlzdCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBpZHggPSAxO1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIGlmIChsZW4gIT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IGxpc3RbMF07XG4gICAgICAgICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcmVkKGxhc3QocmVzdWx0KSwgbGlzdFtpZHhdKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBsaXN0W2lkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSkpO1xuXG4gICAgLyoqXG4gICAgICogUmVwb3J0cyB3aGV0aGVyIHR3byBvYmplY3RzIGhhdmUgdGhlIHNhbWUgdmFsdWUsIGluIGBSLmVxdWFsc2AgdGVybXMsXG4gICAgICogZm9yIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkuIFVzZWZ1bCBhcyBhIGN1cnJpZWQgcHJlZGljYXRlLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAc2lnIGsgLT4ge2s6IHZ9IC0+IHtrOiB2fSAtPiBCb29sZWFuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3AgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbXBhcmVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqMVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmoyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBvMSA9IHsgYTogMSwgYjogMiwgYzogMywgZDogNCB9O1xuICAgICAqICAgICAgdmFyIG8yID0geyBhOiAxMCwgYjogMjAsIGM6IDMsIGQ6IDQwIH07XG4gICAgICogICAgICBSLmVxUHJvcHMoJ2EnLCBvMSwgbzIpOyAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmVxUHJvcHMoJ2MnLCBvMSwgbzIpOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgZXFQcm9wcyA9IF9jdXJyeTMoZnVuY3Rpb24gZXFQcm9wcyhwcm9wLCBvYmoxLCBvYmoyKSB7XG4gICAgICAgIHJldHVybiBlcXVhbHMob2JqMVtwcm9wXSwgb2JqMltwcm9wXSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhbiBpdGVtIGluIGFuIGFycmF5LFxuICAgICAqIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuIGBSLmVxdWFsc2AgaXMgdXNlZCB0b1xuICAgICAqIGRldGVybWluZSBlcXVhbGl0eS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgYSAtPiBbYV0gLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIGl0ZW0gdG8gZmluZC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB4cyBUaGUgYXJyYXkgdG8gc2VhcmNoIGluLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gdGhlIGluZGV4IG9mIHRoZSB0YXJnZXQsIG9yIC0xIGlmIHRoZSB0YXJnZXQgaXMgbm90IGZvdW5kLlxuICAgICAqIEBzZWUgUi5sYXN0SW5kZXhPZlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaW5kZXhPZigzLCBbMSwyLDMsNF0pOyAvLz0+IDJcbiAgICAgKiAgICAgIFIuaW5kZXhPZigxMCwgWzEsMiwzLDRdKTsgLy89PiAtMVxuICAgICAqL1xuICAgIHZhciBpbmRleE9mID0gX2N1cnJ5MihmdW5jdGlvbiBpbmRleE9mKHRhcmdldCwgeHMpIHtcbiAgICAgICAgcmV0dXJuIF9oYXNNZXRob2QoJ2luZGV4T2YnLCB4cykgPyB4cy5pbmRleE9mKHRhcmdldCkgOiBfaW5kZXhPZih4cywgdGFyZ2V0LCAwKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGJ1dCB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0IG9yIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzZWUgUi5sYXN0LCBSLmhlYWQsIFIudGFpbFxuICAgICAqIEBzaWcgW2FdIC0+IFthXVxuICAgICAqIEBzaWcgU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gbGlzdFxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5pbml0KFsxLCAyLCAzXSk7ICAvLz0+IFsxLCAyXVxuICAgICAqICAgICAgUi5pbml0KFsxLCAyXSk7ICAgICAvLz0+IFsxXVxuICAgICAqICAgICAgUi5pbml0KFsxXSk7ICAgICAgICAvLz0+IFtdXG4gICAgICogICAgICBSLmluaXQoW10pOyAgICAgICAgIC8vPT4gW11cbiAgICAgKlxuICAgICAqICAgICAgUi5pbml0KCdhYmMnKTsgIC8vPT4gJ2FiJ1xuICAgICAqICAgICAgUi5pbml0KCdhYicpOyAgIC8vPT4gJ2EnXG4gICAgICogICAgICBSLmluaXQoJ2EnKTsgICAgLy89PiAnJ1xuICAgICAqICAgICAgUi5pbml0KCcnKTsgICAgIC8vPT4gJydcbiAgICAgKi9cbiAgICB2YXIgaW5pdCA9IHNsaWNlKDAsIC0xKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGFsbCBlbGVtZW50cyBhcmUgdW5pcXVlLCBpbiBgUi5lcXVhbHNgIHRlcm1zLFxuICAgICAqIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBbYV0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiBhbGwgZWxlbWVudHMgYXJlIHVuaXF1ZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIuaXNTZXQoWycxJywgMV0pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuaXNTZXQoWzEsIDFdKTsgICAvLz0+IGZhbHNlXG4gICAgICogICAgICBSLmlzU2V0KFtbNDJdLCBbNDJdXSk7IC8vPT4gZmFsc2VcbiAgICAgKi9cbiAgICB2YXIgaXNTZXQgPSBfY3VycnkxKGZ1bmN0aW9uIGlzU2V0KGxpc3QpIHtcbiAgICAgICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICB2YXIgaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKF9pbmRleE9mKGxpc3QsIGxpc3RbaWR4XSwgaWR4ICsgMSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGxlbnMgZm9yIHRoZSBnaXZlbiBnZXR0ZXIgYW5kIHNldHRlciBmdW5jdGlvbnMuIFRoZSBnZXR0ZXIgXCJnZXRzXCJcbiAgICAgKiB0aGUgdmFsdWUgb2YgdGhlIGZvY3VzOyB0aGUgc2V0dGVyIFwic2V0c1wiIHRoZSB2YWx1ZSBvZiB0aGUgZm9jdXMuIFRoZSBzZXR0ZXJcbiAgICAgKiBzaG91bGQgbm90IG11dGF0ZSB0aGUgZGF0YSBzdHJ1Y3R1cmUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEB0eXBlZGVmIExlbnMgcyBhID0gRnVuY3RvciBmID0+IChhIC0+IGYgYSkgLT4gcyAtPiBmIHNcbiAgICAgKiBAc2lnIChzIC0+IGEpIC0+ICgoYSwgcykgLT4gcykgLT4gTGVucyBzIGFcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXR0ZXJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzZXR0ZXJcbiAgICAgKiBAcmV0dXJuIHtMZW5zfVxuICAgICAqIEBzZWUgUi52aWV3LCBSLnNldCwgUi5vdmVyLCBSLmxlbnNJbmRleCwgUi5sZW5zUHJvcFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB4TGVucyA9IFIubGVucyhSLnByb3AoJ3gnKSwgUi5hc3NvYygneCcpKTtcbiAgICAgKlxuICAgICAqICAgICAgUi52aWV3KHhMZW5zLCB7eDogMSwgeTogMn0pOyAgICAgICAgICAgIC8vPT4gMVxuICAgICAqICAgICAgUi5zZXQoeExlbnMsIDQsIHt4OiAxLCB5OiAyfSk7ICAgICAgICAgIC8vPT4ge3g6IDQsIHk6IDJ9XG4gICAgICogICAgICBSLm92ZXIoeExlbnMsIFIubmVnYXRlLCB7eDogMSwgeTogMn0pOyAgLy89PiB7eDogLTEsIHk6IDJ9XG4gICAgICovXG4gICAgdmFyIGxlbnMgPSBfY3VycnkyKGZ1bmN0aW9uIGxlbnMoZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXR0ZXIodiwgcyk7XG4gICAgICAgICAgICAgICAgfSwgZihnZXR0ZXIocykpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbGVucyB3aG9zZSBmb2N1cyBpcyB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAdHlwZWRlZiBMZW5zIHMgYSA9IEZ1bmN0b3IgZiA9PiAoYSAtPiBmIGEpIC0+IHMgLT4gZiBzXG4gICAgICogQHNpZyBOdW1iZXIgLT4gTGVucyBzIGFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gblxuICAgICAqIEByZXR1cm4ge0xlbnN9XG4gICAgICogQHNlZSBSLnZpZXcsIFIuc2V0LCBSLm92ZXJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgaGVhZExlbnMgPSBSLmxlbnNJbmRleCgwKTtcbiAgICAgKlxuICAgICAqICAgICAgUi52aWV3KGhlYWRMZW5zLCBbJ2EnLCAnYicsICdjJ10pOyAgICAgICAgICAgIC8vPT4gJ2EnXG4gICAgICogICAgICBSLnNldChoZWFkTGVucywgJ3gnLCBbJ2EnLCAnYicsICdjJ10pOyAgICAgICAgLy89PiBbJ3gnLCAnYicsICdjJ11cbiAgICAgKiAgICAgIFIub3ZlcihoZWFkTGVucywgUi50b1VwcGVyLCBbJ2EnLCAnYicsICdjJ10pOyAvLz0+IFsnQScsICdiJywgJ2MnXVxuICAgICAqL1xuICAgIHZhciBsZW5zSW5kZXggPSBfY3VycnkxKGZ1bmN0aW9uIGxlbnNJbmRleChuKSB7XG4gICAgICAgIHJldHVybiBsZW5zKG50aChuKSwgdXBkYXRlKG4pKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsZW5zIHdob3NlIGZvY3VzIGlzIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEB0eXBlZGVmIExlbnMgcyBhID0gRnVuY3RvciBmID0+IChhIC0+IGYgYSkgLT4gcyAtPiBmIHNcbiAgICAgKiBAc2lnIFN0cmluZyAtPiBMZW5zIHMgYVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrXG4gICAgICogQHJldHVybiB7TGVuc31cbiAgICAgKiBAc2VlIFIudmlldywgUi5zZXQsIFIub3ZlclxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciB4TGVucyA9IFIubGVuc1Byb3AoJ3gnKTtcbiAgICAgKlxuICAgICAqICAgICAgUi52aWV3KHhMZW5zLCB7eDogMSwgeTogMn0pOyAgICAgICAgICAgIC8vPT4gMVxuICAgICAqICAgICAgUi5zZXQoeExlbnMsIDQsIHt4OiAxLCB5OiAyfSk7ICAgICAgICAgIC8vPT4ge3g6IDQsIHk6IDJ9XG4gICAgICogICAgICBSLm92ZXIoeExlbnMsIFIubmVnYXRlLCB7eDogMSwgeTogMn0pOyAgLy89PiB7eDogLTEsIHk6IDJ9XG4gICAgICovXG4gICAgdmFyIGxlbnNQcm9wID0gX2N1cnJ5MShmdW5jdGlvbiBsZW5zUHJvcChrKSB7XG4gICAgICAgIHJldHVybiBsZW5zKHByb3AoayksIGFzc29jKGspKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFwibGlmdHNcIiBhIGZ1bmN0aW9uIHRvIGJlIHRoZSBzcGVjaWZpZWQgYXJpdHksIHNvIHRoYXQgaXQgbWF5IFwibWFwIG92ZXJcIiB0aGF0IG1hbnlcbiAgICAgKiBsaXN0cyAob3Igb3RoZXIgRnVuY3RvcnMpLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBzZWUgUi5saWZ0XG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyBOdW1iZXIgLT4gKCouLi4gLT4gKikgLT4gKFsqXS4uLiAtPiBbKl0pXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGxpZnQgaW50byBoaWdoZXIgY29udGV4dFxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZnVuY3Rpb24gYGZuYCBhcHBsaWNhYmxlIHRvIG1hcHBhYmxlIG9iamVjdHMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG1hZGQzID0gUi5saWZ0TigzLCBSLmN1cnJ5TigzLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgcmV0dXJuIFIucmVkdWNlKFIuYWRkLCAwLCBhcmd1bWVudHMpO1xuICAgICAqICAgICAgfSkpO1xuICAgICAqICAgICAgbWFkZDMoWzEsMiwzXSwgWzEsMiwzXSwgWzFdKTsgLy89PiBbMywgNCwgNSwgNCwgNSwgNiwgNSwgNiwgN11cbiAgICAgKi9cbiAgICB2YXIgbGlmdE4gPSBfY3VycnkyKGZ1bmN0aW9uIGxpZnROKGFyaXR5LCBmbikge1xuICAgICAgICB2YXIgbGlmdGVkID0gY3VycnlOKGFyaXR5LCBmbik7XG4gICAgICAgIHJldHVybiBjdXJyeU4oYXJpdHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVkdWNlKGFwLCBtYXAobGlmdGVkLCBhcmd1bWVudHNbMF0pLCBfc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbWVhbiBvZiB0aGUgZ2l2ZW4gbGlzdCBvZiBudW1iZXJzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBNYXRoXG4gICAgICogQHNpZyBbTnVtYmVyXSAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0XG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubWVhbihbMiwgNywgOV0pOyAvLz0+IDZcbiAgICAgKiAgICAgIFIubWVhbihbXSk7IC8vPT4gTmFOXG4gICAgICovXG4gICAgdmFyIG1lYW4gPSBfY3VycnkxKGZ1bmN0aW9uIG1lYW4obGlzdCkge1xuICAgICAgICByZXR1cm4gc3VtKGxpc3QpIC8gbGlzdC5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBtZWRpYW4gb2YgdGhlIGdpdmVuIGxpc3Qgb2YgbnVtYmVycy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTWF0aFxuICAgICAqIEBzaWcgW051bWJlcl0gLT4gTnVtYmVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdFxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm1lZGlhbihbMiwgOSwgN10pOyAvLz0+IDdcbiAgICAgKiAgICAgIFIubWVkaWFuKFs3LCAyLCAxMCwgOV0pOyAvLz0+IDhcbiAgICAgKiAgICAgIFIubWVkaWFuKFtdKTsgLy89PiBOYU5cbiAgICAgKi9cbiAgICB2YXIgbWVkaWFuID0gX2N1cnJ5MShmdW5jdGlvbiBtZWRpYW4obGlzdCkge1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdpZHRoID0gMiAtIGxlbiAlIDI7XG4gICAgICAgIHZhciBpZHggPSAobGVuIC0gd2lkdGgpIC8gMjtcbiAgICAgICAgcmV0dXJuIG1lYW4oX3NsaWNlKGxpc3QpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfSkuc2xpY2UoaWR4LCBpZHggKyB3aWR0aCkpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogTWVyZ2VzIGEgbGlzdCBvZiBvYmplY3RzIHRvZ2V0aGVyIGludG8gb25lIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgW3trOiB2fV0gLT4ge2s6IHZ9XG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdCBBbiBhcnJheSBvZiBvYmplY3RzXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBIG1lcmdlZCBvYmplY3QuXG4gICAgICogQHNlZSBSLnJlZHVjZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIubWVyZ2VBbGwoW3tmb286MX0se2JhcjoyfSx7YmF6OjN9XSk7IC8vPT4ge2ZvbzoxLGJhcjoyLGJhejozfVxuICAgICAqICAgICAgUi5tZXJnZUFsbChbe2ZvbzoxfSx7Zm9vOjJ9LHtiYXI6Mn1dKTsgLy89PiB7Zm9vOjIsYmFyOjJ9XG4gICAgICovXG4gICAgdmFyIG1lcmdlQWxsID0gX2N1cnJ5MShmdW5jdGlvbiBtZXJnZUFsbChsaXN0KSB7XG4gICAgICAgIHJldHVybiByZWR1Y2UobWVyZ2UsIHt9LCBsaXN0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGxlZnQtdG8tcmlnaHQgZnVuY3Rpb24gY29tcG9zaXRpb24uIFRoZSBsZWZ0bW9zdCBmdW5jdGlvbiBtYXkgaGF2ZVxuICAgICAqIGFueSBhcml0eTsgdGhlIHJlbWFpbmluZyBmdW5jdGlvbnMgbXVzdCBiZSB1bmFyeS5cbiAgICAgKlxuICAgICAqIEluIHNvbWUgbGlicmFyaWVzIHRoaXMgZnVuY3Rpb24gaXMgbmFtZWQgYHNlcXVlbmNlYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICgoKGEsIGIsIC4uLiwgbikgLT4gbyksIChvIC0+IHApLCAuLi4sICh4IC0+IHkpLCAoeSAtPiB6KSkgLT4gKGEgLT4gYiAtPiAuLi4gLT4gbiAtPiB6KVxuICAgICAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqIEBzZWUgUi5jb21wb3NlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIGYgPSBSLnBpcGUoTWF0aC5wb3csIFIubmVnYXRlLCBSLmluYyk7XG4gICAgICpcbiAgICAgKiAgICAgIGYoMywgNCk7IC8vIC0oM140KSArIDFcbiAgICAgKi9cbiAgICB2YXIgcGlwZSA9IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpcGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJ5Tihhcmd1bWVudHNbMF0ubGVuZ3RoLCByZWR1Y2UoX3BpcGUsIGFyZ3VtZW50c1swXSwgdGFpbChhcmd1bWVudHMpKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGxlZnQtdG8tcmlnaHQgY29tcG9zaXRpb24gb2Ygb25lIG9yIG1vcmUgUHJvbWlzZS1yZXR1cm5pbmdcbiAgICAgKiBmdW5jdGlvbnMuIFRoZSBsZWZ0bW9zdCBmdW5jdGlvbiBtYXkgaGF2ZSBhbnkgYXJpdHk7IHRoZSByZW1haW5pbmdcbiAgICAgKiBmdW5jdGlvbnMgbXVzdCBiZSB1bmFyeS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICgoYSAtPiBQcm9taXNlIGIpLCAoYiAtPiBQcm9taXNlIGMpLCAuLi4sICh5IC0+IFByb21pc2UgeikpIC0+IChhIC0+IFByb21pc2UgeilcbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAc2VlIFIuY29tcG9zZVBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICAvLyAgZm9sbG93ZXJzRm9yVXNlciA6OiBTdHJpbmcgLT4gUHJvbWlzZSBbVXNlcl1cbiAgICAgKiAgICAgIHZhciBmb2xsb3dlcnNGb3JVc2VyID0gUi5waXBlUChkYi5nZXRVc2VyQnlJZCwgZGIuZ2V0Rm9sbG93ZXJzKTtcbiAgICAgKi9cbiAgICB2YXIgcGlwZVAgPSBmdW5jdGlvbiBwaXBlUCgpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncGlwZVAgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJ5Tihhcmd1bWVudHNbMF0ubGVuZ3RoLCByZWR1Y2UoX3BpcGVQLCBhcmd1bWVudHNbMF0sIHRhaWwoYXJndW1lbnRzKSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBsaWVzIHRvZ2V0aGVyIGFsbCB0aGUgZWxlbWVudHMgb2YgYSBsaXN0LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBNYXRoXG4gICAgICogQHNpZyBbTnVtYmVyXSAtPiBOdW1iZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IEFuIGFycmF5IG9mIG51bWJlcnNcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBwcm9kdWN0IG9mIGFsbCB0aGUgbnVtYmVycyBpbiB0aGUgbGlzdC5cbiAgICAgKiBAc2VlIFIucmVkdWNlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5wcm9kdWN0KFsyLDQsNiw4LDEwMCwxXSk7IC8vPT4gMzg0MDBcbiAgICAgKi9cbiAgICB2YXIgcHJvZHVjdCA9IHJlZHVjZShtdWx0aXBseSwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWFzb25hYmxlIGFuYWxvZyB0byBTUUwgYHNlbGVjdGAgc3RhdGVtZW50LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIFtrXSAtPiBbe2s6IHZ9XSAtPiBbe2s6IHZ9XVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBwcm9qZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gb2JqcyBUaGUgb2JqZWN0cyB0byBxdWVyeVxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGgganVzdCB0aGUgYHByb3BzYCBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBhYmJ5ID0ge25hbWU6ICdBYmJ5JywgYWdlOiA3LCBoYWlyOiAnYmxvbmQnLCBncmFkZTogMn07XG4gICAgICogICAgICB2YXIgZnJlZCA9IHtuYW1lOiAnRnJlZCcsIGFnZTogMTIsIGhhaXI6ICdicm93bicsIGdyYWRlOiA3fTtcbiAgICAgKiAgICAgIHZhciBraWRzID0gW2FiYnksIGZyZWRdO1xuICAgICAqICAgICAgUi5wcm9qZWN0KFsnbmFtZScsICdncmFkZSddLCBraWRzKTsgLy89PiBbe25hbWU6ICdBYmJ5JywgZ3JhZGU6IDJ9LCB7bmFtZTogJ0ZyZWQnLCBncmFkZTogN31dXG4gICAgICovXG4gICAgLy8gcGFzc2luZyBgaWRlbnRpdHlgIGdpdmVzIGNvcnJlY3QgYXJpdHlcbiAgICB2YXIgcHJvamVjdCA9IHVzZVdpdGgoX21hcCwgcGlja0FsbCwgaWRlbnRpdHkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIGxhc3QgYG5gIGVsZW1lbnRzIG9mIHRoZSBnaXZlbiBsaXN0LlxuICAgICAqIElmIGBuID4gbGlzdC5sZW5ndGhgLCByZXR1cm5zIGEgbGlzdCBvZiBgbGlzdC5sZW5ndGhgIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyBOdW1iZXIgLT4gW2FdIC0+IFthXVxuICAgICAqIEBzaWcgTnVtYmVyIC0+IFN0cmluZyAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbiBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJldHVybi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB4cyBUaGUgY29sbGVjdGlvbiB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKiBAc2VlIFIuZHJvcExhc3RcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnRha2VMYXN0KDEsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydiYXonXVxuICAgICAqICAgICAgUi50YWtlTGFzdCgyLCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9yJywgJ2JheiddXG4gICAgICogICAgICBSLnRha2VMYXN0KDMsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydmb28nLCAnYmFyJywgJ2JheiddXG4gICAgICogICAgICBSLnRha2VMYXN0KDQsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydmb28nLCAnYmFyJywgJ2JheiddXG4gICAgICogICAgICBSLnRha2VMYXN0KDMsICdyYW1kYScpOyAgICAgICAgICAgICAgIC8vPT4gJ21kYSdcbiAgICAgKi9cbiAgICB2YXIgdGFrZUxhc3QgPSBfY3VycnkyKGZ1bmN0aW9uIHRha2VMYXN0KG4sIHhzKSB7XG4gICAgICAgIHJldHVybiBkcm9wKG4gPj0gMCA/IHhzLmxlbmd0aCAtIG4gOiAwLCB4cyk7XG4gICAgfSk7XG5cbiAgICB2YXIgX2NvbnRhaW5zID0gZnVuY3Rpb24gX2NvbnRhaW5zKGEsIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIF9pbmRleE9mKGxpc3QsIGEsIDApID49IDA7XG4gICAgfTtcblxuICAgIC8vICBtYXBQYWlycyA6OiAoT2JqZWN0LCBbU3RyaW5nXSkgLT4gW1N0cmluZ11cbiAgICAvLyBGdW5jdGlvbiwgUmVnRXhwLCB1c2VyLWRlZmluZWQgdHlwZXNcbiAgICB2YXIgX3RvU3RyaW5nID0gZnVuY3Rpb24gX3RvU3RyaW5nKHgsIHNlZW4pIHtcbiAgICAgICAgdmFyIHJlY3VyID0gZnVuY3Rpb24gcmVjdXIoeSkge1xuICAgICAgICAgICAgdmFyIHhzID0gc2Vlbi5jb25jYXQoW3hdKTtcbiAgICAgICAgICAgIHJldHVybiBfY29udGFpbnMoeSwgeHMpID8gJzxDaXJjdWxhcj4nIDogX3RvU3RyaW5nKHksIHhzKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gIG1hcFBhaXJzIDo6IChPYmplY3QsIFtTdHJpbmddKSAtPiBbU3RyaW5nXVxuICAgICAgICB2YXIgbWFwUGFpcnMgPSBmdW5jdGlvbiAob2JqLCBrZXlzKSB7XG4gICAgICAgICAgICByZXR1cm4gX21hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcXVvdGUoaykgKyAnOiAnICsgcmVjdXIob2JqW2tdKTtcbiAgICAgICAgICAgIH0sIGtleXMuc2xpY2UoKS5zb3J0KCkpO1xuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSkge1xuICAgICAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOlxuICAgICAgICAgICAgcmV0dXJuICcoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oJyArIF9tYXAocmVjdXIsIHgpLmpvaW4oJywgJykgKyAnKSknO1xuICAgICAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgICAgICAgICByZXR1cm4gJ1snICsgX21hcChyZWN1ciwgeCkuY29uY2F0KG1hcFBhaXJzKHgsIHJlamVjdCh0ZXN0KC9eXFxkKyQvKSwga2V5cyh4KSkpKS5qb2luKCcsICcpICsgJ10nO1xuICAgICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgPyAnbmV3IEJvb2xlYW4oJyArIHJlY3VyKHgudmFsdWVPZigpKSArICcpJyA6IHgudG9TdHJpbmcoKTtcbiAgICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICAgICAgICByZXR1cm4gJ25ldyBEYXRlKCcgKyBfcXVvdGUoX3RvSVNPU3RyaW5nKHgpKSArICcpJztcbiAgICAgICAgY2FzZSAnW29iamVjdCBOdWxsXSc6XG4gICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyA/ICduZXcgTnVtYmVyKCcgKyByZWN1cih4LnZhbHVlT2YoKSkgKyAnKScgOiAxIC8geCA9PT0gLUluZmluaXR5ID8gJy0wJyA6IHgudG9TdHJpbmcoMTApO1xuICAgICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyA/ICduZXcgU3RyaW5nKCcgKyByZWN1cih4LnZhbHVlT2YoKSkgKyAnKScgOiBfcXVvdGUoeCk7XG4gICAgICAgIGNhc2UgJ1tvYmplY3QgVW5kZWZpbmVkXSc6XG4gICAgICAgICAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHguY29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicgJiYgeC5jb25zdHJ1Y3Rvci5uYW1lICE9PSAnT2JqZWN0JyAmJiB0eXBlb2YgeC50b1N0cmluZyA9PT0gJ2Z1bmN0aW9uJyAmJiB4LnRvU3RyaW5nKCkgIT09ICdbb2JqZWN0IE9iamVjdF0nID8geC50b1N0cmluZygpIDogLy8gRnVuY3Rpb24sIFJlZ0V4cCwgdXNlci1kZWZpbmVkIHR5cGVzXG4gICAgICAgICAgICAneycgKyBtYXBQYWlycyh4LCBrZXlzKHgpKS5qb2luKCcsICcpICsgJ30nO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFR1cm5zIGEgbGlzdCBvZiBGdW5jdG9ycyBpbnRvIGEgRnVuY3RvciBvZiBhIGxpc3QuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2VlIFIuY29tbXV0ZU1hcFxuICAgICAqIEBzaWcgRnVuY3RvciBmID0+ICh4IC0+IGYgeCkgLT4gW2YgYV0gLT4gZiBbYV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvZiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgZGF0YSB0eXBlIHRvIHJldHVyblxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgQW4gYXJyYXkgb2YgZnVuY3RvcnMgb2YgdGhlIHNhbWUgdHlwZVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5jb21tdXRlKFIub2YsIFtbMV0sIFsyLCAzXV0pOyAgIC8vPT4gW1sxLCAyXSwgWzEsIDNdXVxuICAgICAqICAgICAgUi5jb21tdXRlKFIub2YsIFtbMSwgMl0sIFszXV0pOyAgIC8vPT4gW1sxLCAzXSwgWzIsIDNdXVxuICAgICAqICAgICAgUi5jb21tdXRlKFIub2YsIFtbMV0sIFsyXSwgWzNdXSk7IC8vPT4gW1sxLCAyLCAzXV1cbiAgICAgKiAgICAgIFIuY29tbXV0ZShNYXliZS5vZiwgW0p1c3QoMSksIEp1c3QoMiksIEp1c3QoMyldKTsgICAvLz0+IEp1c3QoWzEsIDIsIDNdKVxuICAgICAqICAgICAgUi5jb21tdXRlKE1heWJlLm9mLCBbSnVzdCgxKSwgSnVzdCgyKSwgTm90aGluZygpXSk7IC8vPT4gTm90aGluZygpXG4gICAgICovXG4gICAgdmFyIGNvbW11dGUgPSBjb21tdXRlTWFwKGlkZW50aXR5KTtcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHJpZ2h0LXRvLWxlZnQgZnVuY3Rpb24gY29tcG9zaXRpb24uIFRoZSByaWdodG1vc3QgZnVuY3Rpb24gbWF5IGhhdmVcbiAgICAgKiBhbnkgYXJpdHk7IHRoZSByZW1haW5pbmcgZnVuY3Rpb25zIG11c3QgYmUgdW5hcnkuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoKHkgLT4geiksICh4IC0+IHkpLCAuLi4sIChvIC0+IHApLCAoKGEsIGIsIC4uLiwgbikgLT4gbykpIC0+IChhIC0+IGIgLT4gLi4uIC0+IG4gLT4geilcbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAc2VlIFIucGlwZVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBmID0gUi5jb21wb3NlKFIuaW5jLCBSLm5lZ2F0ZSwgTWF0aC5wb3cpO1xuICAgICAqXG4gICAgICogICAgICBmKDMsIDQpOyAvLyAtKDNeNCkgKyAxXG4gICAgICovXG4gICAgdmFyIGNvbXBvc2UgPSBmdW5jdGlvbiBjb21wb3NlKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb21wb3NlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBhcmd1bWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwaXBlLmFwcGx5KHRoaXMsIHJldmVyc2UoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHJpZ2h0LXRvLWxlZnQgS2xlaXNsaSBjb21wb3NpdGlvbiBvZiB0aGUgcHJvdmlkZWQgZnVuY3Rpb25zLFxuICAgICAqIGVhY2ggb2Ygd2hpY2ggbXVzdCByZXR1cm4gYSB2YWx1ZSBvZiBhIHR5cGUgc3VwcG9ydGVkIGJ5IFtgY2hhaW5gXSgjY2hhaW4pLlxuICAgICAqXG4gICAgICogYFIuY29tcG9zZUsoaCwgZywgZilgIGlzIGVxdWl2YWxlbnQgdG8gYFIuY29tcG9zZShSLmNoYWluKGgpLCBSLmNoYWluKGcpLCBSLmNoYWluKGYpKWAuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNlZSBSLnBpcGVLXG4gICAgICogQHNpZyBDaGFpbiBtID0+ICgoeSAtPiBtIHopLCAoeCAtPiBtIHkpLCAuLi4sIChhIC0+IG0gYikpIC0+IChtIGEgLT4gbSB6KVxuICAgICAqIEBwYXJhbSB7Li4uRnVuY3Rpb259XG4gICAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgLy8gIHBhcnNlSnNvbiA6OiBTdHJpbmcgLT4gTWF5YmUgKlxuICAgICAqICAgICAgLy8gIGdldCA6OiBTdHJpbmcgLT4gT2JqZWN0IC0+IE1heWJlICpcbiAgICAgKlxuICAgICAqICAgICAgLy8gIGdldFN0YXRlQ29kZSA6OiBNYXliZSBTdHJpbmcgLT4gTWF5YmUgU3RyaW5nXG4gICAgICogICAgICB2YXIgZ2V0U3RhdGVDb2RlID0gUi5jb21wb3NlSyhcbiAgICAgKiAgICAgICAgUi5jb21wb3NlKE1heWJlLm9mLCBSLnRvVXBwZXIpLFxuICAgICAqICAgICAgICBnZXQoJ3N0YXRlJyksXG4gICAgICogICAgICAgIGdldCgnYWRkcmVzcycpLFxuICAgICAqICAgICAgICBnZXQoJ3VzZXInKSxcbiAgICAgKiAgICAgICAgcGFyc2VKc29uXG4gICAgICogICAgICApO1xuICAgICAqXG4gICAgICogICAgICBnZXRTdGF0ZUNvZGUoTWF5YmUub2YoJ3tcInVzZXJcIjp7XCJhZGRyZXNzXCI6e1wic3RhdGVcIjpcIm55XCJ9fX0nKSk7XG4gICAgICogICAgICAvLz0+IEp1c3QoJ05ZJylcbiAgICAgKiAgICAgIGdldFN0YXRlQ29kZShNYXliZS5vZignW0ludmFsaWQgSlNPTl0nKSk7XG4gICAgICogICAgICAvLz0+IE5vdGhpbmcoKVxuICAgICAqL1xuICAgIHZhciBjb21wb3NlSyA9IGZ1bmN0aW9uIGNvbXBvc2VLKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMCA/IGlkZW50aXR5IDogY29tcG9zZS5hcHBseSh0aGlzLCBtYXAoY2hhaW4sIGFyZ3VtZW50cykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyByaWdodC10by1sZWZ0IGNvbXBvc2l0aW9uIG9mIG9uZSBvciBtb3JlIFByb21pc2UtcmV0dXJuaW5nXG4gICAgICogZnVuY3Rpb25zLiBUaGUgcmlnaHRtb3N0IGZ1bmN0aW9uIG1heSBoYXZlIGFueSBhcml0eTsgdGhlIHJlbWFpbmluZ1xuICAgICAqIGZ1bmN0aW9ucyBtdXN0IGJlIHVuYXJ5LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgKCh5IC0+IFByb21pc2UgeiksICh4IC0+IFByb21pc2UgeSksIC4uLiwgKGEgLT4gUHJvbWlzZSBiKSkgLT4gKGEgLT4gUHJvbWlzZSB6KVxuICAgICAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmN0aW9uc1xuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqIEBzZWUgUi5waXBlUFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIC8vICBmb2xsb3dlcnNGb3JVc2VyIDo6IFN0cmluZyAtPiBQcm9taXNlIFtVc2VyXVxuICAgICAqICAgICAgdmFyIGZvbGxvd2Vyc0ZvclVzZXIgPSBSLmNvbXBvc2VQKGRiLmdldEZvbGxvd2VycywgZGIuZ2V0VXNlckJ5SWQpO1xuICAgICAqL1xuICAgIHZhciBjb21wb3NlUCA9IGZ1bmN0aW9uIGNvbXBvc2VQKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb21wb3NlUCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgYXJndW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGlwZVAuYXBwbHkodGhpcywgcmV2ZXJzZShhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBpbnNpZGUgYSBjdXJyaWVkIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB3aXRoIHRoZSBzYW1lXG4gICAgICogYXJndW1lbnRzIGFuZCByZXR1cm5zIHRoZSBzYW1lIHR5cGUuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHNpZyAoKiAtPiB7Kn0pIC0+ICgqIC0+IHsqfSlcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBGbiBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gdG8gd3JhcC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSB3cmFwcGVkLCBjdXJyaWVkIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIC8vIENvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gICAgICogICAgICB2YXIgV2lkZ2V0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICogICAgICAgIC8vIC4uLlxuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIFdpZGdldC5wcm90b3R5cGUgPSB7XG4gICAgICogICAgICAgIC8vIC4uLlxuICAgICAqICAgICAgfTtcbiAgICAgKiAgICAgIHZhciBhbGxDb25maWdzID0gW1xuICAgICAqICAgICAgICAvLyAuLi5cbiAgICAgKiAgICAgIF07XG4gICAgICogICAgICBSLm1hcChSLmNvbnN0cnVjdChXaWRnZXQpLCBhbGxDb25maWdzKTsgLy8gYSBsaXN0IG9mIFdpZGdldHNcbiAgICAgKi9cbiAgICB2YXIgY29uc3RydWN0ID0gX2N1cnJ5MShmdW5jdGlvbiBjb25zdHJ1Y3QoRm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdE4oRm4ubGVuZ3RoLCBGbik7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGVxdWFsLCBpbiBgUi5lcXVhbHNgIHRlcm1zLFxuICAgICAqIHRvIGF0IGxlYXN0IG9uZSBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0OyBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgYSAtPiBbYV0gLT4gQm9vbGVhblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBpdGVtIHRvIGNvbXBhcmUgYWdhaW5zdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBhcnJheSB0byBjb25zaWRlci5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGl0ZW0gaXMgaW4gdGhlIGxpc3QsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi5jb250YWlucygzLCBbMSwgMiwgM10pOyAvLz0+IHRydWVcbiAgICAgKiAgICAgIFIuY29udGFpbnMoNCwgWzEsIDIsIDNdKTsgLy89PiBmYWxzZVxuICAgICAqICAgICAgUi5jb250YWlucyhbNDJdLCBbWzQyXV0pOyAvLz0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgY29udGFpbnMgPSBfY3VycnkyKF9jb250YWlucyk7XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgc2V0IChpLmUuIG5vIGR1cGxpY2F0ZXMpIG9mIGFsbCBlbGVtZW50cyBpbiB0aGUgZmlyc3QgbGlzdCBub3QgY29udGFpbmVkIGluIHRoZSBzZWNvbmQgbGlzdC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIFthXSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDEgVGhlIGZpcnN0IGxpc3QuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDIgVGhlIHNlY29uZCBsaXN0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgZWxlbWVudHMgaW4gYGxpc3QxYCB0aGF0IGFyZSBub3QgaW4gYGxpc3QyYC5cbiAgICAgKiBAc2VlIFIuZGlmZmVyZW5jZVdpdGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmRpZmZlcmVuY2UoWzEsMiwzLDRdLCBbNyw2LDUsNCwzXSk7IC8vPT4gWzEsMl1cbiAgICAgKiAgICAgIFIuZGlmZmVyZW5jZShbNyw2LDUsNCwzXSwgWzEsMiwzLDRdKTsgLy89PiBbNyw2LDVdXG4gICAgICovXG4gICAgdmFyIGRpZmZlcmVuY2UgPSBfY3VycnkyKGZ1bmN0aW9uIGRpZmZlcmVuY2UoZmlyc3QsIHNlY29uZCkge1xuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIHZhciBpZHggPSAwO1xuICAgICAgICB2YXIgZmlyc3RMZW4gPSBmaXJzdC5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpZHggPCBmaXJzdExlbikge1xuICAgICAgICAgICAgaWYgKCFfY29udGFpbnMoZmlyc3RbaWR4XSwgc2Vjb25kKSAmJiAhX2NvbnRhaW5zKGZpcnN0W2lkeF0sIG91dCkpIHtcbiAgICAgICAgICAgICAgICBvdXRbb3V0Lmxlbmd0aF0gPSBmaXJzdFtpZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgbGlzdCB3aXRob3V0IGFueSBjb25zZWN1dGl2ZWx5IHJlcGVhdGluZyBlbGVtZW50cy5cbiAgICAgKiBgUi5lcXVhbHNgIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGVxdWFsaXR5LlxuICAgICAqXG4gICAgICogQWN0cyBhcyBhIHRyYW5zZHVjZXIgaWYgYSB0cmFuc2Zvcm1lciBpcyBnaXZlbiBpbiBsaXN0IHBvc2l0aW9uLlxuICAgICAqIEBzZWUgUi50cmFuc2R1Y2VcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgTGlzdFxuICAgICAqIEBzaWcgW2FdIC0+IFthXVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBgbGlzdGAgd2l0aG91dCByZXBlYXRpbmcgZWxlbWVudHMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICBSLmRyb3BSZXBlYXRzKFsxLCAxLCAxLCAyLCAzLCA0LCA0LCAyLCAyXSk7IC8vPT4gWzEsIDIsIDMsIDQsIDJdXG4gICAgICovXG4gICAgdmFyIGRyb3BSZXBlYXRzID0gX2N1cnJ5MShfZGlzcGF0Y2hhYmxlKCdkcm9wUmVwZWF0cycsIF94ZHJvcFJlcGVhdHNXaXRoKGVxdWFscyksIGRyb3BSZXBlYXRzV2l0aChlcXVhbHMpKSk7XG5cbiAgICAvKipcbiAgICAgKiBDb21iaW5lcyB0d28gbGlzdHMgaW50byBhIHNldCAoaS5lLiBubyBkdXBsaWNhdGVzKSBjb21wb3NlZCBvZiB0aG9zZSBlbGVtZW50cyBjb21tb24gdG8gYm90aCBsaXN0cy5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAgICAgKiBAc2lnIFthXSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDEgVGhlIGZpcnN0IGxpc3QuXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGlzdDIgVGhlIHNlY29uZCBsaXN0LlxuICAgICAqIEBzZWUgUi5pbnRlcnNlY3Rpb25XaXRoXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBsaXN0IG9mIGVsZW1lbnRzIGZvdW5kIGluIGJvdGggYGxpc3QxYCBhbmQgYGxpc3QyYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLmludGVyc2VjdGlvbihbMSwyLDMsNF0sIFs3LDYsNSw0LDNdKTsgLy89PiBbNCwgM11cbiAgICAgKi9cbiAgICB2YXIgaW50ZXJzZWN0aW9uID0gX2N1cnJ5MihmdW5jdGlvbiBpbnRlcnNlY3Rpb24obGlzdDEsIGxpc3QyKSB7XG4gICAgICAgIHJldHVybiB1bmlxKF9maWx0ZXIoZmxpcChfY29udGFpbnMpKGxpc3QxKSwgbGlzdDIpKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFwibGlmdHNcIiBhIGZ1bmN0aW9uIG9mIGFyaXR5ID4gMSBzbyB0aGF0IGl0IG1heSBcIm1hcCBvdmVyXCIgYW4gQXJyYXkgb3JcbiAgICAgKiBvdGhlciBGdW5jdG9yLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBzZWUgUi5saWZ0TlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgKCouLi4gLT4gKikgLT4gKFsqXS4uLiAtPiBbKl0pXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGxpZnQgaW50byBoaWdoZXIgY29udGV4dFxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZnVuY3Rpb24gYGZuYCBhcHBsaWNhYmxlIHRvIG1hcHBhYmxlIG9iamVjdHMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgdmFyIG1hZGQzID0gUi5saWZ0KFIuY3VycnkoZnVuY3Rpb24oYSwgYiwgYykge1xuICAgICAqICAgICAgICByZXR1cm4gYSArIGIgKyBjO1xuICAgICAqICAgICAgfSkpO1xuICAgICAqICAgICAgbWFkZDMoWzEsMiwzXSwgWzEsMiwzXSwgWzFdKTsgLy89PiBbMywgNCwgNSwgNCwgNSwgNiwgNSwgNiwgN11cbiAgICAgKlxuICAgICAqICAgICAgdmFyIG1hZGQ1ID0gUi5saWZ0KFIuY3VycnkoZnVuY3Rpb24oYSwgYiwgYywgZCwgZSkge1xuICAgICAqICAgICAgICByZXR1cm4gYSArIGIgKyBjICsgZCArIGU7XG4gICAgICogICAgICB9KSk7XG4gICAgICogICAgICBtYWRkNShbMSwyXSwgWzNdLCBbNCwgNV0sIFs2XSwgWzcsIDhdKTsgLy89PiBbMjEsIDIyLCAyMiwgMjMsIDIyLCAyMywgMjMsIDI0XVxuICAgICAqL1xuICAgIHZhciBsaWZ0ID0gX2N1cnJ5MShmdW5jdGlvbiBsaWZ0KGZuKSB7XG4gICAgICAgIHJldHVybiBsaWZ0Tihmbi5sZW5ndGgsIGZuKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYXJ0aWFsIGNvcHkgb2YgYW4gb2JqZWN0IG9taXR0aW5nIHRoZSBrZXlzIHNwZWNpZmllZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHNpZyBbU3RyaW5nXSAtPiB7U3RyaW5nOiAqfSAtPiB7U3RyaW5nOiAqfVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG5hbWVzIGFuIGFycmF5IG9mIFN0cmluZyBwcm9wZXJ0eSBuYW1lcyB0byBvbWl0IGZyb20gdGhlIG5ldyBvYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gY29weSBmcm9tXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGZyb20gYG5hbWVzYCBub3Qgb24gaXQuXG4gICAgICogQHNlZSBSLnBpY2tcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLm9taXQoWydhJywgJ2QnXSwge2E6IDEsIGI6IDIsIGM6IDMsIGQ6IDR9KTsgLy89PiB7YjogMiwgYzogM31cbiAgICAgKi9cbiAgICB2YXIgb21pdCA9IF9jdXJyeTIoZnVuY3Rpb24gb21pdChuYW1lcywgb2JqKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmICghX2NvbnRhaW5zKHByb3AsIG5hbWVzKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtwcm9wXSA9IG9ialtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGVmdC10by1yaWdodCBLbGVpc2xpIGNvbXBvc2l0aW9uIG9mIHRoZSBwcm92aWRlZCBmdW5jdGlvbnMsXG4gICAgICogZWFjaCBvZiB3aGljaCBtdXN0IHJldHVybiBhIHZhbHVlIG9mIGEgdHlwZSBzdXBwb3J0ZWQgYnkgW2BjaGFpbmBdKCNjaGFpbikuXG4gICAgICpcbiAgICAgKiBgUi5waXBlSyhmLCBnLCBoKWAgaXMgZXF1aXZhbGVudCB0byBgUi5waXBlKFIuY2hhaW4oZiksIFIuY2hhaW4oZyksIFIuY2hhaW4oaCkpYC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2VlIFIuY29tcG9zZUtcbiAgICAgKiBAc2lnIENoYWluIG0gPT4gKChhIC0+IG0gYiksIChiIC0+IG0gYyksIC4uLiwgKHkgLT4gbSB6KSkgLT4gKG0gYSAtPiBtIHopXG4gICAgICogQHBhcmFtIHsuLi5GdW5jdGlvbn1cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICAvLyAgcGFyc2VKc29uIDo6IFN0cmluZyAtPiBNYXliZSAqXG4gICAgICogICAgICAvLyAgZ2V0IDo6IFN0cmluZyAtPiBPYmplY3QgLT4gTWF5YmUgKlxuICAgICAqXG4gICAgICogICAgICAvLyAgZ2V0U3RhdGVDb2RlIDo6IE1heWJlIFN0cmluZyAtPiBNYXliZSBTdHJpbmdcbiAgICAgKiAgICAgIHZhciBnZXRTdGF0ZUNvZGUgPSBSLnBpcGVLKFxuICAgICAqICAgICAgICBwYXJzZUpzb24sXG4gICAgICogICAgICAgIGdldCgndXNlcicpLFxuICAgICAqICAgICAgICBnZXQoJ2FkZHJlc3MnKSxcbiAgICAgKiAgICAgICAgZ2V0KCdzdGF0ZScpLFxuICAgICAqICAgICAgICBSLmNvbXBvc2UoTWF5YmUub2YsIFIudG9VcHBlcilcbiAgICAgKiAgICAgICk7XG4gICAgICpcbiAgICAgKiAgICAgIGdldFN0YXRlQ29kZShNYXliZS5vZigne1widXNlclwiOntcImFkZHJlc3NcIjp7XCJzdGF0ZVwiOlwibnlcIn19fScpKTtcbiAgICAgKiAgICAgIC8vPT4gSnVzdCgnTlknKVxuICAgICAqICAgICAgZ2V0U3RhdGVDb2RlKE1heWJlLm9mKCdbSW52YWxpZCBKU09OXScpKTtcbiAgICAgKiAgICAgIC8vPT4gTm90aGluZygpXG4gICAgICovXG4gICAgdmFyIHBpcGVLID0gZnVuY3Rpb24gcGlwZUsoKSB7XG4gICAgICAgIHJldHVybiBjb21wb3NlSy5hcHBseSh0aGlzLCByZXZlcnNlKGFyZ3VtZW50cykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHZhbHVlLiBgZXZhbGAnaW5nIHRoZSBvdXRwdXRcbiAgICAgKiBzaG91bGQgcmVzdWx0IGluIGEgdmFsdWUgZXF1aXZhbGVudCB0byB0aGUgaW5wdXQgdmFsdWUuIE1hbnkgb2YgdGhlIGJ1aWx0LWluXG4gICAgICogYHRvU3RyaW5nYCBtZXRob2RzIGRvIG5vdCBzYXRpc2Z5IHRoaXMgcmVxdWlyZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYW4gYFtvYmplY3QgT2JqZWN0XWAgd2l0aCBhIGB0b1N0cmluZ2AgbWV0aG9kIG90aGVyXG4gICAgICogdGhhbiBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AsIHRoaXMgbWV0aG9kIGlzIGludm9rZWQgd2l0aCBubyBhcmd1bWVudHNcbiAgICAgKiB0byBwcm9kdWNlIHRoZSByZXR1cm4gdmFsdWUuIFRoaXMgbWVhbnMgdXNlci1kZWZpbmVkIGNvbnN0cnVjdG9yIGZ1bmN0aW9uc1xuICAgICAqIGNhbiBwcm92aWRlIGEgc3VpdGFibGUgYHRvU3RyaW5nYCBtZXRob2QuIEZvciBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIGZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICAgKiAgICAgICB0aGlzLnggPSB4O1xuICAgICAqICAgICAgIHRoaXMueSA9IHk7XG4gICAgICogICAgIH1cbiAgICAgKlxuICAgICAqICAgICBQb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICByZXR1cm4gJ25ldyBQb2ludCgnICsgdGhpcy54ICsgJywgJyArIHRoaXMueSArICcpJztcbiAgICAgKiAgICAgfTtcbiAgICAgKlxuICAgICAqICAgICBSLnRvU3RyaW5nKG5ldyBQb2ludCgxLCAyKSk7IC8vPT4gJ25ldyBQb2ludCgxLCAyKSdcbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgU3RyaW5nXG4gICAgICogQHNpZyAqIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudG9TdHJpbmcoNDIpOyAvLz0+ICc0MidcbiAgICAgKiAgICAgIFIudG9TdHJpbmcoJ2FiYycpOyAvLz0+ICdcImFiY1wiJ1xuICAgICAqICAgICAgUi50b1N0cmluZyhbMSwgMiwgM10pOyAvLz0+ICdbMSwgMiwgM10nXG4gICAgICogICAgICBSLnRvU3RyaW5nKHtmb286IDEsIGJhcjogMiwgYmF6OiAzfSk7IC8vPT4gJ3tcImJhclwiOiAyLCBcImJhelwiOiAzLCBcImZvb1wiOiAxfSdcbiAgICAgKiAgICAgIFIudG9TdHJpbmcobmV3IERhdGUoJzIwMDEtMDItMDNUMDQ6MDU6MDZaJykpOyAvLz0+ICduZXcgRGF0ZShcIjIwMDEtMDItMDNUMDQ6MDU6MDYuMDAwWlwiKSdcbiAgICAgKi9cbiAgICB2YXIgdG9TdHJpbmcgPSBfY3VycnkxKGZ1bmN0aW9uIHRvU3RyaW5nKHZhbCkge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nKHZhbCwgW10pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ29tYmluZXMgdHdvIGxpc3RzIGludG8gYSBzZXQgKGkuZS4gbm8gZHVwbGljYXRlcykgY29tcG9zZWQgb2YgdGhlXG4gICAgICogZWxlbWVudHMgb2YgZWFjaCBsaXN0LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBSZWxhdGlvblxuICAgICAqIEBzaWcgW2FdIC0+IFthXSAtPiBbYV1cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcyBUaGUgZmlyc3QgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBicyBUaGUgc2Vjb25kIGxpc3QuXG4gICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBmaXJzdCBhbmQgc2Vjb25kIGxpc3RzIGNvbmNhdGVuYXRlZCwgd2l0aFxuICAgICAqICAgICAgICAgZHVwbGljYXRlcyByZW1vdmVkLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudW5pb24oWzEsIDIsIDNdLCBbMiwgMywgNF0pOyAvLz0+IFsxLCAyLCAzLCA0XVxuICAgICAqL1xuICAgIHZhciB1bmlvbiA9IF9jdXJyeTIoY29tcG9zZSh1bmlxLCBfY29uY2F0KSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGxpc3QgY29udGFpbmluZyBvbmx5IG9uZSBjb3B5IG9mIGVhY2ggZWxlbWVudCBpbiB0aGVcbiAgICAgKiBvcmlnaW5hbCBsaXN0LCBiYXNlZCB1cG9uIHRoZSB2YWx1ZSByZXR1cm5lZCBieSBhcHBseWluZyB0aGUgc3VwcGxpZWRcbiAgICAgKiBmdW5jdGlvbiB0byBlYWNoIGxpc3QgZWxlbWVudC4gUHJlZmVycyB0aGUgZmlyc3QgaXRlbSBpZiB0aGUgc3VwcGxpZWRcbiAgICAgKiBmdW5jdGlvbiBwcm9kdWNlcyB0aGUgc2FtZSB2YWx1ZSBvbiB0d28gaXRlbXMuIGBSLmVxdWFsc2AgaXMgdXNlZCBmb3JcbiAgICAgKiBjb21wYXJpc29uLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBMaXN0XG4gICAgICogQHNpZyAoYSAtPiBiKSAtPiBbYV0gLT4gW2FdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB1c2VkIHRvIHByb2R1Y2UgYSB2YWx1ZSB0byB1c2UgZHVyaW5nIGNvbXBhcmlzb25zLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGFycmF5IHRvIGNvbnNpZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBUaGUgbGlzdCBvZiB1bmlxdWUgaXRlbXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqICAgICAgUi51bmlxQnkoTWF0aC5hYnMsIFstMSwgLTUsIDIsIDEwLCAxLCAyXSk7IC8vPT4gWy0xLCAtNSwgMiwgMTBdXG4gICAgICovXG4gICAgdmFyIHVuaXFCeSA9IF9jdXJyeTIoZnVuY3Rpb24gdW5pcUJ5KGZuLCBsaXN0KSB7XG4gICAgICAgIHZhciBpZHggPSAwLCBhcHBsaWVkID0gW10sIHJlc3VsdCA9IFtdLCBhcHBsaWVkSXRlbSwgaXRlbTtcbiAgICAgICAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVtID0gbGlzdFtpZHhdO1xuICAgICAgICAgICAgYXBwbGllZEl0ZW0gPSBmbihpdGVtKTtcbiAgICAgICAgICAgIGlmICghX2NvbnRhaW5zKGFwcGxpZWRJdGVtLCBhcHBsaWVkKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGFwcGxpZWQucHVzaChhcHBsaWVkSXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogVHVybnMgYSBuYW1lZCBtZXRob2Qgd2l0aCBhIHNwZWNpZmllZCBhcml0eSBpbnRvIGEgZnVuY3Rpb25cbiAgICAgKiB0aGF0IGNhbiBiZSBjYWxsZWQgZGlyZWN0bHkgc3VwcGxpZWQgd2l0aCBhcmd1bWVudHMgYW5kIGEgdGFyZ2V0IG9iamVjdC5cbiAgICAgKlxuICAgICAqIFRoZSByZXR1cm5lZCBmdW5jdGlvbiBpcyBjdXJyaWVkIGFuZCBhY2NlcHRzIGBhcml0eSArIDFgIHBhcmFtZXRlcnMgd2hlcmVcbiAgICAgKiB0aGUgZmluYWwgcGFyYW1ldGVyIGlzIHRoZSB0YXJnZXQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBzaWcgTnVtYmVyIC0+IFN0cmluZyAtPiAoYSAtPiBiIC0+IC4uLiAtPiBuIC0+IE9iamVjdCAtPiAqKVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhcml0eSBOdW1iZXIgb2YgYXJndW1lbnRzIHRoZSByZXR1cm5lZCBmdW5jdGlvbiBzaG91bGQgdGFrZVxuICAgICAqICAgICAgICBiZWZvcmUgdGhlIHRhcmdldCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWV0aG9kIE5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIG5ldyBjdXJyaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIHZhciBzbGljZUZyb20gPSBSLmludm9rZXIoMSwgJ3NsaWNlJyk7XG4gICAgICogICAgICBzbGljZUZyb20oNiwgJ2FiY2RlZmdoaWprbG0nKTsgLy89PiAnZ2hpamtsbSdcbiAgICAgKiAgICAgIHZhciBzbGljZUZyb202ID0gUi5pbnZva2VyKDIsICdzbGljZScpKDYpO1xuICAgICAqICAgICAgc2xpY2VGcm9tNig4LCAnYWJjZGVmZ2hpamtsbScpOyAvLz0+ICdnaCdcbiAgICAgKi9cbiAgICB2YXIgaW52b2tlciA9IF9jdXJyeTIoZnVuY3Rpb24gaW52b2tlcihhcml0eSwgbWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBjdXJyeU4oYXJpdHkgKyAxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYXJndW1lbnRzW2FyaXR5XTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT0gbnVsbCAmJiBpcyhGdW5jdGlvbiwgdGFyZ2V0W21ldGhvZF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFttZXRob2RdLmFwcGx5KHRhcmdldCwgX3NsaWNlKGFyZ3VtZW50cywgMCwgYXJpdHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IodG9TdHJpbmcodGFyZ2V0KSArICcgZG9lcyBub3QgaGF2ZSBhIG1ldGhvZCBuYW1lZCBcIicgKyBtZXRob2QgKyAnXCInKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG1hZGUgYnkgaW5zZXJ0aW5nIHRoZSBgc2VwYXJhdG9yYCBiZXR3ZWVuIGVhY2hcbiAgICAgKiBlbGVtZW50IGFuZCBjb25jYXRlbmF0aW5nIGFsbCB0aGUgZWxlbWVudHMgaW50byBhIHNpbmdsZSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IExpc3RcbiAgICAgKiBAc2lnIFN0cmluZyAtPiBbYV0gLT4gU3RyaW5nXG4gICAgICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzZXBhcmF0b3IgVGhlIHN0cmluZyB1c2VkIHRvIHNlcGFyYXRlIHRoZSBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB4cyBUaGUgZWxlbWVudHMgdG8gam9pbiBpbnRvIGEgc3RyaW5nLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgbWFkZSBieSBjb25jYXRlbmF0aW5nIGB4c2Agd2l0aCBgc2VwYXJhdG9yYC5cbiAgICAgKiBAc2VlIFIuc3BsaXRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgc3BhY2VyID0gUi5qb2luKCcgJyk7XG4gICAgICogICAgICBzcGFjZXIoWydhJywgMiwgMy40XSk7ICAgLy89PiAnYSAyIDMuNCdcbiAgICAgKiAgICAgIFIuam9pbignfCcsIFsxLCAyLCAzXSk7ICAgIC8vPT4gJzF8MnwzJ1xuICAgICAqL1xuICAgIHZhciBqb2luID0gaW52b2tlcigxLCAnam9pbicpO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBmdW5jdGlvbiB0aGF0LCB3aGVuIGludm9rZWQsIGNhY2hlcyB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgYGZuYCBmb3IgYSBnaXZlblxuICAgICAqIGFyZ3VtZW50IHNldCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSBtZW1vaXplZCBgZm5gIHdpdGggdGhlIHNhbWVcbiAgICAgKiBhcmd1bWVudCBzZXQgd2lsbCBub3QgcmVzdWx0IGluIGFuIGFkZGl0aW9uYWwgY2FsbCB0byBgZm5gOyBpbnN0ZWFkLCB0aGUgY2FjaGVkIHJlc3VsdFxuICAgICAqIGZvciB0aGF0IHNldCBvZiBhcmd1bWVudHMgd2lsbCBiZSByZXR1cm5lZC5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAgICAgKiBAc2lnICgqLi4uIC0+IGEpIC0+ICgqLi4uIC0+IGEpXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIG1lbW9pemUuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IE1lbW9pemVkIHZlcnNpb24gb2YgYGZuYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgY291bnQgPSAwO1xuICAgICAqICAgICAgdmFyIGZhY3RvcmlhbCA9IFIubWVtb2l6ZShmdW5jdGlvbihuKSB7XG4gICAgICogICAgICAgIGNvdW50ICs9IDE7XG4gICAgICogICAgICAgIHJldHVybiBSLnByb2R1Y3QoUi5yYW5nZSgxLCBuICsgMSkpO1xuICAgICAqICAgICAgfSk7XG4gICAgICogICAgICBmYWN0b3JpYWwoNSk7IC8vPT4gMTIwXG4gICAgICogICAgICBmYWN0b3JpYWwoNSk7IC8vPT4gMTIwXG4gICAgICogICAgICBmYWN0b3JpYWwoNSk7IC8vPT4gMTIwXG4gICAgICogICAgICBjb3VudDsgLy89PiAxXG4gICAgICovXG4gICAgdmFyIG1lbW9pemUgPSBfY3VycnkxKGZ1bmN0aW9uIG1lbW9pemUoZm4pIHtcbiAgICAgICAgdmFyIGNhY2hlID0ge307XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gdG9TdHJpbmcoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGlmICghX2hhcyhrZXksIGNhY2hlKSkge1xuICAgICAgICAgICAgICAgIGNhY2hlW2tleV0gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlW2tleV07XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBzdHJpbmdzIGJhc2VkIG9uIHRoZSBnaXZlblxuICAgICAqIHNlcGFyYXRvci5cbiAgICAgKlxuICAgICAqIEBmdW5jXG4gICAgICogQG1lbWJlck9mIFJcbiAgICAgKiBAY2F0ZWdvcnkgU3RyaW5nXG4gICAgICogQHNpZyBTdHJpbmcgLT4gU3RyaW5nIC0+IFtTdHJpbmddXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNlcCBUaGUgc2VwYXJhdG9yIHN0cmluZy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gc2VwYXJhdGUgaW50byBhbiBhcnJheS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGFycmF5IG9mIHN0cmluZ3MgZnJvbSBgc3RyYCBzZXBhcmF0ZWQgYnkgYHN0cmAuXG4gICAgICogQHNlZSBSLmpvaW5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICB2YXIgcGF0aENvbXBvbmVudHMgPSBSLnNwbGl0KCcvJyk7XG4gICAgICogICAgICBSLnRhaWwocGF0aENvbXBvbmVudHMoJy91c3IvbG9jYWwvYmluL25vZGUnKSk7IC8vPT4gWyd1c3InLCAnbG9jYWwnLCAnYmluJywgJ25vZGUnXVxuICAgICAqXG4gICAgICogICAgICBSLnNwbGl0KCcuJywgJ2EuYi5jLnh5ei5kJyk7IC8vPT4gWydhJywgJ2InLCAnYycsICd4eXonLCAnZCddXG4gICAgICovXG4gICAgdmFyIHNwbGl0ID0gaW52b2tlcigxLCAnc3BsaXQnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBsb3dlciBjYXNlIHZlcnNpb24gb2YgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAZnVuY1xuICAgICAqIEBtZW1iZXJPZiBSXG4gICAgICogQGNhdGVnb3J5IFN0cmluZ1xuICAgICAqIEBzaWcgU3RyaW5nIC0+IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byBsb3dlciBjYXNlLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gVGhlIGxvd2VyIGNhc2UgdmVyc2lvbiBvZiBgc3RyYC5cbiAgICAgKiBAc2VlIFIudG9VcHBlclxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAgICAgIFIudG9Mb3dlcignWFlaJyk7IC8vPT4gJ3h5eidcbiAgICAgKi9cbiAgICB2YXIgdG9Mb3dlciA9IGludm9rZXIoMCwgJ3RvTG93ZXJDYXNlJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdXBwZXIgY2FzZSB2ZXJzaW9uIG9mIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQGZ1bmNcbiAgICAgKiBAbWVtYmVyT2YgUlxuICAgICAqIEBjYXRlZ29yeSBTdHJpbmdcbiAgICAgKiBAc2lnIFN0cmluZyAtPiBTdHJpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gdXBwZXIgY2FzZS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSB1cHBlciBjYXNlIHZlcnNpb24gb2YgYHN0cmAuXG4gICAgICogQHNlZSBSLnRvTG93ZXJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogICAgICBSLnRvVXBwZXIoJ2FiYycpOyAvLz0+ICdBQkMnXG4gICAgICovXG4gICAgdmFyIHRvVXBwZXIgPSBpbnZva2VyKDAsICd0b1VwcGVyQ2FzZScpO1xuXG4gICAgdmFyIFIgPSB7XG4gICAgICAgIEY6IEYsXG4gICAgICAgIFQ6IFQsXG4gICAgICAgIF9fOiBfXyxcbiAgICAgICAgYWRkOiBhZGQsXG4gICAgICAgIGFkZEluZGV4OiBhZGRJbmRleCxcbiAgICAgICAgYWRqdXN0OiBhZGp1c3QsXG4gICAgICAgIGFsbDogYWxsLFxuICAgICAgICBhbGxQYXNzOiBhbGxQYXNzLFxuICAgICAgICBhbHdheXM6IGFsd2F5cyxcbiAgICAgICAgYW5kOiBhbmQsXG4gICAgICAgIGFueTogYW55LFxuICAgICAgICBhbnlQYXNzOiBhbnlQYXNzLFxuICAgICAgICBhcDogYXAsXG4gICAgICAgIGFwZXJ0dXJlOiBhcGVydHVyZSxcbiAgICAgICAgYXBwZW5kOiBhcHBlbmQsXG4gICAgICAgIGFwcGx5OiBhcHBseSxcbiAgICAgICAgYXNzb2M6IGFzc29jLFxuICAgICAgICBhc3NvY1BhdGg6IGFzc29jUGF0aCxcbiAgICAgICAgYmluYXJ5OiBiaW5hcnksXG4gICAgICAgIGJpbmQ6IGJpbmQsXG4gICAgICAgIGJvdGg6IGJvdGgsXG4gICAgICAgIGNhbGw6IGNhbGwsXG4gICAgICAgIGNoYWluOiBjaGFpbixcbiAgICAgICAgY2xvbmU6IGNsb25lLFxuICAgICAgICBjb21tdXRlOiBjb21tdXRlLFxuICAgICAgICBjb21tdXRlTWFwOiBjb21tdXRlTWFwLFxuICAgICAgICBjb21wYXJhdG9yOiBjb21wYXJhdG9yLFxuICAgICAgICBjb21wbGVtZW50OiBjb21wbGVtZW50LFxuICAgICAgICBjb21wb3NlOiBjb21wb3NlLFxuICAgICAgICBjb21wb3NlSzogY29tcG9zZUssXG4gICAgICAgIGNvbXBvc2VQOiBjb21wb3NlUCxcbiAgICAgICAgY29uY2F0OiBjb25jYXQsXG4gICAgICAgIGNvbmQ6IGNvbmQsXG4gICAgICAgIGNvbnN0cnVjdDogY29uc3RydWN0LFxuICAgICAgICBjb25zdHJ1Y3ROOiBjb25zdHJ1Y3ROLFxuICAgICAgICBjb250YWluczogY29udGFpbnMsXG4gICAgICAgIGNvbnRhaW5zV2l0aDogY29udGFpbnNXaXRoLFxuICAgICAgICBjb252ZXJnZTogY29udmVyZ2UsXG4gICAgICAgIGNvdW50Qnk6IGNvdW50QnksXG4gICAgICAgIGNyZWF0ZU1hcEVudHJ5OiBjcmVhdGVNYXBFbnRyeSxcbiAgICAgICAgY3Vycnk6IGN1cnJ5LFxuICAgICAgICBjdXJyeU46IGN1cnJ5TixcbiAgICAgICAgZGVjOiBkZWMsXG4gICAgICAgIGRlZmF1bHRUbzogZGVmYXVsdFRvLFxuICAgICAgICBkaWZmZXJlbmNlOiBkaWZmZXJlbmNlLFxuICAgICAgICBkaWZmZXJlbmNlV2l0aDogZGlmZmVyZW5jZVdpdGgsXG4gICAgICAgIGRpc3NvYzogZGlzc29jLFxuICAgICAgICBkaXNzb2NQYXRoOiBkaXNzb2NQYXRoLFxuICAgICAgICBkaXZpZGU6IGRpdmlkZSxcbiAgICAgICAgZHJvcDogZHJvcCxcbiAgICAgICAgZHJvcExhc3Q6IGRyb3BMYXN0LFxuICAgICAgICBkcm9wTGFzdFdoaWxlOiBkcm9wTGFzdFdoaWxlLFxuICAgICAgICBkcm9wUmVwZWF0czogZHJvcFJlcGVhdHMsXG4gICAgICAgIGRyb3BSZXBlYXRzV2l0aDogZHJvcFJlcGVhdHNXaXRoLFxuICAgICAgICBkcm9wV2hpbGU6IGRyb3BXaGlsZSxcbiAgICAgICAgZWl0aGVyOiBlaXRoZXIsXG4gICAgICAgIGVtcHR5OiBlbXB0eSxcbiAgICAgICAgZXFQcm9wczogZXFQcm9wcyxcbiAgICAgICAgZXF1YWxzOiBlcXVhbHMsXG4gICAgICAgIGV2b2x2ZTogZXZvbHZlLFxuICAgICAgICBmaWx0ZXI6IGZpbHRlcixcbiAgICAgICAgZmluZDogZmluZCxcbiAgICAgICAgZmluZEluZGV4OiBmaW5kSW5kZXgsXG4gICAgICAgIGZpbmRMYXN0OiBmaW5kTGFzdCxcbiAgICAgICAgZmluZExhc3RJbmRleDogZmluZExhc3RJbmRleCxcbiAgICAgICAgZmxhdHRlbjogZmxhdHRlbixcbiAgICAgICAgZmxpcDogZmxpcCxcbiAgICAgICAgZm9yRWFjaDogZm9yRWFjaCxcbiAgICAgICAgZnJvbVBhaXJzOiBmcm9tUGFpcnMsXG4gICAgICAgIGZ1bmN0aW9uczogZnVuY3Rpb25zLFxuICAgICAgICBmdW5jdGlvbnNJbjogZnVuY3Rpb25zSW4sXG4gICAgICAgIGdyb3VwQnk6IGdyb3VwQnksXG4gICAgICAgIGd0OiBndCxcbiAgICAgICAgZ3RlOiBndGUsXG4gICAgICAgIGhhczogaGFzLFxuICAgICAgICBoYXNJbjogaGFzSW4sXG4gICAgICAgIGhlYWQ6IGhlYWQsXG4gICAgICAgIGlkZW50aWNhbDogaWRlbnRpY2FsLFxuICAgICAgICBpZGVudGl0eTogaWRlbnRpdHksXG4gICAgICAgIGlmRWxzZTogaWZFbHNlLFxuICAgICAgICBpbmM6IGluYyxcbiAgICAgICAgaW5kZXhPZjogaW5kZXhPZixcbiAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgaW5zZXJ0OiBpbnNlcnQsXG4gICAgICAgIGluc2VydEFsbDogaW5zZXJ0QWxsLFxuICAgICAgICBpbnRlcnNlY3Rpb246IGludGVyc2VjdGlvbixcbiAgICAgICAgaW50ZXJzZWN0aW9uV2l0aDogaW50ZXJzZWN0aW9uV2l0aCxcbiAgICAgICAgaW50ZXJzcGVyc2U6IGludGVyc3BlcnNlLFxuICAgICAgICBpbnRvOiBpbnRvLFxuICAgICAgICBpbnZlcnQ6IGludmVydCxcbiAgICAgICAgaW52ZXJ0T2JqOiBpbnZlcnRPYmosXG4gICAgICAgIGludm9rZXI6IGludm9rZXIsXG4gICAgICAgIGlzOiBpcyxcbiAgICAgICAgaXNBcnJheUxpa2U6IGlzQXJyYXlMaWtlLFxuICAgICAgICBpc0VtcHR5OiBpc0VtcHR5LFxuICAgICAgICBpc05pbDogaXNOaWwsXG4gICAgICAgIGlzU2V0OiBpc1NldCxcbiAgICAgICAgam9pbjogam9pbixcbiAgICAgICAga2V5czoga2V5cyxcbiAgICAgICAga2V5c0luOiBrZXlzSW4sXG4gICAgICAgIGxhc3Q6IGxhc3QsXG4gICAgICAgIGxhc3RJbmRleE9mOiBsYXN0SW5kZXhPZixcbiAgICAgICAgbGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgIGxlbnM6IGxlbnMsXG4gICAgICAgIGxlbnNJbmRleDogbGVuc0luZGV4LFxuICAgICAgICBsZW5zUHJvcDogbGVuc1Byb3AsXG4gICAgICAgIGxpZnQ6IGxpZnQsXG4gICAgICAgIGxpZnROOiBsaWZ0TixcbiAgICAgICAgbHQ6IGx0LFxuICAgICAgICBsdGU6IGx0ZSxcbiAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgIG1hcEFjY3VtOiBtYXBBY2N1bSxcbiAgICAgICAgbWFwQWNjdW1SaWdodDogbWFwQWNjdW1SaWdodCxcbiAgICAgICAgbWFwT2JqOiBtYXBPYmosXG4gICAgICAgIG1hcE9iakluZGV4ZWQ6IG1hcE9iakluZGV4ZWQsXG4gICAgICAgIG1hdGNoOiBtYXRjaCxcbiAgICAgICAgbWF0aE1vZDogbWF0aE1vZCxcbiAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgIG1heEJ5OiBtYXhCeSxcbiAgICAgICAgbWVhbjogbWVhbixcbiAgICAgICAgbWVkaWFuOiBtZWRpYW4sXG4gICAgICAgIG1lbW9pemU6IG1lbW9pemUsXG4gICAgICAgIG1lcmdlOiBtZXJnZSxcbiAgICAgICAgbWVyZ2VBbGw6IG1lcmdlQWxsLFxuICAgICAgICBtaW46IG1pbixcbiAgICAgICAgbWluQnk6IG1pbkJ5LFxuICAgICAgICBtb2R1bG86IG1vZHVsbyxcbiAgICAgICAgbXVsdGlwbHk6IG11bHRpcGx5LFxuICAgICAgICBuQXJ5OiBuQXJ5LFxuICAgICAgICBuZWdhdGU6IG5lZ2F0ZSxcbiAgICAgICAgbm9uZTogbm9uZSxcbiAgICAgICAgbm90OiBub3QsXG4gICAgICAgIG50aDogbnRoLFxuICAgICAgICBudGhBcmc6IG50aEFyZyxcbiAgICAgICAgbnRoQ2hhcjogbnRoQ2hhcixcbiAgICAgICAgbnRoQ2hhckNvZGU6IG50aENoYXJDb2RlLFxuICAgICAgICBvZjogb2YsXG4gICAgICAgIG9taXQ6IG9taXQsXG4gICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgIG9yOiBvcixcbiAgICAgICAgb3Zlcjogb3ZlcixcbiAgICAgICAgcGFydGlhbDogcGFydGlhbCxcbiAgICAgICAgcGFydGlhbFJpZ2h0OiBwYXJ0aWFsUmlnaHQsXG4gICAgICAgIHBhcnRpdGlvbjogcGFydGl0aW9uLFxuICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICBwYXRoRXE6IHBhdGhFcSxcbiAgICAgICAgcGljazogcGljayxcbiAgICAgICAgcGlja0FsbDogcGlja0FsbCxcbiAgICAgICAgcGlja0J5OiBwaWNrQnksXG4gICAgICAgIHBpcGU6IHBpcGUsXG4gICAgICAgIHBpcGVLOiBwaXBlSyxcbiAgICAgICAgcGlwZVA6IHBpcGVQLFxuICAgICAgICBwbHVjazogcGx1Y2ssXG4gICAgICAgIHByZXBlbmQ6IHByZXBlbmQsXG4gICAgICAgIHByb2R1Y3Q6IHByb2R1Y3QsXG4gICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgIHByb3BFcTogcHJvcEVxLFxuICAgICAgICBwcm9wSXM6IHByb3BJcyxcbiAgICAgICAgcHJvcE9yOiBwcm9wT3IsXG4gICAgICAgIHByb3BTYXRpc2ZpZXM6IHByb3BTYXRpc2ZpZXMsXG4gICAgICAgIHByb3BzOiBwcm9wcyxcbiAgICAgICAgcmFuZ2U6IHJhbmdlLFxuICAgICAgICByZWR1Y2U6IHJlZHVjZSxcbiAgICAgICAgcmVkdWNlUmlnaHQ6IHJlZHVjZVJpZ2h0LFxuICAgICAgICByZWR1Y2VkOiByZWR1Y2VkLFxuICAgICAgICByZWplY3Q6IHJlamVjdCxcbiAgICAgICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgICByZXBsYWNlOiByZXBsYWNlLFxuICAgICAgICByZXZlcnNlOiByZXZlcnNlLFxuICAgICAgICBzY2FuOiBzY2FuLFxuICAgICAgICBzZXQ6IHNldCxcbiAgICAgICAgc2xpY2U6IHNsaWNlLFxuICAgICAgICBzb3J0OiBzb3J0LFxuICAgICAgICBzb3J0Qnk6IHNvcnRCeSxcbiAgICAgICAgc3BsaXQ6IHNwbGl0LFxuICAgICAgICBzcGxpdEV2ZXJ5OiBzcGxpdEV2ZXJ5LFxuICAgICAgICBzdWJ0cmFjdDogc3VidHJhY3QsXG4gICAgICAgIHN1bTogc3VtLFxuICAgICAgICB0YWlsOiB0YWlsLFxuICAgICAgICB0YWtlOiB0YWtlLFxuICAgICAgICB0YWtlTGFzdDogdGFrZUxhc3QsXG4gICAgICAgIHRha2VMYXN0V2hpbGU6IHRha2VMYXN0V2hpbGUsXG4gICAgICAgIHRha2VXaGlsZTogdGFrZVdoaWxlLFxuICAgICAgICB0YXA6IHRhcCxcbiAgICAgICAgdGVzdDogdGVzdCxcbiAgICAgICAgdGltZXM6IHRpbWVzLFxuICAgICAgICB0b0xvd2VyOiB0b0xvd2VyLFxuICAgICAgICB0b1BhaXJzOiB0b1BhaXJzLFxuICAgICAgICB0b1BhaXJzSW46IHRvUGFpcnNJbixcbiAgICAgICAgdG9TdHJpbmc6IHRvU3RyaW5nLFxuICAgICAgICB0b1VwcGVyOiB0b1VwcGVyLFxuICAgICAgICB0cmFuc2R1Y2U6IHRyYW5zZHVjZSxcbiAgICAgICAgdHJpbTogdHJpbSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgdW5hcHBseTogdW5hcHBseSxcbiAgICAgICAgdW5hcnk6IHVuYXJ5LFxuICAgICAgICB1bmN1cnJ5TjogdW5jdXJyeU4sXG4gICAgICAgIHVuZm9sZDogdW5mb2xkLFxuICAgICAgICB1bmlvbjogdW5pb24sXG4gICAgICAgIHVuaW9uV2l0aDogdW5pb25XaXRoLFxuICAgICAgICB1bmlxOiB1bmlxLFxuICAgICAgICB1bmlxQnk6IHVuaXFCeSxcbiAgICAgICAgdW5pcVdpdGg6IHVuaXFXaXRoLFxuICAgICAgICB1bm5lc3Q6IHVubmVzdCxcbiAgICAgICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgICAgIHVzZVdpdGg6IHVzZVdpdGgsXG4gICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICB2YWx1ZXNJbjogdmFsdWVzSW4sXG4gICAgICAgIHZpZXc6IHZpZXcsXG4gICAgICAgIHdoZXJlOiB3aGVyZSxcbiAgICAgICAgd2hlcmVFcTogd2hlcmVFcSxcbiAgICAgICAgd3JhcDogd3JhcCxcbiAgICAgICAgeHByb2Q6IHhwcm9kLFxuICAgICAgICB6aXA6IHppcCxcbiAgICAgICAgemlwT2JqOiB6aXBPYmosXG4gICAgICAgIHppcFdpdGg6IHppcFdpdGhcbiAgICB9O1xuXG4gIC8qIFRFU1RfRU5UUllfUE9JTlQgKi9cblxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBSO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIFI7IH0pO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuUiA9IFI7XG4gIH1cblxufS5jYWxsKHRoaXMpKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3JhbWRhL2Rpc3QvcmFtZGEuanNcbiAqKiBtb2R1bGUgaWQgPSAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY3VycnlOID0gcmVxdWlyZSgncmFtZGEvc3JjL2N1cnJ5TicpO1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiAhIShvYmogJiYgb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jYWxsICYmIG9iai5hcHBseSk7XG59XG5cbi8vIEdsb2JhbHNcbnZhciB0b1VwZGF0ZSA9IFtdO1xudmFyIGluU3RyZWFtO1xuXG5mdW5jdGlvbiBtYXAoZiwgcykge1xuICByZXR1cm4gc3RyZWFtKFtzXSwgZnVuY3Rpb24oc2VsZikgeyBzZWxmKGYocy52YWwpKTsgfSk7XG59XG5cbmZ1bmN0aW9uIG9uKGYsIHMpIHtcbiAgc3RyZWFtKFtzXSwgZnVuY3Rpb24oKSB7IGYocy52YWwpOyB9KTtcbn1cblxuZnVuY3Rpb24gYm91bmRNYXAoZikgeyByZXR1cm4gbWFwKGYsIHRoaXMpOyB9XG5cbnZhciBzY2FuID0gY3VycnlOKDMsIGZ1bmN0aW9uKGYsIGFjYywgcykge1xuICB2YXIgbnMgPSBzdHJlYW0oW3NdLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGFjYyA9IGYoYWNjLCBzKCkpKTtcbiAgfSk7XG4gIGlmICghbnMuaGFzVmFsKSBucyhhY2MpO1xuICByZXR1cm4gbnM7XG59KTtcblxudmFyIG1lcmdlID0gY3VycnlOKDIsIGZ1bmN0aW9uKHMxLCBzMikge1xuICB2YXIgcyA9IGltbWVkaWF0ZShzdHJlYW0oW3MxLCBzMl0sIGZ1bmN0aW9uKG4sIGNoYW5nZWQpIHtcbiAgICByZXR1cm4gY2hhbmdlZFswXSA/IGNoYW5nZWRbMF0oKVxuICAgICAgICAgOiBzMS5oYXNWYWwgID8gczEoKVxuICAgICAgICAgICAgICAgICAgICAgIDogczIoKTtcbiAgfSkpO1xuICBlbmRzT24oc3RyZWFtKFtzMS5lbmQsIHMyLmVuZF0sIGZ1bmN0aW9uKHNlbGYsIGNoYW5nZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSksIHMpO1xuICByZXR1cm4gcztcbn0pO1xuXG5mdW5jdGlvbiBhcChzMikge1xuICB2YXIgczEgPSB0aGlzO1xuICByZXR1cm4gc3RyZWFtKFtzMSwgczJdLCBmdW5jdGlvbigpIHsgcmV0dXJuIHMxKCkoczIoKSk7IH0pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsRGVwc05vdE1ldChzdHJlYW0pIHtcbiAgc3RyZWFtLmRlcHNNZXQgPSBzdHJlYW0uZGVwcy5ldmVyeShmdW5jdGlvbihzKSB7XG4gICAgcmV0dXJuIHMuaGFzVmFsO1xuICB9KTtcbiAgcmV0dXJuICFzdHJlYW0uZGVwc01ldDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3RyZWFtKHMpIHtcbiAgaWYgKChzLmRlcHNNZXQgIT09IHRydWUgJiYgaW5pdGlhbERlcHNOb3RNZXQocykpIHx8XG4gICAgICAocy5lbmQgIT09IHVuZGVmaW5lZCAmJiBzLmVuZC52YWwgPT09IHRydWUpKSByZXR1cm47XG4gIGlmIChpblN0cmVhbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdG9VcGRhdGUucHVzaChzKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5TdHJlYW0gPSBzO1xuICB2YXIgcmV0dXJuVmFsID0gcy5mbihzLCBzLmRlcHNDaGFuZ2VkKTtcbiAgaWYgKHJldHVyblZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcyhyZXR1cm5WYWwpO1xuICB9XG4gIGluU3RyZWFtID0gdW5kZWZpbmVkO1xuICBpZiAocy5kZXBzQ2hhbmdlZCAhPT0gdW5kZWZpbmVkKSBzLmRlcHNDaGFuZ2VkID0gW107XG4gIHMuc2hvdWxkVXBkYXRlID0gZmFsc2U7XG4gIGlmIChmbHVzaGluZyA9PT0gZmFsc2UpIGZsdXNoVXBkYXRlKCk7XG59XG5cbnZhciBvcmRlciA9IFtdO1xudmFyIG9yZGVyTmV4dElkeCA9IC0xO1xuXG5mdW5jdGlvbiBmaW5kRGVwcyhzKSB7XG4gIHZhciBpLCBsaXN0ZW5lcnMgPSBzLmxpc3RlbmVycztcbiAgaWYgKHMucXVldWVkID09PSBmYWxzZSkge1xuICAgIHMucXVldWVkID0gdHJ1ZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICBmaW5kRGVwcyhsaXN0ZW5lcnNbaV0pO1xuICAgIH1cbiAgICBvcmRlclsrK29yZGVyTmV4dElkeF0gPSBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZURlcHMocykge1xuICB2YXIgaSwgbywgbGlzdCwgbGlzdGVuZXJzID0gcy5saXN0ZW5lcnM7XG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICBsaXN0ID0gbGlzdGVuZXJzW2ldO1xuICAgIGlmIChsaXN0LmVuZCA9PT0gcykge1xuICAgICAgZW5kU3RyZWFtKGxpc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobGlzdC5kZXBzQ2hhbmdlZCAhPT0gdW5kZWZpbmVkKSBsaXN0LmRlcHNDaGFuZ2VkLnB1c2gocyk7XG4gICAgICBsaXN0LnNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgICBmaW5kRGVwcyhsaXN0KTtcbiAgICB9XG4gIH1cbiAgZm9yICg7IG9yZGVyTmV4dElkeCA+PSAwOyAtLW9yZGVyTmV4dElkeCkge1xuICAgIG8gPSBvcmRlcltvcmRlck5leHRJZHhdO1xuICAgIGlmIChvLnNob3VsZFVwZGF0ZSA9PT0gdHJ1ZSkgdXBkYXRlU3RyZWFtKG8pO1xuICAgIG8ucXVldWVkID0gZmFsc2U7XG4gIH1cbn1cblxudmFyIGZsdXNoaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGZsdXNoVXBkYXRlKCkge1xuICBmbHVzaGluZyA9IHRydWU7XG4gIHdoaWxlICh0b1VwZGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgdmFyIHMgPSB0b1VwZGF0ZS5zaGlmdCgpO1xuICAgIGlmIChzLnZhbHMubGVuZ3RoID4gMCkgcy52YWwgPSBzLnZhbHMuc2hpZnQoKTtcbiAgICB1cGRhdGVEZXBzKHMpO1xuICB9XG4gIGZsdXNoaW5nID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzU3RyZWFtKHN0cmVhbSkge1xuICByZXR1cm4gaXNGdW5jdGlvbihzdHJlYW0pICYmICdoYXNWYWwnIGluIHN0cmVhbTtcbn1cblxuZnVuY3Rpb24gc3RyZWFtVG9TdHJpbmcoKSB7XG4gIHJldHVybiAnc3RyZWFtKCcgKyB0aGlzLnZhbCArICcpJztcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3RyZWFtVmFsdWUocywgbikge1xuICBpZiAobiAhPT0gdW5kZWZpbmVkICYmIG4gIT09IG51bGwgJiYgaXNGdW5jdGlvbihuLnRoZW4pKSB7XG4gICAgbi50aGVuKHMpO1xuICAgIHJldHVybjtcbiAgfVxuICBzLnZhbCA9IG47XG4gIHMuaGFzVmFsID0gdHJ1ZTtcbiAgaWYgKGluU3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgdXBkYXRlRGVwcyhzKTtcbiAgICBpZiAodG9VcGRhdGUubGVuZ3RoID4gMCkgZmx1c2hVcGRhdGUoKTsgZWxzZSBmbHVzaGluZyA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKGluU3RyZWFtID09PSBzKSB7XG4gICAgbWFya0xpc3RlbmVycyhzLCBzLmxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgcy52YWxzLnB1c2gobik7XG4gICAgdG9VcGRhdGUucHVzaChzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXJrTGlzdGVuZXJzKHMsIGxpc3RzKSB7XG4gIHZhciBpLCBsaXN0O1xuICBmb3IgKGkgPSAwOyBpIDwgbGlzdHMubGVuZ3RoOyArK2kpIHtcbiAgICBsaXN0ID0gbGlzdHNbaV07XG4gICAgaWYgKGxpc3QuZW5kICE9PSBzKSB7XG4gICAgICBpZiAobGlzdC5kZXBzQ2hhbmdlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxpc3QuZGVwc0NoYW5nZWQucHVzaChzKTtcbiAgICAgIH1cbiAgICAgIGxpc3Quc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kU3RyZWFtKGxpc3QpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHJlYW0oKSB7XG4gIGZ1bmN0aW9uIHMobikge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMCA/ICh1cGRhdGVTdHJlYW1WYWx1ZShzLCBuKSwgcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBzLnZhbDtcbiAgfVxuICBzLmhhc1ZhbCA9IGZhbHNlO1xuICBzLnZhbCA9IHVuZGVmaW5lZDtcbiAgcy52YWxzID0gW107XG4gIHMubGlzdGVuZXJzID0gW107XG4gIHMucXVldWVkID0gZmFsc2U7XG4gIHMuZW5kID0gdW5kZWZpbmVkO1xuXG4gIHMubWFwID0gYm91bmRNYXA7XG4gIHMuYXAgPSBhcDtcbiAgcy5vZiA9IHN0cmVhbTtcbiAgcy50b1N0cmluZyA9IHN0cmVhbVRvU3RyaW5nO1xuXG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoZGVwcywgcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyArK2kpIHtcbiAgICBkZXBzW2ldLmxpc3RlbmVycy5wdXNoKHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURlcGVuZGVudFN0cmVhbShkZXBzLCBmbikge1xuICB2YXIgcyA9IGNyZWF0ZVN0cmVhbSgpO1xuICBzLmZuID0gZm47XG4gIHMuZGVwcyA9IGRlcHM7XG4gIHMuZGVwc01ldCA9IGZhbHNlO1xuICBzLmRlcHNDaGFuZ2VkID0gZm4ubGVuZ3RoID4gMSA/IFtdIDogdW5kZWZpbmVkO1xuICBzLnNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuICBhZGRMaXN0ZW5lcnMoZGVwcywgcyk7XG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBpbW1lZGlhdGUocykge1xuICBpZiAocy5kZXBzTWV0ID09PSBmYWxzZSkge1xuICAgIHMuZGVwc01ldCA9IHRydWU7XG4gICAgdXBkYXRlU3RyZWFtKHMpO1xuICB9XG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihzLCBsaXN0ZW5lcnMpIHtcbiAgdmFyIGlkeCA9IGxpc3RlbmVycy5pbmRleE9mKHMpO1xuICBsaXN0ZW5lcnNbaWR4XSA9IGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV07XG4gIGxpc3RlbmVycy5sZW5ndGgtLTtcbn1cblxuZnVuY3Rpb24gZGV0YWNoRGVwcyhzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcy5kZXBzLmxlbmd0aDsgKytpKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIocywgcy5kZXBzW2ldLmxpc3RlbmVycyk7XG4gIH1cbiAgcy5kZXBzLmxlbmd0aCA9IDA7XG59XG5cbmZ1bmN0aW9uIGVuZFN0cmVhbShzKSB7XG4gIGlmIChzLmRlcHMgIT09IHVuZGVmaW5lZCkgZGV0YWNoRGVwcyhzKTtcbiAgaWYgKHMuZW5kICE9PSB1bmRlZmluZWQpIGRldGFjaERlcHMocy5lbmQpO1xufVxuXG5mdW5jdGlvbiBlbmRzT24oZW5kUywgcykge1xuICBkZXRhY2hEZXBzKHMuZW5kKTtcbiAgZW5kUy5saXN0ZW5lcnMucHVzaChzLmVuZCk7XG4gIHMuZW5kLmRlcHMucHVzaChlbmRTKTtcbiAgcmV0dXJuIHM7XG59XG5cbmZ1bmN0aW9uIHRydWVGbigpIHsgcmV0dXJuIHRydWU7IH1cblxuZnVuY3Rpb24gc3RyZWFtKGFyZywgZm4pIHtcbiAgdmFyIGksIHMsIGRlcHMsIGRlcEVuZFN0cmVhbXM7XG4gIHZhciBlbmRTdHJlYW0gPSBjcmVhdGVEZXBlbmRlbnRTdHJlYW0oW10sIHRydWVGbik7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgIGRlcHMgPSBbXTsgZGVwRW5kU3RyZWFtcyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcmcubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChhcmdbaV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZXBzLnB1c2goYXJnW2ldKTtcbiAgICAgICAgaWYgKGFyZ1tpXS5lbmQgIT09IHVuZGVmaW5lZCkgZGVwRW5kU3RyZWFtcy5wdXNoKGFyZ1tpXS5lbmQpO1xuICAgICAgfVxuICAgIH1cbiAgICBzID0gY3JlYXRlRGVwZW5kZW50U3RyZWFtKGRlcHMsIGZuKTtcbiAgICBzLmVuZCA9IGVuZFN0cmVhbTtcbiAgICBlbmRTdHJlYW0ubGlzdGVuZXJzLnB1c2gocyk7XG4gICAgYWRkTGlzdGVuZXJzKGRlcEVuZFN0cmVhbXMsIGVuZFN0cmVhbSk7XG4gICAgZW5kU3RyZWFtLmRlcHMgPSBkZXBFbmRTdHJlYW1zO1xuICAgIHVwZGF0ZVN0cmVhbShzKTtcbiAgfSBlbHNlIHtcbiAgICBzID0gY3JlYXRlU3RyZWFtKCk7XG4gICAgcy5lbmQgPSBlbmRTdHJlYW07XG4gICAgZW5kU3RyZWFtLmxpc3RlbmVycy5wdXNoKHMpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBzKGFyZyk7XG4gIH1cbiAgcmV0dXJuIHM7XG59XG5cbnZhciB0cmFuc2R1Y2UgPSBjdXJyeU4oMiwgZnVuY3Rpb24oeGZvcm0sIHNvdXJjZSkge1xuICB4Zm9ybSA9IHhmb3JtKG5ldyBTdHJlYW1UcmFuc2Zvcm1lcigpKTtcbiAgcmV0dXJuIHN0cmVhbShbc291cmNlXSwgZnVuY3Rpb24oc2VsZikge1xuICAgIHZhciByZXMgPSB4Zm9ybVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSh1bmRlZmluZWQsIHNvdXJjZSgpKTtcbiAgICBpZiAocmVzICYmIHJlc1snQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSA9PT0gdHJ1ZSkge1xuICAgICAgc2VsZi5lbmQodHJ1ZSk7XG4gICAgICByZXR1cm4gcmVzWydAQHRyYW5zZHVjZXIvdmFsdWUnXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gIH0pO1xufSk7XG5cbmZ1bmN0aW9uIFN0cmVhbVRyYW5zZm9ybWVyKCkgeyB9XG5TdHJlYW1UcmFuc2Zvcm1lci5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBmdW5jdGlvbigpIHsgfTtcblN0cmVhbVRyYW5zZm9ybWVyLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24oKSB7IH07XG5TdHJlYW1UcmFuc2Zvcm1lci5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbihzLCB2KSB7IHJldHVybiB2OyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RyZWFtOiBzdHJlYW0sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgdHJhbnNkdWNlOiB0cmFuc2R1Y2UsXG4gIG1lcmdlOiBtZXJnZSxcbiAgc2Nhbjogc2NhbixcbiAgZW5kc09uOiBlbmRzT24sXG4gIG1hcDogY3VycnlOKDIsIG1hcCksXG4gIG9uOiBjdXJyeU4oMiwgb24pLFxuICBjdXJyeU46IGN1cnJ5TixcbiAgaW1tZWRpYXRlOiBpbW1lZGlhdGUsXG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vZmx5ZC9saWIvaW5kZXguanNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgX2FyaXR5ID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fYXJpdHknKTtcbnZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkxJyk7XG52YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xudmFyIF9jdXJyeU4gPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeU4nKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBjdXJyaWVkIGVxdWl2YWxlbnQgb2YgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLCB3aXRoIHRoZVxuICogc3BlY2lmaWVkIGFyaXR5LiBUaGUgY3VycmllZCBmdW5jdGlvbiBoYXMgdHdvIHVudXN1YWwgY2FwYWJpbGl0aWVzLlxuICogRmlyc3QsIGl0cyBhcmd1bWVudHMgbmVlZG4ndCBiZSBwcm92aWRlZCBvbmUgYXQgYSB0aW1lLiBJZiBgZ2AgaXNcbiAqIGBSLmN1cnJ5TigzLCBmKWAsIHRoZSBmb2xsb3dpbmcgYXJlIGVxdWl2YWxlbnQ6XG4gKlxuICogICAtIGBnKDEpKDIpKDMpYFxuICogICAtIGBnKDEpKDIsIDMpYFxuICogICAtIGBnKDEsIDIpKDMpYFxuICogICAtIGBnKDEsIDIsIDMpYFxuICpcbiAqIFNlY29uZGx5LCB0aGUgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSBgUi5fX2AgbWF5IGJlIHVzZWQgdG8gc3BlY2lmeVxuICogXCJnYXBzXCIsIGFsbG93aW5nIHBhcnRpYWwgYXBwbGljYXRpb24gb2YgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyxcbiAqIHJlZ2FyZGxlc3Mgb2YgdGhlaXIgcG9zaXRpb25zLiBJZiBgZ2AgaXMgYXMgYWJvdmUgYW5kIGBfYCBpcyBgUi5fX2AsXG4gKiB0aGUgZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICpcbiAqICAgLSBgZygxLCAyLCAzKWBcbiAqICAgLSBgZyhfLCAyLCAzKSgxKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxKSgyKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxLCAyKWBcbiAqICAgLSBgZyhfLCAyKSgxKSgzKWBcbiAqICAgLSBgZyhfLCAyKSgxLCAzKWBcbiAqICAgLSBgZyhfLCAyKShfLCAzKSgxKWBcbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHNpZyBOdW1iZXIgLT4gKCogLT4gYSkgLT4gKCogLT4gYSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIGFyaXR5IGZvciB0aGUgcmV0dXJuZWQgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcsIGN1cnJpZWQgZnVuY3Rpb24uXG4gKiBAc2VlIFIuY3VycnlcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICB2YXIgYWRkRm91ck51bWJlcnMgPSBmdW5jdGlvbigpIHtcbiAqICAgICAgICByZXR1cm4gUi5zdW0oW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIDQpKTtcbiAqICAgICAgfTtcbiAqXG4gKiAgICAgIHZhciBjdXJyaWVkQWRkRm91ck51bWJlcnMgPSBSLmN1cnJ5Tig0LCBhZGRGb3VyTnVtYmVycyk7XG4gKiAgICAgIHZhciBmID0gY3VycmllZEFkZEZvdXJOdW1iZXJzKDEsIDIpO1xuICogICAgICB2YXIgZyA9IGYoMyk7XG4gKiAgICAgIGcoNCk7IC8vPT4gMTBcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIGN1cnJ5TihsZW5ndGgsIGZuKSB7XG4gIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gX2N1cnJ5MShmbik7XG4gIH1cbiAgcmV0dXJuIF9hcml0eShsZW5ndGgsIF9jdXJyeU4obGVuZ3RoLCBbXSwgZm4pKTtcbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcmFtZGEvc3JjL2N1cnJ5Ti5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2FyaXR5KG4sIGZuKSB7XG4gIC8vIGpzaGludCB1bnVzZWQ6dmFyc1xuICBzd2l0Y2ggKG4pIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYTApIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExKSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA1OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgNjogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA3OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA4OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgOTogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxMDogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gX2FyaXR5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciBubyBncmVhdGVyIHRoYW4gdGVuJyk7XG4gIH1cbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9yYW1kYS9zcmMvaW50ZXJuYWwvX2FyaXR5LmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBPcHRpbWl6ZWQgaW50ZXJuYWwgdHdvLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfY3VycnkxKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmMShhKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmMTtcbiAgICB9IGVsc2UgaWYgKGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcmFtZGEvc3JjL2ludGVybmFsL19jdXJyeTEuanNcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vX2N1cnJ5MScpO1xuXG5cbi8qKlxuICogT3B0aW1pemVkIGludGVybmFsIHR3by1hcml0eSBjdXJyeSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2N1cnJ5Mihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gZjIoYSwgYikge1xuICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgcmV0dXJuIGYyO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMSAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZuKGEsIGIpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYyO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGZuKGEsIGIpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihiKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbihhLCBiKTtcbiAgICB9XG4gIH07XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcmFtZGEvc3JjL2ludGVybmFsL19jdXJyeTIuanNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgX2FyaXR5ID0gcmVxdWlyZSgnLi9fYXJpdHknKTtcblxuXG4vKipcbiAqIEludGVybmFsIGN1cnJ5TiBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBhcml0eSBvZiB0aGUgY3VycmllZCBmdW5jdGlvbi5cbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSBvZiBhcmd1bWVudHMgcmVjZWl2ZWQgdGh1cyBmYXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2N1cnJ5TihsZW5ndGgsIHJlY2VpdmVkLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbWJpbmVkID0gW107XG4gICAgdmFyIGFyZ3NJZHggPSAwO1xuICAgIHZhciBsZWZ0ID0gbGVuZ3RoO1xuICAgIHZhciBjb21iaW5lZElkeCA9IDA7XG4gICAgd2hpbGUgKGNvbWJpbmVkSWR4IDwgcmVjZWl2ZWQubGVuZ3RoIHx8IGFyZ3NJZHggPCBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgaWYgKGNvbWJpbmVkSWR4IDwgcmVjZWl2ZWQubGVuZ3RoICYmXG4gICAgICAgICAgKHJlY2VpdmVkW2NvbWJpbmVkSWR4XSA9PSBudWxsIHx8XG4gICAgICAgICAgIHJlY2VpdmVkW2NvbWJpbmVkSWR4XVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gIT09IHRydWUgfHxcbiAgICAgICAgICAgYXJnc0lkeCA+PSBhcmd1bWVudHMubGVuZ3RoKSkge1xuICAgICAgICByZXN1bHQgPSByZWNlaXZlZFtjb21iaW5lZElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBhcmd1bWVudHNbYXJnc0lkeF07XG4gICAgICAgIGFyZ3NJZHggKz0gMTtcbiAgICAgIH1cbiAgICAgIGNvbWJpbmVkW2NvbWJpbmVkSWR4XSA9IHJlc3VsdDtcbiAgICAgIGlmIChyZXN1bHQgPT0gbnVsbCB8fCByZXN1bHRbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddICE9PSB0cnVlKSB7XG4gICAgICAgIGxlZnQgLT0gMTtcbiAgICAgIH1cbiAgICAgIGNvbWJpbmVkSWR4ICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBsZWZ0IDw9IDAgPyBmbi5hcHBseSh0aGlzLCBjb21iaW5lZCkgOiBfYXJpdHkobGVmdCwgX2N1cnJ5TihsZW5ndGgsIGNvbWJpbmVkLCBmbikpO1xuICB9O1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnlOLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGZseWQgPSByZXF1aXJlKCdmbHlkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZmx5ZC5jdXJyeU4oMiwgZnVuY3Rpb24odGFyZywgZm4pIHtcbiAgdmFyIHMgPSBmbHlkLnN0cmVhbSgpO1xuICBmbHlkLm1hcChmdW5jdGlvbih2KSB7IHRhcmcoZm4odikpOyB9LCBzKTtcbiAgcmV0dXJuIHM7XG59KTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2ZseWQvbW9kdWxlL2ZvcndhcmR0by9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjdXJyeU4gPSByZXF1aXJlKCdyYW1kYS9zcmMvY3VycnlOJyk7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHMpIHsgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJzsgfVxuZnVuY3Rpb24gaXNOdW1iZXIobikgeyByZXR1cm4gdHlwZW9mIG4gPT09ICdudW1iZXInOyB9XG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZikgeyByZXR1cm4gdHlwZW9mIGYgPT09ICdmdW5jdGlvbic7IH1cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhKSB7IHJldHVybiAnbGVuZ3RoJyBpbiBhOyB9O1xuXG52YXIgbWFwQ29uc3RyVG9GbiA9IGN1cnJ5TigyLCBmdW5jdGlvbihncm91cCwgY29uc3RyKSB7XG4gIHJldHVybiBjb25zdHIgPT09IFN0cmluZyAgICA/IGlzU3RyaW5nXG4gICAgICAgOiBjb25zdHIgPT09IE51bWJlciAgICA/IGlzTnVtYmVyXG4gICAgICAgOiBjb25zdHIgPT09IE9iamVjdCAgICA/IGlzT2JqZWN0XG4gICAgICAgOiBjb25zdHIgPT09IEFycmF5ICAgICA/IGlzQXJyYXlcbiAgICAgICA6IGNvbnN0ciA9PT0gRnVuY3Rpb24gID8gaXNGdW5jdGlvblxuICAgICAgIDogY29uc3RyID09PSB1bmRlZmluZWQgPyBncm91cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBjb25zdHI7XG59KTtcblxuZnVuY3Rpb24gQ29uc3RydWN0b3IoZ3JvdXAsIG5hbWUsIHZhbGlkYXRvcnMpIHtcbiAgdmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMubWFwKG1hcENvbnN0clRvRm4oZ3JvdXApKTtcbiAgdmFyIGNvbnN0cnVjdG9yID0gY3VycnlOKHZhbGlkYXRvcnMubGVuZ3RoLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsID0gW10sIHYsIHZhbGlkYXRvcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgdiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIHZhbGlkYXRvciA9IHZhbGlkYXRvcnNbaV07XG4gICAgICBpZiAoKHR5cGVvZiB2YWxpZGF0b3IgPT09ICdmdW5jdGlvbicgJiYgdmFsaWRhdG9yKHYpKSB8fFxuICAgICAgICAgICh2ICE9PSB1bmRlZmluZWQgJiYgdiAhPT0gbnVsbCAmJiB2Lm9mID09PSB2YWxpZGF0b3IpKSB7XG4gICAgICAgIHZhbFtpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dyb25nIHZhbHVlICcgKyB2ICsgJyBwYXNzZWQgdG8gbG9jYXRpb24gJyArIGkgKyAnIGluICcgKyBuYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFsLm9mID0gZ3JvdXA7XG4gICAgdmFsLm5hbWUgPSBuYW1lO1xuICAgIHJldHVybiB2YWw7XG4gIH0pO1xuICByZXR1cm4gY29uc3RydWN0b3I7XG59XG5cbmZ1bmN0aW9uIHJhd0Nhc2UodHlwZSwgY2FzZXMsIGFjdGlvbiwgYXJnKSB7XG4gIGlmICh0eXBlICE9PSBhY3Rpb24ub2YpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dyb25nIHR5cGUgcGFzc2VkIHRvIGNhc2UnKTtcbiAgdmFyIG5hbWUgPSBhY3Rpb24ubmFtZSBpbiBjYXNlcyA/IGFjdGlvbi5uYW1lXG4gICAgICAgICAgIDogJ18nIGluIGNhc2VzICAgICAgICAgPyAnXydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgaWYgKG5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5oYW5kbGVkIHZhbHVlIHBhc3NlZCB0byBjYXNlJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNhc2VzW25hbWVdLmFwcGx5KHVuZGVmaW5lZCwgYXJnICE9PSB1bmRlZmluZWQgPyBhY3Rpb24uY29uY2F0KFthcmddKSA6IGFjdGlvbik7XG4gIH1cbn1cblxudmFyIHR5cGVDYXNlID0gY3VycnlOKDMsIHJhd0Nhc2UpO1xudmFyIGNhc2VPbiA9IGN1cnJ5Tig0LCByYXdDYXNlKTtcblxuZnVuY3Rpb24gVHlwZShkZXNjKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgZm9yICh2YXIga2V5IGluIGRlc2MpIHtcbiAgICBvYmpba2V5XSA9IENvbnN0cnVjdG9yKG9iaiwga2V5LCBkZXNjW2tleV0pO1xuICB9XG4gIG9iai5jYXNlID0gdHlwZUNhc2Uob2JqKTtcbiAgb2JqLmNhc2VPbiA9IGNhc2VPbihvYmopO1xuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi91bmlvbi10eXBlL3VuaW9uLXR5cGUuanNcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xudmFyIF9jdXJyeU4gPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeU4nKTtcbnZhciBhcml0eSA9IHJlcXVpcmUoJy4vYXJpdHknKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBjdXJyaWVkIGVxdWl2YWxlbnQgb2YgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLCB3aXRoIHRoZVxuICogc3BlY2lmaWVkIGFyaXR5LiBUaGUgY3VycmllZCBmdW5jdGlvbiBoYXMgdHdvIHVudXN1YWwgY2FwYWJpbGl0aWVzLlxuICogRmlyc3QsIGl0cyBhcmd1bWVudHMgbmVlZG4ndCBiZSBwcm92aWRlZCBvbmUgYXQgYSB0aW1lLiBJZiBgZ2AgaXNcbiAqIGBSLmN1cnJ5TigzLCBmKWAsIHRoZSBmb2xsb3dpbmcgYXJlIGVxdWl2YWxlbnQ6XG4gKlxuICogICAtIGBnKDEpKDIpKDMpYFxuICogICAtIGBnKDEpKDIsIDMpYFxuICogICAtIGBnKDEsIDIpKDMpYFxuICogICAtIGBnKDEsIDIsIDMpYFxuICpcbiAqIFNlY29uZGx5LCB0aGUgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSBgUi5fX2AgbWF5IGJlIHVzZWQgdG8gc3BlY2lmeVxuICogXCJnYXBzXCIsIGFsbG93aW5nIHBhcnRpYWwgYXBwbGljYXRpb24gb2YgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyxcbiAqIHJlZ2FyZGxlc3Mgb2YgdGhlaXIgcG9zaXRpb25zLiBJZiBgZ2AgaXMgYXMgYWJvdmUgYW5kIGBfYCBpcyBgUi5fX2AsXG4gKiB0aGUgZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICpcbiAqICAgLSBgZygxLCAyLCAzKWBcbiAqICAgLSBgZyhfLCAyLCAzKSgxKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxKSgyKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxLCAyKWBcbiAqICAgLSBgZyhfLCAyKSgxKSgzKWBcbiAqICAgLSBgZyhfLCAyKSgxLCAzKWBcbiAqICAgLSBgZyhfLCAyKShfLCAzKSgxKWBcbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHNpZyBOdW1iZXIgLT4gKCogLT4gYSkgLT4gKCogLT4gYSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIGFyaXR5IGZvciB0aGUgcmV0dXJuZWQgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcsIGN1cnJpZWQgZnVuY3Rpb24uXG4gKiBAc2VlIFIuY3VycnlcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICB2YXIgYWRkRm91ck51bWJlcnMgPSBmdW5jdGlvbigpIHtcbiAqICAgICAgICByZXR1cm4gUi5zdW0oW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIDQpKTtcbiAqICAgICAgfTtcbiAqXG4gKiAgICAgIHZhciBjdXJyaWVkQWRkRm91ck51bWJlcnMgPSBSLmN1cnJ5Tig0LCBhZGRGb3VyTnVtYmVycyk7XG4gKiAgICAgIHZhciBmID0gY3VycmllZEFkZEZvdXJOdW1iZXJzKDEsIDIpO1xuICogICAgICB2YXIgZyA9IGYoMyk7XG4gKiAgICAgIGcoNCk7IC8vPT4gMTBcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIGN1cnJ5TihsZW5ndGgsIGZuKSB7XG4gIHJldHVybiBhcml0eShsZW5ndGgsIF9jdXJyeU4obGVuZ3RoLCBbXSwgZm4pKTtcbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9jdXJyeU4uanNcbiAqKiBtb2R1bGUgaWQgPSAxMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL19jdXJyeTEnKTtcblxuXG4vKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCB0d28tYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeTIoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYyKGEsIGIpIHtcbiAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjI7XG4gICAgfSBlbHNlIGlmIChuID09PSAxKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihiKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihhKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYikgeyByZXR1cm4gZm4oYSwgYik7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oYSwgYik7XG4gICAgfVxuICB9O1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3VuaW9uLXR5cGUvfi9yYW1kYS9zcmMvaW50ZXJuYWwvX2N1cnJ5Mi5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCB0d28tYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeTEoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYxKGEpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGYxO1xuICAgIH0gZWxzZSBpZiAoYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbihhKTtcbiAgICB9XG4gIH07XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhcml0eSA9IHJlcXVpcmUoJy4uL2FyaXR5Jyk7XG5cblxuLyoqXG4gKiBJbnRlcm5hbCBjdXJyeU4gZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCBUaGUgYXJpdHkgb2YgdGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHJlY2VpdmVkIHRodXMgZmFyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeU4obGVuZ3RoLCByZWNlaXZlZCwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb21iaW5lZCA9IFtdO1xuICAgIHZhciBhcmdzSWR4ID0gMDtcbiAgICB2YXIgbGVmdCA9IGxlbmd0aDtcbiAgICB2YXIgY29tYmluZWRJZHggPSAwO1xuICAgIHdoaWxlIChjb21iaW5lZElkeCA8IHJlY2VpdmVkLmxlbmd0aCB8fCBhcmdzSWR4IDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGlmIChjb21iaW5lZElkeCA8IHJlY2VpdmVkLmxlbmd0aCAmJlxuICAgICAgICAgIChyZWNlaXZlZFtjb21iaW5lZElkeF0gPT0gbnVsbCB8fFxuICAgICAgICAgICByZWNlaXZlZFtjb21iaW5lZElkeF1bJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddICE9PSB0cnVlIHx8XG4gICAgICAgICAgIGFyZ3NJZHggPj0gYXJndW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVjZWl2ZWRbY29tYmluZWRJZHhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gYXJndW1lbnRzW2FyZ3NJZHhdO1xuICAgICAgICBhcmdzSWR4ICs9IDE7XG4gICAgICB9XG4gICAgICBjb21iaW5lZFtjb21iaW5lZElkeF0gPSByZXN1bHQ7XG4gICAgICBpZiAocmVzdWx0ID09IG51bGwgfHwgcmVzdWx0WydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSAhPT0gdHJ1ZSkge1xuICAgICAgICBsZWZ0IC09IDE7XG4gICAgICB9XG4gICAgICBjb21iaW5lZElkeCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gbGVmdCA8PSAwID8gZm4uYXBwbHkodGhpcywgY29tYmluZWQpIDogYXJpdHkobGVmdCwgX2N1cnJ5TihsZW5ndGgsIGNvbWJpbmVkLCBmbikpO1xuICB9O1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3VuaW9uLXR5cGUvfi9yYW1kYS9zcmMvaW50ZXJuYWwvX2N1cnJ5Ti5qc1xuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xuXG5cbi8qKlxuICogV3JhcHMgYSBmdW5jdGlvbiBvZiBhbnkgYXJpdHkgKGluY2x1ZGluZyBudWxsYXJ5KSBpbiBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBleGFjdGx5IGBuYFxuICogcGFyYW1ldGVycy4gVW5saWtlIGBuQXJ5YCwgd2hpY2ggcGFzc2VzIG9ubHkgYG5gIGFyZ3VtZW50cyB0byB0aGUgd3JhcHBlZCBmdW5jdGlvbixcbiAqIGZ1bmN0aW9ucyBwcm9kdWNlZCBieSBgYXJpdHlgIHdpbGwgcGFzcyBhbGwgcHJvdmlkZWQgYXJndW1lbnRzIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpZyAoTnVtYmVyLCAoKiAtPiAqKSkgLT4gKCogLT4gKilcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IG4gVGhlIGRlc2lyZWQgYXJpdHkgb2YgdGhlIHJldHVybmVkIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24gd3JhcHBpbmcgYGZuYC4gVGhlIG5ldyBmdW5jdGlvbiBpc1xuICogICAgICAgICBndWFyYW50ZWVkIHRvIGJlIG9mIGFyaXR5IGBuYC5cbiAqIEBkZXByZWNhdGVkIHNpbmNlIHYwLjE1LjBcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICB2YXIgdGFrZXNUd29BcmdzID0gZnVuY3Rpb24oYSwgYikge1xuICogICAgICAgIHJldHVybiBbYSwgYl07XG4gKiAgICAgIH07XG4gKiAgICAgIHRha2VzVHdvQXJncy5sZW5ndGg7IC8vPT4gMlxuICogICAgICB0YWtlc1R3b0FyZ3MoMSwgMik7IC8vPT4gWzEsIDJdXG4gKlxuICogICAgICB2YXIgdGFrZXNPbmVBcmcgPSBSLmFyaXR5KDEsIHRha2VzVHdvQXJncyk7XG4gKiAgICAgIHRha2VzT25lQXJnLmxlbmd0aDsgLy89PiAxXG4gKiAgICAgIC8vIEFsbCBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uXG4gKiAgICAgIHRha2VzT25lQXJnKDEsIDIpOyAvLz0+IFsxLCAyXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTIoZnVuY3Rpb24obiwgZm4pIHtcbiAgLy8ganNoaW50IHVudXNlZDp2YXJzXG4gIHN3aXRjaCAobikge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmN0aW9uKCkge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYTApIHtyZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTt9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSkge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMikge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMpIHtyZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTt9O1xuICAgIGNhc2UgNTogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCkge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSA2OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSkge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSA3OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYpIHtyZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTt9O1xuICAgIGNhc2UgODogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNykge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSA5OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCkge3JldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO307XG4gICAgY2FzZSAxMDogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSB7cmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7fTtcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIGFyaXR5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciBubyBncmVhdGVyIHRoYW4gdGVuJyk7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vdW5pb24tdHlwZS9+L3JhbWRhL3NyYy9hcml0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBqc2hpbnQgbmV3Y2FwOiBmYWxzZVxuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZG9jdW1lbnQsIEVsZW1lbnQgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xuXG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG5cbmZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICByZXR1cm4gVk5vZGUoZWxtLnRhZ05hbWUsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xufVxuXG52YXIgZW1wdHlOb2RlID0gVk5vZGUoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXG52YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlO1xuXG5mdW5jdGlvbiBzYW1lVm5vZGUodm5vZGUxLCB2bm9kZTIpIHtcbiAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgdmFyIGksIG1hcCA9IHt9LCBrZXk7XG4gIGZvciAoaSA9IGJlZ2luSWR4OyBpIDw9IGVuZElkeDsgKytpKSB7XG4gICAga2V5ID0gY2hpbGRyZW5baV0ua2V5O1xuICAgIGlmIChpc0RlZihrZXkpKSBtYXBba2V5XSA9IGk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUm1DYihjaGlsZEVsbSwgbGlzdGVuZXJzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIGNoaWxkRWxtLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGRFbG0pO1xuICB9O1xufVxuXG52YXIgaG9va3MgPSBbJ2NyZWF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knLCAncHJlJywgJ3Bvc3QnXTtcblxuZnVuY3Rpb24gaW5pdChtb2R1bGVzKSB7XG4gIHZhciBpLCBqLCBjYnMgPSB7fTtcbiAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzW2ldXSA9IFtdO1xuICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICBpZiAobW9kdWxlc1tqXVtob29rc1tpXV0gIT09IHVuZGVmaW5lZCkgY2JzW2hvb2tzW2ldXS5wdXNoKG1vZHVsZXNbal1baG9va3NbaV1dKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVFbG0odm5vZGUpIHtcbiAgICB2YXIgaSwgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIGkodm5vZGUpO1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLnZub2RlKSkgdm5vZGUgPSBpO1xuICAgIH1cbiAgICB2YXIgZWxtLCBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuLCBzZWwgPSB2bm9kZS5zZWw7XG4gICAgaWYgKGlzRGVmKHNlbCkpIHtcbiAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gaXNEZWYoZGF0YSkgJiYgaXNEZWYoaSA9IGRhdGEubnMpID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgIGlmIChoYXNoIDwgZG90KSBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICBpZiAoZG90SWR4ID4gMCkgZWxtLmNsYXNzTmFtZSA9IHNlbC5zbGljZShkb3QrMSkucmVwbGFjZSgvXFwuL2csICcgJyk7XG4gICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGVsbS5hcHBlbmRDaGlsZChjcmVhdGVFbG0oY2hpbGRyZW5baV0pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgZWxtLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICBpZiAoaS5jcmVhdGUpIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICBpZiAoaS5pbnNlcnQpIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZS5lbG07XG4gIH1cblxuICBmdW5jdGlvbiBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIHBhcmVudEVsbS5pbnNlcnRCZWZvcmUoY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0pLCBiZWZvcmUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgdmFyIGkgPSB2bm9kZS5kYXRhLCBqO1xuICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKSBpKHZub2RlKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuZGVzdHJveS5sZW5ndGg7ICsraSkgY2JzLmRlc3Ryb3lbaV0odm5vZGUpO1xuICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5jaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2sodm5vZGUuY2hpbGRyZW5bal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgdmFyIGksIGxpc3RlbmVycywgcm0sIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgICAgbGlzdGVuZXJzID0gY2JzLnJlbW92ZS5sZW5ndGggKyAxO1xuICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5yZW1vdmUubGVuZ3RoOyArK2kpIGNicy5yZW1vdmVbaV0oY2gsIHJtKTtcbiAgICAgICAgICBpZiAoaXNEZWYoaSA9IGNoLmRhdGEpICYmIGlzRGVmKGkgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBpLnJlbW92ZSkpIHtcbiAgICAgICAgICAgIGkoY2gsIHJtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIFRleHQgbm9kZVxuICAgICAgICAgIHBhcmVudEVsbS5yZW1vdmVDaGlsZChjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIGJlZm9yZTtcblxuICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICBpZiAoaXNVbmRlZihvbGRTdGFydFZub2RlKSkge1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIGhhcyBiZWVuIG1vdmVkIGxlZnRcbiAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGRFbmRWbm9kZSkpIHtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSkpIHtcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgcmlnaHRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSk7XG4gICAgICAgIHBhcmVudEVsbS5pbnNlcnRCZWZvcmUob2xkU3RhcnRWbm9kZS5lbG0sIG9sZEVuZFZub2RlLmVsbS5uZXh0U2libGluZyk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKTtcbiAgICAgICAgcGFyZW50RWxtLmluc2VydEJlZm9yZShvbGRFbmRWbm9kZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1VuZGVmKG9sZEtleVRvSWR4KSkgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIGlkeEluT2xkID0gb2xkS2V5VG9JZHhbbmV3U3RhcnRWbm9kZS5rZXldO1xuICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHsgLy8gTmV3IGVsZW1lbnRcbiAgICAgICAgICBwYXJlbnRFbG0uaW5zZXJ0QmVmb3JlKGNyZWF0ZUVsbShuZXdTdGFydFZub2RlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbG1Ub01vdmUgPSBvbGRDaFtpZHhJbk9sZF07XG4gICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUpO1xuICAgICAgICAgIG9sZENoW2lkeEluT2xkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBwYXJlbnRFbG0uaW5zZXJ0QmVmb3JlKGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICBiZWZvcmUgPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCsxXSkgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4KzFdLmVsbTtcbiAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpLCBob29rO1xuICAgIGlmIChpc0RlZihpID0gdm5vZGUuZGF0YSkgJiYgaXNEZWYoaG9vayA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucHJlcGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGlmIChpc0RlZihpID0gb2xkVm5vZGUuZGF0YSkgJiYgaXNEZWYoaSA9IGkudm5vZGUpKSBvbGRWbm9kZSA9IGk7XG4gICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihpID0gaS52bm9kZSkpIHZub2RlID0gaTtcbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtLCBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuLCBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHJldHVybjtcbiAgICBpZiAoaXNEZWYodm5vZGUuZGF0YSkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKSBjYnMudXBkYXRlW2ldKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICBpID0gdm5vZGUuZGF0YS5ob29rO1xuICAgICAgaWYgKGlzRGVmKGkpICYmIGlzRGVmKGkgPSBpLnVwZGF0ZSkpIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChvbGRDaCAhPT0gY2gpIHVwZGF0ZUNoaWxkcmVuKGVsbSwgb2xkQ2gsIGNoKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgIGVsbS50ZXh0Q29udGVudCA9IHZub2RlLnRleHQ7XG4gICAgfVxuICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgaTtcbiAgICBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnByZS5sZW5ndGg7ICsraSkgY2JzLnByZVtpXSgpO1xuICAgIGlmIChvbGRWbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIGlmIChvbGRWbm9kZS5wYXJlbnRFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIGNyZWF0ZUVsbSh2bm9kZSk7XG4gICAgICAgIG9sZFZub2RlLnBhcmVudEVsZW1lbnQucmVwbGFjZUNoaWxkKHZub2RlLmVsbSwgb2xkVm5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkVm5vZGUgPSBlbXB0eU5vZGVBdChvbGRWbm9kZSk7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgIH1cbiAgICBpbnNlcnRlZFZub2RlUXVldWUgPSB1bmRlZmluZWQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGNicy5wb3N0Lmxlbmd0aDsgKytpKSBjYnMucG9zdFtpXSgpO1xuICAgIHJldHVybiB2bm9kZTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7aW5pdDogaW5pdH07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zbmFiYmRvbS9zbmFiYmRvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gIHJldHVybiB7c2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXl9O1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3NuYWJiZG9tL3Zub2RlLmpzXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogQXJyYXkuaXNBcnJheSxcbiAgcHJpbWl0aXZlOiBmdW5jdGlvbihzKSB7IHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInOyB9LFxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3NuYWJiZG9tL2lzLmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgY3VyLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MgfHwge30sXG4gICAgICBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3MgfHwge307XG4gIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgIGN1ciA9IGtsYXNzW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzfTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanNcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEucHJvcHMgfHwge30sIHByb3BzID0gdm5vZGUuZGF0YS5wcm9wcyB8fCB7fTtcbiAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICBjdXIgPSBwcm9wc1trZXldO1xuICAgIG9sZCA9IG9sZFByb3BzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICBlbG1ba2V5XSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzXG4gKiogbW9kdWxlIGlkID0gMTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpcyA9IHJlcXVpcmUoJy4uL2lzJyk7XG5cbmZ1bmN0aW9uIGFyckludm9rZXIoYXJyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2Ugd2hlbiBsZW5ndGggaXMgdHdvLCBmb3IgcGVyZm9ybWFuY2VcbiAgICBhcnIubGVuZ3RoID09PSAyID8gYXJyWzBdKGFyclsxXSkgOiBhcnJbMF0uYXBwbHkodW5kZWZpbmVkLCBhcnIuc2xpY2UoMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmbkludm9rZXIobykge1xuICByZXR1cm4gZnVuY3Rpb24oZXYpIHsgby5mbihldik7IH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50TGlzdGVuZXJzKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgbmFtZSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZE9uID0gb2xkVm5vZGUuZGF0YS5vbiB8fCB7fSwgb24gPSB2bm9kZS5kYXRhLm9uO1xuICBpZiAoIW9uKSByZXR1cm47XG4gIGZvciAobmFtZSBpbiBvbikge1xuICAgIGN1ciA9IG9uW25hbWVdO1xuICAgIG9sZCA9IG9sZE9uW25hbWVdO1xuICAgIGlmIChvbGQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGlzLmFycmF5KGN1cikpIHtcbiAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgYXJySW52b2tlcihjdXIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1ciA9IHtmbjogY3VyfTtcbiAgICAgICAgb25bbmFtZV0gPSBjdXI7XG4gICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuSW52b2tlcihjdXIpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzLmFycmF5KG9sZCkpIHtcbiAgICAgIC8vIERlbGliZXJhdGVseSBtb2RpZnkgb2xkIGFycmF5IHNpbmNlIGl0J3MgY2FwdHVyZWQgaW4gY2xvc3VyZSBjcmVhdGVkIHdpdGggYGFyckludm9rZXJgXG4gICAgICBvbGQubGVuZ3RoID0gY3VyLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgKytpKSBvbGRbaV0gPSBjdXJbaV07XG4gICAgICBvbltuYW1lXSAgPSBvbGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5mbiA9IGN1cjtcbiAgICAgIG9uW25hbWVdID0gb2xkO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzLCB1cGRhdGU6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzfTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMuanNcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBzZXRUaW1lb3V0O1xudmFyIG5leHRGcmFtZSA9IGZ1bmN0aW9uKGZuKSB7IHJhZihmdW5jdGlvbigpIHsgcmFmKGZuKTsgfSk7IH07XG5cbmZ1bmN0aW9uIHNldE5leHRGcmFtZShvYmosIHByb3AsIHZhbCkge1xuICBuZXh0RnJhbWUoZnVuY3Rpb24oKSB7IG9ialtwcm9wXSA9IHZhbDsgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgY3VyLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRTdHlsZSA9IG9sZFZub2RlLmRhdGEuc3R5bGUgfHwge30sXG4gICAgICBzdHlsZSA9IHZub2RlLmRhdGEuc3R5bGUgfHwge30sXG4gICAgICBvbGRIYXNEZWwgPSAnZGVsYXllZCcgaW4gb2xkU3R5bGU7XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGN1ciA9IHN0eWxlW25hbWVdO1xuICAgIGlmIChuYW1lID09PSAnZGVsYXllZCcpIHtcbiAgICAgIGZvciAobmFtZSBpbiBzdHlsZS5kZWxheWVkKSB7XG4gICAgICAgIGN1ciA9IHN0eWxlLmRlbGF5ZWRbbmFtZV07XG4gICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgIHNldE5leHRGcmFtZShlbG0uc3R5bGUsIG5hbWUsIGN1cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgIT09ICdyZW1vdmUnICYmIGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgdmFyIHN0eWxlLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIShzdHlsZSA9IHMuZGVzdHJveSkpIHJldHVybjtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlSZW1vdmVTdHlsZSh2bm9kZSwgcm0pIHtcbiAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIXMucmVtb3ZlKSB7XG4gICAgcm0oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgaWR4LCBpID0gMCwgbWF4RHVyID0gMCxcbiAgICAgIGNvbXBTdHlsZSwgc3R5bGUgPSBzLnJlbW92ZSwgYW1vdW50ID0gMCwgYXBwbGllZCA9IFtdO1xuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBhcHBsaWVkLnB1c2gobmFtZSk7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbiAgY29tcFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbG0pO1xuICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgZm9yICg7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgIGlmKGFwcGxpZWQuaW5kZXhPZihwcm9wc1tpXSkgIT09IC0xKSBhbW91bnQrKztcbiAgfVxuICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgaWYgKGV2LnRhcmdldCA9PT0gZWxtKSAtLWFtb3VudDtcbiAgICBpZiAoYW1vdW50ID09PSAwKSBybSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVTdHlsZSwgdXBkYXRlOiB1cGRhdGVTdHlsZSwgZGVzdHJveTogYXBwbHlEZXN0cm95U3R5bGUsIHJlbW92ZTogYXBwbHlSZW1vdmVTdHlsZX07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9zbmFiYmRvbS9tb2R1bGVzL3N0eWxlLmpzXG4gKiogbW9kdWxlIGlkID0gMjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBWTm9kZSA9IHJlcXVpcmUoJy4vdm5vZGUnKTtcbnZhciBpcyA9IHJlcXVpcmUoJy4vaXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoKHNlbCwgYiwgYykge1xuICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICBkYXRhID0gYjtcbiAgICBpZiAoaXMuYXJyYXkoYykpIHsgY2hpbGRyZW4gPSBjOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7IHRleHQgPSBjOyB9XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChpcy5hcnJheShiKSkgeyBjaGlsZHJlbiA9IGI7IH1cbiAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHsgdGV4dCA9IGI7IH1cbiAgICBlbHNlIHsgZGF0YSA9IGI7IH1cbiAgfVxuICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSkgY2hpbGRyZW5baV0gPSBWTm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBWTm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCB1bmRlZmluZWQpO1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3NuYWJiZG9tL2guanNcbiAqKiBtb2R1bGUgaWQgPSAyMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBjdWlkLmpzXG4gKiBDb2xsaXNpb24tcmVzaXN0YW50IFVJRCBnZW5lcmF0b3IgZm9yIGJyb3dzZXJzIGFuZCBub2RlLlxuICogU2VxdWVudGlhbCBmb3IgZmFzdCBkYiBsb29rdXBzIGFuZCByZWNlbmN5IHNvcnRpbmcuXG4gKiBTYWZlIGZvciBlbGVtZW50IElEcyBhbmQgc2VydmVyLXNpZGUgbG9va3Vwcy5cbiAqXG4gKiBFeHRyYWN0ZWQgZnJvbSBDTENUUlxuICpcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLypnbG9iYWwgd2luZG93LCBuYXZpZ2F0b3IsIGRvY3VtZW50LCByZXF1aXJlLCBwcm9jZXNzLCBtb2R1bGUgKi9cbihmdW5jdGlvbiAoYXBwKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG5hbWVzcGFjZSA9ICdjdWlkJyxcbiAgICBjID0gMCxcbiAgICBibG9ja1NpemUgPSA0LFxuICAgIGJhc2UgPSAzNixcbiAgICBkaXNjcmV0ZVZhbHVlcyA9IE1hdGgucG93KGJhc2UsIGJsb2NrU2l6ZSksXG5cbiAgICBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBzaXplKSB7XG4gICAgICB2YXIgcyA9IFwiMDAwMDAwMDAwXCIgKyBudW07XG4gICAgICByZXR1cm4gcy5zdWJzdHIocy5sZW5ndGgtc2l6ZSk7XG4gICAgfSxcblxuICAgIHJhbmRvbUJsb2NrID0gZnVuY3Rpb24gcmFuZG9tQmxvY2soKSB7XG4gICAgICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICAgICAgICAgIGRpc2NyZXRlVmFsdWVzIDw8IDApXG4gICAgICAgICAgICAudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG4gICAgfSxcblxuICAgIHNhZmVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgYyA9IChjIDwgZGlzY3JldGVWYWx1ZXMpID8gYyA6IDA7XG4gICAgICBjKys7IC8vIHRoaXMgaXMgbm90IHN1YmxpbWluYWxcbiAgICAgIHJldHVybiBjIC0gMTtcbiAgICB9LFxuXG4gICAgYXBpID0gZnVuY3Rpb24gY3VpZCgpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHdpdGggYSBsb3dlcmNhc2UgbGV0dGVyIG1ha2VzXG4gICAgICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gICAgICB2YXIgbGV0dGVyID0gJ2MnLCAvLyBoYXJkLWNvZGVkIGFsbG93cyBmb3Igc2VxdWVudGlhbCBhY2Nlc3NcblxuICAgICAgICAvLyB0aW1lc3RhbXBcbiAgICAgICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgICAgIC8vIHRoYXQgdGhlIHVpZCB3YXMgY3JlYXRlZC5cbiAgICAgICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZyhiYXNlKSxcblxuICAgICAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgICAgICBjb3VudGVyLFxuXG4gICAgICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgICAgIC8vIGNsaWVudHMgKHNvIGRpZmZlcmVudCBjb21wdXRlcnMgYXJlIGZhciBsZXNzXG4gICAgICAgIC8vIGxpa2VseSB0byBnZW5lcmF0ZSB0aGUgc2FtZSBpZClcbiAgICAgICAgZmluZ2VycHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKSxcblxuICAgICAgICAvLyBHcmFiIHNvbWUgbW9yZSBjaGFycyBmcm9tIE1hdGgucmFuZG9tKClcbiAgICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgICAgICAgY291bnRlciA9IHBhZChzYWZlQ291bnRlcigpLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuXG4gICAgICByZXR1cm4gIChsZXR0ZXIgKyB0aW1lc3RhbXAgKyBjb3VudGVyICsgZmluZ2VycHJpbnQgKyByYW5kb20pO1xuICAgIH07XG5cbiAgYXBpLnNsdWcgPSBmdW5jdGlvbiBzbHVnKCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgICAgY291bnRlcixcbiAgICAgIHByaW50ID0gYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoMCwxKSArXG4gICAgICAgIGFwaS5maW5nZXJwcmludCgpLnNsaWNlKC0xKSxcbiAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gICAgICBjb3VudGVyID0gc2FmZUNvdW50ZXIoKS50b1N0cmluZygzNikuc2xpY2UoLTQpO1xuXG4gICAgcmV0dXJuIGRhdGUuc2xpY2UoLTIpICtcbiAgICAgIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbiAgfTtcblxuICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiBnbG9iYWxDb3VudCgpIHtcbiAgICAvLyBXZSB3YW50IHRvIGNhY2hlIHRoZSByZXN1bHRzIG9mIHRoaXNcbiAgICB2YXIgY2FjaGUgPSAoZnVuY3Rpb24gY2FsYygpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAoaSBpbiB3aW5kb3cpIHtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfSgpKTtcblxuICAgIGFwaS5nbG9iYWxDb3VudCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhY2hlOyB9O1xuICAgIHJldHVybiBjYWNoZTtcbiAgfTtcblxuICBhcGkuZmluZ2VycHJpbnQgPSBmdW5jdGlvbiBicm93c2VyUHJpbnQoKSB7XG4gICAgcmV0dXJuIHBhZCgobmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggK1xuICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5sZW5ndGgpLnRvU3RyaW5nKDM2KSArXG4gICAgICBhcGkuZ2xvYmFsQ291bnQoKS50b1N0cmluZygzNiksIDQpO1xuICB9O1xuXG4gIC8vIGRvbid0IGNoYW5nZSBhbnl0aGluZyBmcm9tIGhlcmUgZG93bi5cbiAgaWYgKGFwcC5yZWdpc3Rlcikge1xuICAgIGFwcC5yZWdpc3RlcihuYW1lc3BhY2UsIGFwaSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiAgfSBlbHNlIHtcbiAgICBhcHBbbmFtZXNwYWNlXSA9IGFwaTtcbiAgfVxuXG59KHRoaXMuYXBwbGl0dWRlIHx8IHRoaXMpKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2N1aWQvZGlzdC9icm93c2VyLWN1aWQuanNcbiAqKiBtb2R1bGUgaWQgPSAyM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiY29uc3QgUiA9IHJlcXVpcmUoJ3JhbWRhJyk7XHJcbmNvbnN0IFR5cGUgPSByZXF1aXJlKCd1bmlvbi10eXBlJyk7XHJcbmNvbnN0IGggPSByZXF1aXJlKCdzbmFiYmRvbS9oJyk7XHJcbmNvbnN0IGdyYWJUZXh0ID0gZSA9PiBlLnRhcmdldC52YWx1ZSA7XHJcbmNvbnN0IGNoZWNrTGVuZ3RoID0gIHN0ciA9PiBzdHIubGVuZ3RoID4gMiA/IHN0ciA6IFwiXCIgO1xyXG5cclxuLy8gbW9kZWxcclxuXHJcbmNvbnN0IGluaXQgPSBfID0+ICcnXHJcblxyXG4vLyB1cGRhdGVcclxuXHJcbmNvbnN0IEFjdGlvbiA9IFR5cGUoe1xyXG4gIElucHV0OiBbT2JqZWN0XVxyXG59KTtcclxuY29uc3QgdXBkYXRlID0gQWN0aW9uLmNhc2VPbih7XHJcbiAgSW5wdXQ6IFIuY29tcG9zZSggY2hlY2tMZW5ndGgsIGdyYWJUZXh0IClcclxufSk7XHJcblxyXG4vLyB2aWV3XHJcblxyXG5jb25zdCB2aWV3ID0gKHtmaWx0ZXIkfSkgPT5cclxuICBoKFwiZGl2LnVpLnNlZ21lbnRcIiwgW1xyXG4gICAgaChcImRpYi51aS5ob3Jpem9udGFsLmRpdmlkZXJcIiwgXCJTRUFSQ0ggQ09OVEFDVFwiKSxcclxuICAgIGgoXCJkaXYudWkuaWNvbi5pbnB1dC5mbHVpZFwiLCBbXHJcbiAgICAgIGgoYGlucHV0YCwge1xyXG4gICAgICAgIHByb3BzOiB7cGxhY2Vob2xkZXI6IFwiU2VhcmNoXCIsIHR5cGU6IFwidGV4dFwifSxcclxuICAgICAgICBvbjoge2lucHV0OiBSLmNvbXBvc2UoIGZpbHRlciQsIEFjdGlvbi5JbnB1dCl9XHJcbiAgICAgIH0pLFxyXG4gICAgICBoKFwiaS5zZWFyY2guaWNvblwiKVxyXG4gICAgICBdKVxyXG4gICAgXSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHsgdmlldywgaW5pdCwgdXBkYXRlLCBBY3Rpb24gfVxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBkOi9fcHJvZy9qdXJTdHYuZ2l0aHViLmlvL2FkcmVzc0Jvb2stRWxtX2FyY2gvc3JjL2ZpbHRlcklucHV0LmpzXG4gKiovIiwiY29uc3QgUiA9IHJlcXVpcmUoJ3JhbWRhJyk7XHJcbmNvbnN0IFR5cGUgPSByZXF1aXJlKCd1bmlvbi10eXBlJyk7XHJcbmNvbnN0IGggPSByZXF1aXJlKCdzbmFiYmRvbS9oJyk7XHJcblxyXG4vLyBtb2RlbFxyXG5cclxuY29uc3QgaW5pdCA9ICgpID0+ICh7ZW1haWw6ICcnLCBmaXJzdG5hbWU6ICcnLCBsYXN0bmFtZTogJyd9KVxyXG5jb25zdCBwcmV2ZW50RGVhZnVsdCA9IGUgPT4ge2UucHJldmVudERlZmF1bHQoKTsgcmV0dXJuIGU7fVxyXG5cclxuLy8gdXBkYXRlXHJcblxyXG5jb25zdCBBY3Rpb24gPSBUeXBlKHtcclxuICBTdWJtaXQ6IFtPYmplY3RdXHJcbn0pO1xyXG5jb25zdCB1cGRhdGUgPSBBY3Rpb24uY2FzZU9uKHtcclxuICBTdWJtaXQ6IGUgPT4ge1xyXG4gICAgbGV0IHtlbWFpbCwgZmlyc3RuYW1lLCBsYXN0bmFtZX0gPSBlLnRhcmdldC5lbGVtZW50cztcclxuICAgIGxldCBkYXRhID0ge2VtYWlsOiBlbWFpbC52YWx1ZSxcclxuICAgICAgICBmaXJzdG5hbWU6IGZpcnN0bmFtZS52YWx1ZSxcclxuICAgICAgICBsYXN0bmFtZTogbGFzdG5hbWUudmFsdWV9O1xyXG4gICAgcmV0dXJuIHtkYXRhLCBjb250ZXh0OiBbZW1haWwsIGZpcnN0bmFtZSwgbGFzdG5hbWVdfTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gdmlld1xyXG5cclxuY29uc3QgbWFrZUZpZWxkID0gKCB7aWQsIHBsYWNlaG9sZGVyLCB2YWx1ZSwgZXJyb3IsICBpY29OYW1lID0gXCIudXNlclwifSApID0+XHJcbiAgaChgZGl2LmZpZWxkJHtlcnJvcn1gLCBbaChgZGl2LnVpLmljb24uaW5wdXRgLCBbXHJcblx0XHRoKGBpbnB1dCR7aWR9YCwge1xyXG4gICAgICBwcm9wczoge1xyXG5cdFx0XHRcdHR5cGU6IFwidGV4dFwiLFxyXG5cdFx0XHRcdGZvcm06IFwiZm9ybVwiLFxyXG5cdFx0XHRcdHBsYWNlaG9sZGVyLFxyXG5cdFx0XHQgIHZhbHVlOiB2YWx1ZSB9LFxyXG4gICAgICAgIHZhbHVlOiB2YWx1ZX0pLFxyXG4gICAgaChgaS5pY29uJHtpY29OYW1lfWApIF1cclxuICAgICAgKV0pXHJcblxyXG5jb25zdCB2aWV3ID0gKCB7c3VibWl0JH0sXHJcblx0XHRbe2VtYWlsPVwiXCIsIGZpcnN0bmFtZT1cIlwiLCBsYXN0bmFtZT1cIlwifSA9IHt9LFxyXG5cdFx0e2VtYWlsRXJyb3IgPSBcIlwiLCBmaXJzdG5hbWVFcnJvciA9IFwiXCIsIGxhc3RuYW1lRXJyb3IgPSBcIlwifSA9IHt9XVxyXG5cdCkgPT4gIGgoXCJkaXYudWkuc2VnbWVudFwiLCBbXHJcbiAgICBoKFwiZGliLnVpLmhvcml6b250YWwuZGl2aWRlclwiLCBcIkFERCBDT05UQUNUXCIpLFxyXG4gICAgaChcImZvcm0udWkuZm9ybVwiLFxyXG4gICAgICB7b246IHtzdWJtaXQ6IFIuY29tcG9zZShzdWJtaXQkLCBBY3Rpb24uU3VibWl0LCBwcmV2ZW50RGVhZnVsdCl9LCBrZXk6XCIxMTExMVwifSxcclxuICAgICAgW1x0bWFrZUZpZWxkKFxyXG4gIFx0XHRcdFx0XHR7aWQ6IFwiI2ZpcnN0bmFtZVwiLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJGaXJzdCBuYW1lXCIsXHJcbiAgXHRcdFx0XHRcdGVycm9yOiBmaXJzdG5hbWVFcnJvcixcclxuICBcdFx0XHRcdFx0dmFsdWU6IGZpcnN0bmFtZX1cclxuICBcdFx0XHRcdCksXHJcbiAgXHRcdFx0bWFrZUZpZWxkKFxyXG4gIFx0XHRcdFx0XHR7aWQ6IFwiI2xhc3RuYW1lXCIsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcIkxhc3QgbmFtZVwiLFxyXG4gIFx0XHRcdFx0XHRlcnJvcjogbGFzdG5hbWVFcnJvcixcclxuICBcdFx0XHRcdFx0dmFsdWU6IGxhc3RuYW1lfVxyXG4gIFx0XHRcdFx0KSxcclxuICBcdFx0XHRtYWtlRmllbGQoXHJcbiAgXHRcdFx0XHRcdHtpZDogXCIjZW1haWxcIixcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiRW1haWxcIixcclxuICBcdFx0XHRcdFx0ZXJyb3I6IGVtYWlsRXJyb3IsXHJcbiAgXHRcdFx0XHRcdGljb05hbWU6IFwiLmF0XCIsXHJcbiAgXHRcdFx0XHRcdHZhbHVlOiBlbWFpbH1cclxuICBcdFx0XHRcdCksXHJcblx0XHRcdGgoXCJidXR0b24udWkuYmFzaWMuYnV0dG9uLmZsdWlkXCIsIHtwcm9wczoge3R5cGU6IFwic3VibWl0XCJ9fSwgW1xyXG5cdFx0XHRcdGgoXCJpLmFkZC51c2VyLmljb25cIiksXHJcblx0XHRcdFx0XCIgIFNhdmVcIlxyXG5cdFx0XHRcdF0pXHJcblx0XHRcdF0pXHJcbiAgICBdKVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHsgdmlldywgaW5pdCwgdXBkYXRlLCBBY3Rpb24gfVxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBkOi9fcHJvZy9qdXJTdHYuZ2l0aHViLmlvL2FkcmVzc0Jvb2stRWxtX2FyY2gvc3JjL2FkcmVzc0Zvcm0uanNcbiAqKi8iLCJjb25zdCBSID0gcmVxdWlyZSgncmFtZGEnKTtcclxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJ3VuaW9uLXR5cGUnKTtcclxuY29uc3QgaCA9IHJlcXVpcmUoJ3NuYWJiZG9tL2gnKTtcclxuXHJcbi8vIG1vZGVsXHJcblxyXG5jb25zdCBpbml0ID0gXyA9PiAoe2VtYWlsOiBcImtleUBrZXkuY29tXCIsIGZpcnN0bmFtZTogXCJrZXlcIiwgbGFzdG5hbWU6IFwia2V5XCIsIF9pZDogXCJ0ZXN0X2lkMTEwNjMwNlwifSlcclxuXHJcbi8vIHVwZGF0ZVxyXG5cclxuY29uc3QgQWN0aW9uID0gVHlwZSh7XHJcbiAgRWRpdDogW09iamVjdF1cclxufSk7XHJcblxyXG5jb25zdCB1cGRhdGUgPSBBY3Rpb24uY2FzZU9uKHtcclxuICBFZGl0OiAobmV3QWRyLCBtb2RlbCkgPT4gUi5tZXJnZShtb2RlbCwgbmV3QWRyKVxyXG59KTtcclxuXHJcbi8vIHZpZXdcclxuXHJcbmNvbnN0IHZpZXcgPSAoe2VkaXQkLCByZW1vdmUkfSwgaXRlbSwgZGlzYWJsZWQgPSBcIlwiKSA9PiBoKGB0ci4ke2l0ZW0uX2lkfSR7ZGlzYWJsZWR9YCwgW1xyXG4gICAgICAgaChcInRkXCIsYCR7aXRlbS5maXJzdG5hbWV9YCksXHJcbiAgICAgICBoKFwidGRcIixgJHtpdGVtLmxhc3RuYW1lfWApLFxyXG4gICAgICAgaChcInRkXCIsYCR7aXRlbS5lbWFpbH1gKSxcclxuICAgICAgIGgoXCJ0ZC5jZW50ZXIuYWxpZ25lZFwiLFtcclxuICAgICAgICAgICBoKGBpLmVkaXQuaWNvbi5sYXJnZS5saW5rYCwge1xyXG4gICAgICAgICAgICAgb246IHtjbGljazogZWRpdCR9XHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICAgXSksXHJcbiAgICAgICBoKFwidGQuY2VudGVyLmFsaWduZWRcIixbXHJcbiAgICAgICAgICAgaChgaS5yZW1vdmUudXNlci5sYXJnZS5pY29uLmxpbmtgLCB7XHJcbiAgICAgICAgICAgICBvbjoge2NsaWNrOiByZW1vdmUkfVxyXG4gICAgICAgICAgIH0pXHJcbiAgICAgICAgIF0pXHJcbiAgICAgXSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHsgdmlldywgaW5pdCwgdXBkYXRlLCBBY3Rpb24gfVxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBkOi9fcHJvZy9qdXJTdHYuZ2l0aHViLmlvL2FkcmVzc0Jvb2stRWxtX2FyY2gvc3JjL3RhYmxlUm93LmpzXG4gKiovIiwiaW1wb3J0IFIgZnJvbSBcInJhbWRhXCI7XHJcbmltcG9ydCB7IFN1Y2Nlc3MsIEZhaWx1cmUgfSBmcm9tIFwiZGF0YS52YWxpZGF0aW9uXCI7XHJcblxyXG5mdW5jdGlvbiBpc05hbWVWYWxpZChsYWJlbCA9IFwiXCIsIG5hbWUpe1xyXG4gIHJldHVybiAvXltcXGRcXHddKyQvLnRlc3QobmFtZSkgP1xyXG4gICAgICAgICAgIFN1Y2Nlc3MobmFtZSlcclxuICA6XHJcbiAgICAgICAgICAgRmFpbHVyZShbIFtsYWJlbCwgXCIuZXJyb3JcIl0gXSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFbWFpbFZhbGlkKGVtYWlsKXtcclxuICByZXR1cm4gL15cXFMrQFxcUytcXC5cXFMrLy50ZXN0KGVtYWlsKSA/XHJcbiAgICAgICAgICAgU3VjY2VzcyhlbWFpbClcclxuICA6XHJcbiAgICAgICAgICAgRmFpbHVyZShbIFtcImVtYWlsRXJyb3JcIiwgXCIuZXJyb3JcIl0gXSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXNGb3JtVmFsaWQoIHtmaXJzdG5hbWUsIGxhc3RuYW1lLCBlbWFpbH0gKXtcclxuICByZXR1cm4gU3VjY2VzcyggUi5jdXJyeSggKGZuYW1lLGxuYW1lLGVtYWlsKSA9PiBbZm5hbWUsbG5hbWUsZW1haWxdICkgKVxyXG4gICAgICAgICAgICAuYXAoaXNOYW1lVmFsaWQoIFwiZmlyc3RuYW1lRXJyb3JcIiwgZmlyc3RuYW1lICkpXHJcbiAgICAgICAgICAgIC5hcChpc05hbWVWYWxpZCggXCJsYXN0bmFtZUVycm9yXCIsIGxhc3RuYW1lICkpXHJcbiAgICAgICAgICAgIC5hcChpc0VtYWlsVmFsaWQoIGVtYWlsICkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRm9ybVZhbGlkQm9vbCggZm9ybSApe1xyXG4gIHJldHVybiBpc0Zvcm1WYWxpZCggZm9ybSApLmlzU3VjY2VzcztcclxufVxyXG5cclxuZnVuY3Rpb24gaXNGb3JtV3JvbmdCb29sKCBmb3JtICl7XHJcbiAgcmV0dXJuIGlzRm9ybVZhbGlkKCBmb3JtICkuaXNGYWlsdXJlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlRXJyb3JPYmplY3QoIGZvcm0gKXtcclxuICB2YXIgZm9ybUNoZWNrZWQgPSBpc0Zvcm1WYWxpZCggZm9ybSApO1xyXG4gIHJldHVybiBmb3JtQ2hlY2tlZC5pc0ZhaWx1cmUgPyBSLmZyb21QYWlycyggZm9ybUNoZWNrZWQubWVyZ2UoKSApIDoge307XHJcbn1cclxuXHJcbi8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbmZ1bmN0aW9uIGRlZXBGcmVlemUobykge1xyXG4gIHZhciBwcm9wLCBwcm9wS2V5O1xyXG4gIE9iamVjdC5mcmVlemUobyk7XHJcbiAgZm9yIChwcm9wS2V5IGluIG8pIHtcclxuICAgIHByb3AgPSBvW3Byb3BLZXldO1xyXG4gICAgaWYgKCFvLmhhc093blByb3BlcnR5KHByb3BLZXkpIHx8ICEodHlwZW9mIHByb3AgPT09ICdvYmplY3QnKSB8fCBPYmplY3QuaXNGcm96ZW4ocHJvcCkpIHtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBkZWVwRnJlZXplKHByb3ApO1xyXG4gIH1cclxuICByZXR1cm4gbztcclxufVxyXG5cclxuY29uc3QgYWRkRGVmYXVsdFVuaXEgPSAoZGVmSXRlbSwga2V5LCBpdGVtcykgPT4ge1xyXG4gIHJldHVybiAgKCBSLmNvbnRhaW5zV2l0aCggKGEsYikgPT4ge3JldHVybiBhW2tleV0gPT09IGJba2V5XX0sIGRlZkl0ZW0sIGl0ZW1zICApIClcclxuICA/XHJcbiAgICBpdGVtc1xyXG4gIDpcclxuICAgIFIuYXBwZW5kKGRlZkl0ZW0sIGl0ZW1zKTtcclxufVxyXG5cclxuY29uc3Qgc2FmZUpTT05QYXJzZSA9IHN0ciA9PiBKU09OLnBhcnNlKHN0cikgfHwge2xpc3Q6W119O1xyXG5jb25zdCBtZXJnZVdpdGhEZWZhdWx0ID0gYWRyZXNzZXMgPT4ge1xyXG4gIGxldCBkZWZhdWx0QWRyZXNzZXMgPSBbe2VtYWlsOiBcImtleUBrZXkuY29tXCIsIGZpcnN0bmFtZTogXCJrZXlcIiwgbGFzdG5hbWU6IFwia2V5XCIsIF9pZDogXCJ0ZXN0X2lkMTEwNjMwNlwifV07XHJcbiAgcmV0dXJuIHtsaXN0OiBhZGREZWZhdWx0VW5pcSggZGVmYXVsdEFkcmVzc2VzWzBdLCBcIl9pZFwiLCBhZHJlc3Nlcy5saXN0ICksIGZpbHRlcjogJycsIGVkaXRpbmc6IFtdLCBlcnJvcjogW119XHJcbn1cclxuXHJcbmNvbnN0IGZpbmRBbnlNYXRjaGluZ1N0cmluZyA9IChzdHIpID0+IFIuY29tcG9zZSggUi5hbnkoIFIudGVzdCggUmVnRXhwKHN0cikgKSApLCBSLnZhbHVlcyApXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgaXNGb3JtVmFsaWRCb29sLFxyXG4gIGlzRm9ybVdyb25nQm9vbCxcclxuICBtYWtlRXJyb3JPYmplY3QsXHJcbiAgZGVlcEZyZWV6ZSxcclxuICBzYWZlSlNPTlBhcnNlLFxyXG4gIG1lcmdlV2l0aERlZmF1bHQsXHJcbiAgZmluZEFueU1hdGNoaW5nU3RyaW5nXHJcbn1cclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogZDovX3Byb2cvanVyU3R2LmdpdGh1Yi5pby9hZHJlc3NCb29rLUVsbV9hcmNoL3NyYy9oZWxwZXJzLmpzXG4gKiovIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzLTIwMTQgUXVpbGRyZWVuIE1vdHRhIDxxdWlsZHJlZW5AZ21haWwuY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG4vLyBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlc1xuLy8gKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLFxuLy8gaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSxcbi8vIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsXG4vLyBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxuLy8gc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbi8vIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4vLyBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG4vLyBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG4vLyBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG4vLyBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vdmFsaWRhdGlvbicpXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vZGF0YS52YWxpZGF0aW9uL2xpYi9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBRdWlsZHJlZW4gTW90dGEgPHF1aWxkcmVlbkBnbWFpbC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbi8vIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzXG4vLyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sXG4vLyBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLFxuLy8gcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSxcbi8vIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4vLyBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbi8vIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbi8vIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbi8vIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbi8vIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogQG1vZHVsZSBsaWIvdmFsaWRhdGlvblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFZhbGlkYXRpb25cblxuLy8gLS0gQWxpYXNlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG52YXIgY2xvbmUgICAgICAgICA9IE9iamVjdC5jcmVhdGVcbnZhciB1bmltcGxlbWVudGVkID0gZnVuY3Rpb24oKXsgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJykgfVxudmFyIG5vb3AgICAgICAgICAgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcyAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cblxuLy8gLS0gSW1wbGVtZW50YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGlzIGEgZGlzanVuY3Rpb24gdGhhdCdzIG1vcmUgYXBwcm9wcmlhdGUgZm9yXG4gKiB2YWxpZGF0aW5nIGlucHV0cywgb3IgYW55IHVzZSBjYXNlIHdoZXJlIHlvdSB3YW50IHRvIGFnZ3JlZ2F0ZSBmYWlsdXJlcy4gTm90XG4gKiBvbmx5IGRvZXMgdGhlIGBWYWxpZGF0aW9uYCBwcm92aWRlIGEgYmV0dGVyIHRlcm1pbm9sb2d5IGZvciB3b3JraW5nIHdpdGhcbiAqIHN1Y2ggY2FzZXMgKGBGYWlsdXJlYCBhbmQgYFN1Y2Nlc3NgIHZlcnN1cyBgRmFpbHVyZWAgYW5kIGBTdWNjZXNzYCksIGl0IGFsc29cbiAqIGFsbG93cyBvbmUgdG8gZWFzaWx5IGFnZ3JlZ2F0ZSBmYWlsdXJlcyBhbmQgc3VjY2Vzc2VzIGFzIGFuIEFwcGxpY2F0aXZlXG4gKiBGdW5jdG9yLlxuICpcbiAqIEBjbGFzc1xuICogQHN1bW1hcnlcbiAqIFZhbGlkYXRpb25bzrEsIM6yXSA8OiBBcHBsaWNhdGl2ZVvOsl1cbiAqICAgICAgICAgICAgICAgICAgICwgRnVuY3RvclvOsl1cbiAqICAgICAgICAgICAgICAgICAgICwgU2hvd1xuICogICAgICAgICAgICAgICAgICAgLCBFcVxuICovXG5mdW5jdGlvbiBWYWxpZGF0aW9uKCkgeyB9XG5cbkZhaWx1cmUucHJvdG90eXBlID0gY2xvbmUoVmFsaWRhdGlvbi5wcm90b3R5cGUpXG5mdW5jdGlvbiBGYWlsdXJlKGEpIHtcbiAgdGhpcy52YWx1ZSA9IGFcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUgPSBjbG9uZShWYWxpZGF0aW9uLnByb3RvdHlwZSlcbmZ1bmN0aW9uIFN1Y2Nlc3MoYSkge1xuICB0aGlzLnZhbHVlID0gYVxufVxuXG4vLyAtLSBDb25zdHJ1Y3RvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSBob2xkaW5nIGEgYEZhaWx1cmVgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IGEg4oaSIFZhbGlkYXRpb25bzrEsIM6yXVxuICovXG5WYWxpZGF0aW9uLkZhaWx1cmUgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgRmFpbHVyZShhKVxufVxuVmFsaWRhdGlvbi5wcm90b3R5cGUuRmFpbHVyZSA9IFZhbGlkYXRpb24uRmFpbHVyZVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYEV0aWhlclvOsSwgzrJdYCBzdHJ1Y3R1cmUgaG9sZGluZyBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24uU3VjY2VzcyA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpXG59XG5WYWxpZGF0aW9uLnByb3RvdHlwZS5TdWNjZXNzID0gVmFsaWRhdGlvbi5TdWNjZXNzXG5cblxuLy8gLS0gQ29udmVyc2lvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIG51bGxhYmxlIHR5cGUuXG4gKlxuICogVGFrZXMgdGhlIGBGYWlsdXJlYCBjYXNlIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuIFRha2VzIHRoZVxuICogYFN1Y2Nlc3NgIGNhc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBzdW1tYXJ5IM6xIOKGkiBWYWxpZGF0aW9uW86xLCDOsV1cbiAqL1xuVmFsaWRhdGlvbi5mcm9tTnVsbGFibGUgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBhICE9IG51bGw/ICAgICAgIHRoaXMuU3VjY2VzcyhhKVxuICA6ICAgICAgLyogb3RoZXJ3aXNlICovICB0aGlzLkZhaWx1cmUoYSlcbn1cblZhbGlkYXRpb24ucHJvdG90eXBlLmZyb21OdWxsYWJsZSA9IFZhbGlkYXRpb24uZnJvbU51bGxhYmxlXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgRWl0aGVyW86xLCDOsl1gIHN0cnVjdHVyZSBmcm9tIGEgYFZhbGlkYXRpb25bzrEsIM6yXWAgdHlwZS5cbiAqXG4gKiBAc3VtbWFyeSBFaXRoZXJbzrEsIM6yXSDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24uZnJvbUVpdGhlciA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGEuZm9sZCh0aGlzLkZhaWx1cmUuYmluZCh0aGlzKSwgdGhpcy5TdWNjZXNzLmJpbmQodGhpcykpXG59XG5cblxuLy8gLS0gUHJlZGljYXRlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVHJ1ZSBpZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgY29udGFpbnMgYSBgRmFpbHVyZWAgdmFsdWUuXG4gKlxuICogQHN1bW1hcnkgQm9vbGVhblxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5pc0ZhaWx1cmUgPSBmYWxzZVxuRmFpbHVyZS5wcm90b3R5cGUuaXNGYWlsdXJlICAgID0gdHJ1ZVxuXG4vKipcbiAqIFRydWUgaWYgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGNvbnRhaW5zIGEgYFN1Y2Nlc3NgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNTdWNjZXNzID0gZmFsc2VcblN1Y2Nlc3MucHJvdG90eXBlLmlzU3VjY2VzcyAgICA9IHRydWVcblxuXG4vLyAtLSBBcHBsaWNhdGl2ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIGluc3RhbmNlIGhvbGRpbmcgdGhlIGBTdWNjZXNzYCB2YWx1ZSBgYmAuXG4gKlxuICogYGJgIGNhbiBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAsIGB1bmRlZmluZWRgIG9yIGFub3RoZXJcbiAqIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZS5cbiAqXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24ub2YgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiB0aGlzLlN1Y2Nlc3MoYSlcbn1cblZhbGlkYXRpb24ucHJvdG90eXBlLm9mID0gVmFsaWRhdGlvbi5vZlxuXG5cbi8qKlxuICogQXBwbGllcyB0aGUgZnVuY3Rpb24gaW5zaWRlIHRoZSBgU3VjY2Vzc2AgY2FzZSBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlXG4gKiB0byBhbm90aGVyIGFwcGxpY2F0aXZlIHR5cGUuXG4gKlxuICogVGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHNob3VsZCBjb250YWluIGEgZnVuY3Rpb24gdmFsdWUsIG90aGVyd2lzZSBhIGBUeXBlRXJyb3JgXG4gKiBpcyB0aHJvd24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsiDihpIgzrNdLCBmOkFwcGxpY2F0aXZlW19dKSA9PiBmW86yXSDihpIgZlvOs11cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuYXAgPSB1bmltcGxlbWVudGVkXG5cbkZhaWx1cmUucHJvdG90eXBlLmFwID0gZnVuY3Rpb24oYikge1xuICByZXR1cm4gYi5pc0ZhaWx1cmU/ICAgICB0aGlzLkZhaWx1cmUodGhpcy52YWx1ZS5jb25jYXQoYi52YWx1ZSkpXG4gIDogICAgICAvKiBvdGhlcndpc2UgKi8gIHRoaXNcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUuYXAgPSBmdW5jdGlvbihiKSB7XG4gIHJldHVybiBiLmlzRmFpbHVyZT8gICAgIGJcbiAgOiAgICAgIC8qIG90aGVyd2lzZSAqLyAgYi5tYXAodGhpcy52YWx1ZSlcbn1cblxuXG4vLyAtLSBGdW5jdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSBgU3VjY2Vzc2AgdmFsdWUgb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSB1c2luZyBhIHJlZ3VsYXJcbiAqIHVuYXJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiAozrIg4oaSIM6zKSDihpIgVmFsaWRhdGlvblvOsSwgzrNdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLm1hcCA9IHVuaW1wbGVtZW50ZWRcbkZhaWx1cmUucHJvdG90eXBlLm1hcCAgICA9IG5vb3BcblxuU3VjY2Vzcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZikge1xuICByZXR1cm4gdGhpcy5vZihmKHRoaXMudmFsdWUpKVxufVxuXG5cbi8vIC0tIFNob3cgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJldHVybnMgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIFN0cmluZ1xuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWRcblxuRmFpbHVyZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdWYWxpZGF0aW9uLkZhaWx1cmUoJyArIHRoaXMudmFsdWUgKyAnKSdcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdWYWxpZGF0aW9uLlN1Y2Nlc3MoJyArIHRoaXMudmFsdWUgKyAnKSdcbn1cblxuXG4vLyAtLSBFcSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUZXN0cyBpZiBhbiBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgaXMgZXF1YWwgdG8gYW5vdGhlciBgVmFsaWRhdGlvblvOsSwgzrJdYFxuICogc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiBWYWxpZGF0aW9uW86xLCDOsl0g4oaSIEJvb2xlYW5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNFcXVhbCA9IHVuaW1wbGVtZW50ZWRcblxuRmFpbHVyZS5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGEuaXNGYWlsdXJlICYmIChhLnZhbHVlID09PSB0aGlzLnZhbHVlKVxufVxuXG5TdWNjZXNzLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYS5pc1N1Y2Nlc3MgJiYgKGEudmFsdWUgPT09IHRoaXMudmFsdWUpXG59XG5cblxuLy8gLS0gRXh0cmFjdGluZyBhbmQgcmVjb3ZlcmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGBTdWNjZXNzYCB2YWx1ZSBvdXQgb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSwgaWYgaXRcbiAqIGV4aXN0cy4gT3RoZXJ3aXNlIHRocm93cyBhIGBUeXBlRXJyb3JgLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiBWb2lkIOKGkiDOsiAgICAgICAgIDo6IHBhcnRpYWwsIHRocm93c1xuICogQHNlZSB7QGxpbmsgbW9kdWxlOmxpYi92YWxpZGF0aW9uflZhbGlkYXRpb24jZ2V0T3JFbHNlfSDigJQgQSBnZXR0ZXIgdGhhdCBjYW4gaGFuZGxlIGZhaWx1cmVzLlxuICogQHNlZSB7QGxpbmsgbW9kdWxlOmxpYi92YWxpZGF0aW9uflZhbGlkYXRpb24jbWVyZ2V9IOKAlCBUaGUgY29udmVyZ2VuY2Ugb2YgYm90aCB2YWx1ZXMuXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IGlmIHRoZSBzdHJ1Y3R1cmUgaGFzIG5vIGBTdWNjZXNzYCB2YWx1ZS5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuZ2V0ID0gdW5pbXBsZW1lbnRlZFxuXG5GYWlsdXJlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbid0IGV4dHJhY3QgdGhlIHZhbHVlIG9mIGEgRmFpbHVyZShhKS5cIilcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlXG59XG5cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgYFN1Y2Nlc3NgIHZhbHVlIG91dCBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLiBJZiB0aGVcbiAqIHN0cnVjdHVyZSBkb2Vzbid0IGhhdmUgYSBgU3VjY2Vzc2AgdmFsdWUsIHJldHVybnMgdGhlIGdpdmVuIGRlZmF1bHQuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IM6yIOKGkiDOslxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5nZXRPckVsc2UgPSB1bmltcGxlbWVudGVkXG5cbkZhaWx1cmUucHJvdG90eXBlLmdldE9yRWxzZSA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGFcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24oXykge1xuICByZXR1cm4gdGhpcy52YWx1ZVxufVxuXG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIGBGYWlsdXJlYCB2YWx1ZSBpbnRvIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZS4gRG9lcyBub3RoaW5nXG4gKiBpZiB0aGUgc3RydWN0dXJlIGNvbnRhaW4gYSBgU3VjY2Vzc2AgdmFsdWUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgVmFsaWRhdGlvblvOsywgzrJdKSDihpIgVmFsaWRhdGlvblvOsywgzrJdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLm9yRWxzZSA9IHVuaW1wbGVtZW50ZWRcblN1Y2Nlc3MucHJvdG90eXBlLm9yRWxzZSAgICA9IG5vb3BcblxuRmFpbHVyZS5wcm90b3R5cGUub3JFbHNlID0gZnVuY3Rpb24oZikge1xuICByZXR1cm4gZih0aGlzLnZhbHVlKVxufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2Ygd2hpY2hldmVyIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uIHRoYXQgaXMgcHJlc2VudC5cbiAqXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6xXSkgPT4gVm9pZCDihpIgzrFcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWVcbn1cblxuXG4vLyAtLSBGb2xkcyBhbmQgRXh0ZW5kZWQgVHJhbnNmb3JtYXRpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBBcHBsaWVzIGEgZnVuY3Rpb24gdG8gZWFjaCBjYXNlIGluIHRoaXMgZGF0YSBzdHJ1Y3R1cmUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpLCAozrIg4oaSIM6zKSDihpIgzrNcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuZm9sZCA9IHVuaW1wbGVtZW50ZWRcblxuRmFpbHVyZS5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIF8pIHtcbiAgcmV0dXJuIGYodGhpcy52YWx1ZSlcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKF8sIGcpIHtcbiAgcmV0dXJuIGcodGhpcy52YWx1ZSlcbn1cblxuLyoqXG4gKiBDYXRhbW9ycGhpc20uXG4gKiBcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiB7IFN1Y2Nlc3M6IM6xIOKGkiDOsywgRmFpbHVyZTogzrEg4oaSIM6zIH0g4oaSIM6zXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmNhdGEgPSB1bmltcGxlbWVudGVkXG5cbkZhaWx1cmUucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gIHJldHVybiBwYXR0ZXJuLkZhaWx1cmUodGhpcy52YWx1ZSlcbn1cblxuU3VjY2Vzcy5wcm90b3R5cGUuY2F0YSA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgcmV0dXJuIHBhdHRlcm4uU3VjY2Vzcyh0aGlzLnZhbHVlKVxufVxuXG5cbi8qKlxuICogU3dhcHMgdGhlIGRpc2p1bmN0aW9uIHZhbHVlcy5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gVm9pZCDihpIgVmFsaWRhdGlvblvOsiwgzrFdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLnN3YXAgPSB1bmltcGxlbWVudGVkXG5cbkZhaWx1cmUucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuU3VjY2Vzcyh0aGlzLnZhbHVlKVxufVxuXG5TdWNjZXNzLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLkZhaWx1cmUodGhpcy52YWx1ZSlcbn1cblxuXG4vKipcbiAqIE1hcHMgYm90aCBzaWRlcyBvZiB0aGUgZGlzanVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpLCAozrIg4oaSIM60KSDihpIgVmFsaWRhdGlvblvOsywgzrRdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmJpbWFwID0gdW5pbXBsZW1lbnRlZFxuXG5GYWlsdXJlLnByb3RvdHlwZS5iaW1hcCA9IGZ1bmN0aW9uKGYsIF8pIHtcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKVxufVxuXG5TdWNjZXNzLnByb3RvdHlwZS5iaW1hcCA9IGZ1bmN0aW9uKF8sIGcpIHtcbiAgcmV0dXJuIHRoaXMuU3VjY2VzcyhnKHRoaXMudmFsdWUpKVxufVxuXG5cbi8qKlxuICogTWFwcyB0aGUgZmFpbHVyZSBzaWRlIG9mIHRoZSBkaXNqdW5jdGlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsykg4oaSIFZhbGlkYXRpb25bzrMsIM6yXVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5mYWlsdXJlTWFwID0gdW5pbXBsZW1lbnRlZFxuU3VjY2Vzcy5wcm90b3R5cGUuZmFpbHVyZU1hcCAgICA9IG5vb3BcblxuRmFpbHVyZS5wcm90b3R5cGUuZmFpbHVyZU1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKVxufVxuXG4vKipcbiAqIE1hcHMgdGhlIGZhaWx1cmUgc2lkZSBvZiB0aGUgZGlzanVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQGRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIHtAbGluayBtb2R1bGU6bGliL3ZhbGlkYXRpb25+VmFsaWRhdGlvbiNmYWlsdXJlTWFwfVxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubGVmdE1hcCA9IFZhbGlkYXRpb24ucHJvdG90eXBlLmZhaWx1cmVNYXBcblN1Y2Nlc3MucHJvdG90eXBlLmxlZnRNYXAgICAgPSBTdWNjZXNzLnByb3RvdHlwZS5mYWlsdXJlTWFwXG5GYWlsdXJlLnByb3RvdHlwZS5sZWZ0TWFwICAgID0gRmFpbHVyZS5wcm90b3R5cGUuZmFpbHVyZU1hcFxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2RhdGEudmFsaWRhdGlvbi9saWIvdmFsaWRhdGlvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9