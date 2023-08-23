app.controller('rxCtrl', ['$scope', '$http', function (s, h) {

    loadDate();
   
    function loadDate () {
        s.filterdate = new Date();
        var x = moment(s.filterdate).format('YYYY-MM-DD');
        // console.log(s.filterdate);
        loadtable(x);

    };

    s.filter_date = function (a) {
        console.log(a);
        a = moment(a).format('YYYY-MM-DD');
        var x = a.toString();
        loadtable(x)
    };

    function loadtable(x) {

        console.log(x);

        if ($.fn.DataTable.isDataTable("#rxTable")) {
            $('#rxTable').DataTable().clear().destroy();
        }
        var rxTable = $('#rxTable').DataTable({
            "ajax": {
                url: '../Prescriptions/getList?dateFilter=' + x,
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
                     return row.fullNameLast
                 }
             },
            {
                "data": null, render: function (row) {
                    return row.shortDepartmentName
                }
            },
            {
                "data": null, render: function () {
                    return '<button id="printRx" class="btn btn-primary btn-xs" ><i class="fa fa-pencil" cursor:pointer;></i></button>';
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
            "scrollX": true
        });
        $('#rxTable tbody').off('click');
        $('#rxTable tbody').on('click', '#printRx', function () {
            var a = rxTable.row($(this).parents('tr')).data();
            s.rxData = angular.copy(a);

            var patient = {
                fullName: s.rxData.fullNameLast,
                fullAddress: s.rxData.fullAddress,
                age: s.rxData.Age,
                rxID: s.rxData.mpRxId,
                personnelFullName: s.rxData.personnelFullName,
                title: s.rxData.title,
                licenseNo: s.rxData.licenseNo,
                mp_dateTimeRx: moment(s.rxData.mp_dateTimeRx).format('MMM DD, YYYY')
            };

            h.post('../Prescriptions/printRXList', { info: patient }).then(function (d) {
                window.open("../Report/MediConRpt.aspx?type=prescriptionList");
            });

            s.$apply();
            console.log(s.rxData);

        });

        //$.fn.DataTable.ext.pager.numbers_length = 5;
      //  $.fn.DataTable.FixedHeader;
    }

  


}]);
