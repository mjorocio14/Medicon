app.controller('masterListCtrl', ['$scope', '$http', function (s, h) {

    getHospitalList();
    getActualTestedDates();
    s.printBtn = true;
    s.printBtnCancel = true;
    s.lab = {};
    loadDate();
    s.hospitalList = [];
    s.summary = {};
    s.summaryLoader = false;

    function loadDate() {
        s.lab.scheduleDates = new Date();
        s.lab.hospitalID = document.getElementById('accountHospitalID').innerHTML;
        loadLabTests();
    };

    function loadLabTests() {
        h.post('../MasterList/getLabTests').then(function (d) {
            s.labTestsList = [];
            s.labTestsList = d.data;
        })
    };

    s.searchRecords = function (a) {
        a.scheduleDate = moment(s.lab.scheduleDates).format('YYYY-MM-DD');
        a.hospitalID = a.hospitalID;
        loadtable(a);
    };


    function loadtable(query) {
        if ($.fn.DataTable.isDataTable("#scheduleTable")) {
            $('#scheduleTable').DataTable().clear().destroy();
        }
        var scheduleTable = $('#scheduleTable').DataTable({
            "ajax": {
                url: '../MasterList/getLabSchedules',
                data: query,
                "type": 'POST',
                "dataSrc": "",
                "recordsTotal": 20,
                "recordsFiltered": 20,
                "deferRender": true
            },
            "pageLength": 10,
            //"searching": true,
            "fixedColumns": true,
            "language":
             {
                 "loadingRecords": '<div class="spiner-example"><div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div></div>',
                 "emptyTable": '<span class="text-center text-semibold" style="vertical-align: middle; font-weight:700;">NO INFORMATION FOUND!</span>'
             },
            //"processing": false,
            "columns": [{
                "data": null, render: function (row) {
                    return row.idNo
                }
            },
             {
                 "data": null, render: function (row) {
                     return row.fullNameFirst
                 }
             },
            {
                "data": null, render: function (row) {
                    return row.shortDepartmentName
                }
            }
            ],
            "order": [[0, "asc"]],
            "responsive": true,
            'columnDefs': [
               {
                   "targets": [0],
                   "className": "text-center"
               }
            ],
            "lengthChange": true,
            "autoWidth": true,
            "scrollY": 400,
            "scrollX": true,
            "initComplete": function(){
                s.printBtn = false;
                s.printBtnCancel = false;
                s.$apply();
            }
        });
        $('#scheduleTable tbody').off('click');
        ;
    }

    s.printSchedule = function (a) {
        a.scheduleDate = moment(s.lab.scheduleDates).format('YYYY-MM-DD');
        a.hospitalID = 'HPL001';s
        h.post('../MasterList/printLabSchedule', a).then(function (d) {
            window.open("../Report/MediConRpt.aspx?type=masterList");
        });
    }


    s.clearSearch = function () {
        s.printBtn = true;
        s.printBtnCancel = true;
        s.lab = {};
        loadDate();
        var table = $('#scheduleTable').DataTable();
        table
            .clear()
            .draw();
    };

     function getHospitalList() {
         h.post('../MasterList/getHospitalList').then(function (d) {
            s.hospitalList = d.data;
        });
     }

     s.generateSummary = function () {
        s.scheduledEmp = [];
        s.summaryLoader = true;

        h.post('../MasterList/ScheduledEmpPerDate', { startDate: s.summary.filterDateFrom, endDate: s.summary.filterDateTo }).then(function (d) {
            s.scheduledEmp = d.data.map((rec) => {
                return rec.map((item) => {
                    item.scheduleDate = moment(item.scheduleDate).format('ll');
                    return item;
                }).sort((a, b) => {
                    let fa = a.fullNameLast.toLowerCase(),
                        fb = b.fullNameLast.toLowerCase();
                
                    if (fa < fb) {
                        return -1;
                    }
                    if (fa > fb) {
                        return 1;
                    }
                    return 0;
                });
            });
            s.summaryLoader = false;
        })
     }

     s.clearSummary = function () {
         s.summary = {};
     }

     s.clearActual = function () {
        s.actualDate = {};
    }

     function getActualTestedDates() {
        h.get('../MasterList/getActualTestedDates').then(function (d) {
            s.actualDateList = [];
            s.actualDateList = d.data.map((date) => moment(date.testedDate).format('LL'));
        })
     }

     s.generateActual = function () {
        s.actualTestedList = [];
        s.actuaLoader = true;
   
        let testDate = moment(s.actualDate).format('YYYY-MM-DD');
        
        h.post('../MasterList/getEmpPerActualTestDate', { testDate: testDate }).then(function (d) {
            s.actualTestedList = d.data.map((rec) => {
                return rec.map((item) => {
                    item.scheduleDate = moment(item.scheduleDate).format('ll');
                    item.testDate = moment(item.testDate).format('ll');
                    return item;
                }).sort((a, b) => {
                    let fa = a.fullNameLast.toLowerCase(),
                        fb = b.fullNameLast.toLowerCase();
                
                    if (fa < fb) {
                        return -1;
                    }
                    if (fa > fb) {
                        return 1;
                    }
                    return 0;
                });
            });
           
            s.actuaLoader = false;
        })
     }

}]);
