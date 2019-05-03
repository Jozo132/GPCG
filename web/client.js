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
        .range(["#FFFF00", "#FFFFFF"])
        .domain([getExtent(3), getExtent(4)])
    if (x === null) return "#000000";
    if (x <= getExtent(1)) return blue_cyan(x);
    if (x <= getExtent(2)) return cyan_green(x);
    if (x <= getExtent(3)) return green_yellow(x);
    if (x <= getExtent(4)) return yellow_red(x);
    if (x <= getExtent(5)) return red_white(x);
}

// @ts-ignore
$(document).ready(() => {
    socket = io();
    socket.on('connect', () => console.log(`Socket connected to server! ${socket.connected}`));
    socket.on('disconnect', () => {
        console.log(`Socket lost connection to server! ${socket.connected}`);
        socket.open();
    });

    socket.on('Generated', res => {
        console.log(res);
        var tablea_raw = `<thead><tr><th scope="col">Genetic code</th></tr></thead><tbody>`;
        res.gene.forEach(row => {
            tablea_raw += `<tr><td>${JSON.stringify(row)}</td></tr>`
        })
        tablea_raw += `</tbody>`;
        $('.raw_code').html(tablea_raw)

        var tablea_compiled =
            `<thead><tr><th scope="col">Compiled genetic code</th></tr></thead><tbody>`;
        var koda = res.code.replace(/\t/g, '    ')
        koda.split('\n').forEach(row => {
            tablea_compiled += `<tr><td>${row}</td></tr>`
        })
        tablea_compiled += `</tbody>`;
        $('.compiled_code').html(tablea_compiled)
        visualization = [];
        for (var i = -10; i <= 10; i += 0.001) {
            visualization.push({
                x: i
            })
        }

        socket.emit('requestExecution', visualization);
    })

    socket.on('Executed', res => {
        //console.log(`Executed response (${typeof res}):${JSON.stringify(res)}`);
        visualization = res;
        var plotData = [];
        res.forEach(packet => {
            plotData.push([packet.x, packet.y])
        })

        const extent_x = d3.extent(d3.values(visualization.map(d => d.x)))
        const extent_y = d3.extent(d3.values(visualization.map(d => d.y)))

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
    })
})