
let scroll_listener = (button,target) => {
  $("#" + button).on('click', () => {
    $("body").animate({
      scrollTop: $("#" + target).offset().top
    });
  });
};

// main page behavior
$(() => {
  scroll_listener("to-cyto","cyto");
  scroll_listener("after-cyto","viz2");
  scroll_listener("to-timeseries","timeseries");
});
