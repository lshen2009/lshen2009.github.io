//Initialize the chart
LineChart = function(_parentElement, _data){
	this.parentElement = _parentElement;	
	this.data = _data;
	this.ID = [10] // initial value
	this.initVis()	
}

LineChart.prototype.initVis = function(){		
var vis = this;	
this.selected_sites()

vis.margin = {top: 30, right: 20, bottom: 30, left: 50},
    vis.width = 500 - vis.margin.left - vis.margin.right,
    vis.height = 300 - vis.margin.top - vis.margin.bottom;
vis.x = d3.scale.linear().range([0, vis.width]);
vis.y = d3.scale.linear().range([vis.height, 0]);
vis.div = d3.select("#" +vis.parentElement).append("div")	
    	.attr("class", "tooltip")				
	    .style("opacity", 0);
	
vis.xAxis = d3.svg.axis().scale(vis.x).orient("bottom")
	.ticks(5).tickFormat(d3.format("4"));	
vis.yAxis = d3.svg.axis().scale(vis.y).orient("left").ticks(5);	
vis.valueline = d3.svg.line()
 	.defined(function(d){return d.values != null && d.values != undefined})
    .x(function(d) { return vis.x(d.key); })
    .y(function(d) { return vis.y(+d.values); });	

vis.x.domain([1989.5,2016.5]);
vis.y.domain(d3.extent(vis.one_site, function(d){ return d.values }));
vis.colorScale = d3.scale.linear().range(["#f4e542", "#f44b42"])
		.interpolate(d3.interpolateLab).domain([30,60])

vis.svg2=d3.select("#" +vis.parentElement)
    	.append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    	.append("g")
        .attr("transform", 
              "translate(" + vis.margin.left + "," + vis.margin.top + ")");
	
vis.svg2.append("path")
	.attr("stroke","blue")
	.attr("stroke-width",2)
	.attr("class","line")
	.attr("d", vis.valueline(vis.one_site));
	
vis.svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(vis.xAxis);
vis.svg2.append("g")
    .attr("class", "y axis")
    .call(vis.yAxis);	

vis.svg2.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", -42)
   .attr("x", -50)
  .style("font-size", "16px")
   .attr("dy", ".71em")
   .style("text-anchor", "end")
   .attr("class", "shadow")
   .text("MDA8 Ozone (ppbv)");	
	
	
vis.circles = vis.svg2.selectAll("circle")
                     .data(vis.one_site_filter);	
vis.circles.enter().append("circle")	   
	   .on("mouseover", function(d){
			d3.select(this).attr("r", 8) 			
		   vis.div.transition()		
           .duration(200)		
           .style("opacity", .9);	
           vis.div.html(d.key + "<br/>"  +d.values.toFixed(1)+" ppbv")	     .style("left", d3.select(this).attr("cx") + "px")		
             .style("top",  d3.select(this).attr("cy") + "px");			   
//           .style("left", (d3.event.pageX-580) + "px")		
//           .style("top", (d3.event.pageY-140) + "px");	
//		    console.log(d3.event.pageX)	
//			console.log(d3.select(this))
	   })
	   .on("mouseout", function(d){
		   d3.select(this).attr("r", 5)
		   vis.div.transition()		
           .duration(200)		
           .style("opacity", 0);
		})
vis.circles.exit().remove();
	
vis.circles.transition()
       .duration(1000)
	   .attr("cx", function(d) { return vis.x(d.key); })
       .attr("cy", function(d) { return vis.y(d.values); })
	   .attr("fill", function(d) {return vis.colorScale(d.values)})
	   .attr("r", 5)

vis.timeline=vis.svg2.append("line")
		.style("stroke", "#f442b3")
		.style("stroke-dasharray", ("3, 3"))
		.attr("x1",vis.x(filterValue))
		.attr("x2",vis.x(filterValue))
		.attr("y1",0)
		.attr("y2",vis.height)		
}


LineChart.prototype.update=function(){
var vis=this
this.selected_sites();	
//console.log(vis.ID)	
vis.x.domain([1989.5,2016.5]);
vis.y.domain(d3.extent(vis.one_site, function(d){ return d.values }));
	
vis.circles = vis.svg2.selectAll("circle").data(vis.one_site_filter);	
vis.circles.enter().append("circle")	
vis.circles.exit().remove();	
vis.circles.transition()
       .duration(1000)
	   .attr("cx", function(d) { return vis.x(d.key); })
       .attr("cy", function(d) { return vis.y(d.values); })	   
		.attr("fill", function(d) {return vis.colorScale(d.values)})
	   .attr("r", 5)

var updates = d3.select("#" +vis.parentElement).transition();		
updates.select("path.line")   // change the line
            .duration(1000)
            .attr("d", vis.valueline(vis.one_site));	
	
updates.select(".y.axis")
 	.duration(1000)
 	.call(vis.yAxis);
updates.select(".x.axis")
 	.duration(1000)
 	.call(vis.xAxis);	
}


LineChart.prototype.selected_sites=function(){
var vis=this

spdata=vis.data.filter(function(d){return vis.ID.indexOf(+d.ID)>=0 && d.month>=6 && d.month<=8})

vis.one_site=d3.nest()
   			.key(function(d){return +d.year})
   			.sortKeys(d3.ascending)
   			.rollup(function(v){return d3.mean(v, function(d){return d.ozone})})
   		    .entries(spdata)	   
	
vis.one_site_filter=vis.one_site.filter(function(d){
	return d.values != null && d.values != undefined
})
}

LineChart.prototype.moving_line=function(){
	vis=this	
vis.timeline.transition()
		.duration(120)	
		.attr("x1",vis.x(filterValue))
		.attr("x2",vis.x(filterValue))
}