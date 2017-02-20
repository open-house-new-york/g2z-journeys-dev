  var vizImageSizes;

// $.getJSON( "scripts/sizes.json", function( data ) {
// vizImageSizes = data;
initViz();
// });

// recalculate on window resize
$(window).on('resize', _.debounce(function () {
  initViz();
}, 500));

function initViz() {

  var containerEl,
      visEl,
      panelsWrapperEl,
      panelsGroupEl,
      imagePanelsEl,
      textPanelsEl,
      panelsEl;
  var totalPanelsWidth;

  var panelWidths = [];
  var panelIds = [];
  var panelPositions= [];
  var panelImageWidths = [];
  var panelTextBlockWidths = [];

  var mapEl = {
    nyc: {},
    wasteExport: {}
  };

  var topVisPadding,
    viewportHeight,
    viewportWidth,
    isMobile;

  var panelWrapperMargin,
      firstPanelMargin;

  $(document).ready(function() {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;
    console.log('vsz', viewportHeight, viewportWidth);

    isMobile = viewportWidth < 768 ? true : false;
    var panelWidthPercent = 0.9;
    var panelHeightPercent = 0.9;
    topVisPadding = isMobile ? 60 : 100;
    var panelHeight = viewportHeight - topVisPadding - 50;
    var textPanelWidth = viewportWidth * panelWidthPercent > 400 ? 400 : viewportWidth * panelWidthPercent;
    panelWrapperMargin = 40;

    containerEl = $('.container');
    visEl = $('#vis');
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

    // set the widths of panels and push their widths, ids, and positions to arrays
    var firstPanelWidth;
    var textBlockPadding = 100;
    var mapSidePadding = 100;
    panelsEl.each(function() {
      var panel = $(this);
      var data = panel.data();
      var panelId = panel.attr('id');
      var width;

      if (data.type == 'image') {
        var bgUrl = panel.css('background-image');
        bgUrl = bgUrl.split('\/');
        bgUrl = bgUrl[bgUrl.length - 1];
        bgUrl = bgUrl.replace(/[\)\"\']/g, '');

        for (var i = 0; i < vizImageSizes.length; i++) {
          if (bgUrl === vizImageSizes[i].filename) {
            // calculate panel size based on image file ratio
            var ratio = vizImageSizes[i].width / vizImageSizes[i].height;
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

      if (panelId == 'panel-0-1') {
        firstPanelWidth = width;
        firstPanelMargin = viewportWidth - firstPanelWidth;
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
      if (data.type == 'text-block') {
        panel.css({
          height: panelHeight,
          width: width - textBlockPadding,
          'padding-left': textBlockPadding
        });
      } else if (data.type == 'map') {
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

    var firstPanel = $('#panel-0-1');
    firstPanel.css({
      'margin-left': firstPanelMargin
    });

    // set overlaid text based on id
    var matchId = function (el) {
      return el.substring(el.length - 3) === textPanelNum;
    };
    for (var i = 0; i < textPanelsEl.length; i++) {
      var textPanel = $(textPanelsEl[i]);
      var textPanelId = textPanel.attr('id');
      var textPanelNum = textPanelId.substring(textPanelId.length - 3);
      if (textPanel.data().type == 'text-overlay') {
        var index = panelIds.findIndex(matchId);
        var marginLeft = panelPositions[index] - panelWrapperMargin;
        if (i === 0) {
          marginLeft -= firstPanelMargin;
        }
        textPanel.css({
          'margin-left': marginLeft
        });
      }
    }

    var totalPanelsWidth = panelWidths.reduce(function(a, b) {
      return a + b;
    });
    console.log(totalPanelsWidth, panelWidths)
    var vizWidth = totalPanelsWidth + panelWrapperMargin + firstPanelMargin;
    panelsGroupEl.css({
      height: panelHeight,
      width: vizWidth
    });

    mapEl.nyc.played = false;
    mapEl.nyc.position = panelPositionByNum('1-3');
    mapEl.nyc.animationTrigger = isMobile ? mapEl.nyc.position : mapEl.nyc.position - (viewportWidth / 2);
    mapEl.wasteExport.played = false;
    mapEl.wasteExport.position = panelPositionByNum('3-1');
    mapEl.wasteExport.animationTrigger = isMobile ? mapEl.wasteExport.position : mapEl.wasteExport.position - (viewportWidth / 2);

    var panelPositionsCalculated = {
      collection: panelPositionByNum('1-1'),
      transfer: panelPositionByNum('2-1'),
      export: panelPositionByNum('3-1'),
      disposal: panelPositionByNum('4-1')
    };

    var footerVisible = false;

    // fill progress bar based on scrolling
    var currentScroll = 0;
    function progressBar() {
      var documentScrollLeft = $('#vis').scrollLeft();
      if (currentScroll != documentScrollLeft) {
        currentScroll = documentScrollLeft;

        var mapOpacity = function (initialPosition, finalPosition) {
          function mapRange(value, low1, high1, low2, high2) {
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
          }
          var mappedOpacity = mapRange(currentScroll, initialPosition, finalPosition, 0, 1);
          var opacity = mappedOpacity > 1 ? 1 : mappedOpacity;
          var opacityPct = Math.round(opacity * 100);
          var linearGradient = 'linear-gradient(90deg, #333 0%, #333 ' + opacityPct + '%, #9d9d9d ' + opacityPct + '%)';
          return linearGradient;
        };

        // fade footer in
        if (currentScroll >= panelPositionsCalculated.collection - panelWrapperMargin - firstPanelMargin && !footerVisible) {
          $('#footer').fadeTo('slow', 1);
        }

        // set footer dots
        var setDotsColor = function (dotId, panelPos) {
          if (currentScroll >= panelPos) { $(dotId).css({ background: '#333'}); } else { $(dotId).css({ background: '#9d9d9d'}); }
        };
        setDotsColor('#step-dot-1', panelPositionsCalculated.collection);
        setDotsColor('#step-dot-2', panelPositionsCalculated.transfer);
        setDotsColor('#step-dot-3', panelPositionsCalculated.export);
        setDotsColor('#step-dot-4', panelPositionsCalculated.disposal);

        // set footer lines
        $('#step-line-1').css({ background: mapOpacity(panelPositionsCalculated.collection, panelPositionsCalculated.transfer) });
        $('#step-line-2').css({ background: mapOpacity(panelPositionsCalculated.transfer, panelPositionsCalculated.export) });
        $('#step-line-3').css({ background: mapOpacity(panelPositionsCalculated.export, panelPositionsCalculated.disposal) });

        // trigger map animations
        if (currentScroll >= mapEl.nyc.animationTrigger && !mapEl.nyc.played) {
          mapEl.nyc.linesIn();
          mapEl.nyc.played = true;
        }
        if (currentScroll >= mapEl.wasteExport.animationTrigger && !mapEl.wasteExport.played) {
          mapEl.wasteExport.linesIn();
          mapEl.wasteExport.played = true;
        }
      }
    }
    var progressBarThrottle = _.throttle(progressBar, 100);
    $('#vis').scroll(progressBarThrottle);

    // use mousewheel to scroll horizontally
    $('body').mousewheel(function(event) {
      var currentScroll = $('#vis').scrollLeft();
      $('#vis').scrollLeft(currentScroll - (event.deltaY * event.deltaFactor));
      event.preventDefault(); //prevents horizontal scroll on trackpad
    });

    // use keyboard to scroll horizontally
    document.onkeydown = function(event) {
      if (!event)
           event = window.event;
      var code = event.keyCode;
      if (event.charCode && code === 0)
           code = event.charCode;
      var scrollFactor = viewportWidth * 0.1;
      var currentScroll = $('#vis').scrollLeft();
      switch(code) {
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

    // follow links in progress bar
    $('.steps-link').click(function() {
      var link = $(this);
      var numToScroll = link.data().scroll;
      scrollToPanel(numToScroll);
    });

    // fade vis in
    $('#vis').fadeTo('slow', 1, function() {
      // Animation complete.
      var beginEl = Modernizr.touch ? ($('#begin-mobile')) : $('#begin');
      setTimeout(function() {
        beginEl.css({ display: 'block' });
      }, 1500);
    });
    initMaps();

  });

  function initMaps() {

    //color configs
    mapEl.colors = {
      background: '#edf0ff',
      land: '#d9d9d9',
      wasteLines: '#f15a29',
      wasteCircles: '#f15a29'
    };
    mapEl.scales = {
      circleRadius: function (value) {
        return Math.sqrt(value / 3.14) * 0.025;
      },
      lineWidth: function (value) {
        return mapEl.scales.circleRadius(value) / 2;
      }
    };

    //Load in GeoJSON data
    d3.json('data/od_lines_refuse.geojson', function(odLines) {
      d3.json('data/dest_points_refuse.geojson', function(destPointsRefuseData) {
        d3.json('data/nycd.geojson', function(nycd) {
          d3.json('data/dest_lines.geojson', function(exportLines) {
            d3.json('data/export_points.geojson', function(exportPoints) {
              d3.json('data/us_states.geojson', function(states) {
                d3.json('data/ny_nj_ct.geojson', function(nynj) {
                  initNycMap(odLines, destPointsRefuseData, nycd, nynj);
                  initExportMap(exportLines, exportPoints, states);
                });
              });
            });
          });
        });
      });
    });

    function initExportMap(exportLines, exportPoints, states) {
      var width = $('.map-export').width() * 0.99;
      // var height = $('#panel-3-1').height() * 0.99;
      var height = viewportHeight;

      var projection = d3.geo.mercator()
        .scale(1)
        .translate([0, 0]);
      var path = d3.geo.path()
        .projection(projection);

      // remove non landfill lines from dataset
      var exportLinesLength = exportLines.features.length;
      while (exportLinesLength--) {
        if (exportLines.features[exportLinesLength].properties.sent_fac_t !== 'Landfill') {
          exportLines.features.splice(exportLinesLength, 1);
        }
      }
      var exportPointsLength = exportPoints.features.length;
      while (exportPointsLength--) {
        if (exportPoints.features[exportPointsLength].geometry.coordinates === null) {
          exportPoints.features.splice(exportPointsLength, 1);
        }
      }

      var b = path.bounds(exportLines),
          scaleFactor = 0.75,
          s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection
        .scale(s)
        .translate(t);

      // Clear SVG if there is one (on resize)
      if (d3.select('#map-export-svg')) {
        d3.select('#map-export-svg').remove();
      }

      //Create SVG element
      var svg = d3.select('.map-export')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'map-export-svg');

      $('#map-export-svg').css({
        position: 'absolute',
        top: -topVisPadding
      });

      var div = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      var clipBackground = svg.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', width / 2)
        .attr('fill', mapEl.colors.background)
        .attr('stroke-width', 0);

      var clip = svg.append('clipPath')
        .attr('id', 'mapClip')
        .append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', width / 2);

      var mapGroup = svg.append('g')
        .attr('class', 'mapGroup')
        .attr('clip-path', 'url(#mapClip)');
      var usStates = mapGroup.append('g').attr('class', 'usStates');
      var linePaths = mapGroup.append('g').attr('class', 'lineConnect');
      var destPoints = mapGroup.append('g').attr('class', 'exportPoints');

      usStates.selectAll('.usStates')
        .data(states.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .style('fill', mapEl.colors.land);

      linePaths.selectAll('.lineConnect')
        .data(exportLines.features)
        .enter()
        .append('path')
        .attr({
          'd': path,
          'stroke-dasharray': '0 5000'
        })
        .style('stroke', mapEl.colors.wasteLines)
        .attr('stroke-width', function(d) {
          if (d.properties.sent_fac_t === 'Landfill') {
            return mapEl.scales.lineWidth(d.properties.sent_tons_);
          } else {
            return 0;
          }
        })
        .style('fill', 'none')
        .attr('stroke-dasharray', function(d) {
          return (this.getTotalLength() + ' ' + this.getTotalLength());
        })
        .attr('stroke-dashoffset', function(d) {
          return -this.getTotalLength();
        })
        .attr('class', 'lineConnect')
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
        // .transition()
        // .duration(3000)
        // .attr('stroke-dashoffset', 0);

      destPoints.selectAll('.exportPoints')
        .data(exportPoints.features)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
        })
        .attr('cy', function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
        })
        // .attr("r", function(d) {
          // return mapEl.scales.circleRadius(d.properties.sent_tons_);
        // })
        .attr('r', 0)
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .style('fill', mapEl.colors.wasteCircles)
        .attr('opacity', function(d) {
          if (d.properties.sent_fac_t === 'Landfill') {
            return 1;
          } else {
            return 0;
          }
        })
        .on('click', function (d) {
          var pointFac = d.properties.sent_fac;
          var matchingLines = $.grep(exportLines.features, function (e) {
            return e.properties.sent_fac == d.properties.sent_fac;
          });
          console.log(matchingLines);
                  linePaths.selectAll('.lineConnect')
                    .each(function(d, i) {
                      d3.select(this)
                        .attr('stroke-dasharray', function(d) {
                          return (this.getTotalLength() + ' ' + this.getTotalLength());
                        })
                        .attr('stroke-dashoffset', function(d) {
                          if (d.properties.sent_fac == pointFac) {
                            return 0;
                          } else {
                            return -this.getTotalLength();
                          }
                        })
                    });
        })
        .attr('class', 'exportPoints');

      mapEl.wasteExport.linesIn = function() {

        destPoints.selectAll('.exportPoints')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
            });

        linePaths.selectAll('.lineConnect')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dasharray', function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength());
              })
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .attr('class', 'lineConnect')
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                mapEl.wasteExport.transitionCircles();
              });
          });
      };

      mapEl.wasteExport.transitionCircles = function() {
        destPoints.selectAll('.exportPoints')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0)
          .transition()
            .duration(1500)
            .attr('r', function(d) {
              return mapEl.scales.circleRadius(d.properties.sent_tons_);
            })
            .each('end', function() {
              mapEl.wasteExport.linesOut();
            });
          });
      };

      mapEl.wasteExport.linesOut = function() {
        linePaths.selectAll('.lineConnect')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dasharray', function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength());
              })
              .attr('stroke-dashoffset', 0)
              .attr('class', 'lineConnect')
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              });
          });
      };
    }

    function initNycMap(odLines, destPointsRefuseData, nycd, states) {
      //Width and height
      var width = $('.map-nyc').width() * 0.99;
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

      // Clear SVG if there is one (on resize)
      if (d3.select('#map-nyc-svg')) {
        d3.select('#map-nyc-svg').remove();
      }
      //Create SVG element
      var svg = d3.select('.map-nyc')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'map-nyc-svg');

      $('#map-nyc-svg').css({
        position: 'absolute',
        top: -topVisPadding
      });

      var div = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      var clipBackground = svg.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', width / 2)
        .attr('fill', mapEl.colors.background)
        .attr('stroke-width', 0);

      var clip = svg.append('clipPath')
        .attr('id', 'mapClip')
        .append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', width / 2);

      var mapGroup = svg.append('g')
        .attr('class', 'mapGroup')
        .attr('clip-path', 'url(#mapClip)');
      var usStates = mapGroup.append('g').attr('class', 'usStates');
      var commDist = mapGroup.append('g').attr('class', 'commDist');
      var linePaths = mapGroup.append('g').attr('class', 'lineConnect');
      var destPointsRefuse = mapGroup.append('g').attr('class', 'destPointsRefuse');

      usStates.selectAll('.usStates')
        .data(states.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', 'black')
        .style('stroke-width', 0)
        .style('fill', mapEl.colors.land)
        .attr('class', 'usStates');

      commDist.selectAll('.nycd')
        .data(nycd.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', 'black')
        .style('stroke-width', 0)
        .style('fill', mapEl.colors.land)
        .attr('class', 'nycd');

      linePaths.selectAll('.lineConnect')
        .data(odLines.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', mapEl.colors.wasteLines)
        .attr('stroke-width', function (d) {
          return mapEl.scales.lineWidth(d.properties.j_tot_rec);
        })
        .style('fill', 'none')
        .attr('stroke-dasharray', function(d) {
          return (this.getTotalLength() + ' ' + this.getTotalLength());
        })
        .attr('stroke-dashoffset', function(d) {
          return this.getTotalLength();
        })
        .attr('class', 'lineConnect')
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
        // .transition()
        //   .duration(3000)
        //   .attr('stroke-dashoffset', 0);

      destPointsRefuse.selectAll('.destPointsRefuse')
        .data(destPointsRefuseData.features)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
        })
        .attr('cy', function(d) {
          return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
        })
        .attr('r', 0)
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .style('fill', mapEl.colors.wasteCircles)
        .attr('class', 'destPointsRefuse')
        // .transition()
        //   .duration(3000)
        //   .attr("r", function(d) {
        //     return mapEl.scales.circleRadius(d.properties.j_tot_rec);
        //   });

      mapEl.nyc.linesIn = function() {
        //clear circles
        destPointsRefuse.selectAll('.destPointsRefuse')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
            });

        linePaths.selectAll('.lineConnect')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dasharray', function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength());
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .attr('class', 'lineConnect')
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
            .each('end', function() {
              mapEl.nyc.transitionCircles();
            });
          });
      };

      mapEl.nyc.transitionCircles = function() {
        destPointsRefuse.selectAll('.destPointsRefuse')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0)
              // .on('click', function (d) {
              //   console.log(d.properties.fac_name)
              // })
          .transition()
            .duration(1500)
            .attr('r', function(d) {
              return mapEl.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              // if (i === 1) {
                // $("#text-2-0").append("<p class='animation-text'>These are the transfer stations used by the City in the NYC area.</p>");
              // }
              mapEl.nyc.linesOut();
            });
          });
      };

      mapEl.nyc.linesOut = function() {
        linePaths.selectAll('.lineConnect')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dasharray', function(d) {
                return (this.getTotalLength() + ' ' + this.getTotalLength());
              })
              .attr('stroke-dashoffset', 0)
              .attr('class', 'lineConnect')
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              });
          });
      };
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
    console.log(index);
    var pos = widthArray.slice(0, index).reduce(function(a, b) {
      return a + b;
    });
    console.log(panelWrapperMargin, firstPanelMargin, viewportWidth);
    pos += panelWrapperMargin + firstPanelMargin - viewportWidth;
    return pos;
  }
  // example use
  // findPanelPositionById("panel-2-3", panelIds, panelWidths)

  function scrollToPanel(elementId) {
    var elementPosition = panelPositionByNum(elementId);
    elementPosition -= panelWrapperMargin;
    function scroll() {
      $('#vis').stop().animate( { scrollLeft: elementPosition }, { duration: 1000, easing: 'swing'});
    }
    scroll();
  }

  function panelPositionByNum(panelId) {
      function matchId(el) {
        return el.substring(el.length - 3) === panelId;
      }
      var index = panelIds.findIndex(matchId);
      return panelPositions[index];
  }

}
