var margin = { top: 100, right: 10, bottom: 50, left: 50 };
var width = 1000 - margin.left - margin.right;
var height = 450 - margin.bottom - margin.top;
var width_legend = 100;

var format = d3.time.format("%d-%m-%Y");

//Ordinal x axis scale for dates
var x = d3.time.scale()
    .range([0, width]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.day, 2)
    .tickFormat(d3.time.format("%b %e"));

//Linear y axis scale for hours worked
var y = d3.scale.linear()
    .rangeRound([height, 0]);
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//8 colours for the 8 courses studied
var color = d3.scale.ordinal()
    // .range(["#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#17becf"]);
    // .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#9467bd", "#aec7e8", "#d62728", "#e377c2", "#17becf"]);
    .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"]);

var svg_plot = d3.select("#area1")
    .append("svg")
      .attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
      })
    .append("g")
      .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
      });

var svg_legend = d3.select("#area1")
    .append("svg")
      .attr({
        width: width_legend,
        height: height + margin.top + margin.bottom
      })
    .append("g")
      .attr({
        transform: "translate(0," + margin.top + ")"
      });

//Load the data
dataLoader.load(fillCourses);

function fillCourses() {
  //Text to tell a story
  var captions = ["<b>Starting with the 5 courses:<br></b>\
                  <li>CS106B (c++)<br></li>\
                  <li>Natural Language Processing<br></li>\
                  <li>Databases<br></li>\
                  <li>CS171 (visualisation)<br></li>\
                  <li>Statistics (udacity)<br></li>\
                  <b>As planned. For one month.</b>",
                  "Followed by a two week holiday, visiting Thailand.<br>\
                  <b>And a little work...</b>",
                  "<b>CS171</b> was a <b>fantastic</b> course so we started looking for other Harvard courses and found:<br>\
                   <br>\
                  <b>CS109 (data science course). </b>",
                  "<b>ALTER THE PLAN</b>\
                  <ol><li>Put current courses on hold</li>\
                  <li>Focus on NEW courses:</li></ol>\
                  <li>CS109 (data science)</li>\
                  <li>Stats110  (statistics pre-requisite for CS109)</li>",
                  "Decide to focus on one course at a time.<br>\
                   <br>\
                  <b>Stats110 completed!</b>",
                  "<b>CS109 completed!</b>",
                  "<b>CS171 completed!</b>",
                  "Decide to study <b>statistical inference</b> to supplement Stats110.<br>",
                  "<b>Databases completed!</b>",
                  "Onwards with c++ towards completion..."] 
  var courses = dataLoader.courses();
  color.domain(dataLoader.colorD());

  //Create the labels
  svg_plot.append("g").append("foreignObject")
          .attr("id", "caption")
          .attr("x", 570)
          .attr("y", -70)
          .attr('width', 350)
          .attr('height', 500)
          .append("xhtml:body")
          .html('<div style="width: 400px; font-size: 30; color: white; display:none"></div>');

  //Create the x and y axes
  x.domain([dataLoader.minDate(), dataLoader.maxDate()]);
  y.domain([0, dataLoader.maxHour() + 1]); //+1 to accomodate for rounding when worked 0,5h
  svg_plot.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) { return "rotate(-85)" });;

  svg_plot.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    // .attr("transform", "rotate(-90)")
    .attr("x", 5)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Hours Worked");

  //Create buckets for each significant part of studying, to help with storytelling
  var bucket1 = svg_plot.append("g")
            .attr("id", "bucket1");
  var bucket2 = svg_plot.append("g")
            .attr("id", "bucket2");
  var bucket3 = svg_plot.append("g")
            .attr("id", "bucket3");
  var bucket4 = svg_plot.append("g")
            .attr("id", "bucket4");
  var bucket5 = svg_plot.append("g")
            .attr("id", "bucket5");
  var bucket6 = svg_plot.append("g")
            .attr("id", "bucket6");
  var bucket7 = svg_plot.append("g")
            .attr("id", "bucket7");
  var bucket8 = svg_plot.append("g")
            .attr("id", "bucket8");
  var bucket9 = svg_plot.append("g")
            .attr("id", "bucket9");
  var bucket10 = svg_plot.append("g")
            .attr("id", "bucket10");

  function appendRects(day, course_day, number){
    //Var number to get the dots at the right height
    day.forEach(function(d, i){
        var hour_range = (d.y1 - d.y0);
        //Round up the hour-range so don't have 0.5 hours which don't look as nice graphically
        if(hour_range % 1 !== 0){hour_range = hour_range + 0.5;}
        if(hour_range != 0){
          for(var j = 0; j < hour_range; j = j + 1){
            course_day.append("rect")
              .attr("width", width / 130 - 2)
              .attr("height", function(d) {
                if(hour_range == 0) { return 0; }
                else { return (height/11) - 2; }
              })
              .attr("x", function(d) { return x(d.date) + 1; })
              .attr("y", function(d) { return (y(number + j) - height/11 + 1); }) //(height/11) to get the rects to drop from the top of the hour
              .style("fill", color(d.name))
              .style('opacity', 0)
              .attr("class", "hidden");
          }
          number += hour_range;
        }
    })
  }

  //Populate the buckets depending on the date
  courses.forEach(function(day) {

    if (day[0].date < format.parse("01-07-2014")){
      var course_day = bucket1.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("01-07-2014") && day[0].date < format.parse("16-07-2014")){
      var course_day = bucket2.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("16-07-2014") && day[0].date < format.parse("24-07-2014")){
      var course_day = bucket3.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("24-07-2014") && day[0].date < format.parse("14-08-2014")){
      var course_day = bucket4.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("14-08-2014") && day[0].date < format.parse("26-08-2014")){
      var course_day = bucket5.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("26-08-2014") && day[0].date < format.parse("13-09-2014")){
      var course_day = bucket6.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("13-09-2014") && day[0].date < format.parse("17-09-2014")){
      var course_day = bucket7.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("17-09-2014") && day[0].date < format.parse("20-09-2014")){
      var course_day = bucket8.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("20-09-2014") && day[0].date < format.parse("25-09-2014")){
      var course_day = bucket9.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
    if(day[0].date >= format.parse("25-09-2014")){
      var course_day = bucket10.selectAll(".course")
        .data(day, function(days){
            return days;
        })
        .enter().append("g")
        .attr("class", day[0].date);
      appendRects(day, course_day, 0);
    }
  })

  // Transitions & update hours
  var rectsBucket = [];
  rectsBucket.push(d3.select("#bucket1").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket2").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket3").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket4").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket5").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket6").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket7").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket8").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket9").selectAll("rect")[0].length);
  rectsBucket.push(d3.select("#bucket10").selectAll("rect")[0].length);

  var time_funcs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      timer = 0;
  var delays = [3000, 2000, 4000, 4000, 4000, 2000, 2000, 3000, 3000]

  function callFuncs() {
    transitions(time_funcs[timer++], captions, rectsBucket);
    if (timer < time_funcs.length) setTimeout(callFuncs, delays[timer-1]);
  }
  //Launch the function after 0.5s
  setTimeout(callFuncs, 0);

  //Legend -- SHOULD BE IN SAME BOOTSTRAP COLUMN AS GRAPH
  var legend = svg_legend.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 17 + ")"; });

  legend.append("rect")
    .attr("x", width_legend - 15)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", color);

  legend.append("text")
    .attr("x", width_legend - 20)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

    //Hovering
    d3.selectAll("rect")
      .on("mouseover", function(){
        //This checks the class of the caption to disallow hovering over the rects before the storytelling piece is over
        if(d3.select("#caption").classed("10")){
          var buck = this.parentNode.parentNode.id;
          //Note buck_num = 0 actually corresponds to 10th bucket
          var buck_num = buck[buck.length-1];
          if(buck_num == 0){
            $("#caption").html(captions[9]);
          }
          else{
            $("#caption").html(captions[buck_num-1]);
          }
        }
      })
};

function transitions(bucket_number, captions, rectsBucket){
  
  // First transition the bars
  d3.selectAll("g").selectAll("#bucket" + bucket_number + " rect")
    .transition()
    .duration(50)
    .delay(function(d, i){
      return x(d.date) * 10 + i * 10;
    })
      .style('opacity', 1)
      .attr("class", "shown")
      .each('end', function(d, i) {
        var totalHours = parseInt(d3.select(".header .col-md-1 h1 small").text()) + 1;
        d3.select(".header .col-md-1 h1 small").text(totalHours);
        if(i == 0){
          $("#caption").html(captions[bucket_number - 1]).attr("class", bucket_number).hide();
        }
        if(i == rectsBucket[bucket_number - 1] - 2){
          // Then transition the relevant text
          $("#caption").fadeIn();
        }
      })
}

