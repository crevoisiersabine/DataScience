var diameter = 675,
    radius = diameter / 2,
    innerRadius = radius - 120;
 
var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });
 
var bundle = d3.layout.bundle();
 
var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.1)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });
 
var svg = d3.select("#area6").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");
 
d3.json("flare2.json", function(error, classes) {
  var nodes = cluster.nodes(packageHierarchy(classes)),
      links = packageImports(nodes);

  console.log(nodes)
  console.log(links)
  console.log(bundle(links))
 
  svg.selectAll(".link")
      .data(bundle(links))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", line);
 
  svg.selectAll(".node")
      .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .append("text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.key; });
});
 
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
      if (name.length) { //When the name.length is null - have reached past the final number of dots in the line
        node.parent = find(name.substring(0, i = name.lastIndexOf("."))); //Calls find with the new name which is the old name minus last.name - NB: No data passed
        node.parent.children.push(node);
        //The previous line creates the parent-child relationship recursively
        node.key = name.substring(i + 1);
        // console.log(node.key)
      }
    }
    // console.log(node)
    return node;
  }
 
  classes.forEach(function(d) {
    //Function is called recursively for every line to create the hierarchy
    find(d.name, d);
  });
 
  console.log(map[""])
  console.log(map)
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

  console.log(map);
 
  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });
 
  console.log(imports)
  return imports;
}