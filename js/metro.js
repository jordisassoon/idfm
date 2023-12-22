const ctx = {
    metroLineColors : {
        '1': '#ffbe02',
        '2': '#006cb8',
        '3': '#9c983a',
        '3bis': '#6EC4E8',
        '4': '#a0006e',
        '5': '#f68f4b',
        '6': '#77c695',
        '7': '#ff82b4',
        '7bis': '#77c696',
        '8': '#d282be',
        '9': '#cec92a',
        '10': '#dc9609',
        '11': '#5a230a',
        '12': '#00643c',
        '13': '#82c8e6',
        '14': '#62259d'
    },
    year : 2021
}

function createViz() {
    initializeMap();
}

function showLine(line) {
    
    console.log("line ", line);
    ctx.line = line;
    drawLine();
    getStatistics();
}

function initializeMap() {
    // Create a map centered around Paris
    ctx.parisMap = L.map('parisMap');
    var parisCoordinates = [48.8566, 2.3422];
    console.log("I'm here")
    L.DomUtil.addClass(ctx.parisMap._container, 'crosshair-cursor-enabled');
    // Add a tile layer from OpenStreetMap
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom : 15,
        attribution: '© CartoDB, OpenStreetMap contributors'
    }).addTo(ctx.parisMap);
    ctx.parisMap.setView(parisCoordinates, 11.5);
    L.svg().addTo(ctx.parisMap)
    let svgEl = d3.select("#parisMap").select("svg");
    svgEl.select("g")
        .attr("id", "metros");
    
    svgEl.select("g#metros").append("g")
                            .attr("id", "lines");

    svgEl.select("g#metros").append("g")
                            .attr("id", "stations");
    
    ctx.parisMap.on('zoom', function () {
            updatePointCoordinates()
            updateLines();
    });
    showLine('0');
    
}

function updatePointCoordinates() {
    let stationsGroup = d3.select("g#stations");

    // Mettez à jour les coordonnées des points en fonction du niveau de zoom actuel
    stationsGroup.selectAll("circle")
        .attr("cx", function (d) { return ctx.parisMap.latLngToLayerPoint(d[1]).x; })
        .attr("cy", function (d) { return ctx.parisMap.latLngToLayerPoint(d[1]).y; }); 
    
}

// Define a function to update line coordinates based on the current zoom level
function updateLines() {
    let linesGroup = d3.select("g#lines");
    linesGroup.selectAll("line").remove();

    if (ctx.line != '0') {
        ctx.connection.forEach(connection => {
            const stationA = ctx.allCoordinates.find(station => station[0] === connection[0]);
            const stationB = ctx.allCoordinates.find(station => station[0] === connection[1]);
            if (stationA && stationB) {
                linesGroup.append("line") 
                    .attr("x1", ctx.parisMap.latLngToLayerPoint(stationA[1]).x)
                    .attr("y1", ctx.parisMap.latLngToLayerPoint(stationA[1]).y)
                    .attr("x2", ctx.parisMap.latLngToLayerPoint(stationB[1]).x)
                    .attr("y2", ctx.parisMap.latLngToLayerPoint(stationB[1]).y)
                    .style("stroke", ctx.metroLineColors[ctx.line])
                    .style("stroke-width", 2)
                    .style("opacity", 0.8);
            }
        });
    }
    else {
        for (let key in ctx.connection) {
            let conn = ctx.connection[key]
            conn.forEach(connection => {
                const stationA = ctx.allCoordinates.find(station => station[0] === connection[0]);
                const stationB = ctx.allCoordinates.find(station => station[0] === connection[1]);
                if (stationA && stationB) {
                    linesGroup.append("line")
                            .attr("x1", ctx.parisMap.latLngToLayerPoint(stationA[1]).x)
                            .attr("y1", ctx.parisMap.latLngToLayerPoint(stationA[1]).y)
                            .attr("x2", ctx.parisMap.latLngToLayerPoint(stationB[1]).x)
                            .attr("y2", ctx.parisMap.latLngToLayerPoint(stationB[1]).y)
                            .style("stroke", ctx.metroLineColors[key])
                            .style("stroke-width", 2)
                            .style("opacity", 0.8);
                }
            });
        }

    }
}


