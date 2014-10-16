var margin = { top: 50, right: 50, bottom: 300, left: 50 };
var width = 3500 - margin.left - margin.right;
var height = 700 - margin.bottom - margin.top;

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

var svg = d3.select("body").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

d3.tsv("study_data.tsv", function(data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));
    
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
        course_dictionary[d.date] = [color.domain().map(function(name) { return {date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; })];
      }
      else {
        course_dictionary[d.date].push(color.domain().map(function(name) { return {date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; }));
      }
    })

    //Create the x and y axes
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.total; }) + 1]); //+1 to accomodate for rounding when worked 0,5h
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) { return "rotate(-85)" });;

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      // .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("Hours Worked");

    var courses = [];

    //Create the data structure
    for(var key in course_dictionary){
      for(var course in course_dictionary[key]){
        courses.push(course_dictionary[key][course]);
      }
    }

    courses.forEach(function(day) {
      //Var number to get the dots at the right height
      var number = 0;
      day.forEach(function(d){
          var hour_range = (d.y1 - d.y0);
          //Round up the hour-range so don't have 0.5 hours which don't look as nice graphically
          if(hour_range % 1 !== 0){hour_range = hour_range + 0.5;}
          if(hour_range != 0){
            var course_day = svg.selectAll(".course")
              .data(day)
              .enter().append("g")

            for(var j = 0; j < hour_range; j++){
              course_day.append("circle")
                .attr("r", function(d) {
                  if(hour_range == 0) { return 0; }
                  else { return 12; }
                    // return count/(width) + 3; }
                })
                .attr("cy", function(d) { return (y(number + j) - height/22); }) //(height/11) / 2 to place circles in the middle of each tick
                .attr("cx", function(d) { return x(d.date) + 12; }) //12 is the radius of the circle
                .style("fill", color(d.name));
            }
            number += hour_range;
          }
      })
    })

    //Legend
    var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; });

    legend.append("rect")
      .attr("x", width - 38)
      .attr("width", 38)
      .attr("height", 38)
      .style("fill", color);

    legend.append("text")
      .attr("x", width - 40)
      .attr("y", 20)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});