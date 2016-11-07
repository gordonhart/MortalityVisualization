

let render_age = (age_data) => {
  let males = {
    type: "scatter",
    mode: "lines,
    line: {
      width: 1,
    },
    x: [],
    y: [],
    error_y: {
      array: [],
      thickness: 0.5,
      width: 0
    },
    name: "Male"
  };
  let females = $.extend({},males);
  females.name = "Female";
  for(let key in age_data) {
    let thisyear = age_data[key];
    males.x.push(thisyear.year);
    males.y.push(thisyear.male.mu);
    males.error_y.push(thisyear.male.stdev);
    females.x.push(thisyear.year);
    females.y.push(thisyear.male.mu);
    females.error_y.push(thisyear.male.stdev);
  }

  let layout = {
    title: "Mean Age at Death by Gender over Time"
    yaxis: {title: "Age at Death"}
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

  let chart = document.getElementById("ages");
  Plotly.newPlot(chart, traces, layout, {showLink: false});
};

$(() => {
  let age_json = ""
  $.get(age_json, (strdata) => render_age(JSON.parse(strdata)));
}


