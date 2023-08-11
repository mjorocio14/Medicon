using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class HospitalController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrisDB = new HRISDBEntities();

        [UserAccess]
        // GET: Hospital
        public ActionResult Scheduler()
        {
            return View();
        }

        // POST: Hospital/Create
        [HttpPost]
        public ActionResult Create(HospitalCalendar data)
        {
            try
            {
                //data.hospitalID = Session["hospitalID"].ToString();

                // Check first if event already exist under the hospital
                var isExist = dbMed.HospitalCalendars.Count(a => a.hospitalID == data.hospitalID && a.scheduleDate == data.scheduleDate);

                if(isExist > 0)
                    return Json(new { status = "error", msg = "Schedule already exist!" }, JsonRequestBehavior.AllowGet);

                //......  SAVE DATA TO HOSPITAL CALENDAR
                data.calendarID = data.calendarID.Substring(0, 15);
                data.personnelID = Session["personnelID"].ToString();
                data.dateTimeLog = DateTime.Now;
                dbMed.HospitalCalendars.Add(data);

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


        // POST: Hospital/Delete/5
        [HttpPost]
        public ActionResult Delete(string deleteData)
        {
            try
            {
                // Check first if there is no patient scheduled on the date selected to be deleted
                var patientExist = dbMed.Referrals.Count(a => a.calendarID == deleteData);

                // If patient exist on the selected date DO NOT DELETE THE SCHEDULE
                if(patientExist > 0)
                    return Json(new { status = "error", msg = "There are patient/s scheduled for this day." }, JsonRequestBehavior.AllowGet);

                // Deleting schedule
                var toDelete = dbMed.HospitalCalendars.SingleOrDefault(a => a.calendarID == deleteData);
                dbMed.HospitalCalendars.Remove(toDelete);
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

        [HttpGet]
        public ActionResult HospitalSchedule()
        {
            try
            {
                var userType = Session["userTypeID"].ToString();
                var hospitalID = string.Empty;
                if (userType != "1" || userType != "10") hospitalID = Session["hospitalID"].ToString();

                var list = userType == "1" || userType == "10" ? dbMed.HospitalCalendars.ToList() : dbMed.HospitalCalendars.Where(a => a.hospitalID == hospitalID).ToList();

                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult AllHospitalSchedule(DateTime date)
        {
            try
            {
                var firstDayMonth = new DateTime(date.Year, date.Month, 1);

                // Only get the list of schedule for the date and onwards to reduce bulk fetching
                var list = dbMed.HospitalCalendars.Where(a => a.scheduleDate >= firstDayMonth)
                                                  .Select(b => new
                                                  {
                                                      b.calendarID,
                                                      b.hospitalID,
                                                      b.scheduleDate,
                                                      patientCount = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, con => con.vSignID, (vs, con) => new { vs, con }).
                                                                     Join(dbMed.Referrals, r1 => r1.con.consultID, reff => reff.consultID, (r1, reff) => new { r1, reff })
                                                                     .Select(a => new { a.reff.calendarID, a.r1.vs.qrCode }).Distinct().Count(c => c.calendarID == b.calendarID)
                                                  }).ToList();

                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult PatientList(string calendarID)
        {
            try
            {
                var patients = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, con => con.vSignID, (vs, con) => new { vs, con })
                                               .Join(dbMed.Referrals, r1 => r1.con.consultID, reff => reff.consultID, (r1, reff) => new { r1, reff })
                                               .Where(a => a.reff.referredServiceID == "SERVICE006" && a.reff.calendarID == calendarID)
                                               .Select(b => new { 
                                                    b.r1.vs.qrCode,
                                               }).Distinct().ToList();

                var list = patients.Join(hrisDB.vEmployeeHealthWells, hw => hw.qrCode, emp => emp.qrCode, (hw, emp) => new { hw, emp })
                                    .Select(a => new
                                    {
                                        a.emp.idNo,
                                        a.emp.qrCode,
                                        a.emp.fullNameLast,
                                        a.emp.shortDepartmentName,
                                        isTested = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, con => con.vSignID, (vs, con) => new { vs, con })
                                                 .Join(dbMed.Referrals, r1 => r1.con.consultID, reff => reff.consultID, (r1, reff) => new { r1, reff })
                                                 .Join(dbMed.LaboratoryExams, r2 => r2.reff.referralID, le => le.referralID, (r2, le) => new { r2, le })
                                                 .Count(b => b.r2.r1.vs.qrCode == a.emp.qrCode && b.le.isTested == true)
                                    }).OrderBy(b => b.fullNameLast);

                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
