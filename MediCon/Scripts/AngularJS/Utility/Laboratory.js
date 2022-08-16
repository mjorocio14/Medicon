app.controller('labCtrl', ['$scope', '$http', function (s, h) {


    s.lab = {};
    s.labList = {};
    loadTable();
  

    function loadTable() {
        if ($.fn.DataTable.isDataTable("#labTable")) {
            $('#labTable').DataTable().clear().destroy();
        }
        var labTable = $('#labTable').DataTable({
            "ajax": {
                "url": '../Laboratory/getLab',
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
                "data": "index", "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": null, render: function (row) {
                    return row.labTestName
                }
            },
            {
                "data": null, render: function () {
                    return '<button id="viewInfo" class="btn btn-primary btn-xs" ><i class="fa fa-pencil" cursor:pointer;></i></button>';
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
        $('#labTable tbody').off('click');
        $('#labTable tbody').on('click', '#viewInfo', function () {
            var a = labTable.row($(this).parents('tr')).data();
            s.lab = angular.copy(a);
            s.$apply();
        });

        //$.fn.DataTable.ext.pager.numbers_length = 5;
        $.fn.DataTable.FixedHeader;
    }

    s.cancelBtn = function () {
        s.lab = {};
        return;
    }

    s.saveLab = function (a) {
        h.post('../Laboratory/saveLab', a).then(function (d) {
            if (d.data.status == "dupli") {
                swal({
                    title: d.data.msg,
                    text: "ERROR",
                    type: "error"
                });
            }

            else if (d.data.status == "error") {
                swal({
                    title: "ERROR",
                    text: "Something went wrong, " + d.data.msg,
                    type: "error"
                });
            }

            else {
                swal({
                    title: "SUCCESSFUL",
                    text: d.data.msg,
                    type: "success",
                });

                s.lab = {};
                s.labList = {};
                loadTable();
                return;
            }
        });
    }


}]);
