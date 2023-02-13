using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.ModelTemp;
using MediCon.Classes;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class MedicalConsultationController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: MedicalConsultation
        public ActionResult Index()
        {
            return View();
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
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getLabHistory(string qrCode)
        {
            try
            {
                //var labHist = dbMed.fn_getPatientLabHistory(qrCode).OrderByDescending(b => b.dateTested).GroupBy(c => c.labTestID).ToList();
                var labHist = dbMed.LaboratoryExams.Join(dbMed.LaboratoryTests, le => le.labTestID, lt => lt.labTestID, (le, lt) => new { le, lt })
                                                   .Join(dbMed.Referrals, res1 => res1.le.referralID, r => r.referralID, (res1, r) => new { res1, r })
                                                   .Join(dbMed.Consultations, res2 => res2.r.consultID, c => c.consultID, (res2, c) => new { res2, c })
                                                   .Join(dbMed.VitalSigns, res3 => res3.c.vSignID, vs => vs.vSignID, (res3, vs) => new { res3, vs })
                                                   .Where(a => a.vs.qrCode == qrCode)
                                                   .Select(b => new
                                                   {
                                                       b.res3.res2.res1.le.labID,
                                                       b.res3.res2.res1.le.labTestID,
                                                       b.res3.res2.res1.lt.labTestName,
                                                       b.res3.res2.res1.le.isTested,
                                                       b.res3.res2.res1.le.isEncoded,
                                                       b.res3.res2.res1.le.otherLabDesc,
                                                       b.res3.res2.res1.le.xrayDesc,
                                                       b.res3.res2.res1.le.ecgDesc,
                                                       b.res3.res2.res1.le.ultrasoundDesc,
                                                       b.res3.res2.res1.le.pathologist,
                                                       b.res3.res2.res1.le.medtech,
                                                       labPersonID = b.res3.res2.res1.le.personnelID,
                                                       dateTested = b.res3.res2.res1.le.dateTimeLog,
                                                       labPathologist = dbMed.Personnels.FirstOrDefault(c => c.personnelID == b.res3.res2.res1.le.pathologist).personnelID,
                                                       labMedtech = dbMed.Personnels.FirstOrDefault(c => c.personnelID == b.res3.res2.res1.le.medtech).personnelID,
                                                       b.res3.res2.r.referralID,
                                                       b.res3.res2.r.MRDiagnosisID,
                                                       ConsultServiceName = dbMed.Services.FirstOrDefault(aa => aa.serviceID == b.res3.c.serviceID).serviceName,
                                                       refServiceName = dbMed.Services.FirstOrDefault(aa => aa.serviceID == b.res3.res2.r.referredServiceID).serviceName,
                                                       b.res3.c.consultID,
                                                       b.vs.qrCode,
                                                       consultPersonID = b.res3.c.personnelID,
                                                       consultDT = b.res3.c.dateTimeLog,
                                                       consultPersonnel = dbMed.Personnels.Where(c => c.personnelID == b.res3.c.personnelID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       bloodChemResult = dbMed.BloodChems.Where(dd => dd.labID == b.res3.res2.res1.le.labID).Select(ee => new { 
                                                            ee.result,
                                                            ee.bloodChemID,
                                                            ee.LabTestGroupID,
                                                            bloodChemDateEncoded = ee.dateTimeLog
                                                       }).OrderBy(xx => xx.LabTestGroupID)
                                                   }).ToList();

                return Json(labHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching laboratory history.", error = ex }, JsonRequestBehavior.AllowGet);
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
                                                   .Join(dbMed.Services, r3 => r3.r2.c.serviceID, s => s.serviceID, (r3, s) => new { r3, s })
                                                   .Where(a => a.r3.vs.qrCode == qrCode)
                                                   .Select(b => new
                                                   {
                                                       b.r3.r2.r1.rd.diagnoseID,
                                                       b.r3.r2.r1.rd.otherDiagnosis,
                                                       b.r3.r2.r1.rd.resultID,
                                                       b.r3.r2.r1.d.diagnoseName,
                                                       b.r3.r2.c.consultID,
                                                       b.r3.r2.c.outsideReferral,
                                                       b.r3.r2.c.remarks,
                                                       b.r3.r2.c.personnelID,
                                                       b.r3.r2.c.dateTimeLog,
                                                       b.s.serviceName,
                                                       physician = dbMed.Personnels.Where(c => c.personnelID == b.r3.r2.c.personnelID).Select(d => new { d.personnel_firstName, d.personnel_midInit, d.personnel_lastName, d.personnel_extName })
                                                   })
                                                   .OrderByDescending(x => x.dateTimeLog)
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
                                             })
                                             .OrderByDescending(x => x.dateTimeRx).GroupBy(c => c.rxID).ToList();


                var referralRx = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, c => c.vSignID, (vs, c) => new { vs, c })
                                             .Join(dbMed.Referrals, r0 => r0.c.consultID, referral => referral.consultID, (r0, referral) => new { r0, referral })
                                             .Join(dbMed.MedicalPrescriptions, r1 => r1.referral.referralID, mp => mp.referralID, (r1, mp) => new { r1, mp })
                                             .Join(dbMed.OutgoingItems, r2 => r2.mp.rxID, oi => oi.rxID, (r2, oi) => new { r2, oi })
                                             .Join(dbMed.ProductLists, r3 => r3.oi.productCode, pl => pl.productCode, (r3, pl) => new { r3, pl })
                                             .Join(dbMed.ProductUnits, r4 => r4.pl.unitID, pu => pu.unitID, (r4, pu) => new { r4, pu })
                                             .Join(dbMed.Measurements, r5 => r5.r4.pl.measurementID, m => m.measurementID, (r5, m) => new { r5, m })
                                             .Join(dbMed.Services, r6 => r6.r5.r4.r3.r2.mp.serviceID, s => s.serviceID, (r6, s) => new { r6, s })
                                             .Where(a => a.r6.r5.r4.r3.r2.r1.r0.vs.qrCode == qrCode)
                                             .Select(b => new
                                             {
                                                 b.r6.r5.r4.r3.r2.r1.r0.vs.qrCode,
                                                 b.r6.r5.r4.r3.r2.r1.r0.vs.vSignID,
                                                 b.r6.r5.r4.r3.r2.r1.r0.c.consultID,
                                                 b.r6.r5.r4.r3.r2.r1.referral.referralID,
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
                                             }).OrderByDescending(x => x.dateTimeRx).GroupBy(c => c.rxID).ToList();

                return Json(new { diagnosis, rxHist, referralRx }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching diagnosis history.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpPost]
        public ActionResult saveDiagnosis(string qrCode, string[] checkedDiagnosis, ResultDiagnosi detail, string[] referral, Consultation consultation, string[] lab, string otherLab, string xrayDesc, string ecgDesc, string ultrasoundDesc)
        {
            try
            {
                var consultID = new IDgenerator(consultation.vSignID);

                //......  SAVE DATA TO CONSULTATION SURGERY TABLE
                consultation.consultID = consultID.generateID.Substring(0, 15);
                consultation.toothNum = null;
                consultation.personnelID = Session["personnelID"].ToString();
                consultation.dateTimeLog = DateTime.Now;
                dbMed.Consultations.Add(consultation);
                //......  /SAVE DATA TO CONSULATION SURGERY TABLE

                //......  SAVE DATA TO REFERRAL AND LABORATORY EXAM TABLE
                if (referral != null)
                {
                    foreach (var item in referral)
                    {
                        var referralID = new IDgenerator(consultation.consultID);

                        Referral Ref = new Referral();
                        Ref.referralID = referralID.generateID.Substring(0, 15);
                        Ref.referredServiceID = item;
                        Ref.consultID = consultation.consultID;
                        dbMed.Referrals.Add(Ref);

                        if (item == "SERVICE006")
                        {
                            foreach(var labtest in lab)
                            {
                                var labID = new IDgenerator(Ref.referralID);

                                LaboratoryExam labEx = new LaboratoryExam();
                                labEx.labID = labID.generateID.Substring(0, 15);
                                labEx.referralID = Ref.referralID;
                                labEx.labTestID = labtest;
                                labEx.otherLabDesc = labtest == "L0022" ? otherLab : null;
                                labEx.xrayDesc = labtest == "L0006" ? xrayDesc : null;
                                labEx.ecgDesc = labtest == "L0004" ? ecgDesc : null;
                                labEx.ultrasoundDesc = labtest == "L0023" ? ultrasoundDesc : null;
                                dbMed.LaboratoryExams.Add(labEx);
                            }
                        }

                        else if(item == "SERVICE005")
                        {
                            var PBEID = new IDgenerator(Ref.referralID);

                            PapsmearBreastExam pbe = new PapsmearBreastExam();
                            pbe.PBEID = PBEID.generateID.Substring(0, 15);
                            pbe.referralID = Ref.referralID;
                            dbMed.PapsmearBreastExams.Add(pbe);
                        }

                        else if (item == "SERVICE004")
                        {
                            var requestID = new IDgenerator(Ref.referralID);

                            MRHrequest mrhq = new MRHrequest();
                            mrhq.requestID = requestID.generateID.Substring(0, 15);
                            mrhq.referralID = Ref.referralID;
                            mrhq.requestDT = DateTime.Now;
                            mrhq.requestPersonID = Session["personnelID"].ToString();
                            mrhq.isInterviewDone = false;
                            mrhq.isDiagnoseDone = false;
                            
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
                        var resultID = new IDgenerator(consultation.consultID);

                        ResultDiagnosi RS = new ResultDiagnosi();
                        RS.resultID = resultID.generateID.Substring(0, 15);
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
                return Json(new { status = "error", msg = "An error occured while saving the diagnosis.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult savePrescription(string qrCode, string consultID, List<OutgoingItem> listRx)
        {
            try
            {
                var date = new CurrentDateTime();
                var consultation = new Consultation();
                
               if (consultID == null)
               {
                   var vSignID = dbMed.VitalSigns.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT).vSignID;
                   var conID = new IDgenerator(vSignID);

                   //......  SAVE DATA TO CONSULTATION TABLE
                   consultation.consultID = conID.generateID.Substring(0, 15);
                   consultation.dateTimeLog = DateTime.Now;
                   consultation.outsideReferral = null;
                   consultation.personnelID = Session["personnelID"].ToString();
                   consultation.remarks = null;
                   consultation.serviceID = "SERVICE001";
                   consultation.toothNum = null;
                   consultation.vSignID = vSignID;
                   dbMed.Consultations.Add(consultation);
                   //......  /SAVE DATA TO CONSULATIONSURGERY TABLE
                   
               }

                //........  SAVE MEDICAL PRESCRIPTION
               var rxID = new IDgenerator(consultation.consultID);

                MedicalPrescription mp = new MedicalPrescription();
                mp.rxID = rxID.generateID.Substring(0, 15);
                mp.serviceID = "SERVICE001";
                mp.consultID = consultID == null ? consultation.consultID : consultID;
                mp.referralID = null;
                mp.personnelID = Session["personnelID"].ToString();
                mp.dateTimeRx = DateTime.Now;
                dbMed.MedicalPrescriptions.Add(mp);
                //........  /SAVE MEDICAL PRESCRIPTION

                //........  SAVE MEDICINES
                foreach (var item in listRx)
                {
                    var outID = new IDgenerator(mp.rxID);
                    item.outID = outID.generateID.Substring(0, 15);
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
                return Json(new { status = "error", msg = "An error occured while saving the prescription.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult getDiagnoseClients(DateTime date)
        {
            try
            {
                var medHist = dbMed.fn_getDiagnoseClients("SERVICE001", date).OrderByDescending(a => a.dateTimeLog).ToList();

                return Json(medHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the client list.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPersonVSignDiagnoseResult(string consultID, string vSignID)
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

                var vitalSign = dbMed.VitalSigns.SingleOrDefault(a => a.vSignID == vSignID);

                var bpList = dbMed.BloodPressures.Join(dbMed.VitalSigns, bp => bp.vSignID, vs => vs.vSignID, (bp, vs) => new { bp, vs })
                                            .Where(a => a.bp.vSignID == vSignID).Select(b => new
                                            {
                                                b.bp.temperature,
                                                b.bp.systolic,
                                                b.bp.diastolic,
                                                b.bp.pulseRate,
                                                b.vs.dateTimeLog
                                            });

                return Json(new { resultDiag = resultDiag, vitalSign = vitalSign, bp = bpList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching client`s vital signs.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPersonReferralLaboratory(string consultID)
        {
            try
            {
                var referral = dbMed.Referrals.Where(a => a.consultID == consultID).Select(b => b.referredServiceID).ToList();
                var lab = dbMed.LaboratoryExams.Join(dbMed.Referrals, le => le.referralID, r => r.referralID, (le, r) => new { le, r })
                                               .Where(a => a.r.consultID == consultID && a.r.MRDiagnosisID == null)
                                               .Select(b => new
                                               {
                                                   b.le.labTestID,
                                                   b.le.otherLabDesc,
                                                   b.le.xrayDesc,
                                                   b.le.ecgDesc,
                                                   b.le.ultrasoundDesc
                                               }).ToList();
                

                return Json(new { referral = referral, laboratory = lab}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the laboratory referrals.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPersonMedicine(string consultID)
        {
            try
            {
                var meds = dbMed.Referrals.Where(a => a.consultID == consultID).Select(b => b.referredServiceID).ToList();

                return Json(meds, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching prescripted medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult updateDiagnosis(string qrCode, Consultation consult, string[] diagnosis, string otherDiagnose, string[] referral, string otherReferral, string[] labReq, string otherLab)
        {
            try
            {
                //......  UPDATE DATA TO CONSULTATION TABLE
                var con = dbMed.Consultations.SingleOrDefault(a => a.consultID == consult.consultID);
                con.dateTimeLog = DateTime.Now;
                con.outsideReferral = consult.outsideReferral;
                con.personnelID = Session["personnelID"].ToString();
                con.remarks = consult.remarks;
                dbMed.Entry(con).State = EntityState.Modified;
                //......  /UPDATE DATA TO CONSULATIONSURGERY TABLE

                //......  UPDATE DATA TO RESULT DIAGNOSIS TABLE
                var diag = dbMed.ResultDiagnosis.Where(a => a.consultID == consult.consultID);
                if(diag != null) { dbMed.ResultDiagnosis.RemoveRange(diag); }

                if (diagnosis != null)
                {
                    foreach (var item in diagnosis)
                    {
                        ResultDiagnosi RS = new ResultDiagnosi();
                        var resultID = new IDgenerator(consult.consultID);

                        RS.resultID = resultID.generateID.Substring(0, 15);
                        RS.consultID = consult.consultID;
                        RS.diagnoseID = item;
                        RS.otherDiagnosis = item == "DIAG023" ? otherDiagnose : null;
                        dbMed.ResultDiagnosis.Add(RS);
                    }
                }
                //......  /UPDATE DATA TO RESULT DIAGNOSIS TABLE

                //......  UPDATE DATA TO REFERRAL AND LABORATORY EXAM TABLE
                var existingRefID = string.Empty;
                var existingRef = dbMed.Referrals.Where(a => a.consultID == consult.consultID);
                
                if (existingRef != null) {
                    //existingRefID = existingRef.FirstOrDefault().referralID;
                    //dbMed.Referrals.RemoveRange(existingRef);

                    //foreach ( var refRecord in existingRef)
                    //{
                    //    switch (refRecord.referredServiceID)
                    //    {
                    //        case "SERVICE006":
                    //            var newReferLab = referral.SingleOrDefault(a => a == "SERVICE006");

                    //            if (newReferLab != null)
                    //            {

                    //            }

                    //            var existingLab = dbMed.LaboratoryExams.Where(a => a.referralID == refRecord.referralID);

                    //            if (existingLab != null)
                    //            {
                    //                if (existingLab.Count(a => a.isTested == true) > 0)
                    //                    return Json(new { status = "error", msg = "You can`t uncheck/remove LABORATORY EXAM/s that already have tested!" }, JsonRequestBehavior.AllowGet);

                    //                else
                    //                {
                    //                    dbMed.LaboratoryExams.RemoveRange(existingLab);

                    //                    Referral Ref = new Referral();
                    //                    Ref.referralID = refRecord.referralID;
                    //                    Ref.referredServiceID = "SERVICE006";
                    //                    Ref.consultID = consult.consultID;
                    //                    dbMed.Referrals.Add(Ref);
                    //                }

                    //            }
                    //    }
                    //}


                    //var existingLab = dbMed.LaboratoryExams.Where(a => a.referralID == existingRefID);
                    //if (existingLab != null) {
                    //    if (existingLab.Count(a => a.isTested == true) > 0)
                    //        return Json(new { status = "error", msg = "You can`t uncheck/remove LABORATORY EXAM/s that already have tested!" }, JsonRequestBehavior.AllowGet);

                    //    else
                    //    {
                    //        dbMed.LaboratoryExams.RemoveRange(existingLab);

                    //        var referLab = referral.SingleOrDefault(a => a == "SERVICE006");
                    //        Referral Ref = new Referral();
                    //        Ref.referralID = existingRefID;
                    //        Ref.referredServiceID = "SERVICE006";
                    //        Ref.consultID = consult.consultID;
                    //        dbMed.Referrals.Add(Ref);
                    //    }
                            
                    //}

                    var existingPBE = dbMed.PapsmearBreastExams.SingleOrDefault(a => a.referralID == existingRefID && !string.IsNullOrEmpty(a.personnelID));
                    if (existingPBE != null) { 
                        //dbMed.PapsmearBreastExams.Remove(existingPBE); 
                        return Json(new { status = "error", msg = "You can`t uncheck/remove PAPSMEAR & BREAST EXAM that already have tested!" }, JsonRequestBehavior.AllowGet);
                    }

                    var existingMRH = dbMed.MRHrequests.SingleOrDefault(a => a.referralID == existingRefID);
                    if (existingMRH != null) { 
                        //dbMed.PapsmearBreastExams.Remove(existingMRH); 
                        return Json(new { status = "error", msg = "You can`t uncheck/remove PAPSMEAR & BREAST EXAM that already have tested!" }, JsonRequestBehavior.AllowGet);
                    }
                }

                if (referral != null)
                {
                    foreach (var item in referral)
                    {
                        Referral Ref = new Referral();
                        Ref.referralID = existingRefID;
                        Ref.referredServiceID = item;
                        Ref.consultID = consult.consultID;
                        dbMed.Referrals.Add(Ref);

                        if (item == "SERVICE006")
                        {
                            foreach (var labtest in labReq)
                            {
                                var labID = new IDgenerator(Ref.referralID);

                                LaboratoryExam labEx = new LaboratoryExam();
                                labEx.labID = labID.generateID.Substring(0, 15);
                                labEx.referralID = existingRefID;
                                labEx.labTestID = labtest;
                                labEx.otherLabDesc = labtest == "L0022" ? otherLab : null;
                                dbMed.LaboratoryExams.Add(labEx);
                            }
                        }

                        else if (item == "SERVICE005")
                        {
                            var PBEID = new IDgenerator(Ref.referralID);

                            PapsmearBreastExam pbe = new PapsmearBreastExam();
                            pbe.PBEID = PBEID.generateID.Substring(0, 15);
                            pbe.referralID = Ref.referralID;
                            dbMed.PapsmearBreastExams.Add(pbe);
                        }

                        else if (item == "SERVICE004")
                        {
                            var requestID = new IDgenerator(Ref.referralID);

                            MRHrequest mrhq = new MRHrequest();
                            mrhq.requestID = requestID.generateID.Substring(0, 15);
                            mrhq.referralID = Ref.referralID;
                            mrhq.requestDT = DateTime.Now;
                            mrhq.requestPersonID = Session["personnelID"].ToString();
                            mrhq.isInterviewDone = false;
                            mrhq.isDiagnoseDone = false;
                            dbMed.MRHrequests.Add(mrhq);
                        }
                    }
                }
                //......  /SAVE DATA TO REFERRAL AND LABORATORY EXAM TABLE

                

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Diagnosis is not updated!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Diagnosis is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while updating the diagnosis.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}