import { geoPath } from 'd3'
import { feature } from 'topojson'

export function drawMap(container, projection){
	const pathGenerator = geoPath().projection(projection)
  setupMap(container, pathGenerator)
  drawCountries(container, pathGenerator)
}

function setupMap(container, pathGenerator){
  container
    .append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawCountries(container, pathGenerator) {
  d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
    const countries = feature(data, data.objects.countries);
    container
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
  })
}