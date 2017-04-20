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
    scale: ['#f15a29', '#8bb8d5'],
    scaleDropOff: ['#f15a29', '#1485CC']
  };
  journeyConfigs.mapConfigs.scales = {
    circleRadius: function(value) {
      return (Math.sqrt(value / 3.14) * 0.025) * 1.5;
    },
    lineWidth: function(value) {
      return journeyConfigs.mapConfigs.scales.circleRadius(value) / 1.5;
    }
  };

  //Load in GeoJSON data
  // d3.json(journeyConfigs.mapDataPath, function(geojson) {
    // var nycdOrganicsCollection = geojson.nycd_inci_collection;
    // var nycOrganicsDropOff = geojson.nyc_inci_drop_off_by_type;
    // var nycCommunityGardens = geojson.nyc_community_gardens;
    // var inciDestinations = geojson.inci_destinations;
    // var nynj = geojson.ny_nj_ct_refined;
    // var statesEast = geojson.states_east_census;
  d3.json('data/temp/nycd_bcd.geojson', function(nycdBcd) {
  d3.json('data/temp/ny_nj_ct_refined.geojson', function(nyNjCt) {
  d3.json('data/temp/od_lines_refuse.geojson', function(odLinesData) {
  d3.json('data/temp/dest_points_refuse.geojson', function(destPointsRefuseData) {
    initInciCollMap(nycdBcd, odLinesData, destPointsRefuseData, nyNjCt);
  });
  });
  });
  });

  function initInciCollMap(nycdBcdData, odLinesData, destPointsRefuseData, states) {
    //Width and height
    var width = $('.map-inci-coll').width() * 0.99;
    var height = viewportHeight;

    var projection = d3.geo.albers()
      .scale(1)
      .translate([0, 0]);
    var path = d3.geo.path()
      .projection(projection);
    var b = path.bounds(nycdBcdData),
      scaleFactor = 0.8,
      s = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
      .scale(s)
      .translate(t);

    // Clear SVG if there is one (on resize)
    if (d3.select('#map-inci-coll-svg')) {
      d3.select('#map-inci-coll-svg').remove();
    }
    //Create SVG element
    var svg = d3.select('.map-inci-coll')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'map-inci-coll-svg')
      .on('click', function(d) {
        journeyConfigs.mapEl.inciColl.startAnimation();
      });

    $('#map-inci-coll-svg').css({
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
    var truckLines = mapGroup.append('g').attr('class', 'truckLines');
    var tsPoints = mapGroup.append('g').attr('class', 'tsPoints');

    var cdServedCovanta = [];
    var cdServedOther = [];
    for (var i = 0; i < odLinesData.features.length; i++) {
      if (odLinesData.features[i].properties.disposal === 'Covanta - Essex') {
        cdServedCovanta.push(odLinesData.features[i].properties.d_id);
      } else {
        cdServedOther.push(odLinesData.features[i].properties.d_id);
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

      truckLines.selectAll('.truckLines')
        .data(odLinesData.features)
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

      tsPoints.selectAll('.tsPoints')
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
        .attr('class', 'tsPoints');

      var inciLegendTitleText = ['Waste destination'];
      var inciLegendLabels = ['Incinerator', 'Transfer Station'];
      var legendWidth = 20;
      var legendHeight = 20;
      var legendSpacing = 10;
      var legendStartingX = isMobile ? 0 : 60;
      var legendStartingY = height/4;

      var inciLegendTitle = svg.selectAll('inciLegendTitle')
          .data(inciLegendTitleText)
          .enter()
          .append('text')
          .attr('class', 'map-legend legend-inci')
          .attr('id', 'inci-legend-title')
          .attr('x', legendStartingX)
          .attr('y', legendStartingY - legendSpacing)
          .text(function(d, i){ return inciLegendTitleText[i]; })
          .attr('opacity', 0);

      var inciLegend = svg.selectAll('inciLegend')
          .data(journeyConfigs.mapConfigs.colors.scale)
          .enter()
          .append('g')
          .attr('class', 'map-legend legend-inci')
          .attr('id', function (d, i) {
            return 'inci-legend-' + i;
          })
          .attr('opacity', 0);

      inciLegend.append('circle')
        .attr('class', 'legend-inci')
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

      inciLegend.append('text')
        .attr('class', 'legend-inci')
        .attr('x', legendStartingX + legendWidth + legendSpacing)
        .attr('y', function(d, i) {
          return legendStartingY + (i*legendHeight) + 13 + (i*legendSpacing);
        })
        .text(function(d, i){ return inciLegendLabels[i]; });

    journeyConfigs.mapEl.inciColl.animationPlayed = false;

    journeyConfigs.mapEl.inciColl.startAnimation = function() {

      if (!journeyConfigs.mapEl.inciColl.animationPlayed) {
        journeyConfigs.mapEl.inciColl.animationPlayed = true;

        //clear circles
        tsPoints.selectAll('.tsPoints')
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

        svg.selectAll('.map-legend').attr('opacity', 0);

        truckLines.selectAll('.truckLines')
          .each(function(d, i) {
            d3.select(this)
              .filter(function(d) {
                return d.properties.disposal === 'Covanta - Essex';
              })
              .attr('stroke-dashoffset', function(d) {
                return this.getTotalLength();
              })
              .transition()
              .duration(1500)
              .attr('stroke-dashoffset', 0)
              .each('end', function() {
                journeyConfigs.mapEl.inciColl.covantaCircle();
              });
          });
      }
    };

    journeyConfigs.mapEl.inciColl.covantaCircle = function() {
      tsPoints.selectAll('.tsPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Covanta - Essex';
            })
            .attr('r', 0)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              journeyConfigs.mapEl.inciColl.covantaLinesOut();
              d3.select('#inci-legend-title').attr('opacity', 1);
              d3.select('#inci-legend-0').attr('opacity', 1);
            });
        });

    };

    journeyConfigs.mapEl.inciColl.covantaLinesOut = function() {
      // svg.selectAll('text-covanta')
      //     .data(destPointsRefuseData.features)
      //     .enter()
      //     .append('text')
      //     .filter(function(d) {
      //       return d.properties.disposal === 'Covanta - Essex';
      //     })
      //     .attr('x', function(d){
      //         return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      //     })
      //     .attr('y', function(d){
      //         return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      //     })
      //     .attr('transform', function(d) { return 'translate(-20,0)'; })
      //     .attr('class', 'covanta-legend map-legend')
      //     .attr('text-anchor', 'end')
      //     .text('Waste incinerator');
      // svg.selectAll('text-covanta-below')
      //     .data(destPointsRefuseData.features)
      //     .enter()
      //     .append('text')
      //     .filter(function(d) {
      //       return d.properties.disposal === 'Covanta - Essex';
      //     })
      //     .attr('x', function(d){
      //         return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      //     })
      //     .attr('y', function(d){
      //         return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      //     })
      //     .attr('transform', function(d) { return 'translate(-20,15)'; })
      //     .attr('class', 'covanta-legend map-legend')
      //     .attr('text-anchor', 'end')
      //     .text('Newark, NJ');

      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
              var inArray = $.inArray(bcd, cdServedCovanta) >= 0;
              if (inArray) {
                return true;
              } else {
                return false;
              }
            })
            .transition()
            .duration(1500)
            .style('fill', journeyConfigs.mapConfigs.colors.wasteCircles)
            .attr('opacity', 1);
        });

      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal === 'Covanta - Essex';
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {
              journeyConfigs.mapEl.inciColl.otherLinesIn();
            });
        });

    };

    journeyConfigs.mapEl.inciColl.otherLinesIn = function() {
      truckLines.selectAll('.truckLines')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal !== 'Covanta - Essex';
            })
            .attr('stroke-dashoffset', function(d) {
              return this.getTotalLength();
            })
            .style('stroke', journeyConfigs.mapConfigs.colors.complementaryOpacity)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', 0)
            .each('end', function() {
              journeyConfigs.mapEl.inciColl.otherCircles();
            });
        });
    };

    journeyConfigs.mapEl.inciColl.otherCircles = function() {
      tsPoints.selectAll('.tsPoints')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              return d.properties.disposal !== 'Covanta - Essex';
            })
            .attr('r', 0)
            .style('fill', journeyConfigs.mapConfigs.colors.complementaryOpacity)
            .transition()
            .duration(1500)
            .attr('r', function(d) {
              return journeyConfigs.mapConfigs.scales.circleRadius(d.properties.j_tot_rec);
            })
            .each('end', function() {
              journeyConfigs.mapEl.inciColl.otherLinesOut();
              d3.select('#inci-legend-1').attr('opacity', 1);
            });
        });

    };

    journeyConfigs.mapEl.inciColl.otherLinesOut = function() {
      commDist.selectAll('.nycd')
        .each(function(d, i) {
          d3.select(this)
            .filter(function(d) {
              var bcd = d.properties.BoroCD !== null ? d.properties.BoroCD.toString() : 'na';
              var inArray = $.inArray(bcd, cdServedOther) >= 0;
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
              return d.properties.disposal !== 'Covanta - Essex';
            })
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', function(d) {
              return -this.getTotalLength();
            })
            .each('end', function() {
              journeyConfigs.mapEl.inciColl.out();
            });
        });
    };

    journeyConfigs.mapEl.inciColl.out = function() {
      setTimeout(function() {
        journeyConfigs.mapEl.inciColl.animationPlayed = false;
      }, 1600);
    };

  }
  // end of inciColl

// end of init
}
