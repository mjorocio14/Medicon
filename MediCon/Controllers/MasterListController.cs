using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class MasterListController : Controller
    {

        MediconEntities db = new MediconEntities();

        [UserAccess]
        // GET: MasterList
        public ActionResult LabSched()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getHospitalList()
        {
            try
            {
                var medList = db.Hospitals.Where(a => a.hospitalID != "HPL004" && a.hospitalID != "HPL003").ToList();

                return Json(medList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getLabTests()
        {
            var x = db.LaboratoryTests.ToList().OrderBy( a => a.labTestName);
            return Json(x, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult getLabSchedules(labSchedules ls)
        {
            var c = db.fn_LabSchedMasterList(ls.scheduleDate, ls.labTestID, ls.hospitalID).ToList();
            return Json(c, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult ScheduledEmpPerDate(DateTime startDate, DateTime endDate)
        {
            var scheduled = db.fn_ScheduledEmpForLab(startDate, endDate).GroupBy(a => new { a.scheduleDate, a.hospitalID }).ToList();
            return Json(scheduled, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]

        public ActionResult printLabSchedule(labSchedules ls)
        {

            var labTestName = db.LaboratoryTests.FirstOrDefault(a => a.labTestID == ls.labTestID).labTestName;

            Session["labTestName"] = labTestName;
            Session["scheduleDate"] = ls.scheduleDate;
            Session["labTestID"] = ls.labTestID;
            Session["hospitalID"] = ls.hospitalID;
            return Content("YES");

        }

        [HttpGet]
        public ActionResult getActualTestedDates()
        {
            try
            {
                var dates = db.fn_getActualLabTestDates().OrderByDescending(c => c.testedDate).ToList();
                return Json(dates, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getEmpPerActualTestDate(DateTime testDate)
        {
            try
            {
                var dates = db.fn_ActualEmpTestedForLab(testDate).OrderBy(o => o.scheduleDate).GroupBy(a => new { a.testDate, a.scheduleDate, a.hospitalName }).ToList();
                return Json(dates, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public class labSchedules
        {
            public string labTestID { get; set; }
            public string hospitalID { get; set; }
            public string scheduleDate { get; set; }
        }


    }
}