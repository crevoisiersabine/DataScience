var margin = { top: 10, right: 50, bottom: 100, left: 50 };
var width = 960 - margin.left - margin.right;
var height = 600 - margin.bottom - margin.top;

var format = d3.time.format("%d-%m-%Y");

//Ordinal x axis scale for dates
var x = d3.time.scale()
    .range([0, width]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

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
    //Populate the data that I will use from the file
    data.forEach(function(d, i){
        count += 1;
        var y0 = 0;
        d.courses = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.courses[d.courses.length - 1].y1;
        //Parsing the date in the dataset
        d.date = format.parse(d.Date);
    })

    //Create the x and y axes
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);
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
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Hours Worked");

    var course = svg.selectAll(".course")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      // .attr("transform", function(d) { return "rotate(-65)" })
      .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; });

    course.selectAll("rect")
      .data(function(d) { return d.courses; })
      .enter().append("rect")
      .attr("width", count/(width) + 6)
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); });

    //Legend
    var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

    // console.log(data);
});