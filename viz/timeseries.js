
// 1968-78 Cause of Death Timeseries

let render_timeseries = (data) => {
  let trace = [];
  for(let key in data) {
    let thiscause = data[key];
    trace.push({
      type: "scatter",
      mode: "lines",
      x: thiscause.map((el) => el[0]),
      y: thiscause.map((el) => el[1]),
      line: {
        width: 1
      }
    });
  }

  let layout = {
    title: "Number of Deaths by Cause from 1968 to 1978",
    yaxis: {title: "Number of Deaths"},
    xaxis: {
      showgrid: false,
      tickformat: "%B, %Y"
    },
    margin: {
      l: 40, b: 10, r: 10, t: 20
    }
  };

  Plotly.plot(document.getElementById('contour-plot'), [trace], layout, {showLink: false});
};

$(() => {
  let ts_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes_2014.json?token=AJM69rAXl5g1qwYfhF1MS97TDH5Ko-TDks5YIBdIwA%3D%3D";
  $.get(ts_json, (data) => {
    render_timeseries(JSON.parse(data));
  });
});
