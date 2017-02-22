var panelWidths = [],
    panelIds = [],
    panelPositions = [],
    panelImageWidths = [],
    panelTextBlockWidths = [];

var viewportWidth,
    viewportHeight,
    horizontalViewport,
    isMobile,
    panelWidthPercent,
    panelHeightPercent,
    panelWrapperMargin,
    topVisPadding,
    textBlockPadding,
    mapSidePadding,
    maximumTextPanelWidth,
    panelHeight,
    textPanelWidth;

// $.getJSON( "scripts/sizes.json", function( data ) {
// visImageSizes = data;
function calculateViewportDimensions() {
  viewportWidth = document.documentElement.clientWidth;
  viewportHeight = document.documentElement.clientHeight;
  horizontalViewport = viewportWidth >= viewportHeight ? true : false;
  isMobile = viewportWidth < 768 && horizontalViewport || viewportHeight < 768 && !horizontalViewport ? true : false;
  console.log('vh:' + viewportHeight, 'vw:' + viewportWidth, 'mobile:' + isMobile, 'horizontal:' + horizontalViewport);
  if (horizontalViewport && isMobile) {
    $("#change-orientation").show();
  } else {
    $("#change-orientation").hide();
    initVis();
  }
}

$(document).ready(function() {
 calculateViewportDimensions();
});
// });

