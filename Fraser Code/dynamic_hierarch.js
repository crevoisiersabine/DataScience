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
    .attr("transform", "translate(" + diameter*(3/8) + "," + diameter*(3/8) + ")");
    // .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    // .on("mouseout", mouseout);

var div = d3.select(".position_id");

d3.selectAll("tr td")
  .on("mouseover", function() {
    var pref = prefix(d3.select(".position_id").html())
    var id_sel = "#" + pref + event.target.id
    d3.selectAll(id_sel).classed("active", true) })
  .on("mouseout", function() {
    var pref = prefix(d3.select(".position_id").html())
    var id_sel = "#" + pref + event.target.id
    d3.selectAll(id_sel).classed("active", false) });

  function prefix(selected){
    if(selected == "Algorithms") return "alg_link_"
    else if(selected == "Machine Learning") return "ml_link_"
    else return "stat_link_"
  }

//     .attr("class", "tooltip")
//     .append("h4").text("Detailed Tooltip");
    // .attr("transform", "translate(" + diameter*(1/4) + "," + diameter*(1/4) + ")");            
    // .style("opacity", 0);

    // svg.append("rect")
    // .attr("x", diameter/2 - 120)
    // .attr("y", -diameter/4)
    // .attr("width", 60)
    // .attr("height", 20);

//--------------------------------------------LOADING DATA FUNC----------------------------------------------------
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


  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  update(root); //Initial setup;
  d3.select(self.frameElement).style("height", "800px");
});

//--------------------------------If Child Exists-----------------------------------------------------
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

//--------------------------------Find array element---------------------------------------------------------
  //Find correct array element
  function findByVal(arr_check, Value) {
      for (var i = 0; i < arr_check.length; i++) {
        if (arr_check[i].name === Value) {
            return i;
        }
      }
  }
//--------------------------------Update tree func---------------------------------------------------------

function update(source, class_used, class_array) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

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
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; }); //Fill depending on whether clicked or not

  nodeEnter.append("text")
      .attr("x", 10)
      .attr("dy", ".35em")
      .attr("class", function(d) { return d.depth == 1 ? "inner_text" : "outer_text"; })
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
  //Change the class of links
  if (typeof class_used !== 'undefined') { //If the class argument has been passed variable is not undefined
    svg.selectAll("path").filter(function(d) { return class_array.indexOf(d.target.id)!=-1})
    .attr("class", class_used);
  }

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
}

//--------------------------CLICK FUNCTIONS--------------------------------------------------------------
// Node toggle on click
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


function story_click() {
  console.log("here");
  check = d3.select(this)
  console.log(check);
  console.log(event.target.id); //This is the jquery way to get the id that triggered event
  d = svg.selectAll("g.node").data()[0];
  collapse1(d);
  setTimeout(collapse2, 1000); //Delay between collapsing first and second row

  if(event.target.id === 'Statistics') setTimeout(stat_expand, 2000); //Note due to javascript concurrency func called 1000ms after above
  else if(event.target.id === 'Algorithms') setTimeout(algo_expand, 2000);
  else if(event.target.id === 'Machine') setTimeout(ml_expand, 2000);
  else setTimeout(expand_all, 2000);
  //     data = d3.select(this).data()[0];
  //   // div.style("opacity", 1)
  //   //     .html(data.name + "<br/>"  + data.id);
  //   div.html(data.name + "<br/>"  + data.id)

  // var div = d3.select(".btn");

  //   var nodeEnter = node.enter().append("g")
  //     .attr("class", "node")
  //     .on("click", click);
}

d3.selectAll(".btn").on("click", story_click);

//--------------------------------Collapse Functions----------------------------------------------------------
function collapse1(d) {
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
  d._children = d.children;
  d.children = null;
  update(d)
}

//--------------------------------Expand Functions----------------------------------------------------------

