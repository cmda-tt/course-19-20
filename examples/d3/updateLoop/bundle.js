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
  	setupScales(data);
    setupAxes();
    
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
        .selectAll('g');
  }

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInByZXBhcmVEYXRhLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbipcdFRoaXMgbW9kdWxlIHRha2VzIGNhcmUgb2YgZ2F0aGVyaW5nLCBjbGVhbmluZywgYW5kIHRyYW5zZm9ybWluZyBvdXIgZGF0YSA6KVxuKi9cbmltcG9ydCB7IG1lYW4gfSBmcm9tICdkMydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZXBhcmVEYXRhKHVybCl7XG4gIFxuICAvL0xvYWQgdGhlIGRhdGEgYW5kIHJldHVybiBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBzYWlkIGRhdGFcblx0bGV0IGRhdGEgPSBhd2FpdCBsb2FkRGF0YSh1cmwpXG4gIC8vIGNvbnNvbGUubG9nKFwicmF3RGF0YTogXCIsIGRhdGEpXG4gIC8vRmlsdGVyIG91dCBlbnRyaWVzIHRoYXQgZG9uJ3QgaGF2ZSB0aGUgbWFpbiB2YXJpYWJsZSB3ZSdyZSB1c2luZ1xuICBkYXRhID0gZGF0YS5maWx0ZXIoZW50cnkgPT4gZmlsdGVyRGF0YShlbnRyeSwgXCJwcmVmZXJlbmNlXCIpKVxuICAvLyBjb25zb2xlLmxvZyhcImZpbHRlcmVkRGF0YVwiLCBkYXRhKVxuICAvL0NsZWFuIGRhdGFcblx0ZGF0YSA9IGRhdGEubWFwKGNsZWFuRGF0YSlcbiAgLy8gY29uc29sZS5sb2coXCJjbGVhbmVkRGF0YTogXCIsIGRhdGEpXG4gIC8vVHJhbnNmb3JtIGRhdGEgZm9yIG91ciB2aXN1YWxpemF0aW9uXG5cdGRhdGEgPSB0cmFuc2Zvcm1EYXRhKGRhdGEpXG4gIC8vIGNvbnNvbGUubG9nKFwidHJhbnNmb3JtZWREYXRhOiBcIiwgZGF0YSlcbiAgcmV0dXJuIGRhdGFcbn1cblxuLy9Mb2FkIHRoZSBkYXRhIGFuZCByZXR1cm4gYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggc2FpZCBkYXRhXG5mdW5jdGlvbiBsb2FkRGF0YSh1cmwsIHF1ZXJ5KXtcbiAgcmV0dXJuIGQzLmpzb24odXJsKVxufVxuXG4vL05lc3QgdGhlIGRhdGEgcGVyIHByZWZlcmVuY2UgKHRoaXMgd2lsbCBiZSBvdXIgeC1heGlzIHZhbHVlXG4vL1JvbGx1cCBkYXRhIHNvIHdlIGdldCBhdmVyYWdlcyBhbmQgdG90YWxzIGZvciBlYWNoIHZhcmlhYmxlXG4vL05vdGU6IHRoaXMgY291bGQgYWxzbyBiZSBkb25lIHdoZW4gdmlzdWFsaXppbmcgdGhlIHZhbHVlc1xuLy9cdFx0XHRhbmQgd2UgY291bGQgbWFrZSB0aGlzIHBhdHRlcm4gbW9yZSBmdW5jdGlvbmFsIGJ5IGNyZWF0aW5nIGEgbWVhbiBhbmQgdG90YWwgZnVuY3Rpb25cbmZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoc291cmNlKXtcbiAgbGV0IHRyYW5zZm9ybWVkID0gIGQzLm5lc3QoKVxuXHRcdC5rZXkoZCA9PiBkLnByZWZlcmVuY2UpXG4gIFx0LnJvbGx1cChkID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFtb3VudDogZC5sZW5ndGgsXG4gICAgICAgIGJyb3RoZXJzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5icm90aGVycykpLFxuICAgICAgICBicm90aGVyc1RvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJyb3RoZXJzKSksXG4gICAgICAgIHNpc3RlcnNBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LnNpc3RlcnMpKSxcbiAgICAgICAgaGVpZ2h0QXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWlnaHQpKSxcbiAgICAgICAgaGVhbHRoQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWFsdGgpKSxcbiAgICAgICAgc3RyZXNzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5zdHJlc3MpKSxcbiAgICAgICAgYmlnZ2VzdEV4cGVuc2VBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJpZ2dlc3RFeHBlbnNlKSksXG4gICAgICAgIG1lblRvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmdlbmRlciA9PSBcIk1hblwiPyAxOiAwKSksXG4gICAgICAgIHdvbWVuVG90YWw6IGQzLnN1bShkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuZ2VuZGVyID09IFwiVnJvdXdcIj8gMTogMCkpLFxuICAgICAgfVxuICAgIH0pXG5cdFx0LmVudHJpZXMoc291cmNlKTtcbiAgcmV0dXJuIHRyYW5zZm9ybWVkXG59XG5cbi8vUmV0dXJucyB0cnVlIGZvciBlYWNoIHJvdyB0aGF0IGhhcyBzb21ldGhpbmcgZmlsbGVkIGluIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHlcbmZ1bmN0aW9uIGZpbHRlckRhdGEocm93LCBwcm9wZXJ0eSl7XG4gcmV0dXJuIHJvd1twcm9wZXJ0eV0gIT0gXCJcIiAmJiByb3dbcHJvcGVydHldICE9IHVuZGVmaW5lZFxufVxuXG4vL1RoaXMgZnVuY3Rpb24gcmV0dXJucyBwcm9wZXJseSB0eXBlZCBwcm9wZXJ0aWVzIGZvciBvdXIgZGF0YVxuXG5mdW5jdGlvbiBjbGVhbkRhdGEocm93KXtcbiAgcmV0dXJuIHtcbiAgICBnZW5kZXI6IHJvdy5nZW5kZXIsXG4gICAgYnJvdGhlcnM6IE51bWJlcihyb3cuYnJvdGhlcnMpLFxuICAgIHNpc3RlcnM6IE51bWJlcihyb3cuc2lzdGVycyksXG4gICAgaGVpZ2h0OiBOdW1iZXIocm93LmhlaWdodCksXG4gICAgaGVhbHRoOiBOdW1iZXIocm93LmhlYWx0aCksXG4gICAgc3RyZXNzOiBOdW1iZXIocm93LnN0cmVzcyksXG4gICAgYmlnZ2VzdEV4cGVuc2U6IE51bWJlcihyb3cuYmlnZ2VzdEV4cGVuc2UpLFxuICAgIGlkOiBOdW1iZXIocm93LmlkKSxcbiAgICBsaWNlbnNlOiByb3cubGljZW5zZSxcbiAgICAvL05vdGUgdGhhdCB3ZSdyZSBzZWxlY3RpbmcgaGVyZSBiYXNlZCBvbiBmaXJzdCBtZW50aW9uZWQgcHJlZmVyZW5jZVxuICAgIC8vV2UgQ09VTEQgaG93ZXZlciwgYWxsb3cgZHVwbGljYXRlIGVudHJpZXMgc28gdGhhdCBzb21lb25lIHdobyBoYXMgMyBwcmVmc1xuICAgIC8vIGVuZHMgdXAgaW4gdGhlIHZhbHVlIGFycmF5IG9mIGVhY2ggb2YgdGhvc2UgcHJlZmVyZW5jZXMuXG4gICAgLy8gVG8gZG8gdGhhdCwgc3RvcmUgdGhlIGVudGlyZSB2YWx1ZSBhbmQgdXNlIHByZWZlcmVuY2UuY29udGFpbnMoKSBpbiB0aGUgbmVzdCBmdW5jdGlvblxuICAgIHByZWZlcmVuY2U6IHJvdy5wcmVmZXJlbmNlLnNwbGl0KFwiLFwiKVswXVxuICB9XG59IiwiLypcbiogRGF0YSBwcmVwYXJlZCBieSBMYXVyZW5zLCBjaGFydGNvZGUgbGFyZ2VseSBieSBUaXR1cyBmcm9tXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9jbWRhLXR0L2NvdXJzZS0xNy0xOC9ibG9iL21hc3Rlci9zaXRlL2NsYXNzLTQvYXhpcy9pbmRleC5qc1xuKi9cbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gJ2QzJ1xuaW1wb3J0IHsgcHJlcGFyZURhdGEgfSBmcm9tICcuL3ByZXBhcmVEYXRhJztcblxuY29uc3QgZW5kcG9pbnQgPSAnaHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9SYXpwdWRkaW5nL2Y4NzFiZDNmYjQyMDA4ZGU5OTFjZmM4Y2Y2ODlkY2JmL3Jhdy8zNWM3ODY3YzI0ZDYwYmQ1OWZjMTJhYjc5MTc2MzA1ZjRlYjg0ODBiL3N1cnZleURhdGFCeUludGVyZXN0Lmpzb24nXG5jb25zdCBzdmcgPSBzZWxlY3QoJ3N2ZycpXG5jb25zdCBtYXJnaW4gPSB7dG9wOiA0OCwgcmlnaHQ6IDcyLCBib3R0b206IDEyMCwgbGVmdDogNzJ9XG5jb25zdCBoZWlnaHQgPSBwYXJzZUludChzdmcuc3R5bGUoJ2hlaWdodCcpLCAxMCkgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbVxuY29uc3Qgd2lkdGggPSBwYXJzZUludChzdmcuc3R5bGUoJ3dpZHRoJyksIDEwKSAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XG5cbi8qIENvbnZlbnRpb25hbCBtYXJnaW5zOiBodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzMwMTk1NjMuICovXG5jb25zdCBncm91cCA9IHN2Z1xuICAuYXBwZW5kKCdnJylcbiAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG1hcmdpbi5sZWZ0ICsgJywnICsgbWFyZ2luLnRvcCArICcpJyk7XG5cbi8vIFNjYWxlc1xuY29uc3QgeCA9IGQzLnNjYWxlQmFuZCgpLnBhZGRpbmcoMC4yKVxuY29uc3QgeSA9IGQzLnNjYWxlTGluZWFyKClcblxubGV0IHlWYXIgPSAgXCJiaWdnZXN0RXhwZW5zZUF2Z1wiLy9cImJpZ2dlc3RFeHBlbnNlQXZnXCIgLy8gIFwic2lzdGVyc0F2Z1wiIC8vXCJoZWlnaHRBdmdcIlxuXG5tYWtlVmlzdWFsaXphdGlvbigpXG4vLyBPdXIgbWFpbiBmdW5jdGlvbiB3aGljaCBydW5zIG90aGVyIGZ1bmN0aW9uIHRvIG1ha2UgYSB2aXN1YWxpemF0aW9uXG5hc3luYyBmdW5jdGlvbiBtYWtlVmlzdWFsaXphdGlvbigpe1xuICAvL1VzZSB0aGUgcHJlcGFyZURhdGEgbW9kdWxlIHRvIGdldCBhbmQgcHJvY2VzcyBvdXIgZGF0YVxuICBsZXQgZGF0YSA9IGF3YWl0IHByZXBhcmVEYXRhKGVuZHBvaW50KVxuICBjb25zb2xlLmxvZyhcIlRyYW5zZm9ybWVkIGRhdGE6XCIsIGRhdGEpXG5cdGNvbnN0IGZpZWxkcyA9IE9iamVjdC5rZXlzKGRhdGFbMF0udmFsdWUpO1xuICBjb25zb2xlLmxvZyhmaWVsZHMpXG4gIC8vTGV0J3Mgc2V0IHVwIG91ciBzY2FsZXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvblxuXHRzZXR1cFNjYWxlcyhkYXRhKVxuICBzZXR1cEF4ZXMoKVxuICBcbiAgZHJhd0JhcnMoZ3JvdXAsIGRhdGEpXG59XG5cbi8vUGxvdCBlYWNoIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhIGNpcmNsZVxuZnVuY3Rpb24gZHJhd0JhcnMoY29udGFpbmVyLCBkYXRhKSB7XG4gICBjb25zdCBiYXJzID0gY29udGFpbmVyXG4gICAgLnNlbGVjdEFsbCgnLmJhcicpXG4gICAgLmRhdGEoZGF0YSlcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgIC5hdHRyKCdjbGFzcycsICdiYXInKVxuICAgXHQuYXR0cigneCcsIGQgPT4geChkLmtleSkpXG4gICAgLmF0dHIoJ3knLCBkID0+IHkoZC52YWx1ZVt5VmFyXSkpXG4gICAgLmF0dHIoJ3dpZHRoJywgeC5iYW5kd2lkdGgoKSlcbiAgICAuYXR0cignaGVpZ2h0JywgZCA9PiBoZWlnaHQgLSB5KGQudmFsdWVbeVZhcl0pKVxufVxuXG4vL1NldCB1cCB0aGUgc2NhbGVzIHdlJ2xsIHVzZVxuZnVuY3Rpb24gc2V0dXBTY2FsZXMoZGF0YSl7XG4gIC8vV2UnbGwgc2V0IHRoZSB4IGRvbWFpbiB0byB0aGUgZGlmZmVyZW50IHByZWZlcmVuY2VzXG4gIHguZG9tYWluKGRhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS5rZXkpKTtcbiAgLy9UaGUgeS1kb21haW4gaXMgc2V0IHRvIHRoZSBtaW4gYW5kIG1heCBvZiB0aGUgY3VycmVudCB5IHZhcmlhYmxlXG4gIHkuZG9tYWluKFswLCBkMy5tYXgoIGRhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS52YWx1ZVt5VmFyXSkgKV0gKTtcbiAgeC5yYW5nZVJvdW5kKFswLCB3aWR0aF0pO1xuICB5LnJhbmdlUm91bmQoW2hlaWdodCwgMF0pO1xuICAvLyBjb25zb2xlLmxvZyh5LmRvbWFpbigpKVxufVxuXG5mdW5jdGlvbiBzZXR1cEF4ZXMoKXtcbiAgLyogQWRkIGEgZ3JvdXAgZm9yIHRoZSB4IGF4aXMuICovXG4gIHZhciB4QXhpcyA9IGdyb3VwXG4gICAgLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14Jyk7XG4gIC8qIEFkZCBhIGdyb3VwIGZvciB0aGUgeSBheGlzLiAqL1xuICB2YXIgeUF4aXMgPSBncm91cFxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteScpO1xuICBkMy5zZWxlY3QoJy5heGlzLXknKVxuICAgICAgLmNhbGwoZDMuYXhpc0xlZnQoeSkudGlja3MoMTApKVxuICAgICAgLnNlbGVjdEFsbCgnZycpXG59Il0sIm5hbWVzIjpbInNlbGVjdCJdLCJtYXBwaW5ncyI6Ijs7O0VBQUE7OztBQUdBO0FBRUEsRUFBTyxlQUFlLFdBQVcsQ0FBQyxHQUFHLENBQUM7OztHQUdyQyxJQUFJLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUM7OztJQUc3QixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsRUFBQzs7O0dBRzdELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBQzs7O0dBRzFCLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFDOztJQUV6QixPQUFPLElBQUk7R0FDWjs7O0VBR0QsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztJQUMzQixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0dBQ3BCOzs7Ozs7RUFNRCxTQUFTLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDNUIsSUFBSSxXQUFXLElBQUksRUFBRSxDQUFDLElBQUksRUFBRTtLQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7TUFDckIsTUFBTSxDQUFDLENBQUMsSUFBSTtRQUNWLE9BQU87VUFDTCxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07VUFDaEIsV0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1VBQ3BFLGFBQWEsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztVQUNyRSxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7VUFDbEUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1VBQ2hFLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztVQUNoRSxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7VUFDaEUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7VUFDaEYsUUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1VBQzdFLFVBQVUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxNQUFNLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNs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