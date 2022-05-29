// ==UserScript==
// @name        Bikemap.net Export GPX and KML routes
// @description Download GPX and KML files for a route on bikemap.net
// @namespace   github.com/cvzi
// @match       https://www.bikemap.net/*
// @version     0.0.1
// @homepage    https://github.com/cvzi/bikemapnet-userscript
// @author      cuzi
// @license     MIT
// @grant       GM.xmlHttpRequest
// @grant       GM_setClipboard
// ==/UserScript==

/*
MIT License

Copyright (c) 2020 cvzi

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

  console.log('index.js');
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

.progress-holder {
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
.progress-holder .close-button {
  position: absolute;
  top:1px;
  right:1px;
  cursor:pointer;
}
.progress-holder label {
  display:inline;
}
.progress-holder input {
  display:inline;
  width:50px;
}

`;

  if (document.location.href.match(/\/r\/(\d+)/)) {
    addDownloadButtons();
  }

  function addDownloadButtons() {
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
    document.querySelectorAll('.progress-holder').forEach(e => e.remove());
    const div = document.body.appendChild(document.createElement('div'));
    div.classList.add('progress-holder');
    const progress = div.appendChild(document.createElement('progress'));
    progress.value = 0;
    progress.max = 12;
    progress.style.visibility = 'hidden';
    div.appendChild(document.createElement('br'));
    const label0 = div.appendChild(document.createElement('label'));
    label0.setAttribute('for', 'export_format');
    label0.appendChild(document.createTextNode('Export format:'));
    const input = div.appendChild(document.createElement('input'));
    input.setAttribute('id', 'export_format');
    input.value = format || 'gpx';
    div.appendChild(document.createTextNode(' (kml or gpx)'));
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
    div.appendChild(document.createTextNode('Report problem or suggest an improvement:'));
    div.appendChild(document.createElement('br'));
    const support = div.appendChild(document.createElement('a'));
    support.setAttribute('href', 'https://github.com/cvzi/bikemapnet-userscript/issues');
    support.appendChild(document.createTextNode('https://github.com/cvzi/bikemapnet-userscript/issues'));
    const close = div.appendChild(document.createElement('span'));
    close.classList.add('close-button');
    close.appendChild(document.createTextNode('❌'));
    close.addEventListener('click', function () {
      this.parentNode.remove();
    });
  }

  function startDownload(progress) {
    const routeId = parseInt(document.location.href.match(/\/r\/(\d+)/)[1]);
    const name = document.querySelector('h1.title').title;
    const routeDescriptionDiv = document.querySelector('.route-description');
    const desc = routeDescriptionDiv ? routeDescriptionDiv.textContent.trim() : '';
    const format = document.getElementById('export_format').value.trim();
    const addElevation = document.getElementById('export_add_elevation').checked;
    downloadVertices(routeId, format, addElevation, name, desc, progress);
  }

  function downloadVertices(routeId, format, addElevation, name, desc, progress) {
    console.log('downloadVertices()');
    progress.style.visibility = 'visible';
    progress.value = 1;
    cachedRequest({
      method: 'GET',
      url: `https://maptoolkit.net/export/outdoorish_bikemap_routes/${routeId}.profile?api_key=outdoorish`,
      onload: function (resp) {
        progress.value = 2;
        const routeData = JSON.parse(resp.responseText);
        routeData.routeId = routeId;
        routeData.routeName = name;
        routeData.routeDesc = desc;
        routeData.format = format;
        routeData.addElevation = !!addElevation;

        if (routeData.addElevation) {
          downloadElevation(routeData, progress, 0);
        } else {
          exportRoute(routeData, progress);
        }
      },
      onerror: function (response) {
        window.alert('Error:' + response.status);
      }
    });
  }

  function downloadElevation(routeData, progress, index) {
    console.log('downloadElevation() index=', index);
    const n = 100;
    const start = index || 0;
    const end = start + n < routeData.vertices.length ? start + n : routeData.vertices.length;
    progress.value = 2 + 10 * (start / routeData.vertices.length);
    cachedRequest({
      method: 'GET',
      url: `https://maptoolkit.net/elevationprofile?points=${JSON.stringify(routeData.vertices.slice(start, end))}&tolerance=10&api_key=outdoorish`,
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
    if (routeData.format === 'gpx') {
      toGPX(routeData, progress);
    } else {
      toKML(routeData, progress);
    }
  }

  function toKML(routeData, progress) {
    progress.value = 12;
    const coordinates = routeData.vertices.map(p => p.reverse().join(',')).join('\n');
    const temp = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${routeData.routeName}</name>
    <description${routeData.routeDesc}</description>
    <Style id="yellowLineGreenPoly">
      <LineStyle>
        <color>7f00ffff</color>
        <width>4</width>
      </LineStyle>
      <PolyStyle>
        <color>7f00ff00</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${routeData.routeName}</name>
      <description>${routeData.routeDesc}</description>
      <styleUrl>#yellowLineGreenPoly</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>${coordinates}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
`;
    GM_setClipboard(temp);
    downloadFile('out.kml', temp, 'application/vnd.google-earth.kml+xml', progress);
  }

  function toGPX(routeData, progress) {
    progress.value = 12;
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
      <name>${routeData.routeName}</name>
      <link href="https://www.bikemap.net/en/r/${routeData.routeId}/">
        <text>${routeData.routeDesc}</text>
      </link>
      <time>${new Date().toISOString()}</time>
    </metadata>
    <rte>
      <name>${routeData.routeName}</name>
${rtepts}
    </rte>
  </gpx>
  
  
`;
    GM_setClipboard(temp);
    downloadFile('out.gpx', temp, 'application/gpx+xml', progress);
  }

  function downloadFile(name, content, mimeType, progress) {
    const div = progress.parentNode;
    div.innerHTML = '';
    const a = div.appendChild(document.createElement('a'));
    a.download = name;
    a.href = window.URL.createObjectURL(new Blob([content], {
      type: mimeType || 'text/plain'
    }));
    a.appendChild(document.createTextNode('Download'));
    a.click();
  }

  function cachedRequest(obj) {
    if ('data' in obj || obj.method != 'GET') {
      return GM.xmlHttpRequest(obj);
    }

    const cached = sessionStorage.getItem(obj.url);

    if (cached !== null) {
      window.setTimeout(function () {
        const result = JSON.parse(cached);
        obj.onload(result);
      }, 5);
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
