
let render_edu_ages = (edu_age_data) => {
  let mean_data = edu_age_data.means.sort((a,b) => a["edu-code"] > b["edu-code"]);
  let means = {
    type: "scatter",
    mode: "lines",
    line: {
      width: 1
    },
    x: mean_data.map((el) => el["edu-level"]),
    y: mean_data.map((el) => el["mean-age"]),
    name: "Mean",
    showlegend: false
  };

  let points = {
    type: "scatter",
    mode: "markers",
    hoverinfo: "skip",
    marker: {
      size: edu_age_data.data.map((el) => el.count/25),
      sizemode: "area",
      opacity: 0.1,
      // autocolorscale: true,
      color: edu_age_data.data.map((el) => el.age),
      colorscale: "Viridis",
      line: {
        width: 0
      }
    },
    x: edu_age_data.data.map((el) => el["edu-level"]),
    y: edu_age_data.data.map((el) => el.age),
    showlegend: false
  };

  Plotly.newPlot(document.getElementById("edu-ages"), [means, points], {
    title: "Age at Death versus Education Level",
    yaxis: {
      title: "Age at Death",
      range: [0,120]
    },
    xaxis: {
      title: "Education Level",
      showgrid: false,
      fixedaxis: true,
      tickangle: 15,
      tickfont: {
        size: 12
      }
    },
    margin: {
      t: 150,
      b: 150
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  },{
    showLink: false,
    displayModeBar: false
  });

};

$(() => {
  /*
  let edu_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/education_ages_2014.json?token=AJM69okwf6ZjFJ7c0CU9PTSdfN-q8q-iks5YKxP4wA%3D%3D";
  $.get(edu_age_json, (eadata) => {
    render_edu_ages(JSON.parse(eadata));
  });
  */
  render_edu_ages(viz5_education_ages);
});


