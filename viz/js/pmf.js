
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
    title: (div_id==="pmf")
      ? "Probability Mass Functions of Various Causes of Death"
      : "Cumulative Distribution Functions of Various Causes of Death",
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

let render_dangerfun = (data) => {
  let dangers = [];
  for(let cause in data) {
    let ydata = data[cause].map((el) => el.percentage);
    dangers.push({
      type: "scatter",
      mode: "lines",
      x: data[cause].map((el) => el.age),
      y: ydata,
      rawy: ydata, // store unaltered y values
      line: {
        width: 0
      },
      fill: "tonexty",
      visible: true,
      name: cause
    });
  }

  Plotly.newPlot(
    document.getElementById("dangerfun"),
    dangers, {
      title: "Danger of Each Cause of Death by Age",
      yaxis: {
        title: "Percentage of Total Deaths at Age"// ,
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
    }, {showLink:false, displayModeBar:false});
};

// dangerfun is a stacked fill plot
let update_dangerfun = () => {
  let div = document.getElementById("dangerfun");
  let yacc = div.data[0].y.map(() => 0);
  for(let i=0; i<div.data.length; i++) {
    if(div.data[i].visible===true) {
      div.data[i].y = div.data[i].rawy.map((v,i) => {
        yacc[i] += v;
        return yacc[i];
      });
    }
  }
  Plotly.redraw(div);
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
  let dangerfun = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangerfun_1968-2014.json?token=AJM69hjNcSM96flpcKbm_HiTu09MO3OTks5YLaLXwA%3D%3D";
  $.get(dangerfun, (strdata) => {
    let dangerfun_data = JSON.parse(strdata);
    render_dangerfun(dangerfun_data);
    // show_sumline("dangerfun");
    // $("#dangerfun").on("click", () => show_sumline("dangerfun"));
    update_dangerfun();
    $("#dangerfun").on("click", () => update_dangerfun());
  });
});

