using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class AnalyticsController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: Analytics
        public ActionResult Medical()
        {
            return View();
        }

        public ActionResult Physical()
        {
            return View();
        }

        public ActionResult getMorbidityStats()
        {
            try
            {
                var result = dbMed.Temp_Morbidity.Join(dbMed.Diagnosis, tm => tm.diagnoseID, d => d.diagnoseID, (tm, d) => new { tm, d })
                                            .Select(e => new
                                            {
                                                //e.tm.morbidityID,
                                                //e.tm.diagnoseID,
                                                e.tm.female,
                                                e.tm.male,
                                                //e.tm.type,
                                                e.d.diagnoseName
                                            }).ToList();
                                            //.OrderBy(a => a.type).ThenBy(b => b.diagnoseName).ToList();

                return Json(result, JsonRequestBehavior.AllowGet);
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
    }
}
