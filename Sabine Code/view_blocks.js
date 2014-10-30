var margin = { top: 40, right: 10, bottom: 50, left: 50 };
var width = 900 - margin.left - margin.right;
var height = 400 - margin.bottom - margin.top;
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
    // .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"]);
    .range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]);

var courses = [];
var colorD =[];

d3.tsv("study_data.tsv", function(err, data) {
    colorD = d3.keys(data[0]).filter(function(key) { return key !== "Date"; });
    color.domain(colorD);

    var count = 0.0;
    var course_dictionary = {}

    //Populate the data that I will use from the file
    data.forEach(function(d, i){
        
      //Parsing the date in the dataset
      d.date = format.parse(d.Date);

      count += 1;
      var y0 = 0;
      d.courses = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.courses[d.courses.length - 1].y1;


      if(course_dictionary[d.date] == undefined) {
        course_dictionary[d.date] = [color.domain().map(function(name) { return {total: d.total, date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; })];
      }
      else {
        course_dictionary[d.date].push(color.domain().map(function(name) { return {total: d.total, date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; }));
      }
    })

    //Create the data structure
    for(var key in course_dictionary){
      for(var course in course_dictionary[key]){
        courses.push(course_dictionary[key][course]);
      }
    }

    minDate = d3.extent(data, function(d) { return d.date; })[0];
    maxDate = d3.extent(data, function(d) { return d.date; })[1];
    maxHour = d3.max(data, function(d) { return d.total; });


//-------------------------------------------------------------------Create the tooltip--------------------------------------------------------
    d3.select("#area1").append("div")
          .attr("id", "caption")
          .style("margin-left", "300px")
          .style("margin-top", "20px");
//--------------------------------------------------------Text to tell the story-----------------------------------------------
  var captions = ["<h2><small><font color='#eee'>We started the first term studying 5 courses simultaneously</font></small></h2>",

                  "<h2><small><font color='#eee'>Followed by a two week holiday. <b>And a little work...</b></font></small></h2>",

                  "<h2><small><font color='#eee'>CS171 was a <b>brilliant</b> course, so we found other Harvard Courses</font></small></h2>",

                  "<h2><small><font color='#eee'>Long days studying Statistics and Data Science Theory... this was a difficult period</font></small></h2>",


                  "<h2><small><font color='#eee'>Stats110 completed, half a day off!</font></small></h2>",

                  "<h2><small><font color='#eee'>CS109 completed, quarter of a day off!</font></small></h2>",

                  "<h2><small><font color='#eee'>CS171 completed ... </font></small></h2>",

                  "<h2><small><font color='#eee'>Studying statistical inference to apply our Stats110 learning.</font></small></h2>",

                  "<h2><small><font color='#eee'>Databases completed</font></small></h2>",

                  "<h2><small><font color='#eee'>and CS106B the last man standing</font></small></h2>"] 

//------------------------------------------------------------------Create the titles-----------------------------------------------------
    d3.select(".header .col-md-8 h1 small").text("Studying hours over 6 months");
    d3.select(".header .col-md-3 h1 small").text("Total hours worked:");
    d3.select(".header .col-md-1 h1 small").text("0");
    d3.selectAll("#explanation").text("")
//-------------------------------------------------------------------Create the svgs-------------------------------------------------------------
  var svg_plot = d3.select("#area1")
    .append("svg")
      .attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
      })
      .attr({
        viewBox: "0 0 " + String(width + margin.left + margin.right) + " " + String(height + margin.top + margin.bottom),
        preserveAspectRatio: "none"
      })
    .append("g")
      .attr("class", "mainG")
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
      .attr("class", "otherG")
      .attr({
        transform: "translate(0," + margin.top + ")"
      });

//------------------------------------------------------------------Arrows--------------------------------------------------------------------
function createArrows(h, x, y){
    var arrows = d3.selectAll("#area1")
      .append("svg")
      .attr({
          width: 200,
          height: h
        })
      .append("g").attr("id", "#arrows")
        .attr({
          transform: "translate(" + x + ", " + y + ")"
        });

    var arrowreplay = arrows.append("g").attr("class", "RP")
        .attr({
          transform: "translate(0, 0)"
        });

    arrowreplay.append("rect") //to help with clicking on the arrows so don't have to exactly click on the path element of arrow
      .attr({
          transform: "translate(30, 30)"
        })
      .attr("height", 40)
      .attr("width", 40)
      .attr("opacity", 0);
    arrowreplay.append("path")
      .attr("d", "M50,68.2c-8.6,0-15.6-7-15.6-15.6c0-3.6,1.3-7.2,3.6-10c0.6-0.7,1.6-0.8,2.3-0.2c0.7,0.6,0.8,1.6,0.2,2.3  c-1.8,2.2-2.9,5-2.9,7.9c0,6.8,5.6,12.4,12.4,12.4c6.8,0,12.4-5.6,12.4-12.4S56.8,40.2,50,40.2c-0.9,0-1.6-0.7-1.6-1.6  s0.7-1.6,1.6-1.6c8.6,0,15.6,7,15.6,15.6S58.6,68.2,50,68.2z")
    arrowreplay.append("path").attr("d", "M54.1,46.1c-0.4,0-0.8-0.1-1.1-0.4l-6-5.5c-0.3-0.3-0.5-0.7-0.5-1.2c0-0.4,0.2-0.9,0.5-1.2l6-5.5c0.7-0.6,1.7-0.6,2.3,0.1  c0.6,0.7,0.6,1.7-0.1,2.3L50.5,39l4.7,4.3c0.7,0.6,0.7,1.6,0.1,2.3C54.9,45.9,54.5,46.1,54.1,46.1z")

    var arrowFastForward = arrows.append("g").attr("class", "FF")
        .attr({
          transform: "translate(37, 0)"
        });
    arrowFastForward.append("rect") //to help with clicking on the arrows so don't have to exactly click on the path element of arrow
      .attr({
          transform: "translate(35, 30)"
        })
      .attr("height", 40)
      .attr("width", 30)
      .attr("opacity", 0);
    arrowFastForward.append("path").attr("d", "M52.422,51.737c-0.354,0-0.709-0.125-0.995-0.377l-9.805-8.693c-0.62-0.55-0.677-1.498-0.127-2.118      c0.551-0.62,1.499-0.676,2.118-0.127l9.805,8.693c0.62,0.55,0.677,1.498,0.127,2.118C53.249,51.566,52.836,51.737,52.422,51.737      z")
    arrowFastForward.append("path").attr("d", "M42.618,60.43c-0.414,0-0.827-0.17-1.123-0.505c-0.549-0.62-0.492-1.568,0.127-2.118l9.805-8.693      c0.621-0.549,1.568-0.492,2.118,0.127c0.549,0.62,0.492,1.568-0.127,2.118l-9.805,8.693      C43.327,60.306,42.972,60.43,42.618,60.43z")
    arrowFastForward.append("path").attr("d", "M61.422,51.737c-0.354,0-0.709-0.125-0.995-0.377l-9.805-8.693c-0.62-0.55-0.677-1.498-0.127-2.118      c0.55-0.62,1.498-0.676,2.118-0.127l9.805,8.693c0.62,0.55,0.677,1.498,0.127,2.118C62.249,51.566,61.836,51.737,61.422,51.737z      ")
    arrowFastForward.append("path").attr("d", "M51.618,60.43c-0.414,0-0.827-0.17-1.123-0.505c-0.549-0.62-0.492-1.568,0.127-2.118l9.805-8.693      c0.62-0.549,1.568-0.492,2.118,0.127c0.549,0.62,0.492,1.568-0.127,2.118l-9.805,8.693C52.327,60.306,51.972,60.43,51.618,60.43      z")
    
    //Create an arrow to navigate to the next bit of the story
    var arrowDown = arrows.append("g").attr("class", "DOWN")
        .attr({
          transform: "translate(50, 70)"
        });
    arrowDown.append("path").attr("d", "M8.048,10.043c-2,0-2.589,2.014-1.457,3.143l8.098,8.235c0.746,0.746,1.956,0.785,2.7,0.037l8.1-8.154  c1.016-1.018,0.568-3.261-1.433-3.261C21.952,10.043,9.646,10.043,8.048,10.043z")
    arrowDown.attr("opacity", 0);

    //Create an arrow to navigate to the next bit of the story
    var arrowUP = arrows.append("g").attr("class", "UP")
        .attr({
          transform: "translate(50, 0)"
        });
    arrowUP.append("path").attr("d", "M23.986,22c2,0,2.589-2.014,1.457-3.143l-8.098-8.235c-0.746-0.746-1.956-0.786-2.7-0.038l-8.099,8.155  C5.531,19.757,5.978,22,7.979,22C10.082,22,22.388,22,23.986,22z")
    arrowUP.attr("opacity", 0);
  }
  createArrows(250, 70, 0);

//------------------------------------------------------------------Axes--------------------------------------------------------------------
  //Create the x and y axes
  x.domain([minDate, maxDate]);
  y.domain([0, maxHour + 1]); //+1 to accomodate for rounding when worked 0,5h
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

//------------------------------------------------------------------Buckets--------------------------------------------------------------------
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
              .attr("class", function(){
                return "hidden " + String(d.name)
              });
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

  var time_funcs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      timer = 0;
  var delays = [3000, 2000, 4000, 4000, 4000, 2000, 2000, 3000, 3000, 1000] //Change the opacity of the last circle
  //Check if FF button has been clicked, if so, stop all transitions
  var FFclicked;

  function callFuncs() {
    if(time_funcs[timer] == "11"){
      if(!d3.select(".circle10").empty()) {
        d3.select(".circle10").transition().duration(400).delay(1000).style("opacity", 0.5); //Change the opacity of the last circle
        enableHover(captions, createArrows);
        showNext(d3.select(".DOWN"));
        timer++;
      }
    }
    else{
      var t = time_funcs[timer++];
      transitions(t, captions, rectsBucket);
    }
    if (timer < time_funcs.length){
      FFclicked = setTimeout(callFuncs, delays[timer-1]);
    }
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
    .style("font-size", "12px")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

  //When click on the fast forward arrow
  d3.select(".FF").on("click", function(){
    //End transitions
    var allElem = d3.selectAll("*")
      .transition() 
      .duration(0)
      .each('end', function(d, i) {
        if(i == 1129) {
          //Update the total hours to the correct number - at this point to avoid discrepancies due to transitions not yet finished
          d3.select(".header .col-md-1 h1 small").text("673");
        }
    });
    clearTimeout(FFclicked);
    //Finish the plot
    runTillEnd(captions, rectsBucket, createArrows);
  })

  // ---------------------------------------------------------------Page loading---------------------------------------------------------------
  $(window).scroll(function(){
    if(parseFloat($(window).scrollTop()) <= 1200){
      //End transitions
      var allElem = d3.selectAll("*")
        .transition() 
        .duration(0);

      clearTimeout(FFclicked);
      //Finish the plot
      runTillEnd(captions, rectsBucket, createArrows);

      //Reset the hour counter
      d3.select(".header .col-md-1 h1 small").text("0");
      //Remove current view
      d3.selectAll("svg").remove();
      //Remove caption div
      d3.select("#caption").remove();
    }
  })

  d3.select(".RP").on("click", function(){
    Reload();
  })

  function Reload(){
    //End transitions
    var allElem = d3.selectAll("*")
      .transition() 
      .duration(0);

    clearTimeout(FFclicked);
    //Finish the plot
    runTillEnd(captions, rectsBucket, createArrows);

    //Reset the hour counter
    d3.select(".header .col-md-1 h1 small").text("0");
    //Remove current view
    d3.selectAll("svg").remove();
    //Remove caption div
    d3.select("#caption").remove();
    //Load the data again for previous view
    LoadMyJs("view_blocks.js");
  }
});

function showNext(arrowImg){
  //Show placement of arrow for continuing with the story
  arrowImg.transition().duration(400).attr("opacity", 1);
}

function enableHover(captions, createArrows){
  //Hovering
  d3.select(".mainG").selectAll("circle")
    .on("mouseover", function(d, i){
      //Bring the correct caption to show
      var buck = d3.select(this).attr("class");
      var buck_num = buck[buck.length-1];
      if(buck_num == 0){ //Note buck_num = 0 actually corresponds to 10th bucket
        d3.select("#caption").html(captions[9]).style("opacity", 1)
            .style("margin-left",  "300px")  
            .style("margin-top", "20px");   
      }
      else{
        d3.select("#caption").html(captions[buck_num-1]).style("opacity", 1)
            .style("margin-left", "300px")
            .style("margin-top", "20px");  
      }

      //Bleep over hovered circle to draw attention
      Bleep(d3.select(this));

      //Make the hovered circle brighter
      d3.select(this).attr("opacity", 0.8);

    })
    .on("mouseout", function(d){
      d3.select("#caption").html("").style("opacity", 0);
      d3.select(this).style("opacity", 0.3);
    })
  d3.select(".DOWN").attr("opacity", 1);
  d3.select(".DOWN").on("click", function(d){
    //Load the data again for another view
    secondView(createArrows);
  })
}

function transitions(bucket_number, captions, rectsBucket){
  var circleNum = bucket_number - 1;

  // First transition the bars
  d3.selectAll("g").selectAll("#bucket" + bucket_number + " rect")
    .transition()
    .duration(100)
    .delay(function(d, i){
      return x(d.date) * 30 + i * 30;
    })
      .style('opacity', 1)
      .attr("class", function(){
        return "shown " + String(this.className.animVal.substr(this.className.animVal.indexOf(' ')+1));
      })
      .each('end', function(d, i) {
        var totalHours = parseInt(d3.select(".header .col-md-1 h1 small").text()) + 1;
        d3.select(".header .col-md-1 h1 small").text(totalHours);
        if(i == 0){
          //Bring up the story
          d3.select("#caption").html(captions[bucket_number - 1]).attr("class", bucket_number).style("opacity", 0);
        }
        if(i == rectsBucket[bucket_number - 1] - 2){
          //Get attributes of the last rect over which the circle will be positioned
          var xPos = parseInt(d3.select(this).attr("x"));
          var yPos = parseInt(d3.select(this).attr("y"));
          var h = parseInt(d3.select(this).attr("height"));
          var w = parseInt(d3.select(this).attr("width"));
          var circle = d3.select(".mainG")
                        .append("circle")
                        .attr("class", "circle" + bucket_number)
                        .attr("cx", xPos + w/2)
                        .attr("cy", yPos - h)
                        .attr("r", 9)
                        .style("fill", "#eee")
                        .style("opacity", 0);
          circle.transition()
              .each("end", function(d, i) {
                return Bleep(circle)
              })
              .transition()
              .ease("linear")
              .duration(1000) 
              .style("opacity", 0.5);

          // Then transition the relevant text
          d3.select("#caption").transition()
              .ease("linear")
              .duration(1000)
              .style("opacity", 1);
        }
      })
}

function runTillEnd(captions, rectsBucket, createArrows){
  //Remove all circles
  d3.selectAll("circle").remove();

  for(bucket_number = 1; bucket_number < 11; bucket_number++){
    // First show the the bars
    var rectList = d3.selectAll("g").selectAll("#bucket" + bucket_number + "").selectAll("rect");
    rectList.style('opacity', 1)
           .attr("class", function(){
              return "shown " + String(this.className.animVal.substr(this.className.animVal.indexOf(' ')+1));
            });
    //Show the circles
    var xCoord = rectList[0][rectList[0].length - 2].x.animVal.value; //animVal allows access to coordinates somehow...there must be a better way, I don't know at this stage
    var yCoord = rectList[0][rectList[0].length - 2].y.animVal.value;
    var h = rectList[0][rectList[0].length - 2].height.animVal.value;
    var w = rectList[0][rectList[0].length - 2].width.animVal.value;
    d3.select(".mainG")
      .append("circle")
      .attr("class", "circle" + bucket_number)
      .attr("cx", xCoord + w/2)
      .attr("cy", yCoord - h)
      .attr("r", 9)
      .style("fill", "#eee")
      .style("opacity", 0.5);
  }
  // Then make the caption in-visible
  d3.select("#caption").html("")
    .style("opacity", 0);

  //Enable hovering once everything is loaded
  enableHover(captions, createArrows);
}

// ----------------------------------------LOADING FILE FUNCTIONS-----------------------------------------------

function LoadMyJs(scriptName) {
  var imported = document.createElement('script');
  imported.src = scriptName;
  document.head.appendChild(imported);
}

function LoadScriptsSync(_scripts, scripts) {

  var x = 0;
  var loopArray = function(_scripts, scripts) {
    // call itself
    loadScript(_scripts[x], scripts[x], function(){
      // set x to next item
      x++;
      // any more items in array?
      if(x < _scripts.length) {
        loopArray(_scripts, scripts);   
      }
    }); 
  }
  loopArray(_scripts, scripts);      
}

function loadScript(src, script, callback){

    script = document.createElement('script');
    script.onerror = function() { 
        // handling error when loading script
        console.log('Error to handle');
    }
    script.onload = function(){
        console.log(src + ' loaded ')
        callback();
    }
    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
}

// ----------------------------------------END OF LOADING FILE FUNCTIONS---------------------------------------

function secondView(createArrows){
  //Remove the text from first row to minimise the row and make more space for the row below to have text
  d3.selectAll(".header h1 small").text("");

  //Add additional html explanation of the second view
  d3.selectAll("#explanation").html('The courses spanned a number of skills and programming languages, cumulatively building upon our competence in these.<br><br>\
  <p style = "text-align: left">Brush the timeline to zoom in on a specific time period. Hover over a course to track its timeline and examine its skills.<br>\
  The competencies are color coded relative to the course you select and according to hours spent \
  <span style = "background-color: #eee"><font color="#191970"><b>previously</b></font></span>, \
  <span style = "background-color: #eee"><font color="#17becf"><b>currently</b></font></span> and \
  <span style = "background-color: #222"><font color="#c7c7c7"><b>remaining</b></font></span></p>');

  // Remove the caption
  d3.select("#caption").remove();
  //Make the axis text invisible
  d3.selectAll(".axis").selectAll("text").style("opacity", 0);
  //Make the svg smaller to use as context for the next plot
  d3.selectAll("svg").transition().duration(1000).ease("cubic")
    .attr("height", 100)
    .attr("width", 750 - margin.left - margin.right);
  //Remove the svg with the legend
  d3.selectAll("svg").forEach(function(d){
    d.forEach(function(k, index){
      if(index == 1 || index == 2){
        k.remove();
      }
    })
  })
  //Add a class to the g
  d3.select("svg").select("g").attr("class", "context");

  //Reload the arrows
  createArrows(100, 20, 50);

  //Load bottom graphs
  LoadScriptsSync(["area.js", "barChart.js"], [])

  //Include focus and brush functionality
  focusAndBrush();

  //Add an up arrow to go back to previous view
  d3.select(".UP").attr("opacity", 1);
  d3.select(".DOWN").remove();
  d3.select(".FF").remove();
  d3.select(".RP").remove();
  d3.selectAll("circle").remove();

  //On click up arrow bring back the first view
  d3.select(".UP").on("click", function(d){
    //Remove current view
    d3.selectAll("svg").remove()
    //------------------------------------------------------------Create the titles-----------------------------------------------
    d3.select(".header .col-md-8 h1 small").text("Studying hours over 6 months");
    d3.select(".header .col-md-3 h1 small").text("Total hours worked:");

    //Reset the hour counter
    d3.select(".header .col-md-1 h1 small").text("0");
    //Load the data again for previous view
    LoadMyJs("view_blocks.js");
  })
}

function focusAndBrush() {
  var height = 350 - margin.bottom - margin.top;
  var svg = d3.select("#area1").select("svg");
  var x2 = x;
  var width = 750 - margin.left - margin.right;

  var brush = d3.svg.brush()
    .x(x)
    .on("brush", brushed);

  var area = d3.svg.area()
    .interpolate("basis")   
    .x(function(d) { 
    return x(d.date) + 1; }) //1 pixel shift to avoid ovverwriting the y-axis
    .y0(height)
    .y1(function(d) { return y(d.hour); });

  d3.select(".context").append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", 23)
      .attr("height", 290);

  //Keep a counter of how many times brushed
  var count = 0;

  function brushed() {

    if(count == 0){ //only apprend defs once
       d3.select("#area1").selectAll("svg")
        .append("defs").append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);
    }
    count++;
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    d3.select(".focus").selectAll(".course").selectAll("path").attr("d", function(d) { return area(d.values); });
    d3.select(".focus").select(".x.axis").call(xAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
          return "rotate(-65)" 
        });;;
  }
}

function Bleep(circle){
      var blip = [2, 3, 4];
      d3.select(".mainG").selectAll("blips").data(blip).enter()
        .append("circle").attr("class", "bleep")
        .attr("cx", function(pt, i){
          return circle.attr("cx");
        })
        .attr("cy", function(pt, i){
          return circle.attr("cy");
        })
        .attr("r", function(pt){
          return pt/2;
        })
        .style("stroke", function(dt, i){
          if(i == 0) return "#eee";
          return "#222";
        })
        .style("fill", function(pt, i){
          if(i == 0) return "#eee";
          if(i == 1) return "#222";
          else return "rgba(0,0,0,0)";
        })
        .attr("opacity", 0.7)
        .transition()
        .ease("quad")
        .duration(1500)
        .attr("r", function(pt, i){
          if(i == 0) return 30;
          else return Math.pow(pt, 3);
        })
        .attr("opacity", 0)
        .transition()
        .remove();
}