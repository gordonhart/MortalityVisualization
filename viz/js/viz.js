
let scroll_to = (target) => {
  $("body").animate({
    scrollTop: $("#" + target).offset().top
  });
};

let scroll_listener = (button,target) => {
  $("#" + button).on('click', () => {
    scroll_to(target);
  });
};

// main page behavior
$(() => {

  let actions = [ // do/undo when hitting a certain point
    {
      forward: () => scroll_to("header-block"),
      backward: () => scroll_to("header-block")
    },{
      forward: () => scroll_to("data-processing"),
      backward: () => scroll_to("header-block")
    },{
      forward: () => scroll_to("data-processing-2"),
      backward: () => scroll_to("data-processing")
    },{
      forward: () => scroll_to("data-processing-3"),
      backward: () => scroll_to("data-processing-2")
    },{
      forward: () => scroll_to("viz1"),
      backward: () => scroll_to("data-processing-3")
    },{
      forward: () => scroll_to("cyto"),
      backward: () => scroll_to("viz1")
    },{
      forward: () => {
        cyto_info("hiding all edges with fewer than 10,000 occurrences");
        hide_weak_edges(1e4);
      },
      backward: () => {
        cyto_info();
        show_all_edges();
      }
    },{
      forward: () => {
        cyto_info("hiding all nodes with fewer than 10,000 occurrences");
        hide_weak_nodes(1e4);
      },
      backward: () => {
        cyto_info();
        show_all_nodes();
      }
    },{
      forward: () => {
        cyto_info("hiding all edges with fewer than 100,000 occurrences");
        hide_weak_edges(1e5);
      },
      backward: () => {
        cyto_info();
        show_all_edges();
      }
    },{
      forward: () => {
        cyto_info();
        scroll_to("viz2")
      },
      backward: () => scroll_to("cyto")
    },{
      forward: () => scroll_to("cod"),
      backward: () => scroll_to("viz2")
    },{
      forward: () => filter_chart("cod",["Diabetes","Vehicular Accidents"]),
      backward: () => filter_chart("cod",[])
    },{
      forward: () => filter_chart("cod",["Suicide","Homicide"]),
      backward: () => filter_chart("cod",["Diabetes","Vehicular Accidents"])
    },{
      forward: () => scroll_to("viz3"),
      backward: () => scroll_to("cod")
    },{
      forward: () => scroll_to("ages"),
      backward: () => scroll_to("viz3")
    },{
      forward: () => scroll_to("viz4"),
      backward: () => scroll_to("ages")
    },{
      forward: () => scroll_to("cod-ages"),
      backward: () => scroll_to("viz4")
    },{
      forward: () => filter_chart("cod-ages",["Diabetes"]),
      backward: () => filter_chart("cod-ages",[])
    },{
      forward: () => scroll_to("viz5"),
      backward: () => scroll_to("cod-ages")
    },{
      forward: () => scroll_to("edu-ages"),
      backward: () => scroll_to("viz5")
    },{
      forward: () => scroll_to("viz6"),
      backward: () => scroll_to("edu-ages")
    },{
      forward: () => {
        $("#danger-overlay").show();
        scroll_to("danger-ages");
      },
      backward: () => {
        $("#danger-overlay").hide();
        scroll_to("viz6");
      }
    },{
      forward: () => {
        $("#danger-overlay").hide();
        scroll_to("dangerfun")
      },
      backward: () => {
        $("#danger-overlay").show();
        scroll_to("danger-ages");
      }
    },{
      forward: () => scroll_to("viz7"),
      backward: () => scroll_to("danger-ages")
    },{
      forward: () => scroll_to("pdf"),
      backward: () => scroll_to("viz7")
    },{
      forward: () => {
        filter_chart("pdf",
          ["Perinatal Complications","Congenital Anomalies","Undetermined Diseases"],
          true); // SIDS is undetermined
      },
      backward: () => filter_chart("pdf",[])
    },{
      forward: () => {
        filter_chart("pdf",
          ["Homicide","Suicide","Vehicular Accidents","All Other External Causes"]);
      },
      backward: () => filter_chart("pdf",[])
    },{
      forward: () => scroll_to("cdf"),
      backward: () => scroll_to("pdf")
    },{
      forward: () => {
        filter_chart("cdf",
          ["Homicide","Suicide","Vehicular Accidents","All Other External Causes"]);
      },
      backward: () => filter_chart("cdf",[])
    },{
      forward: () => {
        filter_chart("cdf",
          ["Cancer","Hypertension","All Other Diseases",
            "Influenza and Pneumonia","Heart Diseases","Circulatory Diseases",
            "Diabetes","Digestive Tract Diseases","Bronchitis / COPD",
            "Stroke","Influenza and Pneumonia","Kidney Diseases"]);
        filter_chart("pdf",
          ["Cancer","Hypertension","All Other Diseases",
            "Influenza and Pneumonia","Heart Diseases","Circulatory Diseases",
            "Diabetes","Digestive Tract Diseases","Bronchitis / COPD",
            "Stroke","Influenza and Pneumonia","Kidney Diseases"]);
      },
      backward: () => {
        filter_chart("cdf",[]);
        filter_chart("pdf",[]);
      }
    },{
      forward: () => scroll_to("pdf"),
      backward: () => scroll_to("cdf")
    },{
      forward: () => scroll_to("viz8"),
      backward: () => scroll_to("pdf")
    },{
      forward: () => {
        $("#states-overlay").show();
        scroll_to("states-overall");
      },
      backward: () => {
        $("#states-overlay").hide();
        scroll_to("viz8");
      }
    },{
      forward: () => {
        $("#curcause").show();
        scroll_to("states-viz2")
      },
      backward: () => {
        $("#curcause").show();
        scroll_to("states-overall");
      }
    },{
      forward: () => {
        $("#states-overlay").hide();
        scroll_to("viz9")
      },
      backward: () => {
        $("#states-overlay").show();
        scroll_to("states-viz2");
      }
    },{
      forward: () => {
        $("#3d-overlay").show();
        scroll_to("cod-3d")
      },
      backward: () => {
        $("#3d-overlay").hide();
        scroll_to("viz9");
      }
    },{
      forward: () => {
        $("#3d-overlay").hide();
        scroll_to("end")
      },
      backward: () => {
        $("#3d-overlay").show();
        scroll_to("cod-3d");
      }
    },{ // terminator
      forward: () => {},
      backward: () => {}
    }
  ];

  let curloc = -1;
  let bounds_check = () => {
    curloc = (curloc < 0) ? 0 : curloc;
    curloc = (curloc >= actions.length) ? actions.length-1 : curloc;
    // console.log(curloc);
    $("#curloc").val(curloc+1);
  }
  $("html").on("keypress", (e) => {
    try {
      if(e.keyCode===110) { // n[ext], move down
        curloc++;
        bounds_check();
        actions[curloc].forward();
      } else if(e.keyCode===112) { // p[rev], move up
        actions[curloc].backward();
        curloc--;
        bounds_check();
      } else if(e.keyCode===13 && $("#curloc").is(":focus")) {
        curloc = parseInt($("#curloc").val());
        bounds_check();
        actions[curloc].forward();
      }
    } catch(exp) {
      console.log(exp);
    }
  });

  $("#total-slides").html(actions.length);

  // redraw all plotly charts to ensure legend fits content
  setTimeout(() => {
    plotly_divs = ["cod","ages","cod-ages","edu-ages","danger-ages",
      "dangerfun","pdf","cdf","states-overall","states-by-cod","cod-3d"];
    plotly_divs.map((el_id) => {
      // console.log(el_id);
      try { Plotly.redraw(el_id); } catch(e) {}
    });
  }, 500);
});


