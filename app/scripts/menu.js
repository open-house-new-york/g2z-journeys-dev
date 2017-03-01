$(document).ready(function() {
  var horizontalViewport = document.documentElement.clientWidth >= document.documentElement.clientHeight ? true : false;
  var isMobile = document.documentElement.clientWidth < 768 && horizontalViewport || document.documentElement.clientHeight < 768 && !horizontalViewport ? true : false;
  var footerHeight = isMobile ? 50 : 70;
  if (document.documentElement.clientHeight <= 480) {
    footerHeight = 40;
  }
  var active = false;
  var footerInitialHeight = $('#footer').outerHeight();
  var mastheadHeight = $('.masthead').outerHeight();
  $('#journeys-button').click(function() {
    var link = $(this);
    var body = $('body');
    var footer = $('#footer');
    var footerMenu = $('#footer-menu');
    var caret = $('#journeys-caret');
    if (!active) {
      body.css({ overflow: 'hidden' });
      footer.animate({height: document.documentElement.clientHeight - mastheadHeight}, 500, function() {
        // Animation complete.
        footerMenu.show();
        caret.removeClass('fa-caret-up');
        caret.addClass('fa-caret-down');
      });
      active = true;
    } else {
      body.css({ overflow: 'auto' });
      footer.animate({height: footerHeight}, 500, function () {
        caret.removeClass('fa-caret-down');
        caret.addClass('fa-caret-up');
      });
      footerMenu.hide();
      active = false;
    }
    });
});
