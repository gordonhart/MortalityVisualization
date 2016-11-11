
let state_data;

var state_overall_layout = {
  title: "Age of Death in Different States, 1968",
  geo: {
    scope: "usa",
    showlakes: true,
    lakecolor: "rgba(255,255,255,0)",
    bgcolor: "rgba(100,0,0,0)"
  },
  margin: {
    t: 150,
    b: 150
  },
  paper_bgcolor: "rgba(0,0,0,0)",
  font: {
    family: "Playfair Display SC"
  }
};

let state_traces = {
  type: "choropleth",
  locationmode: "USA-states",
  // year: state_data.years[0].year,
  colorscale: [
    /* [0, "rgb(242,240,247)"], [0.2, "rgb(218,218,235)"],
    [0.4, "rgb(188,189,220)"], [0.6, "rgb(158,154,200)"],
    [0.8, "rgb(117,107,177)"], [1, "rgb(84,39,143)"] */
    // [0, "rgb(242,242,242)"], /* [0.5, "#c2abd3"], */ [1, "#000"]
    // [0, "#FF0000"], [0.5, "#00FF00"], [1, "#0000FF"]
    // [0, "#f466ba"], [0.75, "#8f84d0"], [1, "#00aeef"] // this is a good one
    [0, "#f9ed32"], [0.65, "#f466ba"], [1, "#00aeef"] // this is a good one
    // [0, "rgba(244,102,186,0)"], [0.75, "rgba(244,102,186,0.5)"], [1, "rgba(244,102,186,1)"]
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
};

// render both overall map and broken down by cod map
let render_states = () => {
  let thisyear = state_data.years[0].data;
  let zs = [];
  let locs = [];
  let names = [];
  for(let state in thisyear) {
    locs.push(state);
    zs.push(thisyear[state].age_mu);
    names.push(thisyear[state].name);
  }
  let cur_traces = $.extend({},state_traces,true);
  cur_traces.locations = locs;
  cur_traces.z = zs;
  cur_traces.text = names;
  cur_traces.zmin = 55; // zs.reduce((acc,z) => (z<acc) ? z : acc);
  cur_traces.zmax = 76; zs.reduce((acc,z) => (z>acc) ? z : acc);
  Plotly.plot("states-overall", [cur_traces], state_overall_layout, {showLink: false, displayModeBar: false});
};



let curyear;
let states_interval;
let states_speed = 250;

let render_states_update = () => {
  $("#curyear").val(curyear);

  let state_div = document.getElementById("states-overall");
  let thisyear = state_data.years.reduce((acc,y) => {
    return (y.year===curyear) ? y.data : acc
  }, state_data.years[0].data);

  let zs = [];
  let locs = [];
  let names = [];
  for(let state in thisyear) {
    locs.push(state);
    zs.push(thisyear[state].age_mu);
    names.push(thisyear[state].name);
  }

  /*
  let cur_traces = $.extend({},state_traces,true);
  cur_traces.locations = locs;
  cur_traces.z = zs;
  cur_traces.text = names;
  */
  state_div.data[0].z = zs;
  state_div.data[0].text = names;
  state_div.data[0].locations = locs;
  // state_div.data[0].zmin = zs.reduce((acc,z) => (z<acc) ? z : acc);
  // state_div.data[0].zmax = zs.reduce((acc,z) => (z>acc) ? z : acc);
  state_div.layout.title = "Age of Death in Different States, " + curyear;
  Plotly.redraw("states-overall");
  render_state_causes_update();

  /*
  state_layout.title = "Age of Death in Different States, " + curyear;
  Plotly.plot("states-overall", [cur_traces], state_layout, {showLink: false, displayModeBar: false});
  */
};


$(() => {
  let states = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/states_1968-2002.json?token=AJM69jKg5DIslvZPzReH5MG0Gps-Ya56ks5YLyXJwA%3D%3D";
  $.get(states, (strdata) => {
    state_data = JSON.parse(strdata);
    curyear = 1968;
    render_states();
    render_state_causes();
  });

  // menu bar button behavior
  $("#states-set").on("click", () => {
    curyear = parseInt($("#curyear").val());
    curyear = (curyear>=2002) ? 2002 : ((curyear<=1968) ? 1968 : curyear);
    render_states_update();
  });
  $("#states-pause").on("click", () => {
    if(states_interval===undefined) {
      $("#states-pause").html("pause");
      states_interval = setInterval(() => {
        curyear = (curyear>=2002) ? 1968 : curyear+1;
        render_states_update();
      }, states_speed);
    } else {
      $("#states-pause").html("resume");
      clearInterval(states_interval);
      states_interval = undefined;
    }
  });
  $("#states-prev").on("click", () => {
    curyear = (curyear<=1968) ? 2002 : curyear-1;
    render_states_update();
  });
  $("#states-next").on("click", () => {
    curyear = (curyear>=2002) ? 1968 : curyear+1;
    render_states_update();
  });
});




// render max cause of death by state
let render_state_causes = () => {

  var layout = {
    title: "Leading Cause of Death by State, 1968",
    geo: {
      scope: "usa",
      showlakes: true,
      lakecolor: "rgba(255,255,255,0)",
      bgcolor: "rgba(100,0,0,0)"
    },
    margin: {
      t: 150,
      b: 150
    },
    showlegend: false,
    paper_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  };

  let thisyear = $.extend({},state_data.years[0].data,true);
  let traces = get_state_cause_traces(thisyear);
  Plotly.plot("states-by-cod", traces, layout, {showLink: false, displayModeBar: false});
};


let get_state_cause_traces = (thisyear) => {
  let colors = {
    "Heart Diseases": "#F00",
    "Cancer": "#0F0",
    "All Other External Causes": "#00F"
  };
  let is_empty = (obj) => {
    let ct = 0;
    for(let prop in obj) ct++;
    return ct==0;
  }
  let traces = [];
  while(!is_empty(thisyear)) {
    let first;
    for(first in thisyear) break;
    let thiscause = thisyear[first].leading_killer;

    let zs = [];
    let locs = [];
    let names = [];
    for(let state in thisyear) {
      if(thisyear[state].leading_killer === thiscause) {
        locs.push(state);
        zs.push(thisyear[state].lk_percent);
        names.push(thisyear[state].leading_killer);
        delete thisyear[state];
      }
    }
    let thiscolor = colors[thiscause]; // random_color();
    traces.push({
      type: "choropleth",
      locationmode: "USA-states",
      marker: {
        line: { color: "#FFF", width: 2 }
      },
      colorscale: [[0,thiscolor],[1,thiscolor]],// [ [0,"#0A5"], [1,"#0A5"] ],
      showscale: false,
      text: names,
      z: zs,
      locations: locs
    });
    traces.push({
      type: "scattergeo",
      mode: "text",
      locationmode: "USA-states",
      text: [names[0]],
      locations: [locs[0]]
      // showlegend: true
    });
  }
  return traces;
};


let render_state_causes_update = () => {
  $("#curyear").val(curyear);

  let state_div = document.getElementById("states-by-cod");
  let thisyear = $.extend({},state_data.years.reduce((acc,y) => {
    return (y.year===curyear) ? y.data : acc
  }, state_data.years[0].data),true);

  let traces = get_state_cause_traces(thisyear);
  state_div.data = traces;
  state_div.layout.title = "Leading Cause of Death by State, " + curyear,
  Plotly.redraw("states-by-cod");
};
