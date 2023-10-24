app.controller('XrayTaggingCtrl', ['$scope', '$http', function (s, h) {
    showScanner();
    s.loader = false;
    s.showClientList = false;
    s.isAlreadyTagged = false;
    s.isViewingRecord = false;
    s.isEditting = false;
    
   
    s.filterResult = function (date) {
        getXrayClients(date);
    }

    s.scanner = new Instascan.Scanner(
          {
              video: document.getElementById('preview')
          }
      );

    function showScanner() {
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
        s.qrData = {};
        s.status = {};
        s.isAlreadyTagged = false;
        s.searchQRcode = '';
        s.mainSearch(empData.qrCode);
        formatEmpData(empData);
        $('#modalPatient').modal('hide');
    }

    s.mainSearch = function (qrCode) {
        s.loader = true;
        s.qrData = {};
        s.status = {};
        s.isAlreadyTagged = false;

        h.post("../XrayTagging/getQRInfoWithXrayScreening", { qrCode: qrCode, dateFilter: moment(s.xrayFilterDate).format('YYYY-MM-DD') }).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error",
                });
            }

            else {
                    if (d.data.result == "No Record") {
                        swal({
                            title: "No Screening Info Found!",
                            text: "Please refer client profilling and clinical screening.",
                            type: "error"
                        });
                    }

                    else {
                        formatEmpData(d.data.qr);

                        if (d.data.tag.length > 0) {
                            formatXrayTagData(d.data);
                        }
                    }
            }

            s.loader = false;
        })
    }

    function formatXrayTagData(data) {
        s.status.isXray = data.tag[0].isXray == true ? 'true' :data.tag[0].isXray == false ? 'false' : '';
        s.status.isNeedScutum = data.tag[0].isNeedScutum == true ? 'true' : data.tag[0].isNeedScutum == false ? 'false' : '';
        s.isAlreadyTagged = true;

        if (s.isViewingRecord == false) {
            swal({
                title: "TAGGED ALREADY",
                text: "Client is already tagged today in x-ray tagging.",
                type: "error"
            });
        }
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

    s.saveInformation = function (qrCode, status) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });
     
        // UPDATING RECORD
        if (s.isEditting) {

            var toUpdate = {};
            toUpdate = angular.copy(s.viewedRecord);
            toUpdate.isXray = status.isXray;
            toUpdate.isNeedScutum = status.isNeedScutum;
           
            h.post('../XrayTagging/updateTag', { statusID: s.viewedRecord.personStatusID, xrayStatus: toUpdate }).then(function (d) {
                if (d.data.status == "error") {
                    swal({
                        title: "ERROR",
                        text: "<label>" + d.data.msg + "</label>",
                        type: "error",
                        html: true
                    });
                }

                else {
                    swal({
                        title: "SUCCESSFUL",
                        text: "<label>" + d.data.msg + "</label>",
                        type: "success",
                        html: true
                    });

                    s.cancelViewing();
                }
            });
        }

        // SAVING NEW RECORD
        else {
            h.post('../XrayTagging/saveTag', { qrCode: qrCode, xrayStatus: status }).then(function (d) {
                if (d.data.status == "error") {
                    swal({
                        title: "ERROR",
                        text: "<label>" + d.data.msg + "</label>",
                        type: "error",
                        html: true
                    });
                }

                else {
                    swal({
                        title: "SUCCESSFUL",
                        text: "<label>" + d.data.msg + "</label>",
                        type: "success",
                        html: true
                    });

                    resetForms();
                }
            });
        }
    }

    function resetForms() {
        s.qrData = {};
        s.status = {};
        s.searchQRcode = '';
        s.isAlreadyTagged = false;
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.xrayFilterDate = new Date();
            getXrayClients(s.xrayFilterDate);
        }
    };

    function getXrayClients(dateFilter) {
        indexNo = 1;
       
        if ($.fn.DataTable.isDataTable("#xray_table")) {
            $("#xray_table").DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblXray = $("#xray_table").DataTable({
                ajax: {
                    url: "../XrayTagging/getXrayClients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                          return row.sex == "MALE" ? "M" : "F";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          var age = moment().diff(
                            moment(row.birthDate).format("L"),
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
                          return row.isXray == true ? "Yes" : "No";
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.isNeedScutum == true ? "Yes" : "No";
                      },
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
                          return moment(row.tagDT).format("lll");
                      },
                  },
                  {
                      data: null,
                      render: function () {
                          return '<button class="btn-success btn btn-xs" id="btnShowMRH"> Show <i class="fa fa-external-link"></i></button>';
                      },
                  },
                ],
                order: [[0, "asc"]]
            });

            $("#xray_table tbody").off("click");

            $("#xray_table tbody").on("click", "#btnShowMRH", function () {
                var data = tblXray.row($(this).parents("tr")).data();
       
                s.viewedRecord = {};
                s.viewedRecord = data;

                s.showDiagnoseList();
                s.isViewingRecord = true;
                s.mainSearch(data.qrCode);
                s.$apply();
            });
    }

    s.cancelViewing = function () {
        s.showDiagnoseList();
        s.isViewingRecord = false;
        s.isEditting = false;
        s.viewedRecord = {};
        resetForms();
    }

}]);