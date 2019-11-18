// import { select, json, geoPath, geoNaturalEarth1 } from 'd3';
// import { feature } from 'topojson';

const query = `PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?svcn ?lat ?long ?landLabel WHERE {
 ?svcn skos:exactMatch/wgs84:lat ?lat .
 ?svcn skos:exactMatch/wgs84:long ?long .
 ?svcn skos:exactMatch/gn:parentCountry ?land .
 ?land gn:name ?landLabel .
} LIMIT 300`
//Please use your own endpoint when using this 
const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-40/sparql"

const svg = d3.select('svg')
const circleDelay = 10
const circleSize = 8
const projection = d3.geoNaturalEarth1()
const pathGenerator = d3.geoPath().projection(projection)

setupMap()
drawMap()
plotLocations()

function setupMap(){
  svg
    .append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawMap() {
  d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
    const countries = topojson.feature(data, data.objects.countries);
    svg
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
  })
}

function plotLocations() {
  fetch(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.json())
  	.then(json => json.results.bindings)
    .then(results => {
    //TODO: clean up results in separate function
    	results.forEach(result => {
        result.lat = Number(result.lat.value)
        result.long = Number(result.long.value)
      })    
    	console.log(results)
      
    svg
        .selectAll('circle')
        .data(results)
        .enter()
        .append('circle')
        .attr('class', 'circles')
        .attr('cx', d =>projection([d.long, d.lat])[0])
        .attr('cy', function(d) {
          return projection([d.long, d.lat])[1]
        })
        .attr('r', '0px')
    		.attr('opacity', .5)
        .transition()
    				.delay(function(d, i) { return i * circleDelay; })
            .duration(1500)
            .ease(d3.easeBounce)
            .attr('r', circleSize+'px')
  })
}
