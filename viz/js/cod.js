
// 1968-78 Cause of Death Timeseries

// var data;
var data_normalized;
let render_timeseries = (/* normalized */) => {
  let traces = [];
  let thedata = data_normalized; // normalized ? data_normalized : data;

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
    title: "Death by Cause from 1968 to 2014",
    yaxis: {
      title: "Percentage of Deaths"
    },
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

  let chart = document.getElementById("cod");
  Plotly.newPlot(chart, traces, layout, {showLink: false});
};

// hide all elements in the chart unless included in "names"
let filter_chart = (chart_div,names) => {
  let chart = document.getElementById(chart_div);
  // loop through data, hide all but the shown
  for(let i in chart.data) {
    let thisset = chart.data[i];
    if(names.length == 0) { // show all with no names in list
      thisset.visible = true;
    } else {
      if($.inArray(thisset.name,names) >= 0) {
        thisset.visible = true;
      } else {
        console.log(thisset.name);
        thisset.visible = "legendonly";
      }
    }
  }
  Plotly.redraw(chart);
};

$(() => {
  let ts_normalized = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/cod_normalized_68-14.json?token=AJM69nh7YSwsjiWBklI42n_AkaKqq8U9ks5YKVorwA%3D%3D";
  $.get(ts_normalized, (strdata) => {
    data_normalized = JSON.parse(strdata);
    render_timeseries();
  });
});

