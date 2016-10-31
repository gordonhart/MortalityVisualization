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
  for(let key in data) {
    let thisnode = data[key];
    nodes.push({
      data: {
        id: thisnode.short,
        name: key,
        score: Math.log(thisnode.count+1) * 20,
        count: thisnode.count
      }
      /* position: {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500
      }, */
    });
      console.log(thisnode.short);
    for(let i in thisnode.edges) {
      console.log(thisnode.short);
      let thisedge = thisnode.edges[i];
      nodes.push({
        data: {
          id: thisnode.short + "-" + thisedge.short,
          name: thisnode.short + "-" + thisedge.short,
          source: thisnode.short,
          target: thisedge.short,
          // weight: thisedge.count / 200 // Math.log(thisedge.count+1) * 2
          weight: Math.sqrt(thisedge.count) / 2.5, // Math.log(thisedge.count+1)
          count: thisedge.count
        }// ,
        // class: thisnode.short
      });
    }
    let thiscolor = random_color();
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
        "font-size": "18px",
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
        "control-point-step-size": "150",
        "line-color": thiscolor,
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": thiscolor
      }
    })
  }
  // console.log(nodes);

  let cyto_info = $("#cyto-info");
  // for full sample code see http://jsbin.com/gist/7b511e1f48ffd044ad66?html,output
  var cyto = window.cyto = cytoscape({
    container: document.getElementById("cyto"),
    layout: {
      name: "circle",
      idealEdgeLength: 200,
      nodeOverlap: 10 // 20
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
  let graph_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes.json?token=AJM69oGx5z6-dRFbqvdEHmn794HZJ_5oks5YIBZqwA%3D%3D";
  $.get(graph_json, (data) => {
    render_graph(JSON.parse(data));
  });
});
