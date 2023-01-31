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
    s.xrayFilterDate = new Date();
    

    //s.showRxQty = false;
    s.showClientList = false;
    s.showClientListBTN = true;

    s.filterResult = function (date) {
        getDiagnoseClientList(date);
    }

    s.showDiagnoseList = function () {
       
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            getDiagnoseClientList(s.xrayFilterDate);
        }
    };

    function getDiagnoseClientList(dateFilter) {
        s.clientLoader = true;

        //h.post('../Dental/getClientList').then(function (d) {
        //    if (d.data.status == 'error') {
        //        swal({
        //            title: "ERROR",
        //            text: d.data.msg,
        //            type: "error"
        //        });
        //    }

        //    else {
        //        s.diagnoseClientList = {};
        //        s.diagnoseClientList = d.data;

        //        angular.forEach(s.diagnoseClientList, function (value) {
        //            value.dateTimeLog = moment(value.dateTimeLog).format('lll');
        //            value.age = moment().diff(moment(value.birthdate).format('L'), 'years');
        //        });
        //    }

        //    s.clientLoader = false;
        //});



        var vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#listOralClient_tbl")) {
            $('#listOralClient_tbl').DataTable().clear();
            $('#listOralClient_tbl').DataTable().ajax.url("../Dental/getClientList?date=" + moment(dateFilter).format('YYYY-MM-DD')).load();
        }

        else {
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
                       return row.sex ? "M" : "F";
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
                s.diagnosisInfo.doctorName = data.DrLastName + ", " + data.DrFirstName + " " + (data.DrMiddleName != null ? data.DrMiddleName : '') + (data.DrExtName != null ? data.DrExtName : '');
                s.diagnosisInfo.dateTimeLog = moment(data.dateTimeLog).format('lll');
                s.diagnosisInfo.remarks = data.remarks;

                h.post('../VitalSigns/getDiagnosis?ConsultID=' + data.consultID).then(function (d) {
                    if (d.data.status == 'error') {
                        swal({
                            title: "ERROR",
                            text: d.data.msg,
                            type: "error"
                        });
                    }

                    else {
                        s.diagnosisList = {};
                        s.diagnosisList = d.data;
                        $('#diagnosHistory_modal').modal('show');
                    }
                });
            });
        }


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
                    s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ', ' + d.data[0].citymunDesc + ', ' + d.data[0].provDesc;

                    s.diagnose = {};
                    s.diagnoseInfo = {}
                    s.diagnoseRemarks = '';
                    s.isEditting = false;
                    getBPhistory(info, d.data[0].birthdate);
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
                    console.log(max, today);
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

                h.post('../Dental/saveDentalDiagnosis', {checkedDiagnosis: listChecked, detail: detail, personnelID: personnelID, otherDiag: detail.otherDiagnose }).then(function (d) {
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