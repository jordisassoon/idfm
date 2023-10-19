import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";
import "./map.css";
import React, { useEffect } from "react";


function Map() {
  useEffect(() => {
    const ctx = {
      w: window.innerWidth /2,
      h: 500,
    };
    // function handleZoom(e) {
    //     d3.select('svg g')
    //       .attr('transform', e.transform);
    // };

    // let zoom = d3.zoom()
    //              .on('zoom', handleZoom);

    //let circleGenerator = d3.symbol().type(d3.symbolCircle).size(5);
    //console.log("Using D3 v"+d3.version);

    var svgEl = d3.select("#map").append("svg");

    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);

    // create a projection for the map
    let projection = d3
      .geoMercator()
      .center([2.25, 48.65])
      .translate([ctx.w / 2, ctx.h / 2])
      .scale(16000);

    // d3.select('svg')
    //     .call(zoom);

    d3.json(
      "./iledefrance.geojson"
    )
      .then(function (data) {
        // reading the file containing the nb stations per arrondissement
        d3.csv("./nbStationsPerArr.csv")
          .then(function (colordata) {
            //define the color scale

            let colorScale = d3
              .scaleSequential(d3.interpolateYlOrRd)
              .domain([6, 70])
              .nice();
            // var colorScheme = d3.schemeReds[6];
            // colorScheme.unshift("#eee")
            // let nombres = colordata.map(d => d.nbStations).sort((a, b) => a - b);
            // console.log(nombres);
            // var colorScale = d3.scaleThreshold()
            //     .domain(nombres)
            //     .range(colorScheme);
            
            console.log(colordata)
            // Legend
            let g = svgEl
              .append("g")
              .attr("class", "legend")
              .attr("transform", "translate(80,350)");

            g.append("text")
              .attr("class", "caption")
              .attr("x", 0)
              .attr("y", -6)
              .style("font-size", "12px")
              .text("Nb Stations");
            
            let labels = ['6-11', '12-18', '19-32', '32-52', '>70'];
            let legend = legendColor()
              .labels(function (d) { return labels[d.i]; })
              .shapePadding(5)
              .orient("vertical")
              .shapeWidth(30)
              .scale(colorScale);

            svgEl.select(".legend").call(legend);

            let path = d3.geoPath().projection(projection);
            // create a path generator
            svgEl
              .append("g")
              .attr("class", "arrondissements")
              .selectAll("path")
              .data(data.features)
              .enter()
              .append("path")
              .attr("fill", function (d) {
                var nameArr = d.properties.nom;
            
                if (nameArr === "Paris") {
                  return colorScale(70);
                }
                
                let row = colordata.find((d) => d.Arrondissement === nameArr);

                if (row) {
                  return colorScale(row.nbStations);
                } else {
                  return "#ccc"; // Set a default color (gray in this case)
                }
              })
              .attr("d", d3.geoPath().projection(projection))
              .style("stroke", "black")
              .style("opacity", 0.3)
              .append("title")
              .text((d) => `${d.properties.nom}, ${d.properties.code}`);

            svgEl.selectAll("Alltext")
                 .data(data.features)
                 .enter()    
                 .append("text")
                 .attr("x", function (d) { return path.centroid(d)[0]; })
                 .attr("y", function (d) { return path.centroid(d)[1]; })
                 .attr("class", "label")
                 .attr("text-anchor","middle")
                 .text(function (d) { return d.properties.code; });
          })
          .catch(function (error) {console.log(error);});
      }).catch(function (error) {console.log(error);});

      
  }, []);
  return null;
}

export default Map;
