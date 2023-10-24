app.controller('AppointmentCtrl', ['$scope', '$http', function (s, h) {
    let events = [];
    getPhysicianList();
    getSchedule();
    s.modal_tableLoader = false;
    s.scheduleData = {};

    let currMonth = new Date().getMonth();
    let currYr = new Date().getFullYear();
    let monthNow = currMonth + 1;
    monthNow = monthNow.toString().padStart(2, '0');
    s.calendar = moment().format('MMMM YYYY');
    s.currentDate = moment().format('LL');
    s.showSchedPatient = false;
    s.tbl_loader = false;
    let clickedEventData = {};
    let eventInfo = {};

    const dp = new DayPilot.Month("dp", {
        cssClassPrefix: "month_green",
        startDate: `${currYr}-${monthNow}-01`,       // Every 1st day of the month
        eventMoveHandling: "Disable"
    });

    dp.eventClickHandling = "Select";
    dp.init();

    dp.onEventClicked = function(args) {
        s.headerDate = '';
        s.headerDate = moment(args.e.data.start).format('ll');
        clickedEventData = args.e.data;
      
        s.tbl_loader = true;
        getPatientList(args.e.data);
        s.showSchedPatient = true;

        // ------------
       
        eventInfo = args.e.data;
        //s.scheduleData.calendarID = args.e.data.id;
        //s.scheduleData.physician = args.e.data.text;
        //s.scheduleData.personnelID = args.e.data.personnelID;
        //s.scheduleData.followUpDate = args.e.data.start;
        //s.$apply();
        //$('#modalPatientScheduler').modal('show');
    };

    s.hideClientList = function() {
        s.showSchedPatient = false;
    }

    function checkSchedule(qrCodeData) {
        let appDateData = new Date(clickedEventData.start); 
        let count = 0;

        h.post('../PatientCalendar/CheckAppointment', { qrCode: qrCodeData, appDate: appDateData }).then(function(d) {
            count = d.data;
        });

        return count;
    }

    s.createAppointment = function(appData) { 
            swal({
                title: 'Appointment',
                text: `Set appointment on ${moment(s.scheduleData.followUpDate).format('ll')} between ${appData.patientCount} patients and ${appData.physician}?`,
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

                            //h.post('../PatientCalendar/Create', {qrCode: appData.qrCode, calendarID: clickedEventData.id}).then(function (d) {
                            h.post('../PatientCalendar/Create', {calendarID: appData.calendarID, consultDate: moment(appData.date).format('YYYY-MM-DD'), personnelID: appData.personnelID}).then(function (d) {
                                if (d.data.status == "error") {
                                    swal({
                                        title: "ERROR",
                                        text: "<labal>" + d.data.msg + "</label>",
                                        type: "error",
                                        html: true
                                    });
                                }

                                else {

                                    // Send SMS schedule to patient
                                    sendSMS(appData);
                                    //appData.contactNo = "09688515104";
                                    //if (appData.contactNo != null && appData.contactNo != '') sendSMS(appData, clickedEventData);
                                    
                                    swal({
                                        title: "Created!",
                                        text: "Appointment is set",
                                        type: "success",
                                        html: true,
                                        confirmButtonColor: '#4bdead',
                                        confirmButtonText: 'Ok',
                                        closeOnConfirm: true
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            s.tbl_loader = true;
                                            getPatientList(clickedEventData);
                                            
                                            $('#modalPatientScheduler').modal('hide');
                                            s.resetSchedulerModal();

                                            //$('#modalPatient').modal('hide');
                                            //s.resetModal();
                                            s.$apply();
                                        }
                                    });
                                }
                            });
                        }
                    });


        //let countSched = checkSchedule(appData.qrCode);
       
        //if(countSched.length > 0)
        //{
        //    swal({
        //        title: "ERROR",
        //        text: "Schedule already exist!",
        //        type: "error"
        //    });
        //}
       
        //else {

        //    let physician = s.physicianList.filter(function (val) {
        //        return val.personnelID == clickedEventData.personnelID;
        //    });

        //    swal({
        //        title: 'Appointment',
        //        text: `Set appointment on ${s.headerDate} between ${appData.fullNameTitle} and Dr. ${physician[0].personnel_lastName}?`,
        //        type: "info",
        //        showCancelButton: true,
        //        confirmButtonClass: "btn-danger",
        //        confirmButtonText: "Yes, set it!",
        //        cancelButtonText: "No",
        //        closeOnConfirm: false,
        //        closeOnCancel: true
        //    },
        //            function(isConfirm) {
        //                if (isConfirm) {
        //                    swal({
        //                        title: "SAVING",
        //                        text: "Please wait while we are saving your data.",
        //                        type: "info",
        //                        showConfirmButton: false
        //                    });

        //                    h.post('../PatientCalendar/Create', {qrCode: appData.qrCode, calendarID: clickedEventData.id}).then(function (d) {
        //                        if (d.data.status == "error") {
        //                            swal({
        //                                title: "ERROR",
        //                                text: "<labal>" + d.data.msg + "</label>",
        //                                type: "error",
        //                                html: true
        //                            });
        //                        }

        //                        else {

        //                            // Send SMS schedule to patient
        //                            appData.contactNo = "09688515104";
        //                            if (appData.contactNo != null && appData.contactNo != '') sendSMS(appData, clickedEventData);
                                    
        //                            swal({
        //                                title: "Created!",
        //                                text: "Appointment is set",
        //                                type: "success",
        //                                html: true,
        //                                confirmButtonColor: '#4bdead',
        //                                confirmButtonText: 'Ok',
        //                                closeOnConfirm: true
        //                            }, function (isConfirm) {
        //                                if (isConfirm) {
        //                                    s.tbl_loader = true;
        //                                    getPatientList(clickedEventData);

        //                                    $('#modalPatient').modal('hide');
        //                                    s.resetModal();
        //                                    s.$apply();
        //                                }
        //                            });
        //                        }
        //                    });
        //                }
        //            });
        //    }
    }

    s.addPatient = function() {
        //$('#modalPatient').modal('show');

        s.scheduleData.calendarID = eventInfo.id;
        s.scheduleData.physician = eventInfo.text;
        s.scheduleData.personnelID = eventInfo.personnelID;
        s.scheduleData.followUpDate = eventInfo.start;
        $('#modalPatientScheduler').modal('show');
    }

    s.resetModal = function() {
        s.infoFormData = {};
        s.searchResultList = [];
    }

    s.resetSchedulerModal = function() {
        s.scheduleData = {}
        eventInfo = {};
    }


    function getSchedule() { 
        h.get('../PhysicianCalendar/Schedule').then(function (d) {

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

    //function sendSMS(emp, schedInfo) {
    function sendSMS(appData) {
        //let data = {
        //    employee: emp.fullNameTitle,
        //    contactNo: emp.contactNo,
        //    //contactNo: "09688515104",
        //    appointee: schedInfo.personnelID,
        //    schedule: schedInfo.start
        //};
    
        h.post('../SendSMS/GroupMessageSend', { calendarID: appData.calendarID, consultDate: moment(appData.date).format('YYYY-MM-DD'), followUpDate: appData.followUpDate, personnelID: appData.personnelID }).then(function (d) {
            console.log(d);
        });
    }

    s.selectConsultationDate = function(data) {
        h.post('../PatientCalendar/GetPatientCount', { date: moment(data.date).format('YYYY-MM-DD'), physicianID: data.personnelID } ).then(function (d) {
            s.scheduleData.patientCount = 0;
            s.scheduleData.patientCount = d.data;
        });
    }

}]);