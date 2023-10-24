app.controller('ReadingGlassesCtrl', ['$scope', '$http', function (s, h) {

    s.qrData = {};
    s.btnProceed = true;
    getVitalList();

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            var selectedCam = cameras[0];
            $.each(cameras, function (i, c) {
                if (c.name.indexOf('back') != -1) {
                    selectedCam = c;
                    return false;
                }
            });
            s.scanner.start(selectedCam);
        }
        else {
            console.error("Camera Not Found");
        }
    });

    s.scanner = new Instascan.Scanner({
        video: document.getElementById('preview'),
        mirror: false
    });

    s.scanner.addListener('scan', function (content) {
        s.searchQRcode = "";
        s.mainSearch(content);
    });

    s.mainSearch = function (qrCode) {
        s.loader = true;

        h.post("../QRPersonalInfo/getQRInfo?qrCode=" + qrCode).then(function (d) {
            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                formatEmpData(d.data);

                s.loader = false;
                s.btnProceed = false;
            }
        })
    }

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
        $('#modalPatient').modal('hide');
        s.isEditting = false;
        s.loader = false;
        s.btnProceed = false;
    }

    function formatEmpData(data) {
        data.birthdate = data.birthDate != null ? new Date(moment(data.birthDate).format()) : null;
        data.sex = data.sex != null ? (data.sex == "MALE" ? 'true' : 'false') : null;
        s.qrData = data;
        s.qrData.age = moment().diff(moment(data.birthdate).format('L'), 'years');
        s.qrData.fullAddress = (data.brgyPermAddress == null ? "" : data.brgyPermAddress) + ' '
                                + (data.cityMunPermAddress == null ? "" : data.cityMunPermAddress) + ' '
                                + (data.provincePermAddress == null ? "" : data.provincePermAddress);
    }


    //// LIBRENG LUGAW /////

    
    function getVitalList() {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $('#clientList_tbl').DataTable().clear().destroy();
        }

        //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
        var tableVSlist = $('#clientList_tbl').DataTable({
            "ajax": {
                //"url": "../VitalSigns/getVitalSignList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
                "url": "../ReadingGlasses/getClientList",
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
               "data": null, render: function (row) {
                   return moment(row.dateTimeLog).format('lll');
               }
           },
           {
               "data": null, render: function (row) {
                   if (row.withGlasses != null && row.withGlasses.isRelease == true) {
                           $("#" + row.eyeCareID_rxID).prop('checked', true);
                   }

                   else
                       $("#" + row.eyeCareID_rxID).prop('checked', false);

                   return '<div class="checkbox checkbox-danger"><input type="checkbox" class="btnCheck" id="' + row.eyeCareID_rxID + '"><label></label></div>'
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

        $('#clientList_tbl tbody').off('click');

        $('#clientList_tbl tbody').on('click', '.btnCheck', function (value) {
            var data = tableVSlist.row($(this).parents('tr')).data();
            
                swal({
                    title: "Are you sure this client received an eye glass?",
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Yes, proceed!",
                    cancelButtonText: "No, cancel it!",
                    closeOnConfirm: false,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        h.post('../ReadingGlasses/saveReadingGlasses', { rxID: data.eyeCareID_rxID, isRelease: value.target.checked }).then(function (d) {
                            if (d.data.status == "success") {
                                swal({
                                    title: "SUCCESS!",
                                    text: d.data.msg,
                                    type: "success"
                                });

                                s.qrData = {};
                                s.searchQRcode = '';
                                getVitalList();
                            }

                            else {
                                swal({
                                    title: "ERROR!",
                                    text: d.data.msg,
                                    type: "error"
                                });
                            }
                        })
                    }

                    else {
                        if (value.target.checked) {
                           $("#"+data.eyeCareID_rxID).prop('checked', false);
                        }
                        else
                            $("#" + data.eyeCareID_rxID).prop('checked', true);
                    }
                });
        });
    }

    s.proceedBtn = function (qrCode) {
        h.post('../ReadingGlasses/checkAvailedService?qrCode=' + qrCode).then(function (d) {
                if (d.data.status == "success") {
                 swal({
                     title: "SUCCESS!",
                     text: d.data.msg,
                     type: "success"
                 });

                 s.qrData = {};
                 s.searchQRcode = '';
                 getVitalList();
                }

                else {
                    swal({
                        title: "ERROR!",
                        text: d.data.msg,
                        type: "error"
                    });
                }
            });
    }

    s.saveAvailedService = function (serviceInfo) {
        h.post('../SeniorCitizenKuyaGov/saveService', { serviceAvailedInfo: serviceInfo, items: serviceInfo }).then(function (d) {
            if (d.data.status == 'success') {
                swal({
                    title: "SUCCESS!",
                    text: d.data.msg,
                    type: "success"
                });
                s.qrData = {};
                $('#personInfoModal').modal('hide');
                getVitalList();
            }
            else {
                swal({
                    title: "ERROR!",
                    text: d.data.msg,
                    type: "error"
                });
            }
        });
    };

}]);