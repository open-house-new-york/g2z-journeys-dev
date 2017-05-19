function initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth) {

  var scaleFactor = isMobile ? 1 : 1.5;
  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29',
    wasteOpacity: '#e3a793',
    complementary: '#1485CC',
    complementaryOpacity: '#8bb8d5',
    scale: ['#8bb8d5', '#1485CC', '#f15a29'],
    scaleTS: ['#8bb8d5', '#f15a29'],
    scaleExport: ['#f15a29', '#1485CC'],
    scaleDropOff: ['#f15a29', '#1485CC']
  };
  journeyConfigs.mapConfigs.scales = {
    circleRadius: function(value) {
      return (Math.sqrt(value / 3.14) * 0.025) * scaleFactor;
    },
    lineWidth: function(value) {
      return journeyConfigs.mapConfigs.scales.circleRadius(value) * scaleFactor;
    }
  };

  //Load in GeoJSON data
  d3.json(journeyConfigs.mapDataPath, function(geojson) {
  // d3.json("data/commercial.geojson", function(geojson) {
    var nycdBcdData = geojson.nycd_bcd;
    var nyNjCt = geojson.ny_nj_ct_refined;
    var odLinesData = geojson.od_lines_refuse;
    var truckRoutesLinesData = geojson.comm_truck_routes_lines;
    var truckRoutesPointsData = geojson.comm_truck_routes_points;
    var allTSData = geojson.all_transfer_stations;
    var destLines = geojson.dest_lines;
    var exportPoints = geojson.export_points;
    var statesEast = geojson.states_east;
    initCndTSMap(nycdBcdData, nyNjCt, allTSData);
    initExportMap(destLines, exportPoints, statesEast);
  });

  function initCndTSMap(nycdBcdData, states, allTSData) {
    //Width and height
    var width = $('.map-cnd-ts').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(allTSData),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-cnd-ts-svg')) {
      d3.select('#map-cnd-ts-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-cnd-ts')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-cnd-ts-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.cndTS.startAnimation();
      });

    $('#map-cnd-ts-svg').css({
      position: 'absolute',
      top: -topVisPadding
    });

    var clipBackground = svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', width / 2)
      .style('fill', journeyConfigs.mapConfigs.colors.background)
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
    var tsNotCnd = mapGroup.append('g').attr('class', 'tsNotCnd');
    var tsCnd = mapGroup.append('g').attr('class', 'tsCnd');

    usStates.selectAll('.usStates')
      .data(states.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land)
      .attr('class', 'usStates');

    commDist.selectAll('.nycd')
      .data(nycdBcdData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .style('fill', function(d, i) {
        return journeyConfigs.mapConfigs.colors.land;
      })
      .attr('class', 'nycd');

    tsNotCnd.selectAll('.tsNotCnd')
      .data(allTSData.features)
      .enter()
      .append('circle')
      .filter(function(d) {
        return d.properties.ac_desc_si !== 'C&D';
      })
      .attr('cx', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      })
      .attr('r', function(d, i) {
        return 0;
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.complementaryOpacity)
      .attr('opacity', 0.7)
      .attr('class', 'tsNotCnd');

    tsCnd.selectAll('.tsCnd')
      .data(allTSData.features)
      .enter()
      .append('circle')
      .filter(function(d) {
        return d.properties.ac_desc_si === 'C&D';
      })
      .attr('cx', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      })
      .attr('r', function(d, i) {
        return 0;
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('opacity', 0.7)
      .attr('class', 'tsCnd');

    var tsLegendTitleText = ['Facilities in NYC, scaled'];
    var tsLegendTitleTextBelow = ['by tons of waste received'];
    var tsLegendLabels = ['Transfer station', 'C&D debris processing'];
    // var legendWidth = 20;
    var legendWidth = 10;
    var legendHeight = 10;
    var legendSpacing = 10;
    var legendStartingX = isMobile ? 8 : 30;
    var legendStartingY = height * 0.4;

    var routeLegendTitle = svg.selectAll('routeLegendTitle')
        .data(tsLegendTitleText)
        .enter()
        .append('text')
        .attr('class', 'map-legend legend-route')
        .attr('id', 'legend-route-title')
        .attr('x', legendStartingX)
        .attr('y', legendStartingY - (legendSpacing * 2.5) - 5)
        .text(function(d, i){ return tsLegendTitleText[i]; })
        .attr('opacity', 1);

    var routeLegendTitleBelow = svg.selectAll('routeLegendTitle')
        .data(tsLegendTitleTextBelow)
        .enter()
        .append('text')
        .attr('class', 'map-legend legend-route')
        .attr('id', 'legend-route-title')
        .attr('x', legendStartingX)
        .attr('y', legendStartingY - legendSpacing - 5)
        .text(function(d, i){ return tsLegendTitleTextBelow[i]; })
        .attr('opacity', 1);

    var tsLegend = svg.selectAll('tsLegend')
        .data(journeyConfigs.mapConfigs.colors.scaleTS)
        .enter()
        .append('g')
        .attr('class', 'map-legend legend-ts')
        .attr('id', function (d, i) {
          return 'legend-ts-' + i;
        })
        .attr('opacity', 1);

    tsLegend.append('circle')
      .attr('class', 'legend-ts')
      .attr('cx', legendStartingX + (legendWidth/2))
      .attr('cy', function(d, i) {
        return (legendStartingY + (i*legendHeight) + (i*legendSpacing) + legendWidth/2);
      })
      .attr('r', legendWidth/2)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', function(d, i) {
        return d;
       });

    tsLegend.append('text')
      .attr('class', 'legend-ts')
      .attr('x', legendStartingX + legendWidth + legendSpacing)
      .attr('y', function(d, i) {
        return legendStartingY + (i*legendHeight) + 10 + (i*legendSpacing);
      })
      .text(function(d, i){ return tsLegendLabels[i]; });

    journeyConfigs.mapEl.cndTS.animationPlayed = false;
    journeyConfigs.mapEl.cndTS.otherPointsPlayed = false;
    journeyConfigs.mapEl.cndTS.outPlayed = false;

    journeyConfigs.mapEl.cndTS.startAnimation = function() {

      if (!journeyConfigs.mapEl.cndTS.animationPlayed) {
        journeyConfigs.mapEl.cndTS.animationPlayed = true;

        //clear circles
        tsNotCnd.selectAll('.tsNotCnd')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });
        tsCnd.selectAll('.tsCnd')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });

        // svg.selectAll('.map-legend').attr('opacity', 0);
        // svg.selectAll('.map-legend').remove();

        tsNotCnd.selectAll('.tsNotCnd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.ac_desc_si !== 'C&D';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_2014);
              })
              .each('end', function(d, i) {
                journeyConfigs.mapEl.cndTS.otherPoints();
                journeyConfigs.mapEl.cndTS.otherPointsPlayed = true;
              });
          });

      }
    };

    journeyConfigs.mapEl.cndTS.otherPoints = function() {
      if (!journeyConfigs.mapEl.cndTS.otherPointsPlayed) {
        d3.select('#legend-ts-title').attr('opacity', 1);
        d3.select('#legend-ts-0').attr('opacity', 1);
        d3.select('#legend-ts-1').attr('opacity', 1);

        tsCnd.selectAll('.tsCnd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.ac_desc_si === 'C&D';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_2014);
              })
              .each('end', function(d, i) {
                journeyConfigs.mapEl.cndTS.out();
                journeyConfigs.mapEl.cndTS.outPlayed = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.cndTS.out = function() {
      if (!journeyConfigs.mapEl.cndTS.outPlayed) {
        setTimeout(function() {
          journeyConfigs.mapEl.cndTS.animationPlayed = false;
          journeyConfigs.mapEl.cndTS.otherPointsPlayed = false;
          journeyConfigs.mapEl.cndTS.outPlayed = false;
        }, 1600);
      }
    };

  }
  // end of commTS

  function initExportMap(exportLines, exportPoints, states) {
    var width = $('.map-cnd-export').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);

    // remove non landfill and other lines from dataset
    var exportLinesLength = exportLines.features.length;
    while (exportLinesLength--) {
      if (!filterByType(exportLines.features[exportLinesLength].properties.sent_type)) {
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
    if (d3.select('#map-cnd-export-svg')) {
      d3.select('#map-cnd-export-svg').remove();
    }

    //Create SVG element
    var svg = d3.select('.map-cnd-export')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-cnd-export-svg')
      .on('click', function (d) {
        journeyConfigs.mapEl.cndExport.startAnimation();
      });

    $('#map-cnd-export-svg').css({
      position: 'absolute',
      top: -topVisPadding
    });


    var clipBackground = svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', width / 2)
      .attr('fill', journeyConfigs.mapConfigs.colors.background)
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

    function colorByType(attribute) {
      if (attribute === 'Landfill') {
        return journeyConfigs.mapConfigs.colors.wasteCircles;
      } else if (attribute === 'C&D') {
        return journeyConfigs.mapConfigs.colors.complementary;
      }
    }
    function filterByType(attribute) {
      if (attribute === 'C&D' || attribute === 'Landfill') {
        return true;
      } else {
        return false;
      }
    }

    usStates.selectAll('.usStates')
      .data(states.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.land);

    linePaths.selectAll('.lineConnect')
      .data(exportLines.features)
      .enter()
      .append('path')
      .attr({
        'd': path,
        'stroke-dasharray': '0 5000'
      })
      .style('stroke', function (d, i) {
        return colorByType(d.properties.sent_fac_t);
      })
      .attr('stroke-width', function(d) {
        if (filterByType(d.properties.sent_type)) {
          return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.sent_tons_)/2;
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
      .attr('r', 0)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', function (d, i) {
        return colorByType(d.properties.sent_fac_t);
      })
      .attr('opacity', function(d) {
        if (filterByType(d.properties.sent_fac_t)) {
          return 1;
        } else {
          return 0;
        }
      })
      .attr('class', 'exportPoints');

      var exportLegendTitleText = ['Destination type'];
      var exportLegendLabels = ['Landfill', 'C&D processor'];
      // var legendWidth = 20;
      var legendWidth = 10;
      var legendHeight = 10;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? width - (width * 0.30) : width - (width * 0.2);
      var legendStartingY = height * 0.7;

      var exportLegendTitle = svg.selectAll('exportLegendTitle')
          .data(exportLegendTitleText)
          .enter()
          .append('text')
          .attr('class', 'map-legend legend-export')
          .attr('id', 'legend-export-title')
          .attr('x', legendStartingX)
          .attr('y', legendStartingY - legendSpacing)
          .text(function(d, i){ return exportLegendTitleText[i]; })
          .attr('opacity', 1);

      var exportLegend = svg.selectAll('exportLegend')
          .data(journeyConfigs.mapConfigs.colors.scaleExport)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-export')
          .attr('id', function (d, i) {
            return 'legend-export-' + i;
          })
          .attr('opacity', 1);

      exportLegend.append('circle')
        .attr('class', 'legend-export')
        .attr('cx', legendStartingX + (legendWidth/2))
        .attr('cy', function(d, i) {
          return (legendStartingY + (i*legendHeight) + (i*legendSpacing) + legendWidth/2);
        })
        .attr('r', legendWidth/2)
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .style('fill', function(d, i) { return d; });

      exportLegend.append('text')
        .attr('class', 'legend-export')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 10 + (i*legendSpacing);
        })
        .text(function(d, i){ return exportLegendLabels[i]; });

    journeyConfigs.mapEl.cndExport.animationPlayed = false;
    journeyConfigs.mapEl.cndExport.transitionCirclesPlayed = false;
    journeyConfigs.mapEl.cndExport.linesOutPlayed = false;

    journeyConfigs.mapEl.cndExport.startAnimation = function() {

      if (!journeyConfigs.mapEl.cndExport.animationPlayed) {
        journeyConfigs.mapEl.cndExport.animationPlayed = true;

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
                journeyConfigs.mapEl.cndExport.transitionCircles();
                journeyConfigs.mapEl.cndExport.transitionCirclesPlayed = true;
              });
          });
      }

    };

    journeyConfigs.mapEl.cndExport.transitionCircles = function() {
      if (!journeyConfigs.mapEl.cndExport.transitionCirclesPlayed) {
        destPoints.selectAll('.exportPoints')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.sent_tons_);
              })
              .each('end', function() {
                journeyConfigs.mapEl.cndExport.linesOut();
                journeyConfigs.mapEl.cndExport.linesOutPlayed = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.cndExport.linesOut = function() {
      if (!journeyConfigs.mapEl.cndExport.linesOutPlayed) {
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

        setTimeout(function () {
          journeyConfigs.mapEl.cndExport.animationPlayed = false;
          journeyConfigs.mapEl.cndExport.transitionCirclesPlayed = false;
          journeyConfigs.mapEl.cndExport.linesOutPlayed = false;
        }, 1600);
      }
    };
  }
  // end of export map

// end of init
}
