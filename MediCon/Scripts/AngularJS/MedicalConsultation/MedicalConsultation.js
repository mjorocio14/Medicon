app.controller('MedConCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    getMedicineList();
    s.qrData = {};
    s.bpLoader = false;
    s.showRx = false;
    s.unit = {};
    s.RxList = [];
    s.diagnoseXray = {}
    s.diagnose = {};
    s.diagnoseInfo = {}
    s.diagnoseRemarks = '';
    s.showRxQty = false;
    s.showClientList = false;
    s.showClientListBTN = true;


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

                    getBPhistory(info, s.qrData.Age);
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
            }

            s.bpLoader = false;
        });
    }

}]);