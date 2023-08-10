using MediCon.Classes;
using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class PatientCalendarController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrisDB = new HRISDBEntities();

        [UserAccess]
        // GET: PatientCalendar
        public ActionResult Appointment()
        {
            return View();
        }

        [HttpPost]
        public ActionResult CheckAppointment(string qrCode, DateTime appDate)
        {
            try
            {
                var count = dbMed.PatientAppointments.Join(dbMed.PhysicianCalendars, pa => pa.phyCalendarID, pc => pc.phyCalendarID, (pa, pc) => new { pa, pc })
                           .Count(a => a.pa.qrCode == qrCode && a.pc.scheduleDate == appDate);

                return Json(count, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult Create(string qrCode, string calendarID)
        {
            try
            {
                var checkAppointment = dbMed.PatientAppointments.Count(a => a.qrCode == qrCode && a.phyCalendarID == calendarID);

                if (checkAppointment > 0)
                {
                    return Json(new { status = "error", msg = "Appointment already exist!" }, JsonRequestBehavior.AllowGet);
                }

                var appID = new IDgenerator(calendarID);
                var appointment = new PatientAppointment();

                appointment.appointmentID = appID.generateID.Substring(0, 15);
                appointment.phyCalendarID = calendarID;
                appointment.qrCode = qrCode;
                appointment.personnelID = Session["personnelID"].ToString();
                appointment.dateTimeLog = DateTime.Now;
                dbMed.PatientAppointments.Add(appointment);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Appointment is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Appointment is successfully created!" }, JsonRequestBehavior.AllowGet);
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
                var app = dbMed.PatientAppointments.Where(a => a.phyCalendarID == calendarID).ToList();

                var list = app.Join(hrisDB.vEmployeeHealthWells, hw => hw.qrCode, emp => emp.qrCode, (hw, emp) => new { hw, emp })
                                    .Select(a => new
                                    {
                                        a.emp.idNo,
                                        a.emp.fullNameLast,
                                        a.emp.shortDepartmentName,
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