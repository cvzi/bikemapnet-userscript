// ==UserScript==
// @name        Bikemap.net Export GPX and KML routes
// @description Download GPX, KML and TCX files for a route on bikemap.net
// @namespace   github.com/cvzi
// @icon        https://static.bikemap.net/favicons/apple-touch-icon.png
// @match       https://www.bikemap.net/*
// @connect     maptoolkit.net
// @version     1.0.0
// @homepage    https://github.com/cvzi/bikemapnet-userscript
// @author      cuzi
// @license     MIT
// @grant       GM.xmlHttpRequest
// @grant       GM_setClipboard
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

  /* globals GM, GM_setClipboard, sessionStorage, Blob */
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
    GM.registerMenuCommand('Download route file', () => downloadRoute());
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
    div.appendChild(document.createTextNode(' (kml or gpx or tcx)'));
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
    const format = document.getElementById('export_format').value.trim().toLowerCase();
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
    <name>${escapeXML(routeData.routeName)}</name>
    <description>${escapeXML(routeData.routeDesc)}
    https://www.bikemap.net/en/r/${escapeXML(routeData.routeId)}/
${escapeXML(metablock(routeData))}
    </description>
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
      <name>${escapeXML(routeData.routeName)}</name>
      <description>${escapeXML(routeData.routeDesc)}</description>
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
`; // GM_setClipboard(temp)

    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'kml'), temp, 'application/vnd.google-earth.kml+xml', progress);
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
      <name>${escapeXML(routeData.routeName)}</name>
      <desc>
      ${escapeXML(metablock(routeData))}
      </desc>
      <link href="https://www.bikemap.net/en/r/${escapeXML(routeData.routeId)}/">
        <text>${escapeXML(routeData.routeDesc)}</text>
      </link>
      <time>${escapeXML(new Date().toISOString())}</time>
    </metadata>
    <rte>
      <name>${escapeXML(routeData.routeName)}</name>
${rtepts}
    </rte>
  </gpx>
`;
    GM_setClipboard(temp);
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'gpx'), temp, 'application/gpx+xml', progress);
  }

  function toTCX(routeData, progress) {
    progress.value = 12;
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
        <Notes>
        ${escapeXML(metablock(routeData))}
        </Notes>
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
      </Course>
    </Courses>
  </TrainingCenterDatabase>
`;
    GM_setClipboard(temp);
    downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'tcx'), temp, 'application/vnd.garmin.tcx+xml', progress);
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

  function escapeXML(s) {
    return s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

})();
