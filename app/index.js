require('d3');

require('jquery-ui/slider');
require('jquery-ui/button');
require('jquery-ui/themes/base/jquery-ui.css');
require('jquery-ui/themes/base/jquery.ui.theme.css');
require ('./style.css')
const $ = require('jquery');
const topojson = require('topojson');
const turJSON = require("./tur.topo.json");
const depremlerJSON = require ('./depremler.json');
const earthquakeByDateSJON = require('./earthquakeByDate.json');
let curTime = 1;
const width = 1050;
const height = 450;

const projection = d3.geo.mercator();

const path = d3.geo.path().projection(projection);
let cities = topojson.feature(turJSON, turJSON.objects.tur).features
projection
    .center([35, 34.5])
    .scale(2500)
    .translate([width/2, height+30]);

let svg  = d3.select(".map").append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", 'map-container');

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

const addEathquake = function(data) {
  let circle = svg.selectAll("circle")
      .data(data).enter()
      .append("circle")
      .attr("cx", function(d) {
        return projection([d.Boylam, d.Enlem])[0]
      })
      .attr("cy", function(d) {
        return projection([d.Boylam, d.Enlem])[1]
      })
      .attr('stroke-width', 2)
      .attr("r", '20')
      .attr("class", 'circ')
      .attr("fill", "transparent")
      .attr("stroke", "red")
      .transition()
      .attr("r", '0')
      .attr('stroke-width', 0)
      .duration(800)
      .remove()
}

const parseDate = d3.time.format("%Y-%m-%d").parse;
const formatDate = d3.time.format("%b-%Y");
const timeScale = d3.time.scale()
                        .domain([new Date('1900-01-01'), new Date('2016-01-01')])
                        .range([0, 42356])
                        .clamp(true);

const startValue = timeScale(new Date('1900-01-01'));
const endValue =  timeScale(new Date('2016-01-01'));

const formatDigit = function(mydate) {
  if (mydate.toString().length < 2 ) {
    let result = '0' + mydate.toString();
    return result;
  }
  return mydate;
};
const formatTimeStamp = function(mydate) {
  let year = mydate.getFullYear().toString();
  let month = formatDigit(mydate.getMonth()+1).toString();
  let day = formatDigit(mydate.getDate()).toString();
  let hour = formatDigit(mydate.getHours()).toString();
  let min = formatDigit(mydate.getMinutes()).toString();
  let sec = formatDigit(mydate.getSeconds()).toString();
  let result = year + month + day + hour + min + sec;
  return result
}

let values = [];
let playInterval;
let currentTime = curTime;
const slideDuration = 200; // in milliseconds
let autoRewind = true;

const slider = $('#slider').slider({
  value: 0,
       min: startValue,
       max: endValue,
       step: 1,
       slide: function( event, ui ) {
          currentTime = ui.value;
          let date = timeScale.invert(currentTime)
          let timeStamp =formatTimeStamp(date)
          let dateFormat = date.getFullYear() + '.' +
                            formatDigit(date.getMonth() + 1) + '.' +
                            formatDigit(date.getDate());
           $('#showdate').val(dateFormat);
           let data = earthquakeByDateSJON[dateFormat]
           if (data != undefined) {
             $('.number').animate({height: data.length*20}, 100 );
              $('#shownum').val(data.length);
              addEathquake(data)
           }else{
             $('.number').animate({height: 5}, 100 );
             $('#shownum').val(0);
           }

       },
       change: function( event, ui ) {
         currentTime = ui.value;
         let date = timeScale.invert(currentTime)
         let timeStamp =formatTimeStamp(date)
         let dateFormat = date.getFullYear() + '.' +
                           formatDigit(date.getMonth() + 1) + '.' +
                           formatDigit(date.getDate());
          $('#showdate').val(dateFormat);

          let data = earthquakeByDateSJON[dateFormat]
          if (data != undefined) {
            $('.number').animate({height: data.length*20}, 100 );
          $('#shownum').val(data.length);
            addEathquake(data)
          } else {
            $('.number').animate({height: 5}, 100 );
            $('#shownum').val(0);
          }
       }
})

const button = $( "#play" ).button({
     icons: {
       primary: "ui-icon-play"
     },
     text: false
   }).click(function () {
       if (playInterval != undefined) {
           clearInterval(playInterval);
           playInterval = undefined;
           $(this).button({
               icons: {
                   primary: "ui-icon-play"
               }
           });
           return;
       }
       $(this).button({
           icons: {
               primary: "ui-icon-pause"
           }
       });
       playInterval = setInterval(function () {
           currentTime = currentTime + 1;
           if (currentTime > 3659558400) {
               if (autoRewind) {
                   currentTime = 0;
               }
               else {
                   clearIntveral(playInterval);
                   return;
               }
           }
           $( "#slider" ).slider( "value", currentTime );
       }, slideDuration);
   });

 $.handle = slider.find('.ui-slider-handle')
 $(document).on('keyup keydown', function(e) {
   if ( $.handle.hasClass('ui-state-focus') ) return;
   if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40) {
     e.target = $.handle.get(0);
     $.handle.triggerHandler(e);
   }
 });
