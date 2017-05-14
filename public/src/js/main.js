$(function() {

    times = []
    countSlacks = 0

    function createGraph() {
        // this is how time would be stored on the server
        var now = Date.now()
            // add datum
        times.push({
                milliseconds: countSlacks,
                time: now
            })
        // remove old data
        if (times.length > 120)
            times.shift()
            // define plot boundaries
        var width = 300,
            height = 60
        var margin = {
            top: 0,
            right: 10,
            bottom: 5,
            left: 50
        }
        var plot = {
                width: width - margin.right - margin.left,
                height: height - margin.top - margin.bottom
            }
            // x-axis is time
        var x = d3.time.scale()
            .range([0, plot.width])
            // y-axis is numerical
        var y = d3.scale.linear()
            .range([plot.height, 0])
            // set axis scales
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat('')
            .tickSize(0, 0)

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickSize(0, 0).ticks(3)
            // set time span to show
        var timeCap = width * 40 // 12s
        var latest = times.length ? times[times.length - 1].time : 0
        var data = times.filter(function(d) {
            return d.time >= latest - timeCap
        })

        x.domain([latest - timeCap, latest])
        y.domain([0, 1000])

        var line = d3.svg.line()
            .x(function(d) {
                return x(parseInt(d.time))
            })
            .y(function(d) {
                return y(d.milliseconds)
            })
            // make the graph
        var svg = d3.select('#graph')
        var graph = undefined

        if (d3.select('.graph-g').empty()) {
            graph = svg.append('g')
                .attr('class', 'graph-g')
                .attr('width', plot.width)
                .attr('height', plot.height)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                //add axes
            graph.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + plot.height + ')')
                .call(xAxis)
                .append('text')
                .attr('dx', (plot.width / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Time')

            graph.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('dx', (0 - plot.height / 2))
                .attr('dy', '-2.8em')
                .style('text-anchor', 'middle')
                .text('ms');
        } else {
            graph = d3.select('.graph-g')
        }

        // remove old line
        graph.select('.line').remove()
            //add data line
        graph.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)

        countSlacks = 0
    }

    if (socketAcitve) {
        var socket = io.connect(socketID);
        // console.log(socket)

        socket.on('event_1', function(data) {

            countSlacks++

            console.log(data)
            if (data.direction == 'input') {
                $('.realtimeMessages').prepend('<li><em>' + data.time + '</em> <strong>&#9658;</strong>' + getMessage(data.text) + '</li>')
            } else {
                $('.realtimeMessages').prepend('<li><em>' + data.time + '</em> <strong>&#9664;</strong>' + data.text + '</li>')
            }
        });
    }
    // credits: https://bl.ocks.org/ajfarkas/raw/a007097730f23ca0ff32b3e0fde226f6/
    // store a bunch of time values for the graph

    var startGraph = window.setInterval(createGraph, 3000)
});
