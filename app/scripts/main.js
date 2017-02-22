// $.getJSON( "scripts/sizes.json", function( data ) {
// vizImageSizes = data;
$(document).ready(function() {
  initViz();
});
// });

  // recalculate on window resize
  $(window).on('resize', _.debounce(function() {
    initViz();
  }, 500));

  function initViz() {

    // configs
    var firstPanelId = 'panel-0-1';
    var visSteps = [
      {
        step: 1,
        name: 'Collection',
        id: '1-1'
      },
      {
        step: 2,
        name: 'Transfer',
        id: '2-1'
      },
      {
        step: 3,
        name: 'Export',
        id: '3-1'
      },
      {
        step: 4,
        name: 'Disposal',
        id: '4-1'
      }
    ];
    var mapEl = {
      nyc: {
        id: '1-3'
      },
      wasteExport: {
        id: '3-4'
      }
    };

    var panelWidths = [],
        panelIds = [],
        panelPositions = [],
        panelImageWidths = [],
        panelTextBlockWidths = [];

      var viewportWidth = document.documentElement.clientWidth;
      var viewportHeight = document.documentElement.clientHeight;
      var horizontalViewport = viewportWidth >= viewportHeight ? true : false;
      var isMobile = viewportWidth < 768 && horizontalViewport || viewportHeight < 768 && !horizontalViewport ? true : false;
      console.log('vh:' + viewportHeight, 'vw:' + viewportWidth, 'mobile:' + isMobile, 'horizontal:' + horizontalViewport);

      var panelWidthPercent = 0.9;
      var panelHeightPercent = 0.9;
      var panelWrapperMargin = 40;
      var topVisPadding = isMobile ? 60 : 100;
      var textBlockPadding = 100;
      var mapSidePadding = 100;
      var maximumTextPanelWidth = 400;

      var panelHeight = viewportHeight - topVisPadding - 50;
      var textPanelWidth;
      if (horizontalViewport) {
        textPanelWidth = viewportHeight * panelHeightPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportHeight * panelHeightPercent;
      } else {
        textPanelWidth = viewportWidth * panelWidthPercent > maximumTextPanelWidth ? maximumTextPanelWidth : viewportWidth * panelWidthPercent;
      }

      if (horizontalViewport && isMobile) {
        console.log('flip please') // and stop everything, of fix for horizontal small screens?
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

          for (var i = 0; i < vizImageSizes.length; i++) {
            if (nearestImage === vizImageSizes[i].filename) {
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

        // set margin for first panel
        if (panelId === firstPanelId) {
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
      var vizWidth = totalPanelsWidth + panelWrapperMargin + firstPanelMargin;
      panelsGroupEl.css({
        height: panelHeight,
        width: vizWidth
      });

      // calculate positions and triggers for maps
      var mapsArray = [];
      for (var map in mapEl) {
        if (mapEl.hasOwnProperty(map)) {
          var thisMap = mapEl[map];
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
      for (var i = 0; i < visSteps.length; i++) {
        visSteps[i].position = panelPositionByNum(visSteps[i].id);
      }

      // trigger events based on scrolling
      var footerVisible = false;
      var menuVisible = false;
      var vizLimit = Math.floor(vizWidth - viewportWidth + panelWrapperMargin);
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
          if (currentScroll >= vizLimit && !menuVisible) {
            $('#menu').fadeTo(500, 1);
            menuVisible = true;
          } else if (currentScroll < vizLimit && menuVisible) {
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
          progressBar(mapsArray, visSteps);
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


    function initMaps() {

      //color configs
      mapEl.colors = {
        background: '#edf0ff',
        land: '#d9d9d9',
        wasteLines: '#f15a29',
        wasteCircles: '#f15a29'
      };
      mapEl.scales = {
        circleRadius: function(value) {
          return Math.sqrt(value / 3.14) * 0.025;
        },
        lineWidth: function(value) {
          return mapEl.scales.circleRadius(value) / 2;
        }
      };

      //Load in GeoJSON data
      d3.json('data/mapdata.geojson', function(geojson) {
        var odLines = geojson.od_lines_refuse;
        var destPointsRefuseData = geojson.dest_points_refuse;
        var nycd = geojson.nycd;
        var exportLines = geojson.dest_lines;
        var exportPoints = geojson.export_points;
        var states = geojson.states_east;
        var nynj = geojson.ny_nj_ct;

        initNycMap(odLines, destPointsRefuseData, nycd, nynj);
        initExportMap(exportLines, exportPoints, states);
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
          .attr('class', 'lineConnect');
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
          .on('click', function(d) {
            var pointFac = d.properties.sent_fac;
            var matchingLines = $.grep(exportLines.features, function(e) {
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
                  });
              });
          })
          .attr('class', 'exportPoints');

        mapEl.wasteExport.startAnimation = function() {

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
          .attr('stroke-width', function(d) {
            return mapEl.scales.lineWidth(d.properties.j_tot_rec);
          })
          .style('fill', 'none')
          .attr('stroke-dasharray', function(d) {
            return (this.getTotalLength() + ' ' + this.getTotalLength());
          })
          .attr('stroke-dashoffset', function(d) {
            return this.getTotalLength();
          })
          .attr('class', 'lineConnect');
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
          .attr('class', 'destPointsRefuse');
        // .transition()
        //   .duration(3000)
        //   .attr("r", function(d) {
        //     return mapEl.scales.circleRadius(d.properties.j_tot_rec);
        //   });

        mapEl.nyc.startAnimation = function() {
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

}
