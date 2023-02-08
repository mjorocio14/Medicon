app.controller('PBEctrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    s.showPerformPanel = false;

    s.filterResult = function (date) {
        getPBEclients(date);
    }

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

    s.mainSearch = function (qrCode) {
        s.loader = true;

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + qrCode).then(function (d) {
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
                    s.testHistory = {};
                    s.labReq = {};

                    d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                    d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;
                    s.qrData = d.data[0];
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ' ' + d.data[0].citymunDesc + ' ' + d.data[0].provDesc;

                    s.getLabtest(qrCode);
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

    s.savePBE = function () {
        if (s.pbe.isPapsmear == null || s.pbe.isBreastExam == null)
        {
            swal({
                title: "ERROR",
                text: "Please fill all the fields required",
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

            h.post('../PapsmearBreastExam/savePBE', { PBEID: s.pbe.PBEID, isPapsmear: s.pbe.isPapsmear, isBreastExam: s.pbe.isBreastExam }).then(function (d) {
                if (d.data.status == "error") {
                    swal({
                        title: "ERROR",
                        text: "<labal>" + d.data.msg + "</label>",
                        type: "error",
                        html: true
                    });
                }

                else {
                    swal({
                        title: "SUCCESSFUL",
                        text: d.data.msg,
                        type: "success",
                        html: true
                    });

                    s.getLabtest(s.pbe.qrCode);
                    s.performPBE(s.pbe);
                }
            });
        }
    }

    s.getLabtest = function (qrCode) {
        h.post('../PapsmearBreastExam/getPatientPBE?qrCode=' + qrCode).then(function (d) {
            s.pbeHistory = {};

            if (d.data.length == 0) {
                swal({
                    title: "ERROR",
                    text: "Patient has no record of papsmear & breast exam referral. Please refer the patient to medical consultation",
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (d1) {
                    d1.pbeDT = moment(d1.pbeDT).format('lll');
                    d1.consultDT = moment(d1.consultDT).format('lll');
                });
                
                s.pbeHistory = d.data;
                s.pbeHistory.status = s.pbeHistory.isPapsmear && s.pbeHistory.isBreastExam ? true : false;
            }
        });
    }

    s.performPBE = function (data) {
        s.pbe = {}
        s.pbe.PBEID = data.PBEID;
        s.pbe.qrCode = data.qrCode;
        s.showPerformPanel = !s.showPerformPanel;
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.FilterDate = new Date();
            getPBEclients(s.FilterDate);
        }
    }

    function getPBEclients(dateFilter) {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $('#clientList_tbl').DataTable().clear();
            $('#clientList_tbl').DataTable().ajax.url("../PapsmearBreastExam/getPatientList?date=" + moment(dateFilter).format('YYYY-MM-DD')).load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableLabList = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": "../PapsmearBreastExam/getPatientList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                    "data": "index", "render": function () { return indexNo++; }
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
                        return row.isPapsmear ? 'Yes' : 'No';
                    }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.isBreastExam ? 'Yes' : 'No';
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.personnel_firstName + " " + row.personnel_midInit + " " + row.personnel_lastName
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.labDT).format('lll');
                   }
               }
                ],
                "order": [[0, "asc"]]
            });
        }
    }

}]);