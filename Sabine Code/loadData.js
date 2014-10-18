var dataLoader = (function dataLoader() {

  d3.tsv("study_data.tsv", function(data) {
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));
      
      var count = 0.0;
      var course_dictionary = {}

      //Populate the data that I will use from the file
      data.forEach(function(d, i){
        
        //Parsing the date in the dataset
        d.date = format.parse(d.Date);

        count += 1;
        var y0 = 0;
        d.courses = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.courses[d.courses.length - 1].y1;


        if(course_dictionary[d.date] == undefined) {
          course_dictionary[d.date] = [color.domain().map(function(name) { return {date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; })];
        }
        else {
          course_dictionary[d.date].push(color.domain().map(function(name) { return {date: d.date, name: name, y0: y0, y1: y0 += +d[name]}; }));
        }
      })

      var courses = [];
      //Create the data structure
      for(var key in course_dictionary){
        for(var course in course_dictionary[key]){
          courses.push(course_dictionary[key][course]);
        }
      }

      //Useful for axes
      var minDate = d3.extent(data, function(d) { return d.date; })[0];
      var maxDate = d3.extent(data, function(d) { return d.date; })[1];
      var maxHour = d3.max(data, function(d) { return d.total; });

    return courses, minDate, maxDate, maxHour
  })
})