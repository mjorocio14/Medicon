app.controller('LabTestCtrl', ['$scope', '$http', function (s, h) {
    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    s.searchBy = 'byName';
    s.showInfoForm = false;
    s.tableLoader = false;
    s.searchResultList = [];
    s.showBackBtn = false;

    s.filterResult = function (date) {
        getLabClients(date);
    }

    // QR Scanner Initialization
    s.scanner = new Instascan.Scanner(
        {
            video: document.getElementById('preview')
        }
    );

    function startCamera() {
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
    }

    s.scanner.addListener('scan', function (content) {
        s.searchQRcode = "";
        s.mainSearch(content);
    });
    // /QR Scanner Initialization

    s.selectSearchBy = function (option) {
        if (option == 'byName')
        {
            s.showInfoForm = false;
            s.scanner.stop();
            s.infoFormData = {};
            s.searchResultList = [];
        }

        else
        {
            s.showInfoForm = true;
            startCamera();
            s.qrData = {};
            s.searchQRcode = "";
        }

        s.showBackBtn = false;
        s.labReq = [];
        s.testHistory = [];
    }

    s.mainSearch = function (qrCode) {
        s.loader = true;

        h.post('../QRPersonalInfo/getQRInfo?qrCode=' + qrCode).then(function (d) {
            s.qrData = {};
            s.testHistory = [];
            s.labReq = [];

            if (d.data.status == 'error') {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error"
                });
            }

            else {
                processPersonInfo(d.data);
                s.getLabtest(qrCode);
            }

            s.loader = false;
        })
    }

    function processPersonInfo(person) {
        person.birthdate = person.birthDate != null ? new Date(moment(person.birthDate).format()) : null;
        person.sex = person.sex != null ? (person.sex == "MALE" ? 'true' : 'false') : null;
        s.qrData = person;
        s.qrData.age = moment().diff(moment(person.birthdate).format('L'), 'years');
        s.qrData.fullAddress = (person.brgyPermAddress == null ? "" : person.brgyPermAddress) + ' '
                                + (person.cityMunPermAddress == null ? "" : person.cityMunPermAddress) + ' '
                                + (person.provincePermAddress == null ? "" : person.provincePermAddress);
    }

    s.mainSearchByName = function (data) {
        s.tableLoader = true;
        s.searchResultList = [];

        h.post('../QRPersonalInfo/getInfoByName', { lastName: data.lastName, firstName: data.firstName }).then(function (d) {

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

            s.tableLoader = false;
        })
    }

    s.selectPerson = function (person) {
        processPersonInfo(person);
        s.getLabtest(person.qrCode);
        s.showBackBtn = true;
        //console.log(person);
        //s.qrData = person;
        s.showInfoForm = true;
    }

    s.getLabtest = function (qrCode) {
        s.testHistory = [];
        s.labReq = [];

        // GET LAB HISTORY AND REQUEST
        h.post('../Labtest/getPersonLabReq?qrCode=' + qrCode).then(function (d) {
            if (d.data.length == 0) {
                swal({
                    title: "ERROR",
                    text: "Patient has no record of laboratory referral. Please refer the patient to medical consultation",
                    type: "error"
                });
            }

            else {
                angular.forEach(d.data, function (d1) {
                    angular.forEach(d1, function (d2) {
                        d2.consultDT = moment(d2.consultDT).format('lll');
                        d2.labDT = moment(d2.labDT).format('lll');
                    });
                });

                if (d.data[0][0].isTested == null || d.data[0][0].isTested == false) {
                    s.labReq = d.data[0];
                    s.testHistory = d.data.length > 1 ? d.data[1] : [];
                }

                else {
                    s.testHistory = d.data[0];
                    s.labReq = d.data.length > 1 ? d.data[1] : [];
                }
            }
        });
    }

    s.tagTested = function (lab, isTested) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });
        
        h.post('../Labtest/saveTestStatus', { labID: lab.labID, isTest: isTested }).then(function (d) {
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

                s.getLabtest(lab.qrCode);
            }
        });
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.FilterDate = new Date();
            getLabClients(s.FilterDate);
        }
    }

    function getLabClients(dateFilter) {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
            $('#clientList_tbl').DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tableLabList = $('#clientList_tbl').DataTable({
                "ajax": {
                    "url": "../Labtest/getPatientList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                    "data": "index", "render": function () { return indexNo++; }
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
                    "data": 'shortDepartmentName'
                },
               {
                   "data": 'labTestName'
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.labDT).format('lll');
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.personnel_firstName + " " + row.personnel_midInit + " " + row.personnel_lastName
                   }
               },
               {
                   "data": null, render: function (row) {
                       return moment(row.consultDT).format('lll');
                   }
               }
                ],
                "order": [[0, "asc"]]
            });

    }

}]);