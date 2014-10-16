data ={ "name": "Data Science", "children": [] }

d3.csv("course_hierarch.csv", function(d) {
//-----------------------------------------------------------------------------------------------------------
  	Course_arr = data.children
    Course = "Course"
    Chapter = "Chapter"
    Topic = "Topic"

 	// Creating the course array
 	d.map(function(dat, id){
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

 			Chapter_id = findByVal(Chapter_arr, dat[Chapter])
 			Topic_arr = Chapter_arr[Chapter_id].children
 			if(child_exist(Topic_arr, dat[Topic])){
	 			Topic_info = {"name": dat[Topic], "children": []}
	 			Topic_arr.push(Topic_info)
	 		}
 	})

  createVis();

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


  createVis = function() {

    var diameter = 960;

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120]) //Sets the available layout size
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; }); //Node separation

    var diagonal = d3.svg.diagonal.radial() //Cubic Bezier diagonal line + radial line generator(takes radius angle)
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; }); //Convert input x,y object to height and angle

    var svg = d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter - 150)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

     var nodes = tree.nodes(data),
          links = tree.links(nodes);

          console.log(links)

      var link = svg.selectAll(".link")
          .data(links)
        .enter().append("path")
          .attr("class", "link")
          .attr("d", diagonal);

      var node = svg.selectAll(".node")
          .data(nodes)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "rotate(" + (d.x -90) + ")translate(" + d.y + ")"; }) //Rotate -90 shifts the origin for readibility

      node.append("circle")
          .attr("r", 4.5);

      node.append("text")
          .attr("dy", ".31em")
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
          .text(function(d) { return d.name; });

      d3.select(self.frameElement).style("height", diameter - 150 + "px");
      console.log(data);
    };


