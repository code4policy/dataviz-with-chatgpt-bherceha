// Load CSV, compute top 10 reasons, and render a horizontal D3 bar chart
const csvPath = 'boston_311_2025_by_reason.csv';

const svg = d3.select('#chart');

function render(data) {
  // parse counts
  data.forEach(d => d.Count = +d.Count);

  // sort desc and take top 10
  const top = data.sort((a,b)=>b.Count - a.Count).slice(0,10);

  // update headlines (single-line & concise)
  document.getElementById('main-headline').textContent = 'Enforcement & Abandoned Vehicles are troubling Boston';
  document.getElementById('sub-headline').textContent = 'Top 10 reasons for Boston 311 calls in 2025.';

  // dimensions
  const margin = {top:20,right:60,bottom:40,left:240};
  const fullWidth = (svg.node() && svg.node().getBoundingClientRect)
    ? Math.round(svg.node().getBoundingClientRect().width)
    : parseInt(svg.style('width')) || 960;
  const width = Math.max(0, fullWidth - margin.left - margin.right);
  const height = top.length * 42; // band size * count

  svg.attr('viewBox', `0 0 ${fullWidth} ${height + margin.top + margin.bottom}`);

  svg.selectAll('*').remove();

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top, d=>d.Count)]).nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(top.map(d=>d.reason))
    .range([0, height])
    .padding(0.15);

  // x-axis
  const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format(','));
  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .attr('class','axis')
    .call(g => g.select('.domain').remove());

  // y-axis (no tick marks)
  const yAxis = d3.axisLeft(y).tickSize(0);
  g.append('g')
    .attr('class','axis')
    .call(yAxis)
    .selectAll('text')
      .call(text => text.attr('dx','-0.6em'));

  // bars
  const bars = g.selectAll('.bar-group').data(top).join('g').attr('class','bar-group').attr('transform', d=>`translate(0,${y(d.reason)})`);

  bars.append('rect')
    .attr('class','bar')
    .attr('height', y.bandwidth())
    .attr('x', 0)
    .attr('width', d=>x(d.Count));

  // add value labels at end of bars
  bars.append('text')
    .attr('class','label')
    .attr('x', d=>x(d.Count) + 8)
    .attr('y', y.bandwidth()/2)
    .attr('dy','0.35em')
    .text(d=>d3.format(',')(d.Count));

  // no x-axis label by user request
}

// Load CSV and render
d3.csv(csvPath).then(render).catch(err=>{
  console.error('Failed to load CSV:', err);
  d3.select('#chart').append('text').text('Failed to load data.');
});
