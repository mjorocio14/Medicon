app.controller('ClinicalScreeningCtrl', ['$scope', '$http', function (s, h) {
    showScanner();
    s.loader = false;
    s.xrayHist_loader = false;
    s.qrData = {};
    s.isScreening = false;
    s.showClientList = false;
    s.isViewingRecord = false;
    s.isEditting = false;
    

    s.filterResult = function (date) {
        getScreenedClients(date);
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
        s.xrayHistoryList = [];
        s.searchQRcode = '';
        formatEmpData(empData);
        getXrayHistory(empData.qrCode);
        $('#modalPatient').modal('hide');
    }

    s.mainSearch = function (qrCode) {
        s.loader = true;

        h.post("../QRPersonalInfo/getQRInfo?qrCode=" + qrCode).then(function (d) {
            s.qrData = {};
            s.xrayHistoryList = [];

            if (d.data.status == "error") {
                swal({
                    title: "QR code failed!",
                    text: d.data.msg,
                    type: "error",
                });
            }

            else {
                formatEmpData(d.data);
                getXrayHistory(s.qrData.qrCode);
                
            }

            s.loader = false;
        })
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

    s.btnProceed = function (qrData) {
        if (qrData.qrCode == null)
        {
            swal({
                title: "No Information Found!",
                text: "Please scan or search for a QR code.",
                type: "error"
            });
        }

        else
        {
            s.isScreening = !s.isScreening;

            if (s.isScreening) {
                s.screening = {};
                s.houseMembers = {};
                s.houseData = [];
                s.scanner.stop();
                getHouseMembers(s.qrData.qrCode);
                s.isViewingRecord = false;
                s.isEditting = false;
            }
                
            else
                showScanner();
        }
    }

    function getXrayHistory(qrCode) {
        s.xrayHist_loader = true;
        s.xrayHistoryList = [];

        h.post('../ClinicalScreening/getXrayHistory?qrCode=' + qrCode).then(function (d) {
            angular.forEach(d.data, function (value) {
                value.screenDT = moment(value.screenDT).format("lll");
                value.xrayDT = value.xrayDT == null ? '---' : moment(value.xrayDT).format("lll");
            });

            s.xrayHistoryList = d.data;
        });

        s.xrayHist_loader = false;
    }

    s.saveScreening = function (qrData, screeningData) {

        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        // Push all checked GIBATI to gibatiList
        var gibatiList = [];
        angular.forEach(screeningData.gibati, function (key, value) {
            if (key)
                gibatiList.push(value);
        });

        // Push all checked COMORBIDITY to comorbidList
        var comorbidList = [];
        angular.forEach(screeningData.comorbidity, function (key, value) {
            if (key)
                comorbidList.push(value);
        });

        // UPDATING RECORD
        if (s.isEditting) {
            var toUpdate = {};
            toUpdate = angular.copy(s.viewedRecord);
            
            var screeningUpdate = {};
            screeningUpdate = {
                screeningID: toUpdate.screeningID,
                qrCode: toUpdate.qrCode,
                manigarilyo: screeningData.manigarilyo,
                moInom: screeningData.moInom,
                tbHistory: screeningData.tbHistory,
                kanusA: screeningData.kanusA,
                paryenteWithTB: screeningData.paryenteWithTB,
                kinsa: screeningData.kinsa
            };

            h.post('../ClinicalScreening/updateScreening', { screening: screeningUpdate, otherComorbidity: screeningData.otherComorbidity, gibati: gibatiList, comorbidity: comorbidList, houseMembers: s.houseData }).then(function (d) {
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
            var screeningInfo = {};
            screeningInfo = {
                qrCode: qrData.qrCode,
                manigarilyo: screeningData.manigarilyo,
                moInom: screeningData.moInom,
                tbHistory: screeningData.tbHistory,
                kanusA: screeningData.kanusA,
                paryenteWithTB: screeningData.paryenteWithTB,
                kinsa: screeningData.kinsa
            };

            h.post('../ClinicalScreening/saveScreening', { screening: screeningInfo, otherComorbidity: screeningData.otherComorbidity, gibati: gibatiList, comorbidity: comorbidList, houseMembers: s.houseData }).then(function (d) {
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

    s.onOthersChange = function (data) {
        if (data)
            s.screening.otherComorbidity = null;
    }

    s.onTBhistoryChange = function (data) {
        if (data)
            s.screening.kanusA = null;
    }

    s.onParyenteTBChange = function (data) {
        if (data)
            s.screening.kinsa = null;
    }

    function resetForms() {
        s.qrData = {};
        showScanner();
        s.screening = {};
        s.houseMembers = {};
        s.houseData = [];
        s.isScreening = false;
        s.searchQRcode = '';
        s.xrayHistoryList = [];
    }

    s.showDiagnoseList = function () {
        s.showClientList = !s.showClientList;

        if (s.showClientList) {
            s.xrayFilterDate = new Date();
            getScreenedClients(s.xrayFilterDate);
        }
    };

    function getScreenedClients(dateFilter) {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#screening_tbl")) {
            $("#screening_tbl").DataTable().clear().destroy();
        }

            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblScreened = $("#screening_tbl").DataTable({
                ajax: {
                    url: "../ClinicalScreening/getScreenedClients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                          return '<span class="label label-success">' + getAge(row.birthDate) + "</span>";
                      },
                  },
                  {
                      data: "contactNo",
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
                          return moment(row.dateTimeLog).format("lll");
                      },
                  },
                  {
                      data: null,
                      render: function () {
                          return '<button class="btn-success btn btn-xs" id="btnShowMRH"> Show <i class="fa fa-external-link"></i></button>';
                      },
                  },
                ],
                order: [[0, "asc"]],
            });

            $("#screening_tbl tbody").off("click");

            $("#screening_tbl tbody").on("click", "#btnShowMRH", function () {
                var data = tblScreened.row($(this).parents("tr")).data();
                
                data.manigarilyo = data.manigarilyo == 0 ? "0" : data.manigarilyo == 1 ? "1" : "2";
                data.moInom = data.moInom == 0 ? "0" : data.moInom == 1 ? "1" : "2"; 
                data.tbHistory = data.tbHistory == true ? "true" : "false";
                data.paryenteWithTB = data.paryenteWithTB == true ? "true" : "false";
              
                s.screening = {};
                s.screening = data;

                s.viewedRecord = {};
                s.viewedRecord = data;
                
                s.showDiagnoseList();
                s.isViewingRecord = true;
                s.mainSearch(data.qrCode);
                getHouseMembers(data.qrCode);
                getIllness(data.screeningID);

            });
    }

    s.cancelViewing = function () {
        s.showDiagnoseList();
        s.isViewingRecord = false;
        s.isEditting = false;
        //s.viewedRecord = {};
        resetForms();
    }

    function getAge(data) {
        var age = moment().diff(moment(data).format("L"), "years");
        return age;
    }

    function getHouseMembers(qrCode) {
        h.get('../ClinicalScreening/getHouseMembers?qrCode=' + qrCode).then(function (d) {
            angular.forEach(d.data, function (value) {
                value.birthdate = moment(value.birthdate).format()
                value.age = getAge(value.birthdate);
            });
            s.houseData = d.data;
        });
    }

    s.addHouseMember = function (data) {
        data.age = getAge(data.birthdate);
        s.houseData.push(data);
        s.houseMembers = {};
    }

    s.removeHouseMember = function (index) {
        s.houseData.splice(index, 1);
    }

    function getIllness(screeningID) {
        h.get('../ClinicalScreening/getIllness?screeningID=' + screeningID).then(function (d) {
            var gibatiList = {};
            var comorbidityList = {};
           
            angular.forEach(d.data.gibati, function (gibati) {
                switch (gibati.illnessID)
                {
                    case "illness001":
                        gibatiList.illness001 = true;
                        break;
                    case "illness002":
                        gibatiList.illness002 = true;
                        break;
                    case "illness003":
                        gibatiList.illness003 = true;
                        break;
                    case "illness004":
                        gibatiList.illness004 = true;
                        break;
                    case "illness005":
                        gibatiList.illness005 = true;
                        break;
                    case "illness006":
                        gibatiList.illness006 = true;
                        break;
                    case "illness007":
                        gibatiList.illness007 = true;
                        break;
                    case "illness008":
                        gibatiList.illness008 = true;
                        break;
                    case "illness009":
                        gibatiList.illness009 = true;
                        break;
                }
            });

            s.screening.gibati = gibatiList;
            
            angular.forEach(d.data.comorbidity, function (comorbidity) {
                switch (comorbidity.comorbidityID) {
                    case "comor001":
                        comorbidityList.comor001 = true;
                        break;
                    case "comor002":
                        comorbidityList.comor002 = true;
                        break;
                    case "comor003":
                        comorbidityList.comor003 = true;
                        break;
                    case "comor004":
                        comorbidityList.comor004 = true;
                        break;
                    case "comor005":
                        comorbidityList.comor005 = true;
                        break;
                    case "comor006":
                        comorbidityList.comor006 = true;
                        break;
                    case "comor007":
                        comorbidityList.comor007 = true;
                        s.screening.otherComorbidity = comorbidity.otherComorbidity;
                        break;
                }
            });

            s.screening.comorbidity = comorbidityList;
        });
    }

}]);