var margin = { top: 40, right: 10, bottom: 50, left: 50 };
var width = 700 - margin.left - margin.right;
var height = 350 - margin.bottom - margin.top;

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
    // .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"]);
    .range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]);
    // .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"]);

var svg = d3.select("#area1").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g")
.attr("class", "focus")
.attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

var grad = d3.select("#grad");

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
    .call(xAxis)
      .selectAll("text")  
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
            return "rotate(-65)" 
          });;

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
      if(d.name == "Databases"){
        d3.select("#gradSingle").selectAll("stop")
          .attr("offset", "0%");
        d3.select(".SQL")
          .style('fill', "url(#gradSingle)");
        d3.selectAll(".barsSkills").select(".Databases")
          .style('fill', "url(#gradSingle)");
      }
      if(d.name == "ProgAbstractions"){
        //programming contribution
        d3.select("#gradSingle").selectAll("stop")
          .attr("offset", "0%");
        d3.select(".c")
          .style('fill', "url(#gradSingle)");
        //algorithms contribution
        d3.select("#gradAlgo").selectAll(".notYet")
          .attr("offset", "0%");
        d3.select("#gradAlgo").selectAll(".inProgressStart")
          .attr("offset", "0%");
        d3.selectAll(".Algorithms")
          .style('fill', "url(#gradAlgo)");
      }
      if(d.name == "Visualisation"){
        //javscript programming contribution
        d3.select("#gradSingle").selectAll("stop")
          .attr("offset", "0%");
        d3.select(".javascript")
          .style('fill', "url(#gradSingle)");

        //design contribution
        d3.select(".Design")
          .style('fill', "url(#gradSingle)");
      }
      if(d.name == "NatLangProcessing"){
        //NLP contribution
        d3.select("#gradSingle").selectAll("stop")
          .attr("offset", "0%");
        d3.select(".Natural.Language.Processing")
          .style('fill', "url(#gradSingle)");
        
        //Programming contribution
        d3.select("#gradPython").selectAll(".notYet")
          .attr("offset", "87%");
        d3.select("#gradPython").selectAll(".inProgressStart")
          .attr("offset", "87%");
        d3.select("#gradPython").selectAll(".inProgressEnd")
          .attr("offset", "100%");
        d3.select("#gradPython").selectAll(".complete")
          .attr("offset", "100%");
        d3.select(".python")
          .style('fill', "url(#gradPython)");
      }
      if(d.name == "StatsUdacity"){
        d3.select("#gradStats").selectAll(".notYet")
          .attr("offset", "86%");
        d3.select("#gradStats").selectAll(".inProgressStart")
          .attr("offset", "86%");
        d3.select("#gradStats").selectAll(".inProgressEnd")
          .attr("offset", "100%");
        d3.select("#gradStats").selectAll(".complete")
          .attr("offset", "100%");
        d3.select(".Statistics")
          .style('fill', "url(#gradStats)");
      }
      if(d.name == "DataScience"){
        //python programming contribution
        d3.select("#gradPython").selectAll(".notYet")
          .attr("offset", "0%");
        d3.select("#gradPython").selectAll(".inProgressStart")
          .attr("offset", "0%");
        d3.select("#gradPython").selectAll(".inProgressEnd")
          .attr("offset", "87%");
        d3.select("#gradPython").selectAll(".complete")
          .attr("offset", "87%");
        d3.select(".python")
          .style('fill', "url(#gradPython)");

        //stats contribution
        d3.select("#gradStats").selectAll(".notYet")
          .attr("offset", "73%");
        d3.select("#gradStats").selectAll(".inProgressStart")
          .attr("offset", "73%");
        d3.select("#gradStats").selectAll(".inProgressEnd")
          .attr("offset", "86%");
        d3.select("#gradStats").selectAll(".complete")
          .attr("offset", "86%");
        d3.select(".Statistics")
          .style('fill', "url(#gradStats)");

        //machine learning contribution
        d3.select("#gradML").selectAll(".notYet")
          .attr("offset", "0%");
        d3.select("#gradML").selectAll(".inProgressStart")
          .attr("offset", "0%");
        d3.select(".Machine.Learning")
          .style('fill', "url(#gradML)");
      }
      if(d.name == "Stats110"){
        d3.select("#gradStats").selectAll(".notYet")
          .attr("offset", "8%");
        d3.select("#gradStats").selectAll(".inProgressStart")
          .attr("offset", "8%");
        d3.select("#gradStats").selectAll(".inProgressEnd")
          .attr("offset", "73%");
        d3.select("#gradStats").selectAll(".complete")
          .attr("offset", "73%");
        d3.select(".Statistics")
          .style('fill', "url(#gradStats)");
      }
      if(d.name == "StatsInference"){
        d3.select("#gradStats").selectAll(".notYet")
          .attr("offset", "0%");
        d3.select("#gradStats").selectAll(".inProgressStart")
          .attr("offset", "0%");
        d3.select("#gradStats").selectAll(".inProgressEnd")
          .attr("offset", "8%");
        d3.select("#gradStats").selectAll(".complete")
          .attr("offset", "8%");
        d3.select(".Statistics")
          .style('fill', "url(#gradStats)");
      }


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

      if(d.name == "Databases"){
        d3.select(".SQL")
          .style('fill', "#c7c7c7");
        d3.select(".Databases")
          .style('fill', "#c7c7c7");
      }
      if(d.name == "ProgAbstractions"){
        //programming contribution
        d3.select(".c")
          .style('fill', "#c7c7c7");
        //algorithms contribution
        d3.select("#gradAlgo").selectAll(".notYet")
          .attr("offset", "82%");
        d3.select("#gradAlgo").selectAll(".inProgressStart")
          .attr("offset", "82%");
      }
      if(d.name == "Visualisation"){
        //javscript contributino
        d3.select(".javascript")
          .style('fill', "#c7c7c7");
        //design contribution
        d3.select(".Design")
          .style('fill', "#c7c7c7");
      }
      if(d.name == "NatLangProcessing"){
        //Programming contribution
        d3.select(".python")
          .style('fill', "#c7c7c7");
        //NLP contribution
        d3.select(".Natural.Language.Processing")
          .style('fill', "#c7c7c7");
      }
      if(d.name == "StatsUdacity"){
        d3.select(".Statistics")
          .style('fill', "#c7c7c7");
      }
      if(d.name == "DataScience"){
        //python programming contribution
        d3.select(".python")
          .style('fill', "#c7c7c7");
        //stats contribution
        d3.select(".Statistics")
          .style('fill', "#c7c7c7");

        //machine learning contribution
        d3.select("#gradML").selectAll(".notYet")
          .attr("offset", "20%");
        d3.select("#gradML").selectAll(".inProgressStart")
          .attr("offset", "20%");
      }
      if(d.name == "Stats110"){
        d3.select(".Statistics")
          .style('fill', "#c7c7c7");
      }
      if(d.name == "StatsInference"){
        d3.select(".Statistics")
          .style('fill', "#c7c7c7");
      }

        //On mouseout, return to previous colours
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