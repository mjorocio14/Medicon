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

        public ActionResult getBPrecord(string vSignID)
        {
            try
            {
                var vSign = dbMed.VitalSigns.SingleOrDefault(a => a.vSignID == vSignID);
                var bp = dbMed.BloodPressures.Where(a => a.vSignID == vSignID).OrderByDescending(b => b.dateTimeLog);
                return Json(new { bp = bp, vs = vSign }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getVitalSignList(DateTime date)
        {
            try
            {
                var vs = dbMed.fn_vitalSignList(date).ToList();

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
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
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
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult updateVitalSigns(BloodPressure bpData)
        {
            try
            {
                var bpRecord = dbMed.BloodPressures.SingleOrDefault(a => a.BPID == bpData.BPID);

                bpRecord.dateTimeLog = DateTime.Now;
                bpRecord.diastolic = bpData.diastolic;
                bpRecord.pulseRate = bpData.pulseRate;
                bpRecord.systolic = bpData.systolic;
                bpRecord.temperature = bpData.temperature;
                dbMed.Entry(bpRecord).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Vital signs is not updated!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Vital signs is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult getPhysician(string qrCode)
        {
            try
            {
                var rec = dbMed.Consultations.Join(dbMed.VitalSigns, con => con.vSignID, vs => vs.vSignID, (con, vs) => new { con, vs })
                                             .Join(dbMed.Personnels, r1 => r1.con.personnelID, p => p.personnelID, (r1, p) => new { r1, p })
                                             .Where(a => a.r1.vs.qrCode == qrCode)
                                             .Select(b => new
                                             {
                                                 b.p.personnelID,
                                                 b.p.personnel_firstName,
                                                 b.p.personnel_midInit,
                                                 b.p.personnel_lastName,
                                                 b.p.personnel_extName,
                                                 b.p.title,
                                                 b.r1.con.dateTimeLog
                                             }).OrderByDescending(c => c.dateTimeLog).First();

                return Json(rec, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve vital signs information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}