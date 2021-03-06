// $.getJSON( "scripts/sizes.json", function( data ) {
// visImageSizes = data;
function calculateViewportDimensions() {
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var horizontalViewport = viewportWidth >= viewportHeight ? true : false;
  var isMobile = viewportWidth < 768 && horizontalViewport || viewportHeight < 768 && !horizontalViewport ? true : false;
  if (isMobile !== journeyConfigs.isMobile && journeyConfigs.isMobile !== undefined) {
    // status has changed
    location.reload();
  }
  journeyConfigs.isMobile = isMobile;
  console.log('vh:' + viewportHeight, 'vw:' + viewportWidth, 'mobile:' + isMobile, 'horizontal:' + horizontalViewport);
  if (horizontalViewport && isMobile) {
    $('#change-orientation').show();
    $('.menu-icon-container').hide();
  } else {
    initVis(viewportWidth, viewportHeight, horizontalViewport, isMobile);
  }
}

$(document).ready(function() {
 calculateViewportDimensions();
});
// });

// recalculate on window resize
$(window).on('resize', _.debounce(function() {
  $('#change-orientation').hide();
  $('.menu-icon-container').show();
  $('.ps-scrollbar-x-rail, .ps-scrollbar-y-rail').remove();
  calculateViewportDimensions();
}, 500));

  function initVis(viewportWidth, viewportHeight, horizontalViewport, isMobile) {
      var panelWidths = [],
          panelIds = [],
          panelPositions = [],
          panelImageWidths = [],
          panelTextBlockWidths = [];

      var panelWidthPercent,
          panelHeightPercent,
          panelWrapperMargin,
          topVisPadding,
          footerPadding,
          textBlockPadding,
          mapSidePadding,
          maximumTextPanelWidth,
          panelHeight,
          textPanelWidth;

      panelWidthPercent = 0.9;
      panelHeightPercent = 0.7;
      panelWrapperMargin = 40;

      if (isMobile && horizontalViewport) {
        topVisPadding = 10;
        footerPadding = 0;
        $('.masthead').hide();
        $('#footer').hide();
      } else {
        $('.masthead').show();
        footerPadding = 50;
        if (isMobile) {
          topVisPadding = 60;
        } else {
          topVisPadding = 100;
        }
      }
      if (viewportHeight <= 480) {
          topVisPadding = 40;
          panelWidthPercent = 0.7;
      }
      textBlockPadding = 25;
      mapSidePadding = 100;
      maximumTextPanelWidth = 400;
      panelHeight = viewportHeight - topVisPadding - 20;
      var firstPanelMargin;

      if (horizontalViewport) {
        textPanelWidth = viewportHeight * panelHeightPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportHeight * panelHeightPercent;
      } else {
        textPanelWidth = viewportWidth * panelWidthPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportWidth * panelWidthPercent;
      }

      // get image size depending on viewport size
      // var imageNearestSize = Math.ceil(panelHeight / 100);
      // imageNearestSize *= 100;
      // if (imageNearestSize > 700) {
      //   // max size
      //   imageNearestSize = 800;
      // } else if (imageNearestSize < 500) {
      //   // min size
      //   imageNearestSize = 500;
      // }

      var imageNearestSize = isMobile ? 600 : 800;

      // // FIXME:
      // if (journeyConfigs.meta.slug === 'cnd') {
      //   imageNearestSize = 800;
      // }
      var containerEl = $('.container');
      var visEl = $('#vis');
      var panelsWrapperEl = $('.panels-wrapper');
      var panelsGroupEl = $('.panels-group', visEl);

      // delete panels according to screen size
      if (viewportHeight < 670) {
        $('.not-mobile', panelsGroupEl).remove();
      } else {
        $('.mobile', panelsGroupEl).remove();
      }

      var panelsEl = $('.panel', panelsGroupEl);
      var imagePanelsEl = $('.panel-image', panelsGroupEl);
      var textPanelsEl = $('.panel-text', panelsGroupEl);

      containerEl.css({
        height: viewportHeight
      });

      visEl.css({
        height: viewportHeight - topVisPadding,
        'padding-top': topVisPadding
      });

      // initialize perfect-scrollbar (hidden)
      Ps.initialize(document.getElementById('vis'), {
          handlers: ['click-rail', 'drag-scrollbar', 'keyboard', 'wheel', 'touch'],
          suppressScrollY: true,
          minScrollbarLength: 50
      });

      var endedOnce = false;
      document.addEventListener('ps-x-reach-end', function () {
        if (endedOnce && endedOnce !== 'done') {
          $('#menu-link').fadeTo('slow', 1);
          endedOnce = 'done';
        }
        if (endedOnce !== 'done') {
          endedOnce = true;
        }
      });

      panelsWrapperEl.css({
        height: panelHeight,
        width: viewportWidth,
        'margin-left': panelWrapperMargin
      });

      $('#footer').css({
        margin: '0 ' + panelWrapperMargin + 'px'
      });

      // preload images that are hidden for transition
      var preloadImagesEl = $('.image-transition');
      preloadImagesEl.each(function () {
        var image = $(this);
        var imagelId = image.attr('id');
        var imageNum = extractPanelId(imagelId);
        var data = image.data();
        var loadUrl = 'images/' + journeyConfigs.meta.slug + '/'  + imageNearestSize + '_' + image.data().transitionurl;
        var bgLoadUrl = 'url(' + loadUrl + ')';
        $('#transition-' +  imageNum).css({
            'background-image': bgLoadUrl
        });
        var imagesArray = [data.imageurl, data. transitionurl];
        var counter = 0;
        var running = false;
        if (!data.loop) {
          image.click(function () {
            if (!running) {
              running = true;
              var imageIndex = counter % 2;
              image.css({
                  'background-image': 'url(' + 'images/' + journeyConfigs.meta.slug + '/'  + imageNearestSize + '_' + imagesArray[imageIndex] + ')'
              });
              counter++;
              setTimeout(function () {
                running = false;
              }, 1500);
            }
          });
        }
      });

      // set the widths of panels and push their widths, ids, and positions to arrays
      panelsEl.each(function(panelIndex) {
        var panel = $(this);
        var data = panel.data();
        var panelId = panel.attr('id');
        var panelNum = extractPanelId(panelId);
        var width;

        if (data.type == 'image') {
          // set image size based on screen size
          var bgUrl = data.imageurl;
          var nearestImage = imageNearestSize + '_' + bgUrl;
          var nearestBgImage = 'url(\'images/' + journeyConfigs.meta.slug + '/' + nearestImage + '\')';
          panel.css({
            'background-image': nearestBgImage
          });

          for (var i = 0; i < visImageSizes.length; i++) {
            if (nearestImage === visImageSizes[i].filename) {
              // calculate panel size based on image file ratio
              var ratio = visImageSizes[i].width / visImageSizes[i].height;
              width = panelHeight * ratio;
              break;
            }
          }
          panelImageWidths.push(width);
        } else if (data.type == 'map') {
          var widthFactor = isMobile ? 1.1 : 1.3;
          width = viewportHeight * widthFactor;
          width += mapSidePadding;
          panelImageWidths.push(width);
        } else if (data.type == 'text-overlay') {
          width = textPanelWidth;
        } else if (data.type == 'text-block') {
          width = textPanelWidth + textBlockPadding;
          panelTextBlockWidths.push(width);
        } else if (data.type == 'video') {
          width = viewportWidth > 800 ? 800 * 0.9 : viewportWidth * 0.9;
        }

        // set margin for first panel
        if (panelId === journeyConfigs.firstPanelId) {
          var firstPanelWidth = width;
          firstPanelMargin = viewportWidth - firstPanelWidth;
          panel.css({
            'margin-left': firstPanelMargin
          });
        }

        // keep an array of widths
        if (data.type !== 'text-overlay') {
          var initialPosition = panelWrapperMargin + firstPanelMargin;
          if (panelWidths.length === 0) {
            panelPositions.push(Math.round(initialPosition));
          }
          panelWidths.push(width);
          panelIds.push(panelId);
          var position = panelWidths.reduce(function(a, b) {
            return a + b;
          });
          position += initialPosition;
          position = Math.round(position);
          panelPositions.push(position);
        }

        // set panel css
        if (data.type === 'text-block') {
          panel.css({
            height: panelHeight,
            width: width - textBlockPadding,
            'padding-left': textBlockPadding
          });
        } else if (data.type === 'map') {
          panel.css({
            height: panelHeight,
            width: width - mapSidePadding,
            'padding-right': mapSidePadding
          });
        } else if (data.type === 'video') {
          var videoPoster = 'url(\'videos/' + journeyConfigs.meta.slug + '/' + data.imageurl + '\')';
          var videoRatio = 240/320;
          var posterContainerHeight = width * videoRatio;
          var posterContainerMargin = (panelHeight - posterContainerHeight)/2;
          panel.css({
            height: posterContainerHeight,
            width: width,
            'margin-top': posterContainerMargin,
            'background-image': videoPoster
          });
          var videoFrame = $('#video-' + panelNum);
          if (horizontalViewport) {
            var videoFrameHeight = viewportHeight * 0.9;
            var videoFrameWidth = videoFrameHeight / videoRatio;
            $('.video-container').css({ width: videoFrameWidth });
            videoFrame.css({
              height: videoFrameHeight
            });
          } else {
              var videoFrameWidth = isMobile ? viewportWidth * 0.9 : viewportWidth;
              $('.video-container').css({ width: videoFrameWidth });
              videoFrame.css({
                width: videoFrameWidth
              });
          }

          var videoData = videoFrame.data();
          var videoSize;
          if (isMobile) {
            videoSize = 'sm';
          } else {
            videoSize = 'lg';
          }
          var videoUrl = 'videos/' + journeyConfigs.meta.slug + '/' + videoData.src + '-' + videoSize + '.' + videoData.format;
          videoFrame.attr('src', videoUrl);
          panel.click(function() {
            $('#video-cover-' + panelNum).show();
            document.getElementById('video-' + panelNum).play();
          });
        } else {
          panel.css({
            height: panelHeight,
            width: width
          });
        }
      });

      // set overlaid text position via margin left based on id
      for (var i = 0; i < textPanelsEl.length; i++) {
        var textPanel = $(textPanelsEl[i]);
        var textPanelId = textPanel.attr('id');
        var textPanelNum = extractPanelId(textPanelId)
        if (textPanel.data().type == 'text-overlay') {
          var marginLeft = panelPositionByNum(textPanelNum) - panelWrapperMargin;
          if (i === 0) {
            marginLeft -= firstPanelMargin;
          }
          textPanel.css({
            'margin-left': marginLeft
          });
        }
      }

      // calculate and apply total width of vis
      var totalPanelsWidth = panelWidths.reduce(function(a, b) {
        return a + b;
      });
      var visWidth = totalPanelsWidth + panelWrapperMargin + firstPanelMargin;
      panelsGroupEl.css({
        height: panelHeight,
        width: visWidth
      });

      // calculate positions and triggers for maps
      var mapsArray = [];
      for (var map in journeyConfigs.mapEl) {
        if (journeyConfigs.mapEl.hasOwnProperty(map)) {
          var thisMap = journeyConfigs.mapEl[map];
          var position = panelPositionByNum(thisMap.id);
          thisMap.position = position;
          thisMap.animationTrigger = isMobile ? position : position - (viewportWidth / 2);
          thisMap.played = false;
          mapsArray.push(thisMap);
        }
      }

      function calculatePreloadImagesPosition() {
        var positions = [];
        for (var i = 0; i < preloadImagesEl.length; i++) {
          var panel = preloadImagesEl[i];
          var data = $(panel).data();
          var position = panelPositionByNum(data.transitionnum);
          panel.triggerPosition = position;
          panel.played = false;
        }
      }
      calculatePreloadImagesPosition();

      // trigger events based on scrolling
      var footerVisible = false;
      var menuVisible = false;
      var actionVisible = false;
      var visLimit = Math.floor(visWidth - viewportWidth + panelWrapperMargin);
      var currentScroll = 0;
      function progressBar(maps, steps) {
        var documentScrollLeft = $('#vis').scrollLeft();
        if (currentScroll != documentScrollLeft) {
          currentScroll = documentScrollLeft;

          // set footer dots
          var setDotsColor = function(dotId, panelPos) {
            if (currentScroll >= panelPos) {
              $(dotId).css({
                background: '#333'
              });
            } else {
              $(dotId).css({
                background: '#9d9d9d'
              });
            }
          };

          // set footer lines
          var setLinesOpacity = function(initialPosition, finalPosition) {
            function mapRange(value, low1, high1, low2, high2) {
              return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
            }
            var mappedOpacity = mapRange(currentScroll, initialPosition, finalPosition, 0, 1);
            var opacity = mappedOpacity > 1 ? 1 : mappedOpacity;
            var opacityPct = Math.round(opacity * 100);
            var linearGradient = 'linear-gradient(90deg, #333 0%, #333 ' + opacityPct + '%, #9d9d9d ' + opacityPct + '%)';
            return linearGradient;
          };

          // trigger map animations
          for (var i = 0; i < maps.length; i++) {
            if (currentScroll >= maps[i].animationTrigger && !maps[i].played) {
              maps[i].startAnimation();
              maps[i].played = true;
            }
          }


          // transition images
          for (var i = 0; i < preloadImagesEl.length; i++) {
            if (currentScroll >= preloadImagesEl[i].triggerPosition && !preloadImagesEl[i].played) {
              var panel = $(preloadImagesEl[i]);
              var initalImage = panel.data().imageurl;
              var newImage = panel.data().transitionurl;
              if (panel.data().loop === true) {
                transitionImage(initalImage, newImage, panel, 2500);
                preloadImagesEl[i].played = true;
              } else {
                panel.css({
                  'background-image': 'url(images/' + journeyConfigs.meta.slug + '/' + imageNearestSize + '_' + newImage + ')'
                });
              }
            }
          }

        }
      }
      var progressBarThrottle = _.throttle(function () {
          progressBar(mapsArray);
      }, 200);
      $('#vis').scroll(progressBarThrottle);

      // helper
      // use mousewheel to scroll horizontally
      $('body').mousewheel(function(event) {
        var currentScroll = $('#vis').scrollLeft();
        $('#vis').scrollLeft(currentScroll - (event.deltaY * event.deltaFactor));
        event.preventDefault(); //prevents horizontal scroll on trackpad
      });

      // transition images back and forth
      function transitionImage(oldImage, newImage, panel, duration) {
        begin();

        function begin() {
          panel.css({
            'background-image': 'url(images/' + journeyConfigs.meta.slug + '/' + imageNearestSize + '_' + newImage + ')'
          });
          setTimeout(repeat, duration);
        }
        function repeat() {
          panel.css({
            'background-image': 'url(images/' + journeyConfigs.meta.slug + '/' + imageNearestSize + '_' + oldImage + ')'
          });
          setTimeout(begin, duration);
        }
      }

      // helper
      // use keyboard to scroll horizontally and close menu
      document.onkeydown = function(event) {
        if (!event)
          event = window.event;
        var code = event.keyCode;
        if (event.charCode && code === 0)
          code = event.charCode;
        var scrollFactor = viewportWidth * 0.1;
        var currentScroll = $('#vis').scrollLeft();
        switch (code) {
          case 37: // left arrow
            $('#vis').scrollLeft(currentScroll - scrollFactor);
            break;
          case 38: // up arrow
            $('#vis').scrollLeft(currentScroll - scrollFactor);
            break;
          case 39: // right arrow
            $('#vis').scrollLeft(currentScroll + scrollFactor);
            break;
          case 40: // down arrow
            $('#vis').scrollLeft(currentScroll + scrollFactor);
            break;
          case 33: // page up
            $('#vis').scrollLeft(currentScroll - scrollFactor * 2);
            break;
          case 34: // page down
            $('#vis').scrollLeft(currentScroll + scrollFactor * 2);
            break;
          case 32: // spacebar
            $('#vis').scrollLeft(currentScroll + scrollFactor * 2);
            break;
          case 27: // esc
            if (menuVisible) {
              closeMenu();
            }
            break;
          default:
            return;
        }
        event.preventDefault();
      };

      // helper
      // follow links in progress bar
      $('.steps-link').click(function() {
        var link = $(this);
        var numToScroll = link.data().scroll;
        scrollToPanel(numToScroll);
      });

      $('#menu-link').click(function() {
        $('#menu-cover').fadeTo(500, 1);
        $('#menu-icon').removeClass('fa-bars').addClass('fa-times');
        menuVisible = true;
      });

      $('#menu-link-from-action').click(function() {
        $('#action-cover').fadeTo(500, 0, function () {
          $('#action-cover').css({
            display: 'none'
          });
        });
        $('#menu-cover').fadeTo(500, 1);
        actionVisible = false;
        menuVisible = true;
      });

      $('#action-link').click(function() {
        $('#action-cover').fadeTo(500, 1);
        $('#menu-icon').removeClass('fa-bars').addClass('fa-times');
        actionVisible = true;
      });

      $('#menu-icon').click(function() {
        if (menuVisible) {
          closeMenu();
        } else if (actionVisible) {
          closeAction();
        } else {
          openMenu();
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

      function closeAction() {
        $('#menu-icon').removeClass('fa-times').addClass('fa-bars');
        $('#action-cover').fadeTo(500, 0, function () {
          $('#action-cover').css({
            display: 'none'
          });
        });
        actionVisible = false;
      }

      var menuLinksEl = $('#menu > a');
      for (var i = 0; i < menuLinksEl.length; i++) {
        var el = $(menuLinksEl[i]);
        var id = el.attr('id');
        if (id === 'menu-' + journeyConfigs.meta.slug) {
          // this journey
          el.attr('href', '#');
          el.addClass('disabled');
          el.find('div > h3').addClass('highlight');
        }
      }

      // helper
      // follow back in menu
      $('#menu-back').click(function() {
        $('#menu-cover').fadeTo(500, 0, function () {
          $(this).css({
            display: 'none'
          });
        });
        $('#menu-icon').removeClass('fa-times').addClass('fa-bars');
        menuVisible = false;
      });

      // helper
      // fade vis in
      $('#vis').fadeTo('slow', 1, function() {
        // Animation complete.
        var beginEl = isMobile ? ($('#begin-mobile')) : $('#begin');
        setTimeout(function() {
          beginEl.css({
            display: 'block'
          });
        }, 1500);
      });

      // close modal on click outside of video frame
      $('.video-wrapper').click(function(e) {
        if (e.target === this) {
          $(this).parent().parent().hide();
        }
      });
      $('.modal-cover').click(function(e) {
        if (e.target === this) {
          $(this).hide();
        }
      });

      // helper
      function scrollToPanel(elementId) {
        var elementPosition = panelPositionByNum(elementId);
        elementPosition -= panelWrapperMargin;
        $('#vis').stop().animate({
          scrollLeft: elementPosition
        }, {
          duration: 1000,
          easing: 'swing'
        });
      }

      // helper
      function panelPositionByNum(panelId) {
        var f;
        var found = panelIds.some(function(item, index) {
          f = index;
          var id = extractPanelId(item);
          return id == panelId;
        });
        if (!found) {
            return false;
        }
        return panelPositions[f];
      }

      function extractPanelId(idString) {
        var idArray = idString.split('-');
        return idArray[1] + '-' + idArray[2];
      }

      // FIXME:
      initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth);

      if ($('#vis').scrollLeft() >= totalPanelsWidth - viewportWidth) {
        // if on last screen move one screen over resizing
        var currentScroll = $('#vis').scrollLeft();
        var delta = currentScroll + viewportWidth - totalPanelsWidth;
        $('#vis').scrollLeft(currentScroll - delta);
      }
}
