app.controller('ClinicPatientAppCtrl', ['$scope', '$http', function (s, h) {
    let events = [];
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
    let unavailableData = {}
    let toDeleteArgs;
    s.justification = '';
    s.bookedPatients = [];

    const dp = new DayPilot.Month("dp", {
        cssClassPrefix: "month_green",
        startDate: `${currYr}-${monthNow}-01`,       // Every 1st day of the month
        eventDeleteHandling: "Enabled",
        eventMoveHandling: "Disable"
    });

    let today = new Date();
    let addMonthNumber = 0;
    getSchedule(today);

    dp.eventDeleteHandling = "JavaScript";
    dp.eventClickHandling = "Select";
    dp.init();

    dp.onEventClicked = function (args) {
        s.headerDate = '';
        s.headerDate = moment(args.e.data.start).format('ll');

        s.tbl_loader = true;
        getPatientList(args.e.data.start).then(function (result) {
            s.patientList = result.data;
        });
        s.showSchedPatient = true;
        s.tbl_loader = false;
    };

    // event creation
    dp.onTimeRangeSelected = function (args) {
        // Create Available Schedule
        swal({
            title: `Set schedule on ${moment(args.start.value).format('LL')} day?`,
            text: "",
            type: "info",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, set it!",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                if (isConfirm) {
                    swal({
                        title: "SAVING",
                        text: "Please wait while we are saving your data.",
                        type: "info",
                        showConfirmButton: false
                    });

                    h.post('../ClinicPatientAppointment/Create', { dateAvailable: args.start.value }).then(function (d) {
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
                                    // Calendar events data
                                    var event = new DayPilot.Event({
                                        start: args.start.value,
                                        end: args.end.value,
                                        text: 'Medical Consultation',
                                        personnelID: 'PID8cbf8',    // Dr. Miyake personnelID
                                        serviceID: 'SERVICE001',    // Service ID for Medical Consultation
                                        backColor: '#1c84c6',
                                        borderColor: '#1c84c6'
                                    });

                                    //Adds the schedule/event to the calendar UI
                                    dp.events.add(event);
                                    dp.clearSelection();
                                }
                            });
                        }
                    });
                }
            });
    }

    s.hideClientList = function () {
        s.showSchedPatient = false;
    }

    dp.onEventDelete = function (args) {
        swal({
            title: "",
            text: "Checking the number of employees who booked this date. \n Please wait...",
            type: "info",
            showConfirmButton: false
        })

        getPatientList(args.e.data.start).then(function (result) {
            s.bookedPatients = result.data;

            swal({
                title: "",
                text: `${result.data.length > 0 ? `There ${result.data.length > 1 ? `are` : `is`} ${result.data.length} booking/s for this date.`
                    : 'No booking for this date.'}\n Are you sure you want to delete this schedule?`,
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        swal.close();
                        toDeleteArgs = args;

                        unavailableData = {
                            personnelID: toDeleteArgs.e.data.personnelID,
                            serviceID: toDeleteArgs.e.data.serviceID,
                            date: toDeleteArgs.e.data.start,
                            justification: ''
                        }

                        $('#modalJusty').modal('show');
                    } else {
                        args.preventDefault();
                        swal("", "Cancelled", "error");
                    }
                });
        });
    };

    async function getSchedule(today) {
        let year = today.getFullYear();
        let month = today.getMonth(); // 0 is January, 11 is December
        let weekdays = getWeekdayDates(year, month);

        await getUnavailableSched(today.getMonth(), today.getFullYear()).
            then((result) => {
                for (let i = 0; i < result.data.length; i++) {
                    let dateToRemove = moment(result.data[i].date).format('YYYY-MM-DD');
                    weekdays.splice(weekdays.indexOf(dateToRemove), 1);
                }
            });

        weekdays.map(function (day) {
            let exist = events.find((e) => e.start == day);
            let toAdd = {
                start: day,
                end: moment(day).add(1, 'days').format('YYYY-MM-DD'),
                id: day.replace('-', ''),
                text: 'Medical Consultation',
                personnelID: 'PID8cbf8',    // Dr. Miyake personnelID
                serviceID: 'SERVICE001',    // Service ID for Medical Consultation
                backColor: '#1c84c6',
                borderColor: '#1c84c6'
            };

            if (exist) {
                console.log(exist)
                delete events[events.indexOf(toAdd)];
            }

            else {
                events.push(toAdd);
            }
        });

        dp.update({ events });
    }

    function getUnavailableSched(month, year) {
        // 0 is January, 11 is December
        return h.post('../ClinicPatientAppointment/UnavailableSchedule', { month: month + 1, year: year });
    }

    function getWeekdayDates(year, month) {
        let weekdays = [];
        let date = new Date(year, month, 1);
        let monthEnd = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= monthEnd; i++) {
            let day = new Date(year, month, i).getDay();
            if (day >= 1 && day <= 5) {
                weekdays.push(moment(new Date(year, month, i).toISOString()).format('YYYY-MM-DD'));
                // weekdays.push(new Date(year, month, i).toISOString().split('T')[0]);
            }
        }

        return weekdays;
    }

    s.nextPrevMonth = function (type) {
        let nextMonthDate = new Date(today);
        let addMonth;

        if (type === 'next') addMonth = ++addMonthNumber;
        else addMonth = --addMonthNumber;

        nextMonthDate.setMonth(currMonth + addMonth);
        getSchedule(new Date(nextMonthDate.toISOString()));

        dp.startDate = dp.startDate.addMonths(type === 'next' ? 1 : -1);
        s.calendar = moment(dp.startDate.value).format('MMMM YYYY');    // Calendar Title
        dp.update();
    }

    function getPatientList(selectedDate) {
        return h.get('../ClinicPatientAppointment/ClinicPatientList?bookingDate=' + selectedDate);
    }

    s.setUnavailability = function (value) {
        unavailableData.justification = value;

        var clientInfos = [];
        s.bookedPatients.forEach((emp) => {
            clientInfos.push({
                employee: emp.fullNameLast,
                contactNo: emp.contactNo,
                schedule: unavailableData.date
            });
        });

        swal({
            title: "",
            text: "Saving Unavailability \n Please wait...",
            type: "info",
            showConfirmButton: false
        })

        h.post('../ClinicPatientAppointment/physicianUnavailable', { data: unavailableData, empList: clientInfos })
            .then(function (d) {
                if (d.data.status == "error") {
                    swal({
                        title: "Failed",
                        text: "<labal>" + d.data.msg + "</label>",
                        type: "error",
                        html: true
                    });
                }

                else {
                    dp.events.remove(toDeleteArgs.e);
                    toDeleteArgs = {};
                    s.justification = '';
                    unavailableData = {};
                    $('#modalJusty').modal('hide');
                    swal("Saved!", d.data.msg, "success");
                }
            })
    }

}]);