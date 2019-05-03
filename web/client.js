var socket;

var visualization = [];

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