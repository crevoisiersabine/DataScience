var diameter = 600,
    radius = diameter / 2,
    innerRadius = radius - 100;
    outerRadius = radius - 90
 
var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });
 
var bundle = d3.layout.bundle();
 
var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var radialScale = d3.scale.linear().range([0, 2* Math.PI]); //Create the radial scale

  // CREATE A COLOR SCALE
var color = d3.scale.ordinal()
  .domain(["ProgMethodology","ProgAbstractions","Databases","NatLangProcessing","Visualisation","DataScience","Stats110","MachineLearning","StatsUdacity","StatsInference"]) 
  // .range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]);
  .range(['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','#ccebc5','rgb(188,128,189)']);
 
var svg = d3.select("#area6").append("svg")
    .attr("width", 650)
    .attr("height", 750)
  .append("g")
    .attr("transform", "translate(" + (radius + 20) + "," + (radius + 40) + ")") //Translate coordinate system

//------------------------GETTNG THE CORRECT DATA STRUCTURE -------------------------------------------------
d3.csv("course_hierarchy.csv", function(d) {

// var connect_data
//   d3.json("testing_connect.json", function(d){
//     connect_data = d;
//     console.log(connect_data)
//   });
  map_temp = {}
  data_temp = []
  file_save_map = []

  //--------------------------------Helper Functions to get data
  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };

  //For getting elements from the map based on their index
  function get_map_elem(map, index){
    var counter = 0;
    for(key in map){
      if(counter==index) return key;
      counter ++;
    }
  }
  //--------------------------------Helper Functions to get data

  //Create basic object structure
  d.forEach(function(d){
    var key_string = "DataScience." + d.Course + "." + d.Chapter.substring(1, d.Chapter.length)
    if(!map_temp[key_string]){
      if(d.Chap_hour=="") d.Chap_hour = 5
      map_temp[key_string] = {"name":key_string,"size":parseFloat(d.Chap_hour),"imports":[]};
      file_save_map.push(map_temp[key_string]);
    }
  })

  var temp_array = []
  temp_array.push(map_temp)

  // saveToFile(file_save_map,"Course_relation_data.json")

  //Choose a random number of connections for each node
  $.each(map_temp, function (i, val) {
    // console.log(map_temp[i])
    var num_imp = Math.floor(Math.random() * 5) + 1; //Random number between 1 & 5
    for(i=0; i<num_imp; i++){
      // console.log(Object.size(map_temp))
      var index = Math.floor(Math.random() * Object.size(map_temp));
      if(index != i ){
        val.imports.push(get_map_elem(map_temp, index));
      }
    }
    data_temp.push(val);
  });

  d3.json("Course_relation_data.json", function(error, classes){

    var nodes = cluster.nodes(packageHierarchy(classes))
    var links = packageImports(nodes);

    //--------------------------------Create the data for the //el coords plot

    parallel_data = [] //Data for parallel coordinate plot
    parallel_data_track = []
    //Need to iterate through the links to create the parallel data
    links.forEach(function(d){
      // Source Data
      if(parallel_data_track.indexOf(d.source.parent.key)==-1){ //i.e. have not seen this course yet
        parallel_data_track.push(d.source.parent.key); //Put the course in the data tracker
        var hours = d.source.value * d.source.parent.children.length
        var new_ent = {course:d.source.parent.key, topic_count:d.source.parent.children.length, course_hours:hours, links:1} //Set up the JSON object data entry - links start at 1
        parallel_data.push(new_ent);
      } else {
        parallel_data[parallel_data_track.indexOf(d.source.parent.key)].links += 1//update the links counter by one
      }
      // Target Data
      if(parallel_data_track.indexOf(d.target.parent.key)==-1){ //i.e. have not seen this course yet
        parallel_data_track.push(d.target.parent.key); //Put the course in the data tracker
        var hours = d.target.value * d.target.parent.children.length
        var new_ent = {course:d.target.parent.key, topic_count:d.target.parent.children.length, course_hours:hours, links:1} //Set up the JSON object data entry - links start at 1
        parallel_data.push(new_ent);
      } else {
        parallel_data[parallel_data_track.indexOf(d.target.parent.key)].links += 1//update the links counter by one
      }
    });

    //--------------------------------Create the hierarch edge bundling plot
   
    svg.selectAll(".chain")
        .data(bundle(links))
      .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("class", "chain")
        .attr("d", line);
   
    svg.selectAll(".node")
        .data(nodes.filter(function(n) { return !n.children; }))
      .enter().append("g")
        .attr("class", "point")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .append("text")
        .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
        .text(function(d) { return d.key; })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);

    //--------------------------------Create the overlying donut selector
    var upper_count = 0
    var lower_count = 1
    var arc_dat = []
    var sort_order = ["ProgAbstractions", "ProgMethodology", "Visualisation", "DataScience", "MachineLearning", "Stats110", "StatsUdacity", "Databases", "NatLangProcessing", "StatsInference"]//Sorting the parallel_data into the correct order
    var i, d = {}, donut_data = []; //Intermediate dict and result
    for(i=0; i<parallel_data.length; ++i){ //Create the map
      d[parallel_data[i].course] = parallel_data[i];
    }
    for(i=0; i<sort_order.length; ++i){
      donut_data.push(d[sort_order[i]]);
    }

    var counter = 1 //For space btwn donuts
    for(i=0; i<donut_data.length; i++){
      var new_dat = [];
      upper_count += donut_data[i].topic_count + counter;
      new_dat.push(lower_count);
      new_dat.push(upper_count);
      new_dat.push(donut_data[i].course);
      arc_dat.push(new_dat);
      lower_count = upper_count + counter;
    }

    radialScale.domain([0, upper_count+1]);
    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius-3).startAngle(function(d){return radialScale(d[0]);}).endAngle(function(d){return radialScale(d[1]);}) //arc func
    svg.append("g")
      // .attr("transform", "translate(" + (radius + 20) + "," + (radius + 40) + ")")
      .selectAll("path")
      .data(arc_dat)
      .enter().append("path")
      .attr("d", arc)
      .attr("class", function(d){ return "donut " + d[2] + ""})
      .style("fill", function(d){ return color(d[2]) });

    //------------------------------------------------------------------
    create_parall(parallel_data);
    create_legend();

  });

});

