using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class MedicalConsultationController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: MedicalConsultation
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getMedicineList(string serviceID)
        {
            try
            {
                var medList = dbMed.ProductLists.Join(dbMed.BrandLists, pl => pl.brandID, bl => bl.brandID, (pl, bl) => new { pl, bl })
                                                .Join(dbMed.Measurements, res1 => res1.pl.measurementID, m => m.measurementID, (res1, m) => new { res1, m })
                                                .Join(dbMed.ProductUnits, res2 => res2.res1.pl.unitID, pu => pu.unitID, (res2, pu) => new { res2, pu })
                                                .Select(a => new {
                                                    a.res2.res1.pl.productCode,
                                                    a.res2.res1.pl.productDesc,
                                                    a.res2.res1.bl.brandID,
                                                    a.res2.res1.bl.brandName,
                                                    a.res2.m.measurementID,
                                                    a.res2.m.measurementDesc,
                                                    a.pu.unitID,
                                                    a.pu.unitDesc
                                                }).ToList();

                return Json(medList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}