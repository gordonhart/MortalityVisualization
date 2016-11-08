

let render_danger_ages = (danger_data) => {

  let dangers = [];
  // for(let i in danger_data) {
  let i = 10;
    let thisage = danger_data[i];
    let causex = [];
    let causey = [];
    for(let key in thisage.causes) {
      causex.push(key);
      causey.push(thisage.causes[key]);
    }
    dangers.push({
      type: "bar",
      x: causex,
      y: causey
    });
  // }

  Plotly.newPlot(document.getElementById("danger-ages"), dangers, {
    title: "Percentage of Deaths by Age",
    yaxis: {
      title: "Percentage of Deaths"
    },
    xaxis: {
      title: "Cause of Death",
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
    showLink: false
  });

};

$(() => {
  let danger_age_json = "";
  $.get(danger_age_json, (dadata) => {
    render_danger_ages(JSON.parse(dadata));
  });
});

