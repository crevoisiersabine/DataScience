var diameter = 960;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = diameter,
    height = diameter;
    
var i = 0,
    duration = 500,
    root;

var tree = d3.layout.tree()
    .size([360, diameter / 2 - 80])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return d.depth != 2 ?[d.y, d.x / 180 * Math.PI] : [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("body").append("svg")
    .attr("width", width )
    .attr("height", height )
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    svg.append("rect")
    .attr("x", diameter/2 - 120)
    .attr("y", -diameter/4)
    .attr("width", 60)
    .attr("height", 20);

//-----------------------------------------------------------------------------------------------------------

d3.csv("course_hierarch.csv", function(d) {
    stat_array = [2, 76, 153];
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

  var time_funcs = [collapse1, collapse2, expand1],
      timer = 0;
  var delays = [500, 2000, 1000]

  function callFuncs() {
    if(timer==0) {
      d = svg.selectAll("g.node").data()[0];
      collapse1(d);
      timer++;
    } else {
      time_funcs[timer++]();
    }
      if (timer < time_funcs.length) setTimeout(callFuncs, delays[timer-1]);
  }

  setTimeout(callFuncs, 5000); //delay start 1 sec.

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

function update(source, class_used) {

  // Default argument color
  // typeof b !== 'undefined'

  // Compute the new tree layout.
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

  // console.log(nodes)

  // This defines the y value, the different radii of the plot disks
  nodes.forEach(function(d) { d.y = d.depth * 120; });

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
      .attr("class", function(d) { return stat_array.indexOf(d.target.id)!=-1 ? class_used: this.className.baseVal})
      .attr("d", diagonal);

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
  if(d.depth == 0){
    d.children.forEach(collapse1)
  } else {
    d._children = d.children;
    d.children = null;
    update(d)
  }
}

function collapse2(){
  var d = svg.selectAll("g.node").data()[0];
  console.log(d)
  d._children = d.children;
  d.children = null;
  update(d)
}

//--------------------------------Expand Function----------------------------------------------------------


function expand1(){
  expan_arr = [2, 76, 153];
  var d = svg.selectAll("g.node").data()[0];
  // console.log(d);
  // console.log(d._children);
  d._children.forEach(function(data){
  d.children = d._children;
    if(expan_arr.indexOf(data.id) != -1){
      console.log(data.id);
      data.children = data._children
    }
  })
  update(d, "stat_link");
}








