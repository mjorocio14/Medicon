app.controller('LabResultCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
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
                    s.testHistory = [];
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

    s.getLabtest = function (qrCode) {
        // GET LAB HISTORY AND REQUEST
        h.post('../Labtest/getPersonLabReq?qrCode=' + qrCode).then(function (d) {
            if (d.data.length == 0) {
                swal({
                    title: "ERROR",
                    text: "Patient has no record of laboratory referral. Please refer the patient to medical consultation",
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (d1) {
                    angular.forEach(d1, function (d2) {
                        d2.consultDT = moment(d2.consultDT).format('lll');
                        d2.labDT = moment(d2.labDT).format('lll');
                    });
                });
                
                if (d.data[0][0].isTested == null || d.data[0][0].isTested == false) {
                    s.testHistory = d.data.length > 1 ? d.data[1] : [];
                }

                else {
                    s.testHistory = d.data[0];
                }
                console.log(s.testHistory);
            }
        });
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            getLabClients();
        }
    }

    function getLabClients() {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $('#clientList_tbl').DataTable().clear();
            $('#clientList_tbl').DataTable().ajax.url('../Labtest/getPatientList').load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableLabList = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": '../Labtest/getPatientList',
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
                   "data": 'labTestName'
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.labDT).format('lll');
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.personnel_firstName + " " + row.personnel_midInit + " " + row.personnel_lastName
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.consultDT).format('lll');
                   }
               }
                ],
                "order": [[0, "asc"]]
            });
        }

    }

    s.encodeResult = function (labTestID, labID, labTestName) {
        s.tempLabTestName = labTestName;
        s.tempLabID=labID;
        if (labTestID == "L0001") {
            $('#modalUrinalysis').modal('show');
        }
        else if (labTestID == "L0003") {
            $('#modalBLoodChem').modal('show');
        }else if(labTestID=="L0002"){
            $('#modalCbc').modal('show');
        }
    }

    s.saveBloodChem = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });
       
        s.blood.labID = s.tempLabID;
        h.post('../LaboratoryResult/saveBloodChemResult', { result: s.blood }).then(function (d) {
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

                s.blood = {};
                $('#modalBLoodChem').modal('hide');
                s.getLabtest(s.qrData.qrCode);
            }
        });
    }

    $('#urinalysisForm').validate({
        rules: {
            
        },
        submitHandler: function () {
            
            swal({
                title: "SUCCESSFULLY SAVED",
                type: "success",
                html: true
            });
            $('#modalUrinalysis').modal('hide');
        },
        errorElement: 'span',
            errorPlacement: function (error, element) {
                error.addClass('invalid-feedback');
                element.closest('.form-group').append(error);
            },
        highlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-info').addClass('has-error');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-error').addClass('has-info');
        }
        });
    
    $('#cbcForm').validate({
        rules: {
            
        },
        submitHandler: function () {
            
            swal({
                title: "SUCCESSFULLY SAVED",
                type: "success",
                html: true
            });
            $('#modalCbc').modal('hide');
        },
        errorElement: 'span',
            errorPlacement: function (error, element) {
                error.addClass('invalid-feedback');
                element.closest('.form-group').append(error);
            },
        highlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-info').addClass('has-error');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-error').addClass('has-info');
        }
        });
}]);