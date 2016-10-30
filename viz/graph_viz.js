/*
 * STAT 3622 Graph Visualization
 */

let render_graph = (data) => {

  /*
  let nodes = [
    {
      data: {
        id: "a",
        name: "test",
        score: 150
      },
      position: {
        "x": 200,
        "y": 300
      }
    },
    {
      data: {
        id: "b",
        name: "second",
        score: 100
      },
      position: {
        "x": -200,
        "y": -300
      }
    },
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        weight: "10"
      }
    },
    {
      data: {
        id: "ab",
        source: "b",
        target: "a",
        weight: "100"
      }
    }
  ];
  */

  // for full sample code see http://jsbin.com/gist/7b511e1f48ffd044ad66?html,output
  var cyto = window.cyto = cytoscape({
    container: document.getElementById("cyto"),
    layout: {
      name: "cose",
      idealEdgeLength: 100,
      nodeOverlap: 20
    },
    style: [{
      selector: "node",
      style: {
        "content": "data(name)",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#222222",
        "color": "#FAFAFA",
        "overlay-padding": "6px",
        "font-size": "12px",
        "z-index": "10",
        "width": "data(score)",
        "height": "data(score)"
      }
    }, {
      selector: "edge",
      style: {
        "width": "data(weight)"
      }
    }],
    elements: []
  });

  data = JSON.parse(data);

  for(let key in data) {
    let new_node = {
      id: key,
      name: key,
      width: data[key].score / 300
    }
    cyto.add(new_node);
    for(let edge in data[key].edges) {

    }
  }

};

$(() => {

  /*
  let req = new XMLHttpRequest();
  let reqListener = (e) => {
    graph_data = JSON.parse(this.responseText);
    render_graph();
  };
  req.onload = reqListener;
  req.open("get", "multiple_causes.json", true);
  req.send();
  */

  $.get("https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes.json?token=AJM69uZz4B52AHUOViuBnSlMkJE1BLiLks5YHw1FwA%3D%3D", (data) => {
    render_graph(data);
  });

});
