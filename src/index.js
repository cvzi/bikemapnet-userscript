/* globals GM, sessionStorage, Blob */

import Picker from 'vanilla-picker'

const PROGRESS_MAX = 14
const HL = getSiteLanguage()

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
  min-width: 500px;
  min-height: 200px;
  max-height: 75%;
  max-width: 75%;
  overflow: auto;
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

`

if (document.location.href.match(/\/r\/(\d+)/)) {
  addDownloadButtons()
}

function addDownloadButtons () {
  GM.registerMenuCommand('Download route file', () => downloadRoute())
  GM.registerMenuCommand('Clear cache', () => clearCache())

  const div = document.querySelector('.btn-group .actions').appendChild(document.createElement('div'))

  const downloadGPX = div.appendChild(document.createElement('button'))
  downloadGPX.appendChild(document.createTextNode('GPX'))
  downloadGPX.setAttribute('title', 'Userscript - Generate GPX file')
  downloadGPX.classList.add('btn')
  downloadGPX.classList.add('btn-download')
  downloadGPX.addEventListener('click', () => downloadRoute('gpx'))

  const downloadKML = div.appendChild(document.createElement('button'))
  downloadKML.appendChild(document.createTextNode('KML'))
  downloadKML.setAttribute('title', 'Userscript - Generate KML file')
  downloadKML.classList.add('btn')
  downloadKML.classList.add('btn-download')
  downloadKML.addEventListener('click', () => downloadRoute('kml'))
}

function downloadRoute (format) {
  document.querySelectorAll('.main-popup-window').forEach(e => e.remove())

  const div = document.body.appendChild(document.createElement('div'))
  div.classList.add('main-popup-window')
  const progress = div.appendChild(document.createElement('progress'))
  progress.value = 0
  progress.max = PROGRESS_MAX
  progress.style.visibility = 'hidden'

  div.appendChild(document.createElement('br'))

  const label0 = div.appendChild(document.createElement('label'))
  label0.setAttribute('for', 'export_format')
  label0.appendChild(document.createTextNode('Export format:'))
  const dropDown = div.appendChild(document.createElement('select'))
  dropDown.setAttribute('id', 'export_format')
  const formats = ['gpx', 'kml', 'tcx', 'geojson']
  const presetFormat = format || 'gpx'
  formats.forEach(function (ext) {
    const option = dropDown.appendChild(document.createElement('option'))
    option.appendChild(document.createTextNode(ext))
    if (presetFormat === ext) {
      option.selected = true
    }
  })

  div.appendChild(document.createElement('br'))

  const checkbox = div.appendChild(document.createElement('input'))
  checkbox.setAttribute('type', 'checkbox')
  checkbox.setAttribute('id', 'export_add_elevation')
  const label1 = div.appendChild(document.createElement('label'))
  label1.setAttribute('for', 'export_add_elevation')
  label1.appendChild(document.createTextNode('Add elevation data (may take several minutes)'))

  div.appendChild(document.createElement('br'))

  const downloadButton = div.appendChild(document.createElement('button'))
  downloadButton.appendChild(document.createTextNode('Generate & Download'))
  downloadButton.addEventListener('click', () => startDownload(progress))

  div.appendChild(document.createElement('br'))
  div.appendChild(document.createElement('br'))

  const fieldset = div.appendChild(document.createElement('fieldset'))
  const legend = fieldset.appendChild(document.createElement('legend'))
  legend.appendChild(document.createTextNode('KML/geoJSON options'))

  const labelColor = fieldset.appendChild(document.createElement('label'))
  labelColor.setAttribute('for', 'kml_line_color')
  labelColor.appendChild(document.createTextNode('Line color:'))
  const inputColor = fieldset.appendChild(document.createElement('input'))
  inputColor.setAttribute('id', 'kml_line_color')
  inputColor.setAttribute('readonly', '1')
  inputColor.value = 'acf36708'
  inputColor.style.width = '100px'
  fieldset.appendChild(document.createTextNode(' '))
  const colorChooserButton = fieldset.appendChild(document.createElement('button'))
  colorChooserButton.style.backgroundColor = '#0867f3ac'
  colorChooserButton.appendChild(document.createTextNode('Change'))
  const picker = new Picker({
    parent: colorChooserButton,
    color: '#0867f3ac'
  })
  picker.onChange = function (color) {
    colorChooserButton.style.background = color.rgbaString
    const hex = color.hex.substring(1)
    inputColor.value = hex.substring(6, 8) + hex.substring(4, 6) + hex.substring(2, 4) + hex.substring(0, 2)
  }
  fieldset.appendChild(document.createTextNode(' '))
  const colorResetButton = fieldset.appendChild(document.createElement('button'))
  colorResetButton.appendChild(document.createTextNode('Reset'))
  colorResetButton.addEventListener('click', () => picker.setColor('#0867f3ac'))

  fieldset.appendChild(document.createElement('br'))
  fieldset.appendChild(document.createElement('br'))

  const labelWidth = fieldset.appendChild(document.createElement('label'))
  labelWidth.setAttribute('for', 'kml_line_width')
  labelWidth.appendChild(document.createTextNode('Line width:'))
  const inputWidth = fieldset.appendChild(document.createElement('input'))
  inputWidth.setAttribute('id', 'kml_line_width')
  inputWidth.value = '4'
  inputWidth.style.width = '40px'

  div.appendChild(document.createTextNode('Report problem or suggest an improvement:'))
  div.appendChild(document.createElement('br'))
  const support = div.appendChild(document.createElement('a'))
  support.setAttribute('href', 'https://github.com/cvzi/bikemapnet-userscript/issues')
  support.appendChild(document.createTextNode('https://github.com/cvzi/bikemapnet-userscript/issues'))

  addCloseButton(div)
}

function addCloseButton (div) {
  const close = div.appendChild(document.createElement('span'))
  close.classList.add('close-button')
  close.appendChild(document.createTextNode('❌'))
  close.addEventListener('click', function () {
    this.parentNode.remove()
  })
  return close
}

function startDownload (progress) {
  const routeId = parseInt(document.location.href.match(/\/r\/(\d+)/)[1])

  const name = document.querySelector('h1.title').title
  const routeDescriptionDiv = document.querySelector('.route-description')
  const desc = routeDescriptionDiv ? routeDescriptionDiv.textContent.trim() : ''
  const headerImages = Array.from(document.querySelectorAll('#header-carousel .carousel-inner .photo-grid-photo[href]')).map(a => maxImage(a.href))
  const tags = Array.from(document.querySelectorAll('.route-tags .tag')).map(a => a.textContent.trim())
  const format = document.getElementById('export_format').selectedOptions[0].value.trim().toLowerCase()
  const addElevation = document.getElementById('export_add_elevation').checked
  const lineColor = document.getElementById('kml_line_color').value
  const lineWidth = document.getElementById('kml_line_width').value

  downloadVertices(routeId, format, addElevation, lineColor, lineWidth, name, desc, headerImages, tags, progress)
}

function downloadVertices (routeId, format, addElevation, lineColor, lineWidth, name, desc, headerImages, tags, progress) {
  console.log('downloadVertices()')
  progress.style.visibility = 'visible'
  progress.value = 1
  cachedRequest({
    method: 'GET',
    url: `https://maptoolkit.net/export/outdoorish_bikemap_routes/${routeId}.profile?api_key=outdoorish`,
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    },
    onload: function (resp) {
      progress.value = 2
      const routeData = JSON.parse(resp.responseText)
      routeData.routeId = routeId
      routeData.routeName = name
      routeData.routeDesc = desc
      routeData.format = format
      routeData.addElevation = !!addElevation
      routeData.lineColor = lineColor
      routeData.lineWidth = lineWidth
      routeData.headerImages = headerImages
      routeData.tags = tags
      routeData.pois = []
      downloadPOIs(routeData, progress)
    },
    onerror: function (response) {
      window.alert('Error:' + response.status)
    }
  })
}

