using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Web.Script.Serialization;
using System.Data.Entity;
using MediCon.ModelTemp;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class PharmacyController : Controller
    {
        MediconEntities db = new MediconEntities();

        // GET: Pharmacy
        [UserAccess]
        public ActionResult Dispensing()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getPrescription(string qrCode)
        {
            try
            {
                var list = db.spOT_MedicineDispensing(qrCode).GroupBy(a => a.serviceID).ToList();
                //var list = db.OutgoingItems.Join(db.MedicalPrescriptions, oi => oi.rxID, mp => mp.rxID, (oi, mp) => new { oi, mp })
                //                           .Join(db.Consultations, oimp => oimp.mp.consultID, c => c.consultID, (oimp, c) => new { oimp, c })
                //                           .Join(db.VitalSigns, oimpvs => oimpvs.c.vSignID, vs => vs.vSignID, (oimpvs, vs) => new { oimpvs, vs })
                //                           .Join(db.ProductLists, _pl => _pl.oimpvs.oimp.oi.productCode, pl => pl.productCode, ( _pl , pl) => new { _pl, pl})
                //                           .Join(db.ProductUnits, _plpu => _plpu.pl.unitID, pu => pu.unitID, (_plpu, pu) => new { _plpu, pu})
                //                           .Join(db.Measurements, _plme => _plme._plpu.pl.measurementID, me => me.measurementID , (_plme, me) => new {_plme , me})
                //                           .Where(w => w._plme._plpu._pl.vs.qrCode == qrCode)
                //                           .Select(s => new { 
                                           
                //                                s._plme._plpu._pl.vs.qrCode,
                //                                s._plme._plpu._pl.oimpvs.oimp.mp.serviceID,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.outID,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.productCode,
                //                                s._plme._plpu.pl.productDesc,
                //                                s.me.measurementDesc,
                //                                s._plme.pu.unitDesc,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.dosage,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.perDay,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.noDay,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.qtyRx,
                //                                s._plme._plpu._pl.oimpvs.oimp.oi.isRelease

                //                           }).ToList();

                var serializer = new JavaScriptSerializer();
                serializer.MaxJsonLength = Int32.MaxValue;

                var content = new ContentResult
                {
                    Content = serializer.Serialize(list),
                    ContentType = "application/json"

                };
                return content;
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve list of clients.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
                //return new HttpStatusCodeResult(HttpStatusCode.BadRequest, ex.InnerException.Message);
            }
        }

        //[HttpPost]
        //public ActionResult listOfClients()
        //{
        //    try
        //    {
        //        var date = new CurrentDateTime();

        //        var list = db.fOT_ReleasedMedicines(date.CurrentStartDT, date.CurrentEndDT).Where(e => e.dateTimeRx >= date.CurrentStartDT && e.dateTimeRx <= date.CurrentEndDT).GroupBy(a => a.qrCode).ToList();

        //        var serializer = new JavaScriptSerializer();
        //        serializer.MaxJsonLength = Int32.MaxValue;

        //        var content = new ContentResult
        //        {
        //            Content = serializer.Serialize(list),
        //            ContentType = "application/json"

        //        };
        //        return content;
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve list of clients.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
        //        //return new HttpStatusCodeResult(HttpStatusCode.BadRequest, ex.InnerException.Message);
        //    }
        //}


        //public class listRx
        //{
        //    public ListMeds [] list { get; set; }
        //}

        public class ListMeds
        {
            public string outID { get; set; }
            public bool isRelease { get; set; }
            public int qtyRx { get; set; }
            public int qtyReleased { get; set; }
        }

        [HttpPost]
        //public ActionResult saveReleasing(ListMeds [][] listRx)
        public ActionResult saveReleasing(List<ListMeds> listRx)
        {
            try
            {
              
                foreach(var item in listRx)
                {
                    var find = db.OutgoingItems.Where(a => a.outID == item.outID).ToList();

                     if (find != null)
                     {
                         foreach (var data in find)
                         {
                             data.isRelease = item.isRelease;
                             data.qtyReleased = item.qtyReleased;
                             //data.qtyReleased = item.qtyRx > item.AVAILABLE ? item.AVAILABLE : data.qtyRx;
                             data.dateTimeReleased = DateTime.Now;
                             data.userIDreleased = Session["personnelID"].ToString();
                             db.Entry(data).State = EntityState.Modified;
                         }
                     }
                }

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Prescription releasing is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Prescription releasing is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }
    }
}