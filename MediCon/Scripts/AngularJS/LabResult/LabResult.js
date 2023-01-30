app.controller("LabResultCtrl", ["$scope", "$http", function (s, h) {

    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    getSpecialist();
    s.isShowResult = false;
    s.isEditBloodChem = 0;

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

    function getSpecialist() {
      h.post("../LaboratoryResult/getSpecialist").then(function (d) {
        
        s.specialistData = d.data;
      });
    }

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
            s.testHistory = [];
            s.labReq = {};

            d.data[0].birthdate =
              d.data[0].birthdate != null
                ? new Date(moment(d.data[0].birthdate).format())
                : null;
            d.data[0].sex =
              d.data[0].sex != null ? (d.data[0].sex ? "true" : "false") : null;
            s.qrData = d.data[0];
            s.qrData.fullAddress =
              d.data[0].address +
              ", " +
              d.data[0].brgyDesc +
              " " +
              d.data[0].citymunDesc +
              " " +
              d.data[0].provDesc;

            s.getLabtest(qrCode);
          } 
          
          else {
            swal({
              title: "QR code is not yet register!",
              text: "Please refer to QR code help desk near the area.",
              type: "error",
            });
          }

          s.loader = false;
        }
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
        getLabClients();
      }
    };

    function getLabClients() {
      indexNo = 1;

      if ($.fn.DataTable.isDataTable("#clientList_tbl")) {
        $("#clientList_tbl").DataTable().clear();
        $("#clientList_tbl").DataTable().ajax.url("../LaboratoryResult/getPatientList").load();
      } 
      
      else {
        //............. LIST OF CLIENTS WITH VITAL SIGNS TABLE
        var tableLabList = $("#clientList_tbl").DataTable({
          "ajax": {
            "url": "../LaboratoryResult/getPatientList",
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
                return row.middleName == null
                  ? ""
                  : "<strong>" + row.middleName + "</strong>";
              },
            },
            {
              "data": null,
              render: function (row) {
                return row.extName == null
                  ? ""
                  : "<strong>" + row.extName + "</strong>";
              },
            },
            {
              "data": null,
              render: function (row) {
                return row.sex ? "M" : "F";
              },
            },
            {
              "data": null,
              render: function (row) {
                var age = moment().diff(
                  moment(row.birthdate).format("L"),
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

      else if (labTestID == "L0005" || labTestID == "L0010" || labTestID == "L0009" || labTestID == "L0007" || labTestID == "L0011" || labTestID == "L0012" || labTestID == "L0008") {
          h.post("../LaboratoryResult/getBloodChem?labID=" + labID).then(
          function (d) {
              
              s.blood = {};
              s.labPersonnel = {};
              s.labPersonnel.pathologist = d.data[0].pathologist;
              s.labPersonnel.medtech = d.data[0].medtech;
              s.blood = d.data;

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

                  //s.blood.bloodChemID = d.bloodChemID;
                  //s.blood.LabTestGroupID = d.LabTestGroupID;
                  //s.blood.labTestName = d.labTestName;
                  //s.blood.labTestID = d.labTestID;
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
    };


    s.saveBloodChem = function (data, labPersonnel, isUpdating) 
    {
      swal({
        title: "SAVING",
        text: "Please wait while we are saving your data.",
        type: "info",
        showConfirmButton: false,
      });
  
      var bloodChemResult = [];

      if (isUpdating) {
          angular.forEach(data, function(d) {

          });
      }
      
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
      
          h.post("../LaboratoryResult/saveBloodChemResult", {
              result: bloodChemResult, 
              medTech: labPersonnel.medtech, 
              pathologist: labPersonnel.pathologist,
              isUpdating: isUpdating
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
                  s.getLabtest(s.qrData.qrCode);
              }
          });
    }

    s.saveFecalysis = function(data, isEdit){
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false,
        });

        if(isEdit) {

        }

        else {
            data.labID = s.tempLabID;

            h.post("../LaboratoryResult/saveFecalysis", data).then(function (d) 
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

                    s.fecalysis = {};
                    $("#modalFecalysis").modal("hide");
                    s.getLabtest(s.qrData.qrCode);
                }
            });
        }
    }

    s.saveECG = function(data, isEdit) {
        swal({
            title: "SAVING",
            text: "Please wait while we are saving your data.",
            type: "info",
            showConfirmButton: false,
        });

        if(isEdit) {

        }

        else {
            data.labID = s.tempLabID;

            h.post("../LaboratoryResult/saveECG", data).then(function (d) 
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

                    s.ecg = {};
                    $("#modalECG").modal("hide");
                    s.getLabtest(s.qrData.qrCode);
                }
            });
        }
    }

    s.editResult = function() {
        s.isShowResult = !s.isShowResult;
    }
    
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
              // Swal.fire({ title: "Successfully Save!", icon: "success" }).then(
              //   (result) => {
              //     "#modalCbc".modal("hide");
              //     s.cbc = {};
              //   }
              // );
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
  },
]);
