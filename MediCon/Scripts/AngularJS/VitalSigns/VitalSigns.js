app.controller('VitalSignCtrl', ['$scope', '$http', function (s, h) {
    s.showQRpanel = true;
    s.loader = false;
    s.qrData = {};
    s.bpLoader = false;
    var vsIndexNo = 1;
    s.isVSexist = false;
    getVitalList();

    // QR Scanner Initialization
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
    // /QR Scanner Initialization

    function getVitalList()
    {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl"))
        {
            $('#clientList_tbl').DataTable().clear();
            $('#clientList_tbl').DataTable().ajax.url('../VitalSigns/getVitalSignList').load();
        }

        else
        {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableVSlist = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": '../VitalSigns/getVitalSignList',
                    "type": 'POST',
                    "dataSrc": "",
                    "recordsTotal": 20,
                    "recordsFiltered": 20,
                    "deferRender": true
                },
                "pageLength": 10,
                "searching": true,
                "language":
                 {
                     "loadingRecords": '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div><text><i>Please wait, we are loading your data...</i></text>',
                     "emptyTable": '<label class="text-danger">NO INFORMATION FOUND!</label>'
                 },
                "processing": false,
                "columns": [{
                    "data": "index", "render": function () { return vsIndexNo++; }
                }, {
                    "data": null,
                    render: function (row) {
                        return '<strong>' + row.lastName + '</strong>';
                    }
                }, {
                    "data": null,
                    render: function (row) {
                        return '<strong>' + row.firstName + '</strong>';
                    }
                }
                , {
                    "data": null,
                    render: function (row) {
                        return row.middleName == null ? '' : '<strong>' + row.middleName + '</strong>';
                    }
                },
               {
                   "data": null,
                   render: function (row) {
                       return row.extName == null ? '' : '<strong>' + row.extName + '</strong>';
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.sex ? "M" : "F";
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       var age = moment().diff(moment(row.birthdate).format('L'), 'years');
                       return '<span class="label label-success">' + age + '</span>';
                   }
               },
               {
                   "data": 'contactNo'
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.brgyDesc + ', ' + row.citymunDesc + ', ' + row.provDesc
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.height == null ? '---' : row.height;
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.weight == null ? '---' : row.weight;
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.dateTimeEncoded).format('lll');
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button class="btn-success btn btn-xs" id="btnShowVShistory"> Show <i class="fa fa-external-link"></i></button>'
                   }
               }
                ],
                "order": [[0, "asc"]],
                'columnDefs': [
                   {
                       "targets": [0, 5, 6, 7, 9],
                       "className": "text-center"
                   }]
            });

            $('#clientList_tbl tbody').off('click');

            $('#clientList_tbl tbody').on('click', '#btnShowVShistory', function () {
                var data = tableVSlist.row($(this).parents('tr')).data();

                h.post('../VitalSigns/getBPhistory?qrCode=' + data.qrCode).then(function (d) {
                    if (d.data.status == "error") {
                        swal({
                            title: "ERROR",
                            text: "Something went wrong, " + d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        s.historyList = [];
                        s.historyList = d.data.bp;
                        s.historyList.reverse();

                        angular.forEach(s.historyList, function (val) {
                            val.dateTimeLog = moment(val.dateTimeLog).format('lll');
                        });

                        $('#vitalHistory_modal').modal('show');
                    }
                });
            });
        }
    }

    s.mainSearch = function (qrCode)
    {
        s.loader = true;

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error')
            {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else
            {
                if (d.data != null && d.data != "")
                {
                    s.qrData = {};
                  
                    d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                    d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;
                    s.qrData = d.data[0];
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ' ' + d.data[0].citymunDesc + ' ' + d.data[0].provDesc;
                    s.qrData.weight = d.data[0].weight == null ? '' : d.data[0].weight;
                    
                    // Check and Get Vital Signs Data for the current day
                    h.get('../VitalSigns/getVitalSigns?qrCode=' + qrCode).then(function (d) {
                        if (d.data != null && d.data != '')
                        {
                            s.isVSexist = true;
                            s.qrData.height = d.data.height;
                            s.qrData.weight = d.data.weight;
                        }

                        else {
                            s.isVSexist = false;
                        }
                    });
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

    s.btnProceed = function (qrData) {
        if (s.qrData.qrCode == null || s.qrData.qrCode == undefined || s.qrData.qrCode == '') {
            swal({
                title: "ERROR",
                text: "No personal information found, please scan or search a qr code.",
                type: "error",
                html: true
            });
        }

        else {
            s.BP = {};
            
            if (s.isVSexist) {
                s.showQRpanel = !s.showQRpanel;
                getBPhistory(s.qrData.qrCode);
            }

            else {
                h.post('../VitalSigns/saveVitalSigns', { qrCode: qrData.qrCode, vs: qrData }).then(function (d) {
                    if (d.data.status == "success") {
                        s.showQRpanel = !s.showQRpanel;
                        getBPhistory(s.qrData.qrCode);

                        swal({
                            title: "SUCCESSFUL",
                            text: d.data.msg,
                            type: "success"
                        });

                        s.isVSexist = true;
                    }

                    else {
                        swal({
                            title: "ERROR",
                            text: "Something went wrong, " + d.data.msg,
                            type: "error"
                        });
                    }
                });
            }
        }
    }

    s.btnReturn = function () {
        s.qrData = {};
        s.isVSexist = false;
        s.showQRpanel = !s.showQRpanel;
    }

    function getBPhistory(qrCode) {
        s.bpLoader = true;

        h.post('../VitalSigns/getBPhistory?qrCode=' +qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.bpHistory = {};
                s.bpHistory = d.data.bp;
                angular.forEach(s.bpHistory, function (value) {
                    value.BPdateTime = moment(value.BPdateTime).format('lll');
                });
            }

            s.bpLoader = false;
        });
    }

    s.saveBP = function (BP) {
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            h.post('../VitalSigns/saveBP', { qrCode: s.qrData.qrCode, bp: BP }).then(function (d) {
                if (d.data.status == "error") {
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
                        type: "success"
                    });

                    s.BP = {};
                    getBPhistory(s.qrData.qrCode);
                    getVitalList();
                    s.isVSexist = false;
                    s.searchQRcode = "";
                }
            });
    }

}]);