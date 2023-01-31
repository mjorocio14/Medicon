using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Data.Entity.Validation;
using System.Data.Entity;
using MediCon.Classes;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class SystemUserController : Controller
    {
        MediconEntities db = new MediconEntities();
        // GET: SystemUser
        [UserAccess]
        public ActionResult UserManagement()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getUsers()
        {
            var userList = db.Personnels.Select(a => new {
                            a.personnel_firstName,
                            a.personnel_midInit,
                            a.personnel_lastName,
                            a.personnel_extName,
                            a.isActive,
                            a.password,
                            a.personnelID,
                            a.position,
                            a.userTypeID,
                            a.username,
                            a.sex,
                            a.contactNum,
                            a.dateTimeLog,
                            a.serviceID,
                            userDesc = db.UserTypes.FirstOrDefault( b=> b.userTypeID == a.userTypeID).userTypeDesc,
                            service = db.Services.FirstOrDefault(e => e.serviceID == a.serviceID).serviceName
                            }).OrderByDescending(b => b.dateTimeLog).ToList();
            return Json(userList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult checkUname(string uName)
        {
            var c = 0;
            c = db.Personnels.Where(n => n.username == uName).Count();
            if (c > 0)
            {
                return Content("Exist");
            }
            else
            {
                return Content("Okay");
            }
        }

        [HttpPost]
        public ActionResult saveUser(Personnel a)
        {
            try
            {
                a.personnelID = "PID" + (Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty)).Substring(0, 5).ToUpper() +
                        (DateTime.Now.ToString().Replace("/", "").Replace(" ", "").Replace(":", "").ToUpper());

                var personnelID = new IDgenerator(a.password);

                a.personnelID = ("PID" + personnelID.generateID).Substring(0, 8); ;
                a.dateTimeLog = DateTime.Now;
                a.userEncoder = Session["personnelID"].ToString();
                a.isActive = true;
                db.Personnels.Add(a);

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { responseCode = 500, msg = "Saving failed!" }, JsonRequestBehavior.AllowGet);

                return Json(new { responseCode = 200, msg = "Account is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                return Json(new { responseCode = 500, msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult userEditInfo(Personnel cc)
        {
            cc.dateTimeLog = DateTime.Now;
            cc.userEncoder = Session["personnelID"].ToString();
            db.Entry(cc).State = EntityState.Modified;
            db.SaveChanges();
            return Content("Okay");
        }
        
        public ActionResult getUserTypes()
        {
            var userTypes = db.UserTypes.OrderBy(a => a.userTypeDesc).ToList();

            return Json(userTypes, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getServices()
        {
            var userTypes = db.Services.OrderBy(a => a.serviceName).ToList();

            return Json(userTypes, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult updateAccount(Personnel info)
        {
            try
            {
                var find = db.Personnels.SingleOrDefault(a => a.personnelID == info.personnelID);

                find.contactNum = info.contactNum;
                find.licenseNo = info.licenseNo;
                find.personnel_extName = info.personnel_extName;
                find.personnel_firstName = info.personnel_firstName;
                find.personnel_lastName = info.personnel_lastName;
                find.personnel_midInit = info.personnel_midInit;
                find.position = info.position;
                find.serviceID = info.serviceID;
                find.sex = info.sex;
                find.title = info.title;
                find.userTypeID = info.userTypeID;
                db.Entry(find).State = EntityState.Modified;

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { responseCode = 500, msg = "Account update/s is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { responseCode = 200, msg = "Account update/s is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { responseCode = 500, msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult resetPassword(string personnelID)
        {
            try
            {
                var find = db.Personnels.SingleOrDefault(a => a.personnelID == personnelID);

                find.password = find.username.ToLower() + find.personnel_lastName.ToLower();
                db.Entry(find).State = EntityState.Modified;

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { responseCode = 500, msg = "Account reset failed!" }, JsonRequestBehavior.AllowGet);

                return Json(new { responseCode = 200, msg = "Account is resetted successfully!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { responseCode = 500, msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }
    }
}