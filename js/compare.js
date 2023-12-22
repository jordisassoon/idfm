const ctx = {
    w: 800,
    h: 800,
    plot : "pollutants",
    station : "All",
    DM_COLORS: ['#cab2d6', '#fdbf6f', '#b2df8a', '#fb9a99']
};

var createScatterPlot = function(data){
    console.log("Hello")
    console.log(data)
    data.forEach(function (d) {
        d.Date = new Date(d.Date);
    });
    data = data.filter(function (d) {
        return !isNaN(d.Date.getTime());
    });

    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "name" : "mydata",
            "values" : data,
        },
        "width": ctx.w,
        "height": ctx.h,
        "mark": {
            "type": "line",
        },
        "encoding": {
            "x": {
                "field": "Date",
                "type": "temporal",
                "axis": {"grid": false}
            },
            "y": {
                "field": "Value", 
                "type": "quantitative", 
                "axis": {"title": "Quantity"},
            },
            "color": {
                "condition": {
                  "param": "hover",
                  "field":"Gare",
                  "type":"nominal",
                },
                "value": "grey"
              },
              "opacity": {
                "condition": {
                  "param": "hover",
                  "value": 1
                },
                "value": 0.1
              }
        },
        "selection": {
            "hover": {"type": "single", "on": "mouseover", "empty": "none"}
        }
    };
    
    
    // // see options at https://github.com/vega/vega-embed/blob/master/README.md
    //var vlOpts = {width:700,height:700, actions:false};
    vegaEmbed("#myviz", vlSpec)
    .then((result) => {
    
    const view = result.view;
    
    console.log(view.data("mydata")); // Replace "table_name" with your actual data variable name
    })
  .catch((error) => console.error(error));
    //vegaEmbed("#myviz", vlSpec, vlOpts);
    
    
};

var createViz = function(){
    // vega.scheme("dmcolors", ctx.DM_COLORS);
    loadData();
    // createScatterPlot(ctx.Month);
};

function loadData() {
    // Bind event listeners to the select elements
    d3.select("#YearSelector").on("change", updateData);
    d3.select("#plotSelector").on("change", updateData);
    d3.select("#stationSelector").on("change", updateData);

    // Initial data load
    updateData();
}

function updateData() {
    // Retrieve selected values
    var selectedYear = d3.select("#YearSelector").node().value;
    var selectedPlot = d3.select("#plotSelector").node().value;
    var selectedStation = d3.select("#stationSelector").node().value;
    // Example: Log the selected values
    console.log("Selected Year:", selectedYear);
    console.log("Selected Plot:", selectedPlot);
    console.log("Selected Station:", selectedStation);

    Promise.all([
        d3.csv("/data/Auber/All_Auber_prepared.csv"),
        d3.csv("/data/Chatelet/All_Chatelet_prepared.csv"),
        d3.csv("/data/ChateletRerA/All_ChateletRerA_prepared.csv"),
        d3.csv("/data/Franklin/All_Franklin_prepared.csv"),
        d3.csv("/data/NationRerA/All_NationRerA_prepared.csv"),
      ])
        .then((data) => {
            // filtering based on the year
            console.log(data)

            data = data.map(d => d.filter(p => p.Year == selectedYear))
            console.log(data)

            // filter based on the station
            if (selectedStation != "all") {
                data = data.map(d => d.filter(p => p.Gare == selectedStation))
            }
            if (selectedPlot == "pollutants") {
                data = data.map(d => d.filter(p => (p.Attribute == "NO" || p.Attribute == "PM10" || p.Attribute == "NO2")))
            } 
            else {
                data = data.map(d => d.filter(p => p.Attribute == selectedPlot))
            } 

            data = [].concat(...data);
            createScatterPlot(data);
        })
}