app.controller('PhysicianCalendarCtrl', ['$scope', '$http', function (s, h) {
    let events = [];
    getPhysicianList();
    getSchedule();
   
    s.selectedDate = '';
    s.selectedPhysician = '';
    let currMonth = new Date().getMonth();
    let currYr = new Date().getFullYear();
    let monthNow = currMonth + 1;
    monthNow = monthNow.toString().padStart(2, '0');
    s.calendar = moment().format('MMMM YYYY');
    s.currentDate = moment().format('LL');
    s.showSchedPatient = false;
    s.tbl_loader = false;
    s.physicianList = [];
   
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
                h.post('../PhysicianCalendar/Delete', { deleteData: args.e.data.id }).then(function (d) {
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
    let sessionUserTypeID = document.getElementById("sessionUserTypeID").innerText;
    s.selectedDate = args;

    // Account is ADMIN or HR
    if(sessionUserTypeID == 1 || sessionUserTypeID == 10)
    {
        getPhysicianList();
        $('#modalPhysician').modal('show');
    }

    // Account is not ADMIN
    else {
        let id = document.getElementById("sessionPersonnelID").innerText;
        s.createAppointment(id);
    }
}

function checkSchedule(personnelID) { 
    let isExist = events.filter(function(data) {
        return data.personnelID == personnelID && data.start == moment(s.selectedDate.start.value).format('YYYY-MM-DD');
    });
        
    return isExist;
}

s.createAppointment = function(selectedPersonnel) { 
    let sessionPersonnelID = document.getElementById("sessionPersonnelID").innerText;
    let countSched = checkSchedule(sessionPersonnelID);

    if(countSched.length > 0)
    {
        swal({
             title: "ERROR",
             text: "Schedule already exist!",
             type: "error"
        });
    }

    else {
        swal({
             title: `Set schedule on ${moment(s.selectedDate.start.value).format('LL')} day?`,
            text: "",
            type: "info",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, set it!",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: true
        },
        function(isConfirm) {
            if (isConfirm) {
                swal({
                    title: "SAVING",
                    text: "Please wait while we are saving your data.",
                    type: "info",
                    showConfirmButton: false
                });

                let colorValue = s.physicianList.filter(function (val) {
                    return val.personnelID == selectedPersonnel;
                });

                // Calendar events data
                var event = new DayPilot.Event({
                    start: s.selectedDate.start,
                    end: s.selectedDate.end,
                    text: 'Capitol Employees',
                    personnelID: selectedPersonnel,
                    backColor: colorValue[0].color,
                    borderColor: colorValue[0].color
                });

                // For Back end data
                let eventData = {
                    phyCalendarID: DayPilot.guid(),
                    personnelID: selectedPersonnel,
                    scheduleDate: s.selectedDate.start,
                    createPersonnelID: null,
                    dateTimeLog: null
                };

                h.post('../PhysicianCalendar/Create', {data: eventData}).then(function (d) {
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
                                event.data.id = d.data.schedInfo.phyCalendarID;
                                event.data.personnelID = d.data.schedInfo.personnelID;

                                //Adds the schedule/event to the calendar UI
                                dp.events.add(event);
                                dp.clearSelection();

                                $('#modalPhysician').modal('hide');
                                s.selectedDate = '';
                                s.selectedPhysician = '';
                            }
                        });
                    }
                });
            }
        });
    }
}


async function getSchedule() { 
   await h.get('../PhysicianCalendar/Schedule').then(function (d) {

        let userType = document.getElementById("sessionUserTypeID").innerText; 
       
        let schedList = d.data.map(function (rec) {
            let startDate = moment(rec.scheduleDate).format('YYYY-MM-DD');
            let endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
            
            let colorValue = s.physicianList.filter(function (val) {
                return val.personnelID == rec.personnelID;
            });
           
            events.push({
                start: startDate,
                end: endDate,
                id: rec.phyCalendarID,
                text: userType == 1 || userType == 10 ? 'Dr. ' + colorValue[0].personnel_lastName : 'Capitol Employees',
                personnelID: rec.personnelID,
                backColor: colorValue[0].color,
                borderColor: colorValue[0].color
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
    h.get('../PatientCalendar/PatientList?calendarID=' + data.id).then(function (d) {
        s.patientList = d.data;
        s.tbl_loader = false;
    });
}

async function getPhysicianList() 
{
    
    // Blue, Red, Yellow, Orange, Purple, Green, Grey, Brown
    let colors = ['#006EB3', '#FF6D6A', '#F6BE00', '#F6BE00', '#68478D', '#00873E', '#888B8D', '#623412'];

   await h.post('../SystemUser/getUsers').then(function (d) {
        let result = d.data.filter(function (rec) {
            return rec.userTypeID == 5;
        });
        
        result = result.map(function (data, index) { 
            // Generate random color per physician
            data.color = colors[index];
            data.physicianFullName = data.personnel_lastName + ', ' + data.personnel_firstName + ' ' + (data.personnel_extName ?? '') + ' ' + (data.personnel_midInit ?? '');
            return data;
        });
  
        s.physicianList = result;
    });
}


    
}]);