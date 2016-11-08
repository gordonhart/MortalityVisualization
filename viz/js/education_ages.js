
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

  console.log(edu_age_data.data.map((el) => el.age));
  let points = {
    type: "scatter",
    mode: "markers",
    hoverinfo: "skip",
    marker: {
      size: edu_age_data.data.map((el) => el.count/100),
      sizemode: "area",
      opacity: 0.25,
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
      title: "Age at Death"// ,
      // range: [0,100]
    },
    xaxis: {
      title: "Education Level",
      showgrid: false,
      fixedaxis: true
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  }, {showLink: false});
};

$(() => {
  let edu_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/education_ages_2014.json?token=AJM69tc0Tv4QbacELnmqPBhFwU-9A3qrks5YKtD_wA%3D%3D";
  $.get(edu_age_json, (eadata) => {
    render_edu_ages(JSON.parse(eadata));
  });
});


