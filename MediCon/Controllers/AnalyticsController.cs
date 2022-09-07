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
        MediconEntities db = new MediconEntities();
        // GET: Analytics
        public ActionResult Medical()
        {
            return View();
        }
        public ActionResult getLabPrice()
        {
            var data =  db.Temp_LabPrices.ToList();

            var datas = (from a in db.Temp_LabPrices
                        join b in db.LaboratoryTests on a.labTestID equals b.labTestID
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