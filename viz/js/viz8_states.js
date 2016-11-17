
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
  // year: viz8_states.years[0].year,
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
  let thisyear = viz8_states.years[0].data;
  let zs = [];
  let locs = [];
  let names = [];
  for(let state in thisyear) {
    locs.push(state);
    zs.push(thisyear[state].age_mu);
    names.push(thisyear[state].name);
  }
  let cur_traces = $.extend(true,{},state_traces);
  cur_traces.locations = locs;
  cur_traces.z = zs;
  cur_traces.text = names;
  cur_traces.zmin = 55; // zs.reduce((acc,z) => (z<acc) ? z : acc);
  cur_traces.zmax = 76; zs.reduce((acc,z) => (z>acc) ? z : acc);
  Plotly.plot("states-overall", [cur_traces], state_overall_layout, {showLink: false, displayModeBar: false});
};

let render_state_cause = (cause) => {
  // console.log("changing to " + cause);
  if(cause==="") return; // nothing for blank option
  let state_cause_data = $.extend(true,{},state_traces);
  state_cause_data.all_years = {};
  let locs = [];
  let names = [];
  for(let year in viz8_states.years) {
    let thisyear = viz8_states.years[year].data;
    let zs = [];
    for(let state in thisyear) {
      if(locs.length < 50) {
        locs.push(state);
        names.push(thisyear[state].name);
      }
      try {
        zs.push(thisyear[state].causes[cause].mu);
      } catch(e) {
        zs.push(0);
      }
    }
    state_cause_data.all_years[viz8_states.years[year].year] = zs;
  }
  // find global max, min for cause over years
  let zmin = viz8_states.years.reduce((acc,yr) => {
    let curmin = acc;
    for(let state in yr.data) {
      let thispct = yr.data[state].causes[cause]
      curmin = (thispct < curmin) ? thispct : curmin;
    } return curmin; },120);
  let zmax = viz8_states.years.reduce((acc,yr) => {
    let curmax = acc;
    for(let state in yr.data) {
      let thispct = yr.data[state].causes[cause]
      curmax = (thispct > curmax) ? thispct : curmax;
    } return curmax; },0);
  state_cause_data.locations = locs;
  state_cause_data.z = state_cause_data.all_years[curyear];
  state_cause_data.text = names;
  state_cause_data.zmin = zmin;
  state_cause_data.zmax = zmax;
  let layout = $.extend(true,{},state_overall_layout);
  layout.title = "Age of Death in Different States from " + cause;
  Plotly.newPlot("states-by-cod", [state_cause_data], layout, {showLink: false, displayModeBar: false});
};

let render_state_cause_update = () => {
  $("#curyear").val(curyear);
  let state_cause_div = document.getElementById("states-by-cod");
  let thisyear_data = state_cause_div.data[0].all_years[curyear];
  state_cause_div.data[0].z = thisyear_data;
  Plotly.redraw("states-by-cod");
};


let curyear;
let states_interval;
let states_speed = 250;

let render_states_update = () => {
  $("#curyear").val(curyear);

  let state_div = document.getElementById("states-overall");
  let thisyear = viz8_states.years.reduce((acc,y) => {
    return (y.year===curyear) ? y.data : acc
  }, viz8_states.years[0].data);

  let zs = [];
  let locs = [];
  let names = [];
  for(let state in thisyear) {
    locs.push(state);
    zs.push(thisyear[state].age_mu);
    names.push(thisyear[state].name);
  }

  state_div.data[0].z = zs;
  state_div.data[0].text = names;
  state_div.data[0].locations = locs;
  // state_div.data[0].zmin = zs.reduce((acc,z) => (z<acc) ? z : acc);
  // state_div.data[0].zmax = zs.reduce((acc,z) => (z>acc) ? z : acc);
  state_div.layout.title = "Age of Death in Different States, " + curyear;
  Plotly.redraw("states-overall");
  render_state_cause_update();
};


$(() => {
  /*
  let states = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/states_1968-2002.json?token=AJM69jKg5DIslvZPzReH5MG0Gps-Ya56ks5YLyXJwA%3D%3D";
  $.get(states, (strdata) => {
    viz8_states = JSON.parse(strdata);
    curyear = 1968;
    render_states();
    let curcause_div = document.getElementById("curcause");
    for(let cause in viz8_states.years[0].data['AK'].causes) {
      let new_option = document.createElement("option");
      new_option.value = cause;
      new_option.innerHTML = cause;
      curcause_div.appendChild(new_option);
    }
    // render_state_causes("Diabetes");
  });
  */
  curyear = 1968;
  render_states();
  let curcause_div = document.getElementById("curcause");
  for(let cause in viz8_states.years[0].data['AK'].causes) {
    let new_option = document.createElement("option");
    new_option.value = cause;
    new_option.innerHTML = cause;
    curcause_div.appendChild(new_option);
  }
  // render_state_cause("Diabetes");
  render_state_cause("");

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
  $("#curcause").on("change", (el) => {
    let select_div = document.getElementById("curcause");
    let selected_cause = select_div.options[select_div.selectedIndex].value;
    render_state_cause(selected_cause);
  });
});
