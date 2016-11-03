
// 1968-78 Cause of Death Timeseries

var data;
var data_normalized;
let render_timeseries = (normalized) => {
  let traces = [];
  let thedata = normalized ? data_normalized : data;

  for(let key in thedata) {
    let thiscause = thedata[key];
    let dataxy = { x:[], y:[] };
    for(let i in thiscause) {
      dataxy.x.push("19"+thiscause[i][0]);
      dataxy.y.push(thiscause[i][1]);
    }
    traces.push({
      type: "scatter",
      mode: "lines",
      x: dataxy.x,
      y: dataxy.y,
      line: {
        width: 1
      },
      visible: true,
      name: key
    });
  }

  let layout = {
    title: (normalized ? "Normalized " : "") + "Number of Deaths by Cause from 1968 to 1978",
    yaxis: {title: (normalized ? "Percentage" : "Number") + " of Deaths"},
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

  if(!normalized) {
    let chart = document.getElementById("timeseries");
    Plotly.newPlot(chart, traces, layout, {showLink: false});
  } else {
    let chart = document.getElementById("timeseries-normalized");
    Plotly.newPlot(chart, traces, layout, {showLink: false});
  }
};

let filter_chart = (chart_div,names) => {
  let chart = document.getElementById(chart_div);
  // loop through data, hide all but the shown
  for(let i in chart.data) {
    let thisset = chart.data[i];
    if(names.length == 0) {
      thisset.visible = true;
    } else if($.inArray(thisset.name,names) > 0) {
      thisset.visible = "legendonly";
    }
  }
  Plotly.redraw(chart);
};

$(() => {
  let ts_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/yearly_causes_68-98.json?token=AJM69lD2TwirdkdB9JkwNe7hGgwMMl1Wks5YIHKWwA%3D%3D";
  $.get(ts_json, (strdata) => {
    data = JSON.parse(strdata);
    render_timeseries(false);
  });

  let ts_normalized = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/normalized_yearly_causes_68-98.json?token=AJM69owp_vONjlabjI64yBndyd81ZvShks5YJD2WwA%3D%3D";
  $.get(ts_normalized, (strdata) => {
    data_normalized = JSON.parse(strdata);
  });
});

