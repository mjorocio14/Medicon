using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using MediCon.ModelTemp;
using MediCon.Classes;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class ReadingGlassesController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrDB = new HRISDBEntities();

        [UserAccess]
        // GET: ReadingGlasses
        public ActionResult Index()
        {
            return View();
        }

        //[HttpGet]
        //public ActionResult getListAvailedGlass()
        //{
        //    try
        //    {
        //        DateTime thisDay = DateTime.Today;
        //        var result = db.fserviceAvailedList(thisDay, "PROG0016").Where(b => b.serviceID == "SRV0031").ToList().OrderByDescending(a => a.recNo);
        //        //var result = db.fOT_Report().Where(b => b.serviceID == "SRV0004" && b.dateAvailed == thisDay).ToList().OrderByDescending(a => a.dateAvailed);
        //        return Json(result, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        [HttpPost]
        public ActionResult checkAvailedService(string qrCode)
        {
            try
            {
                var date = new CurrentDateTime();
                var count = dbMed.EyeCares.Count(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT);

                if (count == 0)
                {
                    EyeCare ec = new EyeCare();
                    ec.eyeCareID_rxID = new IDgenerator(qrCode).generateID.Substring(0, 15);
                    ec.qrCode = qrCode;
                    ec.dateTimeLog = DateTime.Now;
                    ec.personnelID = Session["personnelID"].ToString();
                    dbMed.EyeCares.Add(ec);

                    var affectedRow = dbMed.SaveChanges();

                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Eye care is not saved!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { status = "success", msg = "Eye care is successfully saved!" }, JsonRequestBehavior.AllowGet);
                }

                return Json(new { status = "error", msg = "Client already availed the eye care." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getClientList()
        {
            try
            {
                var date = new CurrentDateTime();
                var list = dbMed.EyeCares.Where(a => a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT).ToList();

                var emp = list.Join(hrDB.vEmployeeHealthWells, l => l.qrCode, e => e.qrCode, (l,e) => new { l,e })
                                                   .Select(a => new
                                                   {
                                                       a.l.eyeCareID_rxID,
                                                       a.e.lastName,
                                                       a.e.firstName,
                                                       a.e.middleName,
                                                       a.e.extName,
                                                       a.e.sex,
                                                       a.e.birthDate,
                                                       a.e.contactNo,
                                                       a.e.brgyPermAddress,
                                                       a.e.cityMunPermAddress,
                                                       a.e.provincePermAddress,
                                                       a.l.dateTimeLog,
                                                       withGlasses = dbMed.OutgoingItems.SingleOrDefault(c => c.rxID == a.l.eyeCareID_rxID),
                                                   }).OrderByDescending(b => b.dateTimeLog).ToList();

                return Json(emp, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveReadingGlasses(string rxID, bool isRelease)
        {
            try
            {
                var isExist = dbMed.OutgoingItems.FirstOrDefault(a => a.rxID == rxID);

                // UPDATING
                if (isExist != null)
                {
                    if(isRelease)
                    {
                        isExist.isRelease = isRelease;
                        isExist.dateTimeReleased = DateTime.Now;
                        isExist.qtyReleased = 1;
                    }

                    else
                    {
                        isExist.isRelease = isRelease;
                        isExist.dateTimeReleased = null;
                        isExist.qtyReleased = null;
                    }

                    dbMed.Entry(isExist).State = EntityState.Modified;
                    
                }

                // SAVING
                else
                {
                    OutgoingItem oi = new OutgoingItem();
                    oi.outID = new IDgenerator(rxID).generateID.Substring(0, 15);
                    oi.rxID = rxID;
                    oi.productCode = "PCEYEGLASS";
                    oi.qtyRx = 1;
                    oi.isRelease = true;
                    oi.qtyReleased = 1;
                    oi.dateTimeReleased = DateTime.Now;
                    oi.userIDreleased = Session["personnelID"].ToString();
                    dbMed.OutgoingItems.Add(oi);
                }

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Reading glass is not released!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Reading glass is successfully released!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}