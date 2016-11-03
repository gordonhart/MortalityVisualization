/*
 * STAT 3622 Graph Visualization
 */

let black = "#222222";
let white = "#FAFAFA";
let accent = "#662d91";

// generate random color
let random_color = () => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for(let i=0; i<6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
let rainbow_color = (index) => {
  var size    = 22;
  var rainbow = new Array(size);

  let sin_to_hex = (i,phase) => {
    var sin = Math.sin(Math.PI / size * 2 * i + phase);
    var int = Math.floor(sin * 127) + 128;
    var hex = int.toString(16);
    return hex.length === 1 ? "0"+hex : hex;
  }

  for (var i=0; i<size; i++) {
    var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
    var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
    rainbow[i] = "#"+ red + green + blue;
  }

  return rainbow[index];
};

let render_graph = (data) => {

  let nodes = [];
  let styles = [{
    selector: "core",
    style: {
      "selection-box-color": accent,
      "selection-box-opacity": 0.5
    }
  }, {
    selector: "node:selected",
    style: {
      "background-color": black
    }
  }];
  let color = 0;
  for(let key in data) {
    let thisnode = data[key];
    nodes.push({
      data: {
        id: thisnode.short,
        name: key,
        score: Math.log(thisnode.count+2) * 20,
        count: thisnode.count
      }
      /* position: {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500
      }, */
    });
    for(let i in thisnode.edges) {
      let thisedge = thisnode.edges[i];
      nodes.push({
        data: {
          id: thisnode.short + "-" + thisedge.short,
          name: thisnode.short + "-" + thisedge.short,
          source: thisnode.short,
          target: thisedge.short,
          // weight: thisedge.count / 200 // Math.log(thisedge.count+1) * 2
          weight: Math.sqrt(thisedge.count+2) / 15, // Math.log(thisedge.count+1)
          count: thisedge.count
        }// ,
        // class: thisnode.short
      });
    }
    let thiscolor = rainbow_color(color); // random_color();
    styles.push({
      // selector: "node[class=\"" + thisnode.short + "\"]",
      selector: 'node[id = "' + thisnode.short + '"]',
      style: {
        "content": "data(id)",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": thiscolor,
        "color": white,
        "text-outline-color": black,
        "text-outline-width": "2px",
        "text-wrap": "wrap",
        "overlay-padding": "10px",
        "font-size": "24px",
        "z-index": "10",
        "width": "data(score)",
        "height": "data(score)"
      }
    });
    styles.push({
      selector: 'edge[source = "' + thisnode.short + '"]',
      style: {
        "width": "data(weight)",
        "curve-style": "bezier",
        "control-point-step-size": "100",
        "line-color": thiscolor,
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": thiscolor
      }
    })
    color++;
  }
  // console.log(nodes);

  let cyto_info = $("#cyto-info");
  // for full sample code see http://jsbin.com/gist/7b511e1f48ffd044ad66?html,output
  var cyto = window.cyto = cytoscape({
    container: document.getElementById("cyto"),
    layout: {
      name: "circle",
      fit: true,
      sort: (a,b) => a.data("count") - b.data("count")
    },
    style: styles,
    elements: nodes,
    minZoom: 0.1,
    maxZoom: 10
  });
  cyto.on('click', (event) => {
    try {
      let target = event.cyTarget._private.data;
      cyto_info.html(target.name + ": " + target.count);
      cyto_info.show();
    } catch(e) {
      cyto_info.hide();
    }
  });
};

$(() => {
  // let graph_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes_2014.json?token=AJM69tqJzlBAuQQt8WhNbN47yrNrZu6yks5YIEN2wA%3D%3D";
  let graph_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes_2014_full.json?token=AJM69hq8Boja17Xk08tKJzZeVdNWpGBHks5YIFtywA%3D%3D";
  $.get(graph_json, (data) => {
    render_graph(JSON.parse(data));
  });
});
