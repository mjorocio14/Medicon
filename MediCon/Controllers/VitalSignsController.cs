using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using MediCon.ModelTemp;
using MediCon.Classes;

namespace MediCon.Controllers
{
    [SessionTimeout]  
    public class VitalSignsController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: VitalSigns
        public ActionResult VSview()
        {
            return View();
        }

        public ActionResult getBPhistory(string qrCode)
        {
            try
            {
                var date = new CurrentDateTime();
                var vSign = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT);

                if (vSign == null)
                    return Json(new { status = "error", msg = "Patient has no vital sign for today, please refer to vital sign station." });

                else
                {
                    var bp = dbMed.BloodPressures.Where(a => a.vSignID == vSign.vSignID).OrderByDescending(b => b.dateTimeLog);
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
                var date = new CurrentDateTime();
                var vsRes = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT);

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
                var vSignID = new IDgenerator(qrCode);

                vs.vSignID = vSignID.generateID.Substring(0, 15);
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
                var date = new CurrentDateTime();
                var vSign = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT).vSignID;
                var BPID = new IDgenerator(qrCode);

                bp.vSignID = vSign;
                bp.BPID = BPID.generateID.Substring(0, 15);
                bp.dateTimeLog = DateTime.Now;
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