function downloadPOIs (routeData, progress) {
  console.log('downloadPOIs()')
  progress.value = 3
  cachedRequest({
    method: 'GET',
    url: `https://www.bikemap.net/${HL}/r/${routeData.routeId}/data/`,
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    },
    referrer: `https://www.bikemap.net/${HL}/r/11276904/`,
    onload: function (resp) {
      progress.value = 4
      try {
        const data = JSON.parse(resp.responseText)
        if ('pois' in data) {
          const pois = JSON.parse(data.pois)
          if (pois) {
            routeData.pois = pois
          }
        }
      } catch (e) {
        window.alert('Could not download "Point of Interests". Continuing without them\n\nError:\n' + e)
        console.error(e)
      }
      decideIfElevation(routeData, progress)
    },
    onerror: function (response) {
      decideIfElevation(routeData, progress)
      window.alert('Error:' + response.status)
    }
  })
}

function decideIfElevation (routeData, progress) {
  if (routeData.addElevation) {
    downloadElevation(routeData, progress, 0)
  } else {
    exportRoute(routeData, progress)
  }
}

function downloadElevation (routeData, progress, index) {
  console.log('downloadElevation() index=', index)

  const n = 100
  const start = index || 0
  const end = start + n < routeData.vertices.length ? start + n : routeData.vertices.length

  progress.value = 4 + 10 * (start / routeData.vertices.length)

  cachedRequest({
    method: 'GET',
    url: `https://maptoolkit.net/elevationprofile?points=${JSON.stringify(routeData.vertices.slice(start, end))}&tolerance=10&api_key=outdoorish`,
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    },
    onload: function (resp) {
      const data = JSON.parse(resp.responseText)
      // Add elevation data to points if available
      let j = 0
      routeData.vertices.map((p, i) => {
        if (i >= start && i < end) {
          p.unshift(data.elevation[j++])
        }
        return p
      })
      if (end < routeData.vertices.length) {
        downloadElevation(routeData, progress, end)
      } else {
        exportRoute(routeData, progress)
      }
    },
    onerror: function (response) {
      window.alert('Error:' + response.status)
    }
  })
}

