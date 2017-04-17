MapChart = function(_parentElement, _states, _ozone){
	this.parentElement = _parentElement;
	this.usdata = _states;
	this.ozonedata = _ozone;
	this.ID = ["10"]			
	
this.site_info=d3.nest()
	.key(function(d){return +d.ID})	
	.rollup(function(v){
		return {
			ID:  +v[0].ID,
			lon: +v[0].lon,
			lat: +v[0].lat
		}
	})
	.entries(this.ozonedata)	
	this.initVis();	
}

MapChart.prototype.initVis = function(){	
	var vis = this;		
	vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
	vis.width = 480 - vis.margin.left - vis.margin.right,
  	vis.height= 400 - vis.margin.top - vis.margin.bottom;	
	vis.projection = d3.geo.albersUsa()
				   .translate([vis.width*0.45, vis.height*0.4])
				   .scale([600]); 
	vis.path = d3.geo.path().projection(vis.projection); 		
	
  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

	vis.div = d3.select("#map-chart").append("div")	
    	.attr("class", "tooltip")				
	    .style("opacity", 0);

	vis.colorScale = d3.scale.linear().range(["#f4e542", "#f44b42"])
		.interpolate(d3.interpolateLab).domain([30,60])
	
  vis.svg.selectAll("path")
 	.data(vis.usdata.features)
	.enter()
	.append("path")
	.attr("d", vis.path)
	.style("stroke", "#fff")
	.style("stroke-width", "1")
	.style("fill", "rgb(213,222,217)")		
	
vis.svg.append("g")
   .attr("class", "legendLinear")
   .attr("transform", "translate(60,320)");
vis.legendLinear = d3.legend.color()
      .shapeWidth(20)
      .orient("horizontal")
	  .cells(12)
      .scale(vis.colorScale);
vis.svg.select(".legendLinear")
      .call(vis.legendLinear);      		

vis.svg.append("text")
   .attr("y", 320)
   .attr("x", 360)
   .attr("dy", ".71em")
   .style("font-size", "16px")
   .style("text-anchor", "end")
   .attr("class", "shadow")
   .text("ppbv");

vis.svg.append("text")
   .attr("y", 360)
   .attr("x", 20)
   .attr("dy", ".71em")
   .style("font-size", "16px")
   .style("text-anchor", "start")
   .style("fill", "#686b70")
   .attr("class", "shadow")
   .text("(1) Click on the sites, or use mouse to highlight a region.");
	
vis.svg.append("text")
   .attr("y", 380)
   .attr("x", 20)
   .attr("dy", ".71em")
   .style("font-size", "16px")
   .style("text-anchor", "start")
   .style("fill", "#686b70")
   .attr("class", "shadow")
   .text("(2) Push slider to see trends");	
//, or push slider to see trends.	
//===== brush ====
vis.x = d3.scale.linear()
    .range([0, vis.width]);
vis.y = d3.scale.linear()
    .range([vis.height, 0]);

vis.brush = d3.svg.brush()
    .x(vis.x)
    .y(vis.y)
    .on("brushend", brushed)

vis.brusharea=vis.svg.append("g")

vis.brusharea.attr("class", "brush")
    .call(vis.brush);

//console.log(vis.site_info)	
function brushed() {
//	console.log("=============")
	loc=vis.brush.extent()
	x1=loc[0][0]
	y1=loc[0][1]
	x2=loc[1][0]
	y2=loc[1][1]
	console.log([x1,y1,x2,y2])
	leftbottom=vis.projection.invert([vis.x(x1),vis.y(y1)])
	righttop=vis.projection.invert([vis.x(x2),vis.y(y2)])	
	lon_range=[leftbottom[0], righttop[0]]
	lat_range=[leftbottom[1], righttop[1]]		
	if(lat_range[0]>lat_range[1]){lat_range[0]=25}
//	console.log([lon_range[0],lon_range[1]])
//	console.log([lat_range[0],lat_range[1]])
	vis.ID=[]
	vis.site_info.forEach(function(d,i){
		if (d.values.lon>=lon_range[0] && d.values.lon<=lon_range[1] && d.values.lat>=lat_range[0] && d.values.lat<=lat_range[1]){
			vis.ID.push(d.values.ID)
		}
	})
//	console.log([vis.ID,lon_range, lat_range])
	
	linechart.ID=vis.ID
	linechart.update()
	
	d3.select(".selected")
	  .attr("stroke","none")
	  .attr("class","unselected")			
}	
	
vis.draw_points()	
}

