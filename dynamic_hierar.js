var diameter = 900;

var margin = {top: 200, right: 120, bottom: 20, left: 120},
    width = diameter*(7/8),
    height = diameter;
    
var i = 0,
    duration = 200,
    root;

var tree = d3.layout.tree()
    .size([360, diameter / 2 ])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return d.depth != 2 ?[d.y, d.x / 180 * Math.PI] : [d.y, d.x / 180 * Math.PI]; });

//-----------------Function to initiate tooltip
  
  var tooltip = d3.select("#area1")
    .append("div").attr("class", "tooltipBox")
    .style("opacity", 0); 


var svg_1 = d3.select("#area1").append("svg")
    .attr("width", width )
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + diameter*(3/8) + "," + diameter*(3/8) + ")");

  //-----------------Function to change links to be active/inactive
$("tr").hover(enter, leave);

function enter(){
  var storyNum = this.children[0].id;
  var active_button = $('.navigation .active')[0].id;
  var pref = prefix(active_button)
  var id_sel = "#" + pref + storyNum;
  d3.selectAll(id_sel).classed("active", true);
};
function leave(){
    var storyNum = this.children[0].id;
    var active_button = $('.navigation .active')[0].id;
    var pref = prefix(active_button)
    var id_sel = "#" + pref + storyNum;
    d3.selectAll(id_sel).classed("active", false)
  };

  function prefix(selected){
    if(selected == "Algorithms") return "algorithm_link_"
    else if(selected == "Machine") return "ml_link_"
    else return "stat_link_"
  }

//   //-----------------Function to insert navigation scrolling elements
// var box = d3.select("#area4").append("svg").attr("class", "arrow")
//     box.append("path").attr("d", "M50.021,15.959c-18.779,0.002-34.001,15.224-34.001,34c0,18.779,15.221,34.002,34.001,34.001   c18.776,0,33.998-15.222,33.999-34.002C84.021,31.181,68.798,15.961,50.021,15.959z M47.684,72.107   c-0.044-0.033-0.089-0.064-0.132-0.102c-0.078-0.064-0.155-0.135-0.231-0.212c-0.003-0.002-0.006-0.006-0.008-0.008L30.324,54.798   c-1.495-1.495-1.495-3.915,0-5.411c1.493-1.493,3.915-1.493,5.408,0L46.195,59.85l-0.001-29.015   c0.001-2.113,1.714-3.826,3.826-3.826c2.111,0,3.824,1.713,3.824,3.826v29.016l10.463-10.462c1.492-1.495,3.916-1.495,5.411,0   c1.491,1.494,1.491,3.914,0,5.407L52.726,71.788c-0.081,0.083-0.16,0.154-0.243,0.221c-0.033,0.03-0.07,0.058-0.104,0.086   c-0.027,0.021-0.058,0.045-0.088,0.062c-0.634,0.472-1.416,0.752-2.269,0.754c-0.856-0.002-1.639-0.282-2.276-0.754   C47.724,72.142,47.705,72.123,47.684,72.107z").attr("transform", function(d, i) { return "translate(200, 1)"; })
//        .attr("class", "scroll-link")
//        .attr("data-id", "drilldown");

