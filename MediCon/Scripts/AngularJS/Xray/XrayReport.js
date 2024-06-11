app.controller("XrayReportCtrl", ["$scope", "$http", function (s, h) {
    s.filterDate = new Date;

    s.printSummary = function () {
        h.post('../Print/printTransmittal?dateCollected=' + moment(s.filterDate).format('YYYY-MM-DD')).then(function (d) {
             window.open("../Report/MediConRpt.aspx?type=transmittal");
        });
    }

    s.filterRequest = function () {
        indexNo = 1;

        if ($.fn.DataTable.isDataTable("#sputumTable")) {
            $("#sputumTable").DataTable().clear().destroy();
        }

        //............. LIST OF SPUTUM REQUEST
        var tblXray = $("#sputumTable").DataTable({
            ajax: {
                url: "../XrayReport/Details?date=" + moment(s.filterDate).format('YYYY-MM-DD'),
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
                  data: "firstName"
              },
              {
                  data: "middleName"
              },
              {
                  data: "extName"
              },
              {
                  data: "C_address"
              },
              {
                  data: null,
                  render: function (row) {
                      return moment(row.dateCollected).format("LL");
                  },
              }
            ],
            order: [[0, "asc"]],
            'columnDefs': [
            {
                "targets": [6],
                "className": "text-center"
            }]
        });

        $("#sputumTable tbody").off("click");
    }

}]);