using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Data.Entity;
using System.Data.Entity.Validation;


namespace MediCon.Controllers
{
    public class LaboratoryController : Controller
    {
        MediconEntities db = new MediconEntities();

        // GET: Laboratory
        public ActionResult Lists()
        {
            return View();
        }


        [HttpPost]
        public ActionResult getLab()
        {
            var labList = db.LaboratoryTests.ToList();
            return Json(labList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult saveLab(LaboratoryTest p)
        {
            try
            {
                var checkMeasurment = db.LaboratoryTests.Count(a => a.labTestName == p.labTestName);

                if (checkMeasurment != 0)
                {
                    return Json(new { status = "dupli", msg = "Measurement already exists!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    if (p.labTestID == null)
                    {
                        var x = db.LaboratoryTests.Count();
                        var xx = x + 1;
                        p.labTestID = "L" + xx.ToString("D4");
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db.LaboratoryTests.Add(p);
                    }
                    else
                    {
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db.Entry(p).State = EntityState.Modified;
                    }

                    var affectedRow = db.SaveChanges();
                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Saving failed!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { status = "success", msg = " Data successfully saved!" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (DbEntityValidationException e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}