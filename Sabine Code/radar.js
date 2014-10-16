var margin = { top: 10, right: 50, bottom: 100, left: 50 };
var width = 500 - margin.left - margin.right;
var height = 500 - margin.bottom - margin.top;

var d = [
  [
  {axis: "Statistics", value: 200},
  {axis: "Visualisation", value: 129},
  {axis: "Programming", value: 108},
  {axis: "Natural Language Processing", value: 49},
  {axis: "Databases", value: 43},
  {axis: "DataScience", value: 134}
  ]
];

var colorscale = d3.scale.category10();

//Legend titles
var LegendOptions = ['Courses Studied']

//Options for the Radar chart, other than default
var mycfg = {
  w: width,
  h: height,
  maxValue: 250,
  levels: 5,
  ExtraWidthX: 300
}

RadarChart.draw("#chart", d, mycfg);

var svg = d3.select('#body')
	.selectAll('svg')
	.append('svg')
	.attr("width", width + 300)
	.attr("height", height);
		
//Initiate Legend	
var legend = svg.append("g")
	.attr("class", "legend")
	.attr("height", 100)
	.attr("width", 200)
	.attr('transform', 'translate(90,20)') 
	;
	//Create colour squares
	legend.selectAll('rect')
	  .data(LegendOptions)
	  .enter()
	  .append("rect")
	  .attr("x", width - 65)
	  .attr("y", function(d, i){ return i * 20;})
	  .attr("width", 10)
	  .attr("height", 10)
	  .style("fill", function(d, i){ return colorscale(i);})
	  ;
	//Create text next to squares
	legend.selectAll('text')
	  .data(LegendOptions)
	  .enter()
	  .append("text")
	  .attr("x", width - 52)
	  .attr("y", function(d, i){ return i * 20 + 9;})
	  .attr("font-size", "11px")
	  .attr("fill", "#737373")
	  .text(function(d) { return d; })
	  ;	
