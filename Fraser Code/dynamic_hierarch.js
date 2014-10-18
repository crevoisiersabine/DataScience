var diameter = 900;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = diameter*(3/4),
    height = diameter;
    
var i = 0,
    duration = 200,
    root;

var tree = d3.layout.tree()
    .size([360, diameter / 2 - 80])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return d.depth != 2 ?[d.y, d.x / 180 * Math.PI] : [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("#area1").append("svg")
    .attr("width", width )
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + diameter*(5/16) + "," + diameter*(3/8) + ")");
    // .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    // .on("mouseout", mouseout);

var div = d3.select("panel-body");

//     .attr("class", "tooltip")
//     .append("h4").text("Detailed Tooltip");
    // .attr("transform", "translate(" + diameter*(1/4) + "," + diameter*(1/4) + ")");            
    // .style("opacity", 0);

    // svg.append("rect")
    // .attr("x", diameter/2 - 120)
    // .attr("y", -diameter/4)
    // .attr("width", 60)
    // .attr("height", 20);

//-----------------------------------------------------------------------------------------------------------

d3.csv("course_hierarch.csv", function(d) {
    data ={ "name": "", "children": [] }
    Course_arr = data.children
    Course = "Course"
    Chapter = "Chapter"
    Topic = "Topic"
    Avg_hour = "Avg_hours"
    // Curr_chapter = ""
    // Curr_course = "CS106A"
    // hours_course = []
    // course_sum = 0;
    // hours_chap = []
  // Creating the course array
  d.map(function(dat, id){
    //This piece of code stores the hour arrays which we will need to associate with the links
      // if(dat.Avg_hours!=undefined && dat.Chapter!=Curr_chapter) {
      //   hours_chap.push(dat.Avg_hours);
      //   course_sum+=parseFloat(dat.Avg_hours);
      // }
      // Curr_chapter = dat.Chapter

      // if(dat.Avg_hours!=undefined && dat.Course!=Curr_course){ hours_course.push(course_sum)};  
      // Curr_course = dat.Course
      // console.log(dat);

      if(child_exist(Course_arr, dat[Course])){ //JQuery expression checking -- doesn't exist
        Course_info = {"name": dat[Course], "children": []}
        Course_arr.push(Course_info)
      }

      Course_id = findByVal(Course_arr, dat[Course])
      Chapter_arr = Course_arr[Course_id].children
      if(child_exist(Chapter_arr, dat[Chapter])){
        Chapter_info = {"name": dat[Chapter], "children": []}
        Chapter_arr.push(Chapter_info)
      }

      // Chapter_id = findByVal(Chapter_arr, dat[Chapter])
      // Topic_arr = Chapter_arr[Chapter_id].children
      // if(child_exist(Topic_arr, dat[Topic])){
      //   Topic_info = {"name": dat[Topic], "children": []}
      //   Topic_arr.push(Topic_info)
      // }
  })

  // console.log(hours_course)
  // console.log(hours_course.length)
  // console.log(hours_chap)
  // console.log(hours_chap.length)
  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  update(root); //Initial setup;
  d3.select(self.frameElement).style("height", "800px");
  // timeFunction();

  var time_funcs = [collapse1, collapse2, expand1, collapse1, collapse2, expand2],
      timer = 0;
  var delays = [250, 1000, 5000, 250, 1000]

  function callFuncs() {
    if(timer==0 || timer==3) {
      d = svg.selectAll("g.node").data()[0];
      console.log(timer);
      console.log(d);
      collapse1(d);
      timer++;
    } else {
      console.log(timer);
      time_funcs[timer++]();
      console.log(timer);
    }

    if (timer < time_funcs.length) setTimeout(callFuncs, delays[timer-1]); //Pause timer before calling next func
  }

  setTimeout(callFuncs, 4000); //delay start 1 sec.

});

//-----------------------------------------------------------------------------------------------------------
  //Check if child exists function
  function child_exist(arr_check, data){
    if(arr_check.length == 0){
      return true //i.e. array is empty so push
    }
    for (var i=0; i<arr_check.length; i++){
      if(arr_check[i].name == data){
        return false;
      }
    }
    return true; //i.e. doesn't exist
  }

//-----------------------------------------------------------------------------------------------------------
  //Find correct array element
  function findByVal(arr_check, Value) {
      for (var i = 0; i < arr_check.length; i++) {
        if (arr_check[i].name === Value) {
            return i;
        }
      }
  }
//-----------------------------------------------------------------------------------------------------------

