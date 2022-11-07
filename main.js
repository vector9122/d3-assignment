var height = 1200;
var width = 1000;

var svg = d3
  .select('#map')
  .append('svg')
  .attr('preserveAspectRatio', 'xMidYMid meet')
  // giving x,y,width, height to the svg viewbox to make it responsive
  .attr('viewBox', '220 260 300 300')
  .append('g')
  .attr('transform', 'translate(' + 20 + ',' + 2 + ')');


//loading the data from the UK map topojson and loading the json feed of towns

d3.queue()
  .defer(d3.json, 'uk-counties.json')
  .defer(d3.json, 'http://34.78.46.186/Circles/Towns/50')
  .await(ready);

// var projection = d3.geoMercator().translate([width / 2, height / 2]);
var projection = d3
  .geoAlbers()
  .center([0, 55.4])
  .rotate([4.4, 0])
  .parallels([50, 60])
  .scale(1500)
  .translate([width / 3, height / 3]);
var geo_path = d3.geoPath().projection(projection);

function ready(error, data, towns) {
  console.log(data);

  var countries = topojson.feature(data, data.objects.GBR_adm2).features;

  svg
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', geo_path)
    .attr('fill', '#ccccc')
    .on('mouseover', function (d) {
      console.log(d);
      d3.select(this).classed('selected', true);
    })
    .on('mouseout', function (d) {
      console.log(d);
      d3.select(this).classed('selected', false);
    });

  

  //Creating the tooltip which will work on mouse hover
  var my_tooltip = d3
    .select('#map')
    .append('div')
    .data(towns)
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px')
    .style('position', 'absolute');

  // Three functions that will add the tooltip
  var mousehover = function (d) {
    console.log(d);
    my_tooltip.style('opacity', 1);
  };
  var mousemove = function (d) {
    my_tooltip.html(
      'Town name: ' +
        d.Town +
        '<br>' +
        'population: ' +
        d.Population +
        '<br>' +
        'County: ' +
        d.County
    )
      .style('left', d3.mouse(this)[0] + 10 + 'px')
      .style('top', d3.mouse(this)[1] + 'px');
  };
  var mouseleave = function (d) {
    my_tooltip.style('opacity', 0);
  };

  // Add circles:

  function addCircles(name) {
    svg.selectAll('.town-circle').remove();

    svg
      .selectAll('.town-circle')
      .data(name)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return projection([d.lng, d.lat])[0];
      })
      .attr('cy', function (d) {
        return projection([d.lng, d.lat])[1];
      })
      .attr('r', 2)
      .attr('class', 'circle town-circle')
      .on('mouseover', mousehover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);
  }

  //This will select the slider class and populate the towns with the help of addCircles function

  d3.select('#slider').on('input', function () {
    // taking the input from slider and passing it to slice function of javascript
    const value = this.value;
    const sizeOfTowns = towns.length;
    const takenValues = Math.round((sizeOfTowns / 100) * value);
    const filteredTowns = towns.slice(0, takenValues);

    addCircles(filteredTowns);
  });

  addCircles(towns);
}
