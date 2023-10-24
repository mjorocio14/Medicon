app.controller('ToothExtractionCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    getMedicineList();
    s.showRx = false;
    s.qrData = {};
    s.bpLoader = false;
    s.unit = {};
    s.RxList = [];
    s.diagLoader = false;
    s.consultIDvalue = null;

    function getMedicineList() {
        h.post('../Dental/getMedicineList').then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.medList = {};
                s.medList = d.data;
            }
        });
    }

    $("#productCode").on('select2:select', function (e) {
        var data = e.params.data;
        s.unit = JSON.parse(data.id);
        s.$apply();
    });

    $("#noDays").on('select2:select', function (e) {
        var data = e.params.data;
        s.showRxQty = data.id == 'maintenance' || data.id == 'needed' || data.id == 'single' ? true : false;

        s.$apply();
    });

    s.addMedicine = function (med) {
        if (selectNoDays.val() == '' || selectProduct.val() == '') {
            swal({
                title: "ERROR",
                text: "Please <label class='text-danger'>fill-in</label> all the needed data.",
                type: "error",
                html: true
            });
        }

        else {
            var data = angular.copy(med);
            var val = JSON.parse(selectProduct.val());

            data.productDesc = val.productDesc;
            data.productCode = val.productCode;
            data.unitDesc = val.unitDesc;
            data.noDays = selectNoDays.val();


            //.... QTY CALCULATION
            var result = 0;

            if (data.noDays == "maintenance" || data.noDays == "needed" || data.noDays == "single") {
                data.qtyRx = data.inputQTY;
            }

            else {
                if (data.unitDesc == "Suspension" || data.unitDesc == "Syrup" || data.unitDesc == "Drops") {
                    result = data.dosage * data.perDay * data.noDays;
                    data.qtyRx = Math.ceil(result / 60);
                }

                else {
                    result = data.dosage * data.perDay * data.noDays;
                    data.qtyRx = result;
                }
            }
            //.... /QTY CALCULATION

            if (data.qtyRx > val.AVAILABLE) {
                swal({
                    title: "AVAILABILITY ADVISORY",
                    text: "<label>Please inform the patient that " + (val.AVAILABLE == 0 || val.AVAILABLE == null ? "this medicine is already <text class='text-danger'>OUT OF STOCK.</text></label>" : "the available stock of this medicine is <label class='text-danger'>insufficient</label>.")
                            + "<br/>Prescripted: <label>" + data.qtyRx + "</label><br/>Available: <label>" + (val.AVAILABLE == null ? 0 : val.AVAILABLE) + "</label>",
                    type: "info",
                    html: true
                });
            }

            s.RxList.push(data);

            s.meds = {};
            s.unit = '';
            result = 0;
            s.showRxQty = false;
            selectProduct.val('').trigger('change');
            selectNoDays.val(null).trigger('change');
        }
    }

    s.removeMedicine = function (removeMedIndex) {
        s.RxList.splice(removeMedIndex, 1);
    }

    s.getClientRx = function () {
        if(s.consultIDvalue == null)
        {
            swal({
                title: "ERROR",
                text: "Patient has no dental record yet, please refer to Oral Examination.",
                type: "error",
                html: true
            });
        }

        else {
            s.showRx = !s.showRx;

            h.post('../Dental/getRxList?consultID=' + s.consultIDvalue).then(function (d) {
                s.RxList = {};
                s.RxList = d.data;
            })
        }
    }


    //function getDiagnoseClientList() {
    //    s.clientLoader = true;

    //    h.post('../VitalSigns/getClientList?ServiceID=' + "SRV0022").then(function (d) {
    //        if (d.data.status == 'error') {
    //            swal({
    //                title: "ERROR",
    //                text: d.data.msg,
    //                type: "error"
    //            });
    //        }

    //        else {
    //            s.diagnoseClientList = {};
    //            s.diagnoseClientList = d.data;

    //            angular.forEach(s.diagnoseClientList, function (value) {
    //                value.dateTimeLog = moment(value.dateTimeLog).format('lll');
    //                value.age = moment().diff(moment(value.birthdate).format('L'), 'years');
    //            });
    //        }

    //        s.clientLoader = false;
    //    });



    //    vsIndexNo = 1;

    //    if ($.fn.DataTable.isDataTable("#listOralClient_tbl")) {
    //        $('#listOralClient_tbl').DataTable().clear();
    //        $('#listOralClient_tbl').DataTable().ajax.url('../VitalSigns/getClientList?ServiceID=SRV0022').load();
    //    }

    //    else {
    //        //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
    //        var tableOralList = $('#listOralClient_tbl').DataTable({
    //            "ajax": {
    //                "url": '../VitalSigns/getClientList?ServiceID=SRV0022',
    //                "type": 'POST',
    //                "dataSrc": "",
    //                "recordsTotal": 20,
    //                "recordsFiltered": 20,
    //                "deferRender": true
    //            },
    //            "pageLength": 25,
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
    //                    return '<strong>' + row.lastName + '</strong>';
    //                }
    //            }, {
    //                "data": null,
    //                render: function (row) {
    //                    return '<strong>' + row.firstName + '</strong>';
    //                }
    //            }
    //            , {
    //                "data": null,
    //                render: function (row) {
    //                    return row.middleName == null ? '' : '<strong>' + row.middleName + '</strong>';
    //                }
    //            },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row.extName == null ? '' : '<strong>' + row.extName + '</strong>';
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row.sex ? "M" : "F";
    //               }
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   var age = moment().diff(moment(row.birthdate).format('L'), 'years');
    //                   return age <= 12 ? '<span class="label label-primary">' + age + '</span>' : '<span class="label label-success">' + age + '</span>';
    //               }
    //           },
    //           {
    //               "data": 'contactNo'
    //           },
    //           {
    //               "data": null,
    //               render: function (row) {
    //                   return row.brgyDesc + ', ' + row.citymunDesc + ', ' + row.provDesc
    //               }
    //           },
    //           {
    //               "data": null, render: function (row) {
    //                   return moment(row.dateTimeLog).format('lll');
    //               }
    //           },
    //           {
    //               "data": null, render: function () {
    //                   return '<button class="btn-success btn btn-xs" id="btnShowOralDiagnosis"> Show <i class="fa fa-external-link"></i></button>'
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

    //        $('#listOralClient_tbl tbody').off('click');

    //        $('#listOralClient_tbl tbody').on('click', '#btnShowOralDiagnosis', function () {
    //            var data = tableOralList.row($(this).parents('tr')).data();

    //            s.diagnosisInfo = {};
    //            s.diagnosisInfo.doctorName = data.DrLastName + ", " + data.DrFirstName + " " + data.DrMiddleName;
    //            s.diagnosisInfo.dateTimeLog = moment(data.dateTimeLog).format('lll');
    //            s.diagnosisInfo.remarks = data.remarks;

    //            h.post('../VitalSigns/getDiagnosis?ConsultID=' + data.consultID).then(function (d) {
    //                if (d.data.status == 'error') {
    //                    swal({
    //                        title: "ERROR",
    //                        text: d.data.msg,
    //                        type: "error"
    //                    });
    //                }

    //                else {
    //                    s.diagnosisList = {};
    //                    s.diagnosisList = d.data;
    //                    $('#diagnosHistory_modal').modal('show');
    //                }
    //            });
    //        });
    //    }


    //}


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

    s.searchByName = function () {
        s.searchResultList = [];
        s.infoFormData = {};
        $('#modalPatient').modal('show');
    }

    s.mainSearchByName = function (data) {
        s.modal_tableLoader = true;

        h.post('../QRPersonalInfo/getInfoByName', { lastName: data.lastName, firstName: data.firstName }).then(function (d) {
            s.searchResultList = [];

            if (d.data.status == 'error') {
                swal({
                    title: "Searching failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (item) {
                    item.birthDate = item.birthDate != null ? moment(item.birthDate).format('ll') : null;
                })

                s.searchResultList = d.data;
            }

            s.modal_tableLoader = false;
        })
    }

    s.selectEmp = function (empData) {
        formatEmpData(empData);
        s.diagnoseRemarks = '';
        s.isEditting = false;
        getBPhistory(empData.qrCode, empData.birthdate);
        $('#modalPatient').modal('hide');
    }

    function formatEmpData(data) {
        data.birthdate = data.birthDate != null ? new Date(moment(data.birthDate).format()) : null;
        data.sex = data.sex != null ? (data.sex == "MALE" ? 'true' : 'false') : null;
        s.qrData = data;
        s.qrData.age = moment().diff(moment(data.birthdate).format('L'), 'years');
        s.qrData.fullAddress = (data.brgyPermAddress == null ? "" : data.brgyPermAddress) + ' '
                                + (data.cityMunPermAddress == null ? "" : data.cityMunPermAddress) + ' '
                                + (data.provincePermAddress == null ? "" : data.provincePermAddress);
    }

    s.mainSearch = function (info) {
        s.loader = true;
        s.bpHistoryList = {};
        s.vitalSigns = {};

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
            s.qrData = {};
            s.diagnose = {};
            s.diagnoseInfo = {};
            s.diagnosisList = {};

            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                formatEmpData(d.data);

                s.diagnoseRemarks = '';
                s.isEditting = false;
                getBPhistory(info, d.data.birthdate);
                s.diagLoader = true;
            }

            s.diagLoader = false;
            s.loader = false;
        })
    }

    function getBPhistory(qrCode, age) {
        s.bpLoader = true;
        s.vitalSigns = {};

        h.post('../VitalSigns/getBPhistory?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.vitalSigns = d.data.vs;
                s.bpHistoryList = angular.forEach(d.data.bp, function (value) {
                    value.dateTimeLog = moment(value.dateTimeLog).format('lll');
                });

                getDiagnosis(d.data.vs.vSignID);
            }

            s.bpLoader = false;
        });
    }

    function getDiagnosis(a) {
        h.post('../Dental/getDiagnosis?vitalSignID=' + a).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.diagnosisList = {};
                s.diagnosisList = d.data.diagList;
                s.consultIDvalue = d.data.consultID;
             
                angular.forEach(s.diagnosisList, function (value) {
                    value.dateTimeLog = moment(value.dateTimeLog).format('lll');
                });
            }
        });
    }

    s.resetForm = function () {
        s.qrData = {};
        s.RxList = [];
        s.showRxQty = false;
        s.showRx = false;
        s.bpHistoryList = {};
        s.diagnose = {};
        s.diagnosisList = {};
        s.diagnoseInfo = {}
        s.diagnoseRemarks = '';
        s.searchQRcode = '';
        
    }

    s.savePrescription = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../Dental/updatePrescription', { consultID: s.consultIDvalue, newListRx: s.RxList }).then(function (d) {
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
                    type: "success",
                });

                s.resetForm();
            }
        });
    }


    //.....   SELECT2
    var selectProduct = "";
    selectProduct = $("#productCode").select2({
        placeholder: 'Select Medicine',
        allowClear: true
    });

    var selectNoDays = "";
    selectNoDays = $("#noDays").select2({
        placeholder: 'Select No. of Days',
        allowClear: true
    });
    //.....   /SELECT2

}]);
