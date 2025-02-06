// ==UserScript==
// @name        Bikemap.net Export GPX and KML routes
// @description Download GPX, KML, TCX and geoJSON files for a route on bikemap.net
// @namespace   github.com/cvzi
// @icon        https://static.bikemap.net/favicons/apple-touch-icon.png
// @match       https://www.bikemap.net/*
// @match       https://web.bikemap.net/*
// @connect     www.bikemap.net
// @version     1.3.0
// @homepage    https://github.com/cvzi/bikemapnet-userscript
// @author      cuzi
// @license     MIT
// @grant       GM.xmlHttpRequest
// @grant       GM.registerMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/445713/Bikemapnet%20Export%20GPX%20and%20KML%20routes.user.js
// @updateURL https://update.greasyfork.org/scripts/445713/Bikemapnet%20Export%20GPX%20and%20KML%20routes.meta.js
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

    /* globals GM, sessionStorage, Blob */
  
    if (document.location.href.match(/\/r\/(\d+)/)) {
      addDownloadButtons();
    }

    window.setInterval(makeButtonsClickable, 3000)

    function makeButtonsClickable() {
        if (document.getElementById('script_gpx_button')) {
            return
        }
        const buttonGroup = document.querySelector('[class*=ButtonGroup_root]')

        const aGPX = document.createElement('a')
        aGPX.id = 'script_gpx_button'
        aGPX.href = '#'
        aGPX.textContent = 'GPX'
        aGPX.addEventListener('click', function(ev) {
            if (!('ready' in this.dataset)) {
                ev.preventDefault()
                startDownload('gpx', this)
            }
        })
        aGPX.className = buttonGroup.querySelector('a').className
        buttonGroup.appendChild(aGPX)

        const aKML = document.createElement('a')
        aKML.href = '#'
        aKML.textContent = 'KML'
        aKML.addEventListener('click', function(ev) {
            if (!('ready' in this.dataset)) {
                ev.preventDefault()
                startDownload('kml', this)
            }
        })
        aKML.className = buttonGroup.querySelector('a').className
        buttonGroup.appendChild(aKML)
    }
  
    function addDownloadButtons() {
      GM.registerMenuCommand('Download gpx', () => startDownload('gpx'));
      GM.registerMenuCommand('Download kml', () => startDownload('kml'));
    }

    function downloadUrl(url, title, ext, button) {
        if (button) {
            button.href = url
            button.style.color = 'green'
            button.dataset.ready = 1
            button.target = '_blank'
            window.setTimeout(() => button.click(), 100)
        } else {
            document.location.href = url
        }
     }
  

    function startDownload(key, button) {
      const routeId = parseInt(document.location.href.match(/\/r\/(\d+)/)[1]);
      cachedRequest({
        method: 'GET',
        url: `https://www.bikemap.net/api/v5/routes/${routeId}/`,
        headers: {
          'x-requested-with': 'XMLHttpRequest'
        },
        onload: function (resp) {
          const routeData = JSON.parse(resp.responseText);
          downloadUrl(routeData[key], routeData.title, key, button);
        },
        onerror: function (response) {
          window.alert('Error:' + response.status);
        }
      });

    }

    function fileName(title, ext) {
        let name = title.replace(/[:*?<>/\\,|\u0000]/g, ''); // eslint-disable-line no-control-regex
     
        name = name.trim().replace(/^\.+/, '').replace(/\.+$/, '').trim();
        return name + '.' + ext;
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

  })();
  