app.controller("XrayResultCtrl", ["$scope", "$http", function (s, h) {

    var searchParam = '';
    var searchType = '';

    s.searchPerson = function (info, infoType)
    {
        searchParam = info;
        searchType = infoType;

        if (info.length > 1) {
            s.tableLoader = true;

            h.post('../XrayResult/GetClientRecord', { param: info, type: infoType == "Name" ? 1 : 0 }).then(function (d) {
               
                angular.forEach(d.data, function (d) {
                    angular.forEach(d, function (e) {
                        e.birthdate = moment(e.birthdate).format('ll');
                        e.dateTimeLog = moment(e.dateTimeLog).format('ll');
                        e.DateXray = moment(e.DateXray).format('ll');
                        e.xrayResultDate = e.xrayResultDate == null ? null : moment(e.xrayResultDate).format('ll');
                    })
                });
               
                s.personList = {};
                s.personList = d.data;
                s.tableLoader = false;
            });
        }
    }

    s.showQRscanner = function () {
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                s.scanner.start(cameras[0]);
                s.$apply;

                $('#scanQR').modal('show');
            }
            else {
                s.camDisplay = true;
            }
        });
    }

    s.showResults = function (data) {
        s.resultTableLoader = true;
        s.resultList = {};
      
        $('#resultHistory').modal('show');
        s.resultList = angular.copy(data);
        s.resultTableLoader = false;
    }

    s.encodeResult = function (data) {
        s.result = {};
        
        $('#xrayResult_Modal').modal('show');
        $('#resultHistory').modal('hide');
        s.result = angular.copy(data);
        s.result.xrayResultDate = s.result.xrayResultDate != null ? new Date(s.result.xrayResultDate) : null;
        s.result.isNeedScutumText = s.result.isNeedScutum == true ? 'Yes' : 'No';
    }

    s.saveResult = function (data) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false
        });

        h.post('../XrayResult/SaveResult', { statusID: data.personStatusID, record: data }).then(function (d) {
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

                s.searchPerson(searchParam, searchType);
                $('#xrayResult_Modal').modal('hide');
                s.result = {};
            }
        })
    }

    function getXrayClients() {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#xray_table")) {
            $("#xray_table").DataTable().clear();
            $("#xray_table")
              .DataTable()
              .ajax.url("../XrayResult/GetClientRecord")
              .load();
        }

        else {
            //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
            var tblXray = $("#xray_table").DataTable({
                ajax: {
                    url: "../XrayResult/GetClientRecord",
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
                      data: null,
                      render: function (row) {
                          return moment(row.XrayDate).format("L");
                      },
                  },
                  {
                      data: null,
                      render: function (row) {
                          return moment(row.dateCollected).format("L");
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
    }

}]);