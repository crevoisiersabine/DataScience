
var RadarChart = {
    draw: function(id, d, options) {
        var cfg = {
            radius: 5,
            w: 300,
            h: 300,
            axisOrder: 1,  // -1: clockwise, 1: counter clockwise
            factor: 1,
            factorLegend: .85,
            format: '.0f',
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            rotation: Math.PI / 20,
            opacityArea: 0.5,
            ToRight: 5,
            ToBottom: 5,
            TranslateX: 80,
            TranslateY: 30,
            ExtraWidthX: 100,
            ExtraWidthY: 100
        };

        if ('undefined' !== typeof options) {
            for (var i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }

        cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i) {
            return d3.max(i.map(function(o) {
                return o.value;
            }));
        }));

        cfg.maxValue = (cfg.maxValue) ? cfg.maxValue : 1;  // Avoid divisions by zero.

        var allAxis = (d[0].map(function(i, j) {return i.axis}));
        var total = allAxis.length;
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        var format = d3.format(cfg.format);
        d3.select(id).select('svg').remove();

        var g = d3.select(id)
                  .append('svg')
                  .attr('width', cfg.w + cfg.ExtraWidthX)
                  .attr('height', cfg.h + cfg.ExtraWidthY)
                  .append('g')
                  .attr('transform', 'translate(' + cfg.TranslateX + ',' + cfg.TranslateY + ')');

        var tooltip;

        //Circular segments
        for (var j = 0; j < cfg.levels - 1; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll('.levels')
             .data(allAxis)
             .enter()
             .append('svg:line')
             .attr('x1', function(d, i) {return levelFactor * (1 - cfg.factor * Math.sin(cfg.rotation + i * cfg.radians / total));})
             .attr('y1', function(d, i) {return levelFactor * (1 - cfg.factor * Math.cos(cfg.rotation + i * cfg.radians / total));})
             .attr('x2', function(d, i) {return levelFactor * (1 - cfg.factor * Math.sin(cfg.rotation + (i + 1) * cfg.radians / total));})
             .attr('y2', function(d, i) {return levelFactor * (1 - cfg.factor * Math.cos(cfg.rotation + (i + 1) * cfg.radians / total));})
             .attr('class', 'line')
             .style('stroke', 'WhiteSmoke')
             .style('stroke-opacity', '0.75')
             .style('stroke-width', '0.3px')
             .attr('transform', 'translate(' + (cfg.w / 2 - levelFactor) + ', ' + (cfg.h / 2 - levelFactor) + ')');
        }

        //Text indicating what value corresponds to each level
        for (var j = 0; j < cfg.levels; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll('.levels')
             .data([1]) //dummy data
             .enter()
             .append('svg:text')
             .attr('x', function(d) {return levelFactor * (1 - cfg.factor * Math.sin(cfg.rotation));})
             .attr('y', function(d) {return levelFactor * (1 - cfg.factor * Math.cos(cfg.rotation));})
             .attr('class', 'legend')
             .style('font-family', 'sans-serif')
             .style('font-size', '11px')
             .style('stroke', 'WhiteSmoke')
             .style('fill', 'WhiteSmoke')
             .attr('transform', 'translate(' + (cfg.w / 2 - levelFactor + cfg.ToRight) + ', ' + (cfg.h / 2 - levelFactor + cfg.ToBottom) + ')')
             .text(format((j + 1) * cfg.maxValue / cfg.levels));
        }

        //Axis segments
        var axis = g.selectAll('.axis')
                    .data(allAxis)
                    .enter()
                    .append('g')
                    .attr('class', 'axis');

        axis.append('line')
            .attr('x1', cfg.w / 2)
            .attr('y1', cfg.h / 2)
            .attr('x2', function(d, i) {return cfg.w / 2 * (1 - cfg.factor * Math.sin(cfg.rotation + i * cfg.radians / total));})
            .attr('y2', function(d, i) {return cfg.h / 2 * (1 - cfg.factor * Math.cos(cfg.rotation + i * cfg.radians / total));})
            .attr('class', 'line')
            .style('stroke', 'WhiteSmoke')
            .style('stroke-width', '1px');

        axis.append('text')
            .attr('class', 'legend')
            .text(function(d) {return d})
            .style('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('transform', function(d, i) {return 'translate(0, -10)'})
            .attr('x', function(d, i) {return cfg.w / 2 * (1 - (cfg.factorLegend + 120 / cfg.w) * Math.sin(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total)));})
            .attr('y', function(d, i) {return cfg.h / 2 - (20 + cfg.h / 2) * Math.cos(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total));});

        series = 0;

        //Unknown
        d.forEach(function(y, x) {  //value, index
            dataValues = [];
            g.selectAll('.nodes')
             .data(y, function(j, i) { //value, key function (value, index)
                 dataValues.push([
                     cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total))),
                     cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total)))
                 ]);
             });
            dataValues.push(dataValues[0]);

            g.selectAll('.area')  //Draw the polygon for a serie
             .data([dataValues])
             .enter()
             .append('polygon')
             .attr('class', 'radar-chart-serie' + series)
             .style('stroke-width', '2px')
             .style('stroke', "3D72A4")
             .attr('points', function(d) {  //d is the array of pairs (x,y) computed above
                 var str = '';
                 for (var pti = 0; pti < d.length; pti++) {
                     str = str + d[pti][0] + ',' + d[pti][1] + ' ';
                 }
                 return str;
             })
             .style('fill', "3D72A4")
             .style('fill-opacity', cfg.opacityArea)
             .on('mouseover', function(d) {
                 z = 'polygon.' + d3.select(this).attr('class');
                 g.selectAll('polygon')
                  .transition(200)
                  .style('fill-opacity', 0.1);
                 g.selectAll(z)
                  .transition(200)
                  .style('fill-opacity', .7);
             })
             .on('mouseout', function() {
                 g.selectAll('polygon')
                  .transition(200)
                  .style('fill-opacity', cfg.opacityArea);
             });
            series++;
        });

        series = 0;

        d.forEach(function(y, x) {
            g.selectAll('.nodes')
             .data(y).enter()
             .append('svg:circle')
             .attr('class', 'radar-chart-serie' + series)
             .attr('r', cfg.radius)
             .attr('alt', function(j) {return Math.max(j.value, 0)})
             .attr('cx', function(j, i) {
                 return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total)));
             })
             .attr('cy', function(j, i) {
                 return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(cfg.axisOrder * (cfg.rotation + i * cfg.radians / total)));
             })
             .attr('data-id', function(j) {return j.axis})
             .style('fill', "3D72A4")
             .style('fill-opacity', .9)
             .on('mouseover', function(d) {
                 newX = parseFloat(d3.select(this).attr('cx')) - 10;
                 newY = parseFloat(d3.select(this).attr('cy')) - 5;

                 tooltip.attr('x', newX)
                        .attr('y', newY)
                        .text(format(d.value))
                        .transition(200)
                        .style('opacity', 1);

                 z = 'polygon.' + d3.select(this).attr('class');
                 g.selectAll('polygon')
                 .transition(200)
                 .style('fill-opacity', 0.1);
                g.selectAll(z)
                 .transition(200)
                 .style('fill-opacity', .7);
             })
             .on('mouseout', function() {
                 tooltip.transition(200)
                        .style('opacity', 0);
                 g.selectAll('polygon')
                  .transition(200)
                  .style('fill-opacity', cfg.opacityArea);
             })
             .append('svg:title')
             .text(function(j) {return Math.max(j.value, 0)});

            series++;
        });

        //Tooltip
        tooltip = g.append('text')
                   .style('opacity', 0)
                   .style('font-family', 'sans-serif')
                   .style('font-size', '13px')
                   .style('fill', 'WhiteSmoke')
                   .style('stroke', 'WhiteSmoke');
    }
};