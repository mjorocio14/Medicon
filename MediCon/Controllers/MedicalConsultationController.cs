using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class MedicalConsultationController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: MedicalConsultation
        public ActionResult Index()
        {
            return View();
        }

        public string generateID(string source)
        {
            return string.Format("{1:N}", source, Guid.NewGuid());
        }

        [HttpPost]
        public ActionResult getMedicineList()
        {
            try
            {
                var medList = dbMed.fn_MedicineList().ToList();

                return Json(medList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getMedHistory(string qrCode)
        {
            try
            {
                var medHist = dbMed.Consultations.Join(dbMed.Services, c => c.serviceID, s => s.serviceID, (c, s) => new { c, s })
                                                .Join(dbMed.Personnels, res1 => res1.c.personnelID, p => p.personnelID, (res1, p) => new { res1, p })
                                                .Join(dbMed.VitalSigns, res2 => res2.res1.c.vSignID, vs => vs.vSignID, (res2, vs) => new { res2, vs })
                                                .Where(e => e.vs.qrCode == qrCode)
                                                .Select(a => new
                                                {
                                                    a.res2.res1.c.consultID,
                                                    a.res2.res1.c.serviceID,
                                                    a.res2.res1.s.serviceName,
                                                    a.res2.res1.c.outsideReferral,
                                                    a.res2.res1.c.remarks,
                                                    a.res2.res1.c.toothNum,
                                                    a.res2.res1.c.personnelID,
                                                    a.res2.res1.c.dateTimeLog,
                                                    a.res2.p.personnel_lastName,
                                                    a.res2.p.personnel_firstName,
                                                    a.res2.p.personnel_midInit,
                                                    a.res2.p.personnel_extName,
                                                    a.res2.p.position
                                                }).OrderByDescending(b => b.dateTimeLog).GroupBy(c => c.consultID).ToList();

                return Json(medHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getDiagnosisHistory(string consultID)
        {
            try
            {
                var medHist = dbMed.ResultDiagnosis.Join(dbMed.Diagnosis, rd => rd.diagnoseID, d => d.diagnoseID, (rd, d) => new { rd, d })
                                                   .Where(a => a.rd.consultID == consultID)
                                                   .Select(b => new { 
                                                        b.rd.diagnoseID,
                                                        b.rd.otherDiagnosis,
                                                        b.rd.resultID,
                                                        b.d.diagnoseName
                                                   })
                                                   .OrderBy(a => a.diagnoseName).ToList();

                var rxHist = dbMed.sp_getRxHistory(consultID, "").OrderBy(a => a.productDesc).ToList();

                return Json(new { medHist, rxHist }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpPost]
        public ActionResult saveDiagnosis(string qrCode, string[] checkedDiagnosis, ResultDiagnosi detail, string[] referral, Consultation consultation, string[] lab)
        {
            try
            {
                //......  SAVE DATA TO CONSULTATION TABLE
                consultation.consultID = generateID(consultation.vSignID).Substring(0, 15);
                consultation.toothNum = null;
                consultation.personnelID = Session["personnelID"].ToString();
                consultation.dateTimeLog = DateTime.Now;
                dbMed.Consultations.Add(consultation);
                //......  /SAVE DATA TO CONSULATIONSURGERY TABLE

                //......  SAVE DATA TO REFERRAL AND LABORATORY EXAM TABLE
                if (referral != null)
                {
                    foreach (var item in referral)
                    {
                        Referral Ref = new Referral();
                        Ref.referralID = generateID(consultation.consultID).Substring(0, 15);
                        Ref.referredServiceID = item;
                        Ref.consultID = consultation.consultID;
                        dbMed.Referrals.Add(Ref);

                        if (item == "SERVICE006")
                        {
                            foreach(var labtest in lab)
                            {
                                LaboratoryExam labEx = new LaboratoryExam();
                                labEx.labID = generateID(Ref.referralID).Substring(0, 15);
                                labEx.referralID = Ref.referralID;
                                labEx.labTestID = labtest;
                                dbMed.LaboratoryExams.Add(labEx);
                            }
                        }
                    }
                }
                //......  /SAVE DATA TO REFERRAL AND LABORATORY EXAM TABLE

                //......  SAVE DATA TO RESULT DIAGNOSIS TABLE
                if (checkedDiagnosis != null)
                {
                    foreach (var item in checkedDiagnosis)
                    {
                        ResultDiagnosi RS = new ResultDiagnosi();
                        RS.resultID = generateID(consultation.consultID).Substring(0, 15);
                        RS.consultID = consultation.consultID;
                        RS.diagnoseID = item;
                        RS.otherDiagnosis = item == "DIAG023" ? detail.otherDiagnosis : null;
                        dbMed.ResultDiagnosis.Add(RS);
                    }
                    //......  /SAVE DATA TO RESULT DIAGNOSIS TABLE
                }

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Diagnosis is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Diagnosis is successfully saved!", consultID = consultation.consultID }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult savePrescription(string consultID, List<OutgoingItem> listRx)
        {
            try
            {
                //........  SAVE MEDICAL PRESCRIPTION
                MedicalPrescription mp = new MedicalPrescription();
                mp.rxID = generateID(consultID).Substring(0, 15);
                mp.serviceID = "SERVICE001";
                mp.consultID = consultID;
                mp.referralID = null;
                mp.personnelID = Session["personnelID"].ToString();
                mp.dateTimeRx = DateTime.Now;
                dbMed.MedicalPrescriptions.Add(mp);
                //........  /SAVE MEDICAL PRESCRIPTION

                //........  SAVE MEDICINES
                foreach (var item in listRx)
                {
                    item.outID = generateID(mp.rxID).Substring(0, 15);
                    item.rxID = mp.rxID;
                    //dbMed.OutgoingItems.Add(item);
                }

                dbMed.OutgoingItems.AddRange(listRx);
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Medical Prescription is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Medical Prescription is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult getDiagnoseClients()
        {
            try
            {
                var medHist = dbMed.fn_getDiagnoseClients("SERVICE001").ToList();

                return Json(medHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPersonDiagnoseResult(string consultID)
        {
           try
            {
                var resultDiag = dbMed.ResultDiagnosis.Join(dbMed.Diagnosis, rd => rd.diagnoseID, d => d.diagnoseID, (rd, d) => new { rd, d })
                                                      .Where(a => a.rd.consultID == consultID).Select(b => new
                                                      {
                                                          b.rd.resultID,
                                                          b.d.diagnoseID,
                                                          b.d.diagnoseName,
                                                          b.rd.otherDiagnosis
                                                      }).ToList();

                return Json(resultDiag, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}