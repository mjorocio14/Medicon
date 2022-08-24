app.controller('MedConCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.qrData = {};
    s.bpLoader = false;
    s.showRx = false;
    s.unit = {};
    s.RxList = [];
    s.referral = {};
    s.labtest = {};
    s.diagnose = {};
    s.diagnoseInfo = {}
    s.diagnoseRemarks = '';
    s.showRxQty = false;
    s.showClientList = false;
    s.showClientListBTN = true;
    s.medHistLoader_modal = false;
    s.newlyAddedConsultID = '';
    s.isEditDiagnosis = true;

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


    function getMedicineList() {
        h.post('../MedicalConsultation/getMedicineList').then(function (d) {
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
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].fullAddress;

                    s.diagnose = {};
                    s.diagnoseInfo = {}
                    s.diagnoseRemarks = '';

                    getBPhistory(info);
                    getMedicalHistory(info);
                    s.newlyAddedConsultID = '';
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

    function getBPhistory(qrCode) {
        s.bpLoader = true;
        s.bpHistoryList = {};
        s.vitalSigns = {};
        s.BMI = {};

        h.post('../VitalSigns/getBPhistory?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                    s.bpHistoryList = d.data.bp;

                    angular.forEach(s.bpHistoryList, function (value) {
                        value.dateTimeLog = moment(value.dateTimeLog).format('lll');
                    });

                    s.vitalSigns = d.data.vs;
                    s.BMI.value = Math.round((s.vitalSigns.weight / (s.vitalSigns.height * s.vitalSigns.height)) * 100) / 100;
                    s.BMI.desc = s.BMI.value < 18.5 ? 'UNDERWEIGHT' : (s.BMI.value >= 18.5 && s.BMI.value <= 22.9) ? 'NORMAL' : (s.BMI.value >= 23 && s.BMI.value <= 24.9) ? 'OVERWEIGHT' : (s.BMI.value >= 25 && s.BMI.value <= 29.9) ? 'PRE-OBESE' : (s.BMI.value >= 30 && s.BMI.value <= 40) ? 'OBESE TYPE 1' : (s.BMI.value >= 40.1 && s.BMI.value <= 50) ? 'OBESE TYPE 2' : 'OBESE TYPE 3'
            }

            s.bpLoader = false;
        });
    }

    function getMedicalHistory(qrCode) {
        s.bpLoader = true;
        s.medHistoryList = {};

        h.post('../MedicalConsultation/getMedHistory?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (value) {
                    angular.forEach(value, function (val) {
                        val.dateTimeLog = moment(val.dateTimeLog).format('lll');
                    });
                });
                s.medHistoryList = d.data;
            }

            s.bpLoader = false;
        });
    }

    s.showDiagnoseHistory = function (history) {
        history.personnelFullname = history.personnel_firstName + ' ' + history.personnel_midInit + ' ' + history.personnel_lastName + ' ' + history.personnel_extName;
        s.medHistLoader_modal = true;
        s.diagnosisInfo = {};
        s.diagnoseHistoryList = {};
        s.rxHistoryList = {};

        h.post('../MedicalConsultation/getDiagnosisHistory?consultID=' + history.consultID).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.diagnosisInfo = angular.copy(history);
                s.diagnoseHistoryList = d.data.medHist;
                s.rxHistoryList = d.data.rxHist; console.log(d.data);
                $('#medHistory_modal').modal('show'); 
            }

            s.medHistLoader_modal = false;
        });
    }

    s.saveDiagnosis = function (refer, diagnosisCheck, detail, remarks, labtest) {
        if (s.qrData.qrCode == '' || s.qrData.qrCode == null) {
            swal({
                title: "ERROR",
                text: "<label class='text-danger'>No personal information found!</label>",
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


            // Push all checked referral to referralList
            var referralList = [];
            angular.forEach(refer, function (key, value) {
                if (key)
                    referralList.push(value);
            });

            // Push all checked diagnosis to diagnosisList
            var diagnosisList = [];
            angular.forEach(diagnosisCheck, function (key, value) {
                if (key)
                    diagnosisList.push(value);
            });

            // Push all checked laboratory to labtestList
            var labtestList = [];
            angular.forEach(labtest, function (key, value) {
                if (key)
                    labtestList.push(value);
            });

            // Push Service ID SERVICE006 - LABORATORY to referralList if laboratory are included in diagnosis
            if (labtestList.length > 0) referralList.push('SERVICE006')

            var consult = {
                vSignID: s.vitalSigns.vSignID,
                serviceID: 'SERVICE001',
                outsideReferral: detail.referDesc,
                remarks: remarks
            };
           
            h.post('../MedicalConsultation/saveDiagnosis', { qrCode: s.qrData.qrCode, checkedDiagnosis: diagnosisList, detail: detail, referral: referralList, consultation: consult, lab: labtestList }).then(function (d) {
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
                            text: d.data.msg + " <label>Proceeding with Prescription.</label>",
                            type: "success",
                            html: true,
                            confirmButtonColor: '#4bdead',
                            confirmButtonText: 'Yes',
                            closeOnConfirm: true
                        }, function (isConfirm) {
                            if (isConfirm) {
                                s.showRx = !s.showRx;
                                getMedicineList();
                                s.newlyAddedConsultID = d.data.consultID;
                                s.showClientListBTN = false;
                                s.$apply();
                            }
                        });
                    }
                });
        }
    }


    // SELECT2 INITIALIZATION
    $("#productCode").on('select2:select', function (e) {
        var data = e.params.data;
        s.unit = JSON.parse(data.id);

        s.$apply();
    });

    $("#noDay").on('select2:select', function (e) {
        var data = e.params.data;
        s.showRxQty = data.id == 'maintenance' || data.id == 'needed' || data.id == 'single' ? true : false;

        s.$apply();
    });

    var selectProduct = "";
    selectProduct = $("#productCode").select2({
        placeholder: 'Select Medicine',
        allowClear: true
    });

    var selectnoDay = "";
    selectnoDay = $("#noDay").select2({
        placeholder: 'Select No. of Days',
        allowClear: true
    });
    // /SELECT2 INITIALIZATION

    s.addMedicine = function (med) {
        if (selectnoDay.val() == '' || selectProduct.val() == '') {
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
            data.noDay = selectnoDay.val();


            //.... QTY CALCULATION
            var result = 0;

            if (data.noDay == "maintenance" || data.noDay == "needed" || data.noDay == "single") {
                data.qtyRx = data.inputQTY;
            }

            else {
                if (data.unitDesc == "Suspension" || data.unitDesc == "Syrup" || data.unitDesc == "Drops") {
                    result = data.dosage * data.perDay * data.noDay;
                    data.qtyRx = Math.ceil(result / 60);
                }

                else {
                    result = data.dosage * data.perDay * data.noDay;
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
            selectnoDay.val(null).trigger('change');
        }
    }

    s.removeMedicine = function (removeMedIndex) {
        s.RxList.splice(removeMedIndex, 1);
    }

    s.resetForm = function () {
        s.qrData = {};
        s.RxList = [];
        s.showRxQty = false;
        s.showRx = false;
        s.bpHistoryList = {};
        s.medHistoryList = {};
        s.diagnose = {};
        s.diagnoseInfo = {}
        s.diagnoseRemarks = '';
        s.searchQRcode = '';
        s.vitalSigns = {};
        s.referral = {};
        s.labtest = {};
        s.showClientListBTN = true;
    }

    s.savePrescription = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../MedicalConsultation/savePrescription', { consultID: s.newlyAddedConsultID, listRx: s.RxList }).then(function (d) {
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

    function getDiagnoseClients() {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#diagnoseList_tbl")) {
            $('#diagnoseList_tbl').DataTable().clear();
            $('#diagnoseList_tbl').DataTable().ajax.url('../MedicalConsultation/getDiagnoseClients').load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableVSlist = $('#diagnoseList_tbl').DataTable({
                "ajax": {
                    "url": '../MedicalConsultation/getDiagnoseClients',
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
                   "data": null, render: function (row) {
                       return moment(row.dateTimeEncoded).format('lll');
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button class="btn-success btn btn-xs" id="btnShowPersonDiagnosis"> Show <i class="fa fa-external-link"></i></button>'
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

            $('#diagnoseList_tbl tbody').off('click');

            $('#diagnoseList_tbl tbody').on('click', '#btnShowPersonDiagnosis', function () {
                var data = tableVSlist.row($(this).parents('tr')).data();
                data.birthdate = moment(data.birthdate).format('ll');
                data.sex = data.sex ? 'Male' : 'Female';

                $('#personDiagnosis_modal').modal('show');
                s.consultationTbl = {};
                s.resultDiag = {};
                s.resultDiag.info = data;

                h.post('../MedicalConsultation/getPersonDiagnoseResult?consultID=' + data.consultID).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        detail = [];
                        detail2 = [];

                        // Push all checked referral to referralList
                        //var referralList = [];
                        //angular.forEach(refer, function (key, value) {
                        //    if (key)
                        //        referralList.push(value);
                        //});
                        
                        // Push all checked diagnosis to diagnosisList
                        angular.forEach(d.data, function (item) {
                            detail.push(item.diagnoseID);

                            if (item.diagnoseID == 'DIAG023') { s.resultDiag.detail.otherDiagnosis = item.otherDiagnosis }
                        });
                        
                        s.resultDiag.detail = detail;
                        console.log(detail2);
                        s.consultationTbl = d.data;
                    }
                });
            });
        }

    }

    s.showDiagnoseList = function() {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            getDiagnoseClients();
        }
    }

    s.customDisabling = { "pointer-events": "none",
                          "cursor": "default" }
      

}]);