function exportRoute (routeData, progress) {
  // Find min/max elevation
  routeData.minElevation = Number.MAX_SAFE_INTEGER
  routeData.maxElevation = Number.MIN_SAFE_INTEGER
  routeData.minElevationPoint = null
  routeData.maxElevationPoint = null
  if (routeData.vertices[0].length > 2) {
    routeData.vertices.forEach(function (p) {
      if (p[0] < routeData.minElevation) {
        routeData.minElevation = p[0]
        routeData.minElevationPoint = [p[1], p[2]]
      }
      if (p[0] > routeData.maxElevation) {
        routeData.maxElevation = p[0]
        routeData.maxElevationPoint = [p[1], p[2]]
      }
    })
  } else {
    routeData.minElevation = Math.min(...routeData.elevation)
    routeData.maxElevation = Math.max(...routeData.elevation)
  }

  if (routeData.format === 'gpx') {
    toGPX(routeData, progress)
  } else if (routeData.format === 'tcx') {
    toTCX(routeData, progress)
  } else if (routeData.format === 'geojson') {
    toGeoJSON(routeData, progress)
  } else {
    toKML(routeData, progress)
  }
}

function toKML (routeData, progress) {
  progress.value = PROGRESS_MAX

  const poiXML = routeData.pois.map(poi => {
    const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort')
    let icon = ''
    if ('icon' in poi && poi.icon && 'iconUrl' in poi.icon) {
      icon = `<Icon>
        <href>https://static.bikemap.net/${escapeXML(poi.icon.iconUrl)}</href>
      </Icon>`
    }
    let description = poiType(poi.poi_class, HL)
    if ('image' in poi && poi.image) {
      description += '\n\n' + maxImage(poi.image)
    }

    return `<Placemark>
      <name>${escapeXML(name)}</name>
      <description>${escapeXML(description)}</description>
      ${icon}
      <Point>
         <coordinates>${poi.lng},${poi.lat}</coordinates>
       </Point>
    </Placemark>`
  }).join('\n    ')

  const coordinates = routeData.vertices.map(p => p.reverse().join(',')).join('\n')
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
`

  downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'kml'), temp, 'application/vnd.google-earth.kml+xml', progress)
}

function toGPX (routeData, progress) {
  progress.value = PROGRESS_MAX

  const wtes = routeData.pois.map(poi => {
    const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort')
    const type = poiType(poi.poi_class, HL)
    let description = type
    let link = ''
    if ('image' in poi && poi.image) {
      const imageUrl = maxImage(poi.image)
      description += '\n\n' + imageUrl
      link = `<link href="${escapeXML(imageUrl)}"><text></text></link>`
    }
    return `
    <wpt lat="${poi.lat}" lon="${poi.lng}">
      <name>${escapeXML(name)}</name>
      <desc>${escapeXML(description)}</desc>
      ${link}
      <sym>${escapeXML(poiType(poi.poi_class, 'gpx'))}</sym>
      <type>${type}</type>
    </wpt>`
  }).join('\n')

  const rtepts = routeData.vertices.map(p => {
    if (p.length === 3) {
      return `<rtept lat="${p[1]}" lon="${p[2]}">
  <ele>${p[0]}</ele>
</rtept>`
    } else {
      return `<rtept lat="${p[0]}" lon="${p[1]}"/>`
    }
  }).join('\n')

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
`

  downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'gpx'), temp, 'application/gpx+xml', progress)
}

