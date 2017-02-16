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
var panelIds = [];
var panelPositions= [];
var panelImageWidths = [];
var panelTextBlockWidths = [];

var mapEl = {};

var topVisPadding,
  viewportHeight,
  viewportWidth,
  isMobile;

var vizImageSizes;

var panelWrapperMargin,
    totalImagesWidthRight;

// $.getJSON( "scripts/sizes.json", function( data ) {
// vizImageSizes = data;
initViz();
// });

function initViz() {
  $(document).ready(function() {
    var throttleSpeed = 50;

    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;
    isMobile = viewportWidth < 768 ? true : false;
    var panelHeightPercent = 0.9;
    // var topVisPadding = (1 - panelHeightPercent - 0.05) * 100 + '\%';
    // var topVisPadding = viewportWidth > 738 ? 100 : 50;
    topVisPadding = viewportWidth > 738 ? 100 : 100
    var panelWidthPercent = 0.9;
    // var panelHeight = viewportHeight * panelHeightPercent;
    var panelHeight = viewportHeight - topVisPadding - 50;
    var textPanelWidth = viewportWidth * panelWidthPercent > 400 ? 400 : viewportWidth * panelWidthPercent;
    console.log(viewportHeight, viewportWidth);
    panelWrapperMargin = 40;

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
      height: viewportHeight - topVisPadding,
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
    // console.log(panelsEl)
    var firstPanelWidth;

    panelsEl.each(function() {
      var panel = $(this);
      var data = panel.data();
      var panelId = panel.attr("id");
      var width;

      if (data.type == 'image') {
        var bgUrl = panel.css('background-image');
        bgUrl = bgUrl.split('\/');
        bgUrl = bgUrl[bgUrl.length - 1];
        bgUrl = bgUrl.replace(/[\)\"\']/g, '');

        for (var i = 0; i < vizImageSizes.length; i++) {
          if (bgUrl === vizImageSizes[i].filename) {
            var ratio = vizImageSizes[i].width / vizImageSizes[i].height;
            width = panelHeight * ratio;
            // break;
          }
        }
        panelImageWidths.push(width);
      } else if (data.type == 'map') {
        var widthFactor = isMobile ? 1.1 : 1.3;
        width = viewportHeight * widthFactor;
        panelImageWidths.push(width);
      } else if (data.type == 'text-overlay') {
        width = textPanelWidth;
      } else if (data.type == 'text-block') {
        width = textPanelWidth;
        panelTextBlockWidths.push(width);
      }

      if (panelId == 'text-1-1') {
        firstPanelWidth = width;
        totalImagesWidthRight = viewportWidth - firstPanelWidth + panelWrapperMargin;
      }
      // keep an array of widths
      if (data.type !== 'text-overlay') {
        var initialPosition = panelWrapperMargin + totalImagesWidthRight;
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


      if (data.type == 'map') {
        panel.css({
          height: panelHeight,
          width: width
        });
      } else {
        panel.css({
          height: panelHeight,
          width: width
        });
      }

    });

    var firstPanel = $('#panel-1-1');
    firstPanel.css({
      "margin-left": totalImagesWidthRight
    });

    // set overlaid text position based on order
    // for (var i = 0; i < textPanelsEl.length; i++) {
    //   var textPanel = $(textPanelsEl[i]);
    //   if (textPanel.data().type == 'text-overlay') {
    //     var marginLeft = 0;
    //     for (var j = 0; j < i; j++) {
    //       marginLeft += $(imagePanelsEl[j]).width();
    //     }
    //     if (i > 0) {
    //       marginLeft += totalImagesWidthRight
    //     }
    //     textPanel.css({
    //       "margin-left": marginLeft
    //     });
    //   }
    // }

    // set overlaid text based on id
    for (var i = 0; i < textPanelsEl.length; i++) {
      var textPanel = $(textPanelsEl[i]);
      var textPanelId = textPanel.attr("id");
      var textPanelNum = textPanelId.substring(textPanelId.length - 3);
      if (textPanel.data().type == 'text-overlay') {
        function matchId(el) {
          return el.substring(el.length - 3) === textPanelNum;
        }
        var index = panelIds.findIndex(matchId);
        // var marginLeft = 0;
        // for (var j = 0; j < i; j++) {
        //   marginLeft += $(imagePanelsEl[j]).width();
        // }
        // if (i > 0) {
        //   marginLeft += totalImagesWidthRight
        // }
        var marginLeft = panelPositions[index] - panelWrapperMargin;
        if (i === 0) {
          marginLeft -= totalImagesWidthRight;
        }
        textPanel.css({
          "margin-left": marginLeft
        });
      }
    }

    var totalWidth = panelWidths.reduce(function(a, b) {
      return a + b;
    });
    var finalWidth = totalWidth + panelWrapperMargin;
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

        // console.log(lastScrollLeft)

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

    $(".steps-link").click(function() {
      var link = $(this)
      var numToScroll = link.data().scroll;
      console.log(numToScroll);
      scrollToPanel(numToScroll);
    });

    initMaps();

  });

  function initMaps() {

    //color configs
    mapEl.colors = {
      background: "#edf0ff",
      land: "#d9d9d9",
      wasteLines: "#ff4516",
      wasteCircles: "#ff4516"
    };
    mapEl.scales = {
      circleRadius: function (value) {
        return Math.sqrt(value / 3.14) * 0.025;
      },
      lineWidth: function (value) {
        return mapEl.scales.circleRadius(value) / 2;
      }
    }

    //Load in GeoJSON data
    d3.json("data/od_lines_refuse.geojson", function(odLines) {
      d3.json("data/dest_points_refuse.geojson", function(destPointsRefuseData) {
        d3.json("data/nycd.geojson", function(nycd) {
          d3.json("data/dest_lines.geojson", function(exportLines) {
            d3.json("data/export_points.geojson", function(exportPoints) {
              d3.json("data/us_states.geojson", function(states) {
                initNycMap(odLines, destPointsRefuseData, nycd, states);
                initExportMap(exportLines, exportPoints, states);
              });
            });
          });
        });
      });
    });

    function initExportMap(exportLines, exportPoints, states) {
      var width = $('#map-export-3-0').width() * 0.99;
      // var height = $('#map-export-3-0').height() * 0.99;
      var height = viewportHeight;

      var projection = d3.geo.mercator()
        .scale(1)
        .translate([0, 0]);
      var path = d3.geo.path()
        .projection(projection);

      // remove non landfill lines from dataset
      var i = exportLines.features.length;
      while (i--) {
        if (exportLines.features[i].properties.sent_fac_t !== 'Landfill') {
          exportLines.features.splice(i, 1);
        }
      }
      var i = exportPoints.features.length;
      while (i--) {
        if (exportPoints.features[i].geometry.coordinates === null) {
          exportPoints.features.splice(i, 1);
        }
      }

      var b = path.bounds(exportLines),
          scaleFactor = isMobile ? 0.75 : 0.95,
          s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection
        .scale(s)
        .translate(t);

      //Create SVG element
      var svg = d3.select("#map-export-3-0")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map-export-3-0-svg");

      $("#map-export-3-0-svg").css({
        position: "absolute",
        top: -topVisPadding
      });

      var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var clipBackground = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", width / 2)
        .attr("fill", mapEl.colors.background)
        .attr("stroke-width", 0)

      var clip = svg.append("clipPath")
        .attr("id", "mapClip")
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", width / 2)

      var mapGroup = svg.append("g")
        .attr("class", "mapGroup")
        .attr("clip-path", "url(#mapClip)");
      var usStates = mapGroup.append("g").attr("class", "usStates");
      var linePaths = mapGroup.append("g").attr("class", "lineConnect");
      var pointPaths = mapGroup.append("g").attr("class", "exportPoints");

      usStates.selectAll(".usStates")
        .data(states.features)
        .enter()
        .append("path")
        .attr({
          'd': path
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("fill", mapEl.colors.land)

      linePaths.selectAll(".lineConnect")
        .data(exportLines.features)
        .enter()
        .append("path")
        .attr({
          'd': path,
          'stroke-dasharray': '0 5000'
        })
        .style("stroke", mapEl.colors.wasteLines)
        .attr("stroke-width", function(d) {
          if (d.properties.sent_fac_t === 'Landfill') {
            return mapEl.scales.lineWidth(d.properties.sent_tons_);
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

      pointPaths.selectAll(".exportPoints")
        .data(exportPoints.features)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
        })
        .attr("cy", function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
        })
        .attr("r", function(d) {
          return mapEl.scales.circleRadius(d.properties.sent_tons_);
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("fill", mapEl.colors.wasteCircles)
        .attr("opacity", function(d) {
          if (d.properties.sent_fac_t === 'Landfill') {
            return 1
          } else {
            return 0
          }
        })
        .attr("class", "exportPoints")

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

    function initNycMap(odLines, destPointsRefuseData, nycd, states) {
      //Width and height
      var width = $('#map-nyc-2-0').width() * 0.99;
      // var height = $('#map-nyc-2-0').height() * 0.99;
      var height = viewportHeight;

      var projection = d3.geo.albers()
        .scale(1)
        .translate([0, 0]);
      var path = d3.geo.path()
        .projection(projection);
      var b = path.bounds(odLines),
          scaleFactor = isMobile ? 0.75 : 0.95,
          s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection
        .scale(s)
        .translate(t);

      //Create SVG element
      var svg = d3.select("#map-nyc-2-0")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map-nyc-2-0-svg");

      $("#map-nyc-2-0-svg").css({
        position: "absolute",
        top: -topVisPadding
      });

      var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var clipBackground = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", width / 2)
        .attr("fill", mapEl.colors.background)
        .attr("stroke-width", 0)

      var clip = svg.append("clipPath")
        .attr("id", "mapClip")
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", width / 2)

      var mapGroup = svg.append("g")
        .attr("class", "mapGroup")
        .attr("clip-path", "url(#mapClip)");
      var usStates = mapGroup.append("g").attr("class", "usStates");
      var commDist = mapGroup.append("g").attr("class", "commDist");
      var linePaths = mapGroup.append("g").attr("class", "lineConnect");
      var destPointsRefuse = mapGroup.append("g").attr("class", "destPointsRefuse");

      usStates.selectAll(".usStates")
        .data(states.features)
        .enter()
        .append("path")
        .attr({
          'd': path
        })
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("fill", mapEl.colors.land)
        .attr("class", "usStates")

      commDist.selectAll(".nycd")
        .data(nycd.features)
        .enter()
        .append("path")
        .attr({
          'd': path
        })
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("fill", mapEl.colors.land)
        .attr("class", "nycd");

      linePaths.selectAll(".lineConnect")
        .data(odLines.features)
        .enter()
        .append("path")
        .attr({
          'd': path
        })
        .style("stroke", mapEl.colors.wasteLines)
        .attr("stroke-width", function (d) {
          return mapEl.scales.lineWidth(d.properties.j_tot_rec);
        })
        .style("fill", "none")
        .attr("stroke-dasharray", function(d) {
          return (this.getTotalLength() + ' ' + this.getTotalLength())
        })
        .attr("stroke-dashoffset", function(d) {
          return this.getTotalLength()
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
          .attr('stroke-dashoffset', 0);

      destPointsRefuse.selectAll(".destPointsRefuse")
        .data(destPointsRefuseData.features)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
        })
        .attr("cy", function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
        })
        .attr("r", 0)
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("fill", mapEl.colors.wasteCircles)
        .attr("class", "destPointsRefuse")
        .transition()
          .duration(3000)
          .attr("r", function(d) {
            return mapEl.scales.circleRadius(d.properties.j_tot_rec);
          })

      mapEl.nyc = {};

      mapEl.nyc.linesIn = function() {
        //clear circles
        destPointsRefuse.selectAll(".destPointsRefuse")
          .each(function(d, i) {
            d3.select(this)
              .attr("r", 0);
            });

        linePaths.selectAll(".lineConnect")
          .each(function(d, i) {
            d3.select(this)
              .attr("stroke-dasharray", function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength())
              })
              .attr("stroke-dashoffset", function(d) {
                return this.getTotalLength()
              })
              .attr("class", "lineConnect")
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
            .each("end", function() {
              mapEl.nyc.transitionCircles()
            });
          });
      }

      mapEl.nyc.transitionCircles = function() {
        destPointsRefuse.selectAll(".destPointsRefuse")
          .each(function(d, i) {
            d3.select(this)
              .attr("r", 0)
          .transition()
            .duration(1500)
            .attr("r", function(d) {
              return mapEl.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each("end", function() {
              mapEl.nyc.linesOut()
            });
          });
      }

      mapEl.nyc.linesOut = function() {
        linePaths.selectAll(".lineConnect")
          .each(function(d, i) {
            d3.select(this)
              .attr("stroke-dasharray", function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength())
              })
              .attr('stroke-dashoffset', 0)
              .attr("class", "lineConnect")
              .transition()
              .duration(1500)
              .attr("stroke-dashoffset", function(d) {
                return -this.getTotalLength()
              })
            // .each("end", function() {
            //   mapEl.nyc.transitionCircles()
            // });
          });
      }
    }
  }

}

    // helpers
    function findPanelPositionById(id, idArray, widthArray) {
      function matchId(el) {
        return el === id;
      }
      var index = idArray.findIndex(matchId);
      // var widthArrayLeft = widthArray;
      // widthArrayLeft.length = index;
      console.log(index)
      var pos = widthArray.slice(0, index).reduce(function(a, b) {
        return a + b;
      });
      console.log(panelWrapperMargin, totalImagesWidthRight, viewportWidth)
      pos += panelWrapperMargin + totalImagesWidthRight - viewportWidth;
      return pos;
    }
    // example use
    // findPanelPositionById("panel-2-3", panelIds, panelWidths)

function scrollToPanel(elementId) {
  var elementPosition = panelPositionByNum(elementId);
  elementPosition -= panelWrapperMargin;
  // var scrollToPanelThrottle = _.throttle(scroll, 500);
  function scroll() {
    $('#vis').stop().animate( { scrollLeft: elementPosition }, { duration: 1000, easing: "swing"});
  }
  // scrollToPanelThrottle();
  // $.throttle(100, scroll);
  scroll();
}

function panelPositionByNum(panelId) {
    function matchId(el) {
      return el.substring(el.length - 3) === panelId;
    }
    var index = panelIds.findIndex(matchId);
    return panelPositions[index];
}
