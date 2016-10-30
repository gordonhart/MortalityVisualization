/*
 * STAT 3622 Graph Visualization
 */

let graph_data;
let render_graph = () => {

  // for full sample code see http://jsbin.com/gist/7b511e1f48ffd044ad66?html,output
  var cyto = window.cyto = cytoscape({
    container: document.getElementById('cyto'),
    layout: {
      name: 'cose',
      idealEdgeLength: 100,
      nodeOverlap: 20
    },
    style: [{
      "selector": "node",
      "style": {
        "content": "data(name)",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#222222",
        "color": "#FAFAFA",
        "overlay-padding": "6px",
        "font-size": "12px",
        "z-index": "10",
      }
    }],
    elements: [
    ]
  });

};

$(() => {

  let req = new XMLHttpRequest();
  let reqListener = (e) => {
    graph_data = JSON.parse(this.responseText);
    render_graph();
  };
  req.onload = reqListener;
  req.open("get", "multiple_causes.json", true);
  req.send();

  /*
  $.get("multiple_causes.json", (data) => {
      console.log(data);
  });
  */

});
