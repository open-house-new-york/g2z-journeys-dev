function initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth) {

  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29',
    wasteOpacity: '#e3a793',
    complementary: '#1485CC',
    complementaryOpacity: '#8bb8d5'
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
  d3.json(journeyConfigs.mapDataPath, function(geojson) {
    var nycd = geojson.nycd_bcd;
    var nynj = geojson.ny_nj_ct_refined;
    var statesEast = geojson.states_east;
    var recyBargeLinesData = geojson.recy_barge_lines;
    var recyDestLinesData = geojson.recy_dest_lines;
    var recyDestPointsData = geojson.recy_dest_points;
    var exportLinesData = geojson.export_international;
    var exportPolygonsData = geojson.export_polygons;
    var exportNationalLinesData = geojson.export_national_lines;
    var world = geojson.world;
    var nycPointData = geojson.nyc_point;

    initVisyMap(recyBargeLinesData, recyDestLinesData, recyDestPointsData, nycd, nynj);
    initSimsMap(recyBargeLinesData, recyDestLinesData, recyDestPointsData, nycd, nynj);
    initRecyExportMap(exportLinesData, exportNationalLinesData, exportPolygonsData, nycPointData, nycd, world);
});

  function initVisyMap(recyBargeLinesData, recyDestLinesData, recyDestPointsData, nycd, states) {
    //Width and height
    var width = $('.map-visy').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(recyDestLinesData),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-visy-svg')) {
      d3.select('#map-visy-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-visy')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-visy-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.visy.startAnimation();
      });

    $('#map-visy-svg').css({
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
    var commDist = mapGroup.append('g').attr('class', 'commDist');
    var truckLines = mapGroup.append('g').attr('class', 'truckLines');
    var bargeLines = mapGroup.append('g').attr('class', 'bargeLines');
    var recyDestPoints = mapGroup.append('g').attr('class', 'recyDestPoints');

    var cdServedVisyMan = [];
    var cdServedVisySi = [];
    for (var i = 0; i < recyDestLinesData.features.length; i++) {
      if (recyDestLinesData.features[i].properties.disposal === 'Visy 59th St') {
        cdServedVisyMan.push(recyDestLinesData.features[i].properties.d_id);
      } else if (recyDestLinesData.features[i].properties.disposal === 'Visy') {
        cdServedVisySi.push(recyDestLinesData.features[i].properties.d_id);
      }
    }

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
      .style('fill', journeyConfigs.mapConfigs.colors.land)
      .attr('class', 'nycd');

    truckLines.selectAll('.truckLines')
      .data(recyDestLinesData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
        return 2;
      })
      .style('fill', 'none')
      .attr('stroke-dasharray', function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength());
      })
      .attr('stroke-dashoffset', function(d) {
        return this.getTotalLength();
      })
      .attr('class', 'truckLines');

    bargeLines.selectAll('.bargeLines')
      .data(recyBargeLinesData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
        return 2;
      })
      .style('fill', 'none')
      .attr('stroke-dasharray', function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength());
      })
      .attr('stroke-dashoffset', function(d) {
        return this.getTotalLength();
      })
      .attr('class', 'bargeLines');

    recyDestPoints.selectAll('.recyDestPoints')
      .data(recyDestPointsData.features)
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
      .attr('class', 'recyDestPoints');

    journeyConfigs.mapEl.visy.animationPlayed = false;

    journeyConfigs.mapEl.visy.startAnimation = function() {

      if (!journeyConfigs.mapEl.visy.animationPlayed) {
        journeyConfigs.mapEl.visy.animationPlayed = true;

        //clear circles
        recyDestPoints.selectAll('.recyDestPoints')
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

        svg.selectAll('.map-legend').remove();

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Visy 59th St';
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.visy.visyManCircle();
              });
          });
      }
    };

    journeyConfigs.mapEl.visy.visyManCircle = function() {
      recyDestPoints.selectAll('.recyDestPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy 59th St';
            })
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              journeyConfigs.mapEl.visy.visyManLinesOut();
            });
        });

    };

    journeyConfigs.mapEl.visy.visyManLinesOut = function() {
      svg.selectAll('text-visy-man')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Visy 59th St';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(-15,0)'; })
          .attr('class', 'visy-man-legend map-legend')
          .attr('text-anchor', 'end')
          .text('Marine transfer station');
      svg.selectAll('text-visy-man-below')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Visy 59th St';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(-15,15)'; })
          .attr('class', 'visy-man-legend map-legend')
          .attr('text-anchor', 'end')
          .text('at 59th st');

      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
              var inArray = $.inArray(bcd, cdServedVisyMan) >= 0;
              if (inArray) {
                return true;
              } else {
                return false;
              }
            })
            .transition()
            .duration(1500)
            .style('fill', journeyConfigs.mapConfigs.colors.wasteOpacity)
            .attr('opacity', 1);
        });

      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy 59th St';
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {
              journeyConfigs.mapEl.visy.visyBargeIn();
            });
        });

    };

    journeyConfigs.mapEl.visy.visyBargeIn = function() {
      bargeLines.selectAll('.bargeLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.id === 1;
            })
            .attr('stroke-dashoffset', function(d) {
              return this.getTotalLength();
            })
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', 0)
            .each('end', function() {
              journeyConfigs.mapEl.visy.visySiCircle();
            });
        });
    };

    journeyConfigs.mapEl.visy.visySiCircle = function() {
      recyDestPoints.selectAll('.recyDestPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy 59th St';
            })
            .transition()
            .duration(500)
            .attr('r', 0);
        });

        svg.selectAll('.visy-man-legend')//.remove();
          .attr('opacity', 1)
          .transition()
          .duration(1500)
          .attr('opacity', 0);


      recyDestPoints.selectAll('.recyDestPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy';
            })
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              journeyConfigs.mapEl.visy.visyBargeOut();
            });
        });
    };

    journeyConfigs.mapEl.visy.visyBargeOut = function() {
      svg.selectAll('text-visy-si')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Visy';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(15,0)'; })
          .attr('class', 'visy-si-legend map-legend')
          // .attr('text-anchor', 'end')
          .attr('alignment-baseline', 'middle')
          .text('Pratt paper mill');

      bargeLines.selectAll('.bargeLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.id === 1;
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {
              journeyConfigs.mapEl.visy.visyTrucksIn();
            });
        });
    };

    journeyConfigs.mapEl.visy.visyTrucksIn = function() {
      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy';
            })
            .attr('stroke-dashoffset', function(d) {
              return this.getTotalLength();
            })
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', 0)
            .each('end', function() {
              journeyConfigs.mapEl.visy.visyTrucksOut();
            });
        });
    };

    journeyConfigs.mapEl.visy.visyTrucksOut = function() {
      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
              var inArray = $.inArray(bcd, cdServedVisySi) >= 0;
              if (inArray) {
                return true;
              } else {
                return false;
              }
            })
            .transition()
            .duration(1500)
            .style('fill', journeyConfigs.mapConfigs.colors.wasteOpacity)
            .attr('opacity', 1);
        });

      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Visy';
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {
              journeyConfigs.mapEl.visy.servedCdSiBklyn();
            });
        });



    };

    journeyConfigs.mapEl.visy.servedCdSiBklyn = function() {
      setTimeout(function() {
        journeyConfigs.mapEl.visy.animationPlayed = false;
      }, 1600);
    };
  }

    function initSimsMap(recyBargeLinesData, recyDestLinesData, recyDestPointsData, nycd, states) {
      //Width and height
      var width = $('.map-sims').width() * 0.99;
      var height = viewportHeight;

      var projection = d3.geo.albers()
        .scale(1)
        .translate([0, 0]);
      var path = d3.geo.path()
        .projection(projection);
      var b = path.bounds(recyDestLinesData),
        scaleFactor = 0.8,
        s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection
        .scale(s)
        .translate(t);

      // Clear SVG if there is one (on resize)
      if (d3.select('#map-sims-svg')) {
        d3.select('#map-sims-svg').remove();
      }
      //Create SVG element
      var svg = d3.select('.map-sims')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'map-sims-svg')
        .on('click', function(d) {
          journeyConfigs.mapEl.sims.startAnimation();
        });

      $('#map-sims-svg').css({
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
      var commDist = mapGroup.append('g').attr('class', 'commDist');
      var truckLines = mapGroup.append('g').attr('class', 'truckLines');
      var bargeLines = mapGroup.append('g').attr('class', 'bargeLines');
      var recyDestPoints = mapGroup.append('g').attr('class', 'recyDestPoints');

      var cdServedJersey = [];
      var cdServedSunsetPark = [];
      var cdServedBargeTs = [];
      for (var i = 0; i < recyDestLinesData.features.length; i++) {
        if (recyDestLinesData.features[i].properties.disposal === 'Sims - Jersey') {
          cdServedJersey.push(recyDestLinesData.features[i].properties.d_id);
        } else if (recyDestLinesData.features[i].properties.disposal === 'Sims - Brooklyn') {
          cdServedSunsetPark.push(recyDestLinesData.features[i].properties.d_id);
        } else if (recyDestLinesData.features[i].properties.disposal === 'Sims - LIC' || recyDestLinesData.features[i].properties.disposal === 'Sims - Bronx') {
          cdServedBargeTs.push(recyDestLinesData.features[i].properties.d_id);
        }
      }

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
        .style('fill', journeyConfigs.mapConfigs.colors.land)
        .attr('class', 'nycd');

      truckLines.selectAll('.truckLines')
        .data(recyDestLinesData.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
        .attr('stroke-width', function(d) {
          // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
          return 2;
        })
        .style('fill', 'none')
        .attr('stroke-dasharray', function(d) {
          return (this.getTotalLength() + ' ' + this.getTotalLength());
        })
        .attr('stroke-dashoffset', function(d) {
          return this.getTotalLength();
        })
        .attr('class', 'truckLines');

      bargeLines.selectAll('.bargeLines')
        .data(recyBargeLinesData.features)
        .enter()
        .append('path')
        .attr({
          'd': path
        })
        .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
        .attr('stroke-width', function(d) {
          // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
          return 2;
        })
        .style('fill', 'none')
        .attr('stroke-dasharray', function(d) {
          return (this.getTotalLength() + ' ' + this.getTotalLength());
        })
        .attr('stroke-dashoffset', function(d) {
          return this.getTotalLength();
        })
        .attr('class', 'bargeLines');

      recyDestPoints.selectAll('.recyDestPoints')
        .data(recyDestPointsData.features)
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
        .attr('class', 'recyDestPoints');

      journeyConfigs.mapEl.sims.animationPlayed = false;

      journeyConfigs.mapEl.sims.startAnimation = function() {

        if (!journeyConfigs.mapEl.sims.animationPlayed) {
          journeyConfigs.mapEl.sims.animationPlayed = true;

          //clear circles
          recyDestPoints.selectAll('.recyDestPoints')
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

        svg.selectAll('.map-legend').remove();

          truckLines.selectAll('.truckLines')
            .each(function(d, i) {
              d3.select(this)
                .filter(function(d) {
                  return d.properties.disposal === 'Sims - Jersey';
                })
                .attr('stroke-dashoffset', function(d) {
                  return this.getTotalLength();
                })
                .style('stroke', journeyConfigs.mapConfigs.colors.complementary)
                .transition()
                .duration(1500)
                .attr('stroke-dashoffset', 0)
                .each('end', function() {
                  journeyConfigs.mapEl.sims.jerseyCircle();
                });
            });
        }
      };

      journeyConfigs.mapEl.sims.jerseyCircle = function() {
        recyDestPoints.selectAll('.recyDestPoints')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - Jersey';
              })
              .attr('r', 0)
              .style('fill', journeyConfigs.mapConfigs.colors.complementary)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.jerseyLinesOut();
              });
          });
      };

      journeyConfigs.mapEl.sims.jerseyLinesOut = function() {
      svg.selectAll('text-sims-jersey')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Sims - Jersey';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(-15,0)'; })
          .attr('class', 'sims-jersey-legend map-legend')
          .attr('text-anchor', 'end')
          .text('Sims – Jersey City');
      svg.selectAll('text-sims-jersey-below')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Sims - Jersey';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(-15,15)'; })
          .attr('class', 'sims-jersey-legend map-legend')
          .attr('text-anchor', 'end')
          .text('Sorting facility');

        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
                var inArray = $.inArray(bcd, cdServedJersey) >= 0;
                if (inArray) {
                  return true;
                } else {
                  return false;
                }
              })
              .transition()
              .duration(1500)
              .style('fill', journeyConfigs.mapConfigs.colors.complementaryOpacity)
              .attr('opacity', 1);
          });

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - Jersey';
              })
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.truckToBarge();
              });
          });
      };

      journeyConfigs.mapEl.sims.truckToBarge = function() {
        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - LIC' || d.properties.disposal === 'Sims - Bronx';
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.sims.bargeTsCircle();
              });
          });
      };

      journeyConfigs.mapEl.sims.bargeTsCircle = function() {
        recyDestPoints.selectAll('.recyDestPoints')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - LIC' || d.properties.disposal === 'Sims - Bronx';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.truckToBargeOut();
              });
          });
      };

      journeyConfigs.mapEl.sims.truckToBargeOut = function() {
      svg.selectAll('text-mts')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Sims - LIC' || d.properties.disposal === 'Sims - Bronx';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(15,0)'; })
          .attr('class', 'mts-legend map-legend')
          // .attr('text-anchor', 'end')
          .text('Marine transfer station');

        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
                var inArray = $.inArray(bcd, cdServedBargeTs) >= 0;
                if (inArray) {
                  return true;
                } else {
                  return false;
                }
              })
              .transition()
              .duration(1500)
              .style('fill', journeyConfigs.mapConfigs.colors.wasteOpacity)
              .attr('opacity', 1);
          });

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - LIC' || d.properties.disposal === 'Sims - Bronx';
              })
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.bargeIn();
              });
          });
      };

      journeyConfigs.mapEl.sims.bargeIn = function() {
        bargeLines.selectAll('.bargeLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.id !== 1;
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.sims.sunsetParkCircle();
              });
          });
      };

      journeyConfigs.mapEl.sims.sunsetParkCircle = function() {
        recyDestPoints.selectAll('.recyDestPoints')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - LIC' || d.properties.disposal === 'Sims - Bronx';
              })
              .transition()
              .duration(1500)
              .attr('r', 0);
          });

        recyDestPoints.selectAll('.recyDestPoints')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - Brooklyn';
              })
              .attr('r', 0)
              .transition()
              .duration(1500)
              .attr('r', function(d) {
                return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.bargeOut();
              });
          });
      };

      journeyConfigs.mapEl.sims.bargeOut = function() {
        svg.selectAll('.mts-legend')
          .attr('opacity', 1)
          .transition()
          .duration(1500)
          .attr('opacity', 0);

      svg.selectAll('text-sims-brooklyn')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Sims - Brooklyn';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(15,0)'; })
          .attr('class', 'sims-brooklyn-legend map-legend')
          // .attr('text-anchor', 'end')
          .text('Sims – Brooklyn');
      svg.selectAll('text-sims-brooklyn-below')
          .data(recyDestPointsData.features)
          .enter()
          .append('text')
          .filter(function(d) {
            return d.properties.disposal === 'Sims - Brooklyn';
          })
          .attr('x', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr('y', function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr('transform', function(d) { return 'translate(15,15)'; })
          .attr('class', 'sims-brooklyn-legend map-legend')
          // .attr('text-anchor', 'end')
          .text('Sorting facility');

        bargeLines.selectAll('.bargeLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.id !== 1;
              })
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.sunsetParkTrucksIn();
              });
          });
      };

      journeyConfigs.mapEl.sims.sunsetParkTrucksIn = function() {
        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - Brooklyn';
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.sims.sunsetParkTrucksOut();
              });
          });
      };

      journeyConfigs.mapEl.sims.sunsetParkTrucksOut = function() {
        commDist.selectAll('.nycd')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
                var inArray = $.inArray(bcd, cdServedSunsetPark) >= 0;
                if (inArray) {
                  return true;
                } else {
                  return false;
                }
              })
              .transition()
              .duration(1500)
              .style('fill', journeyConfigs.mapConfigs.colors.wasteOpacity)
              .attr('opacity', 1);
          });

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Sims - Brooklyn';
              })
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                journeyConfigs.mapEl.sims.servedSunsetPark();
              });
          });



      };

      journeyConfigs.mapEl.sims.servedSunsetPark = function() {
        setTimeout(function() {
          journeyConfigs.mapEl.sims.animationPlayed = false;
        }, 1600);
      };

    }
  function initRecyExportMap(exportLinesData, exportNationalLinesData, exportPolygonsData, nycPointData, nycd, world) {
    //Width and height
    var width = $('.map-recyexport').width() * 0.99;
    var height = viewportHeight;

    // var projection = d3.geo.stereographic()
    //   .scale(1)
    //   .translate([0, 0]);
    // var path = d3.geo.path()
    //   .projection(projection);
    // var b = path.bounds(world),
    //   scaleFactor = 0.8,
    //   s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    //   t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    // projection
    //   .scale(s)
    //   .translate(t);

    // var scale = isMobile ? 210 : 375;
    var scale = (viewportHeight / 1.85);

    var projection = d3.geo.stereographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([0, -45])
        // .clipAngle(180 - 1e-4)
        // .clipExtent([[0, 0], [width, height]])
        .precision(0.1);

    var path = d3.geo.path()
      .projection(projection);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-recyexport-svg')) {
      d3.select('#map-recyexport-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-recyexport')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-recyexport-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.recyexport.startAnimation();
      });

    $('#map-recyexport-svg').css({
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
    var worldLand = mapGroup.append('g').attr('class', 'worldLand');
    var exportNationalLines = mapGroup.append('g').attr('class', 'exportNationalLines');
    var exportLines = mapGroup.append('g').attr('class', 'exportLines');
    var exportPolygons = mapGroup.append('g').attr('class', 'exportPolygons');
    var nycPoint = mapGroup.append('g').attr('class', 'nycPoint');
    var exportPolygonsLabels = mapGroup.append('g').attr('class', 'exportPolygonsLabels');

    nycPoint.selectAll('.nycPoint')
      .data(nycPointData.features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      })
      .attr('r', 2)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('class', 'nycPoint');

    worldLand.selectAll('.worldLand')
      .data(world.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land)
      .attr('class', 'worldLand');

    // commDist.selectAll('.nycd')
    //   .data(nycd.features)
    //   .enter()
    //   .append('path')
    //   .attr({
    //     'd': path
    //   })
    //   .style('stroke', 'black')
    //   .style('stroke-width', 0)
    //   .style('fill', journeyConfigs.mapConfigs.colors.land)
    //   .attr('class', 'nycd');

    exportPolygons.selectAll('.exportPolygons')
      .data(exportPolygonsData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 0.75)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('opacity', 0)
      .attr('class', 'exportPolygons');

  exportPolygonsLabels.selectAll('.exportPolygonsLabels')
      .data(exportPolygonsData.features)
    .enter().append('text')
      .attr('class', 'exportPolygonsLabels map-label')
      .attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
      .style('font-size', '0.75em')
      // .attr('dy', function (d, i) {
      //   if (d.properties.name.length === 2) {
      //     var space = 0.35 + (i * 0.2);
      //     return space + 'em';
      //   } else {
      //     return '0.35em';
      //   }
      // })
      // .attr('dx', function (d, i) {
      //   if (d.properties.name === 'India') {
      //     return '-1.35em';
      //   }
      // })
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .text(function(d) { return d.properties.name; });

    exportNationalLines.selectAll('.exportNationalLines')
      .data(exportNationalLinesData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
        return 2;
      })
      .style('fill', 'none')
      .attr('stroke-dasharray', function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength());
      })
      .attr('stroke-dashoffset', function(d) {
        return this.getTotalLength();
      })
      .attr('class', 'exportNationalLines');

    exportLines.selectAll('.exportLines')
      .data(exportLinesData.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        // return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
        return 2;
      })
      .style('fill', 'none')
      .attr('stroke-dasharray', function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength());
      })
      .attr('stroke-dashoffset', function(d) {
        return this.getTotalLength();
      })
      .attr('class', 'exportLines');

    journeyConfigs.mapEl.recyexport.animationPlayed = false;

    journeyConfigs.mapEl.recyexport.startAnimation = function() {

      if (!journeyConfigs.mapEl.recyexport.animationPlayed) {
        journeyConfigs.mapEl.recyexport.animationPlayed = true;

        // //clear circles
        // recyDestPoints.selectAll('.recyDestPoints')
        //   .each(function(d, i) {
        //     d3.select(this)
        //       .attr('r', 0);
        //   });
        //

        exportPolygons.selectAll('.exportPolygons')
          .each(function(d, i) {
            d3.select(this)
              .attr('opacity', 0);
          });
        exportPolygonsLabels.selectAll('.exportPolygonsLabels')
          .each(function(d, i) {
            d3.select(this)
              .attr('opacity', 0);
          });

        exportNationalLines.selectAll('.exportNationalLines')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.recyexport.nationalPolygons();
              });
          });
      }
    };

    journeyConfigs.mapEl.recyexport.nationalPolygons = function () {
        exportPolygons.selectAll('.exportPolygons')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.name !== 'India' && d.properties.name !== 'China';
              })
              .transition()
              .duration(1500)
              .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
              .attr('opacity', 0.4);
          });
        exportPolygonsLabels.selectAll('.exportPolygonsLabels')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.name !== 'India' && d.properties.name !== 'China';
              })
              .transition()
              .duration(1500)
              .attr('opacity', 1);
          });

        exportNationalLines.selectAll('.exportNationalLines')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                journeyConfigs.mapEl.recyexport.internationalLines();
              });
          });
    };

    journeyConfigs.mapEl.recyexport.internationalLines = function () {
        exportLines.selectAll('.exportLines')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(3000)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.recyexport.internationalPolygons();
              });
          });
    };

    journeyConfigs.mapEl.recyexport.internationalPolygons = function () {
        exportPolygons.selectAll('.exportPolygons')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.name === 'India' || d.properties.name === 'China';
              })
              .transition()
              .duration(1500)
              .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
              .attr('opacity', 0.4);
          });
        exportPolygonsLabels.selectAll('.exportPolygonsLabels')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.name === 'India' || d.properties.name === 'China';
              })
              .transition()
              .duration(1500)
              .attr('opacity', 1);
          });

        exportLines.selectAll('.exportLines')
          .each(function(d, i) {
            d3.select(this)
              .attr('stroke-dashoffset', 0)
              .transition()
              .duration(3000)
              .attr('stroke-dashoffset', function(d) {
                return -this.getTotalLength();
              })
              .each('end', function() {
                // journeyConfigs.mapEl.recyexport.internationalLines();
              });
          });

        setTimeout(function() {
          journeyConfigs.mapEl.recyexport.animationPlayed = false;
        }, 3000);
    };

  }

  }