// Function to process and add OSM data to the map
function drawLine() {

    //remove the pie chart when i click on a button of a metro line
    d3.select("#pieTitle").select("text").remove();
    d3.select("#piechart").select("svg").remove();
    d3.select("#clickBubble").select("text").remove();
    d3.select("#clickBubbleViz").html("");

    //remove the bubble chart when i click on a button of a metro line
    d3.select("#bubbleTitle").select("text").remove();
    d3.select("#bubblechart").select("svg").remove();

    Promise.all([
        d3.json("/data/export.geojson"),
        d3.csv("/data/result_dataset.csv"),
        d3.json("/data/connections.json"),
        
    ]).then((data) => {

        const uniqueStations = [];

        const seenNames = {}; // Object to track seen names

        // Getting the unique Stations
        data[0].features.forEach(feature => {
            if (feature.properties && feature.properties.name) {
                const name = feature.properties.name;
                if (!seenNames[name]) {
                    uniqueStations.push(feature);
                    seenNames[name] = true;
                }
            }
        });

        filteredStations = uniqueStations;
        let line_stations = [];
        ctx.connection = data[2];

        if (ctx.line != '0') {
            // Getting the stations corresponding to the line
            let lines = data[1];
            lines.forEach(elem => {
                if (elem.Line === ctx.line) {
                    line_stations.push(elem.Station);
                }
            })
            console.log(line_stations);
    
            filteredStations = uniqueStations.filter(station => {
                
                return line_stations.includes(station.properties.name);
            });
            ctx.connection = data[2][ctx.line]
        } 


        let stationsGroup = d3.select("g#stations");
        let linesGroup = d3.select("g#lines");

        

        // Remove all existing circles and lines before adding new ones
        stationsGroup.selectAll("circle").remove();
        linesGroup.selectAll("line").remove();

        
        allCoordinates = []
        filteredStations.forEach(function (feature) {
            if (feature.geometry.type === 'Point') {
                const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                allCoordinates.push([feature.properties.name, latlng]);
            }
        });
    
        ctx.allCoordinates = allCoordinates;

        stationsGroup.selectAll("circle")
            .data(allCoordinates)
            .enter().append("circle")
            .attr("cx", function (d) { return ctx.parisMap.latLngToLayerPoint(d[1]).x; })
            .attr("cy", function (d) { return ctx.parisMap.latLngToLayerPoint(d[1]).y; })
            .attr("r", 3.5)
            .style("fill", "transparent")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("opacity", 0.8)
            .append("title")
            .text(d => d[0]);
        
        if (ctx.line != 0) {

            // Draw lines for each connection
            ctx.connection.forEach(connection => {
                const stationA = allCoordinates.find(station => station[0] === connection[0]);
                const stationB = allCoordinates.find(station => station[0] === connection[1]);
                if (stationA && stationB) {
                    linesGroup.append("line")
                            .attr("x1", ctx.parisMap.latLngToLayerPoint(stationA[1]).x)
                            .attr("y1", ctx.parisMap.latLngToLayerPoint(stationA[1]).y)
                            .attr("x2", ctx.parisMap.latLngToLayerPoint(stationB[1]).x)
                            .attr("y2", ctx.parisMap.latLngToLayerPoint(stationB[1]).y)
                            .style("stroke", ctx.metroLineColors[ctx.line])
                            .style("stroke-width", 2)
                            .style("opacity", 0.8);
                }
            });
        }
        else {
            for (let key in ctx.connection) {
                let conn = ctx.connection[key]
                conn.forEach(connection => {
                    const stationA = allCoordinates.find(station => station[0] === connection[0]);
                    const stationB = allCoordinates.find(station => station[0] === connection[1]);
                    if (stationA && stationB) {
                        linesGroup.append("line")
                                .attr("x1", ctx.parisMap.latLngToLayerPoint(stationA[1]).x)
                                .attr("y1", ctx.parisMap.latLngToLayerPoint(stationA[1]).y)
                                .attr("x2", ctx.parisMap.latLngToLayerPoint(stationB[1]).x)
                                .attr("y2", ctx.parisMap.latLngToLayerPoint(stationB[1]).y)
                                .style("stroke", ctx.metroLineColors[key])
                                .style("stroke-width", 2)
                                .style("opacity", 0.8);
                    }
                });
                }
        }
    }).catch(function (err) { console.log(err); });

}

