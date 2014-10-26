var diameter = 900;

var margin = {top: 200, right: 120, bottom: 20, left: 120},
    width = diameter*(3/4),
    height = diameter;
    
var i = 0,
    duration = 200,
    root;

var tree = d3.layout.tree()
    .size([360, diameter / 2 ])
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

  //-----------------Function to change links to be active/inactive
d3.selectAll("tr")
  .on("mouseover", function() {
    var pref = prefix(d3.select(".position_id").html())
    var id_sel = "#" + pref + event.target.id
    d3.selectAll(id_sel).classed("active", true) })
  .on("mouseout", function() {
    var pref = prefix(d3.select(".position_id").html())
    var id_sel = "#" + pref + event.target.id
    d3.selectAll(id_sel).classed("active", false) });

  function prefix(selected){
    if(selected == "Algorithms") return "algorithm_link_"
    else if(selected == "Machine Learning") return "ml_link_"
    else return "stat_link_"
  }

  //-----------------Function to insert navigation scrolling elements
var box = d3.select("#area4").append("svg")
    box.append("path").attr("d", "M50.021,15.959c-18.779,0.002-34.001,15.224-34.001,34c0,18.779,15.221,34.002,34.001,34.001   c18.776,0,33.998-15.222,33.999-34.002C84.021,31.181,68.798,15.961,50.021,15.959z M47.684,72.107   c-0.044-0.033-0.089-0.064-0.132-0.102c-0.078-0.064-0.155-0.135-0.231-0.212c-0.003-0.002-0.006-0.006-0.008-0.008L30.324,54.798   c-1.495-1.495-1.495-3.915,0-5.411c1.493-1.493,3.915-1.493,5.408,0L46.195,59.85l-0.001-29.015   c0.001-2.113,1.714-3.826,3.826-3.826c2.111,0,3.824,1.713,3.824,3.826v29.016l10.463-10.462c1.492-1.495,3.916-1.495,5.411,0   c1.491,1.494,1.491,3.914,0,5.407L52.726,71.788c-0.081,0.083-0.16,0.154-0.243,0.221c-0.033,0.03-0.07,0.058-0.104,0.086   c-0.027,0.021-0.058,0.045-0.088,0.062c-0.634,0.472-1.416,0.752-2.269,0.754c-0.856-0.002-1.639-0.282-2.276-0.754   C47.724,72.142,47.705,72.123,47.684,72.107z").attr("transform", function(d, i) { return "translate(200, 1)"; })
       .attr("class", "scroll-link")
       .attr("data-id", "drilldown");

