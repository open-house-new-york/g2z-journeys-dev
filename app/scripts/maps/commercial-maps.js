function initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth) {

  var scaleFactor = isMobile ? 1 : 1.5
  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29',
    wasteOpacity: '#e3a793',
    complementary: '#1485CC',
    complementaryOpacity: '#8bb8d5',
    scale: ['#f15a29', '#e3a793', '#8bb8d5'],
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
    initCommCollMap(nycdBcdData, nyNjCt, routeRoadsData, truckRoutesLinesData, truckRoutesPointsData);
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
          return 2;
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
        .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
        .attr('class', 'truckPoints');

      // var inciLegendTitleText = ['Waste destination'];
      // var inciLegendLabels = ['Collection truck to incinerator', 'Transfer Station to incinerator', 'Transfer Station to landfill'];
      // var legendWidth = 20;
      // var legendHeight = 20;
      // var legendSpacing = 10;
      // var legendStartingX = isMobile ? 0 : 60;
      // var legendStartingY = height/4;
      //
      // var inciLegendTitle = svg.selectAll('inciLegendTitle')
      //     .data(inciLegendTitleText)
      //     .enter()
      //     .append('text')
      //     .attr('class', 'map-legend legend-inci')
      //     .attr('id', 'inci-legend-title')
      //     .attr('x', legendStartingX)
      //     .attr('y', legendStartingY - legendSpacing)
      //     .text(function(d, i){ return inciLegendTitleText[i]; })
      //     .attr('opacity', 0);
      //
      // var inciLegend = svg.selectAll('inciLegend')
      //     .data(journeyConfigs.mapConfigs.colors.scale)
      //     .enter()
      //     .append('g')
      //     .attr('class', 'map-legend legend-inci')
      //     .attr('id', function (d, i) {
      //       return 'inci-legend-' + i;
      //     })
      //     .attr('opacity', 0);
      //
      // inciLegend.append('circle')
      //   .attr('class', 'legend-inci')
      //   .attr('cx', legendStartingX + (legendWidth/2))
      //   .attr('cy', function(d, i) {
      //     return (legendStartingY + (i*legendHeight) + (i*legendSpacing) + legendWidth/2);
      //   })
      //   // .attr('width', legendWidth)
      //   // .attr('height', legendHeight)
      //   .attr('r', legendWidth/2)
      //   .style('stroke', '#fff')
      //   .style('stroke-width', 1)
      //   .style('fill', function(d, i) { return d; });
      //
      // inciLegend.append('text')
      //   .attr('class', 'legend-inci')
      //   .attr('x', legendStartingX + legendWidth + legendSpacing)
      //   .attr('y', function(d, i) {
      //     return legendStartingY + (i*legendHeight) + 13 + (i*legendSpacing);
      //   })
      //   .text(function(d, i){ return inciLegendLabels[i]; });

    journeyConfigs.mapEl.commColl.animationPlayed = false;

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

        svg.selectAll('.map-legend').attr('opacity', 0);

      truckPoints.selectAll('.truckPoints')
        .each(function(d, i) {
          d3.select(this)
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              return 5;
            })
            .each('end', function() {
              journeyConfigs.mapEl.commColl.routeLinesIn();
            });
        });

      }
    };

    journeyConfigs.mapEl.commColl.routeLinesIn = function() {
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
            .each('end', function() {
              journeyConfigs.mapEl.commColl.out();
            });
        });

    };

    journeyConfigs.mapEl.commColl.out = function() {
      setTimeout(function() {
        journeyConfigs.mapEl.commColl.animationPlayed = false;
      }, 1600);
    };

  }
  // end of commColl

// end of init
}
