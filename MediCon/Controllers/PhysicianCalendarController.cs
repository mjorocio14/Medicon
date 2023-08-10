using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class PhysicianCalendarController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrisDB = new HRISDBEntities();

        [UserAccess]
        // GET: PhysicianCalendar
        public ActionResult Calendar()
        {
            return View();
        }

        [HttpGet]
        public ActionResult Schedule()
        {
            try
            {
                var userType = Session["userTypeID"].ToString();
                var personnelID = string.Empty;
                if (userType != "1") personnelID = Session["personnelID"].ToString();

                var list = userType == "1" ? dbMed.PhysicianCalendars.ToList() : dbMed.PhysicianCalendars.Where(a => a.personnelID == personnelID).ToList();

                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        // POST: PhysicanCalendar/Create
        [HttpPost]
        public ActionResult Create(PhysicianCalendar data)
        {
            try
            {
                // Check first if event already exist under the hospital
                var isExist = dbMed.PhysicianCalendars.Count(a => a.personnelID == data.personnelID && a.scheduleDate == data.scheduleDate);

                if (isExist > 0)
                    return Json(new { status = "error", msg = "Schedule already exist!" }, JsonRequestBehavior.AllowGet);

                //......  SAVE DATA TO HOSPITAL CALENDAR
                data.phyCalendarID = data.phyCalendarID.Substring(0, 15);
                data.createPersonnelID = Session["personnelID"].ToString();
                data.dateTimeLog = DateTime.Now;
                dbMed.PhysicianCalendars.Add(data);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Schedule is not set!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", schedInfo = data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving the diagnosis.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        // POST: PhysicianCalendar/Delete/5
        [HttpPost]
        public ActionResult Delete(string deleteData)
        {
            try
            {
                // Check first if there is no patient scheduled on the date selected to be deleted
                var patientExist = dbMed.PatientAppointments.Count(a => a.phyCalendarID == deleteData);

                // If patient exist on the selected date DO NOT DELETE THE SCHEDULE
                if (patientExist > 0)
                    return Json(new { status = "error", msg = "There are patient/s scheduled for this day." }, JsonRequestBehavior.AllowGet);

                // Deleting schedule
                var toDelete = dbMed.PhysicianCalendars.SingleOrDefault(a => a.phyCalendarID == deleteData);
                dbMed.PhysicianCalendars.Remove(toDelete);
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Deletion failed!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Schedule is successfully deleted." }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}