function getStatistics() {
    d3.csv("/data/paris_metros.csv").then((data) => {
        
        data.forEach(function (d) {
            d.Mise_en_service = +d.Mise_en_service;
            d.Dernier_prolongement = +d.Dernier_prolongement;
            d.Longueur_en_km = +d.Longueur_en_km;
            d.Nombre_de_stations = +d.Nombre_de_stations;
        });

        // Remove existing SVG
        d3.select("#stats").select("svg").remove();

        // Set up the SVG container
        var margin = { top: 80, right: 60, bottom: 50, left: 60 };
        var width = 800 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var svg = d3.select("#stats")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define scales
        var xScale = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return d.Mise_en_service; })-10, d3.max(data, function (d) { return d.Dernier_prolongement; })+20])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return d.Longueur_en_km; }), d3.max(data, function (d) { return d.Longueur_en_km; })])
            .range([height, 0]);
        
        // Define a scale for the circle radius
        var radiusScale = d3.scaleLinear()
                            .domain(d3.extent(data, function (d) { return d.Nombre_de_stations; }))
                            .range([6, 57]); // Adjust the range based on your preferred minimum and maximum radius

        // Create x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // Create y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));
        
        
        //legend for Nb stations
        var legendCircles = [5, 20, 30];

        var legend = svg.append("g")
            .attr("transform", "translate(" + (width - 15) + "," + 10 + ")"); // Adjust the legend position
    
        
        // Add legend title
        legend.append("text")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("y", -15)
            .text("Number of Stations")
            .style("fill", "white") ;
        
        // Add x-axis title
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom - 10) + ")")
            .text("Establishment Year")
            .style("fill", "white");

        // Add y-axis title
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left+20)
            .text("Length in Kilometers")
            .style("fill", "white");
        
        //Create SVG definitions for patterns
        var defs = svg.append("defs");

        var filteredData = data.filter(function (d) {
            return d.Ligne !== ctx.line;
        });

        var specificLineData = data.find(function (d) {
            return d.Ligne === ctx.line;
        });

        if (ctx.line !== '0') {
            path = '-modified.png'
        }
        else {
            path = '.png'
        }
        filteredData.forEach(function (d) {

            var scaledRadius = radiusScale(d.Nombre_de_stations);

            defs.append("pattern")
                .attr("id", "imagePattern_" + d.Ligne)
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")
                .append("image")
                .attr("xlink:href", '/images/' + d.Ligne + path)
                .attr("height", scaledRadius * 2) 
                .attr("width",  scaledRadius * 2);
        });

        if (ctx.line !== '0') {
            var scaledRadius = radiusScale(specificLineData.Nombre_de_stations);
            
            defs.append("pattern")
                .attr("id", "imagePattern_" + specificLineData.Ligne)
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")
                .append("image")
                .attr("xlink:href", '/images/' + specificLineData.Ligne + '.png')
                .attr("height", scaledRadius * 2) 
                .attr("width",  scaledRadius * 2)
                .append("title")
                .text(d => "Number of Stations is " + specificLineData.Nombre_de_stations);
        }
        
        // Create circles for each metro line
        var circles = svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale(d.Mise_en_service); })
            .attr("cy", function (d) { return yScale(d.Longueur_en_km); })
            .attr("r", function (d) { return radiusScale(d.Nombre_de_stations);  })
            .style("fill", function (d) {
                return "url(#imagePattern_" + d.Ligne + ")";
            })
            .on("click", function (event, d) {
                // Move the circle to the right on click
                if (ctx.line == '0') {

                    d3.select(this)
                        .transition()
                        .duration(3000)
                        .attr("cx",xScale(d.Dernier_prolongement)); 
                }
            })
            .append("title")
            .text(d => "Number of Stations is " + d.Nombre_de_stations);
        if (ctx.line !== '0') {
            var specificLine = svg.append("circle")
                .attr("cx", xScale(specificLineData.Mise_en_service))
                .attr("cy", yScale(specificLineData.Longueur_en_km))
                .attr("r", radiusScale(specificLineData.Nombre_de_stations))
                .style("fill", function (d) {
                    return "url(#imagePattern_" + specificLineData.Ligne + ")";
                })
                .on("click", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(3000)
                        .attr("cx",xScale(specificLineData.Dernier_prolongement));
            })
            .append("title")
            .text(d => "Number of Stations is " + specificLineData.Nombre_de_stations);
        }

        // Add circles and labels to the legend
        legend.selectAll("legendCircles")
            .data(legendCircles)
            .enter()
            .append("circle")
            .attr("cx", 0)
            .attr("cy", function (d) { return radiusScale(d); })
            .attr("r", function (d) { return radiusScale(d); })
            .style("fill", "none")
            .style("stroke", "white");
        
        legend.selectAll("legendLabels")
            .data(legendCircles)
            .enter()
            .append("text")
            .style("fill", "white")
            .attr("x",55)
            .attr("y", function (d,i) {return (i+0.5)*20 +10})
            .text(function (d) { return d; });

        
        window.resetTransition = function () {
                circles.transition().duration(0).attr("cx", function (d) { return xScale(d.Mise_en_service); });
                specificLine.transition().duration(0).attr("cx", xScale(specificLineData.Mise_en_service));
        };
        if (ctx.line == '0') {
            // Here we click back on M button, we will have the other vizualisations, 
            d3.select("#pieTitle").select("text").remove();
            d3.select("#bubbleTitle").select("text").remove();

            d3.select("#pieTitle")
              .append("text")
              .text("Pie Chart Representing Number of passengers per metro Line for 2021 Year");

            d3.select("#bubbleTitle")
              .append("text")
              .text("Metro Stations in Paris");
            
            drawPieChart(data);
            loadDataBubble();
        }
        else {
            //remove the pie chart when i click on a button of a metro line
            d3.select("#pieTitle").select("text").remove();
            d3.select("#piechart").select("svg").remove();
            d3.select("#clickBubble").select("text").remove();
            d3.select("#clickBubbleViz").html("");

            //remove the bubble chart when i click on a button of a metro line
            d3.select("#bubbleTitle").select("text").remove();
            d3.select("#bubblechart").select("svg").remove();
        }

    }).catch(function (err) { console.log(err); });
}

