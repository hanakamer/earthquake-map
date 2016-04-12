require('d3');
require('jquery-ui/slider');
require('jquery-ui/themes/base/jquery-ui.css');
require('jquery-ui/themes/base/jquery.ui.theme.css');
require ('./style.css')
const $ = require('jquery');
const topojson = require('topojson');
const turJSON = require("./tur.topo.json");
const depremlerJSON = require ('./depremler.json');

const width = 950;
const height = 550;

const projection = d3.geo.mercator();

const path = d3.geo.path().projection(projection);
let cities = topojson.feature(turJSON, turJSON.objects.tur).features
projection
    .center([35, 34.5])
    .scale(3000)
    .translate([width/2, height + 50]);

let svg  = d3.select(".map").append("svg")
          .attr("width", width)
          .attr("height", height);

const aa = [39, 37];

console.log(projection(aa))

svg.selectAll("path")
  .data(cities).enter()
  .append("path")
  .attr("class", "feature")
  .style("fill", "lightgrey")
  .attr("d", path);

svg.append("path")
  .datum(topojson.mesh(turJSON,  turJSON.objects.tur, function(a, b) { return a !== b; }))
  .attr("class", "mesh")
  .attr("d", path);


const addEathquake = function(long, lat) {
  svg.selectAll("circle")
  		.data([[long,lat]]).enter()
  		.append("circle")
  		.attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
  		.attr("cy", function (d) { return projection(d)[1]; })
  		.attr("r", "8px")
  		.attr("fill", "red")

}

addEathquake(32,39)

const parseDate = d3.time.format("%Y-%m-%d").parse;
const formatDate = d3.time.format("%b-%Y");

const timeScale = d3.time.scale()
                        .domain([new Date('1900-01-01'), new Date('2016-01-01')])
                        .range([0, 1300])
                        .clamp(true);

const startValue = timeScale(new Date('1900-01-01'));
const endValue =  timeScale(new Date('2016-01-01'));

const slider = $('#slider').slider({
  value: 0,
       min: startValue,
       max: endValue,
       step: 0.025,
       slide: function( event, ui ) {
          let value = ui.value;
          let date = timeScale.invert(value)
          let formatDigit = function(mydate) {
            if (mydate.toString().length < 2 ) {
              let result = '0' + mydate.toString();
              return result;
            }
            return mydate;
          };
          let dateFormat = date.getFullYear() + '.' +
                            formatDigit(date.getMonth() + 1) + '.' +
                            formatDigit(date.getDate());

           $('#showdate').val(dateFormat);
       }
})
