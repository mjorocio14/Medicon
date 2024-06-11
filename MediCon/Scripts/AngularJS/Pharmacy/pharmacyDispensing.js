app.controller('pharmacyDispensingCtrl', ['$scope', '$http', '$filter', function (s, h, f) {
    s.loader = false;
    s.showQRpanel = true;
    s.qrData = {};
    s.isEditting = false;
    s.tableLoader = false;
    s.showClientList = false;
    s.showClientListBTN = true;

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.pharmacyFilterDate = new Date();
            getDispensedList(s.xrayFilterDate);
        }
    };

    s.filterResult = function (date) {
        getDispensedList(date);
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
    }
   
    function formatEmpData(data) {
        data.birthdate = data.birthDate != null ? new Date(moment(data.birthDate).format()) : null;
        data.sex = data.sex != null ? (data.sex == "MALE" ? 'true' : 'false') : null;
        s.qrData = data;
        s.qrData.age = moment().diff(moment(data.birthdate).format('L'), 'years');
        s.qrData.fullAddress = (data.brgyPermAddress == null ? "" : data.brgyPermAddress) + ' '
                                + (data.cityMunPermAddress == null ? "" : data.cityMunPermAddress) + ' '
                                + (data.provincePermAddress == null ? "" : data.provincePermAddress);

        s.isEditting = false;
        getPrescription(data.qrCode);
    }

    function getDispensedList(dateFilter) {
        vsIndexNo = 1;

        if ($.fn.DataTable.isDataTable("#listMedReleased_tbl")) {
            $('#listMedReleased_tbl').DataTable().clear().destroy();
        }
        
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableMedsReleasedList = $('#listMedReleased_tbl').DataTable({
                "ajax": {
                    "url": "../Pharmacy/listOfClients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                        return '<strong>' + row[0].lastName + '</strong>';
                    }
                }, {
                    "data": null,
                    render: function (row) {
                        return '<strong>' + row[0].firstName + '</strong>';
                    }
                }
                , {
                    "data": null,
                    render: function (row) {
                        return row[0].middleName == null ? '' : '<strong>' + row[0].middleName + '</strong>';
                    }
                },
               {
                   "data": null,
                   render: function (row) {
                       return row[0].extName == null ? '' : '<strong>' + row[0].extName + '</strong>';
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       return row[0].sex ? "M" : "F";
                   }
               },
               {
                   "data": null,
                   render: function (row) {
                       var age = moment().diff(moment(row[0].birthDate).format('L'), 'years');
                       return age <= 12 ? '<span class="label label-primary">' + age + '</span>' : '<span class="label label-success">' + age + '</span>';
                   }
               },
                {
                    "data": null, render: function(row) { return row[0].shortDepartmentName }
                },
               {
                   "data": null, render: function (row) {
                       return row[0].personnel_firstName + ' ' + (row[0].personnel_midInit == null ? '' : row[0].personnel_midInit)
                           + ' ' + row[0].personnel_lastName + (row[0].personnel_extName == null ? '' : ' ' + row[0].personnel_extName);
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row[0].dateTimeReleased).format('lll');
                   }
               },
               {
                   "data": null, render: function () {
                       return '<button class="btn-success btn btn-xs" id="btn_showMedsReleased"> Show <i class="fa fa-external-link"></i></button>'
                   }
               }
                ],
                "order": [[0, "asc"]],
                'columnDefs': [
                   {
                       "targets": [0, 5, 6, 7, 8, 9],
                       "className": "text-center"
                   }]
            });

            $('#listMedReleased_tbl tbody').off('click');

            $('#listMedReleased_tbl tbody').on('click', '#btn_showMedsReleased', function () {
                var data = tableMedsReleasedList.row($(this).parents('tr')).data();
              
                $('#medDispensed_modal').modal('show');
                s.diagnosisInfo = [];
                s.diagnosisInfo = data;
                s.$apply();
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
      
        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + info).then(function (d) {
            s.qrData = {};
            s.prescripted = {};

            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else 
                formatEmpData(d.data);

            s.loader = false;
        })
    }

    function getPrescription(qrCode) {
        s.tableLoader = true;
        s.checkboxCounter = 0;

        h.post('../Pharmacy/getPrescription?qrCode=' + qrCode).then(function (d) {
            s.prescripted = {};
            s.prescripted = d.data;
           
            angular.forEach(s.prescripted, function (value) {
                angular.forEach(value, function (meds) {
                    meds.dateTimeRx = moment(meds.dateTimeRx).format('lll');
                    meds.isRelease != true ? s.checkboxCounter++ : '';
                    meds.checkboxVal = angular.copy(meds.isRelease);
                    meds.physician = 'DR. ' + meds.personnel_firstName + ' ' + (meds.personnel_midInit == null ? '' : meds.personnel_midInit + ' ') + meds.personnel_lastName + (meds.personnel_extName == null ? '' : ' ' + meds.personnel_extName);
                });
                value.sort(function(a, b) {
                    return b.isRelease - a.isRelease;
                });
            });
          
            s.tableLoader = false;
        });
    }

    s.releaseMeds = function()
    {
        var checkedCounter = 0;
        var checkboxCount = 0;

        var listToReleased = [];

        if (s.isEditting)
        {
            for (var a = 0; a < s.prescripted.length; a++) {
                for (var b = 0; b < s.prescripted[a].length; b++) {
                    listToReleased.push({
                        outID: s.prescripted[a][b].outID,
                        isRelease: s.prescripted[a][b].isRelease,
                        qtyReleased: s.prescripted[a][b].qtyReleased,
                    });
                }
            }

            swal({
                title: "UPDATING",
                text: "Please wait while we are saving the update/s!",
                type: "info",
                showConfirmButton: false
            });

            h.post('../Pharmacy/saveReleasedUpdate', { listRx: listToReleased }).then(function (d) {
                if (d.data.status == "success") {
                    swal({
                        title: "SUCCESS!",
                        text: d.data.msg,
                        type: "success"
                    });

                    s.isEditting = false;
                    s.qrData = {};
                    s.prescripted = {};
                    s.searchQRcode = '';

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

        else {
            for (var a = 0; a < s.prescripted.length; a++) {
                for (var b = 0; b < s.prescripted[a].length; b++) {
                    s.prescripted[a][b].isRelease == true ? checkedCounter++ : '';
                    s.prescripted[a][b].checkboxVal == true ? checkboxCount++ : '';
                    s.prescripted[a][b].qtyReleased = s.prescripted[a][b].qtyReleased == null ? s.prescripted[a][b].qtyRx : s.prescripted[a][b].qtyReleased;
                    if (s.prescripted[a][b].isRelease == true && s.prescripted[a][b].dateTimeReleased == null || s.prescripted[a][b].dateTimeReleased == '')
                        listToReleased.push(s.prescripted[a][b]);
                }
            }

            if (checkedCounter == 0 || (checkedCounter <= checkboxCount)) {
                swal({
                    title: "Releasing failed!",
                    text: "You <label class='text-danger'>DON`T</label> have any checked medicine",
                    type: "error",
                    html: true
                });
            }

            else {
                swal({
                    title: "SAVING",
                    text: "Please wait while we are saving your data!",
                    type: "info",
                    showConfirmButton: false
                });

                h.post('../Pharmacy/saveReleasing', { listRx: listToReleased }).then(function (d) {
                    if (d.data.status == "success") {
                        swal({
                            title: "SUCCESS!",
                            text: d.data.msg,
                            type: "success"
                        });

                        s.isEditting = false;
                        s.qrData = {};
                      
                        s.prescripted = {};
                        s.searchQRcode = '';

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
        }
    }
    
    s.editDispensed = function (data) {
        s.tableLoader = true;
        s.checkboxCounter = 0;

        s.mainSearch(data[0].qrCode);

        h.post('../Pharmacy/getReleasedRx', { qrCode: data[0].qrCode, date: s.pharmacyFilterDate }).then(function (d) {
            s.prescripted = {};
            s.prescripted = d.data;
       
            angular.forEach(s.prescripted, function (value) {
                angular.forEach(value, function (meds) {  
                    meds.isRelease != true ? s.checkboxCounter++ : '';
                    meds.checkboxVal = angular.copy(meds.isRelease);
                });
                value.sort(function (a, b) {
                    return b.isRelease - a.isRelease;
                });
            });

            s.tableLoader = false;
            s.isEditting = true;
            s.showClientList = !s.showClientList;
            s.searchQRcode = '';
            $('#medDispensed_modal').modal('hide');
         });
    }

}]);