function drawPieChart(data) {
    
    d3.select("#piechart").select("svg").remove();

    // Filter out rows where Ligne is 3bis or 7bis (I don't have info about them)
    var filteredData = data.filter(function (d) {
        return d.Ligne !== "3bis" && d.Ligne !== "7bis";
    });


    // Set up the pie chart dimensions
    const width = 400;
    const height = 250;

    // Create SVG element
    const svg = d3.select("#piechart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const pieWidth = 240;
    const pieHeight = 240;

    const radius = Math.min(pieWidth, pieHeight) / 2.5;

    const pieChart = svg.append("g")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // Define pie chart
    const pie = d3.pie()
        .value(d => d.Millions_de_voyageurs);

    // Create arcs
    const arc = d3.arc()
        .innerRadius(5)
        .outerRadius(radius)
        .padAngle(0.083)
        .cornerRadius(10);

    // Create the pie chart
    pieChart.selectAll("path")
        .data(pie(filteredData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => ctx.metroLineColors[d.data.Ligne])
        .on("mouseover", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc()
                             .innerRadius(5)
                             .outerRadius(radius + 20)
                             .padAngle(0.083)
                             .cornerRadius(10));
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arc);
        })
        .append("title")
        .text(d => "Line " + d.data.Ligne + "\n" + d.data.Millions_de_voyageurs + " million passengers" + "\n" + d.data.Titres + " tickets validated per day.");
    

    const arc2 = d3.arc()
        .innerRadius(5 + 62)
        .outerRadius(radius + 62)
    // Add percentages
    pieChart.selectAll("text")
        .data(pie(filteredData))
        .enter()
        .append("text")
        .style("fill", "white")
        .attr("transform", (d) => "translate(" + arc2.centroid(d) + ")")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text((d) => {
            return "M" + d.data.Ligne;
        });
}

function loadDataBubble() {
    // Bind event listeners to the select elements
    d3.select("#YearSelector").on("change", drawBubbleChart);
    
    // Initial data load
    drawBubbleChart();
}