MapChart.prototype.draw_points=function(){		
var vis=this	
var yearly_ozone=d3.nest()
	.key(function(d){return +d.ID})
	.sortKeys(d3.ascending)
	.rollup(function(v){
		return {			
			avg: d3.mean(v, function(d){return d.ozone}),
			lon: d3.mean(v, function(d){return d.lon  }),
			lat: d3.mean(v, function(d){return d.lat  }),
			year: +filterValue
		}
	})
	.entries(vis.ozonedata)

vis.site_obs=vis.svg.selectAll(".circle").data(yearly_ozone)

vis.site_obs.enter()
	.append("circle")
	.attr("cx", function(d) {
		return vis.projection([d.values.lon, d.values.lat])[0];
	})
	.attr("cy", function(d) {
		return vis.projection([d.values.lon, d.values.lat])[1];
	})
	.style("opacity", 0.85)	
	
vis.site_obs.transition()
	.style("fill", function(d){
		return (d.values.avg == null)? "black": vis.colorScale(d.values.avg)
	})		
	.attr("r", function(d) {
		return (d.values.avg == null)? 3:5
	})
	
vis.site_obs.exit().remove();	
vis.updateVis()	
//------------
vis.svg.selectAll("circle")
	.attr("stroke", function(d){
		return d.key == vis.ID ? "black":"none"
	})
	.attr("class", function(d){
		return d.key == vis.ID ? "selected":"unslected"
	})
//------------	
}

MapChart.prototype.updateVis = function(){	
var vis = this;
var yearly_ozone=d3.nest()
	.key(function(d){return +d.ID})
	.sortKeys(d3.ascending)
	.rollup(function(v){
		return {			
			avg: d3.mean(v, function(d){return d.ozone}),
			lon: d3.mean(v, function(d){return d.lon  }),
			lat: d3.mean(v, function(d){return d.lat  }),
			year: +filterValue
		}
	})
	.entries(vis.ozonedata)	

vis.svg.selectAll("circle").data(yearly_ozone)
	.style("fill", function(d){
		return (d.values.avg == null)? "black": vis.colorScale(d.values.avg)
	})		
	.attr("r", function(d) {
		return (d.values.avg == null)? 3:5
	})	
//	.attr("stroke", function(d){
//		return d.key == vis.ID ? "black":"none"
//	})
//	.attr("class", function(d){
//		return d.key == vis.ID ? "selected":"unslected"
//	})
	.on("mouseover", function(d) { 
		d3.select(this).attr("r", function(d) {
		return 9;
		})   
        vis.div.transition()		
           .duration(200)		
           .style("opacity", .9);	
		conc=d.values.avg
		text= null
		if(conc == null | conc == undefined){
			text="missing"
		} else {
			text=conc.toFixed(1)+" ppbv"
		}
//		console.log(d3.event.pageY)
        vis.div.html(filterValue + "<br/>"  +text)	
           .style("left", d3.select(this).attr("cx") + "px")		
           .style("top",  d3.select(this).attr("cy")-(-20) + "px");		
//           .style("left", (d3.event.pageX-100) + "px")		
//           .style("top",  (d3.event.pageY-135) + "px");					
	})
    .on("mouseout", function(d) {  
		vis.div.transition()		
           .duration(500)		
           .style("opacity", 0)						
		d3.select(this).attr("r", function(d) {
			return (d.values.avg == null)? 3:5
		})	  
    })	
	.on("click", function(d){
		d3.selectAll(".brush").call(vis.brush.clear());//This is used to clear the brush
		linechart.ID=[+d.key]		
		linechart.update()			
		d3.select(".selected")
			.attr("stroke","none")
			.attr("class","unselected")		
		d3.select(this)
			.attr("stroke","black")
			.attr("class","selected")		
	})
}
