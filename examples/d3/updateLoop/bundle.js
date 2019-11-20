(function (d3$1) {
  'use strict';

  /*
  *	This module takes care of gathering, cleaning, and transforming our data :)
  */

  async function prepareData(url){
    
    //Load the data and return a promise which resolves with said data
  	let data = await loadData(url);
    // console.log("rawData: ", data)
    //Filter out entries that don't have the main variable we're using
    data = data.filter(entry => filterData(entry, "preference"));
    // console.log("filteredData", data)
    //Clean data
  	data = data.map(cleanData);
    // console.log("cleanedData: ", data)
    //Transform data for our visualization
  	data = transformData(data);
    // console.log("transformedData: ", data)
    return data
  }

  //Load the data and return a promise which resolves with said data
  function loadData(url, query){
    return d3.json(url)
  }

  //Nest the data per preference (this will be our x-axis value
  //Rollup data so we get averages and totals for each variable
  //Note: this could also be done when visualizing the values
  //			and we could make this pattern more functional by creating a mean and total function
  function transformData(source){
    let transformed =  d3.nest()
  		.key(d => d.preference)
    	.rollup(d => {
        return {
          amount: d.length,
          brothersAvg: d3.mean(d.map(correspondent => correspondent.brothers)),
          brothersTotal: d3.sum(d.map(correspondent => correspondent.brothers)),
          sistersAvg: d3.mean(d.map(correspondent => correspondent.sisters)),
          heightAvg: d3.mean(d.map(correspondent => correspondent.height)),
          healthAvg: d3.mean(d.map(correspondent => correspondent.health)),
          stressAvg: d3.mean(d.map(correspondent => correspondent.stress)),
          biggestExpenseAvg: d3.mean(d.map(correspondent => correspondent.biggestExpense)),
          menTotal: d3.sum(d.map(correspondent => correspondent.gender == "Man"? 1: 0)),
          womenTotal: d3.sum(d.map(correspondent => correspondent.gender == "Vrouw"? 1: 0)),
        }
      })
  		.entries(source);
    return transformed
  }

  //Returns true for each row that has something filled in for the given property
  function filterData(row, property){
   return row[property] != "" && row[property] != undefined
  }

  //This function returns properly typed properties for our data

  function cleanData(row){
    return {
      gender: row.gender,
      brothers: Number(row.brothers),
      sisters: Number(row.sisters),
      height: Number(row.height),
      health: Number(row.health),
      stress: Number(row.stress),
      biggestExpense: Number(row.biggestExpense),
      id: Number(row.id),
      license: row.license,
      //Note that we're selecting here based on first mentioned preference
      //We COULD however, allow duplicate entries so that someone who has 3 prefs
      // ends up in the value array of each of those preferences.
      // To do that, store the entire value and use preference.contains() in the nest function
      preference: row.preference.split(",")[0]
    }
  }

  /*
  * Data prepared by Laurens, chartcode largely by Titus from
  * https://github.com/cmda-tt/course-17-18/blob/master/site/class-4/axis/index.js
  */

  const endpoint = 'https://gist.githubusercontent.com/Razpudding/f871bd3fb42008de991cfc8cf689dcbf/raw/35c7867c24d60bd59fc12ab79176305f4eb8480b/surveyDataByInterest.json';
  const svg = d3$1.select('svg');
  const margin = {top: 48, right: 72, bottom: 120, left: 72};
  const height = parseInt(svg.style('height'), 10) - margin.top - margin.bottom;
  const width = parseInt(svg.style('width'), 10) - margin.left - margin.right;
  /* Conventional margins: https://bl.ocks.org/mbostock/3019563. */
  const group = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Scales
  const x = d3.scaleBand().padding(0.2);
  const y = d3.scaleLinear();

  //the current variable the y axis is set on
  let yVar =  "biggestExpenseAvg";//"biggestExpenseAvg" //  "sistersAvg" //"heightAvg"

  makeVisualization();
  // Our main function which runs other function to make a visualization
  async function makeVisualization(){
    //Use the prepareData module to get and process our data
    let data = await prepareData(endpoint);
    console.log("Transformed data:", data);
  	const fields = Object.keys(data[0].value);
    console.log(fields);
    //Let's set up our scales in a separate function
    setupInput(fields);
  	setupScales(data);
    console.log(setupAxes());
    
    drawBars(group, data);
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
      .attr('height', d => height - y(d.value[yVar]));
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
    const xAxis = group
      .append('g')
      .attr('class', 'axis axis-x')
    	.call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')');
    const yAxis = group
      .append('g')
      .attr('class', 'axis axis-y')
    	.call(d3.axisLeft(y).ticks(10));
    return xAxis
  }

  //This awesome function makes dynamic input options based on our data!
  //You can also create the options by hand if you can't follow what happens here
  function setupInput(fields){
    const form = d3.select('form')
      .style('left', '16px')
      .style('top', '16px')
      .append('select')
      .on('change', selectionChanged)
      .selectAll('option')
      .data(fields)
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d); 
    // console.log("form",form)
  }

  //This function will change the graph when the user selects another variable
  function selectionChanged(){
    console.log("Changing graph to reflect this variable", this.value);
  	yVar = this.value;
    
    y.domain([0, d3.max(data, current)]);
    
    svg.selectAll('.bar')
     	.attr('x', d => x(d.key))
      .attr('y', d => y(d.value[yVar]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value[yVar]));
    svg.select('.axis-y')
        .call(d3.axisLeft(y).ticks(10))
        .selectAll('g');
  }

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInByZXBhcmVEYXRhLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbipcdFRoaXMgbW9kdWxlIHRha2VzIGNhcmUgb2YgZ2F0aGVyaW5nLCBjbGVhbmluZywgYW5kIHRyYW5zZm9ybWluZyBvdXIgZGF0YSA6KVxuKi9cbmltcG9ydCB7IG1lYW4gfSBmcm9tICdkMydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZXBhcmVEYXRhKHVybCl7XG4gIFxuICAvL0xvYWQgdGhlIGRhdGEgYW5kIHJldHVybiBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBzYWlkIGRhdGFcblx0bGV0IGRhdGEgPSBhd2FpdCBsb2FkRGF0YSh1cmwpXG4gIC8vIGNvbnNvbGUubG9nKFwicmF3RGF0YTogXCIsIGRhdGEpXG4gIC8vRmlsdGVyIG91dCBlbnRyaWVzIHRoYXQgZG9uJ3QgaGF2ZSB0aGUgbWFpbiB2YXJpYWJsZSB3ZSdyZSB1c2luZ1xuICBkYXRhID0gZGF0YS5maWx0ZXIoZW50cnkgPT4gZmlsdGVyRGF0YShlbnRyeSwgXCJwcmVmZXJlbmNlXCIpKVxuICAvLyBjb25zb2xlLmxvZyhcImZpbHRlcmVkRGF0YVwiLCBkYXRhKVxuICAvL0NsZWFuIGRhdGFcblx0ZGF0YSA9IGRhdGEubWFwKGNsZWFuRGF0YSlcbiAgLy8gY29uc29sZS5sb2coXCJjbGVhbmVkRGF0YTogXCIsIGRhdGEpXG4gIC8vVHJhbnNmb3JtIGRhdGEgZm9yIG91ciB2aXN1YWxpemF0aW9uXG5cdGRhdGEgPSB0cmFuc2Zvcm1EYXRhKGRhdGEpXG4gIC8vIGNvbnNvbGUubG9nKFwidHJhbnNmb3JtZWREYXRhOiBcIiwgZGF0YSlcbiAgcmV0dXJuIGRhdGFcbn1cblxuLy9Mb2FkIHRoZSBkYXRhIGFuZCByZXR1cm4gYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggc2FpZCBkYXRhXG5mdW5jdGlvbiBsb2FkRGF0YSh1cmwsIHF1ZXJ5KXtcbiAgcmV0dXJuIGQzLmpzb24odXJsKVxufVxuXG4vL05lc3QgdGhlIGRhdGEgcGVyIHByZWZlcmVuY2UgKHRoaXMgd2lsbCBiZSBvdXIgeC1heGlzIHZhbHVlXG4vL1JvbGx1cCBkYXRhIHNvIHdlIGdldCBhdmVyYWdlcyBhbmQgdG90YWxzIGZvciBlYWNoIHZhcmlhYmxlXG4vL05vdGU6IHRoaXMgY291bGQgYWxzbyBiZSBkb25lIHdoZW4gdmlzdWFsaXppbmcgdGhlIHZhbHVlc1xuLy9cdFx0XHRhbmQgd2UgY291bGQgbWFrZSB0aGlzIHBhdHRlcm4gbW9yZSBmdW5jdGlvbmFsIGJ5IGNyZWF0aW5nIGEgbWVhbiBhbmQgdG90YWwgZnVuY3Rpb25cbmZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoc291cmNlKXtcbiAgbGV0IHRyYW5zZm9ybWVkID0gIGQzLm5lc3QoKVxuXHRcdC5rZXkoZCA9PiBkLnByZWZlcmVuY2UpXG4gIFx0LnJvbGx1cChkID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFtb3VudDogZC5sZW5ndGgsXG4gICAgICAgIGJyb3RoZXJzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5icm90aGVycykpLFxuICAgICAgICBicm90aGVyc1RvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJyb3RoZXJzKSksXG4gICAgICAgIHNpc3RlcnNBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LnNpc3RlcnMpKSxcbiAgICAgICAgaGVpZ2h0QXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWlnaHQpKSxcbiAgICAgICAgaGVhbHRoQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWFsdGgpKSxcbiAgICAgICAgc3RyZXNzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5zdHJlc3MpKSxcbiAgICAgICAgYmlnZ2VzdEV4cGVuc2VBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJpZ2dlc3RFeHBlbnNlKSksXG4gICAgICAgIG1lblRvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmdlbmRlciA9PSBcIk1hblwiPyAxOiAwKSksXG4gICAgICAgIHdvbWVuVG90YWw6IGQzLnN1bShkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuZ2VuZGVyID09IFwiVnJvdXdcIj8gMTogMCkpLFxuICAgICAgfVxuICAgIH0pXG5cdFx0LmVudHJpZXMoc291cmNlKTtcbiAgcmV0dXJuIHRyYW5zZm9ybWVkXG59XG5cbi8vUmV0dXJucyB0cnVlIGZvciBlYWNoIHJvdyB0aGF0IGhhcyBzb21ldGhpbmcgZmlsbGVkIGluIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHlcbmZ1bmN0aW9uIGZpbHRlckRhdGEocm93LCBwcm9wZXJ0eSl7XG4gcmV0dXJuIHJvd1twcm9wZXJ0eV0gIT0gXCJcIiAmJiByb3dbcHJvcGVydHldICE9IHVuZGVmaW5lZFxufVxuXG4vL1RoaXMgZnVuY3Rpb24gcmV0dXJucyBwcm9wZXJseSB0eXBlZCBwcm9wZXJ0aWVzIGZvciBvdXIgZGF0YVxuXG5mdW5jdGlvbiBjbGVhbkRhdGEocm93KXtcbiAgcmV0dXJuIHtcbiAgICBnZW5kZXI6IHJvdy5nZW5kZXIsXG4gICAgYnJvdGhlcnM6IE51bWJlcihyb3cuYnJvdGhlcnMpLFxuICAgIHNpc3RlcnM6IE51bWJlcihyb3cuc2lzdGVycyksXG4gICAgaGVpZ2h0OiBOdW1iZXIocm93LmhlaWdodCksXG4gICAgaGVhbHRoOiBOdW1iZXIocm93LmhlYWx0aCksXG4gICAgc3RyZXNzOiBOdW1iZXIocm93LnN0cmVzcyksXG4gICAgYmlnZ2VzdEV4cGVuc2U6IE51bWJlcihyb3cuYmlnZ2VzdEV4cGVuc2UpLFxuICAgIGlkOiBOdW1iZXIocm93LmlkKSxcbiAgICBsaWNlbnNlOiByb3cubGljZW5zZSxcbiAgICAvL05vdGUgdGhhdCB3ZSdyZSBzZWxlY3RpbmcgaGVyZSBiYXNlZCBvbiBmaXJzdCBtZW50aW9uZWQgcHJlZmVyZW5jZVxuICAgIC8vV2UgQ09VTEQgaG93ZXZlciwgYWxsb3cgZHVwbGljYXRlIGVudHJpZXMgc28gdGhhdCBzb21lb25lIHdobyBoYXMgMyBwcmVmc1xuICAgIC8vIGVuZHMgdXAgaW4gdGhlIHZhbHVlIGFycmF5IG9mIGVhY2ggb2YgdGhvc2UgcHJlZmVyZW5jZXMuXG4gICAgLy8gVG8gZG8gdGhhdCwgc3RvcmUgdGhlIGVudGlyZSB2YWx1ZSBhbmQgdXNlIHByZWZlcmVuY2UuY29udGFpbnMoKSBpbiB0aGUgbmVzdCBmdW5jdGlvblxuICAgIHByZWZlcmVuY2U6IHJvdy5wcmVmZXJlbmNlLnNwbGl0KFwiLFwiKVswXVxuICB9XG59IiwiLypcbiogRGF0YSBwcmVwYXJlZCBieSBMYXVyZW5zLCBjaGFydGNvZGUgbGFyZ2VseSBieSBUaXR1cyBmcm9tXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9jbWRhLXR0L2NvdXJzZS0xNy0xOC9ibG9iL21hc3Rlci9zaXRlL2NsYXNzLTQvYXhpcy9pbmRleC5qc1xuKi9cbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gJ2QzJ1xuaW1wb3J0IHsgcHJlcGFyZURhdGEgfSBmcm9tICcuL3ByZXBhcmVEYXRhJztcblxuY29uc3QgZW5kcG9pbnQgPSAnaHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9SYXpwdWRkaW5nL2Y4NzFiZDNmYjQyMDA4ZGU5OTFjZmM4Y2Y2ODlkY2JmL3Jhdy8zNWM3ODY3YzI0ZDYwYmQ1OWZjMTJhYjc5MTc2MzA1ZjRlYjg0ODBiL3N1cnZleURhdGFCeUludGVyZXN0Lmpzb24nXG5jb25zdCBzdmcgPSBzZWxlY3QoJ3N2ZycpXG5jb25zdCBtYXJnaW4gPSB7dG9wOiA0OCwgcmlnaHQ6IDcyLCBib3R0b206IDEyMCwgbGVmdDogNzJ9XG5jb25zdCBoZWlnaHQgPSBwYXJzZUludChzdmcuc3R5bGUoJ2hlaWdodCcpLCAxMCkgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbVxuY29uc3Qgd2lkdGggPSBwYXJzZUludChzdmcuc3R5bGUoJ3dpZHRoJyksIDEwKSAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XG4vKiBDb252ZW50aW9uYWwgbWFyZ2luczogaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8zMDE5NTYzLiAqL1xuY29uc3QgZ3JvdXAgPSBzdmdcbiAgLmFwcGVuZCgnZycpXG4gIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBtYXJnaW4ubGVmdCArICcsJyArIG1hcmdpbi50b3AgKyAnKScpO1xuXG4vLyBTY2FsZXNcbmNvbnN0IHggPSBkMy5zY2FsZUJhbmQoKS5wYWRkaW5nKDAuMilcbmNvbnN0IHkgPSBkMy5zY2FsZUxpbmVhcigpXG5cbi8vdGhlIGN1cnJlbnQgdmFyaWFibGUgdGhlIHkgYXhpcyBpcyBzZXQgb25cbmxldCB5VmFyID0gIFwiYmlnZ2VzdEV4cGVuc2VBdmdcIi8vXCJiaWdnZXN0RXhwZW5zZUF2Z1wiIC8vICBcInNpc3RlcnNBdmdcIiAvL1wiaGVpZ2h0QXZnXCJcblxubWFrZVZpc3VhbGl6YXRpb24oKVxuLy8gT3VyIG1haW4gZnVuY3Rpb24gd2hpY2ggcnVucyBvdGhlciBmdW5jdGlvbiB0byBtYWtlIGEgdmlzdWFsaXphdGlvblxuYXN5bmMgZnVuY3Rpb24gbWFrZVZpc3VhbGl6YXRpb24oKXtcbiAgLy9Vc2UgdGhlIHByZXBhcmVEYXRhIG1vZHVsZSB0byBnZXQgYW5kIHByb2Nlc3Mgb3VyIGRhdGFcbiAgbGV0IGRhdGEgPSBhd2FpdCBwcmVwYXJlRGF0YShlbmRwb2ludClcbiAgY29uc29sZS5sb2coXCJUcmFuc2Zvcm1lZCBkYXRhOlwiLCBkYXRhKVxuXHRjb25zdCBmaWVsZHMgPSBPYmplY3Qua2V5cyhkYXRhWzBdLnZhbHVlKTtcbiAgY29uc29sZS5sb2coZmllbGRzKVxuICAvL0xldCdzIHNldCB1cCBvdXIgc2NhbGVzIGluIGEgc2VwYXJhdGUgZnVuY3Rpb25cbiAgc2V0dXBJbnB1dChmaWVsZHMpXG5cdHNldHVwU2NhbGVzKGRhdGEpXG4gIGNvbnNvbGUubG9nKHNldHVwQXhlcygpKVxuICBcbiAgZHJhd0JhcnMoZ3JvdXAsIGRhdGEpXG59XG5cbi8vUGxvdCBlYWNoIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhIGNpcmNsZVxuZnVuY3Rpb24gZHJhd0JhcnMoY29udGFpbmVyLCBkYXRhKSB7XG4gICBjb25zdCBiYXJzID0gY29udGFpbmVyXG4gICAgLnNlbGVjdEFsbCgnLmJhcicpXG4gICAgLmRhdGEoZGF0YSlcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgIC5hdHRyKCdjbGFzcycsICdiYXInKVxuICAgXHQuYXR0cigneCcsIGQgPT4geChkLmtleSkpXG4gICAgLmF0dHIoJ3knLCBkID0+IHkoZC52YWx1ZVt5VmFyXSkpXG4gICAgLmF0dHIoJ3dpZHRoJywgeC5iYW5kd2lkdGgoKSlcbiAgICAuYXR0cignaGVpZ2h0JywgZCA9PiBoZWlnaHQgLSB5KGQudmFsdWVbeVZhcl0pKVxufVxuXG4vL1NldCB1cCB0aGUgc2NhbGVzIHdlJ2xsIHVzZVxuZnVuY3Rpb24gc2V0dXBTY2FsZXMoZGF0YSl7XG4gIC8vV2UnbGwgc2V0IHRoZSB4IGRvbWFpbiB0byB0aGUgZGlmZmVyZW50IHByZWZlcmVuY2VzXG4gIHguZG9tYWluKGRhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS5rZXkpKTtcbiAgLy9UaGUgeS1kb21haW4gaXMgc2V0IHRvIHRoZSBtaW4gYW5kIG1heCBvZiB0aGUgY3VycmVudCB5IHZhcmlhYmxlXG4gIHkuZG9tYWluKFswLCBkMy5tYXgoIGRhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS52YWx1ZVt5VmFyXSkgKV0gKTtcbiAgeC5yYW5nZVJvdW5kKFswLCB3aWR0aF0pO1xuICB5LnJhbmdlUm91bmQoW2hlaWdodCwgMF0pO1xuICAvLyBjb25zb2xlLmxvZyh5LmRvbWFpbigpKVxufVxuXG5mdW5jdGlvbiBzZXR1cEF4ZXMoKXtcbiAgY29uc3QgeEF4aXMgPSBncm91cFxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteCcpXG4gIFx0LmNhbGwoZDMuYXhpc0JvdHRvbSh4KSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyBoZWlnaHQgKyAnKScpXG4gIGNvbnN0IHlBeGlzID0gZ3JvdXBcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxuICBcdC5jYWxsKGQzLmF4aXNMZWZ0KHkpLnRpY2tzKDEwKSlcbiAgcmV0dXJuIHhBeGlzXG59XG5cbi8vVGhpcyBhd2Vzb21lIGZ1bmN0aW9uIG1ha2VzIGR5bmFtaWMgaW5wdXQgb3B0aW9ucyBiYXNlZCBvbiBvdXIgZGF0YSFcbi8vWW91IGNhbiBhbHNvIGNyZWF0ZSB0aGUgb3B0aW9ucyBieSBoYW5kIGlmIHlvdSBjYW4ndCBmb2xsb3cgd2hhdCBoYXBwZW5zIGhlcmVcbmZ1bmN0aW9uIHNldHVwSW5wdXQoZmllbGRzKXtcbiAgY29uc3QgZm9ybSA9IGQzLnNlbGVjdCgnZm9ybScpXG4gICAgLnN0eWxlKCdsZWZ0JywgJzE2cHgnKVxuICAgIC5zdHlsZSgndG9wJywgJzE2cHgnKVxuICAgIC5hcHBlbmQoJ3NlbGVjdCcpXG4gICAgLm9uKCdjaGFuZ2UnLCBzZWxlY3Rpb25DaGFuZ2VkKVxuICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgLmRhdGEoZmllbGRzKVxuICAgIC5lbnRlcigpXG4gICAgLmFwcGVuZCgnb3B0aW9uJylcbiAgICAuYXR0cigndmFsdWUnLCBkID0+IGQpXG4gICAgLnRleHQoZCA9PiBkKSBcbiAgLy8gY29uc29sZS5sb2coXCJmb3JtXCIsZm9ybSlcbn1cblxuLy9UaGlzIGZ1bmN0aW9uIHdpbGwgY2hhbmdlIHRoZSBncmFwaCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYW5vdGhlciB2YXJpYWJsZVxuZnVuY3Rpb24gc2VsZWN0aW9uQ2hhbmdlZCgpe1xuICBjb25zb2xlLmxvZyhcIkNoYW5naW5nIGdyYXBoIHRvIHJlZmxlY3QgdGhpcyB2YXJpYWJsZVwiLCB0aGlzLnZhbHVlKVxuXHR5VmFyID0gdGhpcy52YWx1ZVxuICBcbiAgeS5kb21haW4oWzAsIGQzLm1heChkYXRhLCBjdXJyZW50KV0pO1xuICBcbiAgc3ZnLnNlbGVjdEFsbCgnLmJhcicpXG4gICBcdC5hdHRyKCd4JywgZCA9PiB4KGQua2V5KSlcbiAgICAuYXR0cigneScsIGQgPT4geShkLnZhbHVlW3lWYXJdKSlcbiAgICAuYXR0cignd2lkdGgnLCB4LmJhbmR3aWR0aCgpKVxuICAgIC5hdHRyKCdoZWlnaHQnLCBkID0+IGhlaWdodCAtIHkoZC52YWx1ZVt5VmFyXSkpXG4gIHN2Zy5zZWxlY3QoJy5heGlzLXknKVxuICAgICAgLmNhbGwoZDMuYXhpc0xlZnQoeSkudGlja3MoMTApKVxuICAgICAgLnNlbGVjdEFsbCgnZycpXG59Il0sIm5hbWVzIjpbInNlbGVjdCJdLCJtYXBwaW5ncyI6Ijs7O0VBQUE7OztBQUdBO0FBRUEsRUFBTyxlQUFlLFdBQVcsQ0FBQyxHQUFHLENBQUM7OztHQUdyQyxJQUFJLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUM7OztJQUc3QixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsRUFBQzs7O0dBRzdELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBQzs7O0dBRzFCLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFDOztJQUV6QixPQUFPLElBQUk7R0FDWjs7O0VBR0QsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztJQUMzQixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0dB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