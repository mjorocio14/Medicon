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
       MediconEntities db2 = new MediconEntities();
        //DAVNORWELLNESSEntities db2 = new DAVNORWELLNESSEntities();

        [UserAccess]
        // GET: Products
        public ActionResult Medicines()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getUnit()
        {
            var unitList = db2.ProductUnits.OrderBy(a => a.unitDesc).ToList();
            return Json(unitList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult getMedz()
        {
            var medzList = db2.ProductLists.Select(a => new
            {   
                a.recNo,
                a.productCode,
                a.productDesc,
                measurementDesc = db2.Measurements.FirstOrDefault(c => c.measurementID == a.measurementID).measurementDesc,
                a.measurementID,
                a.unitID,
                unitDesc = db2.ProductUnits.FirstOrDefault(b => b.unitID == a.unitID ).unitDesc,
            }).OrderByDescending( c => c.recNo ).ToList();

            return Json(medzList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult saveMedz(ProductList p)
        {
            try {

                var checkMedz = db2.ProductLists.Count(a => a.productDesc.Contains(p.productDesc) && a.unitID == p.unitID && a.measurementID == p.measurementID);

            if (checkMedz != 0)
            {
                return Json(new { status = "dupli", msg = "Medicine already exists!" }, JsonRequestBehavior.AllowGet);
            }

            else {
            if (p.productCode == null) {
                p.productCode = "M" + (Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty)).Substring(0, 5).ToUpper() +
                                      (DateTime.Now.ToString().Replace("/", "").Replace(" ", "").Replace(":", "").ToUpper());
                p.productCode = p.productCode.Length > 10 ? p.productCode.Substring(0, 10) : p.productCode;
             
                p.dateTimeLog = DateTime.Now;
                p.personnelID = Session["personnelID"].ToString();
                db2.ProductLists.Add(p);
            }
            else {
                p.dateTimeLog = DateTime.Now;
                p.personnelID = Session["personnelID"].ToString();
                db2.Entry(p).State = EntityState.Modified;
            }
           
            var affectedRow = db2.SaveChanges();
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
            var measurementList = db2.Measurements.OrderByDescending(a => a.recNo).ToList();
            return Json(measurementList, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult saveMeasurement(Measurement p)
        {
            try
            {

                var checkMeasurment = db2.Measurements.Count(a => a.measurementDesc == p.measurementDesc);

                if (checkMeasurment != 0)
                {
                    return Json(new { status = "dupli", msg = "Measurement already exists!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    if (p.measurementID == null)
                    {

                        p.measurementID = "M" + (Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty)).Substring(0, 5).ToUpper() +
                                       (DateTime.Now.ToString().Replace("/", "").Replace(" ", "").Replace(":", "").ToUpper());
                        p.measurementID = p.measurementID.Length > 5 ? p.measurementID.Substring(0, 5) : p.measurementID;
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db2.Measurements.Add(p);
                    }
                    else
                    {
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db2.Entry(p).State = EntityState.Modified;
                    }

                    var affectedRow = db2.SaveChanges();
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

                var checkMeasurment = db2.ProductUnits.Count(a => a.unitDesc == p.unitDesc);

                if (checkMeasurment != 0)
                {
                    return Json(new { status = "dupli", msg = "Measurement already exists!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    if (p.unitID == null)
                    {
                        p.unitID = "U" + (Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty)).Substring(0, 5).ToUpper() +
                                      (DateTime.Now.ToString().Replace("/", "").Replace(" ", "").Replace(":", "").ToUpper());

                        p.unitID = p.unitID.Length > 5 ? p.unitID.Substring(0, 5) : p.unitID;

                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db2.ProductUnits.Add(p);
                    }
                    else
                    {
                        p.dateTimeLog = DateTime.Now;
                        p.personnelID = Session["personnelID"].ToString();
                        db2.Entry(p).State = EntityState.Modified;
                    }

                    var affectedRow = db2.SaveChanges();
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