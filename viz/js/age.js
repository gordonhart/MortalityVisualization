

let render_age = (age_data) => {
  let males = {
    type: "scatter",
    mode: "lines",
    line: {
      width: 1,
    },
    x: [],
    y: [],
    error_y: {
      array: [],
      type: "data",
      thickness: 0.25,
      width: 0.25
    },
    name: "Male"
  };
  let females = $.extend(true,{},males);
  females.name = "Female";

  for(let i in age_data.data) {
    let thisyear = age_data.data[i];
    males.x.push(thisyear.year);
    males.y.push(thisyear.male.mu);
    males.error_y.array.push(thisyear.male.stdev);
    females.x.push(thisyear.year);
    females.y.push(thisyear.female.mu);
    females.error_y.array.push(thisyear.female.stdev);
  }

  let layout = {
    title: "Mean Age at Death by Gender over Time",
    yaxis: {
      title: "Age at Death",
      range: [0,100]
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

  let chart = document.getElementById("ages");
  Plotly.newPlot(chart, [males,females], layout, {showLink: false});
};

$(() => {
  let age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/ages_68-14.json?token=AJM69voVzzY2uioWADBk0m0F1YwMK3QIks5YKVB6wA%3D%3D";
  $.get(age_json, (strdata) => {
    render_age(JSON.parse(strdata))
  });
});


