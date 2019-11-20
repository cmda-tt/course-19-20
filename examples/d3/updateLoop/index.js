/*
* Data prepared by Laurens, chartcode largely by Titus from
* https://github.com/cmda-tt/course-17-18/blob/master/site/class-4/axis/index.js
*/
import { select } from 'd3'
import { prepareData } from './prepareData';

const endpoint = 'https://gist.githubusercontent.com/Razpudding/f871bd3fb42008de991cfc8cf689dcbf/raw/35c7867c24d60bd59fc12ab79176305f4eb8480b/surveyDataByInterest.json'
const svg = select('svg')
const margin = {top: 48, right: 72, bottom: 120, left: 72}
const height = parseInt(svg.style('height'), 10) - margin.top - margin.bottom
const width = parseInt(svg.style('width'), 10) - margin.left - margin.right

/* Conventional margins: https://bl.ocks.org/mbostock/3019563. */
const group = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Scales
const x = d3.scaleBand().padding(0.2)
const y = d3.scaleLinear()

let yVar =  "biggestExpenseAvg"//"biggestExpenseAvg" //  "sistersAvg" //"heightAvg"

makeVisualization()
// Our main function which runs other function to make a visualization
async function makeVisualization(){
  //Use the prepareData module to get and process our data
  let data = await prepareData(endpoint)
  console.log("Transformed data:", data)
	const fields = Object.keys(data[0].value);
  console.log(fields)
  //Let's set up our scales in a separate function
	setupScales(data)
  setupAxes()
  
  drawBars(group, data)
}

//Plot each location on the map with a circle
function drawBars(container, data) {
   const bars = container
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
   	.attr('x', d => x(d.key))
    .attr('y', d => y(d.value[yVar]))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.value[yVar]))
}

//Set up the scales we'll use
function setupScales(data){
  //We'll set the x domain to the different preferences
  x.domain(data.map(preference => preference.key));
  //The y-domain is set to the min and max of the current y variable
  y.domain([0, d3.max( data.map(preference => preference.value[yVar]) )] );
  x.rangeRound([0, width]);
  y.rangeRound([height, 0]);
  // console.log(y.domain())
}

function setupAxes(){
  /* Add a group for the x axis. */
  var xAxis = group
    .append('g')
    .attr('class', 'axis axis-x');
  /* Add a group for the y axis. */
  var yAxis = group
    .append('g')
    .attr('class', 'axis axis-y');
  d3.select('.axis-y')
      .call(d3.axisLeft(y).ticks(10))
      .selectAll('g')
}