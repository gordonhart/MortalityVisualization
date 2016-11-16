
let render_pdfs = (div_id,data) => {
  let pdfs = [];

  for(let cause in data) {
    pdfs.push({
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
    title: (div_id==="pdf")
      ? "Probability Density Functions of Various Causes of Death"
      : "Cumulative Distribution Functions of Various Causes of Death",
    yaxis: {
      title: "Proportion of Deaths"// ,
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
  Plotly.newPlot(chart, pdfs, layout, {showLink:false, displayModeBar:false});
};

let render_dangerfun = (data) => {
  let dangers = [];
  for(let cause in data) {
    let ydata = data[cause].map((el) => 100*el.percentage);
    dangers = [{
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
    }].concat(dangers); // for some reason the results are reverse
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
        fixedaxis: true,
        rangeslider: {}
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
  /*
  let pdf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/pdf_1968-2014.json?token=AJM69quyWGV6LYHS187-YtcTQdRvfmrGks5YLMOTwA%3D%3D";
  $.get(pdf, (strdata) => {
    let viz7_pdf = JSON.parse(strdata);
    render_pdfs("pdf",viz7_pdf);
  });
  let cdf = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/cdf_1968-2014.json?token=AJM69p0uQsI30ZXGsWSCSXOqJPDG9G72ks5YLWuJwA%3D%3D";
  $.get(cdf, (strdata) => {
    let viz7_cdf = JSON.parse(strdata);
    render_pdfs("cdf",viz7_cdf);
  });
  */
  render_pdfs("pdf",viz7_pdf);
  render_pdfs("cdf",viz7_cdf);
  /*
  let dangerfun = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/dangerfun_1968-2014.json?token=AJM69hjNcSM96flpcKbm_HiTu09MO3OTks5YLaLXwA%3D%3D";
  $.get(dangerfun, (strdata) => {
    let viz6_dangerfun = JSON.parse(strdata);
    render_dangerfun(viz6_dangerfun);
    // show_sumline("dangerfun");
    // $("#dangerfun").on("click", () => show_sumline("dangerfun"));
    update_dangerfun();
    $("#dangerfun").on("click", () => update_dangerfun());
  });
  */
  render_dangerfun(viz6_dangerfun);
  update_dangerfun();
  $("#dangerfun").on("click", () => update_dangerfun());
});