function stat_expand(){
  story_1 = [118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140];
  story_2 = [53, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169];
  story_3 = [76];
  stat_array = story_1.concat(story_2, story_3);
  expan_arr = [118, 153, 76]; //The array of nodes to expand
  var d = svg.selectAll("g.node").data()[0]; //This select the data associated with the base node

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){ //For all of the children of lowest level
    if(expan_arr.indexOf(dat.id) != -1){ //Dictates the nodes within the first level to expand
      if(!dat.children){ //If children are null
        dat.children = dat._children; //if data.children null then make equal to data._children
        dat._children = null;
      }
    }
  })
  update(d, "stat_link", stat_array);
      //Call timer function (specific arg passed)
      // timer_collapse(0);
      //Timer function calls a function to change the links

  setTimeout(link_wrapper("stat_link", story_1, story_2, story_3, stat_sum), 500)
  //Update the text in the summary to correspond to the links
}

function algo_expand(){
  story_1 = [2, 28];
  story_2 = [24, 25, 26];
  story_3 = [76, 103, 178];
  expan_arr = [2, 28, 76, 103, 178];
  algo_array = story_1.concat(story_2, story_3);
  var d = svg.selectAll("g.node").data()[0];

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){

    if(expan_arr.indexOf(dat.id) != -1){
      if(!dat.children){
        dat.children = dat._children;
        dat._children = null;
      }
    }
  })
  update(d, "algorithm_link", algo_array);
      //Call timer function (specific arg passed)
      //Timer function calls a function to change the links
  setTimeout(link_wrapper("algorithm_link", story_1, story_2, story_3, alg_sum), 500);
      //Update the text in the summary to correspond to the links
}

function ml_expand(){
  story_1 = [2, 28];
  story_2 = [24, 25, 26];
  story_3 = [76, 103, 178];
  ml_array = story_1.concat(story_2, story_3);
  expan_arr = [2, 28, 76, 103, 178];
  var d = svg.selectAll("g.node").data()[0];

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){

    if(expan_arr.indexOf(dat.id) != -1){
      if(!dat.children){
        dat.children = dat._children;
        dat._children = null;
      }
    }
  })
  update(d, "ml_link", ml_array);
  setTimeout(link_wrapper("ml_link", story_1, story_2, story_3, ml_sum), 500)
}

function expand_all(){
  var d = svg.selectAll("g.node").data()[0];

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){
    dat.children = dat._children;
    dat._children = null;
  })
  update(d);
}


//--------------------------------Timer functions----------------------------------------------------------

  //This is the wrapper function that creates the varies stories on a timer
  function link_wrapper(name, story_1, story_2, story_3, summary_func){

      console.log(name)
      console.log(story_1)
      console.log(story_2)
      console.log(story_3)

      var story_arrs = [story_1, story_2, story_3];
      var story_strs = ["_story_1", "_story_2", "_story_3"];
      var counter = 0;

      function link_change(){
          svg.selectAll("path").filter(function(d) { return story_arrs[counter].indexOf(d.target.id)!=-1})
              .attr("id", name + story_strs[counter]) //Change id associated with links
              .classed("active", true); //Make links active
          counter++; //Update the counter

          summary_func(counter); //This is the function which updates the summary text

          if(counter!=0) {
            svg.selectAll("#" + name + story_strs[counter - 2]).classed("active", false); //Make old links inactive
          }
          if(counter < story_arrs.length) setTimeout(link_change, 1000);
      }
      link_change(story_arrs, story_strs); // Call the function defined above
  }

//--------------------------------SUMMARY FUNCS----------------------------------------------------------

function stat_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Statistics");
  }
  d3.select("#story_"+counter).html("trial" + "<br/>"  + "trial");
}

function alg_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Algorithms");
  }
  d3.select("#story_"+counter).html("what" + "<br/>"  + "what");
}

function ml_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Machine Learning");
  }
  d3.select("#story_"+counter).html("trial" + "<br/>"  + "trial");
}


//--------------------------------Expand Functions----------------------------------------------------------

function mouseover() {
  // div.transition()
      // .duration(500)
    data = d3.select(this).data()[0];
    // div.style("opacity", 1)
    //     .html(data.name + "<br/>"  + data.id);
    div.html(data.name + "<br/>"  + data.id)
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







