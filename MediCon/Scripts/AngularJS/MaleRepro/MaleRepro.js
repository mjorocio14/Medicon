app.controller('MaleReproCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    s.showInterview = false;
    s.mrh = {};

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

                    d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                    d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;
                    s.qrData = d.data[0];
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ' ' + d.data[0].citymunDesc + ' ' + d.data[0].provDesc;

                    getBPhistory(qrCode);
                    getMedicalHistory(qrCode);
                    getMRHrequest(qrCode);
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

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        //if (s.showClientList) {
        //    getPBEclients();
        //}
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
                s.BMI.data = s.BMI.value + ' - ' + s.BMI.desc;
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

    function getMRHrequest(qrCode) {
        h.post('../MaleRepro/getMRHrequest?qrCode=' + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else if (d.data.length == 0) {
                swal({
                    title: "ERROR",
                    text: "Patient has no record of rectal examination referral. Please refer the patient to medical consultation",
                    type: "error"
                });
            }

            else {
                s.mhrReq = {};

                angular.forEach(d.data, function (d2) {
                    d2.requestDT = moment(d2.requestDT).format('lll');
                });
               
                s.mhrReq = d.data; 
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

    s.proceedInterview = function (request) {
        s.showInterview = !s.showInterview;
        s.mrh = {};
        s.mrh.fullName = s.qrData.firstName + ' ' + s.qrData.middleName + ' ' + s.qrData.lastName + ' ' + s.qrData.extName;
        
        const startDate = new Date(); 
        const endDate = new Date(s.qrData.birthdate);
        s.mrh.age = Math.abs(moment.duration(endDate - startDate).years());
        s.mrh.requestID = request.requestID;
    }

    s.saveInterview = function (mrhData, form) {
        h.post('../MaleRepro/saveInterview', { mrh: mrhData }).then(function (d) {
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

                s.showInterview = !s.showInterview;
                s.qrData = {};
                s.medHistoryList = {};
                s.mhrReq = {};
                s.bpHistoryList = {};
                s.vitalSigns = {};
                s.BMI = {};
            }
        });
    }

}]);