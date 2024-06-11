app.controller('userCtrl', ['$scope', '$http', function (s, h) {
    getUserTypes();
    getServices();
    getHospital();
    s.users = {};
    var usern = new RegExp("^(?=.{6,})");
    var pass = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.{6,})");
    s.isEditting = false;
    
    s.showPass1 = function () {

        var x = document.getElementById("password1");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }

    s.showPass2 = function () {
        var x = document.getElementById("password2");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }

    loadTable();
    function loadTable() {
        if ($.fn.DataTable.isDataTable("#userTable")) {
            $('#userTable').DataTable().clear().destroy();
        }
        var userTable = $('#userTable').DataTable({
            "ajax": {
                "url": '../SystemUser/getUsers',
                "type": 'POST',
                "dataSrc": "",
                "recordsTotal": 20,
                "recordsFiltered": 20,
                "deferRender": true
            },
            "pageLength": 10,
            //"searching": true,
            "fixedColumns": true,
            "language":
             {
                 "loadingRecords": '<div class="spiner-example"><div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div></div>',
                 "emptyTable": '<span class="text-center text-semibold" style="vertical-align: middle; font-weight:700;">NO INFORMATION FOUND!</span>'
             },
            //"processing": false,
            "columns": [{
                "data": "index", "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            }, {
                "data": null,
                render: function (row) {
                    return '<strong>' + row.personnel_firstName + ' ' + (row.personnel_midInit != null ? row.personnel_midInit : "") + ' ' + row.personnel_lastName + ' ' + (row.personnel_extName != null ? row.personnel_extName : "") + '</strong>';
                }
            },
            {
                "data": null, render: function (row) {
                    //return row.sex
                    return row.sex == 0 ? 'F' : 'M';
                }
            },
             {
                 "data": null, render: function (row) {
                     return row.contactNum;
                 }
             },
               {
                   "data": null, render: function (row) {
                       return row.position;
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.userDesc;
                   }
               },
               {
                   "data": null, render: function (row) {
                       return row.service;
                   }
               },
               
                {
                    "data": null, render: function (row) {
                        return row.username;
                    }
                },
                {
                    "data": null, render: function (row) {
                        //return row.isActive
                        return row.isActive == 1 ? '<button id="active" class="btn btn-info btn-xs" >Active</button>' : '<button id="active" class="btn btn-danger btn-xs" >Inactive</button>';
                    }
                },
            {
                "data": null, render: function () {
                    return '<button id="viewInfo" class="btn btn-primary btn-sm" style="margin-right: 3px;"><i class="fa fa-pencil" cursor:pointer;></i></button>' +
                            '<button id="resetPassword" class="btn btn-warning btn-sm" ><i class="fa fa-refresh" cursor:pointer;></i></button>';
                }
            }
            ],
            "order": [[0, "asc"]],
            "responsive": true,
            'columnDefs': [
               {
                   "targets": [0, 2, 3, 4, 5, 6, 7, 8, 9],
                   "className": "text-center"
               }
            ],
            "lengthChange": true,
            "autoWidth": true,
            "scrollY": 400,
            "scrollX": true
        });
        $('#userTable tbody').off('click');
        $('#userTable tbody').on('click', '#active', function () {
            var status = angular.copy(userTable.row($(this).parents('tr')).data());
            var st = status.isActive == 0 ? "activated" : "deactivated";

            swal({
                title: "The account will be " +st,
                text: "Are you sure you want to proceed ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, proceed!",
                cancelButtonText: "No, cancel it!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                   function (isConfirm) {
                       if (isConfirm) {
                           s.$apply(function () {
                               s.check(status);
                           });
                       } else {
                           swal("Cancelled", "", "error")
                       }
                   });
           
        });

        $('#userTable tbody').on('click', '#viewInfo', function () {
            var data = angular.copy(userTable.row($(this).parents('tr')).data());

            s.users = {};
            data.sex = data.sex == true ? 'MALE' : 'FEMALE';
            s.users = data;
            $('#addUserModal').modal('show');
            s.isEditting = true;
            s.$apply();
        });

        $('#userTable tbody').on('click', '#resetPassword', function () {
            var data = angular.copy(userTable.row($(this).parents('tr')).data());

            swal({
                title: "Reseting...",
                text: "Please wait while we are reset your password",
                type: "info",
                showConfirmButton: false
            });

            h.post('../SystemUser/resetPassword?personnelID=' + data.personnelID).then(function (d) {
                if (d.data.responseCode == 200) {
                    swal({
                        title: "SUCCESS!",
                        text: d.data.msg,
                        type: "success"
                    });

                    loadTable();
                }

                else {
                    swal({
                        title: "ERROR!",
                        text: d.data.msg,
                        type: "error"
                    });
                    return;
                }
            });
        });

        $.fn.DataTable.FixedHeader;
    }


    s.addUser = function () {
        s.users = {};
        s.isEditting = false;
        s.credentials = true;
        $('#addUserModal').modal('show');
    }

    s.check = function (a) {
        if (a.isActive == 1) {
            a.isActive = 0
        }

        else if (a.isActive == 0) {
            a.isActive = 1
        }

        h.post('../SystemUser/userEditInfo', a).then(function (d) {
            if (d.data == "Okay") {
                swal({
                    title: "Changes successfully saved",
                    text: "",
                    type: "success"
                });
                loadTable();
            }
        })
    }

    s.saveUser = function (a) {
        if (!usern.test(a.username) && a.userTypeID != '3') {
                swal({
                    title: "Username Error!",
                    text: "Must be minimum of 6 characters! ",
                    type: "error"
                });
        }

        else if (a.password != a.cpassword && a.userTypeID != '3') {
                swal({
                    title: "Password does not match!",
                    text: "",
                    type: "error"
                });
        }

        else if (!pass.test(a.password) && a.userTypeID != '3') {
                swal({
                    title: "Password Error!",
                    text: "Must contain atleast one alphabetical, one numeric character and minimum of 6 characters! ",
                    type: "error"
                });
        }

        else {
                    h.post('../SystemUser/checkUname?uName=' + a.username).then(function (d) {
                        if (d.data == "Exist") {
                            swal({
                                title: "Username already exist!",
                                text: "Please use other username.",
                                type: "error"
                            });
                            return;
                        }
                        else {

                            a.sex = a.sex == 'MALE' ? 1 : 0;
                     
                            h.post('../SystemUser/saveUser', a).then(function (d)
                            {
                                if (d.data.responseCode == 200)
                                {
                                    swal({
                                        title: "SUCCESS!",
                                        text: d.data.msg,
                                        type: "success"
                                    });

                                    s.users = {};
                                    loadTable();
                                    $('#addUserModal').modal('hide');
                                }

                                else {
                                    swal({
                                        title: "ERROR!",
                                        text: d.data.msg,
                                        type: "error"
                                    });
                                    return;
                                }
                            });
                        }
                    });
        }
    }
   
    s.saveUpdates = function (info) {
        swal({
            title: "Updating...",
            text: "Please wait while we are saving your updates",
            type: "info",
            showConfirmButton: false
        });

        info.sex = info.sex == 'MALE' ? 1 : 0;

        h.post('../SystemUser/updateAccount', info).then(function (d) {
            if (d.data.responseCode == 200) {
                swal({
                    title: "SUCCESS!",
                    text: d.data.msg,
                    type: "success"
                });

                s.users = {};
                loadTable();
                $('#addUserModal').modal('hide');
            }

            else {
                swal({
                    title: "ERROR!",
                    text: d.data.msg,
                    type: "error"
                });
                return;
            }
        });
    }

    s.credentials = true;

    s.sService = function (userTypeID) {
        if (userTypeID == 3)
            s.credentials = false;

        else {
            s.credentials = true;

            if (userTypeID == 1 || userTypeID == 4 || userTypeID == 7 || userTypeID == 8 || userTypeID == 9 || userTypeID == 10)
                s.users.serviceID = null;
        }
    }


    s.printBtn = function () {

        var qrCode = "DDNBDKKAYZWX"

        h.post('../Print/printAccomp?qrCode=' + qrCode).then(function (d) {
            window.open("../Report/MediConRpt.aspx?type=lrrf");
        });
    }

    function getUserTypes() {
        s.userTypes = [];
        
        h.post('../SystemUser/getUserTypes').then(function (d) {
            s.userTypes = d.data;
        });
    }

    function getServices() {
        s.services = [];

        h.post('../SystemUser/getServices').then(function (d) {
            s.services = d.data;
        });
    }

    function getHospital() {
        s.hospitalList = [];

        h.post('../SystemUser/getHospital').then(function (d) {
            s.hospitalList = d.data;
        });
    }

}]);
