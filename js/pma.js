const ctx = {
    w: 850,
    h: 750,
    JITTER_W:50,
    X_ALL : 0,
    X_SPACING : 150,
    pm_max : 0,
    standardValue : 60
};

let circleGenerator = d3.symbol().type(d3.symbolCircle).size(5);

function vizualisation(data) {

    let maxpm = d3.max(data, ((d) => parseFloat(d.PM10)));
    ctx.pm_max = maxpm;
    let yScale = d3.scaleLinear()
                   .domain([0, maxpm])
                   .range([ctx.h-60, 60]);

    // Define a color scale
    ctx.colorScale = d3.scaleLinear()
            .domain([0, ctx.standardValue, maxpm]) 
            .range(['green', 'orange', 'red']);
          
    

    // y axis
    d3.select("#bkgG").append("g")
    .attr("transform", "translate(60,0)")
    .call(d3.axisLeft(yScale).ticks())
    .selectAll("text")
    .style("text-anchor", "end")
    .style("fill", "white");
    
    // y-axis label
    
    d3.select("#bkgG")
        .append("text")
        .attr("y", 0)
        .attr("x", 0)
        .attr("transform", `rotate(-90) translate(-${ctx.h/2 + 100},8)`)
        .classed("axisLb", true)
        .text("Average air pollution concentration (PM10) [µg/m³]")
        .style("fill", "white");

    d3.select("#bkgG").append("line")          
      .style("stroke", "red") 
      .style("stroke-width", 3) 
      .attr("x1", ctx.standardValue)     
      .attr("y1", yScale(ctx.standardValue))      
      .attr("x2", ctx.w)
      .attr("y2", yScale(ctx.standardValue));

    //Adding the plot for all the Stations
    let all = d3.select("#rootG")
                .append('g')
                .attr("id", "All")
                .attr("transform", `translate(${ctx.X_ALL},0)`);
        
    plotStationDistributionByST(data, yScale);
        
};

function plotStationDistributionByST(allData, yScale){
    let pointsByST = d3.group(allData, (d) => (d.Gare));
    
    let xoffset = ctx.X_ALL;
    pointsByST.forEach((points, st) => {
        if (points.length > 1){
            xoffset += ctx.X_SPACING;
            plotStationDistribution(st, points, xoffset, yScale);
        }
    });
    addLegend();
};

function plotStationDistribution(station, points, centerX, yScale){
    let pointsG = d3.select("#rootG").append("g")
                            .attr("id", station.replace(/\s/g,''))
                            .attr("transform", `translate(${centerX},0)`);
    // label
    pointsG.append("text")
    .datum(station)
    .attr("transform", `translate(0,${ctx.h-40})`)
    .style("text-anchor", "middle")
    .text((d) => (`${d}`))
    .style("fill", "white");
    
    
    pointsG.append("text")
          .attr("transform", `translate(0,${ctx.h-20})`)
          .style("text-anchor", "middle")
          .text(points.length)
          .style("fill", "white");
    
    // //density plot
    
    // plot the points
    pointsG.selectAll("path")
        .data(points)
        .enter()
        .append("path")
        .attr("d", circleGenerator())
        .attr("transform", function(d){console.log("bibi"); return "translate(" + (Math.random()*ctx.JITTER_W/2 - ctx.JITTER_W / 4) + "," + yScale(ctx.pm_max) + ")";})
        .attr("transform", function(d){return "translate(" + (Math.random()*ctx.JITTER_W/2 - ctx.JITTER_W / 4) + "," + yScale(d.PM10) + ")";})
        .style("fill", d => ctx.colorScale(d.PM10))
        .append("title")
        .text((d) => (`Date: ${d.Date}\nPM10 = ${d.PM10} µg/m³`))
        .style("fill", "white");
        
    boxPlot(points, pointsG, yScale)    
};

function addLegend() {
  // Add Legend
  const legend = d3.select("#rootG").append("g")  // Append to the same parent container
      .attr("class", "legend")
      .attr("transform", `translate(${ctx.w / 2 - 70},${50})`);

  const legendColor = d3.legendColor()
      .scale(ctx.colorScale)
      .orient("horizontal")
      .shapeWidth(40)
      .shapeHeight(10)
      .cells(5)  // Adjust the number of legend cells as needed
      .title("PM10 Dangerosity on Human's Health")
      .labels(["V. Good", "Good", "Medium", "Bad", "V. Bad"]);

  legend.call(legendColor);
}

function boxPlot(data, sG, yScale){
    // compute summary stats
    let sumStats = getSummaryStatistics(data);
    // console.log(sumStats);
    // actually draw the boxplot
    sG.append("rect")
      .datum(sumStats)
      .attr("x", -ctx.JITTER_W/2)
      .classed("boxplot", true)
      .attr("width", ctx.JITTER_W)
      .attr("y", (d) => (yScale(d.q3)))
      .attr("height", (d) => (yScale(d.q1)-yScale(d.q3)));
    // median
    sG.append("line")
      .datum(sumStats)
      .attr("x1", -ctx.JITTER_W/2)
      .attr("x2", ctx.JITTER_W/2)
      .attr("y1", (d) => (yScale(d.median)))
      .attr("y2", (d) => (yScale(d.median)));
    // upper whisker
    sG.append("line")
      .datum(sumStats)
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", (d) => (yScale(d.q3)))
      .attr("y2", (d) => (yScale(d.max)));
    sG.append("line")
      .datum(sumStats)
      .attr("x1", -10)
      .attr("x2", 10)
      .attr("y1", (d) => (yScale(d.max)))
      .attr("y2", (d) => (yScale(d.max)));
    // lower whisker
    sG.append("line")
      .datum(sumStats)
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", (d) => (yScale(d.q1)))
      .attr("y2", (d) => (yScale(d.min)));
    sG.append("line")
      .datum(sumStats)
      .attr("x1", -10)
      .attr("x2", 10)
      .attr("y1", (d) => (yScale(d.min)))
      .attr("y2", (d) => (yScale(d.min)));
    sG.selectAll("line")
      .classed("boxplot", true);
};


function loadData() {

    d3.select("#vis svg").remove();

    var svgEl = d3.select("#vis").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    var rootG = svgEl.append("g").attr("id", "rootG");
    // group for background elements (axes, labels)
    rootG.append("g").attr("id", "bkgG");
    var selectedYear = d3.select("#YearSelector").node().value;
    
    d3.csv("data/PMA.csv").then(function (data) {
        
        data = data.filter(p => p.Year == selectedYear)
        data.forEach(
            (d) => { d.PM10 = parseFloat(d.PM10); }
        );
        vizualisation(data)
    }).catch(function(error){console.log(error)});
};

function createViz(){
    console.log("Using D3 v"+d3.version);

    d3.select("#YearSelector").on("change", loadData);

    // Initial data load
    loadData();
    
};

/*-------------- Summary stats for box plot ------------------------*/
/*-------------- see Instructions/Section 3 ----------------------*/

function getSummaryStatistics(data) {
    return d3.rollup(data, function (d) {
        let q1 = d3.quantile(d.map(function (p) { return p.PM10; }).sort(d3.ascending), .25);
        let median = d3.quantile(d.map(function (p) { return p.PM10; }).sort(d3.ascending), .5);
        let q3 = d3.quantile(d.map(function (p) { return p.PM10; }).sort(d3.ascending), .75);
        let iqr = q3 - q1;
        let min = d3.min(data, (d) => (d.PM10));
        let max = d3.max(data, (d) => (d.PM10));
        return ({ q1: q1, median: median, q3: q3, iqr: iqr, min: min, max: max })
    });
};