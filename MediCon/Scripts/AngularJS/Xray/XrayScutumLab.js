app.controller('XrayScutumCtrl', ['$scope', '$http', function (s, h) {
    showScanner();
    s.loader = false;
    s.showClientList = false;
    s.isRequesting = false;
    s.isAlreadyRequested = false;
    s.isEditting = false;
    

    s.filterResult = function (date) {
        getLabReqClients(date);
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
        s.isAlreadyRequested = false;
        s.qrData = {};
        s.status = {};
        s.searchQRcode = '';
        s.mainSearch(empData.qrCode);
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
    }

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
                    if (d.data.tag.length == 0 && !s.isEditting) {
                        swal({
                            title: "NO SCUTUM REQUEST!",
                            text: "Client is not yet x-ray and no scutum request is created.",
                            type: "error"
                        });
                    }

                    else {
                            //d.data.qr.birthdate = d.data.qr.birthDate != null ? new Date(moment(d.data.qr.birthDate).format()) : null;
                            //d.data.qr.sex = d.data.qr.sex != null ? (d.data.qr.sex == "MALE" ? 'true' : 'false') : null;

                            //s.qrData = d.data.qr;
                            //s.qrData.fullAddress = (d.data.qr.brgyPermAddress == null ? "" : d.data.qr.brgyPermAddress) + ' '
                            //            + (d.data.qr.cityMunPermAddress == null ? "" : d.data.qr.cityMunPermAddress) + ' '
                        //            + (d.data.qr.provincePermAddress == null ? "" : d.data.qr.provincePermAddress);
                        formatEmpData(d.data.qr);
                        getLabData(d.data);

                            //// DISPLAY XRAY AND SCUTUM TAG
                            //s.status.isXray = d.data.tag[0].isXray == true ? 'Yes' : d.data.tag[0].isXray == false ? 'No' : '';
                            //s.status.isNeedScutum = d.data.tag[0].isNeedScutum == true ? 'Yes' : d.data.tag[0].isNeedScutum == false ? 'No' : '';
                            //s.status.personStatusID = d.data.tag[0].personStatusID;

                            //if (s.status.isNeedScutum == 'No' && !s.isEditting) {
                            //    swal({
                            //        title: "NO SCUTUM REQUEST!",
                            //        text: "Client was x-ray but has no scutum request is created.",
                            //        type: "error"
                            //    });
                            //}

                            //if (d.data.labReqCount > 0 && !s.isEditting) {
                            //    s.isAlreadyRequested = true;

                            //    swal({
                            //        title: "ALREADY REQUESTED!",
                            //        text: "Laboratory request is already created for this client today.",
                            //        type: "error"
                            //    });
                            //}
                    }
                }
            })

        s.loader = false;
    }

    function getLabData(data) {
        // DISPLAY XRAY AND SCUTUM TAG
        s.status.isXray = data.tag[0].isXray == true ? 'Yes' : data.tag[0].isXray == false ? 'No' : '';
        s.status.isNeedScutum = data.tag[0].isNeedScutum == true ? 'Yes' : data.tag[0].isNeedScutum == false ? 'No' : '';
        s.status.personStatusID = data.tag[0].personStatusID;

        if (s.status.isNeedScutum == 'No' && !s.isEditting) {
            swal({
                title: "NO SCUTUM REQUEST!",
                text: "Client was x-ray but has no scutum request is created.",
                type: "error"
            });
        }

        if (data.labReqCount > 0 && !s.isEditting) {
            s.isAlreadyRequested = true;

            swal({
                title: "ALREADY REQUESTED!",
                text: "Laboratory request is already created for this client today.",
                type: "error"
            });
        }
    }

    s.proceed = function (qrInfo, status) {
        s.isEditting = false;

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
                qrData.sex = qrData.sex == 'true' ? 'Male' : 'Female';

                s.request = qrData;
                s.request.dateOfRequest = new Date();
                s.request.dateCollected = new Date();
                s.request.personStatusID = s.status.personStatusID;
            }
        }
    }

    s.showLabRequestForm = function() {
        s.isRequesting = !s.isRequesting;

        if (s.isRequesting) {
            s.request = {};
            s.scanner.stop();
        }

        else
            showScanner();
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.xrayFilterDate = new Date();
            getLabReqClients(s.xrayFilterDate);
        }

        else {
            s.searchQRcode = '';
        }
    };

    function getLabReqClients(dateFilter) {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#labReq_table")) {
            $("#labReq_table").DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblLabReq = $("#labReq_table").DataTable({
                ajax: {
                    url: "../XrayScutumLab/getLabReqClients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                   {
                       data: null,
                       render: function () {
                           return '<button class="btn-success btn btn-xs" id="btnEdit" style="margin-bottom: 2px;"> Edit <i class="fa fa-pencil"></i></button>' + 
                                  '<button class="btn-primary btn btn-xs" id="btnPrint"> Print <i class="fa fa-external-link"></i></button>';
                       },
                   }
                ],
                order: [[0, "asc"]]
            });

            $("#labReq_table tbody").off("click");

            $("#labReq_table tbody").on("click", "#btnEdit", function () {
                var data = angular.copy(tblLabReq.row($(this).parents("tr")).data());
                
                s.isEditting = true;
                s.mainSearch(data.qrCode); 
                s.isRequesting = !s.isRequesting;
                s.showClientList = !s.showClientList;
                s.request = {};
             
                data.dateOfRequest = new Date(moment(data.dateOfRequest).format());
                data.dateOfTreatment = new Date(moment(data.dateOfTreatment).format());
                data.dateCollected = new Date(moment(data.dateCollected).format());
                data.treatmentHistory = data.treatmentHistory == true ? 'true' : 'false';
                data.testRequested = data.testRequested == true ? 'true' : 'false';
                data.collection = data.collection == true ? 'true' : 'false';
                
                s.request = data;
                s.$apply();
            });

            $("#labReq_table tbody").on("click", "#btnPrint", function () {
                var data = tblLabReq.row($(this).parents("tr")).data();

                h.post('../Print/printAccomp?labRequestID=' + data.labRequestID).then(function (d) {
                    window.open("../Report/MediConRpt.aspx?type=lrrf");
                });
            });
    }

    s.returnToList = function () {
        s.isRequesting = !s.isRequesting;
        s.showDiagnoseList();
        s.request = {};
        s.qrData = {};
    }

    s.saveLabReq = function (qrCode, labReq) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        labReqData = {
            personStatusID: labReq.personStatusID,
            requestingFacility: labReq.requestingFacility,
            dateOfRequest: labReq.dateOfRequest,
            treatmentHistory: labReq.treatmentHistory,
            dateOfTreatment: labReq.dateOfTreatment,
            testRequested: labReq.testRequested,
            collection: labReq.collection,
            dateCollected: labReq.dateCollected
        };

        h.post('../XrayScutumLab/saveLabReq', { qrCode: qrCode, labReq: labReqData }).then(function (d) {
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

    s.saveLabReqChanges = function (labReq) {
        swal({
            title: "UPDATING",
            text: "Please wait while we are saving your updates.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../XrayScutumLab/saveUpdatesLabReq', labReq ).then(function (d) {
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