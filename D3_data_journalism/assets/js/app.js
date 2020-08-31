// @TODO: YOUR CODE HERE!
// function makeResponsive() {
var svgWidth = 960;
var svgHeight = 500

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([0,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}
function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, x_dynaAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  x_dynaAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return x_dynaAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, y_dynaAxis) {
  var bottomAxis = d3.axisBottom(newYScale);

  y_dynaAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return y_dynaAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;
  // Conditional for X axis
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    else {
      xlabel = "Healthcare:";
    }
  // Conditional for X axis
    if (chosenYAxis === "income") {
      ylabel = "Income:";
    }
    else {
      ylabel = "Age"
    }
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function (d) {
      return (`${d.state}<br>${d[chosenXAxis]}%<br>${d[chosenYAxis]}`);
    });

 // Create mouseover event listener to disply tool tip
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
      .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });
      return circlesGroup;
}
// Retrieve data from the CSV file and execute everything below

d3.csv("assets/data/data.csv").then(function (data) {
  // parse data
  data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income
  });
  // Create x scale function
  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var x_dynaAxis = chartGroup.append("g")
    // .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var y_dynaAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "teal")
    .attr("opacity", ".5");
   // Add State abbr. text to circles.
  var circletextGroup = chartGroup.selectAll()
      .data(data)
      .enter()
      .append("text")
      .text(d => (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", "8px")
      .style("text-anchor", "middle")
      .style('fill', 'black');

  // Create group for two x-axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("poverty (%)");

  var healthcareLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("healthcare");

 // Create group for two y-axis labels
  var YlabelsGroup = chartGroup.append("g")

  // append y axis
  var incomeLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    .text("income");

  var ageLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("age");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthcare, chosenXAxis);
        // updates x axis with transition
        // x_dynaAxis = renderAxes(xLinearScale, x_dynaAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);

          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);

          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
       }
        else {
          chosenYAxis = value;

          // Update y scale for new data.
          yLinearScale = yScale(data, chosenYAxis);

          // Updates y axis with transition.
          y_dynaAxis = renderAxes(yLinearScale, y_dynaAxis);

          if (chosenYAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
  
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
  
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }

        }
      
    });

}).catch(function (error) {
   console.log(error);
});