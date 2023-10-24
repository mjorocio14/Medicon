app.controller("LabResultCtrl", ["$scope", "$http", function (s, h) {

    s.loader = false;
    s.qrData = {};
    s.showClientListBTN = true;
    s.showClientList = false;
    getSpecialist();
    s.isShowResult = false;
    s.searchBy = 'byName';
    s.showInfoForm = false;
    s.tableLoader = false;
    s.searchResultList = [];
    s.showBackBtn = false;
    s.labResultLoader = false;
    let viewingLabData = {};

    s.filterResult = function (date) {
        getLabClients(date);
    }


    // QR Scanner Initialization
    s.scanner = new Instascan.Scanner({
      video: document.getElementById("preview"),
    });

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
            s.viewLabResult(data);
        });
    }

    s.viewLabResult = function (data) 
    {
        viewingLabData = angular.copy(data);
        s.modalTitle = data.labTestName;
        $('#modalLabResult').modal('show');
        
        retrievingFile(data);
    };

    function retrievingFile(data) {
        s.imgCount = 0;
        s.currentImgIndex = 0;
        s.ImgCollection = [];
        s.displayFileName = '';

        s.labResultLoader = true;
        h.post('../LaboratoryResult/getScannedList', { qrCode: data.qrCode, labID: data.labID }).then(function (d) {
            s.imgCount = d.data.length;
          
            if(s.imgCount > 0) {
                for (var i = 0; i < d.data.length; i++) {
                    s.ImgCollection.push({ FileName: d.data[i], Path: 'getScannedLabResult?qrCode=' + data.qrCode + '&fileName=' + d.data[i] });
                }

                s.displayFileName = d.data[0];
                document.getElementById('labResult').innerHTML = '<img id="APreview" style="text-align: center;height:100%; width:100%;" src="getScannedLabResult?qrCode=' + data.qrCode + '&fileName=' + d.data[0] + '" height="60%" width="100%" />';
            }

            else {
                $('#modalLabResult').modal('hide');
                s.getLabtest(data.qrCode);
            }
            
            s.labResultLoader = false;
        });
    }

    s.navLabImg = function (dir) {
        if(dir == 'prev') {
            var img = document.getElementById('APreview');
  
            s.currentImgIndex--;
            if (s.currentImgIndex < 0) {
                s.currentImgIndex = s.imgCount - 1;
            }
        }

        else {
            var img = document.getElementById('APreview');
    
            s.currentImgIndex++;
            if (s.currentImgIndex >= s.imgCount) {
                s.currentImgIndex = 0;
            }
        }

        img.src = s.ImgCollection[s.currentImgIndex].Path;
        s.displayFileName = s.ImgCollection[s.currentImgIndex].FileName;
    }

    s.deleteLabImg = function() {
        let srcText = document.getElementById('APreview').getAttribute('src');
        
        let qrCodeDelete = srcText.slice(srcText.search("qrCode") + 7, srcText.search("&"));
        let fileNameDelete = srcText.slice(srcText.search("fileName") + 9, srcText.length);
        
        swal({
            title: "Are you sure you want to delete this laboratory result?",
            text: "",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: true
        },
                function(isConfirm) {
                    if (isConfirm) {
                        h.post('../LaboratoryResult/DeleteImg', { qrCode: qrCodeDelete, fileName: fileNameDelete }).then(function (d) {
                            if (d.data.status == "error") {
                                swal({
                                    title: "Deletion Failed",
                                    text: "<labal>" + d.data.msg + "</label>",
                                    type: "error",
                                    html: true
                                });
                            }

                            else {
                                retrievingFile(viewingLabData);
                                swal("Deleted!", "Laboratory result is deleted", "success");
                            }
                        });
                    } 
                });
    }

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
     
      s.scanInfo = {
          EIC: s.qrData.EIC,
          qrCode: s.qrData.qrCode,
          labID: data.labID,
          labTestName: data.labTestName
      };
      
      $("#modalScanner").modal("show");
    };

    s.editResult = function() {
        s.isShowResult = !s.isShowResult;
    }

    // UPLOADING OF SCANNED LAB RESULTS
    var scannerDevices = null;
    var _this = this;

    //JSPrintManager WebSocket settings
    JSPM.JSPrintManager.auto_reconnect = true;
    JSPM.JSPrintManager.start();
    JSPM.JSPrintManager.WS.onStatusChanged = function () {
        if (jspmWSStatus()) {
            //get scanners
            JSPM.JSPrintManager.getScanners().then(function (scannersList) {
                scannerDevices = scannersList;
                var options = '';
                for (var i = 0; i < scannerDevices.length; i++) {
                    options += '<option>' + scannerDevices[i] + '</option>';
                }
                $('#scannerName').html(options);
            });
        }
    }

    //Check JSPM WebSocket status
    function jspmWSStatus() {
        if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Open)
            return true;
        else if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Closed) {
            console.warn('JSPrintManager (JSPM) is not installed or not running! Download JSPM Client App from https://neodynamic.com/downloads/jspm');
            return false;
        }
        else if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Blocked) {
            alert('JSPM has blocked this website!');
            return false;
        }
    }

    // Save document
    s.saveDocument = function() {
        if(s.showSaveScanBtn) {
            swal({
                title: "SAVING",
                text: "Please wait while we are saving your data.",
                type: "info",
                showConfirmButton: false,
            });

            h.post("../LaboratoryResult/saveScannedLab", { qrCode: s.scanInfo.qrCode, labID: s.scanInfo.labID, file: s.canvas.toDataURL() }).then(function (d) {
                if (d.data.length == 0) {
                    swal({
                        title: "Error",
                        text: d.data.msg,
                        type: "error",
                    });
                } 
        
                else {
                    swal({
                        title: "Successful",
                        text: d.data.msg,
                        type: "info",
                    });

                    s.getLabtest(s.qrData.qrCode);
                    s.resetScannerCanvas();
                    s.showSaveScanBtn = false;
                }
            });
        }

        else {
            swal({
                title: "Error",
                text: "No document is scanned",
                type: "error",
            });
        }
        
    }

    s.resetScannerCanvas = function() {
        if(s.context) {
            // Reset canvas value and its dimension
            URL.revokeObjectURL(s.img);
            s.context.clearRect(0, 0, s.canvas.width, s.canvas.width);
            s.canvas.width = 838.67;
            s.canvas.height = 419.33;
        }

        $("#modalScanner").modal("hide");
    }

    //Do scanning...
    s.doScanning = function() {
        if (jspmWSStatus()) {

            //create ClientScanJob
            var csj = new JSPM.ClientScanJob();
            //scanning settings
            csj.scannerName = $('#scannerName').val();
            csj.pixelMode = JSPM.PixelMode[$('#pixelMode').val()];
            csj.resolution = parseInt($('#resolution').val());
            csj.imageFormat = JSPM.ScannerImageFormatOutput[$('#imageFormat').val()];

            let _this = this;
            //get output image
            csj.onUpdate = (data, last) => {
                if (!(data instanceof Blob)) {
                    console.info(data);
            return;
        }

        var imgBlob = new Blob([data]);
   
        if (imgBlob.size == 0) return;

        var data_type = 'image/png';
        //if (csj.imageFormat == JSPM.ScannerImageFormatOutput.PNG) data_type = 'image/png';
        
        //create html image obj from scan output
        s.img = URL.createObjectURL(imgBlob, { type: data_type });
     
        //scale original image to be screen size friendly
        //var imgScale = { width: Math.round(96.0 / csj.resolution * 100.0) + "%", height: 'auto' };
        //var imgScale = { width: '-webkit-fill-available', height: 'auto' };
        //$('#scanOutput').css(imgScale);
        //$('#scanOutput').attr("src", img);
       
        // Save to File the scanned image
        s.canvas = document.getElementById('scanCanvas');
        s.context = s.canvas.getContext('2d');
        s.showSaveScanBtn = false;
       
        var imgData = new Image;
        imgData.src = s.img;

        imgData.onload = function(){
            s.context.canvas.width = s.canvas.clientWidth;
            s.context.canvas.height = s.canvas.clientWidth *  1.5;
          
            s.context.drawImage(imgData, 0, 0, s.context.canvas.width, s.context.canvas.height); // Or at whatever offset you like
            s.showSaveScanBtn = true;
        };

      

        //var a = document.createElement("a");
        //document.body.appendChild(a);
        //a.style = "display: none";

        //a.href = img;
        //a.download = "sample.jpg";
        //a.click();
        //window.URL.revokeObjectURL(img);
        
       
        //var fd = new FormData();
        //fd.append("image", file);
        //console.log(fd);
        //h.post("../LaboratoryResult/saveScannedLab", { EIC: s.scanInfo.EIC, labID: s.scanInfo.labID, file: fd }).then(function (d) {});
    }

    csj.onError = function (data, is_critical) {
        console.error(data);
    };

    //Send scan job to scanner!
    csj.sendToClient().then(data => console.info(data));
    }}

  },
]);
