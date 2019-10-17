//create somewhere to put the force directed graph
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var radius = function(d) {return d.degree};

d3.json("sfu-subjects.json", function(error, graph) {
      if (error) throw error;

      //set up the simulation and add forces
      var simulation = d3.forceSimulation()
                         .nodes(graph.nodes);

      var link_force =  d3.forceLink(graph.links)
                          .id(function(d) { return d.name; });

      var charge_force = d3.forceManyBody().strength(-50);

      var center_force = d3.forceCenter(width / 2, height / 2);

      var collision = d3.forceCollide().radius(function(d) { return d.degree + (d.degree / 2) });

      simulation
          .force("charge_force", charge_force)
          .force("center_force", center_force)
          .force("links",link_force)
          .force("collision", collision);


      //add tick instructions:
      simulation.on("tick", tickActions );

      //add encompassing group for the zoom
      var g = svg.append("g")
          .attr("class", "everything");

      //draw lines for the links
      var link = g.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter().append("line")
          .attr("stroke-width", 2)
          .style("stroke", "black")
          .style("opacity", 0);

      //draw circles for the nodes
      var node = g.append("g")
              .attr("class", "nodes")
              .selectAll("circle")
              .data(graph.nodes)
              .enter()
              .append("circle")
              .attr("r", radius)
              .attr("fill", "black");

      var label = g.append("g")
                  .attr("class", "labels")
                  .selectAll("text")
                  .data(graph.nodes)
                  .enter().append("text")
                  .attr("class", "label")
                  .text(function(d) { return d.name; });


      //add drag capabilities
      var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);

      drag_handler(node);


      //add zoom capabilities
      var zoom_handler = d3.zoom()
          .on("zoom", zoom_actions);

      zoom_handler(svg);

      /** Functions **/

      //Drag functions
      //d is the node
      function drag_start(d) {
       if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
      }

      //make sure you can't drag the circle outside the box
      function drag_drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function drag_end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      //Zoom functions
      function zoom_actions(){
          g.attr("transform", d3.event.transform)
      }

      var fontsize = function(d) { return d.degree + 10 + "px"; };
      var color_palette = d3.scaleOrdinal(d3.schemeCategory10);
      var color = function(d,i){ return color_palette(d.modularity_class) };
      var opacity = function(d){ if (d.type == 'Subject') { return 1 } else {return 0} };

      function tickActions() {
          //update circle positions each tick of the simulation
             node
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; })
              .style("opacity", 0);

          //update link positions
          link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          label
                  .attr("x", function(d) { return d.x; })
                  .attr("y", function(d) { return d.y; })
                  .attr("text-anchor", "middle")
                  .style("font-size", fontsize)
                  .style("fill", color)
                  .style("opacity", opacity);
      }

    });
