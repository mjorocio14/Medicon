using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
   
    public class VitalSignsController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        EQPEntities dbQr = new EQPEntities();

        static string checkDate = DateTime.Now.ToShortDateString();
        static string checkDateStart = checkDate + " 00:00:00";
        static string checkDateEnd = checkDate + " 23:59:59";
        DateTime cds = DateTime.Parse(checkDateStart);
        DateTime cde = DateTime.Parse(checkDateEnd);

        //[UserAccess]
        // GET: VitalSigns
        public ActionResult VSview()
        {
            return View();
        }

        public string generateID(string source)
        {
            return string.Format("{1:N}", source, Guid.NewGuid());
        }

        public ActionResult getBPhistory(string qrCode)
        {
            try
            {
                var vSign = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= cds && a.dateTimeLog <= cde);

                if (vSign == null)
                    return Json(new { status = "error", msg = "Patient has no vital sign for today, please refer to vital sign station." });

                else
                {
                    var bp = dbMed.BloodPressures.Where(a => a.vSignID == vSign.vSignID);
                    return Json(new { bp = bp, vs = vSign }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getVitalSignList()
        {
            try
            {
                var vs = dbMed.fn_vitalSignList().ToList();

                return Json(vs, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getVitalSigns(string qrCode)
        {
            try
            {
                var vsRes = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= cds && a.dateTimeLog <= cde);

                return Json(vsRes, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveVitalSigns(string qrCode, VitalSign vs)
        {
            try
            {
                vs.vSignID = generateID(qrCode).Substring(0,15);
                vs.personnelID = Session["personnelID"].ToString();
                vs.dateTimeLog = DateTime.Now;
                dbMed.VitalSigns.Add(vs);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Vital signs is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Vital signs is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveBP(string qrCode, BloodPressure bp)
        {
            try
            {
                var vSign = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= cds && a.dateTimeLog <= cde).vSignID;

                bp.vSignID = vSign;
                bp.BPID = generateID(qrCode).Substring(0, 15);
                dbMed.BloodPressures.Add(bp);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Vital signs is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Vital signs is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}