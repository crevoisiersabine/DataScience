var margin = { top: 25, right: 10, bottom: 50, left: 50 };
var width = 550 - margin.left - margin.right;
var height = 350 - margin.bottom - margin.top;

var canvas = d3.select("#area1").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
})
.attr("id", "bars");

d3.tsv("languages.tsv", function(dataL) {
	d3.tsv("skills.tsv", function(dataS){

		//Languages plot
		plot(dataL, "Languages");

		//Skills plot
		plot(dataS, "Skills");

	})
})

function plot(data, type){
	//Bar plot
	var categories = [""];
	var hours = [];
	data.forEach(function(d){
		categories.push(d[type]);
		hours.push(d.Hours);
	})

	var xscale = d3.scale.linear()
			.domain([0, 230])
			.range([0, width - 200]);

	var yscale = d3.scale.linear()
			.domain([0, categories.length])
			.range([0, (height - 50) / 2]);

	var	xAxis = d3.svg.axis();
	xAxis
		.scale(xscale)
		.tickSize( (50-height) / 2)
		.tickValues(d3.range(0, 260, 25))
		.ticks(5)
		.orient("bottom");

	var	yAxis = d3.svg.axis();
	yAxis
		.orient('left')
		.scale(yscale)
		.tickSize(2)
		.tickFormat(function(d,i){ return categories[i]; })
		.tickValues(d3.range(8));

	var chart = canvas.append('g')
			.attr("class", "bars" + type)
			.selectAll('rect')
			.data(hours)
			.enter()
			.append('rect')
			.attr('height', 10)
			.attr({'x':0,'y':function(d,i) { return yscale(i)+10; }})
			.style('fill', "#c7c7c7")
			.attr("class", function(d, i) {
				if (categories[i+1] == "c++") { return "c"; }
				else return categories[i+1];
			})
			.attr("width", function(d) { return xscale(d); });

   	var gradPreReQ =canvas.append("defs").append("linearGradient").attr("id", "gradPreReQ")
        .attr("x1", "100%").attr("x2", "0%");
    gradPreReQ.append("stop").attr("class", "complete").attr("offset",  "100%").style("stop-color", "#191970");

    var gradSingle =canvas.append("defs").append("linearGradient").attr("id", "gradSingle")
        .attr("x1", "100%").attr("x2", "0%");
	gradSingle.append("stop").attr("class", "notYet").attr("offset", "100%").style("stop-color", "#c7c7c7");
    gradSingle.append("stop").attr("class", "inProgress").attr("offset",  "0%").style("stop-color", "#17becf");

   	var gradML =canvas.append("defs").append("linearGradient").attr("id", "gradML")
        .attr("x1", "100%").attr("x2", "0%");
	gradML.append("stop").attr("class", "notYet").attr("offset", "25%").style("stop-color", "#c7c7c7");
	gradML.append("stop").attr("class", "inProgressStart").attr("offset",  "25%").style("stop-color", "#17becf");
	gradML.append("stop").attr("class", "inProgressEnd").attr("offset",  "25%").style("stop-color", "#17becf");
    gradML.append("stop").attr("class", "complete").attr("offset",  "25%").style("stop-color", "#191970");

    var gradPython =canvas.append("defs").append("linearGradient").attr("id", "gradPython")
          .attr("x1", "100%").attr("x2", "0%");
	gradPython.append("stop").attr("class", "notYet").attr("offset", "100%").style("stop-color", "#c7c7c7");
	gradPython.append("stop").attr("class", "inProgressStart").attr("offset",  "0%").style("stop-color", "#17becf");
	gradPython.append("stop").attr("class", "inProgressEnd").attr("offset",  "0%").style("stop-color", "#17becf");
    gradPython.append("stop").attr("class", "complete").attr("offset",  "0%").style("stop-color", "#191970");

    var gradStats =canvas.append("defs").append("linearGradient").attr("id", "gradStats")
          .attr("x1", "100%").attr("x2", "0%");
	gradStats.append("stop").attr("class", "notYet").attr("offset", "100%").style("stop-color", "#c7c7c7");
	gradStats.append("stop").attr("class", "inProgressStart").attr("offset",  "00%").style("stop-color", "#17becf");
	gradStats.append("stop").attr("class", "inProgressEnd").attr("offset",  "0%").style("stop-color", "#17becf");
    gradStats.append("stop").attr("class", "complete").attr("offset",  "0%").style("stop-color", "#191970");

	//Colour in courses to show progress and allow to update on hover later on
	d3.select("#bars").select(".octave").style('fill', "url(#gradPreReQ)");
	d3.select("#bars").select(".Java").style('fill', "url(#gradPreReQ)");
	d3.select("#bars").select(".R").style('fill', "url(#gradPreReQ)");
	d3.select("#bars").select(".Machine.Learning").style('fill', "url(#gradML)");

	var y_xis = canvas.append('g')
		.attr('class','yaxis')
		.call(yAxis);

	var x_xis = canvas.append('g')
		.attr('class','xaxis')
		.call(xAxis);

	//Add a title to the charts
	var title = canvas.append("text")
        .style("font-size", "16px")
        .style("stroke", "white")
        .style("fill", "white")
        .style("font-variant", "small-caps")
        .style("font-family", "sans-serif")
        .text(function(){
        	if(type == "Languages"){
				return "Programming Languages";
			}
			else{
				return "Skills";
			}
        })

	//Determine the y-translation required for each plot
	var yTrans = "";
	if(type == "Languages"){
		yTrans = margin.top + 25;
	}
	else{
		yTrans = 215;
	}
	var xAxisTrans = "";
	if(type == "Languages"){
		xAxisTrans = 163;
	}
	else{
		xAxisTrans = 327;
	}
	chart.attr("transform", "translate(200, " + yTrans + ")");
	y_xis.attr("transform", "translate(200, " + yTrans + ")");
	x_xis.attr("transform", "translate(200, " + xAxisTrans + ")");
	title.attr("transform", "translate(200, " + (yTrans - 5) + ")");

	//Make the x-axis less bright
	x_xis.attr("opacity", 0.5);

	//Add a legend above the graph
	var color = ["#191970", "#17becf", "#c7c7c7"];
	 var legend = canvas.selectAll(".legend")
      .data(["previous", "current", "remaining"])
      .enter().append("g")
      .attr("class", function(d){ return "legend " + d + ""})
      .attr("transform", function(d, i) { return "translate(" + (100 + i * 100) + ", 5)"; });

    legend.append("rect")
      .attr("x", 100)
      .attr("width", 7)
      .attr("height", 7)
      .attr("class", function(d){ return "square " + d + ""})
      .style("fill", function(d, i) { return color[i] })
      // .style("opacity", 0.65);

    legend.append("text")
      .attr("x", 157)
      .attr("y", 3)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}