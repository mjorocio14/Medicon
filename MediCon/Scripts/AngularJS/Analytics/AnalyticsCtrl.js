app.controller('AnalyticsCtrl', ['$scope', '$http', function (s, h) {
 





    am5.ready(function () {
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

}]);