//------------------------Create Legend Function-------------------------------------------------------------------

function create_legend(){
  data_leg = ['Unselected', 'Course link', 'Chapter link']
  data_leg_color = ['#eee', 'blue', 'red']

  legend = d3.select("#area6 svg")
    .append("g")
    .attr('transform', 'translate(440, 35)')
    .classed("legend", true)
    .attr("class", "point")
    
  legend.selectAll('circle')
    .data(data_leg)
    .enter()
    .append('circle')
    .attr("cx", function(d, i){ return i*75})
    .attr("r", 5)
    .style("fill", function(d, i){ return data_leg_color[i] });

    legend.selectAll('text')
      .data(data_leg_color)
      .enter()
      .append('text')
      .attr("x", function(d, i){ return 8 + i*75})
      .attr("y", 4)
      .text( function(d, i) {return data_leg[i];});
}

//------------------------Mouseover & Mouseout function selections -------------------------------------------------

function mouseovered(d) {
  var linked_arr =[]
  var hyper_linked_arr =[]

  svg.selectAll(".chain").classed("chain_active", function(data){
    if (data.source.parent.name === d.parent.name) {linked_arr.push(data.target.name); return true}
    else if (data.target.parent.name === d.parent.name) {linked_arr.push(data.source.name); return true} //linked_arr.push(data.target.name);
    else return false
  });

  svg.selectAll(".chain").attr("class", function(data) {;
    if (data.source.name === d.name) {hyper_linked_arr.push(data.target.name); return "chain chain_hyperactive"}
    else if (data.target.name === d.name) {hyper_linked_arr.push(data.source.name); return "chain chain_hyperactive"} //hyper_linked_arr.push(data.target.name);
    else return "chain chain_active"
  });

  svg.selectAll(".chain").classed("chain_inactive", function(data){
    if (data.source.parent.name !== d.parent.name && data.target.parent.name !== d.parent.name) return true
      else return false
    });

  //Re-order the blue links so the ones moused over are at the front
  svg.selectAll(".chain").sort(function(a, b) {
    //Check all the hyperactive vs non-hyperactive and bring hyperactive to the front
    if( (a.source.name == d.name || a.target.name == d.name) && (b.source.name != d.name && b.target.name != d.name) ){ return 1}
    else if ( (b.source.name == d.name || b.target.name == d.name) && (a.source.name != d.name && a.target.name != d.name) ) { return -1}
    else {
      //Check all the active vs non-active and bring actives to the front
      if( (a.source.parent.name == d.parent.name || a.target.parent.name == d.parent.name) && (b.source.parent.name != d.parent.name && b.target.parent.name != d.parent.name) ){ return 1}
      else if ( (b.source.parent.name == d.parent.name || b.target.parent.name == d.parent.name) && (a.source.parent.name != d.parent.name && a.target.parent.name != d.parent.name) ) { return -1}
      else return 0;
    }
  })

  svg.selectAll(".point").each(function(n){
    hyper_linked_arr.indexOf(n.name) != -1 ? n.hyperlinked = true : n.hyperlinked = false;
    linked_arr.indexOf(n.name) != -1 ? n.linked = true : n.linked = false;
  });

  svg.selectAll(".point").classed("point_linked", function(n) { if(n.linked==true && n.hyperlinked==false) return true
       else return false })
      .classed("point_hyperlinked", function(n) { return n.hyperlinked });
}

