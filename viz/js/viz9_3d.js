
// render cause of death data on 3d chart
let render_cod_surface = (cod) => {

  // x is index in row, xarray is 1d-values
  // y is index of row, yarray is 1d-values
  // z is value
  let xs = [];
  let ys = [];
  let zs = [];
  let thiscause = viz9_3d[cod];
  for(let i in thiscause) {
    if(thiscause[i].year != 1972) {
      if(ys.length == 0) {
        for(let j in thiscause[i].ages) xs.push(thiscause[i].ages[j].age);
      }
      ys.push(thiscause[i].year);
      zs.push(
        thiscause[i].ages.map((el) => el.pct)
      );
    }
    // console.log(thiscause[i].year);
  }

  let zmin = zs.reduce((acc1,zl) => Math.min(zl.reduce((acc2,z) => Math.min(acc2,z),1)),1);
  let zmax = zs.reduce((acc1,zl) => Math.max(zl.reduce((acc2,z) => Math.max(acc2,z),0)),0);
  console.log(zmin);
  console.log(zmax);

  let surface_data = [{
    x: xs,
    y: ys,
    z: zs,
    zmin: zmin,
    zmax: zmax,
    type: "surface", /*,
    surfacecolor: [
      [0, "rgba(200,200,0,0.1)"], [1.0, "rgba(200,200,0,1)"]
    ],
    cauto: false, */
    autocolorscale: false,
    colorscale: [
      // [0, "#f9ed32"], [0.65, "#f466ba"], [1, "#00aeef"] // this is a good one
      [0, "#DDDDDD"], [1.0, "#be1e2d"]
    ]
  }];

  let surface_layout = {
    title: "Deaths from " + cod + " by Age by Year",
    /*
    projection: {
      x: {
        opacity: 0.25,
        show: true
      }
    },
    */
    // width: 800,
    scene: {
      xaxis: {
        title: "Age at Death" /*
        showgrid: false,
        fixedaxis: true,
        rangeslider: {} */
      },
      yaxis: {
        title: "Year of Death"
      },
      zaxis: {
        title: "% of Total Deaths from " + cod
      },
      aspectratio: {
        x: 2,
        y: 1.5,
        z: 1
      }
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    },
    margin: {
      t: 75,
      b: 75,
      l: 0,
      r: 0
    }
  };

  Plotly.purge("cod-3d");
  Plotly.newPlot("cod-3d", surface_data, surface_layout, {showLink: false, displayModeBar: false});
};

$(() => {

  // setup menu behavior
  let curcause_3d_div = document.getElementById("curcause-3d");
  for(let cause in viz9_3d) {
    let new_option = document.createElement("option");
    new_option.value = cause;
    new_option.innerHTML = cause;
    curcause_3d_div.appendChild(new_option);
  }

  // render_cod_surface("");

  $("#curcause-3d").on("change", (el) => {
    let select_div = document.getElementById("curcause-3d");
    let selected_cause = select_div.options[select_div.selectedIndex].value;
    console.log(selected_cause);
    render_cod_surface(selected_cause);
  });
});
