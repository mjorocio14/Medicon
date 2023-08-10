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
    s.medicalRecord_loader = false;
    s.showMedicalRecord = false;
    s.isEditting = false;
    getSpecialist();
    s.isShowEditRxForm = true;
    s.labSchedInfo = {};
    s.checkLabList = 0;
    events = [];
    let filteredEvents = [];


    //  Date Picker for Scheduler Initialization
    let date_picker = $(".datePicker").flatpickr({
        wrap: true,
        minDate: "today"
    });
    //  /Date Picker for Scheduler Initialization

    //  Date Picker for Modal Initialization
    var datePicker_modal = $(".datePicker_modal").flatpickr({
        wrap: true,
        minDate: "today"
    });
    //  /Date Picker for Modal Initialization

    function resetDatePicker(isModal)
    {
        if (isModal) {
            datePicker_modal.config.disable = [];
            datePicker_modal.config.onDayCreate = [];
        }

        else {
            date_picker.config.disable = [];
            date_picker.config.onDayCreate = [];
        }
        
    }

    s.selectHospital = function (id, isModal) {
        isModal ? datePicker_modal.clear() : date_picker.clear();
     
        if (id == undefined || id == '')
            resetDatePicker(isModal);

        else {
            filteredEvents = events.filter(function (d) {
                return d.hospitalID == id;
            });
         
            if (isModal) {
                // EDIT MODAL DIALOG
                // SET RED DOT INDICATOR TO CALENDAR ACCORDING TO HOSPITAL LAB AVAILABILITY
                datePicker_modal.config.onDayCreate = [datePicker_onDayCreate];
                // DISABLE DATES THAT ARE NOT PART OF HOSPITAL LAB AVAILABILITY
                datePicker_modal.config.disable.push(datePicker_disable_dates);
            }
            
            else {
                // SET RED DOT INDICATOR TO CALENDAR ACCORDING TO HOSPITAL LAB AVAILABILITY
                date_picker.config.onDayCreate = [datePicker_onDayCreate];
                // DISABLE DATES THAT ARE NOT PART OF HOSPITAL LAB AVAILABILITY
                date_picker.config.disable.push(datePicker_disable_dates);
            }
        }

        isModal ? datePicker_modal.redraw() : date_picker.redraw();
    }

    let datePicker_onDayCreate = function (dObj, dStr, fp, dayElem) {
        // Utilize dayElem.dateObj, which is the corresponding Date
        let exist = filteredEvents.filter(function (e) {
            return e.scheduleDate == moment(dayElem.dateObj).format('YYYY-MM-DD');
        });
      
        // calendar sched
        if (exist.length > 0) {
            dayElem.innerHTML += "<span class='hospital-sched'></span>";
        }
    }

    let datePicker_disable_dates = function (date) {
        let dateExist = filteredEvents.filter(function (sched) {
            // LIMIT NUMBER OF PATIENT PER HOSPITAL
            // CARMEN - 20, KAPALONG - 25, IGACOS - 0
            return sched.hospitalID == "HPL001" ? (sched.scheduleDate == moment(date).format('YYYY-MM-DD') && sched.patientCount < 20)
                   : sched.hospitalID == "HPL002" ? (sched.scheduleDate == moment(date).format('YYYY-MM-DD') && sched.patientCount < 25)
                   : (sched.scheduleDate == moment(date).format('YYYY-MM-DD') && sched.patientCount < 0);
        })
        
        return dateExist.length > 0 ? false : true;
    }

    s.filterResult = function (date) {
        // Fetch schedule from BE according to date diagnose
        getSchedule(true, moment(date).format('YYYY-MM-DD'));

        // Set Min Date of Date Picker to filter date/date diagnose
        datePicker_modal.config.minDate = date;

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

    function getHospitalList() {
        h.post('../MedicalConsultation/getHospitalList').then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.hospitalList = {};
                s.hospitalList = d.data;
            }
        });
    }

    s.mainSearch = function (info) {
        s.loader = true;

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
            s.qrData = {};
            s.diagnoseHistoryList = [];
            s.rxHistoryList = [];
            s.labHistoryList = [];

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
                    
                    s.showMLR(info);
                    getLabHistory(info);
            }

            s.loader = false;
        })
    }

    s.getBPhistory = function () {

        if (!s.showMedicalRecord)
        {
            // Get all schedule of lab from hospitals
            getSchedule(false, moment().format('YYYY-MM-DD'));

            s.diagnose = {};
            s.diagnoseInfo = {}
            s.diagnoseRemarks = '';
            s.referral = {};
            s.labtest = {};
            s.labSchedInfo = {};
            s.xrayDesc = '';
            s.ecgDesc = '';
            s.ultrasoundDesc = '';
            s.labSchedInfo = {};
            s.newlyAddedConsultID = null;
            s.bpLoader = true;
            s.bpHistoryList = {};
            s.vitalSigns = {};
            s.BMI = {};
            getHospitalList();

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

    s.saveDiagnosis = function (refer, diagnosisCheck, detail, remarks, labtest, labSchedInfo, xrayDesc, ecgDesc, ultrasoundDesc)
    {
        if (s.qrData.qrCode == '' || s.qrData.qrCode == null) {
            swal({
                title: "ERROR",
                text: "<label class='text-danger'>No personal information found!</label>",
                type: "error",
                html: true
            });
        }
        
        else if (s.checkLabList > 0 && labSchedInfo.labSchedule == undefined || labSchedInfo.labSchedule == ''){
            swal({
                title: "ERROR",
                text: "Please set a laboratory schedule for the selected hospital.",
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
            if (labtestList.length > 0) referralList.push('SERVICE006');

            var consult = {
                vSignID: s.vitalSigns.vSignID,
                serviceID: 'SERVICE001',
                outsideReferral: detail.referDesc,
                remarks: remarks
            };
   
            h.post('../MedicalConsultation/saveDiagnosis', {
                qrCode: s.qrData.qrCode, checkedDiagnosis: diagnosisList, detail: detail, referral: referralList, consultation: consult, lab: labtestList,
                hospitalID: labSchedInfo.hospitalID, labSchedule: labSchedInfo.labSchedule,
                xrayDesc: xrayDesc, ecgDesc: ecgDesc, ultrasoundDesc: ultrasoundDesc
            }).then(function (d) {
                
                // Send SMS schedule to patient
                s.qrData.contactNo = '09688515104';
                if (labtestList.length > 0 && (s.qrData.contactNo != null && s.qrData.contactNo != '')) sendSMS(labSchedInfo);

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
                                s.labSchedInfo = {};
                                s.$apply();
                            }
                        });
                    }
                });
        }
    }

    s.checkLab = function(labtest) {
        // Push all checked laboratory to labtestList
        s.checkLabList = 0;
     
        angular.forEach(labtest, function (key, value) {
            if (key)
                s.checkLabList++;
        });

        if (s.checkLabList == 0)
            s.labSchedInfo = {};
    }

    function getSchedule(isEditting, dateFilter) {
        h.get('../Hospital/AllHospitalSchedule?date=' + dateFilter).then(function (d) {
            events = [];

            // Clear and Reset date picker to initial state
            isEditting ? datePicker_modal.clear() : date_picker.clear();
            resetDatePicker(isEditting);
            isEditting ? datePicker_modal.redraw() : date_picker.redraw();

            let schedList = d.data.map(function (rec) {
                rec.scheduleDate = moment(rec.scheduleDate).format('YYYY-MM-DD');

                return rec;
            });

            events = schedList;
        });
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
            $('#diagnoseList_tbl').DataTable().clear().destroy();
        }

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
                //"processing": true,
                "language":
                 {
                     "loadingRecords": '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div><text><i>Please wait, we are loading your data...</i></text>',
                     "emptyTable": '<label class="text-danger">NO INFORMATION FOUND!</label>'
                 },
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
                                case 'DIAG028':
                                    diag.DIAG028 = true;
                                    break;
                                case 'DIAG026':
                                    diag.DIAG026 = true;
                                    break;
                                case 'DIAG027':
                                    diag.DIAG027 = true;
                                    break;
                                case 'DIAG025':
                                    diag.DIAG025 = true;
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
                        var refIsEncoded = {};
                        var laboratory = {};
                        var labIsEncoded = {};
                        s.rxHistory = [];
                        s.xrayDesc = '';
                        s.ecgDesc = '';
                        s.ultrasoundDesc = '';
                       
                        // Push all checked referral to referral
                        angular.forEach(d.data.referral, function (item) {

                            switch (item.serviceID) {
                                case 'SERVICE003':
                                    ref.SERVICE003 = true;
                                    refIsEncoded.SERVICE003isEncoded = item.isEncoded;
                                    break;
                                case 'SERVICE004':
                                    ref.SERVICE004 = true;
                                    refIsEncoded.SERVICE004isEncoded = item.isEncoded;
                                    break;
                                case 'SERVICE005':
                                    ref.SERVICE005 = true;
                                    refIsEncoded.SERVICE005isEncoded = item.isEncoded;
                                    break;
                                case 'SERVICE006':
                                    ref.SERVICE006 = true;
                                    break;
                            }
                        });

                        s.resultDiag.ref = ref;
                        s.resultDiag.refIsEncoded = refIsEncoded;
                        
                        // Push all checked laboratory to laboratory                    
                        angular.forEach(d.data.laboratory, function (item) {
                            switch (item.labTestID) {
                                case 'L0001':
                                    laboratory.L0001 = true;
                                    labIsEncoded.L0001isEncoded = item.isTested;
                                    break;
                                case 'L0002':
                                    laboratory.L0002 = true;
                                    labIsEncoded.L0002isEncoded = item.isTested;
                                    break;
                                case 'L0003':
                                    laboratory.L0003 = true;
                                    labIsEncoded.L0003isEncoded = item.isTested;
                                    break;
                                case 'L0004':
                                    laboratory.L0004 = true;
                                    s.resultDiag.ecgDesc = item.ecgDesc;
                                    labIsEncoded.L0004isEncoded = item.isTested;
                                    break;
                                case 'L0005':
                                    laboratory.L0005 = true;
                                    labIsEncoded.L0005isEncoded = item.isTested;
                                    break;
                                case 'L0006':
                                    laboratory.L0006 = true;
                                    s.resultDiag.xrayDesc = item.xrayDesc;
                                    labIsEncoded.L0006isEncoded = item.isTested;
                                    break;
                                case 'L0007':
                                    laboratory.L0007 = true;
                                    labIsEncoded.L0007isEncoded = item.isTested;
                                    break;
                                case 'L0008':
                                    laboratory.L0008 = true;
                                    labIsEncoded.L0008isEncoded = item.isTested;
                                    break;
                                case 'L0009':
                                    laboratory.L0009 = true;
                                    labIsEncoded.L0009isEncoded = item.isTested;
                                    break;
                                case 'L0010':
                                    laboratory.L0010 = true;
                                    labIsEncoded.L0010isEncoded = item.isTested;
                                    break;
                                case 'L0011':
                                    laboratory.L0011 = true;
                                    labIsEncoded.L0011isEncoded = item.isTested;
                                    break;
                                case 'L0012':
                                    laboratory.L0012 = true;
                                    labIsEncoded.L0012isEncoded = item.isTested;
                                    break;
                                case 'L0023':
                                    laboratory.L0023 = true;
                                    s.resultDiag.ultrasoundDesc = item.ultrasoundDesc;
                                    labIsEncoded.L0023isEncoded = item.isTested;
                                    break;
                                case 'L0024':
                                    laboratory.L0024 = true;
                                    labIsEncoded.L0024isEncoded = item.isTested;
                                    break;
                            }
                        });
                        s.resultDiag.laboratory = laboratory;
                        s.resultDiag.labIsEncoded = labIsEncoded;
                      
                        // GET HOSPITAL AND LAB SCHEDULE FROM REFERRALS
                        let hospitalData = d.data.referral.filter(function (d) { return d.serviceID == 'SERVICE006' });
                        
                        s.resultDiag.setLabSched = {
                            isNeededLab: false,
                            hospitalID: '',
                            labSchedule: ''
                        };
                        
                        // If hospital and lab schedule is present
                        if (hospitalData.length > 0) {
                            s.selectHospital(hospitalData[0].hospitalID, true);
                           
                            // Set date picker month to labSchedule month
                            datePicker_modal.changeMonth(moment(hospitalData[0].scheduleDate).format('M') - 1, false);

                            s.resultDiag.setLabSched = {
                                isNeededLab: true,
                                hospitalID: hospitalData[0].hospitalID,
                                labSchedule: moment(hospitalData[0].scheduleDate).format('YYYY-MM-DD')
                            };
                        }

                        s.rxHistory = d.data.rxList;
                    }
                });
            });
    }

    s.showDiagnoseList = function () {
       
        s.showClientList = !s.showClientList;
        
        if (s.showClientList) {
            s.FilterDate = new Date();
            getDiagnoseClients(s.FilterDate);
            getHospitalList();

            // Fetch schedule from BE according to date diagnose
            getSchedule(true, moment(s.FilterDate).format('YYYY-MM-DD'));

            // Set Min Date of Date Picker to filter date/date diagnose
            datePicker_modal.config.minDate = s.FilterDate;
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
        
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            // Push all checked diagnosis to diagnosisList
            let diagnosisList = [];
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
           
            let consultInfo = {};
            consultInfo = {
                consultID: result.info.consultID,
                vSignID: result.info.vSignID,
                serviceID: result.info.serviceID,
                outsideReferral: result.info.outsideReferral,
                toothNum: null,
                dentistID: null,
                remarks: result.info.remarks,
            }
           
            //if((!result.hospitalID || !result.labSchedule) && labList.length > 0)
            //{
            //    swal({
            //        title: "ERROR",
            //        text: "Please select hospital and set laboratory date.",
            //        type: "error"
            //    });
            //}

            if (labList.length > 0 && result.setLabSched.labSchedule == undefined || result.setLabSched.labSchedule == '') {
                swal({
                    title: "ERROR",
                    text: "Please set a laboratory schedule for the selected hospital.",
                    type: "error",
                    html: true
                });
            }

            else {
                h.post('../MedicalConsultation/updateDiagnosis', {
                    qrCode: result.info.qrCode, consult: consultInfo, diagnosis: diagnosisList, otherDiagnose: result.otherDiagnosis,
                    referral: referralList, outsideReferral: result.info.outsideReferral, labReq: labList, hospitalID: result.setLabSched.hospitalID == undefined ? null : result.setLabSched.hospitalID, labSchedule: result.setLabSched.labSchedule,
                    xrayDesc: result.xrayDesc, ecgDesc: result.ecgDesc, ultrasoundDesc: result.ultrasoundDesc
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
                        s.filterResult(s.FilterDate);
                    }
                });
            }
    }

    s.printRx = function (data, length) {
        var patient = {
            lastName: s.qrData.lastName,
            firstName: s.qrData.firstName,
            middleName: s.qrData.middleName,
            extName: s.qrData.extName,
            brgyDesc: s.qrData.brgyPermAddress,
            citymunDesc: s.qrData.cityMunPermAddress,
            age: s.qrData.age
        };

        h.post('../Print/printRX', { rxID: data.rxID, info: patient, physician: data.physician[0], length: length }).then(function (d) {
            window.open("../Report/MediConRpt.aspx?type=prescription");
        });
    }

    s.enableRxEditting = function () {
        s.isShowEditRxForm = !s.isShowEditRxForm;
        getMedicineList();
        angular.copy(s.rxHistory, s.RxList);
    }

    s.onChangeMed = function (data) {
        let product = data != undefined ? JSON.parse(data) : {};

        s.unitEdit = {};
        s.unitEdit = {
            unitID: product ? product.unitID : null,
            unitDesc: product ? product.unitDesc: null
        };

    }

    s.onChangeNoDay = function (data) {
        let noDayEdit = data != undefined ? data : null;
        s.showRxQtyEdit = data == 'maintenance' || data == 'needed' || data == 'single' ? true : false;
    }
    
    s.addMedToEditList = function (med) {
        var data = {};
        let productMed = {};
        productMed = JSON.parse(med.product);

        data.productDesc = productMed.productDesc;

        data.productCode = productMed.productCode;
        data.unitDesc = productMed.unitDesc;
        data.noDay = med.noDay;
        data.dosage = med.dosage;
        data.perDay = med.perDay

            //.... QTY CALCULATION
            var result = 0;

            if (data.noDay == "maintenance" || data.noDay == "needed" || data.noDay == "single") {
                data.qtyRx = med.inputQTY;
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
        
            if (data.qtyRx > productMed.AVAILABLE) {
                swal({
                    title: "AVAILABILITY ADVISORY",
                    text: "<label>Please inform the patient that " + (productMed.AVAILABLE == 0 || productMed.AVAILABLE == null ? "this medicine is already <text class='text-danger'>OUT OF STOCK.</text></label>" : "the available stock of this medicine is <label class='text-danger'>insufficient</label>.")
                            + "<br/>Prescripted: <label>" + data.qtyRx + "</label><br/>Available: <label>" + (productMed.AVAILABLE == null ? 0 : productMed.AVAILABLE) + "</label>",
                    type: "info",
                    html: true
                });
            }

            s.RxList.push(data);
           
            s.medsEdit = {};
            s.unitEdit = '';
            result = 0;
            s.showRxQtyEdit = false;
    }

    s.updatePrescription = function (RxList) {
        let recConsultID = s.resultDiag.info.consultID;

        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../MedicalConsultation/updatePrescription', { consultID: recConsultID, newListRx: RxList }).then(function (d) {
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

                s.isShowEditRxForm = !s.isShowEditRxForm;
                s.rxHistory = [];
                s.rxHistory = angular.copy(RxList);
                s.RxList = [];
            }
        });
    }

    function sendSMS(schedInfo) {
        let data = {
            employee: s.qrData.fullNameTitle,
            //contactNo: s.qrData.contactNo,
            contactNo: "09688515104",
            appointee: schedInfo.hospitalID == 'HPL001' ? 'Carmen District Hospital' : schedInfo.hospitalID == 'HPL002' ? 'Kapalong District Hospital' : schedInfo.hospitalID == 'HPL003' ? 'IGACOS District Hospital' : '',
            schedule: schedInfo.labSchedule
        };
    
        h.post('../SendSMS/Send', { info: data, isHospital: true }).then(function (d) {
            console.log(d);
        });
    }


}]);