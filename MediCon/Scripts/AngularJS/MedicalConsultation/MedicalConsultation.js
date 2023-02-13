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
    s.newlyAddedConsultID = null;
    s.isEditDiagnosis = true;
    s.medicalRecord_loader = false;
    s.showMedicalRecord = false;
    s.isEditting = false;
    getSpecialist();

    s.filterResult = function (date) {
        getDiagnoseClients(date);
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
                    s.qrData.age = moment().diff(moment(d.data[0].birthdate).format('L'), 'years');
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].fullAddress;


                    s.showMLR(info);
                    getLabHistory(info);
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

    s.getBPhistory = function () {

        if (!s.showMedicalRecord)
        {
            s.diagnose = {};
            s.diagnoseInfo = {}
            s.diagnoseRemarks = '';
            s.newlyAddedConsultID = null;
            s.bpLoader = true;
            s.bpHistoryList = {};
            s.vitalSigns = {};
            s.BMI = {};

            h.post('../VitalSigns/getBPhistory?qrCode=' + s.qrData.qrCode).then(function (d) {
                if (d.data.status == 'error') {
                    swal({
                        title: "ERROR",
                        text: d.data.msg,
                        type: "error"
                    });
                }

                else {
                    s.showMedicalRecord = !s.showMedicalRecord;
                    s.bpHistoryList = d.data.bp;

                    angular.forEach(s.bpHistoryList, function (value) {
                        value.dateTimeLog = moment(value.dateTimeLog).format('lll');
                    });

                    s.vitalSigns = d.data.vs;
                    s.BMI.value = Math.round((s.vitalSigns.weight / (s.vitalSigns.height * s.vitalSigns.height)) * 100) / 100;
                    s.BMI.desc = s.BMI.value < 18.5 ? 'UNDERWEIGHT' : (s.BMI.value >= 18.5 && s.BMI.value <= 22.9) ? 'NORMAL' : (s.BMI.value >= 23 && s.BMI.value <= 24.9) ? 'OVERWEIGHT' : (s.BMI.value >= 25 && s.BMI.value <= 29.9) ? 'PRE-OBESE' : (s.BMI.value >= 30 && s.BMI.value <= 40) ? 'OBESE TYPE 1' : (s.BMI.value >= 40.1 && s.BMI.value <= 50) ? 'OBESE TYPE 2' : 'OBESE TYPE 3'
                    s.BMI.data = s.BMI.value + ' - ' + s.BMI.desc;
                }

                s.bpLoader = false;
            });
        }

        else
        {
            s.showMedicalRecord = !s.showMedicalRecord;
        }
    }

    function getLabHistory(qrCode) {
        s.bpLoader = true;
        s.labHistoryList = [];

        h.post('../MedicalConsultation/getLabHistory?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                
                angular.forEach(d.data, function (value) {
                    if (value.bloodChemResult.length > 0)
                    {
                        angular.forEach(value.bloodChemResult, function (data) {
                            data.bloodChemDateEncoded = moment(data.bloodChemDateEncoded).format('lll');
                        });
                    }
                        
                    value.dateTested = moment(value.dateTested).format('lll');
                });

                s.labHistoryList = d.data;
            }
            s.bpLoader = false;
        });
    }

    s.showMLR = function (qrCode) {
        //s.showMedicalRecord = !s.showMedicalRecord;

        //if (s.showMedicalRecord) {
            s.medicalRecord_loader = true;
            s.diagnoseHistoryList = [];
            s.rxHistoryList = [];

            h.post('../MedicalConsultation/getDiagnosisHistory?qrCode=' + qrCode).then(function (d) {
                if (d.data.status == 'error') {
                    swal({
                        title: "ERROR",
                        text: d.data.msg,
                        type: "error"
                    });
                }

                else {
                    angular.forEach(d.data.diagnosis, function (value) {
                        angular.forEach(value, function (val) {
                            val.dateTimeLog = moment(val.dateTimeLog).format('lll');
                        })
                    });

                    angular.forEach(d.data.rxHist, function (value) {
                        angular.forEach(value, function (val) {
                            val.dateTimeRx = moment(val.dateTimeRx).format('lll');
                        })
                    });

                    s.diagnoseHistoryList = d.data.diagnosis;
                    s.rxHistoryList = d.data.rxHist;

                    angular.forEach(d.data.referralRx, function (record) {
                        angular.forEach(record, function (val) {
                            val.dateTimeRx = moment(val.dateTimeRx).format('lll');
                            s.rxHistoryList.push(record);
                        })
                    });
                }
              
                s.medicalRecord_loader = false;
            });
        
    }

    function getSpecialist() {
        h.post("../LaboratoryResult/getSpecialist").then(function (d) {
            s.specialistData = d.data;
        });
    }

    s.viewLabResult = function (data) {
        
        //   URINALYSIS RESULT
        if (data.labTestID == "L0001") {    
            s.uri = {};

            h.post("../LaboratoryResult/getUrinalysisResult?labID=" + data.labID).then(function (d) {
                s.uri = d.data[0];
            });

            $('#modalUrinalysis').modal('show');
        }

        //   CBC RESULT
        else if (data.labTestID == "L0002") {
            s.cbc = {};

            h.post("../LaboratoryResult/getCBCresult?labID=" + data.labID).then(function (d) {
                s.cbc = d.data[0];
            });
            
            $('#modalCbc').modal('show');
        }

        //   FECALYSIS RESULT
        else if (data.labTestID == "L0003") {
            s.fecalysis = {};

            h.post("../LaboratoryResult/getFecalysisResult?labID=" + data.labID).then(function (d) {
                s.fecalysis = d.data;
            });

            $('#modalFecalysis').modal('show');
        }

        //   CHEST X-RAY RESULT
        else if (data.labTestID == "L0006") {

        }

        //   ECG RESULT
        else if (data.labTestID == "L0004") {
            s.ecg = {};

            h.post("../LaboratoryResult/getECGResult?labID=" + data.labID).then(function (d) {
                s.ecg = d.data;
            });

            $('#modalECG').modal('show');
        }

        //   BLOOD CHEM RESULT
        else {
            s.BCResult = {};
            s.BCResult = data;
            $('#modalBLoodChem').modal('show');
        }
    }

    s.saveDiagnosis = function (refer, diagnosisCheck, detail, remarks, labtest, otherLabDesc, xrayDesc, ecgDesc, ultrasoundDesc) {
        
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
            //angular.forEach(labtest, function (key, value) {
            //    if(value == 'LTG002') {
            //        labtestList.push('L0007');
            //        labtestList.push('L0008');
            //        labtestList.push('L0013');
            //        labtestList.push('L0014');
            //        labtestList.push('L0015');
            //    }

            //    else if (value == 'LTG003') {
            //        labtestList.push('L0016');
            //        labtestList.push('L0017');
            //        labtestList.push('L0018');
            //        labtestList.push('L0019');
            //    }
                
            //    else {
            //        if (key) {
            //            labtestList.push(value);
            //        }
            //    }
            //});

            // Push Service ID SERVICE006 - LABORATORY to referralList if laboratory are included in diagnosis
            if (labtestList.length > 0) referralList.push('SERVICE006')

            var consult = {
                vSignID: s.vitalSigns.vSignID,
                serviceID: 'SERVICE001',
                outsideReferral: detail.referDesc,
                remarks: remarks
            };
           
            h.post('../MedicalConsultation/saveDiagnosis', {
                qrCode: s.qrData.qrCode, checkedDiagnosis: diagnosisList, detail: detail, referral: referralList, consultation: consult, lab: labtestList,
                otherLab: otherLabDesc, xrayDesc: xrayDesc, ecgDesc: ecgDesc, ultrasoundDesc: ultrasoundDesc
            }).then(function (d) {
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

        // MEDICAL RECORDS
        s.showMedicalRecord = false;
        s.diagnoseHistoryList = [];
        s.rxHistoryList = [];
        s.labHistoryList = [];
    }

    s.savePrescription = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../MedicalConsultation/savePrescription', { qrCode: s.qrData.qrCode, consultID: s.newlyAddedConsultID, listRx: s.RxList }).then(function (d) {
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

    function getDiagnoseClients(dateFilter) {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#diagnoseList_tbl")) {
            $('#diagnoseList_tbl').DataTable().clear();
            $('#diagnoseList_tbl').DataTable().ajax.url("../MedicalConsultation/getDiagnoseClients?date=" + moment(dateFilter).format('YYYY-MM-DD')).load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableVSlist = $('#diagnoseList_tbl').DataTable({
                "ajax": {
                    "url": "../MedicalConsultation/getDiagnoseClients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                       return moment(row.dateTimeLog).format('lll');
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
                s.resultDiag = {};
                s.resultDiag.info = data;
                s.isEditting = false;
                
                h.post('../MedicalConsultation/getPersonVSignDiagnoseResult', { consultID: data.consultID, vSignID: data.vSignID }).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        var diag = {};
                        
                        // Push all checked diagnosis to diagnosisList
                        angular.forEach(d.data.resultDiag, function (item) {

                            if (item.diagnoseID == 'DIAG023') { s.resultDiag.otherDiagnosis = item.otherDiagnosis }

                            switch(item.diagnoseID)
                            {
                                case 'DIAG005':
                                    diag.DIAG005 = true;
                                    break;
                                case 'DIAG006':
                                    diag.DIAG006 = true;
                                    break;
                                case 'DIAG018':
                                    diag.DIAG018 = true;
                                    break;
                                case 'DIAG003':
                                    diag.DIAG003 = true;
                                    break;
                                case 'DIAG008':
                                    diag.DIAG008 = true;
                                    break;
                                case 'DIAG021':
                                    diag.DIAG021 = true;
                                    break;
                                case 'DIAG010':
                                    diag.DIAG010 = true;
                                    break;
                                case 'DIAG004':
                                    diag.DIAG004 = true;
                                    break;
                                case 'DIAG011':
                                    diag.DIAG011 = true;
                                    break;
                                case 'DIAG014':
                                    diag.DIAG014 = true;
                                    break;
                                case 'DIAG012':
                                    diag.DIAG012 = true;
                                    break;
                                case 'DIAG020':
                                    diag.DIAG020 = true;
                                    break;
                                case 'DIAG007':
                                    diag.DIAG007 = true;
                                    break;
                                case 'DIAG015':
                                    diag.DIAG015 = true;
                                    break;
                                case 'DIAG013':
                                    diag.DIAG013 = true;
                                    break;
                                case 'DIAG016':
                                    diag.DIAG016 = true;
                                    break;
                                case 'DIAG019':
                                    diag.DIAG019 = true;
                                    break;
                                case 'DIAG022':
                                    diag.DIAG022 = true;
                                    break;
                                case 'DIAG002':
                                    diag.DIAG002 = true;
                                    break;
                                case 'DIAG017':
                                    diag.DIAG017 = true;
                                    break;
                                case 'DIAG001':
                                    diag.DIAG001 = true;
                                    break;
                                case 'DIAG009':
                                    diag.DIAG009 = true;
                                    break;
                                case 'DIAG023':
                                    diag.DIAG023 = true;
                                    break;
                                case 'DIAG024':
                                    diag.DIAG024 = true;
                                    break;
                            }
                        });
                        s.resultDiag.diag = diag;
                        s.resultDiag.vitalSign = d.data.vitalSign;
                        
                        angular.forEach(d.data.bp, function (value) {
                            value.dateTimeLog = moment(value.dateTimeLog).format('lll');
                        });
                        s.resultDiag.bp = d.data.bp;
                    }
                });

                h.get('../MedicalConsultation/getPersonReferralLaboratory?consultID=' + data.consultID).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        var ref = {};
                        var laboratory = {};
                        s.otherLabDesc = '';
                        s.xrayDesc = '';
                        s.ecgDesc = '';
                        s.ultrasoundDesc = '';
                        
                        // Push all checked referral to referral
                        angular.forEach(d.data.referral, function (item) {

                            switch (item) {
                                case 'SERVICE003':
                                    ref.SERVICE003 = true;
                                    break;
                                case 'SERVICE004':
                                    ref.SERVICE004 = true;
                                    break;
                                case 'SERVICE005':
                                    ref.SERVICE005 = true;
                                    break;
                                case 'SERVICE006':
                                    ref.SERVICE006 = true;
                                    break;
                            }
                        });

                        s.resultDiag.ref = ref;
                        
                        // Push all checked laboratory to laboratory
                        angular.forEach(d.data.laboratory, function (item) {
                            switch (item.labTestID) {
                                case 'L0001':
                                    laboratory.L0001 = true;
                                    break;
                                case 'L0002':
                                    laboratory.L0002 = true;
                                    break;
                                case 'L0003':
                                    laboratory.L0003 = true;
                                    break;
                                case 'L0004':
                                    laboratory.L0004 = true;
                                    s.resultDiag.ecgDesc = item.ecgDesc;
                                    break;
                                case 'L0005':
                                    laboratory.L0005 = true;
                                    break;
                                case 'L0006':
                                    laboratory.L0006 = true;
                                    s.resultDiag.xrayDesc = item.xrayDesc;
                                    break;
                                case 'L0007':
                                    laboratory.L0007 = true;
                                    break;
                                case 'L0008':
                                    laboratory.L0008 = true;
                                    break;
                                case 'L0009':
                                    laboratory.L0009 = true;
                                    break;
                                case 'L0010':
                                    laboratory.L0010 = true;
                                    break;
                                case 'L0011':
                                    laboratory.L0011 = true;
                                    break;
                                case 'L0012':
                                    laboratory.L0012 = true;
                                    break;
                                case 'L0022':
                                    laboratory.L0022 = true;
                                    s.resultDiag.otherLabDesc = item.otherLabDesc;
                                    break;
                                case 'L0023':
                                    laboratory.L0023 = true;
                                    s.resultDiag.ultrasoundDesc = item.ultrasoundDesc;
                                    break;
                                case 'L0024':
                                    laboratory.L0024 = true;
                                    break;
                            }
                        });
                        s.resultDiag.laboratory = laboratory;
                    }
                });
                
            });
        }

    }

    s.showDiagnoseList = function () {
       
        s.showClientList = !s.showClientList;
        
        if (s.showClientList) {
            s.FilterDate = new Date();
            getDiagnoseClients(s.FilterDate);
        }
    }

    s.returnToHome = function () {
        if (s.showClientList == false && s.showRx == false)
        {
            h.post('../VitalSigns/getBPhistory?qrCode=' + s.qrData.qrCode).then(function (d) {

            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                //s.showClientList = true;
                s.showMedicalRecord = true;
                s.showRx = true;
                getMedicineList();
                }
            });
        }

        else
        {
            s.showRxQty = false;
            s.showRx = false;
            s.showClientListBTN = true;
            s.showMedicalRecord = false;
        }
    }

    s.saveUpdate = function (result) {
        if (s.isEditting == false) {
            s.isEditting = true;
        }

        else {
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            // Push all checked diagnosis to diagnosisList
            var diagnosisList = [];
            angular.forEach(result.diag, function (key, value) {
                if (key)
                   diagnosisList.push(value);
            });

            // Push all checked referral to referralList
            var referralList = [];
            angular.forEach(result.ref, function (key, value) {
                if (key && value != 'SERVICE006')
                    referralList.push(value);
            });
            
            // Push all checked laboratory to labList
            var labList = [];
            angular.forEach(result.laboratory, function (key, value) {
                if (value == 'LTG002') {
                    labList.push('L0007');
                    labList.push('L0008');
                    labList.push('L0013');
                    labList.push('L0014');
                    labList.push('L0015');
                }

                else if (value == 'LTG003') {
                    labList.push('L0016');
                    labList.push('L0017');
                    labList.push('L0018');
                    labList.push('L0019');
                }

                else {
                    if (key) {
                        labList.push(value);
                    }
                }
            });

            // Push Service ID SERVICE006 - LABORATORY to referralList if laboratory are included in diagnosis
            if (labList.length > 0) referralList.push('SERVICE006');

            h.post('../MedicalConsultation/updateDiagnosis', {
                qrCode: result.info.qrCode, consult: result.info, diagnosis: diagnosisList, otherDiagnose: result.otherDiagnosis,
                referral: referralList, otherReferral: result.info.outsideReferral, labReq: labList, otherLab: result.otherLabDesc
            }).then(function (d) {
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
                    });

                    $('#personDiagnosis_modal').modal('hide');
                    getDiagnoseClients();
                    s.$apply();
                }
            });

        }
    }

    s.printRx = function (data, length) {
        h.post('../Print/printRX', { rxID: data.rxID, info: s.qrData, physician: data.physician[0], length: length }).then(function (d) {
            window.open("../Report/MediConRpt.aspx?type=prescription");
        });
    }

}]);