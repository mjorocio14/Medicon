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
        //public ActionResult Create(string qrCode, string calendarID)
        public ActionResult Create(string calendarID, DateTime consultDate, string personnelID)
        {
            try
            {
                //var checkAppointment = dbMed.PatientAppointments.Count(a => a.qrCode == qrCode && a.phyCalendarID == calendarID);
                var checkAppointment = dbMed.PatientAppointments.Count(a => a.phyCalendarID == calendarID);

                if (checkAppointment > 0)
                    return Json(new { status = "error", msg = "Appointment already exist!" }, JsonRequestBehavior.AllowGet);

                string conDate = consultDate.ToShortDateString();
                var conStartDate = DateTime.Parse(conDate + " 00:00:00");
                var conEndDate = DateTime.Parse(conDate + " 23:59:59");

                var consultList = dbMed.Consultations.Join(dbMed.VitalSigns, con => con.vSignID, vs => vs.vSignID, (con, vs) => new { con, vs })
                                                     .Where(a => a.con.dateTimeLog >= conStartDate && a.con.dateTimeLog <= conEndDate && a.con.personnelID == personnelID)
                                                     .Select(b => new
                                                     {
                                                         b.vs.qrCode
                                                     }).Distinct().ToList();

                foreach (var item in consultList)
                {
                    var appID = new IDgenerator(item.qrCode);
                    var appointment = new PatientAppointment();

                    appointment.appointmentID = appID.generateID.Substring(0, 15);
                    appointment.phyCalendarID = calendarID;
                    appointment.qrCode = item.qrCode;
                    appointment.personnelID = Session["personnelID"].ToString();
                    appointment.dateTimeLog = DateTime.Now;
                    dbMed.PatientAppointments.Add(appointment);
                }

                //var appID = new IDgenerator(calendarID);
                //var appointment = new PatientAppointment();

                //appointment.appointmentID = appID.generateID.Substring(0, 15);
                //appointment.phyCalendarID = calendarID;
                //appointment.qrCode = qrCode;
                //appointment.personnelID = Session["personnelID"].ToString();
                //appointment.dateTimeLog = DateTime.Now;
                //dbMed.PatientAppointments.Add(appointment);

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

        [HttpPost]
        public ActionResult GetPatientCount(DateTime date, string physicianID)
        {
            try
            {
                var count = dbMed.fn_getDiagnoseClients("SERVICE001", date).Where(b => b.personnelID == physicianID).Select(a => a.qrCode).Distinct().Count();

                return Json(count, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}