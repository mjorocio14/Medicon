using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class AnalyticsController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        EQPEntities dbEQP = new EQPEntities();

        [UserAccess]
        // GET: Analytics
        public ActionResult Medical()
        {
            return View();
        }

        [UserAccess]
        public ActionResult Physical()
        {
            return View();
        }

        public ActionResult getMorbidityStats()
        {
            try
            {
                var MRHstats = dbMed.fn_DashboardMRH();
                var result = dbMed.fn_DashboardMorbidity();
                var morbiditylist = dbMed.Diagnosis.Where(a => a.diagnoseType == "MC").OrderBy(b => b.diagnoseName).ToList();
                var Papsmear = dbMed.PapsmearBreastExams.Where(a => a.isPapsmear == true).Count();
                var BreastExam = dbMed.PapsmearBreastExams.Where(a => a.isBreastExam == true).Count();
                var Dental = dbMed.fn_DashboardDental();

                return Json(new {stats = result, morbiditylist = morbiditylist, mrhCount = MRHstats, papsCount = Papsmear, breastCount = BreastExam, dentalCount = Dental}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getLabPrice()
        {
            var data =  dbMed.Temp_LabPrices.ToList();

            var datas = (from a in dbMed.Temp_LabPrices
                        join b in dbMed.LaboratoryTests on a.labTestID equals b.labTestID
                        select new 
                        {
                            b.labTestName,
                            a.male,
                            a.female,
                            a.price
                        }).ToList();
            return Json(datas, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getSexAnalytics()
        {
            var data = dbMed.fn_DashboardAnalytics();
            return Json(data, JsonRequestBehavior.AllowGet);
        }


    }
}
