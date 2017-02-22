function initMaps() {

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
  d3.json(journeyConfigs.mapDataPath, function(geojson) {
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
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        if (d.properties.sent_fac_t === 'Landfill') {
          return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.sent_tons_);
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
      // return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.sent_tons_);
      // })
      .attr('r', 0)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
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

    journeyConfigs.mapEl.wasteExport.startAnimation = function() {

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
              journeyConfigs.mapEl.wasteExport.transitionCircles();
            });
        });
    };

    journeyConfigs.mapEl.wasteExport.transitionCircles = function() {
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
              journeyConfigs.mapEl.wasteExport.linesOut();
            });
        });
    };

    journeyConfigs.mapEl.wasteExport.linesOut = function() {
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

    linePaths.selectAll('.lineConnect')
      .data(odLines.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', function(d) {
        return journeyConfigs.mapConfigs.scales.lineWidth(d.properties.j_tot_rec);
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
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('class', 'destPointsRefuse');
    // .transition()
    //   .duration(3000)
    //   .attr("r", function(d) {
    //     return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
    //   });

    journeyConfigs.mapEl.nyc.startAnimation = function() {
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
              journeyConfigs.mapEl.nyc.transitionCircles();
            });
        });
    };

    journeyConfigs.mapEl.nyc.transitionCircles = function() {
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
              return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              // if (i === 1) {
              // $("#text-2-0").append("<p class='animation-text'>These are the transfer stations used by the City in the NYC area.</p>");
              // }
              journeyConfigs.mapEl.nyc.linesOut();
            });
        });
    };

    journeyConfigs.mapEl.nyc.linesOut = function() {
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
