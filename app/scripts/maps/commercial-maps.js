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
  // d3.json(journeyConfigs.mapDataPath, function(geojson) {
  //   var nycdBcd = geojson.nycd_bcd;
  //   var nyNjCt = geojson.ny_nj_ct_refined;
  //   var odLinesData = geojson.od_lines_refuse;
  //   var NSExportData = geojson.north_shore_export;
  //   var NSExportPointData = geojson.north_shore_export_point;
  //   var destPointsRefuseData = geojson.dest_points_refuse;
  //   // initCommCollMap(nycdBcd, odLinesData, destPointsRefuseData, nyNjCt, NSExportData, NSExportPointData);
  // });
  d3.json('data/temp/nycd_bcd.geojson', function(nycdBcdData) {
  d3.json('data/temp/ny_nj_ct_refined.geojson', function(nyNjCt) {
  d3.json('data/temp/od_lines_refuse.geojson', function(odLinesData) {
  d3.json('data/temp/comm_truck_routes_lines.geojson', function(truckRoutesLinesData) {
  d3.json('data/temp/comm_truck_routes_points.geojson', function(truckRoutesPointsData) {
  d3.json('data/temp/route_roads.geojson', function(routeRoadsData) {
  d3.json('data/temp/all_transfer_stations.geojson', function(allTSData) {
    initCommTSMap(nycdBcdData, nyNjCt, allTSData);
    initCommCollMap(nycdBcdData, nyNjCt, routeRoadsData, truckRoutesLinesData, truckRoutesPointsData);
  });
  });
  });
  });
  });
  });
  });

  function initCommCollMap(nycdBcdData, states, routeRoadsData, truckRoutesLinesData, truckRoutesPointsData) {
    //Width and height
    var width = $('.map-comm-coll').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(truckRoutesPointsData),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-comm-coll-svg')) {
      d3.select('#map-comm-coll-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-comm-coll')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-comm-coll-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.commColl.startAnimation();
      });

    $('#map-comm-coll-svg').css({
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
    var routeRoads = mapGroup.append('g').attr('class', 'routeRoads');
    var truckLines = mapGroup.append('g').attr('class', 'truckLines');
    var truckPoints = mapGroup.append('g').attr('class', 'truckPoints');

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
      .style('fill', function (d, i) {
        return journeyConfigs.mapConfigs.colors.land;
      })
      .attr('class', 'nycd');

      // routeRoads.selectAll('.routeRoads')
      //   .data(routeRoadsData.features)
      //   .enter()
      //   .append('path')
      //   .attr({
      //     'd': path
      //   })
      //   .style('stroke', '#fff')
      //   .attr('stroke-width', function(d) {
      //     return 1;
      //   })
      //   .style('fill', 'none')
      //   .attr('class', 'routeRoads');

      truckLines.selectAll('.truckLines')
        .data(truckRoutesLinesData.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
        .attr('stroke-width', function(d) {
          return isMobile ? 1 : 2;
        })
        .style('fill', 'none')
        // .attr('stroke-dasharray', function(d) {
        //   return (this.getTotalLength() + ' ' + this.getTotalLength());
        // })
        // .attr('stroke-dashoffset', function(d) {
        //   return this.getTotalLength();
        // })
        .attr('opacity', 0)
        .attr('class', 'truckLines');

      truckPoints.selectAll('.truckPoints')
        .data(truckRoutesPointsData.features)
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
          if (d.properties.route == 'start') {
            return journeyConfigs.mapConfigs.colors.complementaryOpacity;
          } else if (d.properties.route == 'end') {
            return journeyConfigs.mapConfigs.colors.complementary;
          } else {
            return journeyConfigs.mapConfigs.colors.wasteCircles;
          }
        })
        .attr('class', 'truckPoints');

      var routeLegendTitleText = ['A commecial pickup route'];
      var routeLegendLabels = ['Garage', 'Transfer Station', 'Customer'];
      // var legendWidth = 20;
      var legendWidth = 10;
      var legendHeight = 10;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? 8 : 30;
      var legendStartingY = height * 0.4;

      var routeLegendTitle = svg.selectAll('routeLegendTitle')
          .data(routeLegendTitleText)
          .enter()
          .append('text')
          .attr('class', 'map-legend legend-route')
          .attr('id', 'legend-route-title')
          .attr('x', legendStartingX)
          .attr('y', legendStartingY - legendSpacing)
          .text(function(d, i){ return routeLegendTitleText[i]; })
          .attr('opacity', 1);

      var routeLegend = svg.selectAll('routeLegend')
          .data(journeyConfigs.mapConfigs.colors.scale)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-route')
          .attr('id', function (d, i) {
            return 'legend-route-' + i;
          })
          .attr('opacity', 1);

      routeLegend.append('circle')
        .attr('class', 'legend-route')
        .attr('cx', legendStartingX + (legendWidth/2))
        .attr('cy', function(d, i) {
          return (legendStartingY + (i*legendHeight) + (i*legendSpacing) + legendWidth/2);
        })
        // .attr('width', legendWidth)
        // .attr('height', legendHeight)
        .attr('r', legendWidth/2)
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .style('fill', function(d, i) { return d; });

      routeLegend.append('text')
        .attr('class', 'legend-route')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 10 + (i*legendSpacing);
        })
        .text(function(d, i){ return routeLegendLabels[i]; });

    journeyConfigs.mapEl.commColl.animationPlayed = false;
    journeyConfigs.mapEl.commColl.legendPointsPlayed = false;
    journeyConfigs.mapEl.commColl.otherPointsPlayed = false;
    journeyConfigs.mapEl.commColl.routeLinesInPlayed = false;
    journeyConfigs.mapEl.commColl.outPlayed = false;

    journeyConfigs.mapEl.commColl.startAnimation = function() {

      if (!journeyConfigs.mapEl.commColl.animationPlayed) {
        journeyConfigs.mapEl.commColl.animationPlayed = true;

        //clear circles
        truckPoints.selectAll('.truckPoints')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });

        // clear nycd
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .style('fill', journeyConfigs.mapConfigs.colors.land)
              .attr('opacity', 1);
          });

      truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              // .style('fill', 'none')
              // .attr('stroke-dasharray', function(d) {
              //   return (this.getTotalLength() + ' ' + this.getTotalLength());
              // })
              // .attr('stroke-dashoffset', function(d) {
              //   return this.getTotalLength();
              // });
              .attr('opacity', 0);
          });

        // svg.selectAll('.map-legend').attr('opacity', 0);
        // svg.selectAll('.map-legend').remove();

      truckPoints.selectAll('.truckPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.route == 'start' || d.properties.route == 'end';
            })
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              var radius = isMobile ? 3 : 5;
              return radius;
            })
            .each('end', function(d, i) {
              // journeyConfigs.mapEl.commColl.legendPoints();
              // journeyConfigs.mapEl.commColl.legendPointsPlayed = true;
              journeyConfigs.mapEl.commColl.otherPoints();
              journeyConfigs.mapEl.commColl.otherPointsPlayed = true;
            });
        });

      }
    };

    journeyConfigs.mapEl.commColl.legendPoints = function() {
      if (!journeyConfigs.mapEl.commColl.legendPointsPlayed) {
        svg.selectAll('text-garage')
            .data(truckRoutesPointsData.features)
            .enter()
            .append('text')
            .filter(function(d) {
              return d.properties.route == 'start';
            })
            .attr('x', function(d){
                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
            })
            .attr('y', function(d){
                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
            })
            .attr('transform', function(d) {
              var x = isMobile ? -8 : -12;
              return 'translate('+x+',4)'; })
            .attr('class', 'routes-legend map-legend')
            .attr('text-anchor', 'end')
            .text('Garage');

        svg.selectAll('text-ts')
            .data(truckRoutesPointsData.features)
            .enter()
            .append('text')
            .filter(function(d) {
              return d.properties.route == 'end';
            })
            .attr('x', function(d){
                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
            })
            .attr('y', function(d){
                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
            })
            .attr('transform', function(d) {
              var x = isMobile ? 8 : 12;
              return 'translate('+x+',4)'; })
            .attr('class', 'routes-legend map-legend')
            .text('Transfer Station');

        journeyConfigs.mapEl.commColl.legendOut();

      }
    };

    journeyConfigs.mapEl.commColl.legendOut = function() {
      setTimeout(function() {
        svg.selectAll('.routes-legend')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.route == 'start';
              })
              .attr('opacity', 1)
              .transition()
              .duration(1500)
              .attr('opacity', 0)
              .each('end', function(d, i) {
                journeyConfigs.mapEl.commColl.otherPoints();
                journeyConfigs.mapEl.commColl.otherPointsPlayed = true;
              });
            });
        }, 1000);
    };

    journeyConfigs.mapEl.commColl.otherPoints = function() {
      if (!journeyConfigs.mapEl.commColl.otherPointsPlayed) {
        d3.select('#legend-route-title').attr('opacity', 1);
        d3.select('#legend-route-0').attr('opacity', 1);
        d3.select('#legend-route-1').attr('opacity', 1);

        truckPoints.selectAll('.truckPoints')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.route !== 'start' && d.properties.route !== 'end';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                var radius = isMobile ? 3 : 5;
                return radius;
              })
              .each('end', function(d, i) {
                journeyConfigs.mapEl.commColl.routeLinesIn();
                journeyConfigs.mapEl.commColl.routeLinesInPlayed = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.commColl.routeLinesIn = function() {
      if (!journeyConfigs.mapEl.commColl.routeLinesInPlayed) {
        d3.select('#legend-route-2').attr('opacity', 1);

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              // .attr('stroke-dashoffset', function(d) {
              //   return this.getTotalLength();
              // })
              .transition()
              .duration(1500)
              // .attr('stroke-dashoffset', 0)
              .attr('opacity', 1)
              .each('end', function(d, i) {
                journeyConfigs.mapEl.commColl.out();
                journeyConfigs.mapEl.commColl.outPlayed = true;
              });
            });
      }
    };

    journeyConfigs.mapEl.commColl.out = function() {
      if (!journeyConfigs.mapEl.commColl.outPlayed) {
        setTimeout(function() {
          journeyConfigs.mapEl.commColl.animationPlayed = false;
          journeyConfigs.mapEl.commColl.legendPointsPlayed = false;
          journeyConfigs.mapEl.commColl.otherPointsPlayed = false;
          journeyConfigs.mapEl.commColl.routeLinesInPlayed = false;
          journeyConfigs.mapEl.commColl.outPlayed = false;
        }, 1600);
      }
    };

  }
  // end of commColl

  function initCommTSMap(nycdBcdData, states, allTSData) {
    //Width and height
    var width = $('.map-comm-ts').width() * 0.99;
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
    if (d3.select('#map-comm-ts-svg')) {
      d3.select('#map-comm-ts-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-comm-ts')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-comm-ts-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.commTS.startAnimation();
      });

    $('#map-comm-ts-svg').css({
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
    var tsCity = mapGroup.append('g').attr('class', 'tsCity');
    var tsPrivate = mapGroup.append('g').attr('class', 'tsPrivate');

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

    tsCity.selectAll('.tsCity')
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
        // return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_2014 - d.properties.rec_privat);
        return 0;
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.complementaryOpacity)
      .attr('opacity', 0.7)
      .attr('class', 'tsCity');

    tsPrivate.selectAll('.tsPrivate')
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
        // return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_privat);
        return 0;
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('opacity', 0.7)
      .attr('class', 'tsPrivate');

    var tsLegendTitleText = ['Transfer station by waste received'];
    var tsLegendLabels = ['Residential and instituional', 'Commercial'];
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
        .attr('y', legendStartingY - legendSpacing)
        .text(function(d, i){ return tsLegendTitleText[i]; })
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
      .style('fill', function(d, i) { return d; });

    tsLegend.append('text')
      .attr('class', 'legend-ts')
      .attr('x', legendStartingX + legendWidth + legendSpacing)
      .attr('y', function(d, i) {
        return legendStartingY + (i*legendHeight) + 10 + (i*legendSpacing);
      })
      .text(function(d, i){ return tsLegendLabels[i]; });

    journeyConfigs.mapEl.commTS.animationPlayed = false;
    journeyConfigs.mapEl.commTS.otherPointsPlayed = false;
    journeyConfigs.mapEl.commTS.outPlayed = false;

    journeyConfigs.mapEl.commTS.startAnimation = function() {

      if (!journeyConfigs.mapEl.commTS.animationPlayed) {
        journeyConfigs.mapEl.commTS.animationPlayed = true;

        //clear circles
        tsCity.selectAll('.tsCity')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });
        tsPrivate.selectAll('.tsPrivate')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });

        // svg.selectAll('.map-legend').attr('opacity', 0);
        // svg.selectAll('.map-legend').remove();

        tsCity.selectAll('.tsCity')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.ac_desc_si !== 'C&D';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_2014 - d.properties.rec_privat);
              })
              .each('end', function(d, i) {
                journeyConfigs.mapEl.commTS.otherPoints();
                journeyConfigs.mapEl.commTS.otherPointsPlayed = true;
              });
          });

      }
    };

    journeyConfigs.mapEl.commTS.otherPoints = function() {
      if (!journeyConfigs.mapEl.commTS.otherPointsPlayed) {
        d3.select('#legend-ts-title').attr('opacity', 1);
        d3.select('#legend-ts-0').attr('opacity', 1);
        d3.select('#legend-ts-1').attr('opacity', 1);

        tsPrivate.selectAll('.tsPrivate')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.ac_desc_si !== 'C&D';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.rec_privat);
              })
              .each('end', function(d, i) {
                journeyConfigs.mapEl.commTS.out();
                journeyConfigs.mapEl.commTS.outPlayed = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.commTS.out = function() {
      if (!journeyConfigs.mapEl.commTS.outPlayed) {
        setTimeout(function() {
          journeyConfigs.mapEl.commTS.animationPlayed = false;
          journeyConfigs.mapEl.commTS.otherPointsPlayed = false;
          journeyConfigs.mapEl.commTS.outPlayed = false;
        }, 1600);
      }
    };

  }
  // end of commTS

// end of init
}