function mouseouted(d) {

  svg.selectAll(".chain").classed("chain_active", false);
  svg.selectAll(".chain").classed("chain_hyperactive", false);
  svg.selectAll(".chain").classed("chain_inactive", false);

  svg.selectAll(".point").classed("point_linked", false);
  svg.selectAll(".point").classed("point_hyperlinked", false);
}


//------------------------GETTNG THE CORRECT DATA STRUCTURE -------------------------------------------------
d3.select(self.frameElement).style("height", diameter + "px");
 
// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};
 
  function find(name, data) {
    // console.log(name)
    var node = map[name], i;
    if (!node) { //If there is no map[name] entry then node is undefined and evaluates true
      // console.log(node)
      // console.log(data)
      // console.log(map[name])
      node = map[name] = data || {name: name, children: []}; //If node=map[name] make node equal to data, if data undefined make equal to ||
      // console.log(node)
      // console.log(name)
        if (name.length) { //When the name.length is null - have reached past the final number of dots in the line
          node.parent = find(name.substring(0, i = name.lastIndexOf("."))); //Calls find with the new name which is the old name minus last.name - NB: No data passed
          node.parent.children.push(node);
          //The previous line creates the parent-child relationship recursively
          node.key = name.substring(i + 1);
          // console.log(node.key)
        }
    }
    return node;
  }
 
 // console.log(classes)
 // console.log(classes.length)
  classes.forEach(function(d) {
    // console.log(d)
    //Function is called recursively for every line to create the hierarchy
    find(d.name, d);
  });
 
  // console.log(map[""])
  // console.log(map)
  return map[""];
}
 
// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];
 
  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });
 
  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });
  return imports;
}

//--------------------------------Create the //el Coordinate Chart----------------------------------------------------------

