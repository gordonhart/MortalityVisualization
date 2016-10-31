
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
  scroll_listener("to-cyto","cyto");
  // scroll_listener("after-cyto","viz2");
  scroll_listener("to-timeseries","timeseries");

  // scroll through j/k keypress
  let locs = ["header-block","cyto","viz2","timeseries"];
  let curloc = -1;
  $("html").on("keypress", (e) => {
    try {
      if(e.keyCode===106) { // j, move down
          curloc++;
      } else if(e.keyCode===107) { // k, move up
          curloc--;
      } // bounds check
      curloc = (curloc < 0) ? 0 : curloc;
      curloc = (curloc >= locs.length) ? locs.length-1 : curloc;
      scroll_to(locs[curloc]);
    } catch(exp) {
      console.log(exp);
    }
  });
});
