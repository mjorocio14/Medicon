app.controller('OralExamCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.bpLoader = false;
    s.qrData = {};
    getDentalPersonnel();
    s.diagnose = {};
    s.diagnoseInfo = {}
    s.diagnoseRemarks = '';
    s.vitalSignID = '';
    getMedicineList();
    s.unit = {};
    s.RxList = [];
    s.conslultID = '';
    //var vsIndexNo = 1;
    //getDiagnoseClientList();
    s.showRx = false;
    s.isEdittingDiagnosis = false;
    s.per = {};
    

    //s.showRxQty = false;
    s.showClientList = false;
    s.showClientListBTN = true;

    s.filterResult = function (date) {
        getDiagnoseClientList(date);
    }

    s.showDiagnoseList = function () {
       
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.dentalFilterDate = new Date();
            getDiagnoseClientList(s.dentalFilterDate);
        }
    };

    function getDiagnoseClientList(dateFilter) {
        s.clientLoader = true;

        var vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#listOralClient_tbl")) {
            $('#listOralClient_tbl').DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableOralList = $('#listOralClient_tbl').DataTable({
                "ajax": {
                    "url": "../Dental/getClientList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
                    "type": 'POST',
                    "dataSrc": "",
                    "recordsTotal": 20,
                    "recordsFiltered": 20,
                    "deferRender": true
                },
                "pageLength": 25,
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
                       return row.sex == "MALE" ? "M" : "F";
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       var age = moment().diff(moment(row.birthDate).format('L'), 'years');
                       return age <= 12 ? '<span class="label label-primary">' + age + '</span>' : '<span class="label label-success">' + age + '</span>';
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.dateTimeLog).format('lll');
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button class="btn-success btn btn-xs" id="btnShowOralDiagnosis"> Show <i class="fa fa-external-link"></i></button>'
                   }
               }
                ],
                "order": [[0, "asc"]],
                'columnDefs': [
                   {
                       "targets": [0, 5, 6, 7, 8],
                       "className": "text-center"
                   }]
            });

            $('#listOralClient_tbl tbody').off('click');

            $('#listOralClient_tbl tbody').on('click', '#btnShowOralDiagnosis', function () {
                var data = tableOralList.row($(this).parents('tr')).data();
              
                s.diagnosisInfo = {};
                s.diagnosisInfo.doctorName = data.dentistID ? (data.Dentist[0].DrLastName + ", " + data.Dentist[0].DrFirstName + " " + (data.Dentist[0].DrMiddleName != null ? data.Dentist[0].DrMiddleName : '') + (data.Dentist[0].DrExtName != null ? data.Dentist[0].DrExtName : '')) : '';
                s.diagnosisInfo.dateTimeLog = moment(data.dateTimeLog).format('lll');
                s.diagnosisInfo.remarks = data.remarks;
                s.diagnosisInfo.outsideReferral = data.outsideReferral;
                s.diagnosisInfo.toothNum = data.toothNum;
                s.diagnosisInfo.rawData = data;

                s.diagnosisList = {};
                s.diagnosisList = data.diagnosis;
                s.$apply();

                h.post('../Dental/getClientRx?consultID=' + data.consultID).then(function (d) {
                    s.rxHistoryList = {};

                    s.rxHistoryList = d.data;
                    s.rxHistoryList.dateTimeRx = moment(s.rxHistoryList.dateTimeRx).format('lll');
                })

                $('#diagnosHistory_modal').modal('show');
                
            });
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
        s.bpHistoryList = {};

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
            s.qrData = {};
            s.diagnose = {};
            s.diagnoseInfo = {}
            s.vitalSigns = {};

            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                    d.data.birthdate = d.data.birthDate != null ? new Date(moment(d.data.birthDate).format()) : null;
                    d.data.sex = d.data.sex != null ? (d.data.sex == "MALE" ? 'true' : 'false') : null;
                    s.qrData = d.data;
                    s.qrData.age = moment().diff(moment(d.data.birthdate).format('L'), 'years');
                    s.qrData.fullAddress = (d.data.brgyPermAddress == null ? "" : d.data.brgyPermAddress) + ' '
                                            + (d.data.cityMunPermAddress == null ? "" : d.data.cityMunPermAddress) + ' '
                                            + (d.data.provincePermAddress == null ? "" : d.data.provincePermAddress);

                    s.diagnoseRemarks = '';
                    s.isEditting = false;
                    getBPhistory(info, d.data.birthdate);

            }
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
                s.bpHistoryList = d.data.bp;

                angular.forEach(s.bpHistoryList, function (value) {
                    value.BPdateTime = moment(value.BPdateTime).format('lll');
                    value.AvaileDateTime = moment(value.AvaileDateTime).format('lll');
                });

                    var max = moment(d.data.maxVS).format('L');
                    var today = new Date();
                    today = moment(today).format('L');

                    var isBPtoday = max == today ? true : false;
                    if (isBPtoday == false) {
                        swal({
                            title: "ERROR",
                            text: "<label>Patient is <text class='text-danger'>NOT YET Screen (Vital Signs)<text> for today!</label>",
                            type: "error",
                            html: true
                        });
                    }
                        
                    else {
                        s.vitalSignID = d.data.vs.vSignID;
                        s.vitalSigns.age = age;
                        s.vitalSigns.weight = d.data.vs.weight + ' kg' ;
                        s.vitalSigns.height = d.data.vs.height + ' m'; 
                    }
                      
            }
            s.bpLoader = false;
        });
    }

    s.saveDiagnosis = function (diagnosisCheck, detail, personnelID) {

        detail.vSignID = angular.copy(s.vitalSignID);
      
        if (s.qrData.qrCode == '' || s.qrData.qrCode == null) {
            swal({
                title: "ERROR",
                text: "<label class='text-danger'>NO Personal Information found!</label>",
                type: "error",
                html: true
            });
        }

        else {
            if (s.bpHistoryList.length == 0) {
                swal({
                    title: "ERROR",
                    text: "Patient is <label class='text-danger'>NOT yet screened</label> or <label class='text-danger'>NO Vital Sign record</label> found!",
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


                var listChecked = [];
                angular.forEach(diagnosisCheck, function (key, value) {
                    if (key)
                        listChecked.push(value);
                });

                h.post('../Dental/saveDentalDiagnosis', { checkedDiagnosis: listChecked, detail: detail, dentistID: personnelID, otherDiag: detail.otherDiagnose }).then(function (d) {
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
                                //getDiagnoseClientList();
                                s.showClientListBTN = false;
                                s.conslultID = d.data.result;
                                s.$apply();
                            }
                        });

                    }
                });
            }
        }
    }

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

    function getDentalPersonnel() {
        h.post('../Dental/getDentalPersonnel').then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.personnelList = {};
                s.personnelList = d.data;
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

    s.resetForm = function () {
        s.qrData = {};
        s.RxList = [];
        s.showRxQty = false;
        s.showRx = false;
        s.bpHistoryList = {};
        s.diagnose = {};
        s.diagnoseInfo = {}
        s.diagnoseRemarks = '';
        s.searchQRcode = '';
        s.conslultID = '';
        s.vitalSigns = {};
        s.showClientListBTN = true;
    }

    s.savePrescription = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../Dental/savePrescription_Dental', { consultID: s.conslultID, listRx: s.RxList }).then(function (d) {
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

    s.editDiagnosis = function (data) {
        data.rawData.birthdate = data.rawData.birthDate != null ? new Date(moment(data.rawData.birthDate).format()) : null;
        data.rawData.sex = data.rawData.sex != null ? (data.rawData.sex == "true" ? 'true' : 'false') : null;

        s.qrData = data.rawData;
        s.qrData.age = moment().diff(moment(data.rawData.birthDate).format('L'), 'years');
        s.qrData.fullAddress = (data.rawData.brgyPermAddress == null ? "" : data.rawData.brgyPermAddress) + ' '
                                + (data.rawData.cityMunPermAddress == null ? "" : data.rawData.cityMunPermAddress) + ' '
                                + (data.rawData.provincePermAddress == null ? "" : data.rawData.provincePermAddress);

        s.isEdittingDiagnosis = true;
        s.diagnose = {};
        s.diagnoseInfo = {}
        getBPhistory(data.rawData.qrCode, s.qrData.age);
 
        angular.forEach(data.rawData.diagnosis, function (rec) {
            switch(rec.diagnoseID)
            {
                case 'DIAG023':     // Other Diagnosis
                    s.diagnose.DIAG023 = true;
                    s.diagnoseInfo.otherDiagnose = rec.otherDiagnosis;
                    break;
                case 'DIAG048':     // Cellulitis/Dento Alveolar Abscess
                    s.diagnose.DIAG048 = true;
                    break;
                case 'DIAG049':     // Tooth Extraction
                    s.diagnose.DIAG049 = true;
                    s.diagnoseInfo.toothNum = data.rawData.toothNum;
                    s.per.personnelID = data.rawData.dentistID;
                    break;
                case 'DIAG024':     // Referral
                    s.diagnoseInfo.outsideReferral = data.rawData.outsideReferral;
                    s.diagnoseInfo.remarks = data.rawData.remarks;
                    break;
            }
        });

        s.showClientList = !s.showClientList;
        $('#diagnosHistory_modal').modal('hide');
    }

    s.cancelEditting = function () {
        s.resetForm();
        s.isEdittingDiagnosis = false;
        s.showClientList = !s.showClientList;
    }
    
    s.updateDiagnosis = function (diagnosis, info, dentist) {
        if(!diagnosis.DIAG023 && !diagnosis.DIAG048 && !diagnosis.DIAG049 && !info.outsideReferral)
        {
            swal({
                title: "Failed",
                text: "Please fill-up the diagnosis form!",
                type: "error"
            });
        }

        else {
            
                    swal({
                        title: "UPDATING",
                        text: "Please wait while we are updating your data.",
                        type: "info",
                        showConfirmButton: false
                    });


                    var listChecked = [];
                    angular.forEach(diagnosis, function (key, value) {
                        if (key)
                            listChecked.push(value);
                    });

                    let updateInfo = {};
                    updateInfo.consultID = s.qrData.consultID;
                    updateInfo.outsideReferral = info.outsideReferral;
                    updateInfo.remarks = info.remarks;
                    updateInfo.toothNum = info.toothNum;
                    updateInfo.dentistID = dentist;

                    h.post('../Dental/updateDentalDiagnosis', { checkedDiagnosis: listChecked, detail: updateInfo, otherDiag: info.otherDiagnose }).then(function (d) {
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
                                showConfirmButton: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    //s.showRx = !s.showRx;
                                    getDiagnoseClientList();
                                    s.cancelEditting();
                                    //s.showClientListBTN = false;
                                    //s.conslultID = d.data.result;
                                    s.$apply();
                                }
                            });

                        }
                    });
                }
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

app.filter('ageFilter', function () {
    return function (birthday) {
        var birthday = new Date(birthday);
        var today = new Date();
        var age = ((today - birthday) / (31557600000));
        var age = Math.floor(age);
        return age;
    }
});