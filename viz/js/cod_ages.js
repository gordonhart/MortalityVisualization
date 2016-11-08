

let render_cod_ages = (cod_age_data) => {
  let traces = [];

  for(let key in cod_age_data) {
    let thiscause = cod_age_data[key];
    traces.push({
      type: "scatter",
      mode: "lines",
      line: {
        width: 1,
      },
      x: thiscause.map((el) => el.year),
      y: thiscause.map((el) => el.mu),
      name: key
    });
  }

  let layout = {
    title: "Mean Age at Death by Cause of Death over Time",
    yaxis: {
      title: "Age at Death"
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

  let chart = document.getElementById("cod-ages");
  Plotly.newPlot(chart, traces, layout, {showLink: false});
};

$(() => {
  let cod_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/cod_by_age_68-14.json?token=AJM69vDiLYw3z4rC-TlMqhm1N0jYq3aGks5YKaaqwA%3D%3D";
  $.get(cod_age_json, (cadata) => {
    render_cod_ages(JSON.parse(cadata));
  });
});


