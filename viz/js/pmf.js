
var pmf_data;
let render_pmfs = () => {
  let pmfs = [];

  for(let cause in pmf_data) {
    pmfs.push({
      type: "scatter",
      mode: "lines",
      x: pmf_data[cause].map((el) => el.age),
      y: pmf_data[cause].map((el) => el.percentage),
      line: {
        width: 1
      },
      visible: true,
      name: cause
    });
  }

  let layout = {
    title: "Probability Mass Functions of Various Disease Types",
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

  let chart = document.getElementById("pmf");
  Plotly.newPlot(chart, pmfs, layout, {showLink:false, displayModeBar:false});
};

$(() => {
  let pmf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/pmf_1968-2014.json?token=AJM69quyWGV6LYHS187-YtcTQdRvfmrGks5YLMOTwA%3D%3D";
  $.get(pmf, (strdata) => {
    pmf_data = JSON.parse(strdata);
    render_pmfs();
  });
});

