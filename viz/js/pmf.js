
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

  let chart = document.getElementById(div_id);
  Plotly.newPlot(chart, pmfs, layout, {showLink:false, displayModeBar:false});
};

$(() => {
  let pmf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/pmf_1968-2014.json?token=AJM69quyWGV6LYHS187-YtcTQdRvfmrGks5YLMOTwA%3D%3D";
  $.get(pmf, (strdata) => {
    let pmf_data = JSON.parse(strdata);
    render_pmfs("pmf",pmf_data);
  });
  let cdf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/cdf_1968-2014?token=AJM69tkrycIvR8ve1rRebgRAwaa577NLks5YLWKYwA%3D%3D";
  $.get(cdf, (strdata) => {
    let cdf_data = JSON.parse(strdata);
    render_pmfs("cdf",cdf_data);
  });
});

