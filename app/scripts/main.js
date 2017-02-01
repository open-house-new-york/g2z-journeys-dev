var containerEl,
    visEl,
    visContainerEl,
    panelsContainerEl,
    panelsWrapperEl,
    panelsGroupEl,
    panelsEl;
var totalWidth;

$(document).ready(function() {
  var throttleSpeed = 50;

  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var panelHeightPercent = 0.9;
  var topVisPadding = (1 - panelHeightPercent - 0.05) * 100 + '\%';
  var panelWidthPercent = 0.9;
  var panelHeight = viewportHeight * panelHeightPercent;
  var textPanelWidth = viewportWidth * panelWidthPercent > 400 ? 400 : viewportWidth * panelWidthPercent;
  console.log(viewportHeight, viewportWidth);

  containerEl = $('.container');
  visEl = $('#vis');
  visContainerEl = $('.vis-container');
  panelsContainerEl = $('.panels-container');
  panelsWrapperEl = $('.panels-wrapper');
  panelsGroupEl = $('.panels-group', visEl);
  panelsEl = $('.panel', panelsGroupEl);

  containerEl.css({
    height: viewportHeight
  });

  visEl.css({
    height: panelHeight,
    'padding-top': topVisPadding
  });

  // visContainerEl.css({
  //   height: panelHeight
  // });
  //
  // panelsContainerEl.css({
  //   height: panelHeight
  // });

  panelsWrapperEl.css({
    height: panelHeight,
    width: viewportWidth
  });

  panelsEl.each(function(){
    var panel = $(this);
    var data = panel.data();
    var width;

    if (data.type == 'image') {
      width = panelHeight * (data.ratio);
    } else if (data.type == 'text') {
      width = textPanelWidth;
    }
    panel.css({
      height: panelHeight,
      width: width
    });
  });

  panelsGroupEl.css({
    height: panelHeight,
    width: '5000px'
  });

  $('#panel-1-2b').css({
    position: 'absolute',
    'mix-blend-mode': 'multiply',
    'z-index': 2
  });

  $('#panel-1-3b').css({
    opacity: 0
  });

  function mapRange(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  function followScroll() {
    var documentScrollLeft = $('#vis').scrollLeft();
    if (lastScrollLeft != documentScrollLeft) {
      lastScrollLeft = documentScrollLeft;
      var mappedScrollOpacity = mapRange(lastScrollLeft, 0, viewportWidth / 2, 0, 1);
      var opacity;
      if (mappedScrollOpacity > 1) {
        opacity = 1;
      } else {
        opacity = mappedScrollOpacity;
      }
      $('#panel-1-3b').css({
        opacity: opacity
      });
      $('#panel-1-2b').css({
        opacity: 1 - opacity
      });
      var opacityPct = Math.round(opacity * 100);
      var linearGradient = 'linear-gradient(90deg, #333 0%, #333 ' + opacityPct + '%, #9d9d9d ' + opacityPct + '%)';
      $('#step-line-1').css({
        background: linearGradient
      });
    }
  }
  var followScrollThrottle = _.throttle(followScroll, throttleSpeed);

  var lastScrollLeft = 0;
  $('#vis').scroll(followScrollThrottle);

   $('body').mousewheel(function(event) {
      var currentScroll = $('#vis').scrollLeft();
      $('#vis').scrollLeft(currentScroll - (event.deltaY * event.deltaFactor));
      event.preventDefault(); //prevents horizontal scroll on trackpad
   });

});
