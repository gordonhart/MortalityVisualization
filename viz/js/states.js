
// render both overall map and broken down by cod map
let render_states = (state_data) => {

  let data = [];
  // only use 1968 for now
  /*
  for(let state in state_data.years[0].data) {
    let thisstate = state_data.years[0].data[state];
    data.push({
      type: "choropleth",
      locationmode: "USA-states",
      locations: state,
      z: thisstate.age_mu,
      text: thisstate.name,
      autocolorscale: true,
      /* zmin: 50,
      zmax: 100,
      colorscale: [
        [0, "rgb(242,240,247)"], [0.2, "rgb(218,218,235)"],
        [0.4, "rgb(188,189,220)"], [0.6, "rgb(158,154,200)"],
        [0.8, "rgb(117,107,177)"], [1, "rgb(84,39,143)"]
      ], /
      colorbar: {
        title: "Mean Death Age",
        thickness: 1.0
      },
      marker: { // this is the state border
        line: {
            color: "rgb(255,255,255)",
            width: 2
        }
      }
    });
    } */
  let thisyear = state_data.years[0].data;
  let zs = [];
  let locs = [];
  let names = [];
  for(let state in thisyear) {
    locs.push(state);
    zs.push(thisyear[state].age_mu);
    names.push(thisyear[state].name);
  }
  data.push({
    type: "choropleth",
    locationmode: "USA-states",
    locations: locs,
    z: zs,
    text: names,
    colorscale: [
      [0, "rgb(242,240,247)"], [0.2, "rgb(218,218,235)"],
      [0.4, "rgb(188,189,220)"], [0.6, "rgb(158,154,200)"],
      [0.8, "rgb(117,107,177)"], [1, "rgb(84,39,143)"]
    ],
    colorbar: {
      title: "Mean Death Age"// ,
      // thickness: 10.0
    },
    marker: { // this is the state border
      line: {
          color: "rgb(255,255,255)",
          width: 2
      }
    }
  });


  var layout = {
    title: "Age of Death in Different States",
    geo: {
      scope: "usa",
      showlakes: true,
      lakecolor: "rgb(255,255,255)"
    },
    bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  };

  Plotly.plot(document.getElementById("states-overall"),
    data, layout, {showLink: false, displayModeBar: false});
};

$(() => {
  let states = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/states_1968-2002.json?token=AJM69qLzOogTWcUTU-xrDM6VAoT6TKkOks5YLx53wA%3D%3D";"https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/states_1968-2002.json?token=AJM69qLzOogTWcUTU-xrDM6VAoT6TKkOks5YLx53wA%3D%3D";
  $.get(states, (strdata) => {
    render_states(JSON.parse(strdata));
  });
});
