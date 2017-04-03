var dateFormat = d3.time.format("%Y");
var slider = chroniton()
      .domain([dateFormat.parse("1990"),dateFormat.parse("2016")])
      .labelFormat(d3.time.format('%Y'))
	  .tapAxis(function(axis) { axis.ticks(15) })
      .width(450)
      .height(50)
	  .loop(true)
//	  .play()
      .playButton(true) 
	  .playbackRate(0.3)

d3.select("#slider").call(slider);

function parse_data(d){
		d.ID = +d.ID	
		d.ozone=+d.mean	
		if (d.ozone == -9999){
			d.ozone = NaN
		}
		d.year=+d.year
		d.month=+d.month
		d.lon =  +d.lon
		d.lat = +d.lat
	return d
}

queue()
    .defer(d3.json, "./data/us-states.json")    
	.defer(d3.csv,"./data/CASTNET_1990-2016.csv",parse_data)
    .await(draw_map)

function filter_year(year){
	var spdata=CASTNET.filter(function(d){
		return d.year == year && d.month>=6 && d.month<=8
	})
	return spdata
}

var states_json;
var CASTNET;
var filterValue=1990;
var one_site;
function draw_map(error, us_states, ozone){		
   CASTNET = ozone; 
   states_json=us_states;	   
   createVis();	
		
   slider.on("change", function(d) {
          filterValue = dateFormat(d3.time.year(d));	
		  filterValue=+filterValue		  
          areachart.ozonedata=filter_year(filterValue);
		  linechart.moving_line()
   });   
	
}


function createVis() {
	areachart = new MapChart("map-chart",states_json, filter_year(filterValue));
	linechart = new LineChart("line-chart", CASTNET)
}