//--------------------------------------------LOADING DATA FUNC----------------------------------------------------
d3.csv("course_hierarchy.csv", function(d) {

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

  // Compute the new tree layout.
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

  // This defines the y value, the different radii of the plot disks
  nodes.forEach(function(d) { d.y = d.depth * 100; });

      //----------------------------------------
  // UPDATE THE NODES NB: Uses Generate/Update Pattern
  //The function call in data returns a unique id if it exists or defines one if it does not. This is called a key function
  //The selection node is the update selection this is the selection which persists across the transition
  var node = svg_1.selectAll("g.node")
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
      .style("fill", function(d) { return d._children ? "steelblue" : "#fff"; }); //Fill depending on whether clicked or not

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
      .style("fill", function(d) { return d._children ? "steelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + 20 + ")"; })

  nodeUpdate.select(".inner_text")
      .attr("text-anchor", function(d) { return d.x < 180? "end" : "start"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(-20)" : "rotate(180)"; })    

  //   //-----------------Function to initiate tooltip

  function choose_image(param){
    name_array = ["ProgAbstractions", "Visualisation", "DataScience", "MachineLearning", "Stats110", "StatsUdacity", "Databases", "NatLangProcessing", "StatsInference", "ProgMethodology"]
    link_array = ["Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg", "Cambridge.jpg"]
    // link_array = ["https://lh3.googleusercontent.com/-IT2yFdNVDK8/TrhNrYrH4jI/AAAAAAAAASM/tSO9I_MXceQ/w482-h481-no/SU_BlockStree_2colorjpg300px.jpg", "http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Harvard_Wreath_Logo_1.svg/193px-Harvard_Wreath_Logo_1.svg.png", "http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Harvard_Wreath_Logo_1.svg/193px-Harvard_Wreath_Logo_1.svg.png", "https://lh3.googleusercontent.com/-IT2yFdNVDK8/TrhNrYrH4jI/AAAAAAAAASM/tSO9I_MXceQ/w482-h481-no/SU_BlockStree_2colorjpg300px.jpg", "http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Harvard_Wreath_Logo_1.svg/193px-Harvard_Wreath_Logo_1.svg.png", "https://pbs.twimg.com/profile_images/2671170543/18debd694829ed78203a5a36dd364160.png", "https://lh3.googleusercontent.com/-IT2yFdNVDK8/TrhNrYrH4jI/AAAAAAAAASM/tSO9I_MXceQ/w482-h481-no/SU_BlockStree_2colorjpg300px.jpg","http://www.e-pint.com/epint.jpg", "https://lh3.googleusercontent.com/-IT2yFdNVDK8/TrhNrYrH4jI/AAAAAAAAASM/tSO9I_MXceQ/w482-h481-no/SU_BlockStree_2colorjpg300px.jpg", "https://lh3.googleusercontent.com/-IT2yFdNVDK8/TrhNrYrH4jI/AAAAAAAAASM/tSO9I_MXceQ/w482-h481-no/SU_BlockStree_2colorjpg300px.jpg"]
    index = name_array.indexOf(param.name)
    return link_array[index];
  }

  function choose_text(param){
    name_array = ["ProgAbstractions", "Visualisation", "DataScience", "MachineLearning", "Stats110", "StatsUdacity", "Databases", "NatLangProcessing", "StatsInference", "ProgMethodology"]
    link_array = ["Programming Abstractions in C++", "Visualisation", "Data Science", "Machine Learning", "Statistics 110", "Statistics", "Databases", "Natural Language Processing", "Probabilistic Systems Analysis and Applied Probability", "Programming Methodology in Java"]
    index = name_array.indexOf(param.name)
    return link_array[index];
  }

  function choose_link(param){
    name_array = ["ProgAbstractions", "Visualisation", "DataScience", "MachineLearning", "Stats110", "StatsUdacity", "Databases", "NatLangProcessing", "StatsInference", "ProgMethodology"]
    link_array = ["http://see.stanford.edu/see/courseinfo.aspx?coll=11f4f422-5670-4b4c-889c-008262e09e4e", "http://www.cs171.org/#!index.md", "http://cs109.github.io/2014/", "https://www.coursera.org/course/ml", "http://projects.iq.harvard.edu/stat110/home", "https://www.udacity.com/course/st095", "https://www.coursera.org/course/db", "https://www.coursera.org/course/nlangp", "http://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/readings/", "http://see.stanford.edu/see/courseinfo.aspx?coll=824a47e1-135f-4508-a5aa-866adcae1111"]
    index = name_array.indexOf(param.name)
    return link_array[index];
  }

  function create_line(param, x0, y0){
    d3.selectAll(".tooltipText").remove();
    d3.selectAll(".tooltip_circle").remove();
    var x1 = 150;
    var y1 = 50;
    var data = [{x: x0 - 9, y: y0}, {x: x1, y: y1}];
    var line = d3.svg.line()
        .interpolate("step-before")
        .x(function(d) { return (d.x); })
        .y(function(d) { return (d.y); });

      tooltip_line = d3.select("#area1 svg").datum(data).append("path")
                      .attr("class", "tooltip_line")
                      .attr("d", line);
      //Change the image
      d3.select("#image image").attr("xlink:href", function(){
        return choose_image(param);
      });
      tooltip_circle = d3.select("#area1 svg").append("circle")
                        .attr("class", "tooltip_circle")
                        .attr("cx", 150)
                        .attr("cy", 50)
                        .attr("r", 25)
                        .style("fill", "url(#image)");
      tooltip.html(
        "<a href=" + choose_link(param) + ' target="_blank">' + choose_text(param) +
        "</a>")
        .style("opacity", 1);
      d3.select("#image").style("visibility", "visible");

      //Enable clicking on the link
      d3.selectAll(".tooltip_circle").on("click", function(){
        d3.selectAll(".tooltipText").remove();
        d3.selectAll(".tooltip_circle").remove();
        tooltip.style("opacity", 0);
      })
  }

  function remove_line(){
    d3.selectAll(".tooltip_line").remove();
  }

  d3.selectAll("circle")
    .on("mouseover", function(){
      if(d3.select(this).data()[0].depth==1){
        var positionX = $(this).position().left;
        var positionY = $(this).position().top;
        create_line(d3.select(this).data()[0], positionX, positionY);
      }
      else null;
    })
    .on("mouseout", remove_line);
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
  var link = svg_1.selectAll("path")
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
    svg_1.selectAll("path").filter(function(d) { return class_array.indexOf(d.target.id)!=-1})
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

//--------------------------------------------------------------------IMAGES--------------------------------------------------------------

d3.select("#area1 svg")
  .append("defs").append("pattern").attr({"height": 50, "width": 50})
  .attr("id", "image")
  .append("image").attr({"height": 50, "width": 50})
  .attr("xlink:href", "");

//-----------------------------------------------------------CLICK FUNCTIONS--------------------------------------------------------------


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
  event.preventDefault(); //this prevents jumping back to the top of the page on click
  //-----------------Change links to be active/inactive
  d3.selectAll(".section").style("background", "none");
  d3.selectAll(".section").attr("class", "section notActive");
  check = d3.select(this);
  check.style("background", "steelblue")
  check.attr("class", "section active");
  d = svg_1.selectAll("g.node").data()[0];
  collapse1(d);
  setTimeout(collapse2, 1000); //Delay between collapsing first and second row

  if(event.target.id === 'Statistics') setTimeout(stat_expand, 2000); //Note due to javascript concurrency func called 1000ms after above
  else if(event.target.id === 'Algorithms') setTimeout(algo_expand, 2000);
  else if(event.target.id === 'Machine') setTimeout(ml_expand, 2000);
  else setTimeout(expand_all, 2000);
}

d3.selectAll(".section").on("click", story_click);

//--------------------------------Collapse Functions----------------------------------------------------------
function collapse1(d) {
  if(d.depth == 0){
    for(i=0; i<d.children.length; i++)
      collapse1(d.children[i]);
  } else {
    if(!d._children){ //Only change storage id d._children set to null;
      d._children = d.children;
      d.children = null;
    }
    update(d)
  }
}

function collapse2(){
  var d = svg_1.selectAll("g.node").data()[0];
  d._children = d.children;
  d.children = null;
  update(d);
}

//--------------------------------Expand Functions----------------------------------------------------------

function stat_expand(){
  story_1 = [156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171];
  story_2 = [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155];
  story_3 = [78, 81, 84, 85, 87, 89, 91, 92, 94, 103, 185, 186, 187, 188, 189, 190, 191, 192];
  stat_array = story_1.concat(story_2, story_3);
  expan_arr = [156, 121, 78, 187]; //The array of nodes to expand
  var d = svg_1.selectAll("g.node").data()[0]; //This select the data associated with the base node

  d.children = d._children; //Expand the first level of the node graph
  d._children = null;

  d.children.forEach(function(dat){ //For all of the children of lowest level
    console.log(dat)
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
  story_1 = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  story_2 = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55];
  story_3 = [];
  expan_arr = [2, 28];
  algo_array = story_1.concat(story_2, story_3);
  var d = svg_1.selectAll("g.node").data()[0];

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
  story_1 = [106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
  story_2 = [180, 181, 182, 183, 184, 185, 186];
  story_3 = [78, 87, 88, 90, 96, 105];
  ml_array = story_1.concat(story_2, story_3);
  expan_arr = [106, 180, 78];
  var d = svg_1.selectAll("g.node").data()[0];

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
  var d = svg_1.selectAll("g.node").data()[0];

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
          svg_1.selectAll("path").filter(function(d) { return story_arrs[counter].indexOf(d.target.id)!=-1})
              .attr("id", name + story_strs[counter]) //Change id associated with links
              .classed("active", true); //Make links active
          counter++; //Update the counter

          summary_func(counter); //This is the function which updates the summary text

          if(counter!=0) {
            svg_1.selectAll("#" + name + story_strs[counter - 2]).classed("active", false); //Make old links inactive
          }
          if(counter < story_arrs.length) setTimeout(link_change, 500);
          if(counter == story_arrs.length) setTimeout(function() { svg_1.selectAll("#" + name + story_strs[counter - 1]).classed("active", false);}, 500); //make final link inactive
      }

      link_change(story_arrs, story_strs); // Call the function defined above
  }

//--------------------------------SUMMARY FUNCS----------------------------------------------------------

function stat_sum(counter){
  if(counter==1){
    d3.select("#story_"+counter).html('<div><span><h4><font color="#957095">Overview of descriptive & inferential statistics</h4><svg width="105" height="10" class="percentage_green"><rect width="14" height="8" style="fill: #6B246B"></rect><rect width="86" height="8" transform="translate(14)"></rect></svg>14%</font></span></br><div style="text-align: text-justify">We viewed statistics as a foundation for data science so we began with an introduction to the most common statistical inference methods.</div></div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><span><h4><font color="#957095">Theory of probability and statistics</h4><svg width="105" height="10" class="percentage_green"><rect width="79" height="8" style="fill: #6B246B"></rect><rect width="21" height="8" transform="translate(79)"></rect></svg>65%</font></span></br><div>We realized that in order to fully understand statistics, we should start with probability theory. Stat110 is seen as a key foundation course for statistics at Harvard and also gave us an introduction to Bayesian methods.</div></div>');
  } else {
    d3.select("#story_"+counter).html('<div><span><h4><font color="#957095">Application of statistical models and inference</h4><svg width="105" height="10" class="percentage_green"><rect width="100" height="8" style="fill: #6B246B"></rect></svg>21%</font></span><br/><div style="text-align: text-justify">Harvard\'s Stat111 course on statistical inference is unfortunately not available online. We therefore chose to cover the material for Bayesian and Classical Inference through an MIT course (last 5 lectures and last 2 problem sets). Additionally statistical concepts were revisited and built upon in the Harvard Data Science course.</div></div>');
  }
}

function alg_sum(counter){
  if(counter==1){
    d3.select("#story_"+counter).html('<div style="text-align: text-justify">Developing our programming skills formed a major part of our learning throughout all courses. However two particular courses focused on programming concepts, methodologies and algorithms.</div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><span><h4><font color="#FF4D4D">Programming Methodology</h4></font></span><div style="text-align: text-justify">CS106A was our first introduction to modern software engineering principles. This course was completed in preparation of our full time study period. We learned about good programming style and the object oriented paradigm.</div></div>');
  } else {
    d3.select("#story_"+counter).html('<div><span><h4><font color="#FF4D4D">Programming Abstractions</h4></font></span><div style="text-align: text-justify">CS106B is the follow up course to CS106A through which we hoped to extend our programming skills. The course covered the topics of recursion and algorithm efficiency, both of which have already proven useful when implementing machine learning algorithms or considering large datasets. Furthermore the course exposed many of the data templates and structures in C++ and allowed extensive practice.</div></div>');
  }
} 

function ml_sum(counter){
  if(counter==1){
    d3.select("#story_"+counter).html('<div><span><h4><font color="CornflowerBlue">Machine Learning Course</h4><svg width="105" height="10" class="percentage_blue"><rect width="67" height="8"></rect><rect width="33" height="8" transform="translate(67)" style="fill: CornflowerBlue"></rect></svg>67%</font></span></br><div style="text-align: text-justify">This course introduced the most commonly used machine learning algorithms applied in the context of supervised and unsupervised problems. We completed it prior to embarking on our journey and the examples from the course were a key inspiration in our decision to pursue data science.</div></div>');
  } else if (counter==2){
    d3.select("#story_"+counter).html('<div><span><h4><font color="CornflowerBlue">Application to the Language Problem</h4><svg width="105" height="10" class="percentage_blue"><rect width="89" height="8"></rect><rect width="11" height="8" transform="translate(89)" style="fill: CornflowerBlue"></rect></svg>22%</font></span></br><div style="text-align: text-justify">Given our interest in languages, we were inspired to study how machine learning and statistical methods can train computers to interpret human language.</div></div>');
  } else {
    d3.select("#story_"+counter).html('<div><span><h4><font color="CornflowerBlue">Experimenting with Machine Learning</h4><svg width="105" height="10" class="percentage_blue"><rect width="100" height="8"></rect></svg>11%</font></span></br><div style="text-align: text-justify">Within CS109, we revisited many machine learning concepts and introduced new Bayesian methods. These were used in building predictor and recommender systems; specifically we were introduced to the python Scipy implementation of these techniques.</div></div>');
  }
}

function overall_sum(){
  d3.select("#story_1").html('This diagram details the hierarchy of topics learnt. The thickness of the links within each layer of the diagram is proportional to the number of hours spent on that particular course or topic.<h4><small>By clicking on a node you can contract or expand the view of a given course. Hovering over a course node reveals a link to the course website. Click on the icon to remove the link.</h4></small>');
  
  if (!$('#story_1 .explain').length > 0) { // JQuery method of checking if an element exists - This only runs at beginning
    var circles = d3.select("#story_1").append("svg").attr("class", "explain").attr("height", 200); 
    circles.append("circle").attr("r", "80").attr("cx", "190").attr("cy", "100").attr("opacity", "0.15").attr("fill", "gray");
    circles.append("circle").attr("r", "50").attr("cx", "190").attr("cy", "100").attr("opacity", "0.15");
    circles.append("circle").attr("r", "20").attr("cx", "190").attr("cy", "100").attr("opacity", "0.15");
    guide_draw();
  }
    $("#story_1 > div").remove(); // JQuery remove the other elements which may be in the dom
    $("#story_2 > div").remove(); // JQuery remove the other elements which may be in the dom
    $("#story_3 > div").remove(); // JQuery remove the other elements which may be in the dom
    guide_draw();
}

function guide_draw(){
  data = {"name": "Data Science", "children": [{"name": "Course", "children": [{"name": "Topic"}] }] } //Create Data for examle Diagram
  var small_tree = d3.layout.tree() //Create tree ayout for example diagram
    .size([360, 50])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  var nodes = small_tree.nodes(data),
      links = small_tree.links(nodes);
  nodes.forEach(function(d) {d.y = d.depth * 25; });
  var node = d3.select("#story_1 svg").selectAll("g.small_node")
               .data(nodes).enter().append("g")
               .attr("transform", "translate(190, 100)")
               .attr("class", "small_node");
           node.append("circle")
               .attr("r", "4")
               .attr("transform", function(d) { return "translate(" + d.y +"," + d.depth*20 + ")"; });
           node.append("text")
               .attr("x", function(d) { return d.y; })
               .attr("y", function(d){ return 10 + d.depth*20 })
               .attr("dy", ".25em")
               .text(function(d) { return d.name; });

}

//------------------------------------------------Playful force directed graph to show connections--------------------------------------------

var width_force = 550,
    height_force = 300

var svg_force = d3.select(".playful").append("svg")
    .attr("width", width_force)
    .attr("height", height_force);

var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width_force, height_force]);

d3.json("data.json", function(error, json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg_force.selectAll(".link_playful")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link_playful");

  var node = svg_force.selectAll(".node_playful")
      .data(json.nodes)
    .enter().append("g")
      .attr("class", "node_playful")
      .call(force.drag);

  node.append("image")
      .attr("xlink:href", function(d){
        return d.url; 
      })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 25)
      .attr("height", 25);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
