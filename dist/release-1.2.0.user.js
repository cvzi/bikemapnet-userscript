// ==UserScript==
// @name        Bikemap.net Export GPX and KML routes
// @description Download GPX, KML, TCX and geoJSON files for a route on bikemap.net
// @namespace   github.com/cvzi
// @icon        https://static.bikemap.net/favicons/apple-touch-icon.png
// @match       https://www.bikemap.net/*
// @connect     maptoolkit.net
// @version     1.2.0
// @homepage    https://github.com/cvzi/bikemapnet-userscript
// @author      cuzi
// @license     MIT
// @grant       GM.xmlHttpRequest
// @grant       GM.registerMenuCommand
// ==/UserScript==

/*
MIT License

Copyright (c) 2022, cuzi (https://openuserjs.org/users/cuzi)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* globals React, ReactDOM */
(function () {
  'use strict';

  /*!
   * vanilla-picker v2.12.1
   * https://vanilla-picker.js.org
   *
   * Copyright 2017-2021 Andreas Borgen (https://github.com/Sphinxxxx), Adam Brooks (https://github.com/dissimulate)
   * Released under the ISC license.
   */
  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  String.prototype.startsWith = String.prototype.startsWith || function (needle) {
    return this.indexOf(needle) === 0;
  };

  String.prototype.padStart = String.prototype.padStart || function (len, pad) {
    var str = this;

    while (str.length < len) {
      str = pad + str;
    }

    return str;
  };

  var colorNames = {
    cb: '0f8ff',
    tqw: 'aebd7',
    q: '-ffff',
    qmrn: '7fffd4',
    zr: '0ffff',
    bg: '5f5dc',
    bsq: 'e4c4',
    bck: '---',
    nch: 'ebcd',
    b: '--ff',
    bvt: '8a2be2',
    brwn: 'a52a2a',
    brw: 'deb887',
    ctb: '5f9ea0',
    hrt: '7fff-',
    chcT: 'd2691e',
    cr: '7f50',
    rnw: '6495ed',
    crns: '8dc',
    crms: 'dc143c',
    cn: '-ffff',
    Db: '--8b',
    Dcn: '-8b8b',
    Dgnr: 'b8860b',
    Dgr: 'a9a9a9',
    Dgrn: '-64-',
    Dkhk: 'bdb76b',
    Dmgn: '8b-8b',
    Dvgr: '556b2f',
    Drng: '8c-',
    Drch: '9932cc',
    Dr: '8b--',
    Dsmn: 'e9967a',
    Dsgr: '8fbc8f',
    DsTb: '483d8b',
    DsTg: '2f4f4f',
    Dtrq: '-ced1',
    Dvt: '94-d3',
    ppnk: '1493',
    pskb: '-bfff',
    mgr: '696969',
    grb: '1e90ff',
    rbrc: 'b22222',
    rwht: 'af0',
    stg: '228b22',
    chs: '-ff',
    gnsb: 'dcdcdc',
    st: '8f8ff',
    g: 'd7-',
    gnr: 'daa520',
    gr: '808080',
    grn: '-8-0',
    grnw: 'adff2f',
    hnw: '0fff0',
    htpn: '69b4',
    nnr: 'cd5c5c',
    ng: '4b-82',
    vr: '0',
    khk: '0e68c',
    vnr: 'e6e6fa',
    nrb: '0f5',
    wngr: '7cfc-',
    mnch: 'acd',
    Lb: 'add8e6',
    Lcr: '08080',
    Lcn: 'e0ffff',
    Lgnr: 'afad2',
    Lgr: 'd3d3d3',
    Lgrn: '90ee90',
    Lpnk: 'b6c1',
    Lsmn: 'a07a',
    Lsgr: '20b2aa',
    Lskb: '87cefa',
    LsTg: '778899',
    Lstb: 'b0c4de',
    Lw: 'e0',
    m: '-ff-',
    mgrn: '32cd32',
    nn: 'af0e6',
    mgnt: '-ff',
    mrn: '8--0',
    mqm: '66cdaa',
    mmb: '--cd',
    mmrc: 'ba55d3',
    mmpr: '9370db',
    msg: '3cb371',
    mmsT: '7b68ee',
    '': '-fa9a',
    mtr: '48d1cc',
    mmvt: 'c71585',
    mnLb: '191970',
    ntc: '5fffa',
    mstr: 'e4e1',
    mccs: 'e4b5',
    vjw: 'dead',
    nv: '--80',
    c: 'df5e6',
    v: '808-0',
    vrb: '6b8e23',
    rng: 'a5-',
    rngr: '45-',
    rch: 'da70d6',
    pgnr: 'eee8aa',
    pgrn: '98fb98',
    ptrq: 'afeeee',
    pvtr: 'db7093',
    ppwh: 'efd5',
    pchp: 'dab9',
    pr: 'cd853f',
    pnk: 'c0cb',
    pm: 'dda0dd',
    pwrb: 'b0e0e6',
    prp: '8-080',
    cc: '663399',
    r: '--',
    sbr: 'bc8f8f',
    rb: '4169e1',
    sbrw: '8b4513',
    smn: 'a8072',
    nbr: '4a460',
    sgrn: '2e8b57',
    ssh: '5ee',
    snn: 'a0522d',
    svr: 'c0c0c0',
    skb: '87ceeb',
    sTb: '6a5acd',
    sTgr: '708090',
    snw: 'afa',
    n: '-ff7f',
    stb: '4682b4',
    tn: 'd2b48c',
    t: '-8080',
    thst: 'd8bfd8',
    tmT: '6347',
    trqs: '40e0d0',
    vt: 'ee82ee',
    whT: '5deb3',
    wht: '',
    hts: '5f5f5',
    w: '-',
    wgrn: '9acd32'
  };

  function printNum(num) {
    var decs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var str = decs > 0 ? num.toFixed(decs).replace(/0+$/, '').replace(/\.$/, '') : num.toString();
    return str || '0';
  }

  var Color = function () {
    function Color(r, g, b, a) {
      classCallCheck(this, Color);
      var that = this;

      function parseString(input) {
        if (input.startsWith('hsl')) {
          var _input$match$map = input.match(/([\-\d\.e]+)/g).map(Number),
              _input$match$map2 = slicedToArray(_input$match$map, 4),
              h = _input$match$map2[0],
              s = _input$match$map2[1],
              l = _input$match$map2[2],
              _a = _input$match$map2[3];

          if (_a === undefined) {
            _a = 1;
          }

          h /= 360;
          s /= 100;
          l /= 100;
          that.hsla = [h, s, l, _a];
        } else if (input.startsWith('rgb')) {
          var _input$match$map3 = input.match(/([\-\d\.e]+)/g).map(Number),
              _input$match$map4 = slicedToArray(_input$match$map3, 4),
              _r = _input$match$map4[0],
              _g = _input$match$map4[1],
              _b = _input$match$map4[2],
              _a2 = _input$match$map4[3];

          if (_a2 === undefined) {
            _a2 = 1;
          }

          that.rgba = [_r, _g, _b, _a2];
        } else {
          if (input.startsWith('#')) {
            that.rgba = Color.hexToRgb(input);
          } else {
            that.rgba = Color.nameToRgb(input) || Color.hexToRgb(input);
          }
        }
      }

      if (r === undefined) ;else if (Array.isArray(r)) {
        this.rgba = r;
      } else if (b === undefined) {
        var color = r && '' + r;

        if (color) {
          parseString(color.toLowerCase());
        }
      } else {
        this.rgba = [r, g, b, a === undefined ? 1 : a];
      }
    }

    createClass(Color, [{
      key: 'printRGB',
      value: function printRGB(alpha) {
        var rgb = alpha ? this.rgba : this.rgba.slice(0, 3),
            vals = rgb.map(function (x, i) {
          return printNum(x, i === 3 ? 3 : 0);
        });
        return alpha ? 'rgba(' + vals + ')' : 'rgb(' + vals + ')';
      }
    }, {
      key: 'printHSL',
      value: function printHSL(alpha) {
        var mults = [360, 100, 100, 1],
            suff = ['', '%', '%', ''];
        var hsl = alpha ? this.hsla : this.hsla.slice(0, 3),
            vals = hsl.map(function (x, i) {
          return printNum(x * mults[i], i === 3 ? 3 : 1) + suff[i];
        });
        return alpha ? 'hsla(' + vals + ')' : 'hsl(' + vals + ')';
      }
    }, {
      key: 'printHex',
      value: function printHex(alpha) {
        var hex = this.hex;
        return alpha ? hex : hex.substring(0, 7);
      }
    }, {
      key: 'rgba',
      get: function get() {
        if (this._rgba) {
          return this._rgba;
        }

        if (!this._hsla) {
          throw new Error('No color is set');
        }

        return this._rgba = Color.hslToRgb(this._hsla);
      },
      set: function set(rgb) {
        if (rgb.length === 3) {
          rgb[3] = 1;
        }

        this._rgba = rgb;
        this._hsla = null;
      }
    }, {
      key: 'rgbString',
      get: function get() {
        return this.printRGB();
      }
    }, {
      key: 'rgbaString',
      get: function get() {
        return this.printRGB(true);
      }
    }, {
      key: 'hsla',
      get: function get() {
        if (this._hsla) {
          return this._hsla;
        }

        if (!this._rgba) {
          throw new Error('No color is set');
        }

        return this._hsla = Color.rgbToHsl(this._rgba);
      },
      set: function set(hsl) {
        if (hsl.length === 3) {
          hsl[3] = 1;
        }

        this._hsla = hsl;
        this._rgba = null;
      }
    }, {
      key: 'hslString',
      get: function get() {
        return this.printHSL();
      }
    }, {
      key: 'hslaString',
      get: function get() {
        return this.printHSL(true);
      }
    }, {
      key: 'hex',
      get: function get() {
        var rgb = this.rgba,
            hex = rgb.map(function (x, i) {
          return i < 3 ? x.toString(16) : Math.round(x * 255).toString(16);
        });
        return '#' + hex.map(function (x) {
          return x.padStart(2, '0');
        }).join('');
      },
      set: function set(hex) {
        this.rgba = Color.hexToRgb(hex);
      }
    }], [{
      key: 'hexToRgb',
      value: function hexToRgb(input) {
        var hex = (input.startsWith('#') ? input.slice(1) : input).replace(/^(\w{3})$/, '$1F').replace(/^(\w)(\w)(\w)(\w)$/, '$1$1$2$2$3$3$4$4').replace(/^(\w{6})$/, '$1FF');

        if (!hex.match(/^([0-9a-fA-F]{8})$/)) {
          throw new Error('Unknown hex color; ' + input);
        }

        var rgba = hex.match(/^(\w\w)(\w\w)(\w\w)(\w\w)$/).slice(1).map(function (x) {
          return parseInt(x, 16);
        });
        rgba[3] = rgba[3] / 255;
        return rgba;
      }
    }, {
      key: 'nameToRgb',
      value: function nameToRgb(input) {
        var hash = input.toLowerCase().replace('at', 'T').replace(/[aeiouyldf]/g, '').replace('ght', 'L').replace('rk', 'D').slice(-5, 4),
            hex = colorNames[hash];
        return hex === undefined ? hex : Color.hexToRgb(hex.replace(/\-/g, '00').padStart(6, 'f'));
      }
    }, {
      key: 'rgbToHsl',
      value: function rgbToHsl(_ref) {
        var _ref2 = slicedToArray(_ref, 4),
            r = _ref2[0],
            g = _ref2[1],
            b = _ref2[2],
            a = _ref2[3];

        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h = void 0,
            s = void 0,
            l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;

            case g:
              h = (b - r) / d + 2;
              break;

            case b:
              h = (r - g) / d + 4;
              break;
          }

          h /= 6;
        }

        return [h, s, l, a];
      }
    }, {
      key: 'hslToRgb',
      value: function hslToRgb(_ref3) {
        var _ref4 = slicedToArray(_ref3, 4),
            h = _ref4[0],
            s = _ref4[1],
            l = _ref4[2],
            a = _ref4[3];

        var r = void 0,
            g = void 0,
            b = void 0;

        if (s === 0) {
          r = g = b = l;
        } else {
          var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
              p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        var rgba = [r * 255, g * 255, b * 255].map(Math.round);
        rgba[3] = a;
        return rgba;
      }
    }]);
    return Color;
  }();

  var EventBucket = function () {
    function EventBucket() {
      classCallCheck(this, EventBucket);
      this._events = [];
    }

    createClass(EventBucket, [{
      key: 'add',
      value: function add(target, type, handler) {
        target.addEventListener(type, handler, false);

        this._events.push({
          target: target,
          type: type,
          handler: handler
        });
      }
    }, {
      key: 'remove',
      value: function remove(target, type, handler) {
        this._events = this._events.filter(function (e) {
          var isMatch = true;

          if (target && target !== e.target) {
            isMatch = false;
          }

          if (type && type !== e.type) {
            isMatch = false;
          }

          if (handler && handler !== e.handler) {
            isMatch = false;
          }

          if (isMatch) {
            EventBucket._doRemove(e.target, e.type, e.handler);
          }

          return !isMatch;
        });
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._events.forEach(function (e) {
          return EventBucket._doRemove(e.target, e.type, e.handler);
        });

        this._events = [];
      }
    }], [{
      key: '_doRemove',
      value: function _doRemove(target, type, handler) {
        target.removeEventListener(type, handler, false);
      }
    }]);
    return EventBucket;
  }();

  function parseHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.firstElementChild;
  }

  function dragTrack(eventBucket, area, callback) {
    var dragging = false;

    function clamp(val, min, max) {
      return Math.max(min, Math.min(val, max));
    }

    function onMove(e, info, starting) {
      if (starting) {
        dragging = true;
      }

      if (!dragging) {
        return;
      }

      e.preventDefault();
      var bounds = area.getBoundingClientRect(),
          w = bounds.width,
          h = bounds.height,
          x = info.clientX,
          y = info.clientY;
      var relX = clamp(x - bounds.left, 0, w),
          relY = clamp(y - bounds.top, 0, h);
      callback(relX / w, relY / h);
    }

    function onMouse(e, starting) {
      var button = e.buttons === undefined ? e.which : e.buttons;

      if (button === 1) {
        onMove(e, e, starting);
      } else {
        dragging = false;
      }
    }

    function onTouch(e, starting) {
      if (e.touches.length === 1) {
        onMove(e, e.touches[0], starting);
      } else {
        dragging = false;
      }
    }

    eventBucket.add(area, 'mousedown', function (e) {
      onMouse(e, true);
    });
    eventBucket.add(area, 'touchstart', function (e) {
      onTouch(e, true);
    });
    eventBucket.add(window, 'mousemove', onMouse);
    eventBucket.add(area, 'touchmove', onTouch);
    eventBucket.add(window, 'mouseup', function (e) {
      dragging = false;
    });
    eventBucket.add(area, 'touchend', function (e) {
      dragging = false;
    });
    eventBucket.add(area, 'touchcancel', function (e) {
      dragging = false;
    });
  }

  var BG_TRANSP = 'linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0 / 2em 2em,\n                   linear-gradient(45deg, lightgrey 25%,       white 25%,       white 75%, lightgrey 75%) 1em 1em / 2em 2em';
  var HUES = 360;
  var EVENT_KEY = 'keydown',
      EVENT_CLICK_OUTSIDE = 'mousedown',
      EVENT_TAB_MOVE = 'focusin';

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onKey(bucket, target, keys, handler, stop) {
    bucket.add(target, EVENT_KEY, function (e) {
      if (keys.indexOf(e.key) >= 0) {
        if (stop) {
          stopEvent(e);
        }

        handler(e);
      }
    });
  }

  var Picker = function () {
    function Picker(options) {
      classCallCheck(this, Picker);
      this.settings = {
        popup: 'right',
        layout: 'default',
        alpha: true,
        editor: true,
        editorFormat: 'hex',
        cancelButton: false,
        defaultColor: '#0cf'
      };
      this._events = new EventBucket();
      this.onChange = null;
      this.onDone = null;
      this.onOpen = null;
      this.onClose = null;
      this.setOptions(options);
    }

    createClass(Picker, [{
      key: 'setOptions',
      value: function setOptions(options) {
        var _this = this;

        if (!options) {
          return;
        }

        var settings = this.settings;

        function transfer(source, target, skipKeys) {
          for (var key in source) {
            if (skipKeys && skipKeys.indexOf(key) >= 0) {
              continue;
            }

            target[key] = source[key];
          }
        }

        if (options instanceof HTMLElement) {
          settings.parent = options;
        } else {
          if (settings.parent && options.parent && settings.parent !== options.parent) {
            this._events.remove(settings.parent);

            this._popupInited = false;
          }

          transfer(options, settings);

          if (options.onChange) {
            this.onChange = options.onChange;
          }

          if (options.onDone) {
            this.onDone = options.onDone;
          }

          if (options.onOpen) {
            this.onOpen = options.onOpen;
          }

          if (options.onClose) {
            this.onClose = options.onClose;
          }

          var col = options.color || options.colour;

          if (col) {
            this._setColor(col);
          }
        }

        var parent = settings.parent;

        if (parent && settings.popup && !this._popupInited) {
          var openProxy = function openProxy(e) {
            return _this.openHandler(e);
          };

          this._events.add(parent, 'click', openProxy);

          onKey(this._events, parent, [' ', 'Spacebar', 'Enter'], openProxy);
          this._popupInited = true;
        } else if (options.parent && !settings.popup) {
          this.show();
        }
      }
    }, {
      key: 'openHandler',
      value: function openHandler(e) {
        if (this.show()) {
          e && e.preventDefault();
          this.settings.parent.style.pointerEvents = 'none';
          var toFocus = e && e.type === EVENT_KEY ? this._domEdit : this.domElement;
          setTimeout(function () {
            return toFocus.focus();
          }, 100);

          if (this.onOpen) {
            this.onOpen(this.colour);
          }
        }
      }
    }, {
      key: 'closeHandler',
      value: function closeHandler(e) {
        var event = e && e.type;
        var doHide = false;

        if (!e) {
          doHide = true;
        } else if (event === EVENT_CLICK_OUTSIDE || event === EVENT_TAB_MOVE) {
          var knownTime = (this.__containedEvent || 0) + 100;

          if (e.timeStamp > knownTime) {
            doHide = true;
          }
        } else {
          stopEvent(e);
          doHide = true;
        }

        if (doHide && this.hide()) {
          this.settings.parent.style.pointerEvents = '';

          if (event !== EVENT_CLICK_OUTSIDE) {
            this.settings.parent.focus();
          }

          if (this.onClose) {
            this.onClose(this.colour);
          }
        }
      }
    }, {
      key: 'movePopup',
      value: function movePopup(options, open) {
        this.closeHandler();
        this.setOptions(options);

        if (open) {
          this.openHandler();
        }
      }
    }, {
      key: 'setColor',
      value: function setColor(color, silent) {
        this._setColor(color, {
          silent: silent
        });
      }
    }, {
      key: '_setColor',
      value: function _setColor(color, flags) {
        if (typeof color === 'string') {
          color = color.trim();
        }

        if (!color) {
          return;
        }

        flags = flags || {};
        var c = void 0;

        try {
          c = new Color(color);
        } catch (ex) {
          if (flags.failSilently) {
            return;
          }

          throw ex;
        }

        if (!this.settings.alpha) {
          var hsla = c.hsla;
          hsla[3] = 1;
          c.hsla = hsla;
        }

        this.colour = this.color = c;

        this._setHSLA(null, null, null, null, flags);
      }
    }, {
      key: 'setColour',
      value: function setColour(colour, silent) {
        this.setColor(colour, silent);
      }
    }, {
      key: 'show',
      value: function show() {
        var parent = this.settings.parent;

        if (!parent) {
          return false;
        }

        if (this.domElement) {
          var toggled = this._toggleDOM(true);

          this._setPosition();

          return toggled;
        }

        var html = this.settings.template || '<div class="picker_wrapper" tabindex="-1"><div class="picker_arrow"></div><div class="picker_hue picker_slider"><div class="picker_selector"></div></div><div class="picker_sl"><div class="picker_selector"></div></div><div class="picker_alpha picker_slider"><div class="picker_selector"></div></div><div class="picker_editor"><input aria-label="Type a color name or hex value"/></div><div class="picker_sample"></div><div class="picker_done"><button>Ok</button></div><div class="picker_cancel"><button>Cancel</button></div></div>';
        var wrapper = parseHTML(html);
        this.domElement = wrapper;
        this._domH = $('.picker_hue', wrapper);
        this._domSL = $('.picker_sl', wrapper);
        this._domA = $('.picker_alpha', wrapper);
        this._domEdit = $('.picker_editor input', wrapper);
        this._domSample = $('.picker_sample', wrapper);
        this._domOkay = $('.picker_done button', wrapper);
        this._domCancel = $('.picker_cancel button', wrapper);
        wrapper.classList.add('layout_' + this.settings.layout);

        if (!this.settings.alpha) {
          wrapper.classList.add('no_alpha');
        }

        if (!this.settings.editor) {
          wrapper.classList.add('no_editor');
        }

        if (!this.settings.cancelButton) {
          wrapper.classList.add('no_cancel');
        }

        this._ifPopup(function () {
          return wrapper.classList.add('popup');
        });

        this._setPosition();

        if (this.colour) {
          this._updateUI();
        } else {
          this._setColor(this.settings.defaultColor);
        }

        this._bindEvents();

        return true;
      }
    }, {
      key: 'hide',
      value: function hide() {
        return this._toggleDOM(false);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._events.destroy();

        if (this.domElement) {
          this.settings.parent.removeChild(this.domElement);
        }
      }
    }, {
      key: '_bindEvents',
      value: function _bindEvents() {
        var _this2 = this;

        var that = this,
            dom = this.domElement,
            events = this._events;

        function addEvent(target, type, handler) {
          events.add(target, type, handler);
        }

        addEvent(dom, 'click', function (e) {
          return e.preventDefault();
        });
        dragTrack(events, this._domH, function (x, y) {
          return that._setHSLA(x);
        });
        dragTrack(events, this._domSL, function (x, y) {
          return that._setHSLA(null, x, 1 - y);
        });

        if (this.settings.alpha) {
          dragTrack(events, this._domA, function (x, y) {
            return that._setHSLA(null, null, null, 1 - y);
          });
        }

        var editInput = this._domEdit;
        {
          addEvent(editInput, 'input', function (e) {
            that._setColor(this.value, {
              fromEditor: true,
              failSilently: true
            });
          });
          addEvent(editInput, 'focus', function (e) {
            var input = this;

            if (input.selectionStart === input.selectionEnd) {
              input.select();
            }
          });
        }

        this._ifPopup(function () {
          var popupCloseProxy = function popupCloseProxy(e) {
            return _this2.closeHandler(e);
          };

          addEvent(window, EVENT_CLICK_OUTSIDE, popupCloseProxy);
          addEvent(window, EVENT_TAB_MOVE, popupCloseProxy);
          onKey(events, dom, ['Esc', 'Escape'], popupCloseProxy);

          var timeKeeper = function timeKeeper(e) {
            _this2.__containedEvent = e.timeStamp;
          };

          addEvent(dom, EVENT_CLICK_OUTSIDE, timeKeeper);
          addEvent(dom, EVENT_TAB_MOVE, timeKeeper);
          addEvent(_this2._domCancel, 'click', popupCloseProxy);
        });

        var onDoneProxy = function onDoneProxy(e) {
          _this2._ifPopup(function () {
            return _this2.closeHandler(e);
          });

          if (_this2.onDone) {
            _this2.onDone(_this2.colour);
          }
        };

        addEvent(this._domOkay, 'click', onDoneProxy);
        onKey(events, dom, ['Enter'], onDoneProxy);
      }
    }, {
      key: '_setPosition',
      value: function _setPosition() {
        var parent = this.settings.parent,
            elm = this.domElement;

        if (parent !== elm.parentNode) {
          parent.appendChild(elm);
        }

        this._ifPopup(function (popup) {
          if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
          }

          var cssClass = popup === true ? 'popup_right' : 'popup_' + popup;
          ['popup_top', 'popup_bottom', 'popup_left', 'popup_right'].forEach(function (c) {
            if (c === cssClass) {
              elm.classList.add(c);
            } else {
              elm.classList.remove(c);
            }
          });
          elm.classList.add(cssClass);
        });
      }
    }, {
      key: '_setHSLA',
      value: function _setHSLA(h, s, l, a, flags) {
        flags = flags || {};
        var col = this.colour,
            hsla = col.hsla;
        [h, s, l, a].forEach(function (x, i) {
          if (x || x === 0) {
            hsla[i] = x;
          }
        });
        col.hsla = hsla;

        this._updateUI(flags);

        if (this.onChange && !flags.silent) {
          this.onChange(col);
        }
      }
    }, {
      key: '_updateUI',
      value: function _updateUI(flags) {
        if (!this.domElement) {
          return;
        }

        flags = flags || {};
        var col = this.colour,
            hsl = col.hsla,
            cssHue = 'hsl(' + hsl[0] * HUES + ', 100%, 50%)',
            cssHSL = col.hslString,
            cssHSLA = col.hslaString;
        var uiH = this._domH,
            uiSL = this._domSL,
            uiA = this._domA,
            thumbH = $('.picker_selector', uiH),
            thumbSL = $('.picker_selector', uiSL),
            thumbA = $('.picker_selector', uiA);

        function posX(parent, child, relX) {
          child.style.left = relX * 100 + '%';
        }

        function posY(parent, child, relY) {
          child.style.top = relY * 100 + '%';
        }

        posX(uiH, thumbH, hsl[0]);
        this._domSL.style.backgroundColor = this._domH.style.color = cssHue;
        posX(uiSL, thumbSL, hsl[1]);
        posY(uiSL, thumbSL, 1 - hsl[2]);
        uiSL.style.color = cssHSL;
        posY(uiA, thumbA, 1 - hsl[3]);
        var opaque = cssHSL,
            transp = opaque.replace('hsl', 'hsla').replace(')', ', 0)'),
            bg = 'linear-gradient(' + [opaque, transp] + ')';
        this._domA.style.background = bg + ', ' + BG_TRANSP;

        if (!flags.fromEditor) {
          var format = this.settings.editorFormat,
              alpha = this.settings.alpha;
          var value = void 0;

          switch (format) {
            case 'rgb':
              value = col.printRGB(alpha);
              break;

            case 'hsl':
              value = col.printHSL(alpha);
              break;

            default:
              value = col.printHex(alpha);
          }

          this._domEdit.value = value;
        }

        this._domSample.style.color = cssHSLA;
      }
    }, {
      key: '_ifPopup',
      value: function _ifPopup(actionIf, actionElse) {
        if (this.settings.parent && this.settings.popup) {
          actionIf && actionIf(this.settings.popup);
        } else {
          actionElse && actionElse();
        }
      }
    }, {
      key: '_toggleDOM',
      value: function _toggleDOM(toVisible) {
        var dom = this.domElement;

        if (!dom) {
          return false;
        }

        var displayStyle = toVisible ? '' : 'none',
            toggle = dom.style.display !== displayStyle;

        if (toggle) {
          dom.style.display = displayStyle;
        }

        return toggle;
      }
    }]);
    return Picker;
  }();

  {
    var style = document.createElement('style');
    style.textContent = '.picker_wrapper.no_alpha .picker_alpha{display:none}.picker_wrapper.no_editor .picker_editor{position:absolute;z-index:-1;opacity:0}.picker_wrapper.no_cancel .picker_cancel{display:none}.layout_default.picker_wrapper{display:flex;flex-flow:row wrap;justify-content:space-between;align-items:stretch;font-size:10px;width:25em;padding:.5em}.layout_default.picker_wrapper input,.layout_default.picker_wrapper button{font-size:1rem}.layout_default.picker_wrapper>*{margin:.5em}.layout_default.picker_wrapper::before{content:"";display:block;width:100%;height:0;order:1}.layout_default .picker_slider,.layout_default .picker_selector{padding:1em}.layout_default .picker_hue{width:100%}.layout_default .picker_sl{flex:1 1 auto}.layout_default .picker_sl::before{content:"";display:block;padding-bottom:100%}.layout_default .picker_editor{order:1;width:6.5rem}.layout_default .picker_editor input{width:100%;height:100%}.layout_default .picker_sample{order:1;flex:1 1 auto}.layout_default .picker_done,.layout_default .picker_cancel{order:1}.picker_wrapper{box-sizing:border-box;background:#f2f2f2;box-shadow:0 0 0 1px silver;cursor:default;font-family:sans-serif;color:#444;pointer-events:auto}.picker_wrapper:focus{outline:none}.picker_wrapper button,.picker_wrapper input{box-sizing:border-box;border:none;box-shadow:0 0 0 1px silver;outline:none}.picker_wrapper button:focus,.picker_wrapper button:active,.picker_wrapper input:focus,.picker_wrapper input:active{box-shadow:0 0 2px 1px #1e90ff}.picker_wrapper button{padding:.4em .6em;cursor:pointer;background-color:#f5f5f5;background-image:linear-gradient(0deg, gainsboro, transparent)}.picker_wrapper button:active{background-image:linear-gradient(0deg, transparent, gainsboro)}.picker_wrapper button:hover{background-color:#fff}.picker_selector{position:absolute;z-index:1;display:block;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%);border:2px solid #fff;border-radius:100%;box-shadow:0 0 3px 1px #67b9ff;background:currentColor;cursor:pointer}.picker_slider .picker_selector{border-radius:2px}.picker_hue{position:relative;background-image:linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);box-shadow:0 0 0 1px silver}.picker_sl{position:relative;box-shadow:0 0 0 1px silver;background-image:linear-gradient(180deg, white, rgba(255, 255, 255, 0) 50%),linear-gradient(0deg, black, rgba(0, 0, 0, 0) 50%),linear-gradient(90deg, #808080, rgba(128, 128, 128, 0))}.picker_alpha,.picker_sample{position:relative;background:linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0/2em 2em,linear-gradient(45deg, lightgrey 25%, white 25%, white 75%, lightgrey 75%) 1em 1em/2em 2em;box-shadow:0 0 0 1px silver}.picker_alpha .picker_selector,.picker_sample .picker_selector{background:none}.picker_editor input{font-family:monospace;padding:.2em .4em}.picker_sample::before{content:"";position:absolute;display:block;width:100%;height:100%;background:currentColor}.picker_arrow{position:absolute;z-index:-1}.picker_wrapper.popup{position:absolute;z-index:2;margin:1.5em}.picker_wrapper.popup,.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{background:#f2f2f2;box-shadow:0 0 10px 1px rgba(0,0,0,.4)}.picker_wrapper.popup .picker_arrow{width:3em;height:3em;margin:0}.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{content:"";display:block;position:absolute;top:0;left:0;z-index:-99}.picker_wrapper.popup .picker_arrow::before{width:100%;height:100%;-webkit-transform:skew(45deg);transform:skew(45deg);-webkit-transform-origin:0 100%;transform-origin:0 100%}.picker_wrapper.popup .picker_arrow::after{width:150%;height:150%;box-shadow:none}.popup.popup_top{bottom:100%;left:0}.popup.popup_top .picker_arrow{bottom:0;left:0;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.popup.popup_bottom{top:100%;left:0}.popup.popup_bottom .picker_arrow{top:0;left:0;-webkit-transform:rotate(90deg) scale(1, -1);transform:rotate(90deg) scale(1, -1)}.popup.popup_left{top:0;right:100%}.popup.popup_left .picker_arrow{top:0;right:0;-webkit-transform:scale(-1, 1);transform:scale(-1, 1)}.popup.popup_right{top:0;left:100%}.popup.popup_right .picker_arrow{top:0;left:0}';
    document.documentElement.firstElementChild.appendChild(style);
    Picker.StyleElement = style;
  }

  /* globals GM, sessionStorage, Blob */
  const PROGRESS_MAX = 14;
  const HL = getSiteLanguage();
  document.head.appendChild(document.createElement('style')).innerHTML = `
.btn-download {
  border:1px solid #1381fa;
}
.btn-download:first-child {
  margin:0px 0px 0px 5px;
  border-right:0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  background-color:#a8d89d;
}
.btn-download:last-child {
  margin:0px 5px 0px 0px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  background-color:#96B4FA;
}
.btn-download:hover {
  background-color:white;
}

.main-popup-window {
  position: fixed;
  top: 20%;
  left: 20%;
  background: #f7f4fb;
  min-width: 400px;
  min-height: 200px;
  z-index: 10;
  border: 2px #a204fb solid;
  box-shadow: #b41aca4d 10px 10px 10px;
  text-align: center;
}
.main-popup-window .close-button {
  position: absolute;
  top:1px;
  right:1px;
  cursor:pointer;
}
.main-popup-window label {
  display:inline;
}
.main-popup-window input {
  display:inline;
  width:50px;
}
.main-popup-window select {
  display:inline;
  width:auto;
  -webkit-appearance: auto;
  appearance: auto;
}
.main-popup-window fieldset {
  border: 1px #a204fb solid;
  margin: 3px;
  padding: 2px;
  background: #f4ebff;
}

`;

  if (document.location.href.match(/\/r\/(\d+)/)) {
    addDownloadButtons();
  }

  function addDownloadButtons() {
    GM.registerMenuCommand('Download route file', () => downloadRoute());
    GM.registerMenuCommand('Clear cache', () => clearCache());
    const div = document.querySelector('.btn-group .actions').appendChild(document.createElement('div'));
    const downloadGPX = div.appendChild(document.createElement('button'));
    downloadGPX.appendChild(document.createTextNode('GPX'));
    downloadGPX.setAttribute('title', 'Userscript - Generate GPX file');
    downloadGPX.classList.add('btn');
    downloadGPX.classList.add('btn-download');
    downloadGPX.addEventListener('click', () => downloadRoute('gpx'));
    const downloadKML = div.appendChild(document.createElement('button'));
    downloadKML.appendChild(document.createTextNode('KML'));
    downloadKML.setAttribute('title', 'Userscript - Generate KML file');
    downloadKML.classList.add('btn');
    downloadKML.classList.add('btn-download');
    downloadKML.addEventListener('click', () => downloadRoute('kml'));
  }

  function downloadRoute(format) {
    document.querySelectorAll('.main-popup-window').forEach(e => e.remove());
    const div = document.body.appendChild(document.createElement('div'));
    div.classList.add('main-popup-window');
    const progress = div.appendChild(document.createElement('progress'));
    progress.value = 0;
    progress.max = PROGRESS_MAX;
    progress.style.visibility = 'hidden';
    div.appendChild(document.createElement('br'));
    const label0 = div.appendChild(document.createElement('label'));
    label0.setAttribute('for', 'export_format');
    label0.appendChild(document.createTextNode('Export format:'));
    const dropDown = div.appendChild(document.createElement('select'));
    dropDown.setAttribute('id', 'export_format');
    const formats = ['gpx', 'kml', 'tcx', 'geojson'];
    const presetFormat = format || 'gpx';
    formats.forEach(function (ext) {
      const option = dropDown.appendChild(document.createElement('option'));
      option.appendChild(document.createTextNode(ext));

      if (presetFormat === ext) {
        option.selected = true;
      }
    });
    div.appendChild(document.createElement('br'));
    const checkbox = div.appendChild(document.createElement('input'));
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', 'export_add_elevation');
    const label1 = div.appendChild(document.createElement('label'));
    label1.setAttribute('for', 'export_add_elevation');
    label1.appendChild(document.createTextNode('Add elevation data (may take several minutes)'));
    div.appendChild(document.createElement('br'));
    const downloadButton = div.appendChild(document.createElement('button'));
    downloadButton.appendChild(document.createTextNode('Generate & Download'));
    downloadButton.addEventListener('click', () => startDownload(progress));
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));
    const fieldset = div.appendChild(document.createElement('fieldset'));
    const legend = fieldset.appendChild(document.createElement('legend'));
    legend.appendChild(document.createTextNode('KML/geoJSON options'));
    const labelColor = fieldset.appendChild(document.createElement('label'));
    labelColor.setAttribute('for', 'kml_line_color');
    labelColor.appendChild(document.createTextNode('Line color:'));
    const inputColor = fieldset.appendChild(document.createElement('input'));
    inputColor.setAttribute('id', 'kml_line_color');
    inputColor.setAttribute('readonly', '1');
    inputColor.value = 'acf36708';
    inputColor.style.width = '100px';
    fieldset.appendChild(document.createTextNode(' '));
    const colorChooserButton = fieldset.appendChild(document.createElement('button'));
    colorChooserButton.style.backgroundColor = '#0867f3ac';
    colorChooserButton.appendChild(document.createTextNode('Change'));
    const picker = new Picker({
      parent: colorChooserButton,
      color: '#0867f3ac'
    });

    picker.onChange = function (color) {
      colorChooserButton.style.background = color.rgbaString;
      const hex = color.hex.substring(1);
      inputColor.value = hex.substring(6, 8) + hex.substring(4, 6) + hex.substring(2, 4) + hex.substring(0, 2);
    };

    fieldset.appendChild(document.createTextNode(' '));
    const colorResetButton = fieldset.appendChild(document.createElement('button'));
    colorResetButton.appendChild(document.createTextNode('Reset'));
    colorResetButton.addEventListener('click', () => picker.setColor('#0867f3ac'));
    fieldset.appendChild(document.createElement('br'));
    fieldset.appendChild(document.createElement('br'));
    const labelWidth = fieldset.appendChild(document.createElement('label'));
    labelWidth.setAttribute('for', 'kml_line_width');
    labelWidth.appendChild(document.createTextNode('Line width:'));
    const inputWidth = fieldset.appendChild(document.createElement('input'));
    inputWidth.setAttribute('id', 'kml_line_width');
    inputWidth.value = '4';
    inputWidth.style.width = '40px';
    div.appendChild(document.createTextNode('Report problem or suggest an improvement:'));
    div.appendChild(document.createElement('br'));
    const support = div.appendChild(document.createElement('a'));
    support.setAttribute('href', 'https://github.com/cvzi/bikemapnet-userscript/issues');
    support.appendChild(document.createTextNode('https://github.com/cvzi/bikemapnet-userscript/issues'));
    addCloseButton(div);
  }

  function addCloseButton(div) {
    const close = div.appendChild(document.createElement('span'));
    close.classList.add('close-button');
    close.appendChild(document.createTextNode('❌'));
    close.addEventListener('click', function () {
      this.parentNode.remove();
    });
    return close;
  }

  function startDownload(progress) {
    const routeId = parseInt(document.location.href.match(/\/r\/(\d+)/)[1]);
    const name = document.querySelector('h1.title').title;
    const routeDescriptionDiv = document.querySelector('.route-description');
    const desc = routeDescriptionDiv ? routeDescriptionDiv.textContent.trim() : '';
    const format = document.getElementById('export_format').selectedOptions[0].value.trim().toLowerCase();
    const addElevation = document.getElementById('export_add_elevation').checked;
    const lineColor = document.getElementById('kml_line_color').value;
    const lineWidth = document.getElementById('kml_line_width').value;
    downloadVertices(routeId, format, addElevation, lineColor, lineWidth, name, desc, progress);
  }

  function downloadVertices(routeId, format, addElevation, lineColor, lineWidth, name, desc, progress) {
    console.log('downloadVertices()');
    progress.style.visibility = 'visible';
    progress.value = 1;
    cachedRequest({
      method: 'GET',
      url: `https://maptoolkit.net/export/outdoorish_bikemap_routes/${routeId}.profile?api_key=outdoorish`,
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      },
      onload: function (resp) {
        progress.value = 2;
        const routeData = JSON.parse(resp.responseText);
        routeData.routeId = routeId;
        routeData.routeName = name;
        routeData.routeDesc = desc;
        routeData.format = format;
        routeData.addElevation = !!addElevation;
        routeData.lineColor = lineColor;
        routeData.lineWidth = lineWidth;
        routeData.pois = [];
        downloadPOIs(routeData, progress);
      },
      onerror: function (response) {
        window.alert('Error:' + response.status);
      }
    });
  }

  function downloadPOIs(routeData, progress) {
    console.log('downloadPOIs()');
    progress.value = 3;
    cachedRequest({
      method: 'GET',
      url: `https://www.bikemap.net/${HL}/r/${routeData.routeId}/data/`,
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      },
      referrer: `https://www.bikemap.net/${HL}/r/11276904/`,
      onload: function (resp) {
        progress.value = 4;

        try {
          const data = JSON.parse(resp.responseText);

          if ('pois' in data) {
            const pois = JSON.parse(data.pois);

            if (pois) {
              routeData.pois = pois;
            }
          }
        } catch (e) {
          window.alert('Could not download "Point of Interests". Continuing without them\n\nError:\n' + e);
          console.error(e);
        }

        decideIfElevation(routeData, progress);
      },
      onerror: function (response) {
        decideIfElevation(routeData, progress);
        window.alert('Error:' + response.status);
      }
    });
  }

  function decideIfElevation(routeData, progress) {
    if (routeData.addElevation) {
      downloadElevation(routeData, progress, 0);
    } else {
      exportRoute(routeData, progress);
    }
  }

  function downloadElevation(routeData, progress, index) {
    console.log('downloadElevation() index=', index);
    const n = 100;
    const start = index || 0;
    const end = start + n < routeData.vertices.length ? start + n : routeData.vertices.length;
    progress.value = 4 + 10 * (start / routeData.vertices.length);
    cachedRequest({
      method: 'GET',
      url: `https://maptoolkit.net/elevationprofile?points=${JSON.stringify(routeData.vertices.slice(start, end))}&tolerance=10&api_key=outdoorish`,
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      },
      onload: function (resp) {
        const data = JSON.parse(resp.responseText); // Add elevation data to points if available

        let j = 0;
        routeData.vertices.map((p, i) => {
          if (i >= start && i < end) {
            p.unshift(data.elevation[j++]);
          }

          return p;
        });

        if (end < routeData.vertices.length) {
          downloadElevation(routeData, progress, end);
        } else {
          exportRoute(routeData, progress);
        }
      },
      onerror: function (response) {
        window.alert('Error:' + response.status);
      }
    });
  }

  function exportRoute(routeData, progress) {
    // Find min/max elevation
    routeData.minElevation = Number.MAX_SAFE_INTEGER;
    routeData.maxElevation = Number.MIN_SAFE_INTEGER;
    routeData.minElevationPoint = null;
    routeData.maxElevationPoint = null;

    if (routeData.vertices[0].length > 2) {
      routeData.vertices.forEach(function (p) {
        if (p[0] < routeData.minElevation) {
          routeData.minElevation = p[0];
          routeData.minElevationPoint = [p[1], p[2]];
        }

        if (p[0] > routeData.maxElevation) {
          routeData.maxElevation = p[0];
          routeData.maxElevationPoint = [p[1], p[2]];
        }
      });
    } else {
      routeData.minElevation = Math.min(...routeData.elevation);
      routeData.maxElevation = Math.max(...routeData.elevation);
    }

    if (routeData.format === 'gpx') {
      toGPX(routeData, progress);
    } else if (routeData.format === 'tcx') {
      toTCX(routeData, progress);
    } else if (routeData.format === 'geojson') {
      toGeoJSON(routeData, progress);
    } else {
      toKML(routeData, progress);
    }
  }

  function toKML(routeData, progress) {
    progress.value = PROGRESS_MAX;
    const poiXML = routeData.pois.map(poi => {
      const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort');
      let icon = '';

      if ('icon' in poi && poi.icon && 'iconUrl' in poi.icon) {
        icon = `<Icon>
        <href>https://static.bikemap.net/${escapeXML(poi.icon.iconUrl)}</href>
      </Icon>`;
      }

      let description = poiType(poi.poi_class, HL);

      if ('image' in poi && poi.image) {
        description += '\n\n' + poi.image;
      }

      return `<Placemark>
      <name>${escapeXML(name)}</name>
      <description>${escapeXML(description)}</description>
      ${icon}
      <Point>
         <coordinates>${poi.lng},${poi.lat}</coordinates>
       </Point>
    </Placemark>`;
    }).join('\n    ');
    const coordinates = routeData.vertices.map(p => p.reverse().join(',')).join('\n');
    const temp = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(routeData.routeName)}</name>
    <description>${escapeXML(routeData.routeDesc)}
    https://www.bikemap.net/${HL}/r/${escapeXML(routeData.routeId)}/
