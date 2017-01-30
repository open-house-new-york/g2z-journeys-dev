var visEl,
    visContainerEl,
    panelsContainerEl,
    panelsWrapperEl,
    panelsGroupEl,
    panelsEl;
var totalWidth;

$(document).ready(function() {
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var panelHeightPercent = 0.9;
  var topVisPadding = (1 - panelHeightPercent - 0.05) * 100 + '\%';
  var panelWidthPercent = 0.9;
  var panelHeight = viewportHeight * panelHeightPercent;
  var textPanelWidth = viewportWidth * panelWidthPercent > 400 ? 400 : viewportWidth * panelWidthPercent;
  console.log(viewportHeight, viewportWidth);

  visEl = $('#vis');
  visContainerEl = $('.vis-container');
  panelsContainerEl = $('.panels-container');
  panelsWrapperEl = $('.panels-wrapper');
  panelsGroupEl = $('.panels-group', visEl);
  panelsEl = $('.panel', panelsGroupEl);

  visEl.css({
    height: panelHeight,
    'padding-top': topVisPadding
  });

  visContainerEl.css({
    height: panelHeight
  });

  panelsContainerEl.css({
    height: panelHeight
  });

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

  var lastScrollLeft = 0;
  $(window).scroll(function() {
      var documentScrollLeft = $(document).scrollLeft();
      if (lastScrollLeft != documentScrollLeft) {
          // console.log('scroll ' + lastScrollLeft);
          lastScrollLeft = documentScrollLeft;
          // console.log(mapRange(lastScrollLeft, 0, viewportWidth / 2, 0, 1));
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
      }
  });

});
