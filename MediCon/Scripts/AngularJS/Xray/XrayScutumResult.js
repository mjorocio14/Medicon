app.controller('XrayScutumResultCtrl', ['$scope', '$http', function (s, h) {
    showScanner();
    s.loader = false;
    s.showClientList = false;
    s.isRequesting = false;
    s.isAlreadyRequested = false;

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

    s.mainSearch = function (qrCode) {
        s.loader = true;
        s.isAlreadyRequested = false;
        s.qrData = {};
        s.status = {};

        h.post("../XrayScutumLab/getQrWithScutumReq?qrCode=" + qrCode).then(function (d) {
            if (d.data.status == "error") {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error",
                });
            }

            else {
                if (d.data.tag.length == 0) {
                    swal({
                        title: "NO SCUTUM REQUEST!",
                        text: "Client is not yet x-ray and no scutum request is created.",
                        type: "error"
                    });
                }

                else {
                    if (d.data.qr.length == 0) {
                        swal({
                            title: "QR code is not yet register!",
                            text: "Please refer to QR code help desk near the area.",
                            type: "error"
                        });
                    }

                    else {
                        d.data.qr[0].birthdate = d.data.qr[0].birthdate != null ? new Date(moment(d.data.qr[0].birthdate).format()) : null;
                        d.data.qr[0].sex = d.data.qr[0].sex != null ? (d.data.qr[0].sex ? 'true' : 'false') : null;

                        s.qrData = d.data.qr[0];
                        s.qrData.fullAddress = d.data.qr[0].address + ', ' + d.data.qr[0].brgyDesc + ' ' + d.data.qr[0].citymunDesc + ' ' + d.data.qr[0].provDesc;

                        // DISPLAY XRAY AND SCUTUM TAG
                        s.status.isXray = d.data.tag[0].isXray == true ? 'Yes' : d.data.tag[0].isXray == false ? 'No' : '';
                        s.status.isNeedScutum = d.data.tag[0].isNeedScutum == true ? 'Yes' : d.data.tag[0].isNeedScutum == false ? 'No' : '';
                        s.status.personStatusID = d.data.tag[0].personStatusID;

                        if (s.status.isNeedScutum == 'No') {
                            swal({
                                title: "NO SCUTUM REQUEST!",
                                text: "Client was x-ray but has no scutum request is created.",
                                type: "error"
                            });
                        }

                        if (d.data.labReqCount > 0) {
                            s.isAlreadyRequested = true;

                            swal({
                                title: "ALREADY REQUESTED!",
                                text: "Laboratory request is already created for this client today.",
                                type: "error"
                            });
                        }
                    }
                }

                s.loader = false;
            }
        })
    }

    s.proceed = function (qrInfo, status) {
        if (s.isAlreadyRequested) {
            swal({
                title: "ALREADY REQUESTED!",
                text: "Laboratory request is already created for this client today.",
                type: "error"
            });
        }

        else {
            if (status.isNeedScutum == 'No') {
                swal({
                    title: "ERROR",
                    text: "<label>Can`t proceed, scutum laboratory is not requested for this client.</label>",
                    type: "error",
                    html: true
                });
            }

            else {
                s.showLabRequestForm();

                var qrData = {};
                qrData = angular.copy(qrInfo);

                qrData.fullName = qrData.lastName + ', ' + qrData.firstName +
                                  (qrData.middleName != null ? ' ' + qrData.middleName : '') +
                                  (qrData.extName != null ? ' ' + qrData.extName : '');

                qrData.sex = qrData.sex == 'true' ? 'Male' : 'Female';
                qrData.age = moment().diff(moment(qrData.birthdate).format('L'), 'years');

                s.request = qrData;
                s.request.dateOfRequest = new Date();
                s.request.dateCollected = new Date();
                s.request.personStatusID = s.status.personStatusID;
            }
        }
    }

    s.showLabRequestForm = function () {
        s.isRequesting = !s.isRequesting;

        if (s.isRequesting) {
            s.request = {};
            s.scanner.stop();
        }

        else
            showScanner();
    }

    function resetForms() {
        s.qrData = {};
        s.status = {};
        s.searchQRcode = '';
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            getLabReqClients();
        }
    };

    function getLabReqClients() {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#labReq_table")) {
            $("#labReq_table").DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblLabReq = $("#labReq_table").DataTable({
                ajax: {
                    url: "../XrayScutumLab/getLabReqClients",
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
                      data: "requestingFacility",
                  },
                  {
                      data: null,
                      render: function (row) {
                          return moment(row.dateOfRequest).format("ll");
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.treatmentHistory == true ? 'New' : 'Retreatment'
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.testRequested == true ? 'Xpert' : 'Smear Microscopy'
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return row.collection == true ? '1st' : 'Repeat'
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
                          return moment(row.labReqDT).format("lll");
                      },
                  },
                  //{
                  //    data: null,
                  //    render: function () {
                  //        return '<button class="btn-success btn btn-xs" id="btnShowMRH"> Show <i class="fa fa-external-link"></i></button>';
                  //    },
                  //},
                   {
                       data: null,
                       render: function () {
                           return '<button class="btn-success btn btn-xs" id="btnPrint"> Print <i class="fa fa-external-link"></i></button>';
                       },
                   }
                ],
                order: [[0, "asc"]]
            });

            $("#labReq_table tbody").off("click");

            //$("#labReq_table tbody").on("click", "#btnShowMRH", function () {
            //    var data = tblLabReq.row($(this).parents("tr")).data();
            //});

            $("#labReq_table tbody").on("click", "#btnPrint", function () {
                var data = tblLabReq.row($(this).parents("tr")).data();

                h.post('../Print/printAccomp?qrCode=' + data.labRequestID).then(function (d) {
                    window.open("../Report/MediConRpt.aspx?type=lrrf");
                });
            });
    }

    s.saveLabReq = function (qrCode, labReq) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../XrayScutumLab/saveLabReq', { qrCode: qrCode, labReq: labReq }).then(function (d) {
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

    function resetForms() {
        s.qrData = {};
        s.status = {};
        s.request = {};
        s.searchQRcode = '';
        s.showLabRequestForm();
        s.isAlreadyRequested = false;
    }

}]);