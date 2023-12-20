const metro_colors = {
    1: "#ffbe02",	  
    2:	"#006cb8",
    3:	"#9c983a",
    4:	"#a0006e",
    5:	"#f68f4b",
    6:	"#77c695",
    7:	"#ff82b4",
    8:	"#d282be",
    9:	"#cec92a",
    10:	"#dc9609",
    11:	"#5a230a",
    12:	"#00643c",
    13:	"#82c8e6",
    14:	"#62259d",
    "3bis": "#82c8e6",
    "7bis": "#77c695",
}

const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351323, 48.856712),
    range: 7000,
    tilt: 45,
};

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
const viewerDiv = document.getElementById('viewerDiv');

// Create a GlobeView
const view = new itowns.GlobeView(viewerDiv, placement);

// Disable atmosphere lighting
view.getLayerById('atmosphere').visible = false;
view.getLayerById('atmosphere').fog.enable = false;

// Define the source of the ColorLayer data : a vector tiled map from the geoportail.
const mapSource = new itowns.VectorTilesSource({
    style: './config/style-config.json',
    // We don't display mountains and parcels related data to ease visualisation. Also, we don't display
    // buildings related data as it will be displayed in another Layer.
    filter: (layer) => {
        return !layer['source-layer'].includes('bati_')
            && !layer['source-layer'].includes('oro_')
            && !layer['source-layer'].includes('routier_')
            && !layer['source-layer'].includes('parcellaire')
            && !layer['source-layer'].includes('ferr')
            && !layer['source-layer'].includes('limite')
    }
});

const pyoSource = new itowns.FileSource({
    url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/66-pyrenees-orientales/departement-66-pyrenees-orientales.geojson',
    crs: 'EPSG:4326',
    format: 'application/json',
});

fetch('./data/connections.json')
    .then((response) => response.json())
    .then((connections) => {
        fetch('./data/export.geojson')
            .then((response) => response.json())
            .then((geocoords) => {
                const stop_to_geo = {}
                
                for (geocoord of geocoords["features"]) {
                    stop_to_geo[geocoord["properties"]["name"]] = geocoord["geometry"]["coordinates"]
                }
                

                all_connections = {
                    type: "FeatureCollection",
                    features: []
                }

                for (line in connections){
                    for (stop of connections[line]) {
                        stop[0] = stop_to_geo[stop[0]]
                        stop[1] = stop_to_geo[stop[1]]
                        all_connections["features"].push({
                            type: "Feature",
                            properties: {
                                line_name: line,
                                color: metro_colors[line]
                            },
                            geometry: {
                                type: "LineString",
                                coordinates: stop
                            }
                        })
                    }
                }

                pyoSource['fetchedData'] = all_connections

                // Create a ColorLayer for the Pyrenees Orientales area
                const pyoLayer = new itowns.ColorLayer('pyrenees-orientales', {
                    name: 'pyrenees-orientales',
                    transparent: true,
                    source: pyoSource,
                    style: {
                        stroke: {
                            color: (p) => p.color,
                            opacity: 1.0,
                            width: 7.0,
                        },
                    },
                });

                view.addLayer(pyoLayer)

            });
    });

// Create a ColorLayer to support map data.
const mapLayer = new itowns.ColorLayer('MVT', {
    source: mapSource,
    effect_type: itowns.colorLayerEffects.removeLightColor,
    effect_parameter: 2.5,
    addLabelLayer: { performance: true },
    style: {
        text: {
            color: '#000000',
            haloColor: '#ffffff',
            haloWidth: 4,
            haloBlur: 2,
        }
    },
});

// Add the ColorLayer to the scene and to the debug menu.
view.addLayer(mapLayer)

// ---------- DISPLAY VECTOR TILED BUILDING DATA AS 3D MESHES : ----------

// Define the source of the building data : those are vector tiled data from the geoportail.
const buildingsSource = new itowns.VectorTilesSource({
    style: './config/style-config.json',
    // We only want to display buildings related data.
    filter: (layer) => {
        return layer['source-layer'].includes('bati_surf')
            && layer.paint["fill-color"];
    },
});

// Create a FeatureGeometryLayer to support building data.
var buildingsLayer = new itowns.FeatureGeometryLayer('VTBuilding',{
    source: buildingsSource,
    zoom: { min: 15 },
    accurate: false,
    style: {
        fill: {
            extrusion_height: (p) => p.hauteur || 0,
            colour: "white",
        },
        stroke: {
            color:"white"
        }
    },
});


buildingsLayer['opacity'] = 0.25

// Add the FeatureGeometryLayer to the scene and to the debug menu.
view.addLayer(buildingsLayer)