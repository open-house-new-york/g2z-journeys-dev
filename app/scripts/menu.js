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

  $('.btn-read-more').click(function() {
    $('.read-more-text').show();
    $('.cell-read-more').remove();
    $('.btn-explore').parent().css({'padding-left': 0});
  });

  $('#menu-about-journeys').parent().remove();

  var menuVisible = false;
  $('#menu-link, .btn-explore').click(function() {
    $('#menu-cover').fadeTo(500, 1);
    $('#menu-icon').removeClass('fa-bars').addClass('fa-times');
    menuVisible = true;
  });
  $('#menu-icon').click(function() {
    if (!menuVisible) {
      openMenu();
    } else {
      closeMenu();
    }
  });
  function openMenu() {
    $('#menu-icon').removeClass('fa-bars').addClass('fa-times');
    $('#menu-cover').fadeTo(500, 1);
    menuVisible = true;
  }
  function closeMenu() {
    $('#menu-icon').removeClass('fa-times').addClass('fa-bars');
    $('#menu-cover').fadeTo(500, 0, function () {
      $('#menu-cover').css({
        display: 'none'
      });
    });
    menuVisible = false;
  }
  //
  // $('#journeys-button').click(function() {
  //   var link = $(this);
  //   var body = $('body');
  //   var footer = $('#footer');
  //   var footerMenu = $('#footer-menu');
  //   var caret = $('#journeys-caret');
  //   if (!active) {
  //     body.css({ overflow: 'hidden' });
  //     footer.animate({height: document.documentElement.clientHeight - mastheadHeight}, 500, function() {
  //       // Animation complete.
  //       footerMenu.show();
  //       caret.removeClass('fa-caret-up');
  //       caret.addClass('fa-caret-down');
  //     });
  //     active = true;
  //   } else {
  //     body.css({ overflow: 'auto' });
  //     footer.animate({height: footerHeight}, 500, function () {
  //       caret.removeClass('fa-caret-down');
  //       caret.addClass('fa-caret-up');
  //     });
  //     footerMenu.hide();
  //     active = false;
  //   }
  //   });
});
