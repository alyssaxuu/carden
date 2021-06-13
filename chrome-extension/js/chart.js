// Draw chart (stats)
function showChart(labels, correct, incorrect, forgotten) {
    var ctx = document.getElementById('last-sessions').getContext('2d');
    ctx.height = 241;
    ctx.width = 328;
    ctx.canvas.width = 328;
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Correct',
                    data: correct,
                    backgroundColor: [
                        '#5BC36E',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36'
                    ],
                    hoverBackgroundColor: [
                        '#5BC36E',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36',
                        '#5BC36'
                    ],
                    borderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    hoverBorderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    //borderWidth: 4,
                    borderWidth: {
                        left: 0,
                        right: 0,
                        top: 3,
                        bottom: 0
                    },
                    categoryPercentage: .75,
                    barPercentage: .75,
                    //borderSkipped: ['bottom', 'left', 'right'],
                    maxBarThickness: 25,
                },
                {
                    label: 'Incorrect',
                    data: incorrect,
                    backgroundColor: [
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248'
                    ],
                    hoverBackgroundColor: [
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248',
                        '#F9B248'
                    ],
                    borderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    hoverBorderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    borderWidth: {
                        left: 0,
                        right: 0,
                        top: 3,
                        bottom: 0
                    },
                    categoryPercentage: .75,
                    barPercentage: .75,
                    maxBarThickness: 25,
                },
                {
                    label: 'Forgotten',
                    data: forgotten,
                    backgroundColor: [
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248'
                    ],
                    hoverBackgroundColor: [
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248',
                        '#F97248'
                    ],
                    borderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    hoverBorderColor: [
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF',
                        '#FFF'
                    ],
                    borderWidth: {
                        left: 0,
                        right: 0,
                        top: 3,
                        bottom: 0
                    },
                    categoryPercentage: .75,
                    barPercentage: .75,
                    maxBarThickness: 25,
                }
            ]
        },
        options: {
            layout: {
                padding: {
                    left: 31,
                    right: 31,
                    top: 40,
                    bottom: 20
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontFamily: "Roboto",
                        fontSize: 14,
                        fontColor: "#69708A",
                        maxTicksLimit: 5,
                        padding: 10,
                        precision: 0
                    },
                    stacked: true,
                    gridLines: {
                        borderDash: [10, 10],
                        color: "#E8F0F4",
                        display: true,
                        drawBorder: false,
                        zeroLineColor: "#FFF",
                        tickMarkLength: 0,
                        drawTicks: false
                    }
                }],
                xAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                        fontFamily: "Roboto",
                        fontSize: 14,
                        fontColor: "#69708A",
                        maxRotation: 0,
                        minRotation: 0
                    },
                    gridLines: {
                        drawBorder: false,
                        display: false,
                    },
                }]
            },
            legend: {
                display: false
            },
            hover: {
                animationDuration: 200
            },
            tooltips: {
                yAlign: 'bottom',
                backgroundColor: '#FFF',
                titleFontFamily: 'Roboto',
                bodyFontColor: 'Roboto',
                titleFontColor: '#69708A',
                bodyFontColor: '#69708A',
                borderColor: '#C5C8CA',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.yLabel;
                    },
                    title: function(tooltipItem, data) {
                        return;
                    }
                }
            }
        }
    });
    myChart.canvas.parentNode.style.height = '240px';
    myChart.canvas.parentNode.style.width = '400px';
}