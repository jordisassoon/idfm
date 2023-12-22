var createScatterPlot = function(data){
    
    var vlSpec = {
        "repeat": {
            "row": ["NO", "NO2", "PM10", "CO2", "TEMP", "HUMI"],
            "column": ["HUMI", "TEMP", "CO2", "PM10","NO2","NO"]
        },
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "name" : "mydata",
            "values" : data
        },
        "spec" : {
            "mark": "point",
            "encoding": {
                "x": {"field": {"repeat": "column"}, "type": "quantitative"},
                "y": {
                    "field": {"repeat": "row"},
                    "type": "quantitative",
                    "axis": {"minExtent": 30}
                },
                "color" : {
                    "field" : "Saison",
                    "type" : "nominal"
                }
            }
        }
    };
    
    
    // // see options at https://github.com/vega/vega-embed/blob/master/README.md
    var vlOpts = {width:400,height:400, actions:false};
    vegaEmbed("#viz", vlSpec, vlOpts);
        
};

var createViz = function(){
    loadData();
    // createScatterPlot();
};


function loadData() {
    
    d3.select("#SaisonSelector").on("change", updateData);

    // Initial data load
    updateData();
}

function updateData() {
    
    d3.csv("data/correlations.csv").then((data) => {
        console.log(data)
        var selectedSaison = d3.select("#SaisonSelector").node().value;
        if (selectedSaison !== 'All') {
            data = data.filter(d => d.Saison === selectedSaison);
        }
        createScatterPlot(data);
    }).catch(error => console.log(error));
}