// recalculate on window resize
$(window).on('resize', _.debounce(function() {
 calculateViewportDimensions();
}, 500));

  function initVis() {
      panelWidths = [];
      panelIds = [];
      panelPositions = [];
      panelImageWidths = [];
      panelTextBlockWidths = [];

      panelWidthPercent = 0.9;
      panelHeightPercent = 0.9;
      panelWrapperMargin = 40;
      topVisPadding = isMobile ? 60 : 100;
      textBlockPadding = 100;
      mapSidePadding = 100;
      maximumTextPanelWidth = 400;
      panelHeight = viewportHeight - topVisPadding - 50;

      if (horizontalViewport) {
        textPanelWidth = viewportHeight * panelHeightPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportHeight * panelHeightPercent;
      } else {
        textPanelWidth = viewportWidth * panelWidthPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportWidth * panelWidthPercent;
      }

      // get image size depending on viewport size
      var imageNearestSize = Math.ceil(panelHeight / 100);
      imageNearestSize *= 100;
      if (imageNearestSize > 700) {
        // max size
        imageNearestSize = 800;
      } else if (imageNearestSize < 500) {
        // min size
        imageNearestSize = 500;
      }

      var containerEl = $('.container');
      var visEl = $('#vis');
      var panelsWrapperEl = $('.panels-wrapper');
      var panelsGroupEl = $('.panels-group', visEl);
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
      Ps.initialize(document.getElementById('vis'));

      panelsWrapperEl.css({
        height: panelHeight,
        width: viewportWidth,
        'margin-left': panelWrapperMargin
      });

      $('#footer').css({
        margin: '0 ' + panelWrapperMargin + 'px'
      });

      // preload images that are hidden for transition
      var preloadImages = $('.image-preload');
      preloadImages.each(function () {
        var image = $(this);
        var data = image.data();
        var loadUrl = 'images/' + imageNearestSize + '_' + preloadImages.data().imageurl;
        image.css({
          'background-image': 'url("' + loadUrl + '")'
        });
      });

      // set the widths of panels and push their widths, ids, and positions to arrays
      panelsEl.each(function(panelIndex) {
        var panel = $(this);
        var data = panel.data();
        var panelId = panel.attr('id');
        var width;

        if (data.type == 'image') {
          // set image size based on screen size
          var bgUrl = data.imageurl;
          var nearestImage = imageNearestSize + '_' + bgUrl;
          var nearestBgImage = 'url(\'images/' + nearestImage + '\')';
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
        var textPanelNum = textPanelId.substring(textPanelId.length - 3);
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
          var position = panelPositionByNum((thisMap.id));
          thisMap.position = position;
          thisMap.animationTrigger = isMobile ? position : position - (viewportWidth / 2);
          thisMap.played = false;
          mapsArray.push(thisMap);
        }
      }

      // trigger last image animation CUSTOM
      var lastPanelPlayed = false;
      var lastPanel = $('#panel-4-6');
      var lastPanelPosition = panelPositionByNum('4-7');

      // calculate positions for vis steps change panels
      for (var i = 0; i < journeyConfigs.visSteps.length; i++) {
        journeyConfigs.visSteps[i].position = panelPositionByNum(journeyConfigs.visSteps[i].id);
      }

      // trigger events based on scrolling
      var footerVisible = false;
      var menuVisible = false;
      var visLimit = Math.floor(visWidth - viewportWidth + panelWrapperMargin);
      var currentScroll = 0;
      function progressBar(maps, steps) {
        var documentScrollLeft = $('#vis').scrollLeft();
        if (currentScroll != documentScrollLeft) {
          currentScroll = documentScrollLeft;

          // fade footer in
          if (currentScroll >= steps[0].position - panelWrapperMargin - firstPanelMargin && !footerVisible) {
            $('#footer').fadeTo('slow', 1);
          }

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
          var mapOpacity = function(initialPosition, finalPosition) {
            function mapRange(value, low1, high1, low2, high2) {
              return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
            }
            var mappedOpacity = mapRange(currentScroll, initialPosition, finalPosition, 0, 1);
            var opacity = mappedOpacity > 1 ? 1 : mappedOpacity;
            var opacityPct = Math.round(opacity * 100);
            var linearGradient = 'linear-gradient(90deg, #333 0%, #333 ' + opacityPct + '%, #9d9d9d ' + opacityPct + '%)';
            return linearGradient;
          };

          for (var i = 0; i < steps.length; i++) {
            setDotsColor('#step-dot-' + steps[i].step, steps[i].position);
            if (i > 0) {
              $('#step-line-' + i).css({
                background: mapOpacity(steps[i - 1].position, steps[i].position)
              });
            }
          }

          // trigger map animations
          for (var i = 0; i < maps.length; i++) {
            if (currentScroll >= maps[i].animationTrigger && !maps[i].played) {
              maps[i].startAnimation();
              maps[i].played = true;
            }
          }

          // trigger last image animation CUSTOM
          if (currentScroll >= lastPanelPosition - firstPanelMargin && !lastPanelPlayed) {
            lastPanel.css({
              transition: 'background 1.0s linear',
              'background-image': 'url(images/' + imageNearestSize + '_panel-4-6-diagram.jpg)'
            });
            lastPanelPlayed = true;
          }

          // FIXME: not good in terms of ux
          // show menu on end of scroll
          if (currentScroll >= visLimit && !menuVisible) {
            $('#menu').fadeTo(500, 1);
            menuVisible = true;
          } else if (currentScroll < visLimit && menuVisible) {
            $('#menu').fadeTo(500, 0, function () {
              $(this).css({
                display: 'none'
              });
            });
            menuVisible = false;
          }

        }
      }
      var progressBarThrottle = _.throttle(function () {
          progressBar(mapsArray, journeyConfigs.visSteps);
      }, 200);
      $('#vis').scroll(progressBarThrottle);

      // helper
      // use mousewheel to scroll horizontally
      $('body').mousewheel(function(event) {
        var currentScroll = $('#vis').scrollLeft();
        $('#vis').scrollLeft(currentScroll - (event.deltaY * event.deltaFactor));
        event.preventDefault(); //prevents horizontal scroll on trackpad
      });

      // helper
      // use keyboard to scroll horizontally
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
          default:
            //
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

      // helper
      // follow back in menu
      $('#menu-back').click(function() {
        $('#menu').fadeTo(500, 0, function () {
          $(this).css({
            display: 'none'
          });
        });
        menuVisible = false;
      });

      // helper
      // fade vis in
      $('#vis').fadeTo('slow', 1, function() {
        // Animation complete.
        var beginEl = Modernizr.touch ? ($('#begin-mobile')) : $('#begin');
        setTimeout(function() {
          beginEl.css({
            display: 'block'
          });
        }, 1500);
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
        var found = panelIds.some(function(item, index) { f = index; return item.substring(item.length - 3) == panelId; });
        if (!found) {
            return false;
        }
        return panelPositions[f];
      }

      // FIXME:
      initMaps();

}
