app.controller('AnalyticsCtrl', ['$scope', '$http', function (s, h) {
 
    am5.ready(function() {

        // Create root element
        var root = am5.Root.new("chartdiv");


        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
          am5themes_Animated.new(root)
        ]);

        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            //wheelX: "panX",
            //wheelY: "zoomX",
            //pinchZoomX: true,
            layout: root.verticalLayout
        }));

        chart.children.unshift(am5.Label.new(root, {
            text: "Morbidity",
            fontSize: 15,
            fontWeight: "500",
            textAlign: "center",
            x: am5.percent(50),
            centerX: am5.percent(50),
            paddingTop: 0,
            paddingBottom: 10
        }));

        // Add legend
        // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
        var legend = chart.children.push(
          am5.Legend.new(root, {
              centerX: am5.p50,
              x: am5.p50
          })
        );

        // Set data
        h.get('../Analytics/getMorbidityStats').then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {

                var data = d.data;

                // Create axes
                // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
                var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
                    categoryField: "diagnoseName",
                    renderer: am5xy.AxisRendererX.new(root, {
                        cellStartLocation: 0.1,
                        cellEndLocation: 0.9
                    }),
                    tooltip: am5.Tooltip.new(root, {})
                }));

                xAxis.data.setAll(data);
                xAxis.get("renderer").labels.template.setAll({
                    oversizedBehavior: "wrap",
                    maxWidth: 100,
                    textAlign: "center"
                });

                var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                    renderer: am5xy.AxisRendererY.new(root, {})
                }));


                // Add series
                // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
                function makeSeries(name, fieldName) {
                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        name: name,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: fieldName,
                        categoryXField: "diagnoseName",
                    }));

                    series.columns.template.setAll({
                        tooltipText: "{name}, {categoryX}:{valueY}",
                        width: am5.percent(90),
                        tooltipY: 0,
                    });

                    series.data.setAll(data);

                    // Make stuff animate on load
                    // https://www.amcharts.com/docs/v5/concepts/animations/
                    series.appear();

                    series.bullets.push(function () {
                        return am5.Bullet.new(root, {
                            locationY: 0,
                            sprite: am5.Label.new(root, {
                                text: "{valueY}",
                                fill: root.interfaceColors.get("alternativeText"),
                                centerY: 0,
                                centerX: am5.p50,
                                populateText: true
                            })
                        });
                    });

                    legend.data.push(series);
                }

                makeSeries("Male", "male");
                makeSeries("Female", "female");

                chart.appear(1000, 100);
            }
        });


        // BRYAN CODE
        getLabPriceData();
        function getLabPriceData() {
            h.post('../Analytics/getLabPrice').then(function (d) {
                var data = d.data;
                s.tempLabPricesData = d.data;
                console.log(data);
                var rootMale = am5.Root.new("chartDivMale");
                var rootFemale = am5.Root.new("chartDivFemale");

                rootMale.setThemes([
                am5themes_Animated.new(rootMale)
                ]);
                rootFemale.setThemes([
                  am5themes_Animated.new(rootFemale)
                ]);

                var chart = rootMale.container.children.push(
                  am5percent.PieChart.new(rootMale, {
                      endAngle: 270
                  })
                );
                var chart1 = rootFemale.container.children.push(
                 am5percent.PieChart.new(rootFemale, {
                     endAngle: 270
                 })
               );

                var series = chart.series.push(
                     am5percent.PieSeries.new(rootMale, {
                         valueField: "male",
                         categoryField: "labTestName",
                         endAngle: 270
                     })
                );
                var series1 = chart1.series.push(
                  am5percent.PieSeries.new(rootFemale, {
                      valueField: "female",
                      categoryField: "labTestName",
                      endAngle: 270
                  })
                );

                series.states.create("hidden", {
                    endAngle: -90
                });
                series1.states.create("hidden", {
                    endAngle: -90
                });

                series.data.setAll(data);

                series.appear(1000, 100);

                series1.data.setAll(data);

                series1.appear(1000, 100);
            });
        }


    });






 

    s.statsLoad = function () {
        var today = new Date();
        s.getStatus(today, today);

        s.get = {
            dtF: today,
            dtT: today,
            reportMonth: today
        }
    };

    s.getStatus = function (dtF, dtT, tag) {
        if (dtF > dtT) {
            if (tag) {
                //var newDateT = s.formatdate(dtF, 'YYYY-MM-DD');
                var newDateT = s.formatdate(dtF, 'YYYY-MM');
                dtT = new Date(newDateT);
                s.get.dtT = dtT;
            } else {
                //var newDateF = s.formatdate(dtT, 'YYYY-MM-DD');
                var newDateF = s.formatdate(dtT, 'YYYY-MM');
                dtF = new Date(newDateF);
                s.get.dtF = dtF;
            }
        }
        //dtF = s.formatdate(dtF, 'YYYY-MM-DD');
        //dtT = s.formatdate(dtT, 'YYYY-MM-DD');

        dtF = s.formatdate(dtF, 'YYYY-MM');
        dtT = s.formatdate(dtT, 'YYYY-MM');

        console.log("date from: " + dtF)
        console.log("date to: " + dtT)
    };
 
    s.formatdate = function (date, dformat) {
        if (!date) return "N/A";
        return (moment(date).tz("Asia/Manila").format(dformat));
    };

}]);

