$(document).ready(function() {
  var active = false;
  $('#journeys-button').click(function() {
    var link = $(this);
    var body = $("body");
    var viewportHeight = document.documentElement.clientHeight;
    var footer = $("#footer");
    var footerMenu = $("#footer-menu");
    if (!active) {
      body.css({ overflow: "hidden" });
      footer.animate({height: viewportHeight - 60}, 500, function() {
        // Animation complete.
        footerMenu.show();
      });
      active = true;
    } else {
      body.css({ overflow: "auto" });
      footer.animate({height: 70}, 500);
      footerMenu.hide();
      active = false;
    }
    });
});
