app.controller('medzCtrl', ['$scope', '$http', function (s, h) {

    s.mesTable = 0;
    s.mes = {};
    s.unitz = {};
    s.info = {};
    s.measureList = {};
    s.unitList = {};
   
    loadTable();
    loadUnit();
    loadMeasure();
   
    function loadUnit() {
        h.post('../Products/getUnit').then(function (d) {    
            s.unitList = d.data;
        });
    }

    function loadMeasure() {
        h.post('../Products/getMeasurement').then(function (d) {       
            s.measureList = d.data;
        });
    }

    var measurementSelect = "";
    measurementSelect = $("#measurementSelect").select2({
        placeholder: 'Select Unit',
        allowClear: true
    });

    var unitSelect = "";
    unitSelect = $("#unitSelect").select2({
        placeholder: 'Select Unit',
        allowClear: true
    });

   function loadTable() {
       if ($.fn.DataTable.isDataTable("#medzTable")) {
           $('#medzTable').DataTable().clear().destroy();
       }
        var medzTable = $('#medzTable').DataTable({
            "ajax": {
                "url": '../Products/getMedz',
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
            }, {
                "data": null,
                render: function (row) {
                    return '<strong>' + row.productDesc + ' ' + (row.measurementDesc != null ? row.measurementDesc : '') + '</strong>';
                }
            }, 
            {
                "data": null, render: function (row) {
                    return row.unitDesc
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
        $('#medzTable tbody').off('click');
        $('#medzTable tbody').on('click', '#viewInfo', function () {
            var a = medzTable.row($(this).parents('tr')).data();
            s.info = angular.copy(a);
            $('#unitSelect').val(a.unitID);
            $('#unitSelect').trigger('change');
            $('#measurementSelect').val(a.measureID);
            $('#measurementSelect').trigger('change');
            s.$apply();
        });

        //$.fn.DataTable.ext.pager.numbers_length = 5;
        $.fn.DataTable.FixedHeader;   
   }

   s.cancelBtn = function () {
       s.info = {};
       $('#unitSelect').val('').trigger('change');
       return;
   }

   s.saveMedz = function (a) {
       a.unitID = unitSelect.val();
       a.measurementID = measurementSelect.val();
       h.post('../Products/saveMedz',a).then(function (d) {
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

                   s.info = {};
                   $('#unitSelect').val('').trigger('change');
                   $('#measurementSelect').val('').trigger('change');
                   loadTable();
               }
           });
   }

   s.getMeasurement = function () {
       if (s.mesTable == 0) {
           if ($.fn.DataTable.isDataTable("#measurementTable")) {
               $('#measurementTable').DataTable().clear().destroy();
           }
           var measurementTable = $('#measurementTable').DataTable({
               "ajax": {
                   "url": '../Products/getMeasurement',
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
               }, {
                   "data": null,
                   render: function (row) {
                       return '<strong>' + row.measurementDesc + '</strong>';
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button id="viewMesInfo" class="btn btn-primary btn-xs" ><i class="fa fa-pencil" cursor:pointer;></i></button>';
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
               "scrollY": 200,
               "scrollX": true
           });
           $('#measurementTable tbody').off('click');
           $('#measurementTable tbody').on('click', '#viewMesInfo', function () {
               var a = measurementTable.row($(this).parents('tr')).data();
               s.mes = angular.copy(a);
               s.$apply();
           });

           //UNIT TALBE//
           if ($.fn.DataTable.isDataTable("#unitTable")) {
               $('#unitTable').DataTable().clear().destroy();
           }
           var unitTable = $('#unitTable').DataTable({
               "ajax": {
                   "url": '../Products/getUnit',
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
               }, {
                   "data": null,
                   render: function (row) {
                       return '<strong>' + row.unitDesc + '</strong>';
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button id="viewUnitInfo" class="btn btn-primary btn-xs" ><i class="fa fa-pencil" cursor:pointer;></i></button>';
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
               "scrollY": 200,
               "scrollX": true
           });
           $('#unitTable tbody').off('click');
           $('#unitTable tbody').on('click', '#viewUnitInfo', function () {
               var a = unitTable.row($(this).parents('tr')).data();
               s.unitz = angular.copy(a);
               s.$apply();
           });


           //$.fn.DataTable.ext.pager.numbers_length = 5;
           $.fn.DataTable.FixedHeader;
           s.mesTable = 1;
       }
       else {
           return;
       }
   }

   s.cancelMesBtn = function (a) {
       if (a == "m") {s.mes = {};}
       else {s.unitz = {};}   
       return;
   }

   s.saveMeasurements = function (a) {
       h.post('../Products/saveMeasurement', a).then(function (d) {
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

               s.mes = {};
               s.mesTable = 0;
               loadMeasure();
               s.getMeasurement();
           }
       });
   }

   s.saveUnit = function (a) {
       h.post('../Products/saveUnit', a).then(function (d) {
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

               s.unitz = {};
               s.mesTable = 0;
               loadUnit();
               s.getMeasurement();
           }
       });
   }


}]);
