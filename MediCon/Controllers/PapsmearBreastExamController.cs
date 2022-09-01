using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class PapsmearBreastExamController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: PapsmearBreastExam
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult savePBE(string PBEID, bool isPapsmear, bool isBreastExam)
        {
            try
            {
                var pbe = dbMed.PapsmearBreastExams.SingleOrDefault(a => a.PBEID == PBEID);

                pbe.dateTimeLog = DateTime.Now;
                pbe.isBreastExam = isBreastExam;
                pbe.isPapsmear = isPapsmear;
                pbe.personnelID = Session["personnelID"].ToString();

                dbMed.Entry(pbe).State = EntityState.Modified;
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Papsmear and Breast Exam are not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Papsmear and Breast Exam are successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult getPatientPBE(string qrCode)
        {
            try
            {
                var patientpbe = dbMed.PapsmearBreastExams.Join(dbMed.Referrals, pbe => pbe.referralID, r => r.referralID, (pbe, r) => new { pbe, r })
                                                   .Join(dbMed.Consultations, res1 => res1.r.consultID, c => c.consultID, (res1, c) => new { res1, c })
                                                   .Join(dbMed.VitalSigns, res2 => res2.c.vSignID, vs => vs.vSignID, (res2, vs) => new { res2, vs })
                                                   .Where(a => a.vs.qrCode == qrCode)
                                                   .Select(b => new
                                                   {
                                                       b.res2.res1.pbe.PBEID,
                                                       b.res2.res1.pbe.referralID,
                                                       b.res2.res1.r.consultID,
                                                       b.res2.res1.pbe.isBreastExam,
                                                       b.res2.res1.pbe.isPapsmear,
                                                       pbePersonID = b.res2.res1.pbe.personnelID,
                                                       pbeDT = b.res2.res1.pbe.dateTimeLog,
                                                       pbePersonnel = dbMed.Personnels.Where(c => c.personnelID == b.res2.res1.pbe.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName}),
                                                       b.vs.qrCode,
                                                       consultPersonID = b.res2.c.personnelID,
                                                       consultDT = b.res2.c.dateTimeLog,
                                                       consultPersonnel = dbMed.Personnels.Where(c => c.personnelID == b.res2.c.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                   }).ToList();

                return Json(patientpbe, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPatientList()
        {
            try
            {
                var lab = dbMed.fn_getPapsmearBreastExamClients().OrderBy(x => x.lastName).ThenBy(y => y.firstName).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}