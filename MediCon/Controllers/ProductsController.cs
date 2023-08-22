using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Data.Entity.Validation;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class ProductsController : Controller
    {
        MediconEntities db = new MediconEntities();

        [UserAccess]
        // GET: Products
        public ActionResult Medicines()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getUnit()
        {
            var unitList = db.ProductUnits.OrderBy(a => a.unitDesc).ToList();
            return Json(unitList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult getMedz()
        {
            var medzList = db.ProductLists.Select(a => new
            {   
                a.recNo,
                a.productCode,
                a.productDesc,
                measurementDesc = db.Measurements.FirstOrDefault(c => c.measurementID == a.measurementID).measurementDesc,
                a.measurementID,
                a.unitID,
                unitDesc = db.ProductUnits.FirstOrDefault(b => b.unitID == a.unitID ).unitDesc,
            }).OrderByDescending( c => c.recNo ).ToList();

            return Json(medzList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult saveMedz(ProductList p)
        {
            try {

                var checkMedz = db.ProductLists.Count(a => a.productDesc.Contains(p.productDesc) && a.unitID == p.unitID && a.measurementID == p.measurementID);

            if (checkMedz != 0)
            {
                return Json(new { status = "dupli", msg = "Medicine already exists!" }, JsonRequestBehavior.AllowGet);
            }

            else {
            if (p.productCode == null) {
                var x = db.ProductLists.Count();
                var xx = x + 1;
                p.productCode = "PC" + xx.ToString("D8");
                p.dateTimeLog = DateTime.Now;
                p.personnelID = Session["personnelID"].ToString();
                db.ProductLists.Add(p);
            }
            else {
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


        [HttpPost]
        public ActionResult getMeasurement()
        {
            var measurementList = db.Measurements.OrderByDescending(a => a.recNo).ToList();
            return Json(measurementList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult saveMeasurement(Measurement p)
        {
            try
            {

                var checkMeasurment = db.Measurements.Count(a => a.measurementDesc == p.measurementDesc);

                if (checkMeasurment != 0)
                {
                    return Json(new { status = "dupli", msg = "Measurement already exists!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    if (p.measurementID == null)
                    {
                        var x = db.Measurements.Count();
                        var xx = x + 1;
                        p.measurementID = "M" + xx.ToString("D4");
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db.Measurements.Add(p);
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

        [HttpPost]
        public ActionResult saveUnit(ProductUnit p)
        {
            try
            {

                var checkMeasurment = db.ProductUnits.Count(a => a.unitDesc == p.unitDesc);

                if (checkMeasurment != 0)
                {
                    return Json(new { status = "dupli", msg = "Measurement already exists!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    if (p.unitID == null)
                    {
                        var x = db.ProductUnits.Count();
                        var xx = x + 1;
                        p.unitID = "U" + xx.ToString("D4");
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db.ProductUnits.Add(p);
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