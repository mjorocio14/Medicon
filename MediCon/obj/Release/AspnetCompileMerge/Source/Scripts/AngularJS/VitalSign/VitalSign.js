app.controller('VitalSignCtrl', ['$scope', '$http', function (s, h) {
    s.showQRpanel = true;
    s.loader = false;
    s.qrData = {};
    s.bpLoader = false;
    s.bpAdded = [];
    var vsIndexNo = 1;
  //  getVitalList();
    //s.isEditting = false;


    function getVitalList() {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $('#clientList_tbl').DataTable().clear();
            $('#clientList_tbl').DataTable().ajax.url('../VitalSigns/getVitalSignList?ServiceID=SRV0005').load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableVSlist = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": '../VitalSigns/getVitalSignList?ServiceID=SRV0005',
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
                       return age <= 12 ? '<span class="label label-primary">' + age + '</span>' : '<span class="label label-success">' + age + '</span>';
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
                       return row.weight == null ? '---' : row.weight;
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.dateTimeEncoded == null ? '---' : moment(row.dateTimeEncoded).format('lll');
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.AvailedDT).format('lll');
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

                h.post('../VitalSigns/getBPlist?vSignID=' + data.vSignID).then(function (d) {
                    if (d.data.status == "error") {
                        swal({
                            title: "ERROR",
                            text: "Something went wrong, " + d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        s.historyList = [];
                        s.historyList = d.data;
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

        h.post('../UpdatePersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
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
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].fullAddress;
                    s.qrData.weight = d.data[0].weight == null ? '' : d.data[0].weight;

                    //s.isEditting = false;
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
                text: "<label>NO personal information is found, please scan or search a qr code.</label>",
                type: "error",
                html: true
            });
        }

        else {
            if (s.qrData.Age <= 12)         //... IF AGE <= 12, DILI NA KUHAAN UG BP ANG PATIENT
            {
                if (qrData.weight == '' || qrData.weight == null) {
                    swal({
                        title: "ERROR",
                        text: "Please <label class='text-danger'>fill-in</label> the <label>temperature & weight</label> fields.",
                        type: "error",
                        html: true
                    });
                }

                else {
                    swal({
                        title: "SAVING",
                        text: "Please wait while we are saving your data.",
                        type: "info",
                        showConfirmButton: false
                    });

                    h.post('../VitalSigns/saveVitalSign_Pedia', { qrCode: qrData.qrCode, opi: qrData, temperature: qrData.temp, serviceID: "SRV0005" }).then(function (d) {
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

                            getVitalList();
                            s.qrData = {};
                            s.searchQRcode = '';
                        }
                    });
                }
            }

            else {
                s.showQRpanel = !s.showQRpanel;

                if (s.showQRpanel == false) {
                    s.bpAdded = [];
                    getBPhistory(s.qrData);
                }

                else {
                    getVitalList();
                    s.qrData = {};
                    s.searchQRcode = '';
                }
            }
        }
    }


    function getBPhistory(data) {
        s.bpLoader = true;

        h.post('../VitalSigns/getBPhistory?qrCode=' + data.qrCode).then(function (d) {
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

    s.addVitalSign = function (record) {
        record.temp = s.qrData.temp;
        s.bpAdded.push(record);
        s.vSign = {};
    }

    s.removeVitalSign = function (removeBPindex) {
        s.bpAdded.splice(removeBPindex, 1);
    }

    s.saveVitalSigns = function () {
        if (s.bpAdded.length == 0) {
            swal({
                title: "ERROR",
                text: "No vital sign record to be save",
                type: "error"
            });
        }

        else {
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            var vSign = {};
            vSign.qrCode = s.qrData.qrCode;

            h.post('../VitalSigns/saveVitalSigns', { vs: vSign, bp: s.bpAdded, availed: vSign, serviceID: "SRV0005" }).then(function (d) {
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

                    s.bpAdded = [];
                    getBPhistory(s.qrData);
                    getVitalList();
                }
            });
        }
    }

    //.....   SELECT2
    //$("#qr_province").select2({
    //    placeholder: 'Select Province',
    //    allowClear: true
    //});

    //$("#qr_citymun").select2({
    //    placeholder: 'Select City/Municipality',
    //    allowClear: true
    //});

    //$("#qr_brgy").select2({
    //    placeholder: 'Select Barangay',
    //    allowClear: true
    //});
    //.....   /SELECT2





}]);