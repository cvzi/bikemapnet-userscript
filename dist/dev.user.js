// ==UserScript==
// @name        Bikemap.net Export GPX and KML routes [dev]
// @description Download GPX, KML and TCX files for a route on bikemap.net
// @namespace   github.com/cvzi
// @icon        https://static.bikemap.net/favicons/apple-touch-icon.png
// @match       https://www.bikemap.net/*
// @connect     maptoolkit.net
// @connect     localhost
// @version     1.1.0
// @homepage    https://github.com/cvzi/bikemapnet-userscript
// @author      cuzi
// @license     MIT
// @grant       GM.xmlHttpRequest
// @grant       GM_setClipboard
// @grant       GM.registerMenuCommand
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==
/*  globals GM */

'use strict';

(function () {
  const url = `http://localhost:8186/bundle.user.js?${Date.now()}`
  new Promise(function loadBundleFromServer (resolve, reject) {
    const req = GM.xmlHttpRequest({
      method: 'GET',
      url: url,
      onload: function (r) {
        if (r.status !== 200) {
          return reject(r)
        }
        resolve(r.responseText)
      },
      onerror: e => reject(e)
    })
    if (req && 'catch' in req) {
      req.catch(e => { /* ignore */ })
    }
  }).catch(function (e) {
    const log = function (obj, b) {
      let prefix = 'loadBundleFromServer: '
      try {
        prefix = GM.info.script.name + ': '
      } catch (e) {}
      if (b) {
        console.log(prefix + obj, b)
      } else {
        console.log(prefix, obj)
      }
    }
    if (e && 'status' in e) {
      if (e.status <= 0) {
        log('Server is not responding')
        GM.getValue('scriptlastsource3948218', false).then(function (src) {
          if (src) {
            log('%cExecuting cached script version', 'color: Crimson; font-size:x-large;')
            /* eslint-disable no-eval */
            eval(src)
          }
        })
      } else {
        log('HTTP status: ' + e.status)
      }
    } else {
      log(e)
    }
  }).then(function (s) {
    if (s) {
      /* eslint-disable no-eval */
      eval(`${s}
//# sourceURL=${url}`)
      GM.setValue('scriptlastsource3948218', s)
    }
  })
})()