// @TODO: YOUR CODE HERE!
//Set parameters for SVG
var svgWidth = 800;
var svgHeight = 400

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper and append a SVG group that will hold the chart,

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "income";

// Create scales
//Function to update x scale
function xScale(dataCsv, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataCsv, d => d[chosenXAxis]) * .8,
    d3.max(dataCsv, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}
//Function to update y scale
function yScale(dataCsv, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(dataCsv, d => d[chosenYAxis]) * .8,
    d3.max(dataCsv, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}

// Function to render x axis label for transition
function renderAxes(newXScale, x_dynaAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  x_dynaAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return x_dynaAxis;
}

// Function to render y axis label for transition
function renderYAxes(newYScale, y_dynaAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  y_dynaAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return y_dynaAxis;
}
// Function to render circles group with transition to x and y axis
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function rendertCircles(tcirclesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  tcirclesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return tcirclesGroup;
}
// Function to update circles group with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel
  var ylabel;

  // Conditional for X axis
  if (chosenXAxis === "poverty") {
    xlabel = "Poverty";
  }
  else {
    xlabel = "Healthcare";
  }

  // Conditional for Y axis
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
      return (`${d.state}<hr>${xlabel}<br>${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}`);
    })
  // Create mouseover event listener to display tool tip
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // Create onmouseout event
    .on("mouseout", function (data) {
      toolTip.hide(data);
    });
  return circlesGroup;
}
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (dataCsv) {
  // parse data
  dataCsv.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income
    console.log(data)
  });
  // Create LinearScale scale functions
  // xLinearScale function above csv import
  var xLinearScale = xScale(dataCsv, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(dataCsv, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var x_dynaAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var y_dynaAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(dataCsv)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "teal")
    .attr("opacity", ".5");

  // Add State abbr. text to circles.
  var tcirclesGroup = chartGroup.selectAll("text")
    .data(dataCsv)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "8px")
    .style("text-anchor", "middle")
    .style('fill', 'white');

  // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var healthcareLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare (%)");

  // Create group for two y-axis labels
  var ylabelsGroup = chartGroup.append("g")

  // append y axis
  var incomeLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "income")
    .attr("dy", "1em")
    .classed("active", true)
    .text("Income");

  var ageLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "age")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Age");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        //console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(dataCsv, chosenXAxis);
        // updates x axis with transition
        x_dynaAxis = renderAxes(xLinearScale, x_dynaAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        tcirclesGroup = rendertCircles(tcirclesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
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
            .classed("active", true)
            .classed("inactive", false);

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    })

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      console.log(chosenYAxis)
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        // Update y scale for new data.
        yLinearScale = yScale(dataCsv, chosenYAxis);

        // Updates y axis with transition.
        y_dynaAxis = renderYAxes(yLinearScale, y_dynaAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        tcirclesGroup = rendertCircles(tcirclesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
        // changes classes to change bold text
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
            .classed("active", true)
            .classed("inactive", false);

          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }


      }


    });

}).catch(function (error) {
  console.log(error);
});