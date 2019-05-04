// @ts-check
"use strict";

var socket;

var visualization = [];

const HEATMAP = (x, domain) => {
    let extent = domain[1] - domain[0];
    const getExtent = x => x * extent * 0.20 + domain[0];
    // @ts-ignore
    var blue_cyan = d3.scaleLinear()
        .range(["#0000FF", "#00FFFF"])
        .domain([getExtent(0), getExtent(1)])

    // @ts-ignore
    var cyan_green = d3.scaleLinear()
        .range(["#00FFFF", "#00FF00"])
        .domain([getExtent(1), getExtent(2)])

    // @ts-ignore
    var green_yellow = d3.scaleLinear()
        .range(["#00FF00", "#FFFF00"])
        .domain([getExtent(2), getExtent(3)])

    // @ts-ignore
    var yellow_red = d3.scaleLinear()
        .range(["#FFFF00", "#FF0000"])
        .domain([getExtent(3), getExtent(4)])

    // @ts-ignore
    var red_white = d3.scaleLinear()
        .range(["#FF0000", "#FFFFFF"])
        .domain([getExtent(4), getExtent(5)])
    if (x === null) return "#000000";
    if (x <= getExtent(1)) return blue_cyan(x);
    if (x <= getExtent(2)) return cyan_green(x);
    if (x <= getExtent(3)) return green_yellow(x);
    if (x <= getExtent(4)) return yellow_red(x);
    if (x <= getExtent(5)) return red_white(x);
}

