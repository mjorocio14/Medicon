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
            if (d.data.status == "error") {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error",
                });
            } else {
                if (d.data != null && d.data != "") {
                    s.qrData = {};
                    d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                    d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;

                    s.qrData = d.data[0];
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ' ' + d.data[0].citymunDesc + ' ' + d.data[0].provDesc;

                    getRectalExam(qrCode);
                    getRectalHistory(qrCode);
                    getLabHistory(qrCode);
                    getBPhistory(qrCode);
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
        
        //h.post('../RectalDiagnosis/getLabHistory?qrCode=' + qrCode).then(function (d) {
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
                    value.bloodChemDateEncoded = moment(value.bloodChemDateEncoded).format('lll');
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
        s.diagnosePanel = true;
        s.showBtnClientList = false;

        s.mrh = {};
        s.mrh = data;
        s.mrh.fullName = viewingBool ? data.firstName + ' ' + (data.middleName == null ? '' : data.middleName) + ' ' + data.lastName + ' ' + (data.extName == null ? '' : data.extName)
                                        : s.qrData.firstName + ' ' + (s.qrData.middleName == null ? '' : s.qrData.middleName) + ' ' + s.qrData.lastName + ' ' + (s.qrData.extName == null ? '' : s.qrData.extName);
        const startDate = new Date();
        const endDate = viewingBool ? new Date(data.birthdate) : new Date(s.qrData.birthdate);
        s.mrh.age = Math.abs(moment.duration(endDate - startDate).years());

        s.rectalDiagnosis = {};
        s.rectalDiagnosis.MRID = s.mrh.MRID;
        s.rectalDiagnosis.requestID = s.mrh.requestID;

        s.labtest = {};
        s.otherLabDesc = '';
        getMedicineList();

        if (viewingBool) {

        }
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

    s.saveLaboratory = function (lab, otherLab) {
        
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
                if (value == 'LTG002') {
                    labtestList.push('L0007');
                    labtestList.push('L0008');
                    labtestList.push('L0013');
                    labtestList.push('L0014');
                    labtestList.push('L0015');
                }

                else if (value == 'LTG003') {
                    labtestList.push('L0016');
                    labtestList.push('L0017');
                    labtestList.push('L0018');
                    labtestList.push('L0019');
                }

                else {
                    if (key) {
                        labtestList.push(value);
                    }
                }
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

            h.post('../RectalDiagnosis/saveLaboratory', { consultID: s.mrh.consultID, labtest: labtestList, otherLab: otherLab, referralID: s.mrh.referralID, service: referredService }).then(function (d) {
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

        h.post('../RectalDiagnosis/savePrescription', { referralID: s.mrh.referralID, listRx: s.RxList }).then(function (d) {
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
            getRectalClients();
        }

        else {
            s.showClientList = false;
            s.showBtnClientList = true;
            s.diagnosePanel = false;

            s.resetForm();
        }
    }

    function getRectalClients() {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $("#clientList_tbl").DataTable().clear();
            $("#clientList_tbl")
              .DataTable()
              .ajax.url("../RectalDiagnosis/getRectalClientList")
              .load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblMRH = $("#clientList_tbl").DataTable({
                ajax: {
                    url: "../RectalDiagnosis/getRectalClientList",
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
                          return "<strong>" + row.lastName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return "<strong>" + row.firstName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.middleName == null
                            ? ""
                            : "<strong>" + row.middleName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.extName == null
                            ? ""
                            : "<strong>" + row.extName + "</strong>";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.sex ? "M" : "F";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          var age = moment().diff(
                            moment(row.birthdate).format("L"),
                            "years"
                          );
                          return '<span class="label label-success">' + age + "</span>";
                      },
                  },
                  {
                      data: "contactNo",
                  },
                  {
                      data: null,
                      render: function (row) {
                          return (
                            row.personnel_firstName +
                            " " +
                            row.personnel_midInit +
                            " " +
                            row.personnel_lastName
                          );
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return moment(row.diagnoseDT).format("lll");
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

                s.proceedDiagnosis(true, data);
                s.showClientList = false;
                s.$apply();

            });
        }
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

}]);