

let render_age = (age_data,lifeexp_data,marriage_data) => {
  let males = {
    type: "scatter",
    mode: "lines",
    line: {
      width: 1,
    },
    x: [],
    y: [],
    error_y: {
      array: [],
      type: "data",
      thickness: 0.25,
      width: 0.25
    },
    name: "Male Mean Age at Death"
  };
  let females = $.extend(true,{},males);
  females.name = "Female Mean Age at Death";
  let m_lifeexp = $.extend(true,{},males);
  m_lifeexp.name = "Male Life Expectancy";
  let f_lifeexp = $.extend(true,{},females);
  f_lifeexp.name = "Female Life Expectancy";

  for(let i in age_data.data) {
    let thisyear = age_data.data[i];
    males.x.push(thisyear.year);
    males.y.push(thisyear.male.mu);
    // males.error_y.array.push(thisyear.male.stdev);
    females.x.push(thisyear.year);
    females.y.push(thisyear.female.mu);
    // females.error_y.array.push(thisyear.female.stdev);
  }

  for(let i in lifeexp_data.data) {
    let thisyear = lifeexp_data.data[i];
    m_lifeexp.x.push(thisyear.year);
    m_lifeexp.y.push(thisyear.male);
    f_lifeexp.x.push(thisyear.year);
    f_lifeexp.y.push(thisyear.female);
  }

  let marriages = {
    male: {
      Single: $.extend(true,{},males),
      Divorced: $.extend(true,{},males),
      Widowed: $.extend(true,{},males),
      Married: $.extend(true,{},males)
    },
    female: {
      Single: $.extend(true,{},males),
      Divorced: $.extend(true,{},males),
      Widowed: $.extend(true,{},males),
      Married: $.extend(true,{},males)
    }
  };
  for(let key in marriages.male) {
    marriages.male[key].name = key + " Male Mean Age at Death";
    marriages.female[key].name = key + " Female Mean Age at Death";
  }
  for(let year in marriage_data) {
    for(let gender in marriage_data[year]) {
      for(let key in marriage_data[year][gender]) {
        marriages[gender][key].x.push(marriage_data[year][gender][key]);
      }
    }
  }

  let traces = [males,females,m_lifeexp,f_lifeexp];
  for(let key in marriages.male) {
    traces.push(marriages.male[key]);
    traces.push(marriages.female[key]);
  }

  let layout = {
    title: "Mean Age at Death by Gender over Time",
    yaxis: {
      title: "Age at Death",
      range: [50,90] // [20,100]
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

  let chart = document.getElementById("ages");
  Plotly.newPlot(chart, traces, layout, {showLink:false, displayModeBar:false});
};

$(() => {
  let age_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/ages_68-14.json?token=AJM69voVzzY2uioWADBk0m0F1YwMK3QIks5YKVB6wA%3D%3D";
  let lifeexp_json = "https://raw.githubusercontent.com/gordonhart/STAT3622/master/data/json/lifeexp_1965-2014.json?token=AJM69rA7UsgANr53UyQFDf1xZKghA2YRks5YLYGQwA%3D%3D";
  let marriage_json = "";
  $.get(age_json, (adata) => {
    $.get(lifeexp_json, (ledata) => {
      $.get(marriage_json, (mdata) => {
        render_age(
          JSON.parse(adata),
          JSON.parse(ledata),
          JSON.parse(mdata));
      });
    });
  });
});


