
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
    range: [0,100]
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
    type: "bar",
    mode: "markers",
    x: ddata.map((el) => el.cause),
    y: ddata.map((el) => 100 * el.percent),
    marker: {
      color: ddata.map((el) => el.percent)// ,
      // showscale: true
      // colorscale: "Viridis"
    }
  }]
};

let render_danger_ages_initial = () => {
  Plotly.plot("danger-ages", get_danger_data(), plot_style, { showLink: false })
  /*
  .then(() => {
    Plotly.addFrames("danger-ages", danger_data.data.map((age,i) => {
      let d = get_danger_data(i);
      d.name = "frame" + i;
      console.log("adding " + d.name);
      return d;
    }));
  });
  */
};

/*
let start_animation = () => {
  let frame_names = Array.apply(null, {length:danger_data.data.length}).map((el,i) => "frame" + i);
  let frame_duration = Array.apply(null, {length:danger_data.data.length}).map(() => {return {duration:250}});
  let frame_transition = Array.apply(null, {length:danger_data.data.length}).map(() => {return {duration:250,easing:"cubic-in"}});
  Plotly.animate("danger-ages", frame_names, { frame: frame_duration, transition: frame_transition, mode: "afterall" });
};
*/


let render_danger_ages_update = () => {
  let data = get_danger_data();
  let danger_div = document.getElementById("danger-ages");
  danger_div.data = get_danger_data();

  let scale_quantum = 20;
  let maxy = Math.ceil(data[0].y.reduce((acc,el) => (el>acc) ? el : acc) / scale_quantum) * scale_quantum;
  danger_div.layout.yaxis.range = [0,Math.max(maxy,2*scale_quantum)];

  Plotly.redraw("danger-ages" /*, {
    data: data,
    traces: [0],
    layout: {
      yaxis: {
        range: [0,maxy]
      }
    }
  }, {
    transition: {
      duration: 250,
      ease: 'cubic-in-out'
    }
  }); */);
};


let curage;
let danger_data;
$(() => {
  let danger_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangers_by_age_2014.json?token=AJM69meZC87OtbePBMIAhiYgK3-_Jf3Zks5YLDkAwA%3D%3D";
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

