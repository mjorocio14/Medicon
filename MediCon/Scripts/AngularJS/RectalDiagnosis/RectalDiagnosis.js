app.controller('RectalDiagnosisCtrl', ['$scope', '$http', function (s, h) {
    s.medicalRecord_loader = false;
    s.loader = false;
    s.qrData = {};
    s.bpLoader = false;
    s.labLoader = false;
    s.rectalExamLoader = false;
    s.diagnosePanel = false;
    s.RxList = [];
    s.showClientList = false;
    s.showBtnClientList = true;
    getSpecialist();
    s.isViewing = false;
    s.isEditting = false;
    s.isViewingLab = false;
    s.isEdittingLab = false;
    s.isViewingRx = false;
    s.isEdittingRx = false;
    var rxListData = {};

    s.filterResult = function (date) {
        getRectalClients(date);
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

    s.mainSearch = function (qrCode) {
        s.loader = true;

        h.post("../QRPersonalInfo/getQRInfo?qrCode=" + qrCode).then(function (d) {
            s.qrData = {};
            s.rectalExamList = [];
            s.rectalHistoryList = [];
            s.rectalRxList = [];
            s.labHistoryList = [];
            s.bpHistoryList = [];
            s.vitalSigns = {};
            s.BMI = {};

            if (d.data.status == "error") 
            {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error",
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

                    getRectalExam(qrCode);
                    getRectalHistory(qrCode);
                    getLabHistory(qrCode);
                    getBPhistory(qrCode);
            }

            s.loader = false;
        })
    }

    function getBPhistory(qrCode) {
        s.bpLoader = true;
        s.bpHistoryList = [];
        s.vitalSigns = {};
        s.BMI = {};

        h.post('../VitalSigns/getBPhistory?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error' && s.rectalExamList.length == 0) {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                if (d.data.bp !== undefined) {
                s.bpHistoryList = d.data.bp;
               
                angular.forEach(s.bpHistoryList, function (value) {
                    value.dateTimeLog = moment(value.dateTimeLog).format("lll");
                });

                s.vitalSigns = d.data.vs;
                  s.BMI.value =
                  Math.round(
                    (s.vitalSigns.weight /
                      (s.vitalSigns.height * s.vitalSigns.height)) *
                      100
                  ) / 100;

                    s.BMI.desc =
                      s.BMI.value < 18.5
                        ? "UNDERWEIGHT"
                        : s.BMI.value >= 18.5 && s.BMI.value <= 22.9
                        ? "NORMAL"
                        : s.BMI.value >= 23 && s.BMI.value <= 24.9
                        ? "OVERWEIGHT"
                        : s.BMI.value >= 25 && s.BMI.value <= 29.9
                        ? "PRE-OBESE"
                        : s.BMI.value >= 30 && s.BMI.value <= 40
                        ? "OBESE TYPE 1"
                        : s.BMI.value >= 40.1 && s.BMI.value <= 50
                        ? "OBESE TYPE 2"
                        : "OBESE TYPE 3";
                    s.BMI.data = s.BMI.value + " - " + s.BMI.desc;
                }
            }
        });

        s.bpLoader = false;

    }

    function getRectalHistory(qrCode) {
        s.medicalRecord_loader = true;
        s.rectalHistoryList = [];
        s.rectalRxList = [];

        h.post('../RectalDiagnosis/getRectalHistory?qrCode=' + qrCode).then(function (d) {
            
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data.rectal, function (value) {
                    value.diagnoseDT = moment(value.diagnoseDT).format('lll');
                    value.interviewDT = moment(value.interviewDT).format('lll');
                });

                s.rectalHistoryList = d.data.rectal;
                
                angular.forEach(d.data.rx, function (value) {
                    angular.forEach(value, function (record) {
                        record.dateTimeRx = moment(value.record).format('lll');
                    })
                });
                s.rectalRxList = d.data.rx;
            }

            s.medicalRecord_loader = false;
        });
    }

    function getLabHistory(qrCode) {
        s.labLoader = true;
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
                    value.dateTested = moment(value.dateTested).format('lll');
                });

                s.labHistoryList = d.data;
            }
            s.labLoader = false;
        });
    }

    function getRectalExam(qrCode) {
        s.rectalExamLoader = true;
        s.rectalExamList = [];

        h.post('../RectalDiagnosis/getRectalExam?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (value) {
                    value.interviewDT = moment(value.interviewDT).format('lll');
                });
                s.rectalExamList = d.data;
            }
   
            s.rectalExamLoader = false;
        });
    }

    s.proceedDiagnosis = function (viewingBool, data) {
        s.isViewing = false;
        s.isViewingLab = false;
        s.isViewingRx = false;

        s.isEditting = false;
        s.isEdittingLab = false;
        s.isEdittingRx = false;
        
        s.setActiveTab('tabDiag');
        s.diagnosePanel = true;
        s.showBtnClientList = false;
       
        s.mrh = {};
        s.mrh = data;

        s.rectalDiagnosis = {};
        getMedicineList();

        if (viewingBool) {
            s.isViewing = true;
            s.isViewingLab = true;
            s.isViewingRx = true;
            s.rectalDiagnosis = data.rectalDiagnosis;
            s.rectalDiagnosis.consistency = '' + data.rectalDiagnosis.consistency;
            s.rectalDiagnosis.texture = '' + data.rectalDiagnosis.texture;
            s.rectalDiagnosis.mobility = '' + data.rectalDiagnosis.mobility;

            s.mrh = {};
            s.mrh = data.rectalInterview;
            s.mrh.referralID = data.mrhInfo.referralID;
            s.mrh.consultID = data.mrhInfo.consultID;
        }

        else {
            s.rectalDiagnosis = data;
            resetLabForm();
        }

        s.mrh.fullName = viewingBool ? data.personInfo.firstName + ' ' + (data.personInfo.middleName == null ? '' : data.personInfo.middleName) + ' ' + data.personInfo.lastName + ' ' + (data.personInfo.extName == null ? '' : data.personInfo.extName)
                                        : s.qrData.firstName + ' ' + (s.qrData.middleName == null ? '' : s.qrData.middleName) + ' ' + s.qrData.lastName + ' ' + (s.qrData.extName == null ? '' : s.qrData.extName);

        if (viewingBool) birthdate = data.personInfo.birthDate != null ? new Date(moment(data.personInfo.birthDate).format()) : null;
        s.mrh.age = viewingBool ? moment().diff(moment(birthdate).format('L'), 'years') : s.qrData.age;
        
    }

    s.saveDiagnosis = function (diag) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });
       
        h.post("../RectalDiagnosis/saveDiagnosis", { mrd: diag, requestID: diag.requestID }).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "ERROR",
                    text: "<label>" + d.data.msg + "</label>",
                    type: "error",
                    html: true,
                });
            } else {
                swal({
                    title: "SUCCESSFUL",
                    text: d.data.msg,
                    type: "success",
                    html: true,
                });

                s.rectalDiagnosis = {};
                s.setActiveTab('tabLab');
            }
        });
    }

    s.saveLaboratory = function (lab, otherLab, xrayDesc, ecgDesc, ultrasoundDesc)
    {
        if (lab == null) {
            swal({
                title: "ERROR",
                text: "<label>Please tick a laboratory test before saving.</label>",
                type: "error",
                html: true,
            });
        }

        else {
            // Push all checked laboratory to labtestList
            var labtestList = [];
            angular.forEach(lab, function (key, value) {
                if (key)
                    labtestList.push(value);
            });

            // Push Service ID SERVICE006 - LABORATORY to referralList if laboratory are included in diagnosis
            var referredService = null;
            if (labtestList.length > 0) referredService = 'SERVICE006';

            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            h.post('../RectalDiagnosis/saveLaboratory', {
                labtest: labtestList, referralID: s.mrh.referralID, otherLab: otherLab, xrayDesc: xrayDesc, ecgDesc: ecgDesc, ultrasoundDesc: ultrasoundDesc
            }).then(function (d) {
                if (d.data.status == "error") {
                    swal({
                        title: "ERROR",
                        text: "<label>" + d.data.msg + "</label>",
                        type: "error",
                        html: true,
                    });
                } else {
                    swal({
                        title: "SUCCESSFUL",
                        text: d.data.msg,
                        type: "success",
                        html: true,
                    });

                    s.labtest = {};
                    s.otherLabDesc = '';
                    s.setActiveTab('tabMed');
                }
            });
        }
    }

    s.updateDiagnosis = function (diag) {
        swal({
            title: "UPDATING",
            text: "Please wait while we are updating your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post("../RectalDiagnosis/updateDiagnosis", { mrd: diag }).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "ERROR",
                    text: "<label>" + d.data.msg + "</label>",
                    type: "error",
                    html: true,
                });
            } else {
                swal({
                    title: "SUCCESSFUL",
                    text: d.data.msg,
                    type: "success",
                    html: true,
                });

                s.setActiveTab('tabLab');

                s.isViewing = true;
                s.isEditting = false;
                //s.showClientList = true;
            }
        });
    }

    s.updateLaboratory = function (labtest, otherLabDesc, xrayDesc, ecgDesc, ultrasoundDesc)
    {
        // Push all checked laboratory to labtestList
        var labtestList = [];
        angular.forEach(labtest, function (key, value) {
            if (key)
                labtestList.push(value);
        });

        swal({
            title: "UPDATING",
            text: "Please wait while we are updating your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post("../RectalDiagnosis/updateLaboratory", { labtest: labtestList, referralID: s.mrh.referralID, otherLab: otherLabDesc, xrayDesc: xrayDesc, ecgDesc: ecgDesc, ultrasoundDesc: ultrasoundDesc }).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "ERROR",
                    text: "<label>" + d.data.msg + "</label>",
                    type: "error",
                    html: true,
                });
            } else {
                swal({
                    title: "SUCCESSFUL",
                    text: d.data.msg,
                    type: "success",
                    html: true,
                });

                s.setActiveTab('tabMed');

                s.isViewingLab = true;
                s.isEdittingLab = false;
                //s.showClientList = true;
            }
        });
    }

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

    s.savePrescription = function () {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../RectalDiagnosis/savePrescription', { referralID: s.mrh.referralID, listRx: s.RxList, consultID: s.mrh.consultID }).then(function (d) {
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

                s.RxList = [];
                s.diagnosePanel = false;
                s.showBtnClientList = true;
                s.resetForm();
            }
        });
    }

    s.updatePrescription = function () {
        swal({
            title: "UPDATING",
            text: "Please wait while we are updating your data.",
            type: "info",
            showConfirmButton: false
        });
       
        h.post('../RectalDiagnosis/updatePrescription', { referralID: s.mrh.referralID, newListRx: s.RxList, consultID: s.mrh.consultID }).then(function (d) {
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

                rxListData = {};
                s.isViewingRx = true;
                s.isEdittingRx = false;
            }
        });
    }

    s.resetForm = function () {
        s.qrData = {};
        s.searchQRcode = "";
        s.rectalHistoryList = [];
        s.rectalRxList = [];
        s.bpHistoryList = [];
        s.vitalSigns = {};
        s.BMI = {};
        s.labHistoryList = [];
        s.rectalExamList = [];
    }

    function resetLabForm() {
        s.labtest = {};
        s.labIsEncoded = [];
        s.xrayDesc = '';
        s.ecgDesc = '';
        s.ultrasoundDesc = '';
        s.otherLabDesc = '';
    }

    s.viewRecord = function (data) {
        s.rectalRecord = {};
        data.consistency = data.consistency == 0 ? "0" : data.consistency == 1 ? "1" : data.consistency == 2 ? "2" : "";
        data.texture = data.texture == 0 ? "0" : data.texture == 1 ? "1" : data.texture == 2 ? "2" : "";
        data.mobility = data.mobility == 0 ? "0" : data.mobility == 1 ? "1" :"";
        s.rectalRecord = data;
        $('#rectalHist_modal').modal('show');
    }

    s.showDiagnoseList = function (condition) {
       
        if (condition == 'viewList')
        {
            s.showClientList = true;
            s.showBtnClientList = false;
            s.diagnosePanel = false;
            s.diagFilterDate = new Date();
            getRectalClients(s.diagFilterDate);
        }

        else {
            s.showClientList = false;
            s.showBtnClientList = true;
            s.diagnosePanel = false;

            s.resetForm();
        }
    }

    function getRectalClients(dateFilter) {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $("#clientList_tbl").DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblMRH = $("#clientList_tbl").DataTable({
                ajax: {
                    url: "../RectalDiagnosis/getRectalClientList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
                    type: "POST",
                    dataSrc: "",
                    recordsTotal: 20,
                    recordsFiltered: 20,
                    deferRender: true,
                },
                pageLength: 10,
                searching: true,
                language: {
                    loadingRecords:
                      '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div><text><i>Please wait, we are loading your data...</i></text>',
                    emptyTable:
                      '<label class="text-danger">NO INFORMATION FOUND!</label>',
                },
                processing: false,
                columns: [
                  {
                      data: "index",
                      render: function () {
                          return indexNo++;
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return "<strong>" + row.personInfo.lastName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return "<strong>" + row.personInfo.firstName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.middleName == null
                            ? ""
                            : "<strong>" + row.personInfo.middleName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.extName == null
                            ? ""
                            : "<strong>" + row.personInfo.extName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.personInfo.sex == "MALE" ? "M" : "F";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          var age = moment().diff(
                            moment(row.personInfo.birthDate).format("L"),
                            "years"
                          );
                          return '<span class="label label-success">' + age + "</span>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.personInfo.contactNo;
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return (
                            row.physician.personnel_firstName +
                            " " +
                            row.physician.personnel_midInit +
                            " " +
                            row.physician.personnel_lastName +
                            " " +
                            row.physician.personnel_extName
                          );
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return moment(row.mrhInfo.diagnoseDT).format("lll");
                      },
                  },
                  {
                      data: null,
                      render: function () {
                          return '<button class="btn-success btn btn-xs" id="btnShowMRH"> Show <i class="fa fa-external-link"></i></button>';
                      },
                  },
                ],
                order: [[0, "asc"]],
            });

            $("#clientList_tbl tbody").off("click");

            $("#clientList_tbl tbody").on("click", "#btnShowMRH", function () {
                var data = tblMRH.row($(this).parents("tr")).data();

                resetLabForm();
             
                // Get Laboratories
                h.get('../RectalDiagnosis/getLabByReferralID?ReferralID=' + data.mrhInfo.referralID).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        angular.forEach(d.data, function (item) {
                            switch (item.labTestID)
                            {
                                case 'L0001':
                                    s.labtest.L0001 = true;
                                    s.labIsEncoded.L0001isEncoded = item.isTested;
                                    break;
                                case 'L0002':
                                    s.labtest.L0002 = true;
                                    s.labIsEncoded.L0002isEncoded = item.isTested;
                                    break;
                                case 'L0003':
                                    s.labtest.L0003 = true;
                                    s.labIsEncoded.L0003isEncoded = item.isTested;
                                    break;
                                case 'L0004':
                                    s.labtest.L0004 = true;
                                    s.ecgDesc = item.ecgDesc;
                                    s.labIsEncoded.L0004isEncoded = item.isTested;
                                    break;
                                case 'L0005':
                                    s.labtest.L0005 = true;
                                    s.labIsEncoded.L0005isEncoded = item.isTested;
                                    break;
                                case 'L0006':
                                    s.labtest.L0006 = true;
                                    s.xrayDesc = item.xrayDesc;
                                    s.labIsEncoded.L0006isEncoded = item.isTested;
                                    break;
                                case 'L0007':
                                    s.labtest.L0007 = true;
                                    s.labIsEncoded.L0007isEncoded = item.isTested;
                                    break;
                                case 'L0008':
                                    s.labtest.L0008 = true;
                                    s.labIsEncoded.L0008isEncoded = item.isTested;
                                    break;
                                case 'L0009':
                                    s.labtest.L0009 = true;
                                    s.labIsEncoded.L0009isEncoded = item.isTested;
                                    break;
                                case 'L0010':
                                    s.labtest.L0010 = true;
                                    s.labIsEncoded.L0010isEncoded = item.isTested;
                                    break;
                                case 'L0011':
                                    s.labtest.L0011 = true;
                                    s.labIsEncoded.L0011isEncoded = item.isTested;
                                    break;
                                case 'L0012':
                                    s.labtest.L0012 = true;
                                    s.labIsEncoded.L0012isEncoded = item.isTested;
                                    break;
                                case 'L0022':
                                    s.labtest.L0022 = true;
                                    s.otherLabDesc = item.otherLabDesc;
                                    break;
                                case 'L0023':
                                    s.labtest.L0023 = true;
                                    s.ultrasoundDesc = item.ultrasoundDesc;
                                    s.labIsEncoded.L0023isEncoded = item.isTested;
                                    break;
                                case 'L0024':
                                    s.labtest.L0024 = true;
                                    s.labIsEncoded.L0024isEncoded = item.isTested;
                                    break;
                            }
                        })
                    }
                });

                // Get Prescriptions
                h.get('../RectalDiagnosis/getRxByReferralID?ReferralID=' + data.mrhInfo.referralID).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        s.RxList = {};
                        rxListData = [];
                        angular.copy(d.data, rxListData);
                        s.RxList = d.data;
                    }
                });
                
                s.proceedDiagnosis(true, data);
                s.showClientList = false;
                s.$apply();

            });
    }

    s.setActiveTab = function (tab) {
        $('#' + tab).trigger('click');
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
            s.xray = {};

            h.post("../LaboratoryResult/getXrayResult?labID=" + data.labID).then(function (d) {
                d.data.mcXrayDateResult = new Date(moment(d.data.mcXrayDateResult).format());
                s.xray = d.data;
            });

            $('#modalXray').modal('show');
        }

        //   ULTRASOUND RESULT
        else if (data.labTestID == "L0023") {
            s.ultrasound = {};

            h.post("../LaboratoryResult/getUltrasoundResult?labID=" + data.labID).then(function (d) {
                d.data.ultraDateResult = new Date(moment(d.data.ultraDateResult).format());
                s.ultrasound = d.data;
            });

            $('#modalUltrasound').modal('show');
        }

        //   2D ECHO RESULT
        else if (data.labTestID == "L0024") {
            s.echo = {};

            h.post("../LaboratoryResult/get2dEchoResult?labID=" + data.labID).then(function (d) {
                d.data.echoDateResult = new Date(moment(d.data.echoDateResult).format());
                s.echo = d.data;
            });

            $('#modalEcho').modal('show');
        }

        //   ECG-12L RESULT
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

    s.cancelEdittingRx = function () {
        s.isEdittingRx = false;
        s.isViewingRx = true;
        angular.copy(rxListData, s.RxList);
    }

}]);