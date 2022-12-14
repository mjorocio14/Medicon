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
        public ActionResult getLabHistory(string qrCode)
        {
            try
            {
                var labHist = dbMed.fn_getPatientLabHistory(qrCode).OrderByDescending(b => b.dateTested).ToList();

                return Json(labHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getDiagnosisHistory(string qrCode)
        {
            try
            {
                var diagnosis = dbMed.ResultDiagnosis.Join(dbMed.Diagnosis, rd => rd.diagnoseID, d => d.diagnoseID, (rd, d) => new { rd, d })
                                                   .Join(dbMed.Consultations, r1 => r1.rd.consultID, c => c.consultID, (r1, c) => new { r1, c })
                                                   .Join(dbMed.VitalSigns, r2 => r2.c.vSignID, vs => vs.vSignID, (r2, vs) => new { r2, vs })
                                                   .Where(a => a.vs.qrCode == qrCode)
                                                   .Select(b => new
                                                   {
                                                       b.r2.r1.rd.diagnoseID,
                                                       b.r2.r1.rd.otherDiagnosis,
                                                       b.r2.r1.rd.resultID,
                                                       b.r2.r1.d.diagnoseName,
                                                       b.r2.c.consultID,
                                                       b.r2.c.outsideReferral,
                                                       b.r2.c.remarks,
                                                       b.r2.c.personnelID,
                                                       b.r2.c.dateTimeLog,
                                                       physician = dbMed.Personnels.Where(c => c.personnelID == b.r2.c.personnelID).Select(d => new { d.personnel_firstName, d.personnel_midInit, d.personnel_lastName, d.personnel_extName })
                                                   })
                                                   .GroupBy(e => e.consultID).ToList();

                var rxHist = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, c => c.vSignID, (vs, c) => new {vs, c})
                                             .Join(dbMed.MedicalPrescriptions, r1 => r1.c.consultID, mp => mp.consultID, (r1, mp) => new {r1, mp})
                                             .Join(dbMed.OutgoingItems, r2 => r2.mp.rxID, oi => oi.rxID, (r2, oi) => new {r2, oi})
                                             .Join(dbMed.ProductLists, r3 => r3.oi.productCode, pl => pl.productCode, (r3, pl) => new {r3, pl})
                                             .Join(dbMed.ProductUnits, r4 => r4.pl.unitID, pu => pu.unitID, (r4, pu) => new {r4, pu})
                                             .Join(dbMed.Measurements, r5 => r5.r4.pl.measurementID, m => m.measurementID, (r5, m) => new {r5, m})
                                             .Join(dbMed.Services, r6 => r6.r5.r4.r3.r2.mp.serviceID, s => s.serviceID, (r6, s) => new {r6, s})
                                             .Where(a => a.r6.r5.r4.r3.r2.r1.vs.qrCode == qrCode)
                                             .Select(b => new {
                                                b.r6.r5.r4.r3.r2.r1.vs.qrCode,
                                                b.r6.r5.r4.r3.r2.r1.vs.vSignID,
                                                b.r6.r5.r4.r3.r2.r1.c.consultID,
                                                b.r6.r5.r4.r3.r2.mp.rxID,
                                                b.r6.r5.r4.r3.r2.mp.serviceID,
                                                b.s.serviceName,
                                                b.r6.r5.r4.r3.r2.mp.personnelID,
                                                b.r6.r5.r4.r3.r2.mp.dateTimeRx,
                                                physician = dbMed.Personnels.Where(c => c.personnelID == b.r6.r5.r4.r3.r2.mp.personnelID).Select(d => new { d.personnel_firstName, d.personnel_midInit, d.personnel_lastName, d.personnel_extName }),
                                                b.r6.r5.r4.r3.oi.outID,
                                                b.r6.r5.r4.r3.oi.productCode,
                                                b.r6.r5.r4.r3.oi.qtyRx,
                                                b.r6.r5.r4.r3.oi.dosage,
                                                b.r6.r5.r4.r3.oi.perDay,
                                                b.r6.r5.r4.r3.oi.noDay,
                                                b.r6.r5.r4.pl.productDesc,
                                                b.r6.r5.r4.pl.measurementID,
                                                b.r6.r5.r4.pl.unitID,
                                                b.r6.r5.pu.unitDesc,
                                                b.r6.m.measurementDesc
                                             }).GroupBy(c => c.rxID).ToList();

                return Json(new { diagnosis, rxHist }, JsonRequestBehavior.AllowGet);
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

                        else if(item == "SERVICE005")
                        {
                            PapsmearBreastExam pbe = new PapsmearBreastExam();
                            pbe.PBEID = generateID(Ref.referralID).Substring(0, 15);
                            pbe.referralID = Ref.referralID;
                            dbMed.PapsmearBreastExams.Add(pbe);
                        }

                        else if (item == "SERVICE004")
                        {
                            MRHrequest mrhq = new MRHrequest();
                            mrhq.requestID = generateID(Ref.referralID).Substring(0, 15);
                            mrhq.referralID = Ref.referralID;
                            mrhq.dateTimeLog = DateTime.Now;
                            mrhq.isDone = false;
                            mrhq.personnelID = Session["personnelID"].ToString();
                            dbMed.MRHrequests.Add(mrhq);
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