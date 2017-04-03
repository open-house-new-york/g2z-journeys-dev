function initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth) {

  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29',
    wasteOpacity: '#e3a793',
    complementary: '#1485CC',
    complementaryOpacity: '#8bb8d5',
    scale: ['#992D09', '#FF885E', '#FFBDA6', '#8bb8d5'],
    scaleDropOff: ['#f15a29', '#1485CC']
  };
  journeyConfigs.mapConfigs.scales = {
    circleRadius: function(value) {
      return (Math.sqrt(value / 3.14) * 0.025) * 2;
    },
    lineWidth: function(value) {
      return journeyConfigs.mapConfigs.scales.circleRadius(value) / 2;
    }
  };

  //Load in GeoJSON data
  // d3.json(journeyConfigs.mapDataPath, function(geojson) {
  //   var nycd = geojson.nycd_bcd;
  //   var nynj = geojson.ny_nj_ct_refined;
  //   var statesEast = geojson.states_east;
  //   var recyBargeLinesData = geojson.recy_barge_lines;
  //   var recyDestLinesData = geojson.recy_dest_lines;
  //   var recyDestPointsData = geojson.recy_dest_points;
  //   var exportLinesData = geojson.export_international;
  //   var exportPolygonsData = geojson.export_polygons;
  //   var exportNationalLinesData = geojson.export_national_lines;
  //   var world = geojson.world;
  //   var nycPointData = geojson.nyc_point;
  d3.json('data/temp/nycd_organics_collection.geojson', function(nycdOrganicsCollection) {
  d3.json('data/temp/nyc_organics_drop_off_by_type.geojson', function(nycOrganicsDropOff) {
  d3.json('data/temp/nyc_community_gardens.geojson', function(nycCommunityGardens) {
  d3.json('data/temp/organics_destinations.geojson', function(organicsDestinations) {
  d3.json('data/temp/ny_nj_ct_refined.geojson', function(nynj) {
  d3.json('data/temp/states_east_census.geojson', function(statesEast) {
    initOrganicsCollMap(nycdOrganicsCollection, nynj);
    initOrganicsDestMap(nycdOrganicsCollection, organicsDestinations, statesEast);
    initOrganicsDropOffMap(nycOrganicsDropOff, nycdOrganicsCollection, nycCommunityGardens, nynj);
  });
  });
  });
  });
  });
  });

  function initOrganicsCollMap(nycdOrganicsCollection, states) {
    //Width and height
    var width = $('.map-organics-coll').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(nycdOrganicsCollection),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-organics-coll-svg')) {
      d3.select('#map-organics-coll-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-organics-coll')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-organics-coll-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.organicsColl.startAnimation();
      });

    $('#map-organics-coll-svg').css({
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
      .data(nycdOrganicsCollection.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .style('fill', function (d, i) {
        // if (d.properties.upcoming === 'existing') {
        //   return journeyConfigs.mapConfigs.colors.wasteCircles;
        // } else if (d.properties.upcoming === 'bldg') {
        //   return journeyConfigs.mapConfigs.colors.wasteOpacity;
        // } else if (d.properties.upcoming == '2017') {
        //   return journeyConfigs.mapConfigs.colors.complementary;
        // } else if (d.properties.upcoming == '2018') {
        //   return journeyConfigs.mapConfigs.colors.complementaryOpacity;
        // } else {
          return journeyConfigs.mapConfigs.colors.land;
        // }
      })
      // .attr('opacity', 0)
      .attr('class', 'nycd');

      var organicsLegendTitleText = ['Residential organics collection'];
      var organicsLegendLabels = ['Has curbside collection', 'Coming in 2017', 'Coming in 2018', 'Buildings can enroll'];
      var legendWidth = 20;
      var legendHeight = 20;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? 0 : 60;
      var legendStartingY = height/4;

      var organicsLegendTitle = svg.selectAll('organicsLegendTitle')
          .data(organicsLegendTitleText)
          .enter()
          .append('text')
          .attr('class', 'map-legend legend-organics')
          .attr('id', 'organics-legend-title')
          .attr('x', legendStartingX)
          .attr('y', legendStartingY - legendSpacing)
          .text(function(d, i){ return organicsLegendTitleText[i]; })
          .attr('opacity', 0);

      var organicsLegend = svg.selectAll('organicsLegend')
          .data(journeyConfigs.mapConfigs.colors.scale)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-organics')
          .attr('id', function (d, i) {
            return 'organics-legend-' + i;
          })
          .attr('opacity', 0);

      organicsLegend.append('rect')
        .attr('class', 'legend-organics')
        .attr('x', legendStartingX)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + (i*legendSpacing);
        })
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', function(d, i) { return d; });

      organicsLegend.append('text')
        .attr('class', 'legend-organics')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 13 + (i*legendSpacing);
        })
        .text(function(d, i){ return organicsLegendLabels[i]; });

    journeyConfigs.mapEl.organicsColl.animationPlayed = false;

    journeyConfigs.mapEl.organicsColl.startAnimation = function() {

      if (!journeyConfigs.mapEl.organicsColl.animationPlayed) {
        journeyConfigs.mapEl.organicsColl.animationPlayed = true;

        // clear nycd
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .style('fill', journeyConfigs.mapConfigs.colors.land)
              // .attr('opacity', 0);
          });

        svg.selectAll('.map-legend').attr('opacity', 0);
        d3.select('#organics-legend-title').attr('opacity', 1);
        d3.select('#organics-legend-0').attr('opacity', 1);

        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.upcoming === 'existing';
              })
              .transition()
              .duration(1500)
              .style('fill', function(d) {
                return journeyConfigs.mapConfigs.colors.scale[0];
              })
              // .attr('opacity', 1)
              .each('end', function() {
                d3.select('#organics-legend-1').attr('opacity', 1);
                journeyConfigs.mapEl.organicsColl.thisYear();
              });
          });
      }
    };

    journeyConfigs.mapEl.organicsColl.thisYear = function() {
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.upcoming == '2017';
              })
              .transition()
              .duration(1500)
              .style('fill', function(d) {
                return journeyConfigs.mapConfigs.colors.scale[1];
              })
              // .attr('opacity', 1)
              .each('end', function() {
                d3.select('#organics-legend-2').attr('opacity', 1);
                journeyConfigs.mapEl.organicsColl.nextYear();
              });
          });

    };

    journeyConfigs.mapEl.organicsColl.nextYear = function() {
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.upcoming == '2018';
              })
              .transition()
              .duration(1500)
              .style('fill', function(d) {
                return journeyConfigs.mapConfigs.colors.scale[2];
              })
              // .attr('opacity', 1)
              .each('end', function() {
                d3.select('#organics-legend-3').attr('opacity', 1);
                journeyConfigs.mapEl.organicsColl.bldg();
              });
          });

    };

    journeyConfigs.mapEl.organicsColl.bldg = function() {
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.upcoming === 'bldg';
              })
              .transition()
              .duration(1500)
              .style('fill', function(d) {
                return journeyConfigs.mapConfigs.colors.scale[3];
              })
              // .attr('opacity', 1)
              .each('end', function() {
                journeyConfigs.mapEl.organicsColl.out();
              });
          });

    };

    journeyConfigs.mapEl.organicsColl.out = function() {
      setTimeout(function() {
        journeyConfigs.mapEl.organicsColl.animationPlayed = false;
      }, 1600);
    };
  }

  function initOrganicsDestMap(nycd, organicsDestinations, states) {
    //Width and height
    var width = $('.map-organicsdest').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(organicsDestinations),
      scaleFactor = 0.75,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-organicsdest-svg')) {
      d3.select('#map-organicsdest-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-organicsdest')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-organicsdest-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.organicsDest.startAnimation();
      });

    $('#map-organicsdest-svg').css({
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
    var organicsDestSites = mapGroup.append('g').attr('class', 'organicsDestSites');

    usStates.selectAll('.usStates')
      .data(states.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 0.8)
      .style('fill', journeyConfigs.mapConfigs.colors.land)
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
      .style('fill', function (d, i) {
        return journeyConfigs.mapConfigs.colors.land;
      })
      .attr('class', 'nycd');

    organicsDestSites.selectAll('.organicsDestSites')
      .data(organicsDestinations.features)
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
        if (d.properties.type === 'compost') {
          return journeyConfigs.mapConfigs.colors.wasteCircles;
        } else {
          return journeyConfigs.mapConfigs.colors.complementary;
        }
      })
      .attr('class', 'organicsDestSites');

      // var destinationLegendTitleText = [''];
      var destinationLegendLabels = ['Composting facility', 'Anaerobic digester'];
      var legendWidth = 20;
      var legendHeight = 20;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? 0 : 60;
      var legendStartingY = height/4;
      var colorScale = ['#f15a29', '#1485CC'];

      // var destinationLegendTitle = svg.selectAll('destinationLegendTitle')
      //     .data(destinationLegendTitleText)
      //     .enter()
      //     .append('text')
      //     .attr('class', 'map-legend legend-destination')
      //     .attr('id', 'destination-legend-title')
      //     .attr('x', legendStartingX)
      //     .attr('y', legendStartingY - legendSpacing)
      //     .text(function(d, i){ return destinationLegendTitleText[i]; })
      //     .attr('opacity', 0);

      var destinationLegend = svg.selectAll('destinationLegend')
          .data(colorScale)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-destination')
          .attr('id', function (d, i) {
            return 'destination-legend-' + i;
          })
          .attr('opacity', 0);

      destinationLegend.append('rect')
        .attr('class', 'legend-destination')
        .attr('x', legendStartingX)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + (i*legendSpacing);
        })
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', function(d, i) { return d; });

      destinationLegend.append('text')
        .attr('class', 'legend-destination')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 13 + (i*legendSpacing);
        })
        .text(function(d, i){ return destinationLegendLabels[i]; });

    journeyConfigs.mapEl.organicsDest.animationPlayed = false;

    journeyConfigs.mapEl.organicsDest.zoom = false;
    journeyConfigs.mapEl.organicsDest.initial = false;

    journeyConfigs.mapEl.organicsDest.startAnimation = function() {

      if (!journeyConfigs.mapEl.organicsDest.animationPlayed) {
        journeyConfigs.mapEl.organicsDest.animationPlayed = true;

        // clear
        organicsDestSites.selectAll('.organicsDestSites')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });

        svg.selectAll('.map-legend').attr('opacity', 0);
        svg.selectAll('.legend-destination').attr('opacity', 0);

        organicsDestSites.selectAll('.organicsDestSites')
          .each(function(d, i) {
            d3.select(this)
              .transition()
              .duration(1500)
              .attr('r', function (d,i) {
                if (isMobile) {
                  return 3;
                } else {
                  return 5;
                }
              })
              .each('end', function() {
                journeyConfigs.mapEl.organicsDest.nycLabels();
                journeyConfigs.mapEl.organicsDest.initial = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.organicsDest.nycLabels = function() {
      if (journeyConfigs.mapEl.organicsDest.initial === false) {
            svg.selectAll('.legend-destination')
              .transition()
              .duration(1500)
              .attr('opacity', 1);

            svg.selectAll('text-labels')
                .data(organicsDestinations.features)
                .enter()
                .append('text')
                .attr('x', function(d){
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
                })
                .attr('y', function(d){
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
                })
                .attr('transform', function(d) {
                  if (d.properties.id == 3) {
                    return 'translate(-10,0)';
                  } else {
                    return 'translate(10,0)';
                  }
                })
                .attr('text-anchor', function (d, i) {
                  if (d.properties.id == 3) {
                    return 'end';
                  } else {
                    return 'beginning'
                  }
                })
                .attr('alignment-baseline', 'middle')
                .attr('class', 'legend-organics map-legend')
                // .text('off Sandy Hook');
                .text(function (d, i) {
                  return d.properties.name;
                });

            svg.selectAll('text-labels-below')
                .data(organicsDestinations.features)
                .enter()
                .append('text')
                .attr('x', function(d){
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
                })
                .attr('y', function(d){
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
                })
                .attr('transform', function(d) {
                  if (d.properties.id == 3) {
                    return 'translate(-10,15)';
                  } else {
                    return 'translate(10,15)';
                  }
                })
                .attr('text-anchor', function (d, i) {
                  if (d.properties.id == 3) {
                    return 'end';
                  } else {
                    return 'beginning'
                  }
                })
                .attr('alignment-baseline', 'middle')
                .attr('class', 'legend-organics map-legend')
                // .text('off Sandy Hook');
                .text(function (d, i) {
                  if (d.properties.long_name) {
                    return d.properties.long_name;
                  }
                });

                journeyConfigs.mapEl.organicsDest.out();
                journeyConfigs.mapEl.organicsDest.zoom = true;
              }
    };

    journeyConfigs.mapEl.organicsDest.out = function() {
      if (journeyConfigs.mapEl.organicsDest.zoom === false) {

      setTimeout(function() {
        journeyConfigs.mapEl.organicsDest.animationPlayed = false;
        journeyConfigs.mapEl.organicsDest.initial = false;
        journeyConfigs.mapEl.organicsDest.zoom = false;
      }, 1600);
    }
  }



  }

  function initOrganicsDropOffMap(nycOrganicsDropOff, nycd, nycCommunityGardens, states) {
    //Width and height
    var width = $('.map-dropoff').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(nycOrganicsDropOff),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-dropoff-svg')) {
      d3.select('#map-dropoff-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-dropoff')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-dropoff-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.dropOff.startAnimation();
      });

    $('#map-dropoff-svg').css({
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
    var communityGardens = mapGroup.append('g').attr('class', 'communityGardens');
    var dropOffSites = mapGroup.append('g').attr('class', 'dropOffSites');

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
      .data(nycd.features)
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

    dropOffSites.selectAll('.dropOffSites')
      .data(nycOrganicsDropOff.features)
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
      .style('fill', function (d,i) {
        if (d.properties.type === 'market') {
          return journeyConfigs.mapConfigs.colors.wasteCircles;
        } else {
          return journeyConfigs.mapConfigs.colors.complementary;
        }
      })
      .attr('class', 'dropOffSites');

    communityGardens.selectAll('.communityGardens')
      .data(nycCommunityGardens.features)
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
      .style('fill', journeyConfigs.mapConfigs.colors.complementaryOpacity)
      .attr('class', 'communityGardens');

      var dropOffLegendTitleText = ['Organics drop-off sites'];
      var dropOffLegendLabels = ['Markets', 'Other'];
      var legendWidth = 20;
      var legendHeight = 20;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? 0 : 60;
      var legendStartingY = height/2;

      var dropOffLegendTitle = svg.selectAll('dropOffLegendTitle')
          .data(dropOffLegendTitleText)
          .enter()
          .append('text')
          .attr('class', 'map-legend legend-dropoff')
          .attr('id', 'dropoff-legend-title')
          .attr('x', legendStartingX)
          .attr('y', legendStartingY - legendSpacing)
          .text(function(d, i){ return dropOffLegendTitleText[i]; })
          .attr('opacity', 0);

      var dropOffLegend = svg.selectAll('dropOffLegend')
          .data(journeyConfigs.mapConfigs.colors.scaleDropOff)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-dropoff')
          .attr('id', function (d, i) {
            return 'dropoff-legend-' + i;
          })
          .attr('opacity', 0);

      dropOffLegend.append('rect')
        .attr('class', 'legend-dropoff')
        .attr('x', legendStartingX)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + (i*legendSpacing);
        })
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', function(d, i) { return d; });

      dropOffLegend.append('text')
        .attr('class', 'legend-dropoff')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 13 + (i*legendSpacing);
        })
        .text(function(d, i){ return dropOffLegendLabels[i]; });

    journeyConfigs.mapEl.dropOff.animationPlayed = false;

    journeyConfigs.mapEl.dropOff.gardensPlayed = false;

    journeyConfigs.mapEl.dropOff.startAnimation = function() {

      if (!journeyConfigs.mapEl.dropOff.animationPlayed) {
        journeyConfigs.mapEl.dropOff.animationPlayed = true;

        // clear
        dropOffSites.selectAll('.dropOffSites')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });
        communityGardens.selectAll('.communityGardens')
          .each(function(d, i) {
            d3.select(this)
              .attr('r', 0);
          });

        svg.selectAll('.map-legend').attr('opacity', 0);
        // d3.select('#dropoff-legend-title').attr('opacity', 1);
        // d3.select('#dropoff-legend-0').attr('opacity', 1);

        dropOffSites.selectAll('.dropOffSites')
          .each(function(d, i) {
            d3.select(this)
              .transition()
              .duration(1500)
              .attr('r', 3)
              .each('end', function() {
                d3.select('#dropoff-legend-0').attr('opacity', 1);
                d3.select('#dropoff-legend-title').attr('opacity', 1);
                d3.select('#dropoff-legend-1').attr('opacity', 1);
                journeyConfigs.mapEl.dropOff.out();
                journeyConfigs.mapEl.dropOff.gardensPlayed = true;
              });
          });
      }
    };

    journeyConfigs.mapEl.dropOff.gardens = function() {
      if (journeyConfigs.mapEl.dropOff.gardensPlayed === false) {
            communityGardens.selectAll('.communityGardens')
              .each(function(d, i) {
                d3.select(this)
                  .transition()
                  .duration(1500)
                  .attr('r', 3)
                  .each('end', function() {
                    d3.select('#dropoff-legend-title').attr('opacity', 1);
                    d3.select('#dropoff-legend-1').attr('opacity', 1);
                    journeyConfigs.mapEl.dropOff.out();
                  });
              });
      }
    };

    journeyConfigs.mapEl.dropOff.out = function() {
      setTimeout(function() {
        journeyConfigs.mapEl.dropOff.animationPlayed = false;
        journeyConfigs.mapEl.dropOff.gardensPlayed = false;
      }, 1600);
    };

  }

}
