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
        HRISDBEntities hrisDB = new HRISDBEntities();

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
                var list = db.spOT_MedicineDispensing(qrCode).OrderByDescending(b => b.dateTimeRx).GroupBy(a => new { a.serviceID, a.dateTimeRx, a.personnelID }).ToList();

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

        [HttpPost]
        public ActionResult listOfClients(string date)
        {
            try
            {
                DateTime dateStart = DateTime.Parse(date);
                DateTime dateEnd = DateTime.Parse(date + " 23:59:59");

                var result = db.VitalSigns.Join(db.Consultations, r1 => r1.vSignID, con => con.vSignID, (r1, con) => new { r1, con })
                                               .Join(db.MedicalPrescriptions, r2 => r2.con.consultID, mp => mp.consultID, (r2, mp) => new { r2, mp })
                                               .Join(db.OutgoingItems, r3 => r3.mp.rxID, oi => oi.rxID, (r3, oi) => new { r3, oi })
                                               .Join(db.Personnels, r4 => r4.oi.userIDreleased, per => per.personnelID, (r4, per) => new { r4, per })
                                               .Join(db.ProductLists, r5 => r5.r4.oi.productCode, pl => pl.productCode, (r5, pl) => new {r5, pl})
                                               .Where(a => a.r5.r4.oi.isRelease == true && a.r5.r4.oi.dateTimeReleased >= dateStart && a.r5.r4.oi.dateTimeReleased <= dateEnd)
                                               .ToList();

                var joined = result.Join(hrisDB.vEmployeeHealthWells, r => r.r5.r4.r3.r2.r1.qrCode, pi => pi.qrCode, (r, pi) => new { r, pi })
                                    .Select(a => new
                                    {
                                        a.pi.qrCode,
                                        a.pi.lastName,
                                        a.pi.firstName,
                                        a.pi.middleName,
                                        a.pi.extName,
                                        a.pi.sex,
                                        a.pi.birthDate,
                                        a.pi.shortDepartmentName,
                                        a.r.r5.r4.oi.dateTimeReleased,
                                        a.r.r5.r4.oi.rxID,
                                        a.r.r5.r4.r3.mp.consultID,
                                        a.r.r5.per.personnel_lastName,
                                        a.r.r5.per.personnel_firstName,
                                        a.r.r5.per.personnel_extName,
                                        a.r.r5.per.personnel_midInit,
                                        a.r.pl.productDesc,
                                        a.r.r5.r4.oi.qtyRx,
                                        a.r.r5.r4.oi.qtyReleased
                                    }).OrderByDescending(b => b.dateTimeReleased).GroupBy(c => c.qrCode).ToList();

                var serializer = new JavaScriptSerializer();
                serializer.MaxJsonLength = Int32.MaxValue;

                var content = new ContentResult
                {
                    Content = serializer.Serialize(joined),
                    ContentType = "application/json"

                };
                return content;
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve list of clients.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getReleasedRx(string qrCode, DateTime date)
        {
            try
            {
                DateTime dateStart = DateTime.Parse(date.ToLongDateString() + " 00:00:00");
                DateTime dateEnd = DateTime.Parse(date.ToLongDateString() + " 23:59:59");

                var list = db.spOT_MedicineDispensing(qrCode).Where(e => e.isRelease == true && e.dateTimeReleased >= dateStart && e.dateTimeReleased <= dateEnd).GroupBy(a => a.serviceID).ToList();

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
            }
        }


        public class ListMeds
        {
            public string outID { get; set; }
            public bool isRelease { get; set; }
            public int qtyRx { get; set; }
            public int qtyReleased { get; set; }
        }

        [HttpPost]
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

        [HttpPost]
        public ActionResult saveReleasedUpdate(List<ListMeds> listRx)
        {
            try
            {
                foreach (var item in listRx)
                {
                    var find = db.OutgoingItems.SingleOrDefault(a => a.outID == item.outID);

                    if (find != null)
                    {
                        find.isRelease = item.isRelease;

                        if (item.isRelease) find.qtyReleased = item.qtyReleased;
                        else find.qtyReleased = null;

                        if (item.isRelease) find.dateTimeReleased = DateTime.Now;
                        else find.dateTimeReleased = null;

                        find.userIDreleased = item.isRelease == false ? null : Session["personnelID"].ToString();
                        db.Entry(find).State = EntityState.Modified;
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