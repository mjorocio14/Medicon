app.controller('hospitalSchedulerCtrl', ['$scope', '$http', function (s, h) {
    let events = [];
    getSchedule();
    s.labTestTaken_loader = false;

    let currMonth = new Date().getMonth();
    let currYr = new Date().getFullYear();
    let monthNow = currMonth + 1;
    monthNow = monthNow.toString().padStart(2, '0');
    s.calendar = moment().format('MMMM YYYY');
    s.currentDate = moment().format('LL');
    s.showSchedPatient = false;
    s.tbl_loader = false;
   
    const dp = new DayPilot.Month("dp", {
        cssClassPrefix: "month_green",
        startDate: `${currYr}-${monthNow}-01`,       // Every 1st day of the month
        eventDeleteHandling: "Enabled",
        eventMoveHandling: "Disable"
    });

    dp.eventDeleteHandling = "JavaScript";
    dp.eventClickHandling = "Select";
    dp.init();

    dp.onEventClicked = function(args) {
        s.headerDate = '';
        s.headerDate = moment(args.e.data.start).format('ll');
      
        s.tbl_loader = true;
        getPatientList(args.e.data);
        s.showSchedPatient = true;
    };

    s.hideClientList = function() {
        s.showSchedPatient = false;
    }

    dp.onEventDelete = function(args) {
            swal({
                title: "Are you sure you want to delete this schedule?",
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No",
                closeOnConfirm: false,
                closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        h.post('../Hospital/Delete', { deleteData: args.e.data.id }).then(function (d) {
                            if (d.data.status == "error") {
                                swal({
                                    title: "Deletion Failed",
                                    text: "<labal>" + d.data.msg + "</label>",
                                    type: "error",
                                    html: true
                                });
                            }

                            else {
                                dp.events.remove(args.e);
                                swal("Deleted!", "Schedule is deleted", "success");
                            }
                        });
                    } else {
                        args.preventDefault();
                        swal("Cancelled", "", "error");
                    }
                });
    };
   
    // event creation
    dp.onTimeRangeSelected = function (args) {
       
        let sessionHospitalID = document.getElementById("sessionHospitalID").innerText;
       
        // Account is ADMIN or HR
        if(sessionHospitalID == 'Admin')
        {
            swal({
                title: 'Select District Hospital',
                text: '<div class="radio radio-success radio-inline"><input type="radio" id="radio_carmen" value="HPL001" name="radio_hospital" /><label for="radio_carmen"> CARMEN </label></div>' +
                      '<div class="radio radio-danger radio-inline"><input type="radio" id="radio_kapalong" value="HPL002" name="radio_hospital" /><label for="radio_kapalong"> KAPALONG </label></div>',
                      //'<div class="radio radio-primary radio-inline"><input type="radio" id="radio_igacos" value="HPL003" name="radio_hospital" /><label for="radio_igacos"> IGACOS </label></div>',
                type: "info",
                html: true,
                showCancelButton: true,
                closeOnConfirm: false,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    var selector = document.querySelector('input[name="radio_hospital"]:checked');
                    
                    if(selector) {
                        let selectedHospitalID = selector.value; 
                        let countSched = checkSchedule(selectedHospitalID, args.start.value);
                     
                        if(countSched.length > 0)
                        {
                            swal({
                                title: "ERROR",
                                text: "Schedule already exist!",
                                type: "error"
                            });
                        }

                        else
                            createSchedule(args, selectedHospitalID);
                    }

                    else {
                        swal({
                            title: "ERROR",
                            text: "Please select a district hospital",
                            type: "error"
                        });
                    }
                        
                }
            });
        }

        // Account is not ADMIN
        else {
            let countSched = checkSchedule(sessionHospitalID, args.start.value);
            if(countSched.length == 0)
            {
                createSchedule(args, sessionHospitalID);
            }
        }
    }

    function checkSchedule(paramHospitalID, dateStart) {
        let isExist = events.filter(function(data) {
            return data.hospitalID == paramHospitalID && data.start == moment(dateStart).format('YYYY-MM-DD');
        });
        
        return isExist;
    }

    function createSchedule(args, sessionHospitalID) {
        let selectedDate = moment(args.start.value).format('LL');
       
        swal({
            title: `Set laboratory schedule on ${selectedDate} day?`,
            text: "",
            type: "info",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, set it!",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false
            },
            function(isConfirm) {
                if (isConfirm) {
                    swal({
                        title: "SAVING",
                        text: "Please wait while we are saving your data.",
                        type: "info",
                        showConfirmButton: false
                    });

                    // Calendar events data
                    var event = new DayPilot.Event({
                        start: args.start,
                        end: args.end,
                        text: 'Capitol Employees',
                        hospitalID: sessionHospitalID,
                        backColor: sessionHospitalID == "HPL001" ? "#74c39d" : sessionHospitalID == "HPL002" ? "#FF7276" : "#7e9be6",
                        borderColor: sessionHospitalID == "HPL001" ? "#74c39d" : sessionHospitalID == "HPL002" ? "#FF7276" : "#7e9be6"
                    });

                    // For Back end data
                    let eventData = {
                        calendarID: DayPilot.guid(),
                        hospitalID: sessionHospitalID,
                        scheduleDate: args.start,
                        personnelID: null,
                        dateTimeLog: null
                    };

                    h.post('../Hospital/Create', {data: eventData}).then(function (d) {
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
                                title: "Created!",
                                text: "Schedule is set",
                                type: "success",
                                html: true,
                                confirmButtonColor: '#4bdead',
                                confirmButtonText: 'Ok',
                                closeOnConfirm: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    event.data.id = d.data.schedInfo.calendarID;
                                    event.data.hospitalID = d.data.schedInfo.hospitalID;

                                    //Adds the schedule/event to the calendar UI
                                    dp.events.add(event);
                                    dp.clearSelection();
                                }
                            });
                        }
                    });
                } else {
                    swal("Cancelled", "", "error");
                }
            });
    }


          function getSchedule() { 
              h.get('../Hospital/HospitalSchedule').then(function (d) {

                  let schedList = d.data.map(function (rec) {
                      let startDate = moment(rec.scheduleDate).format('YYYY-MM-DD');
                      let endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

                      events.push({
                          start: startDate,
                          end: endDate,
                          id: rec.calendarID,
                          text: 'Capitol Employees',
                          hospitalID: rec.hospitalID,
                          backColor: rec.hospitalID == "HPL001" ? "#74c39d" : rec.hospitalID == "HPL002" ? "#FF7276" : "#7e9be6",
                          borderColor: rec.hospitalID == "HPL001" ? "#74c39d" : rec.hospitalID == "HPL002" ? "#FF7276" : "#7e9be6"
                      });
                  });

                  dp.update({events});
              });
          }

          s.previousMonth = function() {
              dp.startDate = dp.startDate.addMonths(-1);
              s.calendar = moment(dp.startDate.value).format('MMMM YYYY');
              dp.update();
          }

          s.nextMonth = function() {
              dp.startDate = dp.startDate.addMonths(1);
              s.calendar = moment(dp.startDate.value).format('MMMM YYYY');
              dp.update();
              
          }

          function getPatientList(data) 
          {
              s.patientList = [];
              h.post('../Hospital/PatientList', { calendarID: data.id, scheduleDate: data.start }).then(function (d) {
                  s.patientList = d.data; 
                  s.tbl_loader = false;
              });

              
          }

          s.showTestedLab = function(data) {
              s.labTestTaken_loader = true;
          
              h.post('../Hospital/getLabForSchedule', { qrCode: data.qrCode, scheduleDate: data.scheduleDate } ).then(function (d) {
                  if (d.data.status == 'error') {
                      swal({
                          title: "ERROR",
                          text: d.data.msg,
                          type: "error"
                      });
                  }

                  else {
                      let result = d.data.filter(function(rec) {
                          return rec.isTested == 1;
                      });

                      angular.forEach(result, function (value) {  
                          value.dateTested = moment(value.dateTested).format('lll');
                      });

                      s.labHistoryList = result;
                  }

                  s.labTestTaken_loader = false;
                  $('#modalLabTestTaken').modal('show');
              });

              
          }
    
}]);