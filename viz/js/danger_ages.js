

let render_danger_ages = (danger_data) => {

  let dangers = [];
  // for(let i in danger_data.data) {
  let i = 10;
    let thisage = danger_data.data[i];
    dangers.push({
      type: "bar",
      x: thisage.causes.map((el) => el.cause),
      y: thisage.causes.map((el) => el.percent),
      color: thisage.causes.map((el) => el.percent)
      //colorscale: "Viridis"
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
  let danger_age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangers_by_age_2014.json?token=AJM69uctOqOqaL6vicfoicMaSKjqAIj7ks5YKyrwwA%3D%3D";
  $.get(danger_age_json, (dadata) => {
    render_danger_ages(JSON.parse(dadata));
  });
});

