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

//Load the data
dataLoader.load(firstView);

function firstView() {
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
          .html('<div style="width: 400px; font-size: 30; color: white; display:none, visibility:hidden"></div>');

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

  var time_funcs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      timer = 0;
  // var delays = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //for ease of testing so happens quickly
  var delays = [3000, 2000, 4000, 4000, 4000, 2000, 2000, 3000, 3000, 1000] //Change the opacity of the last circle
  //Check if FF button has been clicked, if so, stop all transitions
  var FFclicked;

  function callFuncs() {
    if(time_funcs[timer] == "11"){
      if(!d3.select(".circle10").empty()) {
        d3.select(".circle10").transition().duration(400).delay(1000).style("opacity", 0.3); //Change the opacity of the last circle
        enableHover(captions);
        showNext(arrowImg);
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

  //Create an arrow to navigate to the next bit of the story
  var arrowImg = d3.select("#DOWN").append("svg")
                    .attr("width", 1100 - margin.left - margin.right)
                    .attr("height", 100)
                    .append("g").attr("class", "arrowDOWN");
  arrowImg.append("path").attr("d", "M50.021,15.959c-18.779,0.002-34.001,15.224-34.001,34c0,18.779,15.221,34.002,34.001,34.001   c18.776,0,33.998-15.222,33.999-34.002C84.021,31.181,68.798,15.961,50.021,15.959z M47.684,72.107   c-0.044-0.033-0.089-0.064-0.132-0.102c-0.078-0.064-0.155-0.135-0.231-0.212c-0.003-0.002-0.006-0.006-0.008-0.008L30.324,54.798   c-1.495-1.495-1.495-3.915,0-5.411c1.493-1.493,3.915-1.493,5.408,0L46.195,59.85l-0.001-29.015   c0.001-2.113,1.714-3.826,3.826-3.826c2.111,0,3.824,1.713,3.824,3.826v29.016l10.463-10.462c1.492-1.495,3.916-1.495,5.411,0   c1.491,1.494,1.491,3.914,0,5.407L52.726,71.788c-0.081,0.083-0.16,0.154-0.243,0.221c-0.033,0.03-0.07,0.058-0.104,0.086   c-0.027,0.021-0.058,0.045-0.088,0.062c-0.634,0.472-1.416,0.752-2.269,0.754c-0.856-0.002-1.639-0.282-2.276-0.754   C47.724,72.142,47.705,72.123,47.684,72.107z");
  arrowImg.attr("transform", function(d, i) { return "translate("+ (1000 - margin.left - margin.right)/2 + ", 0)"; });
  arrowImg.attr("opacity", 0);

  var arrowFastForward = svg_legend.append("g").attr("class", "FF");
  arrowFastForward.append("path").attr("d", "M53.646,62.319l6.518-6.518H25.801C22.593,55.801,20,53.208,20,50  c0-3.208,2.593-5.815,5.801-5.815h34.363l-6.518-6.503c-2.271-2.271-2.271-5.947,0-8.217c2.271-2.271,5.946-2.271,8.217,0  l16.435,16.435c2.27,2.255,2.27,5.947,0,8.203L61.863,70.536c-2.271,2.27-5.947,2.27-8.217,0  C51.375,68.266,51.375,64.589,53.646,62.319z");
  arrowFastForward.attr("transform", function(d, i) { return "translate(20, 200)"; });

  //When click on the fast forward arrow
  svg_legend.select(".FF").on("click", function(){
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
    runTillEnd(captions, rectsBucket);
  })

};

function showNext(arrowImg){
  //Show placement of arrow for continuing with the story
  arrowImg.transition().duration(400).attr("opacity", 1);
}

function enableHover(captions){
  //Hovering
  d3.select(".mainG").selectAll("circle")
    .on("mouseover", function(d){
      //Increase the opacity of the circle when hovered over
      d3.select(this).style("opacity", 0.8);
      //Bring the correct caption to show
      var buck = d3.select(this).attr("class");
      var buck_num = buck[buck.length-1];
      if(buck_num == 0){ //Note buck_num = 0 actually corresponds to 10th bucket
        $("#caption").html(captions[9]);
      }
      else{
        $("#caption").html(captions[buck_num-1]);
      }
    })
    .on("mouseout", function(d){
      d3.select(this).style("opacity", 0.3);
    })
  var arrowClick = d3.select(".arrowDOWN").attr("opacity", 1);
  arrowClick.on("click", function(d){
    //Load the data again for another view
    secondView();
  })
}

function transitions(bucket_number, captions, rectsBucket){
  var circleNum = bucket_number - 1;

  // First transition the bars
  d3.selectAll("g").selectAll("#bucket" + bucket_number + " rect")
    .transition()
    .duration(100)
    // .duration(0) //for ease of testing so happens quickly
    .delay(function(d, i){
      return x(d.date) * 30 + i * 30;
    })
      .style('opacity', 1)
      .attr("class", "shown")
      .each('end', function(d, i) {
        var totalHours = parseInt(d3.select(".header .col-md-1 h1 small").text()) + 1;
        d3.select(".header .col-md-1 h1 small").text(totalHours);
        if(i == 0){
          //If any circles exist already, reduce their opacity to bring in focus the new circle
          d3.select(".circle" + circleNum).transition().duration(400).style("opacity", 0.3);
          //Bring up the story
          $("#caption").html(captions[bucket_number - 1]).attr("class", bucket_number).hide();
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
                        .attr("r", 25)
                        .style("fill", "purple")
                        .style("opacity", 0);
          circle.transition()
            .ease("linear")
            .duration(1000) 
            .style("opacity", 0.8);

          // Then transition the relevant text
          d3.select("#caption").transition()
              .ease("linear")
              .duration(1000)
              .style("display", "inline")
              .style("visibility", "visible");
        }
      })
}

function runTillEnd(captions, rectsBucket){
  //Remove all circles
  d3.selectAll("circle").remove();

  for(bucket_number = 1; bucket_number < 11; bucket_number++){
    // First show the the bars
    var rectList = d3.selectAll("g").selectAll("#bucket" + bucket_number + "").selectAll("rect");
    rectList.style('opacity', 1)
           .attr("class", "shown");
    //Show the circles
    // console.log(rectsBucket)
    var xCoord = rectList[0][rectList[0].length - 2].x.animVal.value; //animVal allows access to coordinates somehow...there must be a better way, I don't know at this stage
    var yCoord = rectList[0][rectList[0].length - 2].y.animVal.value;
    var h = rectList[0][rectList[0].length - 2].height.animVal.value;
    var w = rectList[0][rectList[0].length - 2].width.animVal.value;
    d3.select(".mainG")
      .append("circle")
      .attr("class", "circle" + bucket_number)
      .attr("cx", xCoord + w/2)
      .attr("cy", yCoord - h)
      .attr("r", 25)
      .style("fill", "purple")
      .style("opacity", 0.3);
  }
  // Then make the caption visible
  d3.select("#caption")
    .style("display", "inline")
    .style("visibility", "visible").text("");

  //Enable hovering once everything is loaded
  enableHover(captions);
}

function secondView(){
  // Make the caption invisible
  d3.select("#caption")
    .style("visibility", "hidden");
  //Make the axis text invisible
  d3.selectAll(".axis").selectAll("text").style("opacity", 0);
  d3.selectAll("svg").transition().duration(1000).ease("cubic")
    .attr("height", 100)
    .attr("width", 1100 - margin.left - margin.right);
  d3.select("#caption").attr("visibility", "hidden");
  d3.selectAll("svg").forEach(function(d){
    d.forEach(function(k, index){
      if(index == 1){
        k.remove();
      }
    })
  })
  //Add an up arrow to go back to previous view
  var arrowImg2 = d3.select("#UP").append("svg")
                    .attr("width", 1100 - margin.left - margin.right)
                    .attr("height", 100)
                    .append("g")
                    .attr({
                      transform: "translate(" + (1100 - margin.left - margin.right)/2 + ", 0)"
                    })
                    .attr("class", "arrowUP");
  arrowImg2.append("path").attr("d", "M49.979,83.96c18.779-0.001,34.001-15.223,34.001-34c0-18.778-15.222-34-34.001-34c-18.776,0-33.998,15.223-33.999,34.001   C15.979,68.738,31.203,83.959,49.979,83.96z M52.316,27.812c0.044,0.033,0.088,0.065,0.131,0.102   c0.078,0.064,0.156,0.135,0.232,0.212c0.003,0.001,0.006,0.005,0.008,0.007l16.988,16.988c1.495,1.495,1.495,3.917,0,5.412   c-1.494,1.493-3.916,1.493-5.409,0L53.805,40.07v29.015c0,2.112-1.713,3.826-3.826,3.826c-2.112,0-3.825-1.714-3.825-3.826V40.07   L35.692,50.531c-1.493,1.495-3.916,1.495-5.411,0c-1.492-1.493-1.492-3.915,0-5.408l16.994-16.992   c0.081-0.082,0.16-0.154,0.243-0.22c0.033-0.03,0.069-0.058,0.104-0.085c0.027-0.021,0.058-0.045,0.087-0.062   c0.635-0.472,1.417-0.752,2.27-0.754c0.855,0.002,1.639,0.284,2.275,0.755C52.275,27.779,52.295,27.797,52.316,27.812z");
  arrowImg2.attr("opacity", 1);
  d3.select(".arrowDOWN").remove();
  d3.selectAll("circle").remove();

  //On click up arrow bring back the first view
  arrowImg2.on("click", function(d){
    //Remove current view
    d3.selectAll("svg").remove();
    //Reset the hour counter
    d3.select(".header .col-md-1 h1 small").text("0");
    //Load the data again for another view
    firstView();
  })
}