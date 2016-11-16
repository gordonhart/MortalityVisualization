
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
  yaxis: {
    range: [0,60]
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

let get_viz6_danger_ages = () => {
  let ddata = viz6_danger_ages.data[curage].causes;
  return [{
    type: "bar",
    mode: "markers",
    x: ddata.map((el) => el.cause),
    y: ddata.map((el) => 100 * el.percent),
    marker: {
      color: ddata.map((el) => el.percent)// ,
    }
  }]
};

let render_danger_ages_initial = () => {
  Plotly.plot("danger-ages", get_viz6_danger_ages(), plot_style, {showLink:false, displayModeBar:false});
};

let render_danger_ages_update = () => {
  $("#curage").val(curage);

  let data = get_viz6_danger_ages();
  let danger_div = document.getElementById("danger-ages");
  danger_div.data = get_viz6_danger_ages();

  let scale_quantum = 10;
  let maxy = Math.ceil(data[0].y.reduce((acc,el) => (el>acc) ? el : acc) / scale_quantum) * scale_quantum;
  danger_div.layout.yaxis.range = [0,Math.max(maxy,2*scale_quantum)];

  Plotly.redraw("danger-ages");
};


let curage;
let danger_interval;
let danger_speed = 250;

let start_animation = () => {
  danger_interval = setInterval(() => {
    curage = (curage>=116) ? 0 : curage+1;
    render_danger_ages_update();
  }, danger_speed);
};

$(() => {
  /*
  let danger_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangers_by_age_2014.json?token=AJM69meZC87OtbePBMIAhiYgK3-_Jf3Zks5YLDkAwA%3D%3D";
  $.get(danger_age_json, (dadata) => {
    viz6_danger_ages = JSON.parse(dadata);
    curage = 0;
    render_danger_ages_initial();
  });
  */
  curage = 0;
  render_danger_ages_initial();

  // menu bar button behavior
  $("#danger-set").on("click", () => {
    curage = parseInt($("#curage").val());
    curage = (curage>=116) ? 116 : ((curage<=0) ? 0 : curage);
    render_danger_ages_update();
  });
  $("#danger-pause").on("click", () => {
    if(danger_interval===undefined) {
      $("#danger-pause").html("pause");
      start_animation();
    } else {
      $("#danger-pause").html("resume");
      clearInterval(danger_interval);
      danger_interval = undefined;
    }
  });
  $("#danger-prev").on("click", () => {
    curage = (curage<=0) ? 0 : curage-1;
    render_danger_ages_update();
  });
  $("#danger-next").on("click", () => {
    curage = (curage>=116) ? 0 : curage+1;
    render_danger_ages_update();
  });
});