function drawBubbleChart() {

    // Code inspired from https://observablehq.com/@d3/bubble-chart/2?intent=fork 


    d3.select("#bubblechart").select("svg").remove();
    

    var selectedYear = d3.select("#YearSelector").node().value;
    
    Promise.all([
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2021.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2020.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2019.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2018.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2017.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2016.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2015.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2014.csv"),
        d3.csv("/data/trafic-annuel-entrant-par-station-du-reseau-ferre-2013.csv"),

    ]).then((data) => {
        let chosenYear = ctx.year  - selectedYear;
        
        let chosenData = data[chosenYear]
        chosenData.forEach(d => {
            d.Arrondissement = parseInt(d.Arrondissement);
        });

        const width = 900;
        const height = 900;
        const margin = 1; 
        const name = d => d.Station.split(/\s+/);

        // Set up the SVG canvas
        const format = d3.format(",d");

        const uniqueArrondissements = [...new Set(chosenData.map(d => parseInt(d.Arrondissement)))].sort((a, b) => a - b);
        //Chat GPT
        const combinedColors = d3.schemeSet3.concat(d3.schemeCategory10);

        // Create a categorical color scale.
        const color = d3.scaleOrdinal().domain(uniqueArrondissements).range(combinedColors);

        const pack = d3.pack()
            .size([width - margin * 10, height - margin * 2])
            .padding(3);

        // Compute the hierarchy from the (flat) data; expose the values
        // for each node; lastly apply the pack layout.
        const root = pack(d3.hierarchy({children: chosenData})
                            .sum(d => d.Trafic));
            
        // Create the SVG container.
        const svg = d3.select("#bubblechart")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("viewBox", [-margin, -margin, width, height])
                        .attr("style", "max-width: 100%; height: auto; font: 9px sans-serif;")
                        .attr("text-anchor", "middle");
                        
        // Create a legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, 0)`);

        // Add color rectangles to legend
        legend.selectAll("rect")
            .data(uniqueArrondissements)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 18)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => color(d));

        // Add text labels to legend
        legend.selectAll("text")
            .data(uniqueArrondissements)
            .enter()
            .append("text")
            .style("fill", "white")
            .attr("x", 30)
            .attr("y", (d, i) => i * 18 + 5)
            .attr("dy", "0.75em")
            .text(d => d + " Arr.");

        // Place each (leaf) node according to the layout’s x and y values.
        const node = svg.append("g")
                        .selectAll()
                        .data(root.leaves())
                        .join("g")
                        .attr("transform", d => `translate(${d.x},${d.y})`);
        node.append("title")
            .text(d => `${d.data.Station}\n${format(d.value)}\n Rank ${d.data.Rang}`);  
        
        // Add a filled circle.
        node.append("circle")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => color(d.data.Arrondissement))
            .attr("r", d => d.r)
            .on("click", d => {
                //whenever i click on a circle (station), i will show the its trafic plot over the years
                console.log("Station:", d.originalTarget.__data__.data.Station);
                let station = d.originalTarget.__data__.data.Station;
                let stationOverYears = [];
                data.forEach((elem) => {
                    
                    let stationData = elem.filter(d => d.Station === station);
                    // console.log(stationData)

                    let row = {
                        Trafic: stationData[0].Trafic, // Assuming the station name is the same for all entries
                        Year: stationData[0].Année,
                        Rank: stationData[0].Rang
                        // Add other properties as needed
                    };

                    stationOverYears.push(row)
                })
                console.log(stationOverYears);
                getStationStats(station, stationOverYears);

            })
        // Add a label.
        const text = node.append("text")
                         .attr("clip-path", d => `circle(${d.r})`);
        
        // Add a tspan for each CamelCase-separated word.
        text.selectAll()
            .data(d => name(d.data))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
            .text(d => d)
            .append("title")
            .text(d => d);
    
        // Add a tspan for the node’s value.
        text.append("tspan")
            .attr("x", 0)
            .attr("y", d => `${name(d.data).length / 2 + 0.35}em`)
            .attr("fill-opacity", 0.7)
            .text(d => format(d.value));

    }).catch(function (err) { console.log(err); });
}


function getStationStats(station, stationInfo) {
    d3.select("#stationTitle").select("text").remove();
   
    d3.select("#stationTitle")
      .append("text")
      .text(station);
    
      const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 500,
        "height": 300,
        "title": "Number of Passenger Over Years",
        "data": {
          "values": stationInfo
        },
        "mark": {"type": "line", "point": true},
        "encoding": {
          "x": {"field": "Year", "type": "quantitative", "axis": {"grid": true, "format": "d"}},
          "y": {"field": "Trafic", "type": "quantitative", "axis": {"grid": true}},
          "tooltip": [{"field": "Year", "type": "ordinal"}, {"field": "Trafic", "type": "quantitative"}, {"field": "Rank", "type": "Ordinal"}]
        }
      };
      
      vegaEmbed('#clickBubbleViz', spec);
    
}