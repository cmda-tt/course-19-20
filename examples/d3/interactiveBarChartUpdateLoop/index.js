import { select } from 'd3'
import { prepareData, transformData } from './prepareData';

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
// Store the raw unnested data globally so we don't have to pass it to every function
let unNestedData
// Store the nested data
let nestedData
//The initial variable the y axis is set on
let yVar =  "biggestExpenseAvg"//"biggestExpenseAvg" //  "sistersAvg" //"heightAvg"
let xVar = "preference"

makeVisualization()
// Our main function which runs other function to make a visualization
async function makeVisualization(){
  //Use the prepareData function to get our data
  unNestedData = await prepareData(endpoint)
  //Set up the initial data transformation
  nestedData = transformData(unNestedData, xVar)
  const xFields = Object.keys(unNestedData[0]);
	const yFields = Object.keys(nestedData[0].value);
  
  setupInput(yFields, xFields)
	setupScales()
  setupAxes()
  //Trigger the initial rendering of bars so we have something to look at
  selectionChangedX()
}

//This function will change the graph when the user selects another variable
function selectionChangedY(){
  //'this' refers to the form element!
  console.log("Changing y axis to reflect this variable", this.value)
	yVar = this.value
  // Update the domain to reflect the currently selected variable
  y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] );
  //Update the bars to reflect their new height
  svg.selectAll('.bar')
    .attr('y', d => y(d.value[yVar]))
    .attr('height', d => height - y(d.value[yVar]))
  svg.select('.axis-y')
      .call(d3.axisLeft(y).ticks(10))
}

//Update the x domain and the bars on user input
function selectionChangedX(){
  //When we first call this function it's not as an event handler so we need this check
  xVar = this ? this.value : xVar
  console.log("Changing x axis to reflect this variable", xVar)
  //Change the global data to reflect the new nesting
  nestedData = transformData(unNestedData, xVar)
  	//Sort on the key
    .sort((a,b) => d3.ascending(parseInt(a.key), parseInt(b.key)))
  x.domain(nestedData.map(item => item.key))
  // Update the domain so the new y maximum is taken into account
  y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] );
  const bars = group.selectAll('.bar')
  	.data(nestedData)
  //The update selection
  bars
   	.attr('x', d => x(d.key))
    .attr('y', d => y(d.value[yVar]))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.value[yVar]))
  //The enter selection
  bars
  	.enter()
  	.append('rect')
      .attr('class', 'bar')
      .attr('x' ,d => x(d.key))
      .attr('y', d => y(d.value[yVar]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value[yVar]))
  //The exit selection
  bars
    .exit()
    .remove()
  //Update the ticks on the axes
  svg.select('.axis-x')
      .call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')')
  svg.select('.axis-y')
      .call(d3.axisLeft(y).ticks(10))
}

function setupScales(){
  //We'll set the x domain to the different preferences
  x.domain(nestedData.map(preference => preference.key))
  //The y-domain is set to the min and max of the current y variable
  y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] )
  x.rangeRound([0, width]);
  y.rangeRound([height, 0]);
}

function setupAxes(){
  group
    .append('g')
    .attr('class', 'axis axis-x')
  	.call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')')
  group
    .append('g')
    .attr('class', 'axis axis-y')
  	.call(d3.axisLeft(y).ticks(10))
}

//This awesome function makes dynamic input options based on our data!
//You can also create the options by hand if you can't follow what happens here
function setupInput(yFields, xFields){
	d3.select('form')
    .append('select')
  	.text("Select a text value")
    .on('change', selectionChangedY)
    .selectAll('option')
    .data(yFields)
    .enter()
    .append('option')
    	.attr('value', d => d)
    	.text(d => "y-axis variable: " + d) 
  		.property("selected", d => d === yVar)
  d3.select('form')
    .append('select')
    .on('change', selectionChangedX)
    .selectAll('option')
    .data(xFields)
    .enter()
    .append('option')
    	.attr('value', d => d)
    	.text(d => "x-axis variable: " + d) 
  		.property("selected", d => d === xVar)
}