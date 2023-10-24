using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class LabtestController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrdb = new HRISDBEntities();

        [UserAccess]
        // GET: Labtest
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getPersonLabReq(string qrCode)
        {
            try
            {
                var lab = dbMed.LaboratoryExams.Join(dbMed.LaboratoryTests, le => le.labTestID, lt => lt.labTestID, (le, lt) => new { le, lt })
                                                   .Join(dbMed.Referrals, res1 => res1.le.referralID, r => r.referralID, (res1, r) => new { res1, r })
                                                   .Join(dbMed.Consultations, res2 => res2.r.consultID, c => c.consultID, (res2, c) => new { res2, c })
                                                   .Join(dbMed.VitalSigns, res3 => res3.c.vSignID, vs => vs.vSignID, (res3, vs) => new { res3, vs })
                                                   .Where(a => a.vs.qrCode == qrCode && a.res3.res2.r.calendarID != null)
                                                   .Select(b => new
                                                   {
                                                       b.res3.res2.res1.le.labID,
                                                       b.res3.res2.res1.le.labTestID,
                                                       b.res3.res2.res1.lt.labTestName,
                                                       b.res3.res2.res1.le.isTested,
                                                       b.res3.res2.res1.le.isEncoded,
                                                       labPersonID = b.res3.res2.res1.le.personnelID,
                                                       labDT = b.res3.res2.res1.le.dateTimeLog,
                                                       labPersonnel = dbMed.Personnels.Where(c => c.personnelID == b.res3.res2.res1.le.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       b.res3.res2.r.referralID,
                                                       b.res3.c.consultID,
                                                       b.vs.qrCode,
                                                       consultPersonID = b.res3.c.personnelID,
                                                       consultDT = b.res3.c.dateTimeLog,
                                                       consultPersonnel = dbMed.Personnels.Where(c => c.personnelID == b.res3.c.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                   }).GroupBy(q => q.isTested ).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveTestStatus(string labID, bool isTest)
        {
            try
            {
                var labExam = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == labID);

                if(isTest == false)
                {
                    labExam.isTested = null;
                }

                else
                {
                    labExam.isTested = isTest;
                }


                labExam.personnelID = Session["personnelID"].ToString();
                labExam.dateTimeLog = DateTime.Now;

                dbMed.Entry(labExam).State = EntityState.Modified;
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Lab test is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Lab test is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult getPatientList(DateTime date)
        {
             try
            {
                var lab = dbMed.fn_getLabPatients(date).OrderBy(x => x.lastName).ThenBy(y => y.firstName).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}