app.controller('VitalSignCtrl', ['$scope', '$http', function (s, h) {
    s.showQRpanel = true;
    s.loader = false;
    s.qrData = {};
    s.bpLoader = false;
    var vsIndexNo = 1;
    s.isVSexist = false;
    s.showClientList = false;
    s.modal_tableLoader = false;
    s.savingIndicator = false;

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
        getPhysician(empData.qrCode);
        $('#modalPatient').modal('hide');
    }

    function getVitalList(dateFilter)
    {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl"))
        {
            $('#clientList_tbl').DataTable().clear().destroy();
        }

      
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableVSlist = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": "../VitalSigns/getVitalSignList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                   "data": null,
                   render: function (row) {
                       return (row.brgyPermAddress == null ? '' : row.brgyPermAddress) + ', '
                           + (row.citymunPermAddress == null ? '' : row.citymunPermAddress) + ', '
                           + (row.provincePermAddress == null ? '' : row.provincePermAddress)
                   }
               },
               {
                   "data": 'shortDepartmentName',
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.height == null ? '---' : row.height;
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row.weight == null ? '---' : row.weight;
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.dateTimeLog).format('lll');
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button class="btn-success btn btn-xs" id="btnShowVShistory"> Show <i class="fa fa-external-link"></i></button>'
                   }
               }
                ],
                "order": [[0, "asc"]],
                'columnDefs': [
                   {
                       "targets": [0, 5, 6, 7, 9, 10, 11, 13],
                       "className": "text-center"
                   }]
            });

            $('#clientList_tbl tbody').off('click');

            $('#clientList_tbl tbody').on('click', '#btnShowVShistory', function () {
                var data = tableVSlist.row($(this).parents('tr')).data();
                
                showVSrecord(data.vSignID);
            });
    }

    function showVSrecord(vSignID) {
        h.post('../VitalSigns/getBPrecord?vSignID=' + vSignID).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "ERROR",
                    text: "Something went wrong, " + d.data.msg,
                    type: "error"
                });
            }

            else {
                s.historyList = [];
                s.historyList = d.data.bp;
                s.historyList.reverse();

                angular.forEach(s.historyList, function (val) {
                    val.dateTimeLog = moment(val.dateTimeLog).format('lll');
                });

                $('#vitalHistory_modal').modal('show');
            }
        });
    }

    function formatEmpData(data) {
        data.birthdate = data.birthDate != null ? new Date(moment(data.birthDate).format()) : null;
        data.sex = data.sex != null ? (data.sex == "MALE" ? 'true' : 'false') : null;
        s.qrData = data;
        s.qrData.age = moment().diff(moment(data.birthdate).format('L'), 'years');
        s.qrData.fullAddress = (data.brgyPermAddress == null ? "" : data.brgyPermAddress) + ' '
                                + (data.cityMunPermAddress == null ? "" : data.cityMunPermAddress) + ' '
                                + (data.provincePermAddress == null ? "" : data.provincePermAddress);

        // Check and Get Vital Signs Data for the current day
        h.get('../VitalSigns/getVitalSigns?qrCode=' + data.qrCode).then(function (d) {
            if (d.data != null && d.data != '') {
                s.isVSexist = true;
                s.qrData.height = d.data.height;
                s.qrData.weight = d.data.weight;
            }

            else {
                s.isVSexist = false;
            }
        });
    }

    s.mainSearch = function (qrCode)
    {
        s.loader = true;

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + qrCode).then(function (d) {
            s.qrData = {};

            if (d.data.status == 'error')
            {
                swal({
                    title: d.data.msg,
                    text: "QR code failed!",
                    type: "error"
                });
            }

            else
            {
                formatEmpData(d.data);
                getPhysician(qrCode);
            }
            s.loader = false;
        })
    }

    function getPhysician(qrCode) {
        s.physician = '';

        h.get('../VitalSigns/getPhysician?qrCode=' + qrCode).then(function (d) {
            s.physician = d.data == null ? '' : 'DR. ' + d.data.personnel_firstName + ' ' + (d.data.personnel_midInit == null ? '' : d.data.personnel_midInit + ' ') +
                          d.data.personnel_lastName + ' ' + (d.data.personnel_extName == null ? '' : d.data.personnel_extName + ' ') +
                          (d.data.title == null ? '' : d.data.title);
        })
    }

    s.btnProceed = function (qrData) {
        if (s.qrData.qrCode == null || s.qrData.qrCode == undefined || s.qrData.qrCode == '') {
            swal({
                title: "ERROR",
                text: "No personal information found, please scan or search a qr code.",
                type: "error",
                html: true
            });
        }

        else {
            s.BP = {};
            
            if (s.isVSexist) {
                s.showQRpanel = !s.showQRpanel;
                getBPhistory(s.qrData.qrCode);
            }

            else {
                var VSdata = {
                    height: qrData.height,
                    qrCode: qrData.qrCode,
                    weight: qrData.weight,
                };

                s.savingIndicator = true;

                h.post('../VitalSigns/saveVitalSigns', { qrCode: qrData.qrCode, vs: VSdata }).then(function (d) {
                    if (d.data.status == "success") {
                        s.showQRpanel = !s.showQRpanel;
                        getBPhistory(s.qrData.qrCode);

                        swal({
                            title: "SUCCESSFUL",
                            text: d.data.msg,
                            type: "success"
                        });

                        s.isVSexist = true;
                        s.savingIndicator = false;
                    }

                    else {
                        swal({
                            title: "ERROR",
                            text: "Something went wrong, " + d.data.msg,
                            type: "error"
                        });
                    }
                });
            }
        }
    }

    s.btnReturn = function () {
        s.qrData = {};
        s.isVSexist = false;
        s.showQRpanel = !s.showQRpanel;
    }

    function getBPhistory(qrCode) {
        s.bpLoader = true;

        h.post('../VitalSigns/getBPhistory?qrCode=' +qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "ERROR",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                s.bpHistory = {};
                s.bpHistory = d.data.bp;
                angular.forEach(s.bpHistory, function (value) {
                    value.BPdateTime = moment(value.BPdateTime).format('lll');
                });
            }

            s.bpLoader = false;
        });
    }

    s.saveBP = function (BP) {
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false
            });

            h.post('../VitalSigns/saveBP', { qrCode: s.qrData.qrCode, bp: BP }).then(function (d) {
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
                        type: "success"
                    });

                    s.BP = {};
                    getBPhistory(s.qrData.qrCode);
                    s.isVSexist = false;
                    s.searchQRcode = "";
                }
            });
    }

    s.filterResult = function (date) {
        getVitalList(date);
    }

    s.showDiagnoseList = function () {

        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.FilterDate = new Date();
            getVitalList(s.FilterDate);
        }
    }

    s.editVS = function (data) {
        s.editData = {};
        s.editData = angular.copy(data);
       
        $('#vitalHistory_modal').modal('hide');
        $('#editVS_modal').modal('show');
    }

    s.updateVitalSign = function (data) {
        swal({
            title: "UPDATING",
            text: "Please wait while we are saving your changes.",
            type: "info",
            showConfirmButton: false
        });

        let bp = {
            BPID: data.BPID,
            temperature: data.temperature,
            systolic: data.systolic,
            diastolic: data.diastolic,
            pulseRate: data.pulseRate
        };

        h.post('../VitalSigns/updateVitalSigns', { bpData: bp }).then(function (d) {
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
                    closeOnConfirm: true
                }, function (isConfirm) {
                    $('#editVS_modal').modal('hide');

                    if (isConfirm) {
                        s.editData = {};
                        showVSrecord(data.vSignID);
                        $('#vitalHistory_modal').modal('show');
                    }
                });
            }
        });
    }

}]);