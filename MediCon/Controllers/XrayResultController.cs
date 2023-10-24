using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class XrayResultController : Controller
    {
        EQPEntities db = new EQPEntities();
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: XrayResult
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetClientRecord(string param, bool type)
        {
            try
            {
                var find = dbMed.sp_getXrayClientScreened(param, type).GroupBy(a => a.qrCode);
                return Json(find, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SaveResult(string statusID, Xray_PersonStatus record)
        {
            try
            {
                var findRec = dbMed.Xray_PersonStatus.Find(statusID);

                findRec.xrayResult = record.xrayResult;
                findRec.xrayResultDate = record.xrayResultDate;
                findRec.xrayResultDateTimeLog = DateTime.Now;
                findRec.xrayResultPersonnelID = Session["personnelID"].ToString();
                dbMed.Entry(findRec).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "X-ray result is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "X-ray result is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}