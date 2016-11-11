
// render both overall map and broken down by cod map
let render_states = (state_data) => {
  var data = [{
    type: "choropleth",
    locationmode: "USA-states",
    locations: unpack(rows, "code"),
    z: unpack(rows, "total exports"),
    text: unpack(rows, "state"),
    zmin: 50,
    zmax: 100,
    colorscale: [
      [0, "rgb(242,240,247)"], [0.2, "rgb(218,218,235)"],
      [0.4, "rgb(188,189,220)"], [0.6, "rgb(158,154,200)"],
      [0.8, "rgb(117,107,177)"], [1, "rgb(84,39,143)"]
    ],
    colorbar: {
      title: "Mean Death Age",
      thickness: 0.2
    },
    marker: {
      line:{
          color: "rgb(255,255,255)",
          width: 2
      }
    }
  }];


  var layout = {
    title: "Age of Death in Different States",
    geo: {
      scope: "usa",
      showlakes: true,
      lakecolor: "rgb(255,255,255)"
    }
  };

  Plotly.plot(document.getElementById("states-overall"),
    data, layout, {showLink: false, displayModeBar: false});
};

$(() => {
  let states = "";
  $.get(states, (strdata) => {
    render_states(states);
  });
});
