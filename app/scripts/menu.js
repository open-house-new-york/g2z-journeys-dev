$(document).ready(function() {
  $('#read-more').click(function() {
    var link = $(this);
    var moreText = $("#more-info");
    var journeysButton = $("#journeys-button");
    moreText.show();
    link.hide();
    journeysButton.css({
      width: "100%"
    });
  });
});
