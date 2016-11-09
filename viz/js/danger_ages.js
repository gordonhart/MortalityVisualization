
let plot_style = {
  title: "Percentage of Deaths by Age",
  yaxis: {
    title: "Percentage of Deaths"
  },
  xaxis: {
    title: "Cause of Death",
    showgrid: false,
    fixedaxis: true,
    tickangle: 20,
    tickfont: {
      size: 12
    }
  },
  margin: {
    t: 150,
    b: 250
  },
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    family: "Playfair Display SC"
  }
};

let get_danger_data = () => {
  let ddata = danger_data.data[curage].causes;
  return [{
    type: "scatter", // "bar",
    mode: "markers",
    x: ddata.map((el) => el.cause),
    y: ddata.map((el) => el.percent),
    marker: {
      color: ddata.map((el) => el.percent)// ,
      // showscale: true
      // colorscale: "Viridis"
    }
  }]
};

let render_danger_ages_initial = () => {
  Plotly.plot("danger-ages",
    get_danger_data(),
    plot_style,
    { showLink: false });
};

let render_danger_ages_update = () => {
  Plotly.animate("danger-ages", {
    data: get_danger_data(), // [{ y: get_danger_data(danger_data.data[curage])[0].y }],
    traces: [0],
    layout: {}
  }, {
    transition: {
      duration: 250,
      ease: 'cubic-in-out'
    }
  });
};

let curage;
let danger_data;
$(() => {
  let danger_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangers_by_age_2014.json?token=AJM69pnP9Z8QuikbTCfUYT5PotoEwkr_ks5YKy8CwA%3D%3D";
  $.get(danger_age_json, (dadata) => {
    danger_data = JSON.parse(dadata);
    curage = 0;
    render_danger_ages_initial();
    setInterval(() => {
      curage = (curage>=116) ? 0 : curage+1;
      render_danger_ages_update();
    },250);
  });
});

