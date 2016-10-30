/*
 * STAT 3622 Graph Visualization
 */

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
  let styles = [];
  for(let key in data) {
    let thisnode = data[key];
    nodes.push({
      data: {
        id: key,
        name: thisnode.short,
        score: Math.log(thisnode.count+1) * 20
      },
      position: {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500
      },
      class: thisnode.short
    });
    for(let i in thisnode.edges) {
      let thisedge = thisnode.edges[i];
      nodes.push({
        data: {
          id: thisnode.short + "-" + thisedge.short,
          class: thisnode.short,
          source: key,
          target: thisedge.name,
          // weight: thisedge.count / 200 // Math.log(thisedge.count+1) * 2
          weight: Math.log(Math.pow(thisedge.count,2)+1)
        },
        class: thisnode.short
      });
    }
    styles.push({
      // selector: "node[class=\"" + thisnode.short + "\"]",
      selector: 'node[name = "' + thisnode.short + '"]',
      style: {
        "content": "data(name)",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": random_color(),
        "color": "#FAFAFA",
        "overlay-padding": "6px",
        "font-size": "18px",
        "z-index": "10",
        "width": "data(score)",
        "height": "data(score)"
      }
    });
    styles.push({
      selector: 'edge[class = "' + thisnode.short + '"]',
      style: {
        "width": "data(weight)",
        "curve-style": "bezier"
      }
    })
  }
  // console.log(nodes);

  // for full sample code see http://jsbin.com/gist/7b511e1f48ffd044ad66?html,output
  var cyto = window.cyto = cytoscape({
    container: document.getElementById("cyto"),
    layout: {
      name: "cose",
      idealEdgeLength: 100,
      nodeOverlap: 100 // 20
    },
    style: styles,
    elements: nodes
  });
};

$(() => {
  $.get("https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/multiple_causes.json?token=AJM69pYMYVpM2s3WJWqTPji2eDlXWcT4ks5YHyZOwA%3D%3D", (data) => {
    render_graph(JSON.parse(data));
  });
});