${escapeXML(metablock(routeData))}
    </description>
    <Style id="myStyle">
      <LineStyle>
        <color>${routeData.lineColor}</color>
        <width>${routeData.lineWidth}</width>
      </LineStyle>
      <PolyStyle>
        <color>7f00ff00</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${escapeXML(routeData.routeName)}</name>
      <description>${escapeXML(routeData.routeDesc)}</description>
      <styleUrl>#myStyle</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>${coordinates}
        </coordinates>
      </LineString>
    </Placemark>
    ${poiXML}
  </Document>
</kml>
`;
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'kml'), temp, 'application/vnd.google-earth.kml+xml', progress);
  }

  function toGPX(routeData, progress) {
    progress.value = PROGRESS_MAX;
    const wtes = routeData.pois.map(poi => {
      const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort');
      const type = poiType(poi.poi_class, HL);
      let description = type;
      let link = '';

      if ('image' in poi && poi.image) {
        description += '\n\n' + poi.image;
        link = `<link href="${escapeXML(poi.image)}"><text></text></link>`;
      }

      return `
    <wpt lat="${poi.lat}" lon="${poi.lng}">
      <name>${escapeXML(name)}</name>
      <desc>${escapeXML(description)}</desc>
      ${link}
      <sym>${escapeXML(poiType(poi.poi_class, 'gpx'))}</sym>
      <type>${type}</type>
    </wpt>`;
    }).join('\n');
    const rtepts = routeData.vertices.map(p => {
      if (p.length === 3) {
        return `<rtept lat="${p[1]}" lon="${p[2]}">
  <ele>${p[0]}</ele>
