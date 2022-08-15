app.controller('userCtrl', ['$scope', '$http', function (s, h) {

    s.users = {};
    var usern = new RegExp("^(?=.{6,})");
    var pass = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.{6,})");
    
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
                    return '<strong>' + row.personnel_firstName + ' ' +   (row.personnel_middleName != null ? row.personnel_middleName : "")  + ' ' + row.personnel_lastName + ' ' + (row.personnel_extName != null ? row.personnel_extName : "")  + '</strong>';
                }
            },
            {
                "data": null, render: function (row) {
                    //return row.sex
                    return row.sex == 0 ? '<span class="label label-danger">Female</span></p>' : '<span class="label label-success">Male</span></p>';
                }
            },
               {
                   "data": null, render: function (row) {
                       return row.position;
                   }
               },

               {
                   "data": null, render: function (row) {
                       return row.userType;
                   }
               },
                {
                    "data": null, render: function (row) {
                        return row.contactNum;
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
                    return '<button id="viewInfo" class="btn btn-primary btn-xs" ><i class="fa fa-pencil" cursor:pointer;></i></button>';
                }
            }
            ],
            "order": [[0, "asc"]],
            "responsive": true,
            'columnDefs': [
               {
                   "targets": [0],
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
            var a = userTable.row($(this).parents('tr')).data();
            var status = angular.copy(a);

            var st = status.isActive == 0 ? "activated" : "deactivated";


            swal({
                title: "The account is being " +st,
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
                           swal("Cancelled", "Data not saved! :)", "error")
                       }
                   });
           
        });

        $.fn.DataTable.FixedHeader;
    }


    s.addUser = function () {
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


    s.saveUserz = function (a) {
        console.log(a)
        if (usern.test(a.username)) {
            if (a.password != a.cpassword) {
                swal({
                    title: "Password does not match!",
                    text: "",
                    type: "error"
                });
                return;
            }
            else {
                if (pass.test(a.password)) {
                    h.post('../SystemUser/checkUname?uName=' + a.username).then(function (d) {
                        if (d.data == "Exist") {
                            swal({
                                title: "Username already exist!",
                                text: "Please use another username.",
                                type: "error"
                            });
                            return;
                        }
                        else {

                            a.sex = a.sex == 'MALE' ? 1 : 0;

                            h.post('../SystemUser/saveUser', a).then(function (d) {
                                if (d.data.errCode != 1 && d.data.errCode != 0) {
                                    if (d.data.status == 00) {
                                        swal({
                                            title: "SUCCESS!",
                                            text: d.data.msg,
                                            type: "success"
                                        });
                                       
                                        s.users = {};
                                        loadTable();
                                    }
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
                else {
                    swal({
                        title: "Password Error!",
                        text: "Must contain atleast one alphabetical, one numeric character and minimum of 6 characters! ",
                        type: "error"
                    });
                    return;
                }
            }
        }
        else {
            swal({
                title: "Username Error!",
                text: "Must be minimum of 6 characters! ",
                type: "error"
            });
            return;
        }
        
    }
   
    //s.cancelBtn = function () {
    //    s.info = {};
    //    $('#unitSelect').val('').trigger('change');
    //    return;
    //}

}]);
