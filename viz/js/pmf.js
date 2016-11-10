
let render_pmfs = (div_id,data) => {
  let pmfs = [];

  for(let cause in data) {
    pmfs.push({
      type: "scatter",
      mode: "lines",
      x: data[cause].map((el) => el.age),
      y: data[cause].map((el) => el.percentage),
      line: {
        width: 1
      },
      visible: true,
      name: cause
    });
  }

  let layout = {
    title:
      (div_id==="pmf") ? "Probability Mass Functions of Various Causes of Death" :
      ((div_id==="cdf") ? "Cumulative Distribution Functions of Various Causes of Death"
      : "Danger Functions of Various Causes of Death"),
    yaxis: {
      title: "Percentage of Deaths"// ,
      // range: [0,1]
    },
    xaxis: {
      showgrid: false,
      fixedaxis: true
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Playfair Display SC"
    }
  };

  let chart = document.getElementById(div_id);
  Plotly.newPlot(chart, pmfs, layout, {showLink:false, displayModeBar:false});
};

// show a trace that sums all visible traces
let show_sumline = (div_id) => {
  let sumname = "Sum of All Visible";
  let div = document.getElementById(div_id);
  let y = [];
  for(let i=0; i<div.data[0].x.length; i++) y.push(0);
  for(let i in div.data) { // fucking ugly, fuck javascript
    if(div.data[i].visible===true && div.data[i].name != sumname) {
      let thistrace = div.data[i].y;
      for(let j in thistrace) {
        y[j] += thistrace[j];
      }
    }
  }
  let set = false;
  for(let i in div.data) {
    if(div.data[i].name===sumname) {
      div.data[i].y = y;
      div.data[i].visible = true;
      Plotly.redraw(div);
      set = true;
    }
  }
  if(!set) { // if the sum doesn't already exist, add it
    Plotly.addTraces(div,{
      type: "scatter",
      mode: "lines",
      x: div.data[0].x,
      y: y,
      line: {
        width: 0
      },
      fill: "tozeroy",
      fillcolor: "rgba(102,45,145,0.1)",
      visible: true,
      name: sumname,
      showLegend: false
    });
  }
};

$(() => {
  let pmf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/pmf_1968-2014.json?token=AJM69quyWGV6LYHS187-YtcTQdRvfmrGks5YLMOTwA%3D%3D";
  $.get(pmf, (strdata) => {
    let pmf_data = JSON.parse(strdata);
    render_pmfs("pmf",pmf_data);
  });
  let cdf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/cdf_1968-2014.json?token=AJM69p0uQsI30ZXGsWSCSXOqJPDG9G72ks5YLWuJwA%3D%3D";
  $.get(cdf, (strdata) => {
    let cdf_data = JSON.parse(strdata);
    render_pmfs("cdf",cdf_data);
  });
  let dangerfun = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangerfun_1968-2014.json?token=AJM69j8kN_xg3UNmFqRKfrlG2TBGVVwCks5YLYA_wA%3D%3D";
  $.get(dangerfun, (strdata) => {
    let dangerfun_data = JSON.parse(strdata);
    render_pmfs("dangerfun",dangerfun_data);
    // show_sumline("dangerfun");
    $("#dangerfun").on("click", () => show_sumline("dangerfun"));
  });
});

