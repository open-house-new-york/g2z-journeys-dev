$(document).ready(function() {
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var horizontalViewport = viewportWidth >= viewportHeight ? true : false;
  var isMobile = viewportWidth < 768 && horizontalViewport || viewportHeight < 768 && !horizontalViewport ? true : false;
  var footerHeight = isMobile ? 50 : 70;
  var active = false;
  var footerInitialHeight = $('#footer').outerHeight();
  var mastheadHeight = $('.masthead').outerHeight();
  $('#journeys-button').click(function() {
    var link = $(this);
    var body = $('body');
    var viewportHeight = document.documentElement.clientHeight;
    var footer = $('#footer');
    var footerMenu = $('#footer-menu');
    var caret = $('#journeys-caret');
    if (!active) {
      body.css({ overflow: 'hidden' });
      footer.animate({height: viewportHeight - mastheadHeight}, 500, function() {
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