</rtept>`;
      } else {
        return `<rtept lat="${p[0]}" lon="${p[1]}"/>`;
      }
    }).join('\n');
    const temp = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx xmlns="http://www.topografix.com/GPX/1/1" creator="https://bikemap.net and https://github.com/cvzi/bikemapnet-userscript" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
    <metadata>
      <name>${escapeXML(routeData.routeName)}</name>
      <desc>
      ${escapeXML(metablock(routeData))}
      </desc>
      <link href="https://www.bikemap.net/${HL}/r/${escapeXML(routeData.routeId)}/">
        <text>${escapeXML(routeData.routeDesc)}</text>
      </link>
      <time>${escapeXML(new Date().toISOString())}</time>
    </metadata>
${wtes}
    <rte>
      <name>${escapeXML(routeData.routeName)}</name>
${rtepts}
    </rte>
  </gpx>
`;
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'gpx'), temp, 'application/gpx+xml', progress);
  }

  function toTCX(routeData, progress) {
    progress.value = PROGRESS_MAX;
    const coursePoints = routeData.pois.map(poi => {
      const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort');
      const type = poiType(poi.poi_class, HL);
      let description = name + '\n' + type;

      if ('image' in poi && poi.image) {
        description += '\n\n' + poi.image;
      }

      return `          <CoursePoint>
            <Name>${escapeXML(name).substring(0, 10)}</Name>
            <Position>
              <LatitudeDegrees>${poi.lat}</LatitudeDegrees>
              <LongitudeDegrees>${poi.lng}</LongitudeDegrees>
            </Position>
            <PointType>${escapeXML(poiType(poi.poi_class, 'tcx'))}</PointType>
            <Notes>${escapeXML(description)}</Notes>
          </CoursePoint>`;
    }).join('\n');
    let beginPosition;

    if (routeData.vertices[0].length === 3) {
      beginPosition = [routeData.vertices[0][1], routeData.vertices[0][2]];
    } else {
      beginPosition = routeData.vertices[0];
    }

    let endPosition;
    const lastInd = routeData.vertices.length - 1;

    if (routeData.vertices[lastInd].length === 3) {
      endPosition = [routeData.vertices[lastInd][1], routeData.vertices[lastInd][2]];
    } else {
      endPosition = routeData.vertices[lastInd];
    }

    const trackPoints = routeData.vertices.map(p => {
      let content;

      if (p.length === 3) {
        content = `            <Position>
              <LatitudeDegrees>${p[1]}</LatitudeDegrees>
              <LongitudeDegrees>${p[2]}</LongitudeDegrees>
            </Position>
            <AltitudeMeters>${p[0]}</AltitudeMeters>`;
      } else {
        content = `            <Position>
              <LatitudeDegrees>${p[0]}</LatitudeDegrees>
              <LongitudeDegrees>${p[1]}</LongitudeDegrees>
            </Position>`;
      }

      return `          <Trackpoint>
${content}
          </Trackpoint>`;
    }).join('\n');
    const temp = `<?xml version="1.0" encoding="UTF-8"?>
  <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
    <Folders>
      <Courses>
        <CourseFolder Name="Courses">
          <CourseNameRef>
            <Id>${escapeXML(routeData.routeName)}</Id>
          </CourseNameRef>
        </CourseFolder>
      </Courses>
    </Folders>
    <Courses>
      <Course>
        <Name>${escapeXML(routeData.routeName)}</Name>
        <Lap>
          <DistanceMeters>${routeData.distance}</DistanceMeters>
          <BeginPosition>
            <LatitudeDegrees>${beginPosition[0]}</LatitudeDegrees>
            <LongitudeDegrees>${beginPosition[1]}</LongitudeDegrees>
          </BeginPosition>
          <EndPosition>
            <LatitudeDegrees>${endPosition[0]}</LatitudeDegrees>
            <LongitudeDegrees>${endPosition[1]}</LongitudeDegrees>
          </EndPosition>
        </Lap>
        <Track>
${trackPoints}
        </Track>
        <Notes>
        ${escapeXML(metablock(routeData))}
        </Notes>
${coursePoints}
      </Course>
    </Courses>
  </TrainingCenterDatabase>
`;
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'tcx'), temp, 'application/vnd.garmin.tcx+xml', progress);
  }

  function toGeoJSON(routeData, progress) {
    progress.value = PROGRESS_MAX;
    let minElevationRepr = '' + elevationFormat(routeData.minElevation);

    if (routeData.minElevationPoint) {
      minElevationRepr += ' (at ' + routeData.minElevationPoint.join(', ') + ')';
    }

    let maxElevationRepr = '' + elevationFormat(routeData.maxElevation);

    if (routeData.maxElevationPoint) {
      maxElevationRepr += ' (at ' + routeData.maxElevationPoint.join(', ') + ')';
    }

    const geoJSON = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          name: routeData.routeName,
          desc: metablock(routeData),
          stroke: '#' + routeData.lineColor.substring(6, 8) + routeData.lineColor.substring(4, 6) + routeData.lineColor.substring(2, 4) + routeData.lineColor.substring(0, 2),
          'stroke-width': routeData.lineWidth,
          url: `https://www.bikemap.net/${HL}/r/${escapeXML(routeData.routeId)}/`,
          distance: distanceFormat(routeData.distance),
          distanceMeters: routeData.distance,
          timeCycling: hoursMinutes(routeData.cycling_time),
          timeCyclingRace: hoursMinutes(routeData.race_cycling_time),
          timeCyclingOffroad: hoursMinutes(routeData.offroad_cycling_time),
          timeWalking: hoursMinutes(routeData.walking_time),
          ascent: elevationFormat(routeData.ascend),
          descend: elevationFormat(routeData.descend),
          elevationMin: minElevationRepr,
          elevationMax: maxElevationRepr
        },
        geometry: {
          type: 'LineString',
          coordinates: routeData.vertices.map(p => p.reverse()) // [lon, lat, alt]

        },
        title: routeData.routeName,
        id: routeData.routeId
      }]
    };
    geoJSON.features.push(...routeData.pois.map(function (poi) {
      const featurePoint = {
        type: 'Feature',
        properties: {
          name: poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort'),
          desc: poiType(poi.poi_class, HL),
          'marker-symbol': poiType(poi.poi_class, 'geojson')
        },
        geometry: {
          type: 'Point',
          coordinates: [poi.lng, poi.lat]
        },
        title: poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort')
      };

      if ('image' in poi && poi.image) {
        featurePoint.properties.url = poi.image;
      }

      return featurePoint;
    }));
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'geojson'), JSON.stringify(geoJSON, null, 2), 'application/geo+json', progress);
  }

  function metablock(routeData) {
    let minElevationRepr = '' + elevationFormat(routeData.minElevation);

    if (routeData.minElevationPoint) {
      minElevationRepr += ' (at ' + routeData.minElevationPoint.join(', ') + ')';
    }

    let maxElevationRepr = '' + elevationFormat(routeData.maxElevation);

    if (routeData.maxElevationPoint) {
      maxElevationRepr += ' (at ' + routeData.maxElevationPoint.join(', ') + ')';
    }

    return `
    Distance: ${distanceFormat(routeData.distance)}

    Race cycling time: ${hoursMinutes(routeData.race_cycling_time)}
    Offroad cycling time: ${hoursMinutes(routeData.offroad_cycling_time)}
    Cycling time: ${hoursMinutes(routeData.cycling_time)}
    Walking time: ${hoursMinutes(routeData.walking_time)}

    Ascent: ${elevationFormat(routeData.ascend)}
    Descend: ${elevationFormat(routeData.descend)}

    Min. elevation: ${minElevationRepr}
    Max. elevation: ${maxElevationRepr}
  `;
  }

  function downloadFile(routeData, name, content, mimeType, progress) {
    const div = progress.parentNode;
    div.innerHTML = '<br>';
    const a = div.appendChild(document.createElement('a'));
    a.download = name;
    a.href = window.URL.createObjectURL(new Blob([content], {
      type: mimeType || 'text/plain'
    }));
    a.appendChild(document.createTextNode('Download'));
    a.click();
    div.appendChild(document.createElement('br'));
    const info = div.appendChild(document.createElement('pre'));
    info.style.textAlign = 'left';
    info.innerHTML = metablock(routeData);
    addCloseButton(div);
  }

  function poiType(poiClass, lang) {
    const data = {
      'poi-hotel': {
        en: 'Accomodation',
        de: 'Unterkunft',
        gpx: 'Hotel',
        tcx: 'Generic',
        geojson: 'lodging'
      },
      'poi-sight': {
        en: 'Point of Interest',
        de: 'Interessanter Ort',
        tcx: 'Generic',
        geojson: 'marker'
      },
      'poi-repair': {
        en: 'Bike Service',
        de: 'Fahrradservice',
        tcx: 'Generic',
        geojson: 'bicycle'
      },
      'poi-photo': {
        en: 'Photo',
        de: 'Foto',
        gpx: 'Scenic Area',
        tcx: 'Generic',
        geojson: 'camera'
      },
      'poi-water': {
        en: 'Drinking Water',
        de: 'Trinkwasser',
        gpx: 'Drinking Water',
        tcx: 'Water',
        geojson: 'water'
      }
    };

    if (poiClass in data && lang in data[poiClass]) {
      return data[poiClass][lang];
    }

    if (poiClass in data && 'en' in data[poiClass]) {
      return data[poiClass].en;
    }

    return poiClass.replace('poi-');
  }

  function fileName(title, ext) {
    let name = title.replace(/[:*?<>/\\,|\u0000]/g, ''); // eslint-disable-line no-control-regex

    name = name.trim().replace(/^\.+/, '').replace(/\.+$/, '').trim();
    return name + '.' + ext;
  }

  function clearCache() {
    const n = sessionStorage.length;
    sessionStorage.clear();
    window.alert('Cache cleared!\n\n' + n + ' item(s) removed.');
  }

  function cachedRequest(obj) {
    if ('data' in obj || obj.method !== 'GET') {
      return GM.xmlHttpRequest(obj);
    }

    const cached = sessionStorage.getItem(obj.url);

    if (cached !== null) {
      window.setTimeout(function () {
        const result = JSON.parse(cached);
        obj.onload(result);
      }, 1);
    } else {
      const orgOnload = obj.onload;

      obj.onload = function (response) {
        const newResponse = {};

        for (const key in response) {
          newResponse[key] = response[key];
        }

        newResponse.responseText = '' + response.responseText;
        newResponse.cached = true;

        if (!('time' in newResponse)) {
          newResponse.time = new Date().toJSON();
        }

        sessionStorage.setItem(obj.url, JSON.stringify(newResponse));
        orgOnload.apply(this, [response]);
      };

      GM.xmlHttpRequest(obj);
    }
  }

  function hoursMinutes(minutes) {
    const hours = parseInt(minutes / 60);
    minutes = parseInt(minutes % 60);
    minutes = (minutes < 10 ? '0' : '') + minutes;
    return `${hours ? hours + ':' : ''}${minutes} h`;
  }

  function distanceFormat(meters) {
    if (getSiteUnitFormat() === 'imperial') {
      const miles = 0.000621371192237334 * meters;
      const mileFormat = new Intl.NumberFormat(navigator.language, {
        style: 'unit',
        unit: 'mile',
        unitDisplay: 'short'
      });
      return mileFormat.format(parseInt(miles * 100) / 100);
    } else {
      if (meters < 3000) {
        const meterFormat = new Intl.NumberFormat(navigator.language, {
          style: 'unit',
          unit: 'meter',
          unitDisplay: 'narrow'
        });
        return meterFormat.format(parseInt(meters));
      } else {
        const kilometerFormat = new Intl.NumberFormat(navigator.language, {
          style: 'unit',
          unit: 'kilometer',
          unitDisplay: 'narrow'
        });
        return kilometerFormat.format(parseInt(meters / 100) / 10);
      }
    }
  }

  function elevationFormat(meters) {
    if (getSiteUnitFormat() === 'imperial') {
      const feet = 3.280839895 * meters;
      const footFormat = new Intl.NumberFormat(navigator.language, {
        style: 'unit',
        unit: 'foot',
        unitDisplay: 'short'
      });
      return footFormat.format(parseInt(feet * 100) / 100);
    } else {
      const meterFormat = new Intl.NumberFormat(navigator.language, {
        style: 'unit',
        unit: 'meter',
        unitDisplay: 'narrow'
      });
      return meterFormat.format(parseInt(meters));
    }
  }

  function getSiteUnitFormat() {
    const input = document.querySelector('#site-settings-column input[name=unit]');

    if (input && input.value === 'imperial') {
      return 'imperial';
    } else {
      return 'metric';
    }
  }

  function getSiteLanguage() {
    const input = document.querySelector('#site-settings-column input[name=language]');

    if (input && input.value === 'de') {
      return 'de';
    } else {
      return 'en';
    }
  }

  function escapeXML(s) {
    return s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

})();
