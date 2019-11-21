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
    console.log("cleanedData: ", data);
    //Transform data for our visualization
  	// data = transformData(data)
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
  //Renest the data baed on the nestingVar parameter
  function transformData(source, nestingVar){
    let transformed =  d3.nest()
  		.key(d => d[nestingVar])
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
    console.log("transformed data:", transformed);
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
  // Store the raw unnested data globally so we don't have to pass it to every function
  let unNestedData;
  // Store the nested data
  let nestedData;
  //The initial variable the y axis is set on
  let yVar =  "biggestExpenseAvg";//"biggestExpenseAvg" //  "sistersAvg" //"heightAvg"
  let xVar = "preference";

  makeVisualization();
  // Our main function which runs other function to make a visualization
  async function makeVisualization(){
    //Use the prepareData function to get our data
    unNestedData = await prepareData(endpoint);
    //Set up the initial data transformation
    nestedData = transformData(unNestedData, xVar);
    const xFields = Object.keys(unNestedData[0]);
  	const yFields = Object.keys(nestedData[0].value);
    
    setupInput(yFields, xFields);
  	setupScales();
    setupAxes();
    //Trigger the initial rendering of bars so we have something to look at
    selectionChangedX();
  }

  //This function will change the graph when the user selects another variable
  function selectionChangedY(){
    //'this' refers to the form element!
    console.log("Changing y axis to reflect this variable", this.value);
  	yVar = this.value;
    // Update the domain to reflect the currently selected variable
    y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] );
    //Update the bars to reflect their new height
    svg.selectAll('.bar')
      .attr('y', d => y(d.value[yVar]))
      .attr('height', d => height - y(d.value[yVar]));
    svg.select('.axis-y')
        .call(d3.axisLeft(y).ticks(10));
  }

  //Update the x domain and the bars on user input
  function selectionChangedX(){
    //When we first call this function it's not as an event handler so we need this check
    xVar = this ? this.value : xVar;
    console.log("Changing x axis to reflect this variable", xVar);
    //Change the global data to reflect the new nesting
    nestedData = transformData(unNestedData, xVar)
    	//Sort on the key
      .sort((a,b) => d3.ascending(parseInt(a.key), parseInt(b.key)));
    x.domain(nestedData.map(item => item.key));
    // Update the domain so the new y maximum is taken into account
    y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] );
    const bars = group.selectAll('.bar')
    	.data(nestedData);
    //The update selection
    bars
     	.attr('x', d => x(d.key))
      .attr('y', d => y(d.value[yVar]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value[yVar]));
    //The enter selection
    bars
    	.enter()
    	.append('rect')
        .attr('class', 'bar')
        .attr('x' ,d => x(d.key))
        .attr('y', d => y(d.value[yVar]))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value[yVar]));
    //The exit selection
    bars
      .exit()
      .remove();
    //Update the ticks on the axes
    svg.select('.axis-x')
        .call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')');
    svg.select('.axis-y')
        .call(d3.axisLeft(y).ticks(10));
  }

  function setupScales(){
    //We'll set the x domain to the different preferences
    x.domain(nestedData.map(preference => preference.key));
    //The y-domain is set to the min and max of the current y variable
    y.domain([0, d3.max( nestedData.map(preference => preference.value[yVar]) )] );
    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);
  }

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
    		.property("selected", d => d === yVar);
    d3.select('form')
      .append('select')
      .on('change', selectionChangedX)
      .selectAll('option')
      .data(xFields)
      .enter()
      .append('option')
      	.attr('value', d => d)
      	.text(d => "x-axis variable: " + d) 
    		.property("selected", d => d === xVar);
  }

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInByZXBhcmVEYXRhLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbipcdFRoaXMgbW9kdWxlIHRha2VzIGNhcmUgb2YgZ2F0aGVyaW5nLCBjbGVhbmluZywgYW5kIHRyYW5zZm9ybWluZyBvdXIgZGF0YSA6KVxuKi9cbmltcG9ydCB7IG1lYW4gfSBmcm9tICdkMydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZXBhcmVEYXRhKHVybCl7XG4gIC8vTG9hZCB0aGUgZGF0YSBhbmQgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHNhaWQgZGF0YVxuXHRsZXQgZGF0YSA9IGF3YWl0IGxvYWREYXRhKHVybClcbiAgLy8gY29uc29sZS5sb2coXCJyYXdEYXRhOiBcIiwgZGF0YSlcbiAgLy9GaWx0ZXIgb3V0IGVudHJpZXMgdGhhdCBkb24ndCBoYXZlIHRoZSBtYWluIHZhcmlhYmxlIHdlJ3JlIHVzaW5nXG4gIGRhdGEgPSBkYXRhLmZpbHRlcihlbnRyeSA9PiBmaWx0ZXJEYXRhKGVudHJ5LCBcInByZWZlcmVuY2VcIikpXG4gIC8vIGNvbnNvbGUubG9nKFwiZmlsdGVyZWREYXRhXCIsIGRhdGEpXG4gIC8vQ2xlYW4gZGF0YVxuXHRkYXRhID0gZGF0YS5tYXAoY2xlYW5EYXRhKVxuICBjb25zb2xlLmxvZyhcImNsZWFuZWREYXRhOiBcIiwgZGF0YSlcbiAgLy9UcmFuc2Zvcm0gZGF0YSBmb3Igb3VyIHZpc3VhbGl6YXRpb25cblx0Ly8gZGF0YSA9IHRyYW5zZm9ybURhdGEoZGF0YSlcbiAgLy8gY29uc29sZS5sb2coXCJ0cmFuc2Zvcm1lZERhdGE6IFwiLCBkYXRhKVxuICByZXR1cm4gZGF0YVxufVxuXG4vL0xvYWQgdGhlIGRhdGEgYW5kIHJldHVybiBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBzYWlkIGRhdGFcbmZ1bmN0aW9uIGxvYWREYXRhKHVybCwgcXVlcnkpe1xuICByZXR1cm4gZDMuanNvbih1cmwpXG59XG5cbi8vTmVzdCB0aGUgZGF0YSBwZXIgcHJlZmVyZW5jZSAodGhpcyB3aWxsIGJlIG91ciB4LWF4aXMgdmFsdWVcbi8vUm9sbHVwIGRhdGEgc28gd2UgZ2V0IGF2ZXJhZ2VzIGFuZCB0b3RhbHMgZm9yIGVhY2ggdmFyaWFibGVcbi8vTm90ZTogdGhpcyBjb3VsZCBhbHNvIGJlIGRvbmUgd2hlbiB2aXN1YWxpemluZyB0aGUgdmFsdWVzXG4vL1x0XHRcdGFuZCB3ZSBjb3VsZCBtYWtlIHRoaXMgcGF0dGVybiBtb3JlIGZ1bmN0aW9uYWwgYnkgY3JlYXRpbmcgYSBtZWFuIGFuZCB0b3RhbCBmdW5jdGlvblxuLy9SZW5lc3QgdGhlIGRhdGEgYmFlZCBvbiB0aGUgbmVzdGluZ1ZhciBwYXJhbWV0ZXJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKHNvdXJjZSwgbmVzdGluZ1Zhcil7XG4gIGxldCB0cmFuc2Zvcm1lZCA9ICBkMy5uZXN0KClcblx0XHQua2V5KGQgPT4gZFtuZXN0aW5nVmFyXSlcbiAgXHQucm9sbHVwKGQgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYW1vdW50OiBkLmxlbmd0aCxcbiAgICAgICAgYnJvdGhlcnNBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmJyb3RoZXJzKSksXG4gICAgICAgIGJyb3RoZXJzVG90YWw6IGQzLnN1bShkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuYnJvdGhlcnMpKSxcbiAgICAgICAgc2lzdGVyc0F2ZzogZDMubWVhbihkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuc2lzdGVycykpLFxuICAgICAgICBoZWlnaHRBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmhlaWdodCkpLFxuICAgICAgICBoZWFsdGhBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LmhlYWx0aCkpLFxuICAgICAgICBzdHJlc3NBdmc6IGQzLm1lYW4oZC5tYXAoY29ycmVzcG9uZGVudCA9PiBjb3JyZXNwb25kZW50LnN0cmVzcykpLFxuICAgICAgICBiaWdnZXN0RXhwZW5zZUF2ZzogZDMubWVhbihkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuYmlnZ2VzdEV4cGVuc2UpKSxcbiAgICAgICAgbWVuVG90YWw6IGQzLnN1bShkLm1hcChjb3JyZXNwb25kZW50ID0+IGNvcnJlc3BvbmRlbnQuZ2VuZGVyID09IFwiTWFuXCI/IDE6IDApKSxcbiAgICAgICAgd29tZW5Ub3RhbDogZDMuc3VtKGQubWFwKGNvcnJlc3BvbmRlbnQgPT4gY29ycmVzcG9uZGVudC5nZW5kZXIgPT0gXCJWcm91d1wiPyAxOiAwKSksXG4gICAgICB9XG4gICAgfSlcblx0XHQuZW50cmllcyhzb3VyY2UpO1xuICBjb25zb2xlLmxvZyhcInRyYW5zZm9ybWVkIGRhdGE6XCIsIHRyYW5zZm9ybWVkKVxuICByZXR1cm4gdHJhbnNmb3JtZWRcbn1cblxuLy9SZXR1cm5zIHRydWUgZm9yIGVhY2ggcm93IHRoYXQgaGFzIHNvbWV0aGluZyBmaWxsZWQgaW4gZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eVxuZnVuY3Rpb24gZmlsdGVyRGF0YShyb3csIHByb3BlcnR5KXtcbiByZXR1cm4gcm93W3Byb3BlcnR5XSAhPSBcIlwiICYmIHJvd1twcm9wZXJ0eV0gIT0gdW5kZWZpbmVkXG59XG5cbi8vVGhpcyBmdW5jdGlvbiByZXR1cm5zIHByb3Blcmx5IHR5cGVkIHByb3BlcnRpZXMgZm9yIG91ciBkYXRhXG5cbmZ1bmN0aW9uIGNsZWFuRGF0YShyb3cpe1xuICByZXR1cm4ge1xuICAgIGdlbmRlcjogcm93LmdlbmRlcixcbiAgICBicm90aGVyczogTnVtYmVyKHJvdy5icm90aGVycyksXG4gICAgc2lzdGVyczogTnVtYmVyKHJvdy5zaXN0ZXJzKSxcbiAgICBoZWlnaHQ6IE51bWJlcihyb3cuaGVpZ2h0KSxcbiAgICBoZWFsdGg6IE51bWJlcihyb3cuaGVhbHRoKSxcbiAgICBzdHJlc3M6IE51bWJlcihyb3cuc3RyZXNzKSxcbiAgICBiaWdnZXN0RXhwZW5zZTogTnVtYmVyKHJvdy5iaWdnZXN0RXhwZW5zZSksXG4gICAgaWQ6IE51bWJlcihyb3cuaWQpLFxuICAgIGxpY2Vuc2U6IHJvdy5saWNlbnNlLFxuICAgIC8vTm90ZSB0aGF0IHdlJ3JlIHNlbGVjdGluZyBoZXJlIGJhc2VkIG9uIGZpcnN0IG1lbnRpb25lZCBwcmVmZXJlbmNlXG4gICAgLy9XZSBDT1VMRCBob3dldmVyLCBhbGxvdyBkdXBsaWNhdGUgZW50cmllcyBzbyB0aGF0IHNvbWVvbmUgd2hvIGhhcyAzIHByZWZzXG4gICAgLy8gZW5kcyB1cCBpbiB0aGUgdmFsdWUgYXJyYXkgb2YgZWFjaCBvZiB0aG9zZSBwcmVmZXJlbmNlcy5cbiAgICAvLyBUbyBkbyB0aGF0LCBzdG9yZSB0aGUgZW50aXJlIHZhbHVlIGFuZCB1c2UgcHJlZmVyZW5jZS5jb250YWlucygpIGluIHRoZSBuZXN0IGZ1bmN0aW9uXG4gICAgcHJlZmVyZW5jZTogcm93LnByZWZlcmVuY2Uuc3BsaXQoXCIsXCIpWzBdXG4gIH1cbn0iLCJpbXBvcnQgeyBzZWxlY3QgfSBmcm9tICdkMydcbmltcG9ydCB7IHByZXBhcmVEYXRhLCB0cmFuc2Zvcm1EYXRhIH0gZnJvbSAnLi9wcmVwYXJlRGF0YSc7XG5cbmNvbnN0IGVuZHBvaW50ID0gJ2h0dHBzOi8vZ2lzdC5naXRodWJ1c2VyY29udGVudC5jb20vUmF6cHVkZGluZy9mODcxYmQzZmI0MjAwOGRlOTkxY2ZjOGNmNjg5ZGNiZi9yYXcvMzVjNzg2N2MyNGQ2MGJkNTlmYzEyYWI3OTE3NjMwNWY0ZWI4NDgwYi9zdXJ2ZXlEYXRhQnlJbnRlcmVzdC5qc29uJ1xuY29uc3Qgc3ZnID0gc2VsZWN0KCdzdmcnKVxuY29uc3QgbWFyZ2luID0ge3RvcDogNDgsIHJpZ2h0OiA3MiwgYm90dG9tOiAxMjAsIGxlZnQ6IDcyfVxuY29uc3QgaGVpZ2h0ID0gcGFyc2VJbnQoc3ZnLnN0eWxlKCdoZWlnaHQnKSwgMTApIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b21cbmNvbnN0IHdpZHRoID0gcGFyc2VJbnQoc3ZnLnN0eWxlKCd3aWR0aCcpLCAxMCkgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodFxuLyogQ29udmVudGlvbmFsIG1hcmdpbnM6IGh0dHBzOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMzAxOTU2My4gKi9cbmNvbnN0IGdyb3VwID0gc3ZnXG4gIC5hcHBlbmQoJ2cnKVxuICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbWFyZ2luLmxlZnQgKyAnLCcgKyBtYXJnaW4udG9wICsgJyknKTtcblxuLy8gU2NhbGVzXG5jb25zdCB4ID0gZDMuc2NhbGVCYW5kKCkucGFkZGluZygwLjIpXG5jb25zdCB5ID0gZDMuc2NhbGVMaW5lYXIoKVxuLy8gU3RvcmUgdGhlIHJhdyB1bm5lc3RlZCBkYXRhIGdsb2JhbGx5IHNvIHdlIGRvbid0IGhhdmUgdG8gcGFzcyBpdCB0byBldmVyeSBmdW5jdGlvblxubGV0IHVuTmVzdGVkRGF0YVxuLy8gU3RvcmUgdGhlIG5lc3RlZCBkYXRhXG5sZXQgbmVzdGVkRGF0YVxuLy9UaGUgaW5pdGlhbCB2YXJpYWJsZSB0aGUgeSBheGlzIGlzIHNldCBvblxubGV0IHlWYXIgPSAgXCJiaWdnZXN0RXhwZW5zZUF2Z1wiLy9cImJpZ2dlc3RFeHBlbnNlQXZnXCIgLy8gIFwic2lzdGVyc0F2Z1wiIC8vXCJoZWlnaHRBdmdcIlxubGV0IHhWYXIgPSBcInByZWZlcmVuY2VcIlxuXG5tYWtlVmlzdWFsaXphdGlvbigpXG4vLyBPdXIgbWFpbiBmdW5jdGlvbiB3aGljaCBydW5zIG90aGVyIGZ1bmN0aW9uIHRvIG1ha2UgYSB2aXN1YWxpemF0aW9uXG5hc3luYyBmdW5jdGlvbiBtYWtlVmlzdWFsaXphdGlvbigpe1xuICAvL1VzZSB0aGUgcHJlcGFyZURhdGEgZnVuY3Rpb24gdG8gZ2V0IG91ciBkYXRhXG4gIHVuTmVzdGVkRGF0YSA9IGF3YWl0IHByZXBhcmVEYXRhKGVuZHBvaW50KVxuICAvL1NldCB1cCB0aGUgaW5pdGlhbCBkYXRhIHRyYW5zZm9ybWF0aW9uXG4gIG5lc3RlZERhdGEgPSB0cmFuc2Zvcm1EYXRhKHVuTmVzdGVkRGF0YSwgeFZhcilcbiAgY29uc3QgeEZpZWxkcyA9IE9iamVjdC5rZXlzKHVuTmVzdGVkRGF0YVswXSk7XG5cdGNvbnN0IHlGaWVsZHMgPSBPYmplY3Qua2V5cyhuZXN0ZWREYXRhWzBdLnZhbHVlKTtcbiAgXG4gIHNldHVwSW5wdXQoeUZpZWxkcywgeEZpZWxkcylcblx0c2V0dXBTY2FsZXMoKVxuICBzZXR1cEF4ZXMoKVxuICAvL1RyaWdnZXIgdGhlIGluaXRpYWwgcmVuZGVyaW5nIG9mIGJhcnMgc28gd2UgaGF2ZSBzb21ldGhpbmcgdG8gbG9vayBhdFxuICBzZWxlY3Rpb25DaGFuZ2VkWCgpXG59XG5cbi8vVGhpcyBmdW5jdGlvbiB3aWxsIGNoYW5nZSB0aGUgZ3JhcGggd2hlbiB0aGUgdXNlciBzZWxlY3RzIGFub3RoZXIgdmFyaWFibGVcbmZ1bmN0aW9uIHNlbGVjdGlvbkNoYW5nZWRZKCl7XG4gIC8vJ3RoaXMnIHJlZmVycyB0byB0aGUgZm9ybSBlbGVtZW50IVxuICBjb25zb2xlLmxvZyhcIkNoYW5naW5nIHkgYXhpcyB0byByZWZsZWN0IHRoaXMgdmFyaWFibGVcIiwgdGhpcy52YWx1ZSlcblx0eVZhciA9IHRoaXMudmFsdWVcbiAgLy8gVXBkYXRlIHRoZSBkb21haW4gdG8gcmVmbGVjdCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhcmlhYmxlXG4gIHkuZG9tYWluKFswLCBkMy5tYXgoIG5lc3RlZERhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS52YWx1ZVt5VmFyXSkgKV0gKTtcbiAgLy9VcGRhdGUgdGhlIGJhcnMgdG8gcmVmbGVjdCB0aGVpciBuZXcgaGVpZ2h0XG4gIHN2Zy5zZWxlY3RBbGwoJy5iYXInKVxuICAgIC5hdHRyKCd5JywgZCA9PiB5KGQudmFsdWVbeVZhcl0pKVxuICAgIC5hdHRyKCdoZWlnaHQnLCBkID0+IGhlaWdodCAtIHkoZC52YWx1ZVt5VmFyXSkpXG4gIHN2Zy5zZWxlY3QoJy5heGlzLXknKVxuICAgICAgLmNhbGwoZDMuYXhpc0xlZnQoeSkudGlja3MoMTApKVxufVxuXG4vL1VwZGF0ZSB0aGUgeCBkb21haW4gYW5kIHRoZSBiYXJzIG9uIHVzZXIgaW5wdXRcbmZ1bmN0aW9uIHNlbGVjdGlvbkNoYW5nZWRYKCl7XG4gIC8vV2hlbiB3ZSBmaXJzdCBjYWxsIHRoaXMgZnVuY3Rpb24gaXQncyBub3QgYXMgYW4gZXZlbnQgaGFuZGxlciBzbyB3ZSBuZWVkIHRoaXMgY2hlY2tcbiAgeFZhciA9IHRoaXMgPyB0aGlzLnZhbHVlIDogeFZhclxuICBjb25zb2xlLmxvZyhcIkNoYW5naW5nIHggYXhpcyB0byByZWZsZWN0IHRoaXMgdmFyaWFibGVcIiwgeFZhcilcbiAgLy9DaGFuZ2UgdGhlIGdsb2JhbCBkYXRhIHRvIHJlZmxlY3QgdGhlIG5ldyBuZXN0aW5nXG4gIG5lc3RlZERhdGEgPSB0cmFuc2Zvcm1EYXRhKHVuTmVzdGVkRGF0YSwgeFZhcilcbiAgXHQvL1NvcnQgb24gdGhlIGtleVxuICAgIC5zb3J0KChhLGIpID0+IGQzLmFzY2VuZGluZyhwYXJzZUludChhLmtleSksIHBhcnNlSW50KGIua2V5KSkpXG4gIHguZG9tYWluKG5lc3RlZERhdGEubWFwKGl0ZW0gPT4gaXRlbS5rZXkpKVxuICAvLyBVcGRhdGUgdGhlIGRvbWFpbiBzbyB0aGUgbmV3IHkgbWF4aW11bSBpcyB0YWtlbiBpbnRvIGFjY291bnRcbiAgeS5kb21haW4oWzAsIGQzLm1heCggbmVzdGVkRGF0YS5tYXAocHJlZmVyZW5jZSA9PiBwcmVmZXJlbmNlLnZhbHVlW3lWYXJdKSApXSApO1xuICBjb25zdCBiYXJzID0gZ3JvdXAuc2VsZWN0QWxsKCcuYmFyJylcbiAgXHQuZGF0YShuZXN0ZWREYXRhKVxuICAvL1RoZSB1cGRhdGUgc2VsZWN0aW9uXG4gIGJhcnNcbiAgIFx0LmF0dHIoJ3gnLCBkID0+IHgoZC5rZXkpKVxuICAgIC5hdHRyKCd5JywgZCA9PiB5KGQudmFsdWVbeVZhcl0pKVxuICAgIC5hdHRyKCd3aWR0aCcsIHguYmFuZHdpZHRoKCkpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGQgPT4gaGVpZ2h0IC0geShkLnZhbHVlW3lWYXJdKSlcbiAgLy9UaGUgZW50ZXIgc2VsZWN0aW9uXG4gIGJhcnNcbiAgXHQuZW50ZXIoKVxuICBcdC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2JhcicpXG4gICAgICAuYXR0cigneCcgLGQgPT4geChkLmtleSkpXG4gICAgICAuYXR0cigneScsIGQgPT4geShkLnZhbHVlW3lWYXJdKSlcbiAgICAgIC5hdHRyKCd3aWR0aCcsIHguYmFuZHdpZHRoKCkpXG4gICAgICAuYXR0cignaGVpZ2h0JywgZCA9PiBoZWlnaHQgLSB5KGQudmFsdWVbeVZhcl0pKVxuICAvL1RoZSBleGl0IHNlbGVjdGlvblxuICBiYXJzXG4gICAgLmV4aXQoKVxuICAgIC5yZW1vdmUoKVxuICAvL1VwZGF0ZSB0aGUgdGlja3Mgb24gdGhlIGF4ZXNcbiAgc3ZnLnNlbGVjdCgnLmF4aXMteCcpXG4gICAgICAuY2FsbChkMy5heGlzQm90dG9tKHgpKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIGhlaWdodCArICcpJylcbiAgc3ZnLnNlbGVjdCgnLmF4aXMteScpXG4gICAgICAuY2FsbChkMy5heGlzTGVmdCh5KS50aWNrcygxMCkpXG59XG5cbmZ1bmN0aW9uIHNldHVwU2NhbGVzKCl7XG4gIC8vV2UnbGwgc2V0IHRoZSB4IGRvbWFpbiB0byB0aGUgZGlmZmVyZW50IHByZWZlcmVuY2VzXG4gIHguZG9tYWluKG5lc3RlZERhdGEubWFwKHByZWZlcmVuY2UgPT4gcHJlZmVyZW5jZS5rZXkpKVxuICAvL1RoZSB5LWRvbWFpbiBpcyBzZXQgdG8gdGhlIG1pbiBhbmQgbWF4IG9mIHRoZSBjdXJyZW50IHkgdmFyaWFibGVcbiAgeS5kb21haW4oWzAsIGQzLm1heCggbmVzdGVkRGF0YS5tYXAocHJlZmVyZW5jZSA9PiBwcmVmZXJlbmNlLnZhbHVlW3lWYXJdKSApXSApXG4gIHgucmFuZ2VSb3VuZChbMCwgd2lkdGhdKTtcbiAgeS5yYW5nZVJvdW5kKFtoZWlnaHQsIDBdKTtcbn1cblxuZnVuY3Rpb24gc2V0dXBBeGVzKCl7XG4gIGdyb3VwXG4gICAgLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14JylcbiAgXHQuY2FsbChkMy5heGlzQm90dG9tKHgpKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIGhlaWdodCArICcpJylcbiAgZ3JvdXBcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxuICBcdC5jYWxsKGQzLmF4aXNMZWZ0KHkpLnRpY2tzKDEwKSlcbn1cblxuLy9UaGlzIGF3ZXNvbWUgZnVuY3Rpb24gbWFrZXMgZHluYW1pYyBpbnB1dCBvcHRpb25zIGJhc2VkIG9uIG91ciBkYXRhIVxuLy9Zb3UgY2FuIGFsc28gY3JlYXRlIHRoZSBvcHRpb25zIGJ5IGhhbmQgaWYgeW91IGNhbid0IGZvbGxvdyB3aGF0IGhhcHBlbnMgaGVyZVxuZnVuY3Rpb24gc2V0dXBJbnB1dCh5RmllbGRzLCB4RmllbGRzKXtcblx0ZDMuc2VsZWN0KCdmb3JtJylcbiAgICAuYXBwZW5kKCdzZWxlY3QnKVxuICBcdC50ZXh0KFwiU2VsZWN0IGEgdGV4dCB2YWx1ZVwiKVxuICAgIC5vbignY2hhbmdlJywgc2VsZWN0aW9uQ2hhbmdlZFkpXG4gICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAuZGF0YSh5RmllbGRzKVxuICAgIC5lbnRlcigpXG4gICAgLmFwcGVuZCgnb3B0aW9uJylcbiAgICBcdC5hdHRyKCd2YWx1ZScsIGQgPT4gZClcbiAgICBcdC50ZXh0KGQgPT4gXCJ5LWF4aXMgdmFyaWFibGU6IFwiICsgZCkgXG4gIFx0XHQucHJvcGVydHkoXCJzZWxlY3RlZFwiLCBkID0+IGQgPT09IHlWYXIpXG4gIGQzLnNlbGVjdCgnZm9ybScpXG4gICAgLmFwcGVuZCgnc2VsZWN0JylcbiAgICAub24oJ2NoYW5nZScsIHNlbGVjdGlvbkNoYW5nZWRYKVxuICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgLmRhdGEoeEZpZWxkcylcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ29wdGlvbicpXG4gICAgXHQuYXR0cigndmFsdWUnLCBkID0+IGQpXG4gICAgXHQudGV4dChkID0+IFwieC1heGlzIHZhcmlhYmxlOiBcIiArIGQpIFxuICBcdFx0LnByb3BlcnR5KFwic2VsZWN0ZWRcIiwgZCA9PiBkID09PSB4VmFyKVxufSJdLCJuYW1lcyI6WyJzZWxlY3QiXSwibWFwcGluZ3MiOiI7OztFQUFBOzs7QUFHQTtBQUVBLEVBQU8sZUFBZSxXQUFXLENBQUMsR0FBRyxDQUFDOztHQUVyQyxJQUFJLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUM7OztJQUc3QixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsRUFBQzs7O0dBRzdELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBQztJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUM7Ozs7SUFJbEMsT0FBTyxJQUFJO0dBQ1o7OztFQUdELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7SUFDM0IsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztHQUNwQjs7Ozs7OztBQU9ELEVBQU8sU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztJQUMvQyxJQUFJLFdBQVcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO0tBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQ3RCLE1BQU0s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