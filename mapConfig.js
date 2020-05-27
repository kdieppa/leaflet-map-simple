var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F0aHlkaWVwcGEiLCJhIjoiY2s4eHNwcWl0MDRydDNmcW55aDd1cHM1OCJ9.sTRGBPRGMhiC8gBAXRnU6A', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/light-v9',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>County Data</h4>' +  (props ?
    '<b>' + props.LOCATION + '</b><br />'
               + 'Social Vulnerability Index: ' + props.RPL_THEMES + '<br />'
               + 'Incidence/1000 people: ' + props.incidence + '<br />'
               + 'Case Fatality Rate (%): ' + props.case_fatality
               + '<br /><b>Racial Composition</b><br />'
               + '% Black: ' + props.Per_Black + '<br />'
               + '% Hispanic/Latino*: ' + props.Per_Latin + '<br />'
               + '% White: ' + props.Per_white + '<br />'
    : 'Hover over a county');
};

info.addTo(map);


// get color depending on population density value
function getColor(d) {
  return d === '3' ? '#d73027' :
      d === '2'  ? '#fc8d59' :
        d === '1'  ? '#fee08b' :
            '#1a9850';
}

function style(feature) {
    return {
      weight: 0.5,
      opacity: 1,
      color: '#666',
      dashArray: '1',
      fillOpacity: 0.7,
      fillColor: getColor(feature.properties.CF_category)
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 3,
      color: '#666666',
      dashArray: '',
      fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    info.update(layer.feature.properties);
  }

var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

geojson = L.geoJson(countyData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

// map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({position: 'bottomright'});


legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
  grades = ["High SVI ( > 0.5)  & High CFR (> median)", "High SVI ( > 0.5)  & Low CFR (&#x2264; median)", "Low SVI ( &#x2264; 0.5)  & High CFR (> median)", "Low SVI ( &#x2264; 0.5)  & Low CFR (&#x2264; median)"],
  labels = ['<i style="background: #d73027"></i>',
     '<i style="background: #fc8d59"></i>',
     '<i style="background: #fee08b"></i>',
     '<i style="background: #1a9850"></i>'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
  div.innerHTML +=
      grades[i] + (labels[i]) +'<br>';
    }
    return div;
};

legend.addTo(map);
