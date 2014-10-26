var margin = {top: 40, right: 10, bottom: 10, left: 10},
    width = 675 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var gray_scale = d3.scale
    .ordinal()
    .range(['rgb(255,255,255)','rgb(240,240,240)','rgb(217,217,217)','rgb(189,189,189)','rgb(150,150,150)','rgb(115,115,115)','rgb(82,82,82)','rgb(37,37,37)','rgb(0,0,0)']);
// .range(['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'])
// .range(['rgb(103,0,31)','rgb(178,24,43)','rgb(214,96,77)','rgb(244,165,130)','rgb(253,219,199)','rgb(224,224,224)','rgb(186,186,186)','rgb(135,135,135)','rgb(77,77,77)','rgb(26,26,26)'])
// .range(['rgb(251,180,174)','rgb(179,205,227)','rgb(204,235,197)','rgb(222,203,228)','rgb(254,217,166)','rgb(255,255,204)','rgb(229,216,189)','rgb(253,218,236)','rgb(242,242,242)'])

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d._hour; });

var div = d3.select("#area5").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

//--------------------------------------------LOADING DATA FUNC----------------------------------------------------
d3.csv("course_hierarch2.csv", function(d) {
    data ={ "name": "", "children": [] }
    Course_arr = data.children
    Course = "Course"
    Chapter = "Chapter"
    Topic = "Topic"
    Avg_hour = "Avg_hours"
    min__hour_course = 10000;
    max__hour_course = 0;
    _hour_array = [];

  // Creating the course array
  d.map(function(dat, id){

      if(child_exist(Course_arr, dat[Course])){ //JQuery expression checking -- doesn't exist
        if(parseFloat(dat.Course_hour) > max__hour_course) max__hour_course = parseFloat(dat.Course_hour);
        if(parseFloat(dat.Course_hour) < min__hour_course) min__hour_course = parseFloat(dat.Course_hour);
        dat.Course_hour == "" ? _hourval = 100.00 : _hourval = parseFloat(dat.Course_hour);
        _hour_array.indexOf(_hourval) == -1 ? _hour_array.push(_hourval) : null//Create a unique number of hours array
        Course_info = {"name": dat[Course], "_hour": _hourval, "children": []}
        Course_arr.push(Course_info)
      }
      // "_hour": dat.Course_hour

      Course_id = findByVal(Course_arr, dat[Course])
      Chapter_arr = Course_arr[Course_id].children
      dat.Chap_hour == "" ? _hourval = 4.00 : _hourval = parseFloat(dat.Chap_hour);
      if(child_exist(Chapter_arr, dat[Chapter])){
        Chapter_info = {"name": dat[Chapter], "_hour": _hourval, "children": []}
        Chapter_arr.push(Chapter_info)
      }
      // "_hour": dat.Chap_hour

      // Chapter_id = findByVal(Chapter_arr, dat[Chapter])
      // Topic_arr = Chapter_arr[Chapter_id].children
      // if(child_exist(Topic_arr, dat[Topic])){
      //   Topic_info = {"name": dat[Topic], "_hour": parseFloat(dat.Top_hour), "children": []}
      //   Topic_arr.push(Topic_info)
      // }

  //Need to capture total size in order to introduce a greyscale - ordinal color scale

  })
  console.log(data);
  // console.log(gray_scale(18))
  // console.log(gray_scale(150))
  console.log(_hour_array)
  test = _hour_array.sort(function(a, b) { return a - b;})
  gray_scale.domain(test);
  draw_tree(data);

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

function draw_tree(root){

  var node = div.datum(root).selectAll(".nodetreemap")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "nodetreemap")
      .call(position)
      .style("background", function(d) {return d.children ? gray_scale(d._hour) : null; })
      .style("opacity", "1")
      .append("text")
      .text(function(d) { return d.children ? null : d.name; })
      // .style("color", "black");
      .style("color", function(d){if(d.depth ==2) {return _hour_array.indexOf(d.parent._hour) >= 6 ? "white" : "black"} else return null}); //Converts the text to white if the background sufficiently dark
}

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}