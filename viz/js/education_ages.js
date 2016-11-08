
let render_edu_ages = (edu_age_data) => {
  let means = {
    type: "scatter",
    mode: "lines",
    line: {
      width: 1
    },
    x: edu_age_data.means.map((el) => el["edu-code"]),
    y: edu_age_data.means.map((el) => el["mean-age"]),
    name: "Mean Age by Education Level
  };

  let points = [];
  for(let i in edu_age_data.data) {
    let thispoint = edu_age_data[i];
    points.push({
      type: "scatter",
      mode: "markers",
      /*
      line: {
        width: 1,
      },
      */
      marker: {
        size: thispoint.count / 1000,
        color: "rgba(255,0,0,1)"
      },
      x: [thispoint["edu-code"]],
      y: [thispoint["age"]],
      name: thispoint["edu-code"] + "-" + thispoint.age
    });
  }

  let layout = {
    title: "Age at Death versus Education Level",
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

  let chart = document.getElementById("edu-ages");
  Plotly.newPlot(chart, traces, layout, {showLink: false});
};

$(() => {
  let edu_age_json = "";
  $.get(edu_age_json, (eadata) => {
    render_edu_ages(JSON.parse(eadata));
  });
});