function toTCX (routeData, progress) {
  progress.value = PROGRESS_MAX

  const coursePoints = routeData.pois.map(poi => {
    const name = poi.text || (HL === 'en' ? 'Point of Interest' : 'Interessanter Ort')
    const type = poiType(poi.poi_class, HL)
    let description = name + '\n' + type
    if ('image' in poi && poi.image) {
      description += '\n\n' + maxImage(poi.image)
    }
    return `          <CoursePoint>
            <Name>${escapeXML(name).substring(0, 10)}</Name>
            <Position>
              <LatitudeDegrees>${poi.lat}</LatitudeDegrees>
              <LongitudeDegrees>${poi.lng}</LongitudeDegrees>
            </Position>
            <PointType>${escapeXML(poiType(poi.poi_class, 'tcx'))}</PointType>
            <Notes>${escapeXML(description)}</Notes>
          </CoursePoint>`
  }).join('\n')

  let beginPosition
  if (routeData.vertices[0].length === 3) {
    beginPosition = [routeData.vertices[0][1], routeData.vertices[0][2]]
  } else {
    beginPosition = routeData.vertices[0]
  }

  let endPosition
  const lastInd = routeData.vertices.length - 1
  if (routeData.vertices[lastInd].length === 3) {
    endPosition = [routeData.vertices[lastInd][1], routeData.vertices[lastInd][2]]
  } else {
    endPosition = routeData.vertices[lastInd]
  }

  const trackPoints = routeData.vertices.map(p => {
    let content
    if (p.length === 3) {
      content = `            <Position>
              <LatitudeDegrees>${p[1]}</LatitudeDegrees>
              <LongitudeDegrees>${p[2]}</LongitudeDegrees>
            </Position>
            <AltitudeMeters>${p[0]}</AltitudeMeters>`
    } else {
      content = `            <Position>
              <LatitudeDegrees>${p[0]}</LatitudeDegrees>
              <LongitudeDegrees>${p[1]}</LongitudeDegrees>
            </Position>`
    }
    return `          <Trackpoint>
${content}
          </Trackpoint>`
  }).join('\n')

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
`

  downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'tcx'), temp, 'application/vnd.garmin.tcx+xml', progress)
}

function toGeoJSON (routeData, progress) {
  progress.value = PROGRESS_MAX

  let minElevationRepr = '' + elevationFormat(routeData.minElevation)
  if (routeData.minElevationPoint) {
    minElevationRepr += ' (at ' + routeData.minElevationPoint.join(', ') + ')'
  }
  let maxElevationRepr = '' + elevationFormat(routeData.maxElevation)
  if (routeData.maxElevationPoint) {
    maxElevationRepr += ' (at ' + routeData.maxElevationPoint.join(', ') + ')'
  }

  const geoJSON = {
    type: 'FeatureCollection',
    features: [
      {
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
      }
    ]
  }

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
    }

    if ('image' in poi && poi.image) {
      featurePoint.properties.url = maxImage(poi.image)
    }
    return featurePoint
  }))

  downloadFile(routeData, fileName(routeData.routeName + '_' + routeData.routeId, 'geojson'), JSON.stringify(geoJSON, null, 2), 'application/geo+json', progress)
}

function metablock (routeData) {
  let minElevationRepr = '' + elevationFormat(routeData.minElevation)
  if (routeData.minElevationPoint) {
    minElevationRepr += ' (at ' + routeData.minElevationPoint.join(', ') + ')'
  }
  let maxElevationRepr = '' + elevationFormat(routeData.maxElevation)
  if (routeData.maxElevationPoint) {
    maxElevationRepr += ' (at ' + routeData.maxElevationPoint.join(', ') + ')'
  }

  let s = `
    Distance: ${distanceFormat(routeData.distance)}

    Race cycling time: ${hoursMinutes(routeData.race_cycling_time)}
    Offroad cycling time: ${hoursMinutes(routeData.offroad_cycling_time)}
    Cycling time: ${hoursMinutes(routeData.cycling_time)}
    Walking time: ${hoursMinutes(routeData.walking_time)}

    Ascent: ${elevationFormat(routeData.ascend)}
    Descend: ${elevationFormat(routeData.descend)}

    Min. elevation: ${minElevationRepr}
    Max. elevation: ${maxElevationRepr}
`
  if (routeData.tags) {
    s += `\n    Tags: ${routeData.tags.join(', ')}\n`
  }
  if (routeData.headerImages) {
    s += '\n    Images:\n'
  }
  routeData.headerImages.forEach(function (imageUrl) {
    s += `    ${imageUrl}\n`
  })

  return s
}

function downloadFile (routeData, name, content, mimeType, progress) {
  const div = progress.parentNode
  div.innerHTML = '<br>'

  const a = div.appendChild(document.createElement('a'))
  a.download = name
  a.href = window.URL.createObjectURL(new Blob([content], { type: mimeType || 'text/plain' }))
  a.appendChild(document.createTextNode('Download'))
  a.click()

  div.appendChild(document.createElement('br'))

  const info = div.appendChild(document.createElement('pre'))
  info.style.textAlign = 'left'
  info.innerHTML = metablock(routeData)

  addCloseButton(div)
}

function poiType (poiClass, lang) {
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
  }
  if (poiClass in data && lang in data[poiClass]) {
    return data[poiClass][lang]
  }
  if (poiClass in data && 'en' in data[poiClass]) {
    return data[poiClass].en
  }
  return poiClass.replace('poi-')
}

function fileName (title, ext) {
  let name = title.replace(/[:*?<>/\\,|\u0000]/g, '') // eslint-disable-line no-control-regex
  name = name.trim().replace(/^\.+/, '').replace(/\.+$/, '').trim()
  return name + '.' + ext
}

function clearCache () {
  const n = sessionStorage.length
  sessionStorage.clear()
  window.alert('Cache cleared!\n\n' + n + ' item(s) removed.')
}

function cachedRequest (obj) {
  if ('data' in obj || obj.method !== 'GET') {
    return GM.xmlHttpRequest(obj)
  }
  const cached = sessionStorage.getItem(obj.url)
  if (cached !== null) {
    window.setTimeout(function () {
      const result = JSON.parse(cached)
      obj.onload(result)
    }, 1)
  } else {
    const orgOnload = obj.onload
    obj.onload = function (response) {
      const newResponse = {}
      for (const key in response) {
        newResponse[key] = response[key]
      }
      newResponse.responseText = '' + response.responseText
      newResponse.cached = true
      if (!('time' in newResponse)) {
        newResponse.time = (new Date()).toJSON()
      }
      sessionStorage.setItem(obj.url, JSON.stringify(newResponse))
      orgOnload.apply(this, [response])
    }
    GM.xmlHttpRequest(obj)
  }
}

function hoursMinutes (minutes) {
  const hours = parseInt(minutes / 60)
  minutes = parseInt(minutes % 60)
  minutes = (minutes < 10 ? '0' : '') + minutes
  return `${hours ? hours + ':' : ''}${minutes} h`
}

function distanceFormat (meters) {
  if (getSiteUnitFormat() === 'imperial') {
    const miles = 0.000621371192237334 * meters
    const mileFormat = new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'mile', unitDisplay: 'short' })
    return mileFormat.format(parseInt(miles * 100) / 100)
  } else {
    if (meters < 3000) {
      const meterFormat = new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'meter', unitDisplay: 'narrow' })
      return meterFormat.format(parseInt(meters))
    } else {
      const kilometerFormat = new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'kilometer', unitDisplay: 'narrow' })
      return kilometerFormat.format(parseInt(meters / 100) / 10)
    }
  }
}

function elevationFormat (meters) {
  if (getSiteUnitFormat() === 'imperial') {
    const feet = 3.280839895 * meters
    const footFormat = new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'foot', unitDisplay: 'short' })
    return footFormat.format(parseInt(feet * 100) / 100)
  } else {
    const meterFormat = new Intl.NumberFormat(navigator.language, { style: 'unit', unit: 'meter', unitDisplay: 'narrow' })
    return meterFormat.format(parseInt(meters))
  }
}

function getSiteUnitFormat () {
  const input = document.querySelector('#site-settings-column input[name=unit]')
  if (input && input.value === 'imperial') {
    return 'imperial'
  } else {
    return 'metric'
  }
}

function getSiteLanguage () {
  const input = document.querySelector('#site-settings-column input[name=language]')
  if (input && input.value === 'de') {
    return 'de'
  } else {
    return 'en'
  }
}

function maxImage (url) {
  if (url.indexOf('/thumbs/') !== -1 && url.match(/\.\d+x\d+_q\d+\.\w+$/)) {
    return url.replace('/thumbs/', '/').replace(/\.\d+x\d+_q\d+\.\w+$/, '')
  } else {
    return url
  }
}

function escapeXML (s) {
  return s.toString().replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