// @ts-ignore
$(document).ready(() => {

    // @ts-ignore
    socket = io();
    socket.on('connect', () => console.log(`Socket connected to server! ${socket.connected}`));
    socket.on('disconnect', () => {
        console.log(`Socket lost connection to server! ${socket.connected}`);
        socket.open();
    });

    socket.on('Generated_1', res => {
        console.log(res);
        var tablea_raw = `<thead><tr><th scope="col">Genetic code</th></tr></thead><tbody>`;
        res.gene.forEach(row => {
            tablea_raw += `<tr><td>${JSON.stringify(row)}</td></tr>`
        })
        tablea_raw += `</tbody>`;
        // @ts-ignore
        $('.raw_code').html(tablea_raw)

        var tablea_compiled =
            `<thead><tr><th scope="col">Compiled genetic code</th></tr></thead><tbody>`;
        var koda = res.code.replace(/\t/g, '    ')
        koda.split('\n').forEach(row => {
            tablea_compiled += `<tr><td>${row}</td></tr>`
        })
        tablea_compiled += `</tbody>`;
        // @ts-ignore
        $('.compiled_code').html(tablea_compiled)
        visualization = [];

        for (var i = -10; i <= 10; i += 0.001) {
            visualization.push({
                a: i
            })
        }

        socket.emit('requestExecution_1', visualization);
    })

    socket.on('Plot_1', res => {
        console.log(`Executed_1 response (${typeof res}):${JSON.stringify(res)}`);
        visualization = res;
        var plotData = [];
        res.forEach(packet => {
            var a = packet.a === Infinity || packet.a === -Infinity ? null : packet.a;
            var x = packet.x === Infinity || packet.x === -Infinity ? null : packet.x;
            a = a === null ? null : Number(a.toFixed(4));
            x = x === null ? null : Number(x.toFixed(4));
            plotData.push([a, x])
        })

        // @ts-ignore
        const extent_x = d3.extent(d3.values(visualization.map(d => d.a === null ? null : d.a)))
        // @ts-ignore
        const extent_y = d3.extent(d3.values(visualization.map(d => d.x === null ? null : Number((d.x).toFixed(4)))))
        extent_y[0] -= 0.1
        extent_y[1] += 0.1

        // @ts-ignore
        d3.select(".plot").selectAll("svg").remove()
        // @ts-ignore
        functionPlot({
            title: 'y = compiled_genetic_code( x )',
            target: '.plot',
            width: 800,
            height: 400,
            disableZoom: true,
            xAxis: {
                label: 'x - axis',
                domain: extent_x
            },
            yAxis: {
                label: 'y - axis',
                domain: extent_y
            },
            data: [{
                points: plotData,
                fnType: 'points',
                graphType: 'polyline'
            }]
        });
    });


    socket.on('Generated_2', res => {
        console.log(res);
        var tablea_raw = `<thead><tr><th scope="col">Genetic code</th></tr></thead><tbody>`;
        res.gene.forEach(row => tablea_raw += `<tr><td>${JSON.stringify(row)}</td></tr>`)
        tablea_raw += `</tbody>`;
        // @ts-ignore
        $('.raw_code').html(tablea_raw)

        var tablea_compiled = `<thead><tr><th scope="col">Compiled genetic code</th></tr></thead><tbody>`;
        var koda = res.code.replace(/\t/g, '    ')
        koda.split('\n').forEach(row => tablea_compiled += `<tr><td>${row}</td></tr>`)
        tablea_compiled += `</tbody>`;
        // @ts-ignore
        $('.compiled_code').html(tablea_compiled)
        visualization = [];

        for (var a = -10; a <= 10; a += 0.1) {
            for (var b = -10; b <= 10; b += 0.1) {
                visualization.push({
                    a: a,
                    b: b
                });
            }
        }
        socket.emit('requestExecution_2', visualization);
    })


    socket.on('Plot_2', data => {
        console.log(`Executed_2 response (${typeof data}):${JSON.stringify(data)}`);
        visualization = data;
        var plotData = [];
        var all_a = [];
        var all_b = [];
        data.forEach(packet => {
            all_a.push(packet.a);
            all_b.push(packet.b);
            plotData.push([packet.a, packet.b])
        });

        var distict_as = [...new Set(all_a)].sort((a, b) => a - b);
        var distict_bs = [...new Set(all_b)].sort((a, b) => a - b);

        // @ts-ignore
        const extent_a = d3.extent(d3.values(visualization.map(d => d.a)))
        // @ts-ignore
        const extent_b = d3.extent(d3.values(visualization.map(d => d.b)))
        // @ts-ignore
        const extent_x = d3.extent(d3.values(visualization.map(d => d.x)))

        // set the dimensions and margins of the graph
        var margin = { top: 30, right: 30, bottom: 30, left: 30 },
            width = 700 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        // @ts-ignore
        d3.select(".plot").selectAll("svg").remove()

        // @ts-ignore
        var svg = d3.select(".plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // @ts-ignore
        var x = d3.scaleBand()
            .rangeRound([0, width])
            .domain(distict_as)
            .paddingInner(0.0);

        // @ts-ignore
        var y = d3.scaleBand()
            .rangeRound([height, 0])
            .domain(distict_bs)
            .paddingInner(0.0);

        // @ts-ignore
        var tooltip = d3.select(".plot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        var mouseover = d => tooltip.style("opacity", 1)
        var mouseleave = d => tooltip.style("opacity", 0)
        var mousemove = d_ => {
            console.log(d_);
            var d = { a: 0, b: 0, x: 0 };
            tooltip.html(`"genetic_function(${d.a.toFixed(1)},${d.b.toFixed(1)}): ${d.x !== null ? d.x.toFixed(4) : null}`)
                // @ts-ignore
                .style("left", (d3.mouse(this)[0] + 70) + "px")
                // @ts-ignore
                .style("top", (d3.mouse(this)[1]) + "px")
        }

        // Add every pixel each
        svg.selectAll()
            .data(data, d => d.a + ':' + d.b)
            .enter()
            .append("rect")
            .attr("x", d => x(d.a))
            .attr("y", d => y(d.b))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => HEATMAP(d.x, extent_x))

        svg.append('line')
            .attr("x1", 0)
            .attr("y1", height / 2)
            .attr("x2", width)
            .attr("y2", height / 2)
            .attr("stroke-width", 1.5)
            .attr("stroke", "grey")
            .attr("pointer-events", "none");

        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", 0)
            .attr("x2", width / 2)
            .attr("y2", height)
            .attr("stroke-width", 1.5)
            .attr("stroke", "grey")
            .attr("pointer-events", "none");


        svg.selectAll()
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    })
})