function create_parall(data_par){

  var margin = {top: 50, right: 10, bottom: 10, left: 10},
      width = 500 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangePoints([0, width], 1),
      y = {}
  var dragging = {};

  var line = d3.svg.line(),
      axis = d3.svg.axis().orient("left"),
      background,
      foreground;

  var svg2 = d3.select("#area7").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(data_par[0]).filter(function(d) {
      return d != "course" && (y[d] = d3.scale.linear()
          .domain(d3.extent(data_par, function(p) { return +p[d]; }))
          .range([height, 0]));
    }));

      // Add grey background lines for context.
    background = svg2.append("g")
        .attr("class", "background")
      .selectAll("path")
        .data(data_par)
      .enter().append("path")
        .attr("d", path);

    console.log(background)

    // Add blue foreground lines for focus.
    foreground = svg2.append("g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(data_par)
      .enter().append("path")
        .attr("d", path)
        .attr("stroke", function(d) { return color(d.course); })
        .on("mouseover", function(d) {highlighted(d)})
        .on("mouseout", function(d) {un_highlighted(d)});

      // Add a group element for each dimension.
    var g = svg2.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
          .origin(function(d) { return {x: x(d)}; })
          .on("dragstart", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
          })
          .on("drag", function(d) {
            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
            foreground.attr("d", path);
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
          })
          .on("dragend", function(d) {
            delete dragging[d];
            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
            transition(foreground).attr("d", path);
            background
                .attr("d", path)
              .interpolate("basis")
              .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
          }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
          d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
        })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
      return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
          extents = actives.map(function(p) { return y[p].brush.extent(); });
      foreground.style("display", function(d) {
        return actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
      });
    }

    //------Highlight functions for lines------------

    function highlighted(d){
      d3.selectAll(".chain")
        .classed("chain_active", function(dat){
          if(dat.source.parent.key == d.course || dat.target.parent.key == d.course) return true
          else false
        });
    }

    function un_highlighted(d) {
      d3.selectAll(".chain")
        .filter(function(dat){ return (dat.source.parent.key == d.course || dat.target.parent.key == d.course) })
        .classed("chain_active", false);
    }

// ------------Legend courses----------------------------------------------------------------------------

    var legend = d3.select("#area_legend")
      .append("svg").attr("height", "350").append("g")
      .attr("transform", "translate(0,70)")
      .selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", function(d){ console.log(d); return "legend " + d + ""})
      .attr("transform", function(d, i) { return "translate(100," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("class", function(d){ return "block " + d + ""})
      .style("fill", color)
      .style("stroke-width", 0)
      .style("opacity", 0.65)
      .on("mouseover", legend_highlight)
      .on("mouseout", legend_unhighlight);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .attr("transform", "translate(-12,0)")
      .text(function(d) { return d; });


  //------Highlight function for legend------------
    function legend_highlight(d){
      //Gray out all courses except the one hovered over
      d3.selectAll(".block")
        .style("fill", "#c7c7c7");
      d3.selectAll(".donut")
        .style("fill", "#c7c7c7");
      //Set chain class active
      d3.selectAll(".chain")
          .classed("chain_active", function(dat){
            if(dat.source.parent.key == d || dat.target.parent.key == d) return true
            else false
          });
      //Set //el recede class
      d3.selectAll(".foreground path")
          .classed("recede", function(dat){
          if(dat.course != d) return true
          else false
        });

      //Highlight in blue the legend for the course hovered over
      d3.selectAll(".block." + d + "")
        .style("fill", function(d) { return color(d); })
      d3.selectAll(".donut." + d + "")
        .style("fill", function(d) { return color(d[2]); })
    }

    function legend_unhighlight(d){
      //Return the legend to previous colours
      d3.selectAll(".block")
           .style("fill", color);
      d3.selectAll(".donut")
           .style("fill", function(d){ return color(d[2])});
      //Unset chain class active
      d3.selectAll(".chain")
        .filter(function(dat){ return (dat.source.parent.key == d || dat.target.parent.key == d) })
        .classed("chain_active", false);
      //Set //el recede class
      d3.selectAll(".foreground path")
        .filter(function(dat){ return (dat.course != d.course) })
        .classed("recede", false);
    }

  };

//--------------------------------Save to File Function----------------------------------------------------------
var saveToFile = function(object, filename){
  var blob, blobText;
      blobText = [JSON.stringify(object)];
      blob = new Blob(blobText, {
        type: "text/plain;charset=utf-8"
    });
  saveAs(blob, filename);
}

// -------------------------------------------------------------------------------------------------------


