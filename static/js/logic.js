var qurl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
var tecurl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

var prgn = d3.scaleSequential(d3.interpolatePRGn).domain([500,0]).clamp(true);

var eq = L.layerGroup();
var tecplate = L.layerGroup();

var map = L.map("map",{
    style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
    center : [33.492825, -48.001724],
    layers:[eq],
    zoom: 2,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    id: 'mapbox/satellite-streets-v11',
    accessToken: API_KEY
}).addTo(map);

L.control.layers(null, {'Earthquakes':eq,"Tectonic Plates": tecplate},{collapsed:false}).addTo(map);


d3.json(qurl).then(function(geojsonFeature){
    L.geoJSON(geojsonFeature,{
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag*2,
                fillColor: prgn(feature.geometry.coordinates[2]),
                color: "white",
                opacity: 0.5,
                fillOpacity: 0.5
            });
        },

        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>" + feature.properties.place +
        "</h4><hr><p>" + new Date(feature.properties.time) + "<br>" +
        "Magnitude: " + feature.properties.mag + "<br>" +
        "Depth: " + feature.geometry.coordinates[2] + "</p>");
        }
    }).addTo(eq).addTo(map);


    d3.json(tecurl).then( function(data) {
        L.geoJSON(data, {
          color: "orangered",
          weight: 1
        }).addTo(tecplate);
        tecplate.addTo(map);
    });

    var legend = L.control({position: "bottomleft"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend"),
            dep = [500,450,400,350,300,250,200,150,100,50];

        div.innerHTML += "<h3> Depth </h3>";
        for (var i = 0; i < dep.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + prgn(dep[i] + 1) + '"></i> ' +
                    dep[i] + (dep[i + 1] ? '&ndash;' + dep[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
});


