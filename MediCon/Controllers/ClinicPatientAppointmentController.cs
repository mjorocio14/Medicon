using MediCon.Classes;
using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class ClinicPatientAppointmentController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrisDB = new HRISDBEntities();

        [UserAccess]
        // GET: ClinicPatientAppointment
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult ClinicPatientList(DateTime bookingDate)
        {
            try
            {
                var app = dbMed.ClinicPatientAppointments.Where(a => a.date == bookingDate)
                            .Join(dbMed.Services, cpa => cpa.serviceID, s => s.serviceID, (cpa, s) => new { cpa, s })
                            .Select(res => new
                            {
                                res.cpa.clinicAppID,
                                res.cpa.qrCode,
                                res.cpa.daytime,
                                res.cpa.serviceID,
                                res.s.serviceName
                            }).ToList();

                var list = app.Join(hrisDB.vEmployeeHealthWells, hw => hw.qrCode, emp => emp.qrCode, (hw, emp) => new { hw, emp })
                                    .Select(a => new
                                    {
                                        a.emp.idNo,
                                        a.emp.fullNameLast,
                                        a.emp.shortDepartmentName,
                                        a.hw.clinicAppID,
                                        a.hw.daytime,
                                        a.hw.serviceID,
                                        a.hw.serviceName,
                                        a.emp.contactNo
                                    }).OrderBy(b => b.fullNameLast);

                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult physicianUnavailable(ClinicUnavailability data, List<Recipient> empList)
        {
            try
            {
                var unavailableID = new IDgenerator(data.personnelID);

                data.unavailableID = unavailableID.generateID.Substring(0, 10);
                data.cancelledByID = Session["personnelID"].ToString();
                data.dateTimeLog = DateTime.Now;
                dbMed.ClinicUnavailabilities.Add(data);

                var affectedRow = dbMed.SaveChanges();

                // Send SMS notification about cancellation to client
                sendCancellationNotice(empList);

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Unavailable date is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Unavailable date is successfully removed!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        private async Task sendCancellationNotice(List<Recipient> empList)
        {
            var sendSMS = new SendSMSController();

            foreach (var emp in empList)
            {
                if (!String.IsNullOrEmpty(emp.contactNo))
                    await sendSMS.Send(emp, true, "clinicSched");
            }
        }

        [HttpPost]
        public ActionResult UnavailableSchedule(int month, int year)
        {
            try
            {
                DateTime startDate = new DateTime(year, month, 1);
                DateTime lastDate = GetLastDateOfMonth(month, year);

                var list = dbMed.ClinicUnavailabilities.Where(a => a.date >= startDate && a.date <= lastDate).ToList();
                return Json(list, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        private DateTime GetLastDateOfMonth(int month, int year) {
            DateTime firstDayOfMonth = new DateTime(year, month, 1).AddMonths(1);
            return firstDayOfMonth.AddDays(-1);
        }

        [HttpPost]
        public ActionResult Create(DateTime dateAvailable)
        {
            try
            {
                var findUnavailable = dbMed.ClinicUnavailabilities.FirstOrDefault(a => a.date == dateAvailable);

                var deleteUnavailable = dbMed.ClinicUnavailabilities.Remove(findUnavailable);
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Schedule is not set!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
       
    }
}
