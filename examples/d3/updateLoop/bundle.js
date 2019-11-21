(function (d3$1) {
  'use strict';

  /*
  *	This module takes care of gathering, cleaning, and transforming our data :)
  */

  async function prepareData(url){
    
    //Load the data and return a promise which resolves with said data
  	let data = await loadData(url);
    console.log("rawData: ", data);
    //Filter out entries that don't have the main variable we're using
    data = data.filter(entry => filterData(entry, "preference"));
    console.log("filteredData", data);
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
          sistersTotal: d3.sum(d.map(correspondent => correspondent.sisters)),
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
   return (row[property] != "" && row[property] != undefined)
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
  // Global data variable
  let data;
  //The initial variable the y axis is set on
  let yVar =  "biggestExpenseAvg";//"biggestExpenseAvg" //  "sistersAvg" //"heightAvg"

  makeVisualization();
  // Our main function which runs other functions to make a visualization
  async function makeVisualization(){
    //Use the prepareData module to get and process our data
    data = await prepareData(endpoint);
    console.log("Transformed data:", data);
  	const fields = Object.keys(data[0].value);
    console.log(fields);
    //Let's set up our scales in a separate function
    setupInput(fields);
  	setupScales();
    setupAxes();
    drawBars();
  }

  //Draw the initial bars
  function drawBars() {
     const bars = group
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

  //This function will change the graph when the user selects another variable
  function selectionChanged(){
    //'this' refers to the form element!
    console.log("Changing graph to reflect this variable", this.value);
  	yVar = this.value;
    setupScales();
    //y.domain([0, d3.max( data.map(preference => preference.value[yVar]) )] );
    
    svg.selectAll('.bar')
      .attr('y', d => y(d.value[yVar]))
      .attr('height', d => height - y(d.value[yVar]));
    svg.select('.axis-y')
        .call(d3.axisLeft(y).ticks(10));
  }

  //Set up the scales we'll use
  function setupScales(){
    //We'll set the x domain to the different preferences
    x.domain(data.map(preference => preference.key));
    //The y-domain is set to the min and max of the current y variable
    y.domain([0, d3.max( data.map(preference => preference.value[yVar]) )] );
    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);
  }

  //Attach x and y axes to our svg
  function setupAxes(){
    group
      .append('g')
      .attr('class', 'axis axis-x')
    	.call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')');
    group
      .append('g')
      .attr('class', 'axis axis-y')
    	.call(d3.axisLeft(y).ticks(10));
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

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInByZXBhcmVEYXRhLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbipcdFRoaXMgbW9kdWxlIHRha2VzIGNhcmUgb2YgZ2F0aGVyaW5nLCBjbGVhbmluZywgYW5kIHRyYW5zZm9ybWluZyBvdXIgZGF0YSA6KVxuKi9cbmltcG9ydCB7IG1lYW4gfSBmcm9tICdkMydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZXBhcmVEYXRhKHVybCl7XG4gIFxuICAvL0xvYWQgdGhlIGRhdGEgYW5kIHJldHVybiBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBzYWlkIGRhdGFcblx0bGV0IGRhdGEgPSBhd2FpdCBsb2FkRGF0YSh1cmwpXG4gIGNvbnNvbGUubG9nKFwicmF3RGF0YTogXCIsIGRhdGEpXG4gIC8vRmlsdGVyIG91dCBlbnRyaWVzIHRoYXQgZG9uJ3QgaGF2ZSB0aGUgbWFpbiB2YXJpYWJsZSB3ZSdyZSB1c2luZ1xuICBkYXRhID0gZGF0YS5maWx0ZXIoZW50cnkgPT4gZmlsdGVyRGF0YShlbnRyeSwgXCJwcmVmZXJlbmNlXCIpKVxuICBjb25zb2xlLmxvZyhcImZpbHRlcmVkRGF0YVwiLCBkYXRhKVxuICAvL0NsZWFuIGRhdGFcblx0ZGF0YSA9IGRhdGEubWFwKGNsZWFuRGF0YSlcbiAgLy8gY29uc29sZS5sb2coXCJjbGVhbmVkRGF0YTogXCIsIGRhdGEpXG4gIC8vVHJhbnNmb3JtIGRhdGEgZm9yIG91ciB2aXN1YWxpemF0aW9uXG5cdGRhdGEgPSB0cmFuc2Zvcm1EYXRhKGRhdGEpXG4gIC8vIGNvbnNvbGUubG9nKFwidHJhbnNmb3JtZWREYXRhOiBcIiwgZGF0YSlcbiAgcmV0dXJuIGRhdGFcbn1cblxuLy9Mb2FkIHRoZSBkYXRhIGFuZCByZXR1cm4gYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggc2FpZCBkYXRhXG5mdW5jdGlvbiBsb2FkRGF0YSh1cmwsIHF1ZXJ5KXtcbiAgcmV0dXJuIGQzLmpzb24odXJsKVxufVxuXG4vL05lc3QgdGhlIGRhdGEgcGVyIHByZWZlcmVuY2UgKHRoaXMgd2lsbCBiZSBvdXIgeC1heGlzIHZhbHVlXG4vL1JvbGx1cCBkYXRhIHNvIHdlIGdldCBhdmVyYWdlcyBhbmQgdG90YWxzIGZvciBlYWNoIHZhcmlhYmxlXG4vL05vdGU6IHRoaXMgY291bGQgYWxzbyBiZSBkb25lIHdoZW4gdmlzdWFsaXppbmcgdGhlIHZhbHVlc1xuLy9cdFx0XHRhbmQgd2UgY291bGQgbWFrZSB0aGlzIHBhdHRlcm4gbW9yZSBmdW5jdGlvbmFsIGJ5IGNyZWF0aW5nIGEgbWVhbiBhbmQgdG90YWwgZnVuY3Rpb25cbmZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoc291cmNlKXtcbiAgbGV0IHRyYW5zZm9ybWVkID0gIGQzLm5lc3QoKVxuXHRcdC5rZXkoZCA9PiBkLnByZWZlcmVuY2UpXG4gIFx0LnJvbGx1cChkID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFtb3VudDogZC5sZW5ndGgsXG4gICAgICAgIGJyb3RoZXJzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5icm90aGVycykpLFxuICAgICAgICBicm90aGVyc1RvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJyb3RoZXJzKSksXG4gICAgICAgIHNpc3RlcnNBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LnNpc3RlcnMpKSxcbiAgICAgICAgc2lzdGVyc1RvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LnNpc3RlcnMpKSxcbiAgICAgICAgaGVpZ2h0QXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWlnaHQpKSxcbiAgICAgICAgaGVhbHRoQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5oZWFsdGgpKSxcbiAgICAgICAgc3RyZXNzQXZnOiBkMy5tZWFuKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5zdHJlc3MpKSxcbiAgICAgICAgYmlnZ2VzdEV4cGVuc2VBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJpZ2dlc3RFeHBlbnNlKSksXG4gICAgICAgIG1lblRvdGFsOiBkMy5zdW0oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmdlbmRlciA9PSBcIk1hblwiPyAxOiAwKSksXG4gICAgICAgIHdvbWVuVG90YWw6IGQzLnN1bShkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuZ2VuZGVyID09IFwiVnJvdXdcIj8gMTogMCkpLFxuICAgICAgfVxuICAgIH0pXG5cdFx0LmVudHJpZXMoc291cmNlKTtcbiAgcmV0dXJuIHRyYW5zZm9ybWVkXG59XG5cbi8vUmV0dXJucyB0cnVlIGZvciBlYWNoIHJvdyB0aGF0IGhhcyBzb21ldGhpbmcgZmlsbGVkIGluIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHlcbmZ1bmN0aW9uIGZpbHRlckRhdGEocm93LCBwcm9wZXJ0eSl7XG4gcmV0dXJuIChyb3dbcHJvcGVydHldICE9IFwiXCIgJiYgcm93W3Byb3BlcnR5XSAhPSB1bmRlZmluZWQpXG59XG5cbi8vVGhpcyBmdW5jdGlvbiByZXR1cm5zIHByb3Blcmx5IHR5cGVkIHByb3BlcnRpZXMgZm9yIG91ciBkYXRhXG5cbmZ1bmN0aW9uIGNsZWFuRGF0YShyb3cpe1xuICByZXR1cm4ge1xuICAgIGdlbmRlcjogcm93LmdlbmRlcixcbiAgICBicm90aGVyczogTnVtYmVyKHJvdy5icm90aGVycyksXG4gICAgc2lzdGVyczogTnVtYmVyKHJvdy5zaXN0ZXJzKSxcbiAgICBoZWlnaHQ6IE51bWJlcihyb3cuaGVpZ2h0KSxcbiAgICBoZWFsdGg6IE51bWJlcihyb3cuaGVhbHRoKSxcbiAgICBzdHJlc3M6IE51bWJlcihyb3cuc3RyZXNzKSxcbiAgICBiaWdnZXN0RXhwZW5zZTogTnVtYmVyKHJvdy5iaWdnZXN0RXhwZW5zZSksXG4gICAgaWQ6IE51bWJlcihyb3cuaWQpLFxuICAgIGxpY2Vuc2U6IHJvdy5saWNlbnNlLFxuICAgIC8vTm90ZSB0aGF0IHdlJ3JlIHNlbGVjdGluZyBoZXJlIGJhc2VkIG9uIGZpcnN0IG1lbnRpb25lZCBwcmVmZXJlbmNlXG4gICAgLy9XZSBDT1VMRCBob3dldmVyLCBhbGxvdyBkdXBsaWNhdGUgZW50cmllcyBzbyB0aGF0IHNvbWVvbmUgd2hvIGhhcyAzIHByZWZzXG4gICAgLy8gZW5kcyB1cCBpbiB0aGUgdmFsdWUgYXJyYXkgb2YgZWFjaCBvZiB0aG9zZSBwcmVmZXJlbmNlcy5cbiAgICAvLyBUbyBkbyB0aGF0LCBzdG9yZSB0aGUgZW50aXJlIHZhbHVlIGFuZCB1c2UgcHJlZmVyZW5jZS5jb250YWlucygpIGluIHRoZSBuZXN0IGZ1bmN0aW9uXG4gICAgcHJlZmVyZW5jZTogcm93LnByZWZlcmVuY2Uuc3BsaXQoXCIsXCIpWzBdXG4gIH1cbn0iLCIvKlxuKiBEYXRhIHByZXBhcmVkIGJ5IExhdXJlbnMsIGNoYXJ0Y29kZSBsYXJnZWx5IGJ5IFRpdHVzIGZyb21cbiogaHR0cHM6Ly9naXRodWIuY29tL2NtZGEtdHQvY291cnNlLTE3LTE4L2Jsb2IvbWFzdGVyL3NpdGUvY2xhc3MtNC9heGlzL2luZGV4LmpzXG4qL1xuaW1wb3J0IHsgc2VsZWN0IH0gZnJvbSAnZDMnXG5pbXBvcnQgeyBwcmVwYXJlRGF0YSB9IGZyb20gJy4vcHJlcGFyZURhdGEnO1xuXG5jb25zdCBlbmRwb2ludCA9ICdodHRwczovL2dpc3QuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1JhenB1ZGRpbmcvZjg3MWJkM2ZiNDIwMDhkZTk5MWNmYzhjZjY4OWRjYmYvcmF3LzM1Yzc4NjdjMjRkNjBiZDU5ZmMxMmFiNzkxNzYzMDVmNGViODQ4MGIvc3VydmV5RGF0YUJ5SW50ZXJlc3QuanNvbidcbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJylcbmNvbnN0IG1hcmdpbiA9IHt0b3A6IDQ4LCByaWdodDogNzIsIGJvdHRvbTogMTIwLCBsZWZ0OiA3Mn1cbmNvbnN0IGhlaWdodCA9IHBhcnNlSW50KHN2Zy5zdHlsZSgnaGVpZ2h0JyksIDEwKSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tXG5jb25zdCB3aWR0aCA9IHBhcnNlSW50KHN2Zy5zdHlsZSgnd2lkdGgnKSwgMTApIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRcbi8qIENvbnZlbnRpb25hbCBtYXJnaW5zOiBodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzMwMTk1NjMuICovXG5jb25zdCBncm91cCA9IHN2Z1xuICAuYXBwZW5kKCdnJylcbiAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG1hcmdpbi5sZWZ0ICsgJywnICsgbWFyZ2luLnRvcCArICcpJyk7XG5cbi8vIFNjYWxlc1xuY29uc3QgeCA9IGQzLnNjYWxlQmFuZCgpLnBhZGRpbmcoMC4yKVxuY29uc3QgeSA9IGQzLnNjYWxlTGluZWFyKClcbi8vIEdsb2JhbCBkYXRhIHZhcmlhYmxlXG5sZXQgZGF0YVxuLy9UaGUgaW5pdGlhbCB2YXJpYWJsZSB0aGUgeSBheGlzIGlzIHNldCBvblxubGV0IHlWYXIgPSAgXCJiaWdnZXN0RXhwZW5zZUF2Z1wiLy9cImJpZ2dlc3RFeHBlbnNlQXZnXCIgLy8gIFwic2lzdGVyc0F2Z1wiIC8vXCJoZWlnaHRBdmdcIlxuXG5tYWtlVmlzdWFsaXphdGlvbigpXG4vLyBPdXIgbWFpbiBmdW5jdGlvbiB3aGljaCBydW5zIG90aGVyIGZ1bmN0aW9ucyB0byBtYWtlIGEgdmlzdWFsaXphdGlvblxuYXN5bmMgZnVuY3Rpb24gbWFrZVZpc3VhbGl6YXRpb24oKXtcbiAgLy9Vc2UgdGhlIHByZXBhcmVEYXRhIG1vZHVsZSB0byBnZXQgYW5kIHByb2Nlc3Mgb3VyIGRhdGFcbiAgZGF0YSA9IGF3YWl0IHByZXBhcmVEYXRhKGVuZHBvaW50KVxuICBjb25zb2xlLmxvZyhcIlRyYW5zZm9ybWVkIGRhdGE6XCIsIGRhdGEpXG5cdGNvbnN0IGZpZWxkcyA9IE9iamVjdC5rZXlzKGRhdGFbMF0udmFsdWUpO1xuICBjb25zb2xlLmxvZyhmaWVsZHMpXG4gIC8vTGV0J3Mgc2V0IHVwIG91ciBzY2FsZXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvblxuICBzZXR1cElucHV0KGZpZWxkcylcblx0c2V0dXBTY2FsZXMoKVxuICBzZXR1cEF4ZXMoKVxuICBkcmF3QmFycygpXG59XG5cbi8vRHJhdyB0aGUgaW5pdGlhbCBiYXJzXG5mdW5jdGlvbiBkcmF3QmFycygpIHtcbiAgIGNvbnN0IGJhcnMgPSBncm91cFxuICAgIC5zZWxlY3RBbGwoJy5iYXInKVxuICAgIC5kYXRhKGRhdGEpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAuYXR0cignY2xhc3MnLCAnYmFyJylcbiAgIFx0LmF0dHIoJ3gnLCBkID0+IHgoZC5rZXkpKVxuICAgIC5hdHRyKCd5JywgZCA9PiB5KGQudmFsdWVbeVZhcl0pKVxuICAgIC5hdHRyKCd3aWR0aCcsIHguYmFuZHdpZHRoKCkpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGQgPT4gaGVpZ2h0IC0geShkLnZhbHVlW3lWYXJdKSlcbn1cblxuLy9UaGlzIGZ1bmN0aW9uIHdpbGwgY2hhbmdlIHRoZSBncmFwaCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYW5vdGhlciB2YXJpYWJsZVxuZnVuY3Rpb24gc2VsZWN0aW9uQ2hhbmdlZCgpe1xuICAvLyd0aGlzJyByZWZlcnMgdG8gdGhlIGZvcm0gZWxlbWVudCFcbiAgY29uc29sZS5sb2coXCJDaGFuZ2luZyBncmFwaCB0byByZWZsZWN0IHRoaXMgdmFyaWFibGVcIiwgdGhpcy52YWx1ZSlcblx0eVZhciA9IHRoaXMudmFsdWVcbiAgc2V0dXBTY2FsZXMoKVxuICAvL3kuZG9tYWluKFswLCBkMy5tYXgoIGRhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS52YWx1ZVt5VmFyXSkgKV0gKTtcbiAgXG4gIHN2Zy5zZWxlY3RBbGwoJy5iYXInKVxuICAgIC5hdHRyKCd5JywgZCA9PiB5KGQudmFsdWVbeVZhcl0pKVxuICAgIC5hdHRyKCdoZWlnaHQnLCBkID0+IGhlaWdodCAtIHkoZC52YWx1ZVt5VmFyXSkpXG4gIHN2Zy5zZWxlY3QoJy5heGlzLXknKVxuICAgICAgLmNhbGwoZDMuYXhpc0xlZnQoeSkudGlja3MoMTApKVxufVxuXG4vL1NldCB1cCB0aGUgc2NhbGVzIHdlJ2xsIHVzZVxuZnVuY3Rpb24gc2V0dXBTY2FsZXMoKXtcbiAgLy9XZSdsbCBzZXQgdGhlIHggZG9tYWluIHRvIHRoZSBkaWZmZXJlbnQgcHJlZmVyZW5jZXNcbiAgeC5kb21haW4oZGF0YS5tYXAocHJlZmVyZW5jZSA9PiBwcmVmZXJlbmNlLmtleSkpXG4gIC8vVGhlIHktZG9tYWluIGlzIHNldCB0byB0aGUgbWluIGFuZCBtYXggb2YgdGhlIGN1cnJlbnQgeSB2YXJpYWJsZVxuICB5LmRvbWFpbihbMCwgZDMubWF4KCBkYXRhLm1hcChwcmVmZXJlbmNlID0+IHByZWZlcmVuY2UudmFsdWVbeVZhcl0pICldIClcbiAgeC5yYW5nZVJvdW5kKFswLCB3aWR0aF0pO1xuICB5LnJhbmdlUm91bmQoW2hlaWdodCwgMF0pO1xufVxuXG4vL0F0dGFjaCB4IGFuZCB5IGF4ZXMgdG8gb3VyIHN2Z1xuZnVuY3Rpb24gc2V0dXBBeGVzKCl7XG4gIGdyb3VwXG4gICAgLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14JylcbiAgXHQuY2FsbChkMy5heGlzQm90dG9tKHgpKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIGhlaWdodCArICcpJylcbiAgZ3JvdXBcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxuICBcdC5jYWxsKGQzLmF4aXNMZWZ0KHkpLnRpY2tzKDEwKSlcbn1cblxuLy9UaGlzIGF3ZXNvbWUgZnVuY3Rpb24gbWFrZXMgZHluYW1pYyBpbnB1dCBvcHRpb25zIGJhc2VkIG9uIG91ciBkYXRhIVxuLy9Zb3UgY2FuIGFsc28gY3JlYXRlIHRoZSBvcHRpb25zIGJ5IGhhbmQgaWYgeW91IGNhbid0IGZvbGxvdyB3aGF0IGhhcHBlbnMgaGVyZVxuZnVuY3Rpb24gc2V0dXBJbnB1dChmaWVsZHMpe1xuICBjb25zdCBmb3JtID0gZDMuc2VsZWN0KCdmb3JtJylcbiAgICAuc3R5bGUoJ2xlZnQnLCAnMTZweCcpXG4gICAgLnN0eWxlKCd0b3AnLCAnMTZweCcpXG4gICAgLmFwcGVuZCgnc2VsZWN0JylcbiAgICAub24oJ2NoYW5nZScsIHNlbGVjdGlvbkNoYW5nZWQpXG4gICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAuZGF0YShmaWVsZHMpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdvcHRpb24nKVxuICAgIC5hdHRyKCd2YWx1ZScsIGQgPT4gZClcbiAgICAudGV4dChkID0+IGQpIFxuICAvLyBjb25zb2xlLmxvZyhcImZvcm1cIixmb3JtKVxufSJdLCJuYW1lcyI6WyJzZWxlY3QiXSwibWFwcGluZ3MiOiI7OztFQUFBOzs7QUFHQTtBQUVBLEVBQU8sZUFBZSxXQUFXLENBQUMsR0FBRyxDQUFDOzs7R0FHckMsSUFBSSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFDO0lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs7SUFFOUIsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQUM7SUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFDOztHQUVsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUM7OztHQUcxQixJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBQzs7SUFFekIsT0FBTyxJQUFJO0dBQ1o7OztFQUdELFNB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