function initMaps() {

  //color configs
  journeyConfigs.mapConfigs.colors = {
    background: '#edf0ff',
    land: '#d9d9d9',
    wasteLines: '#f15a29',
    wasteCircles: '#f15a29',
    scale: ['#FFBDA6', '#FF885E', '#f15a29', '#992D09']
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
  //   var nycd = geojson.nycd;
  //   var dumpingLines = geojson.dest_lines;
  //   var dumpingWharves = geojson.export_points;
  //   var states = geojson.states_east;
  //   var nynj = geojson.ny_nj_ct;
  //
  //   initOceanDumpingMap(dumpingLines, dumpingWharves, dumpingLocation, states);
  // });
  d3.json('data/nycd.geojson', function(nycd) {
  d3.json('data/ny_nj_ct.geojson', function(nynj) {
  d3.json('data/states_east.geojson', function(states) {
  d3.json('data/dumping_lines.geojson', function(dumpingLines) {
  d3.json('data/dumping_wharves.geojson', function(dumpingWharves) {
  d3.json('data/dumping_location.geojson', function(dumpingLocation) {
  d3.json('data/landfills_nyc_areas.geojson', function(landfillsNycAreas) {
  d3.json('data/landfills_nyc_points.geojson', function(landfillsNycPoints) {
    initOceanDumpingMap(dumpingLines, dumpingWharves, dumpingLocation, nynj, nycd);
    initLandfillsNycMap(landfillsNycAreas, landfillsNycPoints, nynj, nycd);
  });
  });
  });
  });
  });
  });
  });
  });

  function initOceanDumpingMap(dumpingLines, dumpingWharves, dumpingLocation, states, nycd) {
    var mapClass = '.map-' + journeyConfigs.mapEl.dumpingWharves.slug;
    var mapSvgId = '#map-' + journeyConfigs.mapEl.dumpingWharves.slug + '-svg';
    var width = $(mapClass).width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);

    var b = path.bounds(dumpingLines),
      scaleFactor = 0.65,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select(mapSvgId)) {
      d3.select(mapSvgId).remove();
    }

    //Create SVG element
    var svg = d3.select(mapClass)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', mapSvgId.substring(1, mapSvgId.length));

    $(mapSvgId).css({
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

    // config
    var usStates = mapGroup.append('g').attr('class', 'usStates');
    var nycdShape = mapGroup.append('g').attr('class', 'nycd');
    var dumpingLinesPaths = mapGroup.append('g').attr('class', 'dumpingLines');
    var dumpingWharvesPoints = mapGroup.append('g').attr('class', 'dumpingWharves');
    var dumpingLocationPoints = mapGroup.append('g').attr('class', 'dumpingLocation');

    nycdShape.selectAll('.nycd')
      .data(nycd.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.land)
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land);

    usStates.selectAll('.usStates')
      .data(states.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land);

    dumpingLinesPaths.selectAll('.dumpingLines')
      .data(dumpingLines.features)
      .enter()
      .append('path')
      .attr({
        'd': path,
        'stroke-dasharray': '0 5000'
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.wasteLines)
      .attr('stroke-width', 1.5)
      .style('fill', 'none')
      .attr('stroke-dasharray', function(d) {
        return (this.getTotalLength() + ' ' + this.getTotalLength());
      })
      .attr('stroke-dashoffset', function(d) {
        return this.getTotalLength();
      })
      .attr('class', 'dumpingLines');

    dumpingWharvesPoints.selectAll('.dumpingWharves')
      .data(dumpingWharves.features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      })
      .attr('r', 3)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('class', 'dumpingWharves');

    dumpingLocationPoints.selectAll('.dumpingLocation')
      .data(dumpingLocation.features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      })
      .attr('r', 0)
      .attr('opacity', 0.7)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
      .attr('class', 'dumpingLocation');

    journeyConfigs.mapEl.dumpingWharves.startAnimation = function() {

      dumpingLocationPoints.selectAll('.dumpingLocation')
        .each(function(d, i) {
          d3.select(this)
            .attr('r', 0);
        });

      dumpingLinesPaths.selectAll('.dumpingLines')
        .each(function(d, i) {
          d3.select(this)
            .attr('stroke-dasharray', function(d) {
              return (this.getTotalLength() + ' ' + this.getTotalLength());
            })
            .attr('stroke-dashoffset', function(d) {
              return this.getTotalLength();
            })            .attr('class', 'dumpingLines')
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', 0)
            .each('end', function() {
              journeyConfigs.mapEl.dumpingWharves.transitionCircles();
            });
        });
    };

    journeyConfigs.mapEl.dumpingWharves.transitionCircles = function() {
      dumpingLocationPoints.selectAll('.dumpingLocation')
        .each(function(d, i) {
          d3.select(this)
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', 45)
            .each('end', function() {
              journeyConfigs.mapEl.dumpingWharves.linesOut();
            });
        });
    };

    journeyConfigs.mapEl.dumpingWharves.linesOut = function() {
      svg.selectAll("text")
          .data(dumpingLocation.features)
          .enter()
          .append("text")
          .attr("class", "map-label")
          .attr("x", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr("y", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr("transform", function(d) { return "translate(50,0)"; })
          .text('Ocean dumping');

      svg.selectAll("text-below")
          .data(dumpingLocation.features)
          .enter()
          .append("text")
          .attr("class", "map-label")
          .attr("x", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr("y", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr("transform", function(d) { return "translate(50,17)"; })
          .text('off Sandy Hook');

      dumpingLinesPaths.selectAll('.dumpingLines')
        .each(function(d, i) {
          d3.select(this)
            .attr('stroke-dasharray', function(d) {
              return (this.getTotalLength() + ' ' + this.getTotalLength());
            })
            .attr('stroke-dashoffset', 0)
            .attr('class', 'dumpingLines')
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            });
        });
    };
  }

  function initLandfillsNycMap(landfillsNycAreas, landfillsNycPlaces, states, nycd) {
    var mapClass = '.map-' + journeyConfigs.mapEl.landfillsNyc.slug;
    var mapSvgId = '#map-' + journeyConfigs.mapEl.landfillsNyc.slug + '-svg';
    var width = $(mapClass).width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);

    var b = path.bounds(landfillsNycAreas),
      scaleFactor = 0.75,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select(mapSvgId)) {
      d3.select(mapSvgId).remove();
    }

    //Create SVG element
    var svg = d3.select(mapClass)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', mapSvgId.substring(1, mapSvgId.length));

    $(mapSvgId).css({
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

    // config
    var usStates = mapGroup.append('g').attr('class', 'usStates');
    var nycdShape = mapGroup.append('g').attr('class', 'nycd');
    var landfillsNycAreasPaths = mapGroup.append('g').attr('class', 'landfillsNycAreas');
    var landfillsNycPlacesPoints = mapGroup.append('g').attr('class', 'landfillsNycPlaces');

    nycdShape.selectAll('.nycd')
      .data(nycd.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', journeyConfigs.mapConfigs.colors.land)
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land);

    usStates.selectAll('.usStates')
      .data(states.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 0)
      .style('fill', journeyConfigs.mapConfigs.colors.land);

    landfillsNycAreasPaths.selectAll('.landfillsNycAreas')
      .data(landfillsNycAreas.features)
      .enter()
      .append('path')
      .attr({
        'd': path
      })
      .style('stroke', '#fff')
      .style('stroke-width', 0.5)
      .style('fill', function(d) {
        if (d.properties.year <= 1900) {
          return journeyConfigs.mapConfigs.colors.scale[0];
        } else if (d.properties.year <= 1924 && d.properties.year > 1900) {
          return journeyConfigs.mapConfigs.colors.scale[1];
        } else if (d.properties.year <= 1957 && d.properties.year > 1925) {
          return journeyConfigs.mapConfigs.colors.scale[2];
        } else if (d.properties.year > 1957) {
          return journeyConfigs.mapConfigs.colors.scale[3];
        }
      })
      .attr('opacity', 0)
      .attr('class', 'landfillsNycAreas');

      var landfillsLegendTitleText = ['Areas landfilled:'];
      var landfillsLegendLabels = ['1844-1900', '1907-1924', '1925-1957', '1958-today'];
      var legendWidth = 20;
      var legendHeight = 20;
      var legendSpacing = 10;
      var legendStartingX = 60;

      var landfillsLegendTitle = svg.selectAll("landfillsLegendTitle")
          .data(landfillsLegendTitleText)
          .enter()
          .append("text")
          .attr("class", "map-legend")
          .attr("id", "landfills-legend-title")
          .attr("x", legendStartingX)
          .attr("y", height / 2 - legendSpacing)
          .text(function(d, i){ return landfillsLegendTitleText[i]; })
          .attr("opacity", 0);

      var landfillsLegend = svg.selectAll("landfillsLegend")
          .data(journeyConfigs.mapConfigs.colors.scale)
          .enter()
          .append("g")
          .attr("class", "map-legend")
          .attr("id", function (d, i) {
            return "landfills-legend-" + i;
          })
          .attr("opacity", 0);

      landfillsLegend.append("rect")
        .attr("x", legendStartingX)
        .attr("y", function(d, i) {
          return (height/2) + (i*legendHeight) + (i*legendSpacing);
        })
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", function(d, i) { return d; });

      landfillsLegend.append("text")
        .attr("x", legendStartingX + legendWidth + legendSpacing)
        .attr("y", function(d, i) {
          return (height/2) + (i*legendHeight) + 13 + (i*legendSpacing);
        })
        .text(function(d, i){ return landfillsLegendLabels[i]; });

    landfillsNycPlacesPoints.selectAll('.landfillsNycPlaces')
      .data(landfillsNycPlaces.features)
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
      .attr('class', 'landfillsNycPlaces');

    journeyConfigs.mapEl.landfillsNyc.startAnimation = function() {

      landfillsNycPlacesPoints.selectAll('.landfillsNycPlaces')
        .each(function(d, i) {
          d3.select(this)
            .attr('r', 0);
        });

      landfillsNycAreasPaths.selectAll('.landfillsNycAreas')
        .each(function(d, i) {
          d3.select(this)
            .attr('opacity', 0)
            .transition()
            .duration(1500)
            .attr('opacity', function (d) {
              if (d.properties.year <= 1900) {
                return 1;
              } else {
                return 0;
              }
            })
            .each('end', function(d, i) {
              d3.select("#landfills-legend-title").attr("opacity", 1);
              d3.select("#landfills-legend-0").attr("opacity", 1);
            })
            .transition()
            .duration(1500)
            .attr('opacity', function (d) {
              if (d.properties.year <= 1924) {
                return 1;
              } else {
                return 0;
              }
            })
            .each('end', function(d, i) {
              d3.select("#landfills-legend-1").attr("opacity", 1);
            })
            .transition()
            .duration(1500)
            .attr('opacity', function (d) {
              if (d.properties.year <= 1957) {
                return 1;
              } else {
                return 0;
              }
            })
            .each('end', function(d, i) {
              d3.select("#landfills-legend-2").attr("opacity", 1);
            })
            .transition()
            .duration(1500)
            .attr('opacity', function (d) {
              if (d.properties.year < 2017) {
                return 1;
              } else {
                return 0;
              }
            })
            .each('end', function() {
              d3.select("#landfills-legend-3").attr("opacity", 1);
              // journeyConfigs.mapEl.landfillsNyc.transitionCircles();
            });
        });
    };

    journeyConfigs.mapEl.landfillsNyc.transitionCircles = function() {
      landfillsNycPlacesPoints.selectAll('.landfillsNycPlaces')
        .each(function(d, i) {
          d3.select(this)
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', 3)
            .each('end', function() {
              journeyConfigs.mapEl.landfillsNyc.linesOut();
            });
        });
    };

    journeyConfigs.mapEl.landfillsNyc.linesOut = function() {
      svg.selectAll("text")
          .data(landfillsNycPlaces.features)
          .enter()
          .append("text")
          .attr("class", "map-label")
          .attr("x", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
          })
          .attr("y", function(d){
              return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
          })
          .attr("transform", function(d) { return "translate(5,0)"; })
          .text(function(d) {
              return d.properties.name;
          });
        };
  }

}
