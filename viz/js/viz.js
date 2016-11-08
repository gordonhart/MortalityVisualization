
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
      forward: () => scroll_to("viz1"),
      backward: () => scroll_to("header-block")
    },{
      forward: () => scroll_to("cyto"),
      backward: () => scroll_to("viz1")
    },{
      forward: () => scroll_to("viz2"),
      backward: () => scroll_to("cyto")
    },{
      forward: () => scroll_to("cod"),
      backward: () => scroll_to("viz2")
    }, /*{
      forward: () => {
        $("#timeseries").hide();
        $("#timeseries-normalized").show();
        render_timeseries(true);
      },
      backward: () => {
        $("#timeseries").show();
        $("#timeseries-normalized").hide();
        render_timeseries(false);
      },
    }, */ {
      forward: () => filter_chart("cod",["Diabetes","Vehicular Accidents"]),
      backward: () => filter_chart("cod",[]) // render_timeseries(false)
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
      forward: () => scroll_to("viz5"),
      backward: () => scroll_to("cod-ages")
    },{
      forward: () => scroll_to("edu-ages"),
      backward: () => scroll_to("viz5")
    },{ // terminator
      forward: () => {},
      backward: () => {}
    }
  ];


  // scroll_listener("to-cyto","cyto");
  // scroll_listener("after-cyto","viz2");
  // scroll_listener("to-timeseries","timeseries");

  // scroll through j/k keypress
  // let locs = ["header-block","cyto","viz2","timeseries"];
  let curloc = -1;
  let bounds_check = () => {
    curloc = (curloc < 0) ? 0 : curloc;
    curloc = (curloc >= actions.length) ? actions.length-1 : curloc;
    console.log(curloc);
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
      }
    } catch(exp) {
      console.log(exp);
    }
  });
});