function update(source, class_used, class_array) {

  // Default argument color
  // typeof b !== 'undefined'

  // Compute the new tree layout.
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

  // console.log(nodes)

  // This defines the y value, the different radii of the plot disks
  nodes.forEach(function(d) { d.y = d.depth * 100; });

      //----------------------------------------
  // UPDATE THE NODES NB: Uses Generate/Update Pattern
  //The function call in data returns a unique id if it exists or defines one if it does not. This is called a key function
  //The selection node is the update selection this is the selection which persists across the transition
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { d.hour = Math.random()*10;

// return (n = 9 * Math.ceil(Math.random())) === 3? 10: n;
// d.id%2 !=0 ? d.hour = 2: d.hour = 4;
                                // console.log(i);
                                return d.id || (d.id = ++i); })

      //----------------------------------------
  // ENTER NEW NODES - at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      // .attr("transform", function(d) { console.log(d.id); return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; }); //Fill depending on whether clicked or not

  nodeEnter.append("text")
      .attr("x", 10)
      .attr("dy", ".35em")
      .attr("class", function(d) { return d.depth == 1 ? "inner_text" : "outer_text"; })
      // .attr("text-anchor", function(d) { return d.x < 180? "start" : "end"; })
      // .attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + 20 + ")"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name.length * 8.5)  + ")"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);


      //----------------------------------------
  // TRANSITION NODES to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + 20 + ")"; })
      // .attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + 20 + ")"; });

  nodeUpdate.select(".inner_text")
      .attr("text-anchor", function(d) { return d.x < 180? "end" : "start"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(-20)" : "rotate(180)"; })    

  d3.selectAll("circle")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

      //----------------------------------------
  // EXIT NODES - TODO: appropriate transform
  var nodeExit = node.exit().transition()
      .duration(duration)
      //.attr("transform", function(d) { return "diagonal(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

      //----------------------------------------
  // UPDATE LINKS - Update the links…
  var link = svg.selectAll("path")
      .data(links, function(d) { return d.target.id; });
      // .style("stroke-width", function(d) { console.log(d); return d.target.hour; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", function(d) { return d.source.depth == 0 ? "link" : "new_link"; })
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .style("stroke-width", function(d) { return d.target.hour; });


  // Transition links to their new position & change class to tell the stories
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  if (typeof class_used !== 'undefined') { //If the class argument has been passed
      // variable is undefined
    svg.selectAll("path").filter(function(d) { return class_array.indexOf(d.target.id)!=-1})
    .attr("class", class_used);
  }

  // svg.selectAll("path")
  //     .attr("class", function(d) { return stat_array.indexOf(d.target.id)!=-1 ? class_used: this.className.baseVal});

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y}; //o define the origin
        // console.log(o);
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });


  // console.log(svg.selectAll("g.node")[0]);
}

//-----------------------------------------------------------------------------------------------------------
// Toggle children on click.
function click(d) {
  if (d.children) { //If children is not null, stores this in a temp variable and sets children to null
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children; //If children is null then set it to the stored value and then set store to null
    d._children = null;
  }
  
  update(d);
}

//--------------------------------Collapse Functions----------------------------------------------------------
function collapse1(d) {
  // console.log(d)
  if(d.depth == 0){
    for(i=0; i<d.children.length; i++)
      collapse1(d.children[i]);
//     d.children.forEach(collapse1)
  } else {
    if(!d._children){ //Only change storage id d._children set to null;
      d._children = d.children;
      d.children = null;
    }
    update(d)
  }
}

function collapse2(){
  var d = svg.selectAll("g.node").data()[0];
  // console.log(d)
  d._children = d.children;
  d.children = null;
  update(d)
}

//--------------------------------Expand Function----------------------------------------------------------

function expand1(){
  stat_array = [118, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 76];
  expan_arr = [118, 153, 76]; //The array of nodes to expand
  var d = svg.selectAll("g.node").data()[0]; //This select the data associated with the base node
  // console.log(d)

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){ //For all of the children of lowest level
    // console.log(dat.children)
    // console.log(dat._children)
    if(expan_arr.indexOf(dat.id) != -1){ //Dictates the nodes within the first level to expand
      // console.log(dat.id);
      if(!dat.children){ //If children are null
        dat.children = dat._children; //if data.children null then make equal to data._children
        dat._children = null;
      }
    }
  })
  update(d, "stat_link", stat_array);
}

function expand2(){
  algo_array = [2, 28, 76, 103, 178, 24, 25, 26];
  expan_arr = [2, 28, 76, 103, 178];
  var d = svg.selectAll("g.node").data()[0];

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){
    // console.log(dat.children)
    // console.log(dat._children)
    if(expan_arr.indexOf(dat.id) != -1){
      // console.log(dat.id);
      if(!dat.children){
        dat.children = dat._children;
        dat._children = null;
      }
    }
  })
  update(d, "algorithm_link", algo_array);
}


function mouseover() {
  // div.transition()
      // .duration(500)
    data = d3.select(this).data()[0]
    console.log(data)
    div.style("opacity", 1)
        .html(data.name + "<br/>"  + data.id);
}

function mousemove() {
  // div
  //     .text(d3.event.pageX + ", " + d3.event.pageY)
      // div.text(d3.select(this).data());


      // enter().append("text")
      //       .text(function(d) {return d})
      // .style("left", (d3.event.pageX - 34) + "px")
      // .style("top", (d3.event.pageY - 12) + "px");
}

function mouseout() {
  // div.transition()
      // .duration(500)
    div.style("opacity", 1);
}







