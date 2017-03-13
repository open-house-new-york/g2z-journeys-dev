function initMaps(viewportWidth, viewportHeight, horizontalViewport, isMobile, panelWidthPercent, panelHeightPercent, panelWrapperMargin, topVisPadding, footerPadding, textBlockPadding, mapSidePadding, maximumTextPanelWidth, panelHeight, textPanelWidth) {

  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29'
  };
  journeyConfigs.mapConfigs.scales = {
    circleRadius: function(value) {
      return Math.sqrt(value / 3.14) * 0.025;
    },
    lineWidth: function(value) {
      return journeyConfigs.mapConfigs.scales.circleRadius(value) / 2;
    }
  };

  //Load in GeoJSON data
  // d3.json(journeyConfigs.mapDataPath, function(geojson) {
  //   var recyDestLinesData = geojson.od_lines_refuse;
  //   var destPointsData = geojson.dest_points_refuse;
  //   var nycd = geojson.nycd;
  //   var exportLines = geojson.dest_lines;
  //   var exportPoints = geojson.export_points;
  //   var states = geojson.states_east;
  //   var nynj = geojson.ny_nj_ct;
d3.json('data/temp/nycd_bcd.geojson', function(nycd) {
d3.json('data/temp/ny_nj_ct.geojson', function(nynj) {
d3.json('data/temp/states_east.geojson', function(statesEast) {
d3.json('data/temp/recy_barge_lines.geojson', function(recyBargeLinesData) {
d3.json('data/temp/recy_dest_lines.geojson', function(recyDestLinesData) {
d3.json('data/temp/recy_dest_points.geojson', function(recyDestPointsData) {
    initVisyMap(recyBargeLinesData, recyDestLinesData, recyDestPointsData, nycd, nynj);
    // initExportMap(exportLines, exportPoints, states);
});
});
});
});
});
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
      .on('click', function (d) {
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

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter( function (d) {
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
            .filter( function (d) {
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
      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter( function (d) {
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

      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
          .filter( function (d) {
            var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : "na";
            var inArray = $.inArray(bcd, cdServedVisyMan) >= 0;
            if (inArray) {
              return true;
            } else {
              return false;
            }
          })
          .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
          .attr('opacity', 0.4);
      });
    };

    journeyConfigs.mapEl.visy.visyBargeIn = function() {
      bargeLines.selectAll('.bargeLines')
        .each(function(d, i) {
          d3.select(this)
            .filter( function (d) {
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
            .filter( function (d) {
               return d.properties.disposal === 'Visy 59th St';
            })
            .transition()
            .duration(500)
            .attr('r', 0);
        });

      recyDestPoints.selectAll('.recyDestPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter( function (d) {
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
      bargeLines.selectAll('.bargeLines')
        .each(function(d, i) {
          d3.select(this)
            .filter( function (d) {
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
            .filter( function (d) {
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
      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter( function (d) {
               return d.properties.disposal === 'Visy';
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {

            });
        });

      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
          .filter( function (d) {
            var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : "na";
            var inArray = $.inArray(bcd, cdServedVisySi) >= 0;
            if (inArray) {
              return true;
            } else {
              return false;
            }
          })
          .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
          .attr('opacity', 0.4);
      });

      setTimeout(function () {
        journeyConfigs.mapEl.visy.animationPlayed = false;
      }, 1600);

    };
  }
}
