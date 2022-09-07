app.controller('AnalyticsCtrl', ['$scope', '$http', function (s, h) {
 

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

