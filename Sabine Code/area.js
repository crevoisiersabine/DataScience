var margin = { top: 100, right: 10, bottom: 50, left: 50 };
var width = 750 - margin.left - margin.right;
var height = 450 - margin.bottom - margin.top;

var format = d3.time.format("%d-%m-%Y");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var area = d3.svg.area()
  .interpolate("basis")   
    .x(function(d) { return x(d.date) + 1; }) //1 pixel shift to avoid ovverwriting the y-axis
    .y0(height)
    .y1(function(d) { return y(d.hour); });

//8 colours for the 8 courses studied
var color = d3.scale.ordinal()
    // .range(["#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#c7c7c7", "#17becf"]);
    // .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#9467bd", "#aec7e8", "#d62728", "#e377c2", "#17becf"]);
    // .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"]);
    // .range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]);
    .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"]);

var svg = d3.select("#area1").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g")
.attr("class", "focus")
.attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

// -------------------------------------------------------------------------------------------------------
//DATA
d3.tsv("study_data.tsv", function(data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));

  data.forEach(function(d) {
      d.date = format.parse(d.Date);
  });

  var courses = color.domain().map(function(name) {
      return {
          name: name,
          values: data.map(function(d) {
            return {date: format.parse(d.Date), hour: +d[name]};
          })
      };
    });

//AXES
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(courses, function(c) { return d3.max(c.values, function(v) { return v.hour; }); })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Hours Worked");

  var course = svg.selectAll(".course")
    .data(courses)
  .enter().append("g")
    .attr("class", "course");

  course.append("path")
    .attr("d", function(d) { return area(d.values); })
    .attr("class", function(d){ return "area " + d.name + ""})
    // .style("stroke", "black")
    // .style("stroke-width", 3)
    .style("fill", function(d) { return color(d.name); })
    .style("opacity", 0.65);

// -------------------------------------------------------------------------------------------------------
    //Legend
    var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", function(d){ return "legend " + d + ""})
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("class", function(d){ return "block " + d + ""})
      .style("fill", color)
      .style("opacity", 0.65);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

// -------------------------------------------------------------------------------------------------------
    //SORTING
    //Sort the area chart alphabetically
  svg.selectAll(".course").sort(function(a, b) {
          if (a.name > b.name) {
              return 1;
          } else {
              if (a.name < b.name) {
                return -1;
              } else {
                return 0;
              }
          }
      });


// -------------------------------------------------------------------------------------------------------
    //MOUSEOVER

    svg.selectAll(".course")
      .on("mouseover", function(d){
        return Highlight(d);
      })
      .on("mouseout", function(d){
        return UnHighlight(d);
      })

    svg.selectAll(".legend")
      .on("mouseover", function(d){
        courses.forEach(function(obj){
          if(obj.name == d){
            return Highlight(obj);
          }
        })
      })
      .on("mouseout", function(d){
        courses.forEach(function(obj){
          if(obj.name == d){
            return UnHighlight(obj);
          }
        })
      })

// -------------------------------------------------------------------------------------------------------
    //Functions
    function Highlight(d) {
      //Gray out all courses except the one hovered over
        svg.selectAll(".area")
          .style("fill", "#c7c7c7");
        //Recede other course legends in gray 
        svg.selectAll(".block")
           .style("fill", "#c7c7c7");

        //Sort the course nodes so that the hovered one appears at the front
        svg.selectAll(".course").sort(function(a, b) {
          if (a.name === d.name) {
              return 1;
          } else {
              if (b.name === d.name) {
                return -1;
              } else {
                return 0;
              }
          }
      });

        //Highlight in blue the area hovered over
        svg.select(".area." + d.name + "")
           .style("fill", "#17becf")
           .style("opacity", 1);

        //Highlight in blue the legend for the course hovered over
        svg.select(".block." + d.name + "")
           .style("fill", "#17becf")
           .style("opacity", 1);
    }

    function UnHighlight(d) {
      //Restore the original order
        svg.selectAll(".course").sort(function(a, b) {
          if (a.name > b.name) {
              return 1;
          } else {
              if (a.name < b.name) {
                return -1;
              } else {
                return 0;
              }
          }
      });

        //On mouseover, return to previous colours
        svg.selectAll(".area")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d) { return color(d.name); })
          .style("opacity", 0.65);
        //Return the legend to previous colours
        svg.selectAll(".block")
           .style("fill", color)
           .style("opacity", 0.65);
    }

});