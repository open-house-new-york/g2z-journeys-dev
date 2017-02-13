var containerEl,
    visEl,
    visContainerEl,
    panelsContainerEl,
    panelsWrapperEl,
    panelsGroupEl,
    imagePanelsEl,
    textPanelsEl,
    panelsEl;
var totalWidth;

var panelWidths = [];
var panelImageWidths = [];

var mapEl = {};

$(document).ready(function() {
  var throttleSpeed = 50;

  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var panelHeightPercent = 0.9;
  // var topVisPadding = (1 - panelHeightPercent - 0.05) * 100 + '\%';
  var topVisPadding = 100;
  var panelWidthPercent = 0.9;
  // var panelHeight = viewportHeight * panelHeightPercent;
  var panelHeight = viewportHeight - topVisPadding - 50;
  var textPanelWidth = viewportWidth * panelWidthPercent > 400 ? 400 : viewportWidth * panelWidthPercent;
  console.log(viewportHeight, viewportWidth);
  var panelWrapperMargin = 40;

  containerEl = $('.container');
  visEl = $('#vis');
  visContainerEl = $('.vis-container');
  panelsContainerEl = $('.panels-container');
  panelsWrapperEl = $('.panels-wrapper');
  panelsGroupEl = $('.panels-group', visEl);
  panelsEl = $('.panel', panelsGroupEl);
  imagePanelsEl = $('.panel-image', panelsGroupEl);
  textPanelsEl = $('.panel-text', panelsGroupEl);

  containerEl.css({
    height: viewportHeight
  });

  visEl.css({
    height: panelHeight,
    'padding-top': topVisPadding
  });

  Ps.initialize(document.getElementById('vis'));

  // visContainerEl.css({
  //   height: panelHeight
  // });
  //
  // panelsContainerEl.css({
  //   height: panelHeight
  // });

  panelsWrapperEl.css({
    height: panelHeight,
    width: viewportWidth,
    "margin-left": panelWrapperMargin
  });

  $("#footer").css({
    margin: "0 " + panelWrapperMargin + "px"
  })

  // var panelWidths = [];
  // var panelImageWidths = [];
  console.log(panelsEl)
  panelsEl.each(function (){
    var panel = $(this);
    var data = panel.data();
    var width;

    if (data.type == 'image') {
      var bgUrl = panel.css('background-image');
      bgUrl = bgUrl.split('\/');
      bgUrl = bgUrl[bgUrl.length - 1];
      bgUrl = bgUrl.substring(0, bgUrl.length - 2);

      width = panelHeight * (data.ratio);

      panelImageWidths.push(width);
    } else if (data.type == 'text') {
      width = textPanelWidth;
    }

    // keep an array of widths
    panelWidths.push(width);

    panel.css({
      height: panelHeight,
      width: width
    });

  });

  var firstPanel = $('#panel-1-1');
  var firstPanelWidth = panelWidths[0];
  var totalImagesWidthRight = viewportWidth - firstPanelWidth + panelWrapperMargin;
  firstPanel.css({
    "margin-left": totalImagesWidthRight
  });

  for (var i = 0; i < textPanelsEl.length; i++) {
    var textPanel = $(textPanelsEl[i]);
    var marginLeft = 0;
    for (var j = 0; j < i; j++) {
      marginLeft += $(imagePanelsEl[j]).width();
    }
    if (i > 0) {
      marginLeft += totalImagesWidthRight
    }
    textPanel.css({
      "margin-left": marginLeft
    });
  }

  var totalWidth = panelWidths.reduce(function(a, b) {
    return a + b;
  });
  var totalImagesWidth = panelImageWidths.reduce(function(a, b) {
    return a + b;
  });
  // var marginPercentage = 0.1;
  // var finalWidth = totalImagesWidth + (viewportHeight * marginPercentage);
  var finalWidth = totalImagesWidth + panelWrapperMargin;
  finalWidth += totalImagesWidthRight;
  panelsGroupEl.css({
    height: panelHeight,
    width: finalWidth
  });

  // $('#panel-1-2b').css({
  //   position: 'absolute',
  //   'mix-blend-mode': 'multiply',
  //   'z-index': 2
  // });
  //
  // $('#panel-1-3b').css({
  //   opacity: 0
  // });

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
      // $('#panel-1-3b').css({
      //   opacity: opacity
      // });
      // $('#panel-1-2b').css({
      //   opacity: 1 - opacity
      // });
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

   initMap();

});

function initMap() {
  //Width and height
  // var width = 500;
  // var height = 500;
  var width = $('#map').width() * 0.99;
  var height = $('#map').height() * 0.99;
  $('#map').css({ background: '#efefef' });

  //Define map projection
  var projection = d3.geo.mercator()
    .center([-76.94, 40.70])
    .scale(2000)
    .translate([(width) / 2, (height) / 2]);

  //Define path generator
  var path = d3.geo.path()
    .projection(projection);

  //Create SVG element
  var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var usStates = svg.append("g").attr("class", "usStates")

  var linePaths = svg.append("g").attr("class", "lineConnect")

  //Load in GeoJSON data
  d3.json("data/dest_lines.geojson", function(json) {
    d3.json("data/us_states.geojson", function(states) {
    console.log(json)

   usStates.selectAll(".usStates")
      .data(states.features)
      .enter()
      .append("path")
      .attr({
        'd': path
      })
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .style("fill", "#fff")

    linePaths.selectAll(".lineConnect")
      .data(json.features)
      .enter()
      .append("path")
      .attr({
        'd': path,
        'stroke-dasharray': '0 5000'
      })
      .style("stroke", "steelblue")
      .attr("stroke-width", function(d) {
        if (d.properties.sent_fac_t === 'Landfill') {
          return 1
        } else {
          return 0
        }
      })
      .style("fill", "none")
      .attr("stroke-dasharray", function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength())
      })
      .attr("stroke-dashoffset", function(d) {
        return -this.getTotalLength()
      })
      .attr("class", "lineConnect")
      // .on("mouseover", function(d) {
      //   div.transition()
      //     .duration(200)
      //     .style("opacity", .9);
      //   div.text(d.properties.sent_fac)
      //     .style("left", (d3.event.pageX) + "px")
      //     .style("top", (d3.event.pageY - 28) + "px");
      // })
      //
      // // fade out tooltip on mouse out
      // .on("mouseout", function(d) {
      //   div.transition()
      //     .duration(500)
      //     .style("opacity", 0);
      // })
      .transition()
        .duration(3000)
        .attr('stroke-dashoffset', 0)

  });
  });

 mapEl.transitionLines = function() {
    linePaths.selectAll(".lineConnect")
      .each(function(d, i) {
        d3.select(this)
          .attr("stroke-dasharray", function(d) {
            return (this.getTotalLength() + ' ' + this.getTotalLength())
          })
          .attr("stroke-dashoffset", function(d) {
            return -this.getTotalLength()
          })
          .attr("class", "lineConnect")
          .transition()
          .duration(3000)
          .attr('stroke-dashoffset', 0)
        // .each("end", function() {
        //   transitionLines();// infinite loop
        // });
      })
  }
}
