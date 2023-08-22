app.controller("LabResultCtrl", ["$scope", "$http", function (s, h) {

    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    getSpecialist();
    s.isShowResult = false;
    s.isEditBloodChem = 0;
    s.searchBy = 'byQR';
    s.showInfoForm = true;
    s.tableLoader = false;
    s.searchResultList = [];
    s.showBackBtn = false;

    s.filterResult = function (date) {
        getLabClients(date);
    }


    // QR Scanner Initialization
    s.scanner = new Instascan.Scanner({
      video: document.getElementById("preview"),
    });

    startCamera();
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

    s.scanner.addListener("scan", function (content) {
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

    function getSpecialist() {
        h.post("../LaboratoryResult/getSpecialist").then(function (d) {
        
            s.specialistData = d.data;
        });
    }

    s.mainSearch = function (qrCode) {
      s.loader = true;

      h.post("../QRPersonalInfo/getQRInfo?qrCode=" + qrCode).then(function (d) {
          s.qrData = {};
          s.testHistory = [];
          s.labReq = {};

        if (d.data.status == "error") {
          swal({
            title: "QR code failed!",
            text: d.data.msg,
            type: "error",
          });
        } 
        
        else {
                
                d.data.birthdate = d.data.birthDate != null ? new Date(moment(d.data.birthDate).format()) : null;
                d.data.sex = d.data.sex != null ? (d.data.sex == "MALE" ? 'true' : 'false') : null;
                s.qrData = d.data;
                s.qrData.age = moment().diff(moment(d.data.birthdate).format('L'), 'years');
                s.qrData.fullAddress = (d.data.brgyPermAddress == null ? "" : d.data.brgyPermAddress) + ' '
                                        + (d.data.cityMunPermAddress == null ? "" : d.data.cityMunPermAddress) + ' '
                                        + (d.data.provincePermAddress == null ? "" : d.data.provincePermAddress);

                s.getLabtest(qrCode);
        }

        s.loader = false;
      });
    };

    s.getLabtest = function (qrCode) {
      // GET LAB HISTORY AND REQUEST
      h.post("../Labtest/getPersonLabReq?qrCode=" + qrCode).then(function (d) {
        if (d.data.length == 0) {
          swal({
            title: "ERROR",
            text: "Patient has no record of laboratory referral. Please refer the patient to medical consultation",
            type: "error",
          });
        } 
        
        else {
          
          angular.forEach(d.data, function (d1) {
            angular.forEach(d1, function (d2) {
              d2.consultDT = moment(d2.consultDT).format("lll");
              d2.labDT = moment(d2.labDT).format("lll");
            });
          });

          if (d.data[0][0].isTested == null || d.data[0][0].isTested == false) {
            s.testHistory = d.data.length > 1 ? d.data[1] : [];
          } 
          
          else {
            s.testHistory = d.data[0];
          }
        }

      });
    };

    s.showDiagnoseList = function () {
      s.showClientList = !s.showClientList;

      if (s.showClientList) {
            s.FilterDate = new Date();
            getLabClients(s.FilterDate);
      }
    };

    function getLabClients(dateFilter) {
      indexNo = 1;

      if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
          $("#clientList_tbl").DataTable().clear().destroy();
      } 
      
        //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
        var tableLabList = $("#clientList_tbl").DataTable({
          "ajax": {
              "url": "../LaboratoryResult/getPatientList?date=" + moment(dateFilter).format('YYYY-MM-DD'),
            "type": "POST",
            "dataSrc": "",
            "recordsTotal": 20,
            "recordsFiltered": 20,
            "deferRender": true,
          },
          "pageLength": 10,
          "searching": true,
          "language": {
            "loadingRecords":
              '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div><text><i>Please wait, we are loading your data...</i></text>',
            "emptyTable":
              '<label class="text-danger">NO INFORMATION FOUND!</label>',
          },
          "processing": false,
          "columns": [
            {
              "data": "index",
              render: function () {
                return indexNo++;
              },
            },
            {
              "data": null,
              render: function (row) {
                return "<strong>" + row.lastName + "</strong>";
              },
            },
            {
              "data": null,
              render: function (row) {
                return "<strong>" + row.firstName + "</strong>";
              },
            },
            {
              "data": null,
              render: function (row) {
                  return row.middleName == null ? '' : '<strong>' + row.middleName + '</strong>';
              },
            },
            {
              "data": null,
              render: function (row) {
                  return row.extName == null ? '' : '<strong>' + row.extName + '</strong>';
              },
            },
            {
              "data": null,
              render: function (row) {
                  return row.sex == "MALE" ? "M" : "F";
              },
            },
            {
              "data": null,
              render: function (row) {
                var age = moment().diff(
                  moment(row.birthDate).format("L"),
                  "years"
                );
                return '<span class="label label-success">' + age + "</span>";
              },
            },
            {
              "data": "contactNo",
            },
            {
              "data": "labTestName",
            },
            {
              "data": null,
              render: function (row) {
                return moment(row.labDT).format("lll");
              },
            },
            {
              "data": null,
              render: function (row) {
                return (
                  row.referFName + " " +
                  (row.referMName == null ? "" : row.referMName + " ") +
                  row.referLName + " " +
                  (row.referEName == null ? "" : row.referEName)
                );
              },
            },
            {
              "data": null,
              render: function (row) {
                  return moment(row.encodeDT).format("lll");
              },
            },
            {
              "data": null,
              render: function (row) {
                return (
                  row.encoderFName + " " +
                  (row.encoderMName == null ? "" : row.encoderMName + " ") +
                  row.encoderLName + " " +
                  (row.encoderEName == null ? "" : row.encoderEName)
                );
              },
            },
            {
                "data": null, render: function () {
                    return '<button class="btn-success btn btn-xs" id="editDataRecord"> Show <i class="fa fa-external-link"></i></button>'
                }
            },
          ],
          order: [[0, "asc"]],
        });

        $("#clientList_tbl tbody").off("click");

        $("#clientList_tbl tbody").on("click", "#editDataRecord", function () {
            var data = tableLabList.row($(this).parents('tr')).data();
            s.viewLabResult(data.labTestID, data.labID);
            s.encodeResult(data, 1, false);
        });
    }

    s.viewLabResult = function (labTestID, labID) 
    {
        s.labPersonnel = {}

      if (labTestID == "L0002") {
        h.post("../LaboratoryResult/getCBCresult?labID=" + labID).then(
          function (d) 
          {
            s.cbc = {};
            s.cbc = d.data[0];
            s.labPersonnel.pathologist = d.data[0].pathologist;
            s.labPersonnel.medtech = d.data[0].medtech;
          }
        );
      }

      else if (labTestID == "L0001") {
        h.post("../LaboratoryResult/getUrinalysisResult?labID=" + labID).then(
          function (d) 
          { 
            s.uri = {}
            s.uri = d.data[0];
            s.labPersonnel.pathologist = d.data[0].pathologist;
            s.labPersonnel.medtech = d.data[0].medtech;
          }
        );
      }

      else if (labTestID == "L0003") { 
          h.post("../LaboratoryResult/getFecalysisResult?labID=" + labID).then(
            function (d) 
            { 
                s.fecalysis = {}
                s.fecalysis = d.data[0];
                s.fecalysis = d.data;
            }
          );
      }

      else if (labTestID == "L0004") { 
          h.post("../LaboratoryResult/getECGResult?labID=" + labID).then(
            function (d) 
            { 
                s.ecg = {}
                s.ecg = d.data[0];
                s.ecg = d.data;
            }
          );
      }

      else if (labTestID == "L0006") { 
          h.get("../LaboratoryResult/getXrayResult?labID=" + labID).then(
            function (d) 
            { 
                s.xray = {}
                d.data.mcXrayDateResult = new Date(moment(d.data.mcXrayDateResult).format());
                s.xray = d.data;
            }
          );
      }

      else if (labTestID == "L0023") { 
          h.get("../LaboratoryResult/getUltrasoundResult?labID=" + labID).then(
            function (d) 
            { 
                s.ultrasound = {}
                d.data.ultraDateResult = new Date(moment(d.data.ultraDateResult).format());
                s.ultrasound = d.data;
            }
          );
      }

      else if (labTestID == "L0024") { 
          h.get("../LaboratoryResult/get2dEchoResult?labID=" + labID).then(
            function (d) 
            { 
                s.echo = {}
                d.data.echoDateResult = new Date(moment(d.data.echoDateResult).format());
                s.echo = d.data;
            }
          );
      }

      else if (labTestID == "L0025") { 
          h.get("../LaboratoryResult/getHbA1cResult?labID=" + labID).then(
            function (d) 
            { 
                s.hba1c = {}
                s.hba1c = d.data[0];
            }
          );
      }

      else if (labTestID == "L0005" || labTestID == "L0010" || labTestID == "L0009" || labTestID == "L0007" || labTestID == "L0011" || labTestID == "L0012" || labTestID == "L0008") {
          h.post("../LaboratoryResult/getBloodChem?labID=" + labID).then(
          function (d) {
              
              s.blood = {};
              s.bloodChemCurrentResult = {};
              s.labPersonnel = {};
              s.bloodChemRemarks = {};

              s.labPersonnel.pathologist = d.data[0].pathologist;
              s.labPersonnel.medtech = d.data[0].medtech;
              s.bloodChemCurrentResult = d.data;
              
              angular.forEach(d.data, function(d)
              {
                  if(d.labTestName)
                  {
                      switch(d.labTestName)
                      {
                          case "Cholesterol":
                              s.blood.cholesterol = d.result;
                              break;
                          case "Triglycerides":
                              s.blood.triglycerides = d.result;
                              break;
                          case "HDL":
                              s.blood.hdl = d.result;
                              break;
                          case "LDL":
                              s.blood.ldl = d.result;
                              break;
                          case "VLDL":
                              s.blood.vldl = d.result;
                              break;
                          case "POTASSIUM":
                              s.blood.potassium = d.result;
                              break;
                          case "SODIUM":
                              s.blood.sodium = d.result;
                              break;
                          case "CHLORIDE":
                              s.blood.chloride = d.result;
                              break;
                          case "CALCIUM":
                              s.blood.calcium = d.result;
                              break;
                      }
                  }

                  else if(d.labTestID == "L0005")
                      s.blood.fbs = d.result;

                  else if(d.labTestID == "L0010")
                      s.blood.serumUricAcid = d.result;

                  else if(d.labTestID == "L0009")
                      s.blood.creatinine = d.result;

                  else if(d.labTestID == "L0011")
                      s.blood.sgpt = d.result;

                  else if(d.labTestID == "L0012")
                      s.blood.sgot = d.result;
              });
             
             
          }
        );
      } 
    };

    function getSpecialist() {
      h.post("../LaboratoryResult/getSpecialist").then(function (d) {
        s.specialistData = d.data;
      });
    }

    s.encodeResult = function (data, isEdit, disable) 
    {
      s.isShowResult = disable;
      s.tempLabID = data.labID;
      s.tempLabTestID = data.labTestID;
      s.labPersonnel = {};
      
      if (data.labTestID == "L0001") {
        s.uri = {};
        s.isEditUrinalysis = isEdit;
        $("#modalUrinalysis").modal("show");
      } 
      
      else if (data.labTestID == "L0005" || data.labTestID == "L0010" || data.labTestID == "L0009" || data.labTestID == "L0007" || data.labTestID == "L0011" || data.labTestID == "L0012" || data.labTestID == "L0008") {
          s.blood = {};
          s.isEditBloodChem = isEdit;
          s.labPersonnel = {};
          $("#modalBLoodChem").modal("show");
      } 
      
      else if (data.labTestID == "L0002") {
        s.cbc = {};
        s.isEditCbc = isEdit;
        $("#modalCbc").modal("show");
      }
     
      else if (data.labTestID == "L0003") {
          s.fecalysis = {};
          s.isEditFecalysis = isEdit;
          $("#modalFecalysis").modal("show");
      }

      else if (data.labTestID == "L0004") {
          s.ecg = {};
          s.isEditECG = isEdit;
          $("#modalECG").modal("show");
      }

      else if (data.labTestID == "L0006") {
          s.xray = {};
          s.isEditXray = isEdit;
          $("#modalXray").modal("show");
      }

      else if (data.labTestID == "L0023") {
          s.ultrasound = {};
          s.isEditUltrasound = isEdit;
          $("#modalUltrasound").modal("show");
      }

      else if (data.labTestID == "L0024") {
          s.echo = {};
          s.isEditEcho = isEdit;
          $("#modalEcho").modal("show");
      }

      else if (data.labTestID == "L0025") {
          s.hba1c = {};
          s.isEditHba1c = isEdit;
          $("#modalHba1c").modal("show");
      }
    };

    function filterByLabTestID_BloodChem(id) {
        return s.bloodChemCurrentResult.filter(function(currentLab) {
            return currentLab.labTestID == id;
        });
    }

    function filterByLabName_BloodChem(key) {
        return s.bloodChemCurrentResult.filter(function(currentLab) {
            return currentLab.labTestName.toLowerCase() == key.toLowerCase();
        });
    }

    s.saveBloodChem = function (data, labPersonnel, isUpdating) 
    {
        swal({
            title: isUpdating ? "UPDATING" : "SAVING",
            text: "Please wait while we are " + (isUpdating ? "updating" : "saving") + " your data.",
            type: "info",
            showConfirmButton: false,
        });
    
      var bloodChemResult = [];
        
      if (isUpdating) {
          console.log(data);    
          console.log(s.bloodChemCurrentResult);

          angular.forEach(data, function(value, key) {
              switch(key)
              {
                  case 'fbs':
                      var fbs = filterByLabTestID_BloodChem('L0005');
                      fbs[0].result = value;
                      fbs[0].labID = s.tempLabID;
                      break;
                  case 'cholesterol':
                      var chol = filterByLabName_BloodChem(key);
                      chol[0].result = value;
                      chol[0].labID = s.tempLabID;
                      break;
                  case 'triglycerides':
                      var tri = filterByLabName_BloodChem(key);
                      tri[0].result = value;
                      tri[0].labID = s.tempLabID;
                      break;
                  case 'hdl':
                      var hdl = filterByLabName_BloodChem(key);
                      hdl[0].result = value;
                      hdl[0].labID = s.tempLabID;
                      break;
                  case 'ldl':
                      var ldl = filterByLabName_BloodChem(key);
                      ldl[0].result = value;
                      ldl[0].labID = s.tempLabID;
                      break;
                  case 'vldl':
                      var vldl = filterByLabName_BloodChem(key);
                      vldl[0].result = value;
                      vldl[0].labID = s.tempLabID;
                      break;
                  case 'potassium':
                      var pot = filterByLabName_BloodChem(key);
                      pot[0].result = value;
                      pot[0].labID = s.tempLabID;
                      break;
                  case 'sodium':
                      var pot = filterByLabName_BloodChem(key);
                      pot[0].result = value;
                      pot[0].labID = s.tempLabID;
                      break;
                  case 'chloride':
                      var pot = filterByLabName_BloodChem(key);
                      pot[0].result = value;
                      pot[0].labID = s.tempLabID;
                      break;
                  case 'calcium':
                      var pot = filterByLabName_BloodChem(key);
                      pot[0].result = value;
                      pot[0].labID = s.tempLabID;
                      break;
                  case 'creatinine':
                      var crea = filterByLabTestID_BloodChem('L0009');
                      crea[0].result = value;
                      crea[0].labID = s.tempLabID;
                      break;
                  case 'serumUricAcid':
                      var uric = filterByLabTestID_BloodChem('L0010');
                      uric[0].result = value;
                      uric[0].labID = s.tempLabID;
                      break;
                  case 'sgpt':
                      var sgpt = filterByLabTestID_BloodChem('L0011');
                      sgpt[0].result = value;
                      sgpt[0].labID = s.tempLabID;
                      break;
                  case 'sgot':
                      var sgot = filterByLabTestID_BloodChem('L0012');
                      sgot[0].result = value;
                      sgot[0].labID = s.tempLabID;
                      break;
              }
          });
      }

      else {
          // FORMATTING REQUIRED DATA FOR SAVING
          if (s.tempLabTestID == "L0007")
          {
              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.cholesterol,
                  LabTestGroupID: "LTG001"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.triglycerides,
                  LabTestGroupID: "LTG002"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.hdl,
                  LabTestGroupID: "LTG003"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.ldl,
                  LabTestGroupID: "LTG004"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.vldl,
                  LabTestGroupID: "LTG005"
              });
          }

          else if (s.tempLabTestID == "L0008")
          {
              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.potassium,
                  LabTestGroupID: "LTG006"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.sodium,
                  LabTestGroupID: "LTG007"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.chloride,
                  LabTestGroupID: "LTG008"
              });

              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: data.calcium,
                  LabTestGroupID: "LTG009"
              });
          }

          else
          {
              bloodChemResult.push({
                  labID: s.tempLabID,
                  result: s.tempLabTestID == "L0005" ? data.fbs : s.tempLabTestID == "L0010" ? data.serumUricAcid : s.tempLabTestID == "L0009" ? data.creatinine : s.tempLabTestID == "L0011" ? data.sgpt : s.tempLabTestID == "L0012" ? data.sgot : null
              });
          } 
      }
     
          h.post("../LaboratoryResult/saveBloodChemResult", {
              result: isUpdating ? s.bloodChemCurrentResult : bloodChemResult, 
              medTech: labPersonnel.medtech, 
              pathologist: labPersonnel.pathologist,
              isUpdating: isUpdating,
              EditRemarks: isUpdating ? s.bloodChemRemarks : null
          }).then(function (d) 
          {
              if (d.data.status == "error") {
                  swal({
                      title: "ERROR",
                      text: "<labal>" + d.data.msg + "</label>",
                      type: "error",
                      html: true,
                  });
              } 
        
              else {
                  swal({
                      title: "SUCCESSFUL",
                      text: d.data.msg,
                      type: "success",
                      html: true,
                  });

                  s.blood = {};
                  $("#modalBLoodChem").modal("hide");
                  if(!isUpdating) s.getLabtest(s.qrData.qrCode);
              }
          });
    }

    s.editResult = function() {
        s.isShowResult = !s.isShowResult;
    }

    // HBA1C SAVING AND UPDATING
    s.isEditHba1c = 0;
    $("#hba1cForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditHba1c == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.hba1c.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveHBA1C", { result: s.hba1c, medTech: s.hba1c.medtech, pathologist: s.hba1c.pathologist }).then((response) => {
                    return response;
                }).catch((error) => {
                if (error.status == 500) {
                    Swal.showValidationMessage(
                    `Request failed: ${error.statusText}`
                    );
        } else if (error.status == 404) {
        Swal.showValidationMessage(
        `Request failed: Page Not Found`
          );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
             Swal.showValidationMessage(
             `Request failed: Unknown Error ${error.status}`
           );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
            title: "Successfully saved!",
            text: 'Laboratory Result',
            type: "success",
            html: true,
            });

            s.hba1c = {};
            $("#modalHba1c").modal("hide");
            s.getLabtest(s.qrData.qrCode);
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    } else if (s.isEditHba1c == 1) {
        Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
                return h.post("../LaboratoryResult/editHBA1C", { result: s.hba1c, medTech: s.hba1c.medtech, pathologist: s.hba1c.pathologist })
                  .then((response) => {
                      return response;
    })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
                );
    } else if (error.status == 404) {
        Swal.showValidationMessage(
          `Request failed: Page Not Found`
      );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
        Swal.showValidationMessage(
          `Request failed: Unknown Error ${error.status}`
    );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
            title: "Successfully updated",
            text: 'Laboratory Result',
            type: "success",
            html: true,
    });
    s.hba1c = {};
 
    $("#modalHba1c").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });

    // ECG SAVING AND UPDATING
    s.ecgEditRemarks = {};
    s.isEditECG = 0;
    $("#ECGForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditECG == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.ecg.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveECG", s.ecg).then((response) => {
                      return response;
                })
                .catch((error) => {
                    if (error.status == 500) {
                        Swal.showValidationMessage(
                        `Request failed: ${error.statusText}`
                    );
        } else if (error.status == 404) {
            Swal.showValidationMessage(
            `Request failed: Page Not Found`
          );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
             Swal.showValidationMessage(
             `Request failed: Unknown Error ${error.status}`
           );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
                title: "Successfully saved!",
                text: 'Laboratory Result',
                type: "success",
                html: true,
            });

    s.ecg = {};
    $("#modalECG").modal("hide");
    s.getLabtest(s.qrData.qrCode);
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    } else if (s.isEditECG == 1) {
        Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
                return h.post("../LaboratoryResult/editECG", {result: s.ecg, EditRemarks: s.ecgEditRemarks})
                  .then((response) => {
                      return response;
    })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
            );
    } else if (error.status == 404) {
        Swal.showValidationMessage(
          `Request failed: Page Not Found`
      );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
        Swal.showValidationMessage(
          `Request failed: Unknown Error ${error.status}`
    );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
      swal({
        title: "Successfully updated",
    text: 'Laboratory Result',
    type: "success",
    html: true,
    });
    s.ecg = {};
    s.ecgEditRemarks = {};
    $("#modalECG").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });

    // FECALYSIS SAVING AND UPDATING
    s.fecaEditRemarks = {};
    s.isEditFecalysis = 0;
    $("#FecalsysisForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditFecalysis == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.fecalysis.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveFecalysis", s.fecalysis)
                  .then((response) => {
                      return response;
            })
            .catch((error) => {
                if (error.status == 500) {
                Swal.showValidationMessage(
                  `Request failed: ${error.statusText}`
                      );
            } else if (error.status == 404) {
                    Swal.showValidationMessage(
                    `Request failed: Page Not Found`
              );
            } else if (error.status == -1) {
                Swal.showValidationMessage(
                  `Request failed: No Internet Connection`
              );
            } else {
                    Swal.showValidationMessage(
                      `Request failed: Unknown Error ${error.status}`
                    );
            }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
            title: "Successfully saved!",
            text: 'Laboratory Result',
            type: "success",
            html: true,
            });

        s.fecalysis = {};
        $("#modalFecalysis").modal("hide");
        s.getLabtest(s.qrData.qrCode);
        } else if (result.isDismissed) {
            Swal.fire({ title: "Canceled", icon: "info" }).then(
              (result) => {}
            );
        }
        });
        } else if (s.isEditFecalysis == 1) {
            Swal.fire({
                title: "Update Result?",
                showCancelButton: true,
                confirmButtonText: "Yes, Saved!",
                showLoaderOnConfirm: true,
                icon: "question",
                preConfirm: () => {
                    return h.post("../LaboratoryResult/editFecalysis", {result: s.fecalysis, EditRemarks: s.fecaEditRemarks})
                      .then((response) => {
                          return response;
            })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
        );
        } else if (error.status == 404) {
            Swal.showValidationMessage(
              `Request failed: Page Not Found`
          );
        } else if (error.status == -1) {
            Swal.showValidationMessage(
              `Request failed: No Internet Connection`
          );
        } else {
            Swal.showValidationMessage(
              `Request failed: Unknown Error ${error.status}`
       );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
      swal({
        title: "Successfully updated",
    text: 'Laboratory Result',
    type: "success",
    html: true,
    });
    s.fecalysis = {};
    s.fecaEditRemarks = {};
    $("#modalFecalysis").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });
    
    // URINALYSIS SAVING AND UPDATING
    s.uriEdit = {};
    s.isEditUrinalysis = 0;
    $("#urinalysisForm").validate({
      rules: {},
      submitHandler: function () {
        
        if (s.isEditUrinalysis == 0) {
          Swal.fire({
            title: "Save Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
              s.uri.labID = s.tempLabID;
              return h
                .post("../LaboratoryResult/saveUrinalysis", { result: s.uri, medTech: s.labPersonnel.medtech, pathologist: s.labPersonnel.pathologist })
                .then((response) => {
                  return response;
                })
                .catch((error) => {
                  if (error.status == 500) {
                    Swal.showValidationMessage(
                      `Request failed: ${error.statusText}`
                    );
                  } else if (error.status == 404) {
                    Swal.showValidationMessage(
                      `Request failed: Page Not Found`
                    );
                  } else if (error.status == -1) {
                    Swal.showValidationMessage(
                      `Request failed: No Internet Connection`
                    );
                  } else {
                    Swal.showValidationMessage(
                      `Request failed: Unknown Error ${error.status}`
                    );
                  }
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
          }).then((result) => {
            if (result.isConfirmed) {
              swal({
                title: "Successfully saved!",
                text: 'Laboratory Result',
                type: "success",
                html: true,
              });
              s.uri = {};
              $("#modalUrinalysis").modal("hide");
              s.getLabtest(s.qrData.qrCode);
            } else if (result.isDismissed) {
              Swal.fire({ title: "Canceled", icon: "info" }).then(
                (result) => {}
              );
            }
          });
            } else if (s.isEditUrinalysis == 1) {
                Swal.fire({
                    title: "Update Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        return h
                          .post("../LaboratoryResult/editUrinalysis", {
                              result: s.uri,
                              EditRemarks: s.uriEdit,
                              medTech: s.labPersonnel.medtech, 
                              pathologist: s.labPersonnel.pathologist
                          })
                          .then((response) => {
                              return response;
            })
            .catch((error) => {
                if (error.status == 500) {
                Swal.showValidationMessage(
                  `Request failed: ${error.statusText}`
                    );
            } else if (error.status == 404) {
                Swal.showValidationMessage(
                  `Request failed: Page Not Found`
              );
            } else if (error.status == -1) {
                Swal.showValidationMessage(
                  `Request failed: No Internet Connection`
              );
            } else {
                Swal.showValidationMessage(
                  `Request failed: Unknown Error ${error.status}`
              );
            }
            });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
                if (result.isConfirmed) {
              swal({
                title: "Successfully updated",
            text: 'Laboratory Result',
            type: "success",
            html: true,
            });
            s.uri = {};
            s.uriEdit = {};
            $("#modalUrinalysis").modal("hide");
            } else if (result.isDismissed) {
                Swal.fire({ title: "Canceled", icon: "info" }).then(
                  (result) => {}
                );
            }
            });
            }
      },
      errorElement: "span",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        element.closest(".form-group").append(error);
      },
      highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
      },
    });

    // CBC SAVING AND UPDATING FUNCTION
    s.cbcEdit = {};
    s.isEditCbc = 0;
    $("#cbcForm").validate({
      rules: {},
      submitHandler: function () {
        if (s.isEditCbc == 0) {
          Swal.fire({
            title: "Save Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
              s.cbc.labID = s.tempLabID;
              return h
                .post("../LaboratoryResult/saveCBC", { result: s.cbc, medTech: s.labPersonnel.medtech, pathologist: s.labPersonnel.pathologist })
                .then((response) => {
                  return response;
                })
                .catch((error) => {
                  if (error.status == 500) {
                    Swal.showValidationMessage(
                      `Request failed: ${error.statusText}`
                    );
                  } else if (error.status == 404) {
                    Swal.showValidationMessage(
                      `Request failed: Page Not Found`
                    );
                  } else if (error.status == -1) {
                    Swal.showValidationMessage(
                      `Request failed: No Internet Connection`
                    );
                  } else {
                    Swal.showValidationMessage(
                      `Request failed: Unknown Error ${error.status}`
                    );
                  }
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
          }).then((result) => {
            if (result.isConfirmed) {
              swal({
                title: "Successfully saved!",
                text: 'Laboratory Result',
                type: "success",
                html: true,
              });

              s.cbc = {};
              $("#modalCbc").modal("hide");
              s.getLabtest(s.qrData.qrCode);
            } else if (result.isDismissed) {
              Swal.fire({ title: "Canceled", icon: "info" }).then(
                (result) => {}
              );
            }
          });
            } 
            
            else if (s.isEditCbc == 1) {
          Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
              return h
                .post("../LaboratoryResult/editCBC", {
                  result: s.cbc,
                  EditRemarks: s.cbcEdit,
                  medTech: s.labPersonnel.medtech, 
                  pathologist: s.labPersonnel.pathologist
                })
                .then((response) => {
                  return response;
                })
                .catch((error) => {
                  if (error.status == 500) {
                    Swal.showValidationMessage(
                      `Request failed: ${error.statusText}`
                    );
                  } else if (error.status == 404) {
                    Swal.showValidationMessage(
                      `Request failed: Page Not Found`
                    );
                  } else if (error.status == -1) {
                    Swal.showValidationMessage(
                      `Request failed: No Internet Connection`
                    );
                  } else {
                    Swal.showValidationMessage(
                      `Request failed: Unknown Error ${error.status}`
                    );
                  }
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
          }).then((result) => {
            if (result.isConfirmed) {
              swal({
                title: "Successfully updated",
                text: 'Laboratory Result',
                type: "success",
                html: true,
              });
              s.cbc = {};
              s.cbcEdit = {};
              $("#modalCbc").modal("hide");
            } else if (result.isDismissed) {
              Swal.fire({ title: "Canceled", icon: "info" }).then(
                (result) => {}
              );
            }
          });
        }
      },
      errorElement: "span",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        element.closest(".form-group").append(error);
      },
      highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
      },
    });


    // XRAY SAVING AND UPDATING
    s.xrayEditRemarks = {};
    s.isEditXray = 0;
    $("#xrayForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditXray == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.xray.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveXray", s.xray).then((response) => {
                    return response;
            })
            .catch((error) => {
                if (error.status == 500) {
                    Swal.showValidationMessage(
                    `Request failed: ${error.statusText}`
                    );
        } else if (error.status == 404) {
        Swal.showValidationMessage(
        `Request failed: Page Not Found`
          );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
             Swal.showValidationMessage(
             `Request failed: Unknown Error ${error.status}`
           );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
        title: "Successfully saved!",
    text: 'Laboratory Result',
    type: "success",
    html: true,
    });

    s.xray = {};
    $("#modalXray").modal("hide");
    s.getLabtest(s.qrData.qrCode);
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    } else if (s.isEditXray == 1) {
        Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
                return h.post("../LaboratoryResult/editXray", {result: s.xray, EditRemarks: s.xrayEditRemarks})
                  .then((response) => {
                      return response;
    })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
            );
    } else if (error.status == 404) {
        Swal.showValidationMessage(
          `Request failed: Page Not Found`
      );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
        Swal.showValidationMessage(
          `Request failed: Unknown Error ${error.status}`
    );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
      swal({
        title: "Successfully updated",
    text: 'Laboratory Result',
    type: "success",
    html: true,
    });
    s.xray = {};
    s.xrayEditRemarks = {};
    $("#modalXray").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });


    // ULTRASOUND SAVING AND UPDATING
    s.ultrasoundEditRemarks = {};
    s.isEditUltrasound = 0;
    $("#ultrasoundForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditUltrasound == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.ultrasound.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveUltrasound", s.ultrasound).then((response) => {
                    return response;
            })
            .catch((error) => {
                if (error.status == 500) {
                    Swal.showValidationMessage(
                    `Request failed: ${error.statusText}`
                    );
        } else if (error.status == 404) {
        Swal.showValidationMessage(
        `Request failed: Page Not Found`
          );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
             Swal.showValidationMessage(
             `Request failed: Unknown Error ${error.status}`
           );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
        title: "Successfully saved!",
        text: 'Laboratory Result',
        type: "success",
        html: true,
        });

        s.ultrasound = {};
        $("#modalUltrasound").modal("hide");
        s.getLabtest(s.qrData.qrCode);
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    } else if (s.isEditUltrasound == 1) {
        Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
                return h.post("../LaboratoryResult/editUltrasound", {result: s.ultrasound, EditRemarks: s.ultrasoundEditRemarks})
                  .then((response) => {
                      return response;
    })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
            );
    } else if (error.status == 404) {
        Swal.showValidationMessage(
          `Request failed: Page Not Found`
      );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
        Swal.showValidationMessage(
          `Request failed: Unknown Error ${error.status}`
    );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
      swal({
        title: "Successfully updated",
    text: 'Laboratory Result',
    type: "success",
    html: true,
    });
    s.ultrasound = {};
    s.ultrasoundEditRemarks = {};
    $("#modalUltrasound").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });


    // 2D ECHO SAVING AND UPDATING
    s.echoEditRemarks = {};
    s.isEditEcho = 0;
    $("#echoForm").validate({
        rules: {},
        submitHandler: function () {
        
            if (s.isEditEcho == 0) {
                Swal.fire({
                    title: "Save Result?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Saved!",
                    showLoaderOnConfirm: true,
                    icon: "question",
                    preConfirm: () => {
                        s.echo.labID = s.tempLabID;
                
                return h.post("../LaboratoryResult/saveEcho", s.echo).then((response) => {
                    return response;
            })
            .catch((error) => {
                if (error.status == 500) {
                    Swal.showValidationMessage(
                    `Request failed: ${error.statusText}`
                    );
        } else if (error.status == 404) {
        Swal.showValidationMessage(
        `Request failed: Page Not Found`
          );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
             Swal.showValidationMessage(
             `Request failed: Unknown Error ${error.status}`
           );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
                title: "Successfully saved!",
                text: 'Laboratory Result',
                type: "success",
                html: true,
            });

    s.echo = {};
    $("#modalEcho").modal("hide");
    s.getLabtest(s.qrData.qrCode);
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    } else if (s.isEditEcho == 1) {
        Swal.fire({
            title: "Update Result?",
            showCancelButton: true,
            confirmButtonText: "Yes, Saved!",
            showLoaderOnConfirm: true,
            icon: "question",
            preConfirm: () => {
                return h.post("../LaboratoryResult/editEcho", {result: s.echo, EditRemarks: s.echoEditRemarks})
                  .then((response) => {
                      return response;
    })
    .catch((error) => {
        if (error.status == 500) {
            Swal.showValidationMessage(
            `Request failed: ${error.statusText}`
            );
    } else if (error.status == 404) {
        Swal.showValidationMessage(
          `Request failed: Page Not Found`
      );
    } else if (error.status == -1) {
        Swal.showValidationMessage(
          `Request failed: No Internet Connection`
      );
    } else {
        Swal.showValidationMessage(
          `Request failed: Unknown Error ${error.status}`
    );
    }
    });
    },
    allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
      swal({
        title: "Successfully updated",
        text: 'Laboratory Result',
        type: "success",
        html: true,
        });
    
        s.echo = {};
        s.echoEditRemarks = {};
        $("#modalEcho").modal("hide");
    } else if (result.isDismissed) {
        Swal.fire({ title: "Canceled", icon: "info" }).then(
          (result) => {}
        );
    }
    });
    }
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-info")
          .addClass("has-error");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element)
          .closest(".form-group")
          .removeClass("has-error")
          .addClass("has-info");
    },
    });

  },
]);
