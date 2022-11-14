using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class MaleReproController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: MaleRepro
        public ActionResult Index()
        {
            return View();
        }
        public string generateID(string source)
        {
            return string.Format("{1:N}", source, Guid.NewGuid());
        }

        [HttpPost]
        public ActionResult getMRHrequest(string qrCode)
        {
            try
            {
                var lab = dbMed.MRHrequests.Join(dbMed.Referrals, mrh => mrh.referralID, r => r.referralID, (mrh, r) => new { mrh, r })
                                                   .Join(dbMed.Consultations, res1 => res1.r.consultID, c => c.consultID, (res1, c) => new { res1, c })
                                                   .Join(dbMed.VitalSigns, res2 => res2.c.vSignID, vs => vs.vSignID, (res2, vs) => new { res2, vs })
                                                   .Where(a => a.vs.qrCode == qrCode && a.res2.res1.mrh.isDone == false)
                                                   .Select(b => new
                                                   {
                                                       b.res2.res1.mrh.requestID,
                                                       b.res2.res1.mrh.referralID,
                                                       requestDT = b.res2.res1.mrh.dateTimeLog,
                                                       requestPersonID = b.res2.res1.mrh.personnelID,
                                                       b.res2.res1.mrh.isDone,
                                                       b.res2.res1.r.consultID,
                                                       requestPerson = dbMed.Personnels.Where(c => c.personnelID == b.res2.res1.mrh.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       b.vs.qrCode,
                                                   }).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveInterview(MaleRepro_Interview mrh)
        {
            try
            {
                mrh.MRID = generateID(mrh.requestID).Substring(0, 15);
                mrh.personnelID = Session["personnelID"].ToString();
                mrh.dateTimeLog = DateTime.Now;
                dbMed.MaleRepro_Interview.Add(mrh);

                var request = dbMed.MRHrequests.SingleOrDefault(a => a.requestID == mrh.requestID);
                request.isDone = true;
                dbMed.Entry(request).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Rectal examination is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Rectal examination is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult saveChanges(MaleRepro_Interview mrh)
        {
            try
            {
                var findRec = dbMed.MaleRepro_Interview.SingleOrDefault(a => a.MRID == mrh.MRID);

                findRec.besesGumising = mrh.besesGumising;
                findRec.cancerName = mrh.cancerName;
                findRec.dateTimeLog = DateTime.Now;
                findRec.diNauubos = mrh.diNauubos;
                findRec.DREfrequency = mrh.DREfrequency;
                findRec.is1stDRE = mrh.is1stDRE;
                findRec.isAnyCancer = mrh.isAnyCancer;
                findRec.isMedication = mrh.isMedication;
                findRec.isProstateCancer = mrh.isProstateCancer;
                findRec.kadalasUmihi = mrh.kadalasUmihi;
                findRec.magpwersaNgIhi = mrh.magpwersaNgIhi;
                findRec.mahinangDaloy = mrh.mahinangDaloy;
                findRec.medicineName = mrh.medicineName;
                findRec.nadarama = mrh.nadarama;
                findRec.pagpigilNgIhi = mrh.pagpigilNgIhi;
                findRec.patigiltiglNaIhi = mrh.patigiltiglNaIhi;
                findRec.personnelID = Session["personnelID"].ToString();
                findRec.sintomasNgIhi = mrh.sintomasNgIhi;
                dbMed.Entry(findRec).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Rectal examination failed in updating!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Rectal examination is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult getMRHclients()
        {
            try
            {
                var lab = dbMed.fn_getMRHclients().OrderByDescending(x => x.interviewDT).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}