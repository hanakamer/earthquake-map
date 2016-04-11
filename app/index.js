require('d3');
require('jquery-ui/slider');
require('jquery-ui/themes/base/jquery-ui.css');
require('jquery-ui/themes/base/jquery.ui.theme.css');

const $ = require('jquery');
const topojson = require('topojson');
const turJSON = require("./tur.topo.json");

const width = 1030;
const height = 480;

let svg = d3.select(".map").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("class", 'map-container');

let subunits = topojson.feature(turJSON, turJSON.objects.tur);
let projection = d3.geo.mercator()
                  .center([35, 34.5])
                  .scale(3000)
                  .translate([width/2, height + 50]);

let path = d3.geo.path().projection(projection);

svg.append("path")
  .datum(subunits)
  .attr("d", path);

svg.selectAll(".subunit")
    .data(topojson.feature(turJSON, turJSON.objects.tur).features)
    .enter().append("path")
    .attr("class", function(d) {
      return "subunit " + d.id; })
    .attr("d", path)
    .style("fill", function(d){
      return 'lightyellow'
      });

const timeScale = d3.time.scale()
                        .domain([new Date('1900-01-01'), new Date('2016-01-01')])
                        .range([0, width])
                        .clamp(true);
const startValue = timeScale(new Date('1900-01-01'));
const endValue =  timeScale(new Date('2016-01-01'));

const slider = $('#slider').slider({
  value: 0,
       min: startValue,
       max: endValue,
       step: 1,
       slide: function( event, ui ) {
          let value = ui.value;
          let date = timeScale.invert(value)
           $('#showdate').val(date)
       }
})

console.log()
