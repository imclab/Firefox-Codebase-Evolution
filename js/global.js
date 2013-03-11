"use strict";

var point_size = 0.5,
	alpha = 0.2,
	max_version = 17,
	pause = false;
	
var version = ["1", "1.5", "2", "3", "3.5", "3.6", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];

$(document).ready(function () {	
	//other initializations
	$("select, input, a.button, button").uniform();
		
	assignEventListeners();
	
	drawMetric("#metric", "loc_code");
	drawMetric("#metric", "mccabe");
	drawMetric("#metric", "prop_cost");
});

function assignEventListeners() {
	$("#rotate img").on("click", function() {
		pause = true;
	});
}

function drawMetric(container, metric) {
 	d3.json("data/firefox16_module_breakdown.json", function(data) {
		//draw a set of bars for each module
		//console.log(data.json_data);
		
		var w = 1000,
			h = 200,
			rect_width = 50;
			
		var svg = d3.select(container)
	        .append("svg")
	        	.attr("id", metric)
			    .attr("width", w)
			    .attr("height", h);
			        
		$.each(data.json_data, function(i, d) {
			var yMax = d3.max(data.json_data, function(d) { return eval("d.data[0]."+metric);})
			
			console.log(yMax);
			var yScale = d3.scale.linear()
		        .domain([0, yMax])
    		    .range([0, h]);
			        
			svg.append("svg:rect")
				.style("position", "absolute")
				.style("float", "left")
				.attr("x", function() { return (rect_width+5) * i; })
				.attr("width", rect_width)
				.attr("height", function() {
					//console.log(yScale(eval("d.data[0]."+metric)));
					return yScale(eval("d.data[0]."+metric));
				});
		});		
	});
}

function startRotate() {
	var i = 0;
	var interval = setInterval(function() {
		console.log(version[i]);
		$("#rotate img")
			.attr("src", "images/" + version[i]);
			//.fadeOut().html("<img src='images/" + version[i] + ".png' />").fadeIn();
		
		i++;
		if(i == version.length) {
			pause = true;
		}
		
		if(pause) {
			console.log("pausing");
			clearInterval(interval);
		}
	}, 100);
}

//draw the arcs
function drawCanvas(container) {
 	var data_file_a = "data/firefox16_file_dependencies.csv.deps",
	 	data_file_b = "data/firefox17_file_dependencies.csv.deps";
 		//data_file_b = "data/firefox17_file_dependencies.csv";
 		//data_file_b = "data/firefox16_visibility.csv";
 		
	//get a reference to the canvas
	var ctx_a = $('#canvas1')[0].getContext("2d"),
		ctx_b = $('#canvas2')[0].getContext("2d");
		

	d3.csv(data_file_a, function(data) {
		draw(data, ctx_a);
	});
	
	d3.csv(data_file_b, function(data) {
		draw(data, ctx_b);
	});
	
}


function draw(data, which_canvas) {
		var total_deps = 0,
			nnz = data.length,
			max_from_file,
			max_to_file,
			max_file,
			length = 650;
			
		max_from_file = d3.max(data, function(d) { return Number(d.from_file); });
		max_to_file = d3.max(data, function(d) { return Number(d.to_file); });
		max_file = (max_from_file > max_to_file) ? max_from_file : max_to_file;
			
		//data.map(function(d) { total_deps += Number(d.count_references); });
		//console.log(data);
		console.log("nnz", nnz);
		console.log("max_file", max_file);
		console.log("matrix size", Math.pow(max_file, 2));
		
		console.log("density", (nnz/(Math.pow(max_file, 2))*100).toFixed(2) + "%");
		
		var xMin = 0,
	    xMax = max_file,
	    yMin = 0,
	    yMax = max_file;
	    
		var xScale = d3.scale.linear()
    	    .domain([xMin, xMax])
        	.range([0, length]);
        
	    var yScale = d3.scale.linear()
    	    .domain([yMin, yMax])
        	.range([0, length]);
	
		//a circle per observation
		$.each(data, function(i, d) {
			which_canvas.fillStyle = "rgba(235, 235, 235, " + alpha + ")";
			which_canvas.beginPath();
			which_canvas.rect(xScale(d.to_file), yScale(d.from_file), point_size, point_size)
			which_canvas.closePath();
			which_canvas.fill();
			
			//add the module name here
			/*which_canvas.lineWidth=1;
			which_canvas.fillStyle = "rgba(235, 235, 235, " + 0.1 + ")";
			//which_canvas.lineStyle="#ffffff";
			which_canvas.font="8px sans-serif";
			which_canvas.fillText(d.from_file, xScale(d.to_file), yScale(d.from_file));*/
		});		
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getHumanSize(size) {
	var sizePrefixes = ' kmbtpezyxwvu';
	if(size <= 0) return '0';
	var t2 = Math.min(Math.floor(Math.log(size)/Math.log(1000)), 12);
	return (Math.round(size * 100 / Math.pow(1000, t2)) / 100) +
	//return (Math.round(size * 10 / Math.pow(1000, t2)) / 10) +
		sizePrefixes.charAt(t2).replace(' ', '');
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}