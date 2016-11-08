
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
    name: "Mean Age by Education Level"
  };

  let points = [means];
  for(let i in edu_age_data.data) {
    let thispoint = edu_age_data.data[i];
    points.push({
      type: "scatter",
      mode: "markers",
      marker: {
        size: thispoint.count / 1000,
        color: "rgba(255,0,0,1)"
      },
      x: [thispoint["edu-level"]],
      y: [thispoint["age"]],
      showlegend: false
      // name: thispoint["edu-code"] + "-" + thispoint.age
    });
  }

  Plotly.newPlot(document.getElementById("edu-ages"), points, {
    title: "Age at Death versus Education Level",
    yaxis: {
      title: "Age at Death",
      range: [0,100]
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


