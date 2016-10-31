
// 1968-78 Cause of Death Timeseries

let render_timeseries = (data,include_outliers) => {
  let traces = [];

  for(let key in data) {
    let thiscause = data[key];
    let dataxy = { x:[], y:[] };
    for(let i in thiscause) {
      let el = thiscause[i];
      if(!(!include_outliers && el[0]===72)) {
        dataxy.x.push("19"+el[0]);
        dataxy.y.push(el[1]);
      }
    }
    traces.push({
      type: "scatter",
      mode: "lines",
      x: dataxy.x,
      y: dataxy.y,
      line: {
        width: 1
      },
      name: key
    });
  }

  let layout = {
    title: "Number of Deaths by Cause from 1968 to 1978",
    yaxis: {title: "Number of Deaths"},
    xaxis: {
      showgrid: false,
      fixedaxis: true
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  };

  if(include_outliers) {
    Plotly.plot(document.getElementById("timeseries"), traces, layout, {showLink: false});
  } else {
    Plotly.plot(document.getElementById("timeseries-no72"), traces, layout, {showLink: false});
  }
};

$(() => {
  var data;
  let ts_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/yearly_causes_68-91.json?token=AJM69gdvyA1VCgLPoTGRtrtDQtPPApX9ks5YIGp-wA%3D%3D";
  $.get(ts_json, (strdata) => {
    data = JSON.parse(strdata);
    render_timeseries(data,true);
  });

  $("#remove-outliers").on('click', () => {
    $("#timeseries").hide();
    $("#timeseries-no72").show();
    $("#remove-outliers").hide();
    render_timeseries(data,false);
  });
});
