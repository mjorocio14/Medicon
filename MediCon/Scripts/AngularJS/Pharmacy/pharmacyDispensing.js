app.controller('pharmacyDispensingCtrl', ['$scope', '$http', '$filter', function (s, h, f) {
    s.loader = false;
    s.showQRpanel = true;
    //var vsIndexNo = 1;
    //getDispensedList();
    s.qrData = {};
    s.isEditting = false;
    s.tableLoader = false;


   
    //function getDispensedList() {
    //    vsIndexNo = 1;

    //    if ($.fn.DataTable.isDataTable("#listMedReleased_tbl")) {
    //        $('#listMedReleased_tbl').DataTable().clear();
    //        $('#listMedReleased_tbl').DataTable().ajax.url('../Pharmacy/listOfClients').load();
    //    }

    //    else {
    //        //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
    //        var tableMedsReleasedList = $('#listMedReleased_tbl').DataTable({
    //            "ajax": {
    //                "url": '../Pharmacy/listOfClients',
    //                "type": 'POST',
    //                "dataSrc": "",
    //                "recordsTotal": 20,
    //                "recordsFiltered": 20,
    //                "deferRender": true
    //            },
    //            "pageLength": 10,
    //            "searching": true,
    //            "language":
    //             {
    //                 "loadingRecords": '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div><text><i>Please wait, we are loading your data...</i></text>',
    //                 "emptyTable": '<label class="text-danger">NO INFORMATION FOUND!</label>'
    //             },
    //            "processing": false,
    //            "columns": [{
    //                "data": "index", "render": function () { return vsIndexNo++; }
    //            }, {
    //                "data": null,
    //                render: function (row) {
    //                    return '<strong>' + row[0].lastName + '</strong>';
    //                }
    //            }, {
    //                "data": null,
    //                render: function (row) {
    //                    return '<strong>' + row[0].firstName + '</strong>';
    //                }
    //            }
    //            , {
    //                "data": null,
    //                render: function (row) {
    //                    return row[0].middleName == null ? '' : '<strong>' + row[0].middleName + '</strong>';
    //                }
    //            },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row[0].extName == null ? '' : '<strong>' + row[0].extName + '</strong>';
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row[0].sex ? "M" : "F";
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   var age = moment().diff(moment(row[0].birthdate).format('L'), 'years');
    //                   return age <= 12 ? '<span class="label label-primary">' + age + '</span>' : '<span class="label label-success">' + age + '</span>';
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row[0].contactNo;
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row[0].brgyDesc + ', ' + row[0].citymunDesc + ', ' + row[0].provDesc
    //               }
    //           },
    //           {
    //               "data": null, render: function (row) {
    //                   return moment(row[0].dateTimeRx).format('lll');
    //               }
    //           },
    //           {
    //               "data": null, render: function (row) {
    //                   return moment(row[0].dateTimeReleased).format('lll');
    //               }
    //           },
    //           {
    //               "data": null, render: function () {
    //                   return '<button class="btn-success btn btn-xs" id="btn_showMedsReleased"> Show <i class="fa fa-external-link"></i></button>'
    //               }
    //           }
    //            ],
    //            "order": [[0, "asc"]],
    //            'columnDefs': [
    //               {
    //                   "targets": [0, 5, 6, 7, 9],
    //                   "className": "text-center"
    //               }]
    //        });

    //        $('#listMedReleased_tbl tbody').off('click');

    //        $('#listMedReleased_tbl tbody').on('click', '#btn_showMedsReleased', function () {
    //            var data = tableMedsReleasedList.row($(this).parents('tr')).data();
              
    //            $('#medDispensed_modal').modal('show');
    //            s.diagnosisInfo = [];
    //            s.diagnosisInfo = data;

    //            angular.forEach(s.diagnosisInfo, function (value) {
    //                value.dateTimeReleased = moment(value.dateTimeReleased).format('lll');
    //            });

    //            s.$apply();
    //        });
    //    }

    //}

        //$(document).ready(function () {
        //    $('.i-checks').iCheck({
        //        checkboxClass: 'icheckbox_square-green',
        //        radioClass: 'iradio_square-green',
        //    });
        //});


    s.scanner = new Instascan.Scanner(
           {
               video: document.getElementById('preview')
           }
       );

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            s.scanner.start(cameras[0]);
        }
        else {
            swal({
                title: "CAMERA ERROR",
                text: "Camera is not found, please refresh",
                type: "error"
            });
        }
    });

    s.scanner.addListener('scan', function (content) {
        s.searchQRcode = "";
        s.mainSearch(content);
    });

    s.mainSearch = function (info) {
        s.loader = true;
      
        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                if (d.data != null && d.data != "") {
                    s.qrData = {};
                    d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                    d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;
                    s.qrData = d.data[0];
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ', ' + d.data[0].citymunDesc + ', ' + d.data[0].provDesc;

                    s.isEditting = false;
                   getPrescription(info);
                }

                else {
                    swal({
                        title: "QR code is not yet register!",
                        text: "Please refer to QR code help desk near the area.",
                        type: "error"
                    });
                }

                s.loader = false;
            }
        })
    }

    function getPrescription(qrCode) {
        s.tableLoader = true;
        s.checkboxCounter = 0;

        h.post('../Pharmacy/getPrescription?qrCode=' + qrCode).then(function (d) {
            s.prescripted = {};
            s.prescripted = d.data;
            angular.forEach(s.prescripted, function (value) {
                angular.forEach(value, function (meds) {
                    meds.isRelease != true ? s.checkboxCounter++ : '';
                    meds.checkboxVal = angular.copy(meds.isRelease);
                });
                value.sort(function(a, b) {
                    return b.isRelease - a.isRelease;
                });
            });
          
            s.tableLoader = false;
        });
    }

    s.releaseMeds = function()
    {
        var checkedCounter = 0;
        var checkboxCount = 0;

        var listToReleased = [];

        for (var a = 0; a < s.prescripted.length; a++)
        {
            for (var b = 0; b < s.prescripted[a].length; b++)
            {
                s.prescripted[a][b].isRelease == true ? checkedCounter++ : '';
                s.prescripted[a][b].checkboxVal == true ? checkboxCount++ : '';
                s.prescripted[a][b].qtyReleased = s.prescripted[a][b].qtyReleased == null ? s.prescripted[a][b].qtyRx : s.prescripted[a][b].qtyReleased;
                if (s.prescripted[a][b].isRelease == true && s.prescripted[a][b].dateTimeReleased == null || s.prescripted[a][b].dateTimeReleased == '')
                    listToReleased.push(s.prescripted[a][b]);
            }
        }

        console.log(listToReleased);

        if (checkedCounter == 0 || (checkedCounter <= checkboxCount))
        {
            swal({
                title: "Releasing failed!",
                text: "You <label class='text-danger'>DON`T</label> have any checked medicine",
                type: "error",
                html: true
            });

        }

        else
        {
            swal({
                title: "Please wait while we are saving the update/s!",
                text: "QR code Information",
                type: "info",
                showConfirmButton: false
            });
           
            h.post('../Pharmacy/saveReleasing', { listRx: listToReleased }).then(function (d) {
                if (d.data.status == "success") {
                    swal({
                        title: "SUCCESS!",
                        text: d.data.msg,
                        type: "success"
                    });

                    s.isEditting = false;
                    s.qrData = {};
                    getDispensedList();
                    s.prescripted = {};
                    s.searchQRcode = '';

                }
                else {
                    swal({
                        title: "ERROR!",
                        text: d.data.msg,
                        type: "error"
                    });
                }
            });
        }
    }
    


}]);