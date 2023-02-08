app.controller("MaleReproCtrl", ["$scope", "$http", function (s, h) {

      s.loader = false;
      s.qrData = {};
      s.showClientListBTN = true;
      s.showClientList = false;
      s.showInterview = false;
      s.mrh = {};
      s.isViewing = false;
      s.isEditting = false;
      s.medicalRecord_loader = false;
      s.labLoader = false;
      s.requestLoader = false;
      

      s.filterResult = function (date) {
          getMRHclients(date);
      }

      // QR Scanner Initialization
      s.scanner = new Instascan.Scanner({
          video: document.getElementById("preview"),
      });

      Instascan.Camera.getCameras().then(function (cameras) {
          if (cameras.length > 0) {
              s.scanner.start(cameras[0]);
          } else {
              swal({
                  title: "CAMERA ERROR",
                  text: "Camera is not found, please refresh",
                  type: "error",
              });
          }
      });

      s.scanner.addListener("scan", function (content) {
          s.searchQRcode = "";
          s.mainSearch(content);
      });
      // /QR Scanner Initialization

      s.mainSearch = function (qrCode) {
          s.loader = true;

          h.post("../QRPersonalInfo/getQRInfo?qrCode=" + qrCode).then(function (d) {
              
              if (d.data.status == "error") {
                  swal({
                      title: "QR code failed!",
                      text: d.data.msg,
                      type: "error",
                  });
              } else {
                  if (d.data != null && d.data != "") {
                      s.qrData = {};
                      d.data[0].birthdate = d.data[0].birthdate != null ? new Date(moment(d.data[0].birthdate).format()) : null;
                      d.data[0].sex = d.data[0].sex != null ? (d.data[0].sex ? 'true' : 'false') : null;

                      s.qrData = d.data[0];
                      s.qrData.fullAddress = d.data[0].address + ', ' + d.data[0].brgyDesc + ' ' + d.data[0].citymunDesc + ' ' + d.data[0].provDesc;

                      getMRHrequest(qrCode);
                      getBPhistory(qrCode);
                      getMedicalHistory(qrCode);
                      getLabHistory(qrCode);
                  }

                  else {
                      swal({
                          title: "QR code is not yet register!",
                          text: "Please refer to QR code help desk near the area.",
                          type: "error"
                      });
                  }

                  s.loader = false;
              }
          })
      }

      s.showDiagnoseList = function () {
          s.showClientList = !s.showClientList;

          if (s.showClientList) {
              s.FilterDate = new Date();
              getMRHclients(s.FilterDate);
          }
      };

      s.returnToList = function () {
          s.showClientList = true;
          s.showInterview = false;
          s.isViewing = false;
          s.isEditting = false;
      }

      function getBPhistory(qrCode) {
          s.bpLoader = true;
          s.bpHistoryList = [];
          s.vitalSigns = {};
          s.BMI = {};

          h.post('../VitalSigns/getBPhistory?qrCode=' + qrCode).then(function (d) {
              if (d.data.status == 'error' && s.mhrReq.length == 0) {
                  swal({
                      title: "ERROR",
                      text: d.data.msg,
                      type: "error"
                  });
              }

              else {
                  s.bpHistoryList = d.data.bp;

                  angular.forEach(s.bpHistoryList, function (value) {
                      value.dateTimeLog = moment(value.dateTimeLog).format("lll");
                  });

                  s.vitalSigns = d.data.vs;
              }
          });

          s.bpLoader = false;

      }

      function getMedicalHistory(qrCode) {
          s.bpLoader = true;
          s.medicalRecord_loader = true;
          s.diagnoseHistoryList = [];
          s.rxHistoryList = [];

          h.post('../MedicalConsultation/getDiagnosisHistory?qrCode=' + qrCode).then(function (d) {
              if (d.data.status == 'error') {
                  swal({
                      title: "ERROR",
                      text: d.data.msg,
                      type: "error"
                  });
              }

              else {
                  var tempDiag = {};

                  if (d.data.diagnosis.length > 0) {
                      angular.forEach(d.data.diagnosis, function (value) {

                          tempDiag = {
                              consultID: value[0].consultID,
                              serviceName: value[0].serviceName,
                              outsideReferral: value[0].outsideReferral,
                              remarks: value[0].remarks,
                              personnelFullname: value[0].physician[0].personnel_firstName + ' ' + (value[0].physician[0].personnel_midInit == null ? '' : value[0].physician[0].personnel_midInit)
                                                 + ' ' + value[0].physician[0].personnel_lastName + ' ' + (value[0].physician[0].personnel_extName == null ? '' : value[0].physician[0].personnel_extName),
                              dateTimeLog: moment(value[0].dateTimeLog).format('lll'),
                              dateForSort: moment(value[0].dateTimeLog).format()
                          };

                          angular.forEach(value, function (val) {
                              val.dateTimeLog = moment(val.dateTimeLog).format('lll');
                          });

                          tempDiag.diagnosis = value;
                          s.diagnoseHistoryList.push(tempDiag);
                      });
                  }
                  
                  //  MEDICINES PRESCRIBED BY MEDICAL CONSULTATION
                  if (d.data.rxHist.length > 0) {
                      angular.forEach(d.data.rxHist, function (value) {
                          angular.forEach(value, function (val) {
                              val.dateTimeRx = moment(val.dateTimeRx).format('lll');
                              val.dateForSort = moment(val.dateTimeRx).format();
                          })
                      });

                      s.rxHistoryList = d.data.rxHist;
                  }

                  //  MEDICINES PRESCRIBED BY OTHER SERVICES
                  if (d.data.referralRx.length > 0) {
                      angular.forEach(d.data.referralRx, function (record) {
                          angular.forEach(record, function (val) {
                              val.dateTimeRx = moment(val.dateTimeRx).format('lll');
                              val.dateForSort = moment(val.dateTimeRx).format();
                              s.rxHistoryList.push(record);
                          })
                      });
                  }
              }
              console.log(s.rxHistoryList);
              s.bpLoader = false;
              s.medicalRecord_loader = false;
          });
      }

      function getMRHrequest(qrCode) {
          s.requestLoader = true;
          s.mhrReq = [];
         
          h.post("../MaleRepro/getMRHrequest?qrCode=" + qrCode).then(function (d) {
              if (d.data.status == "error") {
                  swal({
                      title: "ERROR",   
                      text: d.data.msg,
                      type: "error",
                  });
              }

              else {
                  s.mhrReq = d.data;
         
                  var find = s.mhrReq.filter(function (value) {
                      return value.isDiagnoseDone == false;
                  });
                  
                  if (find.length == 0) {
                      swal({
                          title: "ERROR",
                          text: "Patient has no record of rectal examination referral. Please refer the patient to medical consultation",
                          type: "error"
                      });
                  }
                  
                      angular.forEach(s.mhrReq, function (value) {
                          value.requestDT = moment(value.requestDT).format('lll');
                      });
                      
                      s.requestLoader = false;
              }
          });
      }

      function getLabHistory(qrCode) {
          s.labLoader = true;
          s.labHistoryList = [];

          h.post('../MedicalConsultation/getLabHistory?qrCode=' + qrCode).then(function (d) {
              if (d.data.status == 'error') {
                  swal({
                      title: "ERROR",
                      text: d.data.msg,
                      type: "error"
                  });
              }

              else {
                  if (d.data.length > 0) {
                      angular.forEach(d.data, function (value) {
                          value.bloodChemDateEncoded = moment(value.bloodChemDateEncoded).format('lll');
                          value.dateTested = moment(value.dateTested).format('lll');
                          value.dateForSort = moment(value.dateTested).format();
                      });
                      s.labHistoryList = d.data;
                  }
              }
              s.labLoader = false;
          });
      }

      s.proceedInterview = function (viewingBool, data, request) {
          
          s.showInterview = !s.showInterview;
          s.isViewing = false;
          s.mrh = {};
          s.mrh.fullName = data != null ? data.firstName + ' ' + (data.middleName == null ? '' : data.middleName) + ' '
                           + data.lastName + ' ' + (data.extName == null ? '' : data.extName) : s.qrData.firstName + ' ' + (s.qrData.middleName == null ? '' : s.qrData.middleName) + ' ' + s.qrData.lastName + ' ' + (s.qrData.extName == null ? '' : s.qrData.extName);
          const startDate = new Date();
          const endDate = new Date(data != null ? new Date(moment(data.birthdate).format()) : s.qrData.birthdate);
          s.mrh.age = Math.abs(moment.duration(endDate - startDate).years());
          s.mrh.requestID = request.requestID;

          if (viewingBool) {
              s.isViewing = true;

              // Viewing the INTERVIEW INFO
              s.mrh.MRID = data.MRID;
              s.mrh.is1stDRE = data.is1stDRE == false ? 'false' : 'true';
              s.mrh.DREfrequency = data.DREfrequency == 1 ? '1' : data.DREfrequency == 2 ? '2' : '3';
              s.mrh.isProstateCancer = data.isProstateCancer == false ? 'false' : 'true';
              s.mrh.isAnyCancer = data.isAnyCancer == false ? 'false' : 'true';
              s.mrh.cancerName = data.cancerName;
              s.mrh.isMedication = data.isMedication == false ? 'false' : 'true';
              s.mrh.medicineName = data.medicineName;
              s.mrh.diNauubos = data.diNauubos == 0 ? '0' : data.diNauubos == 1 ? '1' : data.diNauubos == 2 ? '2' : data.diNauubos == 3 ? '3' : data.diNauubos == 4 ? '4' : '5';
              s.mrh.kadalasUmihi = data.kadalasUmihi == 0 ? '0' : data.kadalasUmihi == 1 ? '1' : data.kadalasUmihi == 2 ? '2' : data.kadalasUmihi == 3 ? '3' : data.kadalasUmihi == 4 ? '4' : '5';
              s.mrh.patigiltiglNaIhi = data.patigiltiglNaIhi == 0 ? '0' : data.patigiltiglNaIhi == 1 ? '1' : data.patigiltiglNaIhi == 2 ? '2' : data.patigiltiglNaIhi == 3 ? '3' : data.patigiltiglNaIhi == 4 ? '4' : '5';
              s.mrh.pagpigilNgIhi = data.pagpigilNgIhi == 0 ? '0' : data.pagpigilNgIhi == 1 ? '1' : data.pagpigilNgIhi == 2 ? '2' : data.pagpigilNgIhi == 3 ? '3' : data.pagpigilNgIhi == 4 ? '4' : '5';
              s.mrh.mahinangDaloy = data.mahinangDaloy == 0 ? '0' : data.mahinangDaloy == 1 ? '1' : data.mahinangDaloy == 2 ? '2' : data.mahinangDaloy == 3 ? '3' : data.mahinangDaloy == 4 ? '4' : '5';
              s.mrh.magpwersaNgIhi = data.magpwersaNgIhi == 0 ? '0' : data.magpwersaNgIhi == 1 ? '1' : data.magpwersaNgIhi == 2 ? '2' : data.magpwersaNgIhi == 3 ? '3' : data.magpwersaNgIhi == 4 ? '4' : '5';
              s.mrh.besesGumising = data.besesGumising == 0 ? '0' : data.besesGumising == 1 ? '1' : data.besesGumising == 2 ? '2' : data.besesGumising == 3 ? '3' : data.besesGumising == 4 ? '4' : '5';
              s.mrh.sintomasNgIhi = data.sintomasNgIhi == 0 ? '0' : data.sintomasNgIhi == 1 ? '1' : '2';
              s.mrh.nadarama = data.nadarama == 0 ? '0' : data.nadarama == 1 ? '1' : data.nadarama == 2 ? '2' : data.nadarama == 3 ? '3' : data.nadarama == 4 ? '4' : '5';
          }
      }

      s.saveInterview = function (mrhData) {
          swal({
              title: "SAVING",
              text: "Please wait while we are saving your data.",
              type: "info",
              showConfirmButton: false
          });

          h.post("../MaleRepro/saveInterview", { mrh: mrhData }).then(function (d) {
              if (d.data.status == "error") {
                  swal({
                      title: "ERROR",
                      text: "<labal>" + d.data.msg + "</label>",
                      type: "error",
                      html: true,
                  });
              } else {
                  swal({
                      title: "SUCCESSFUL",
                      text: d.data.msg,
                      type: "success",
                      html: true,
                  });

                  resetFields();
              }
          });
      }

      s.saveChanges = function (mrhData) {

          swal({
              title: "UPDATING",
              text: "Please wait while we are saving the updates.",
              type: "info",
              showConfirmButton: false
          });

          h.post('../MaleRepro/saveChanges', { mrh: mrhData }).then(function (d) {
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

                  //resetFields();
                  s.showInterview = !s.showInterview;
                  s.isViewing = false;
                  s.isEditting = false;
                  s.showDiagnoseList();
              }
          });
      }

      function resetFields() {
          s.showInterview = !s.showInterview;
          s.qrData = {};
          s.diagnoseHistoryList = [];
          s.rxHistoryList = [];
          s.labHistoryList = [];
          s.mhrReq = [];
          s.bpHistoryList = [];
          s.vitalSigns = {};
          s.BMI = {};
          s.isViewing = false;
          s.isEditting = false;
      }

      function getMRHclients(dateFilter) { 
          indexNo = 1;

          if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
              $("#clientList_tbl").DataTable().clear();
              $("#clientList_tbl")
                .DataTable()
                .ajax.url("../MaleRepro/getMRHclients?date=" + moment(dateFilter).format('YYYY-MM-DD'))
                .load();
          }

          else {
              //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
              var tblMRH = $("#clientList_tbl").DataTable({
                  ajax: {
                      url: "../MaleRepro/getMRHclients?date=" + moment(dateFilter).format('YYYY-MM-DD'),
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
                            return (
                              row.personnel_firstName.charAt(0) +
                              " " +
                              row.personnel_lastName
                            );
                        },
                    },
                    {
                        data: null,
                        render: function (row) {
                            return moment(row.interviewDT).format("lll");
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
                  'columnDefs': [{
                       "targets": [0, 5, 6, 7, 8, 9, 10],
                       "className": "text-center"
                   }]
              });

              $("#clientList_tbl tbody").off("click");

              $("#clientList_tbl tbody").on("click", "#btnShowMRH", function () {
                  var data = tblMRH.row($(this).parents("tr")).data();
                
                  s.proceedInterview(true, data, { requestID: data.requestID });
                      s.showClientList = false;
                      s.$apply();

              });
          }
      }

     

  }]);