// console.log(d3.select(".col-md-4"));
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
d3.csv("course_hierarch2.csv", function(d) {
    data ={ "name": "", "children": [] }
    Course_arr = data.children
    Course = "Course"
    Chapter = "Chapter"
    Topic = "Topic"
    Avg_hour = "Avg_hours"
    max__hour_chapter = 0;
    max__hour_course = 0;

  // Creating the course array
  d.map(function(dat, id){

      if(child_exist(Course_arr, dat[Course])){ //JQuery expression checking -- doesn't exist
        if(parseFloat(dat.Course_hour) > max__hour_course) max__hour_course = parseFloat(dat.Course_hour);
        Course_info = {"name": dat[Course], "_hour": dat.Course_hour, "children": []}
        Course_arr.push(Course_info)
      }

      Course_id = findByVal(Course_arr, dat[Course])
      Chapter_arr = Course_arr[Course_id].children
      if(parseFloat(dat.Chap_hour) > max__hour_chapter) max__hour_chapter = parseFloat(dat.Chap_hour);
      if(child_exist(Chapter_arr, dat[Chapter])){
        Chapter_info = {"name": dat[Chapter], "_hour": dat.Chap_hour, "children": []}
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
  overall_sum(); //Initialise the Summary Function
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

    console.log(max__hour_chapter);
    console.log(max__hour_course);

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
      .data(nodes, function(d) {
                                if(d.depth==1) {
                                  if(d._hour === "") d.hour = 10; //This is the default applied for Machine Learning and CS106A
                                  else  d.hour = (d._hour/max__hour_course)*15;
                                }
                                if(d.depth==2){
                                  if(d._hour === "") d.hour = 6; //This is the default applied for Machine Learning and CS106A
                                  else d.hour = (d._hour/max__hour_chapter)*7.5;
                                }
                                // d.hour = Math.random()*10;
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

    //-----------------Function to initiate tooltip
  
  var tooltip = d3.select("#area1 svg")
    .append("g")
    .attr("transform", "translate(5, 40)")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .append("text")
    .text("a simple tooltip")

    d3.select("#area1 svg")
    .append("image")
    .attr("xlink:href", "http://www.e-pint.com/epint.jpg")
    .attr("width", "40")
    .attr("height", "40")
    .attr("x", "100")
    .attr("y", "20")
    .style("visibility", "hidden");

  function choose_image(param){
    name_array = ["CS106B", "CS171", "CS109", "Machine Learning", "Stats 110", "Statistics Udacity", "Stanford Databases", "NLP", "Probabilistic Sys", "CS106A"]
    link_array = ["http://www.e-pint.com/epint.jpg", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcToBbL1it11FIW3cMZyLA4e1m5MBcW6Zz4EdAjK9lRIJUw--lM-","http://www.e-pint.com/epint.jpg", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcToBbL1it11FIW3cMZyLA4e1m5MBcW6Zz4EdAjK9lRIJUw--lM-","http://www.e-pint.com/epint.jpg", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcToBbL1it11FIW3cMZyLA4e1m5MBcW6Zz4EdAjK9lRIJUw--lM-","http://www.e-pint.com/epint.jpg", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcToBbL1it11FIW3cMZyLA4e1m5MBcW6Zz4EdAjK9lRIJUw--lM-","http://www.e-pint.com/epint.jpg", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcToBbL1it11FIW3cMZyLA4e1m5MBcW6Zz4EdAjK9lRIJUw--lM-"]
    index = name_array.indexOf(param.name)
    return link_array[index];
  }

  function create_line(){
    var m = d3.mouse(this);
    x0 = d3.event.pageX-20;
    y0 = d3.event.pageY-75;
    var param = d3.select(this).data()[0];
    if(d3.select(this).data()[0].depth==1){
      tooltip_line = d3.select("#area1 svg").append("path")
        .attr("d", "M" + x0 + " " + y0 + " v -30" + " L 160 40 h -20")
        .attr("class", "tooltip_line")
        .attr("width", "10");

      tooltip.style("visibility", "visible");
      d3.select("svg image")
        .attr("xlink:href", choose_image(param))
        .style("visibility", "visible");
    }
  }

  function remove_line(){
    d3.selectAll(".tooltip_line").remove()
    tooltip.style("visibility", "hidden");
    d3.select("svg image").style("visibility", "hidden");
  }

  d3.selectAll("circle")
    .on("mouseover", create_line)
    .on("mouseout", remove_line)
    // .on("mouseover", mouseover);

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
      .style("stroke-width", function(d) {return d.target.hour; });


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
  story_1 = [53, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169];
  story_2 = [118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140];
  story_3 = [76, 82, 83, 85, 89, 91, 92, 100, 185, 186, 187, 188, 189, 190];
  stat_array = story_1.concat(story_2, story_3);
  expan_arr = [118, 153, 76, 185]; //The array of nodes to expand
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
  setTimeout(link_wrapper("stat_link", story_1, story_2, story_3, stat_sum), 500)
}

function algo_expand(){
  story_1 = [2, 5, 6, 7, 20, 21, 22, 23, 24, 25, 26];
  story_2 = [28, 30, 31, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
  story_3 = [];
  expan_arr = [2, 28];
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
  setTimeout(link_wrapper("algorithm_link", story_1, story_2, story_3, alg_sum), 500);
}

function ml_expand(){
  story_1 = [103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117];
  story_2 = [178, 179, 180, 181, 182, 183, 184];
  story_3 = [76, 102, 94, 88, 85, 86];
  ml_array = story_1.concat(story_2, story_3);
  expan_arr = [103, 178, 76];
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
  overall_sum();
}


//--------------------------------Timer functions----------------------------------------------------------

  //This is the wrapper function that creates the varies stories on a timer
  function link_wrapper(name, story_1, story_2, story_3, summary_func){

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
          if(counter < story_arrs.length) setTimeout(link_change, 500);
      }
      link_change(story_arrs, story_strs); // Call the function defined above
  }

//--------------------------------SUMMARY FUNCS----------------------------------------------------------

function stat_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Statistics");
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_green"><rect width="25" height="8"></rect></svg>25%</em><h6><font color="green">Overview of statistical inference</font></h6><br/>Udacity Statistics: Summary Statistics, Experiemntal Design, Hypothesis Tesing</div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_green"><rect width="75" height="8"></rect></svg>50%</em><h6><font color="green">Theory of probability and statics</font></h6><br/>Statistics Harvard: Probability, Random Variables, Distributions, Markov Chains</div>');
  } else {
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_green"><rect width="100" height="8"></rect></svg>100%<br/><h6><font color="green">Application of statistical models and inference</font></h6>Proabilistic Systems & CS171: Classical Inference, Bayesian Inference, Sampling, Statistical Modelling, MCMC</div>');
  }
}

function alg_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Algorithms");
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_red"><rect width="25" height="8"></rect></svg>25%</em><h6><font color="red">Introduction to Algorithms</font></h6><br/>CS106A: Repeatable Solutions, Efficiency</div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_red"><rect width="75" height="8"></rect></svg>50%</em><h6><font color="red">Algorithm Design and Efficiency</font></h6><br/>CS106B: Algorithm Design, Algorithm Efficiency & Appliation</div>');
  } else {
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_red"><rect width="100" height="8"></rect></svg>100%<br/><h6><font color="red">Algorithms in the Wild</font></h6>Application in Courses: </div>');
  }
} 

function ml_sum(counter){
  if(counter==1){
    d3.select(".position_id").html("Machine Learning");
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_blue"><rect width="25" height="8"></rect></svg>25%</em><h6><font color="blue">Machine Learning Course</font></h6>Stanford Machine Learning: Regression, Bias-Variance, CrossValidation, Neural Networks, SVM, Clustering</div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_blue"><rect width="75" height="8"></rect></svg>50%</em><h6><font color="blue">Application the the Language Problem</font></h6>Columbia Natural Language Processing: PCFGs, Hidden Markov Models</div>');
  } else {
    d3.select("#story_"+counter).html('<div><svg width="150" height="10" class="percentage_blue"><rect width="100" height="8"></rect></svg>100%<br/><h6><font color="blue">Experimenting with Machine Learning</font></h6>Harvard Data Science: Clustering, Regression, Parameters & Hyper-Parameters, ML Algorithms</div>');
  }
}

function overall_sum(){
  if (!$('#story_1 .explain').length > 0) { // JQuery method of checking if an element exists - This only runs at beginning
    var circles = d3.select("#story_1").append("svg").attr("class", "explain"); 
    circles.append("circle").attr("r", "80").attr("cx", "70").attr("cy", "60").attr("opacity", "0.15");
    circles.append("circle").attr("r", "50").attr("cx", "70").attr("cy", "60").attr("opacity", "0.15");
    circles.append("circle").attr("r", "20").attr("cx", "70").attr("cy", "60").attr("opacity", "0.15");
    guide_draw();
  }
  if (!$('#story_2 .explain').length > 0) {
    d3.select("#story_2").append("svg").attr("class", "explain"); // JQuery method of checking if exists - same as above
  }
    $("#story_1 > div").remove(); // JQuery remove the other elements which may be in the dom
    $("#story_2 > div").remove(); // JQuery remove the other elements which may be in the dom
    $("#story_3 > div").remove(); // JQuery remove the other elements which may be in the dom
    guide_draw();
}

function guide_draw(){
  data = {"name": "Data Science", "children": [{"name": "Course", "children": [{"name": "Chapter"}] }] } //Create Data for examle Diagram
  var small_tree = d3.layout.tree() //Create tree ayout for example diagram
    .size([360, 50])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  var nodes = small_tree.nodes(data),
      links = small_tree.links(nodes);
  nodes.forEach(function(d) {d.y = d.depth * 25; });
  var node = d3.select("#story_1 svg").selectAll("g.small_node")
               .data(nodes).enter().append("g")
               .attr("transform", "translate(70, 60)")
               .attr("class", "small_node");
           node.append("circle")
               .attr("r", "4")
               .attr("transform", function(d) { return "translate(" + d.y +"," + d.depth*20 + ")"; });
           node.append("text")
               .attr("x", function(d) { return d.y; })
               .attr("y", function(d){ return 10 + d.depth*20 })
               .attr("dy", ".25em")
               .text(function(d) { return d.name; });

  var points = [[10, 10], [10,20], [150, 20], [150, 30]];
  var link = d3.select("#story_2 svg").attr("height", "100").append("path")
        .data([points])
        .attr("class", "new_link")
        .attr("d", d3.svg.line()
        .tension(0)
        .interpolate("basis"));

        d3.select("#story_2 svg").append("text")
        .text("Width ~ 1.5")
        .attr("transform", "translate(170, 30)");

  d3.select("#story_2 svg").append("path").attr("transform", "translate(0, 50)")
      .data([points])
      .attr("class", "new_link")
      .attr("d", d3.svg.line()
      .tension(0)
      .interpolate("basis"))
      .style("stroke-width", "5");

      d3.select("#story_2 svg").append("text")
      .text("Width ~ 5")
      .attr("transform", "translate(170, 80)");
}


//--------------------------------Expand Functions----------------------------------------------------------

function mouseover() {
    data = d3.select(this).data()[0];
    div.html(data.name + "<br/>"  + data.id)
}

function mousemove() {
}

function mouseout() {
    div.style("opacity", 1);
}






