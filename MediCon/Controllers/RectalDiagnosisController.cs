using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Classes;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class RectalDiagnosisController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        public static string currentMRDiagnosisID;

        [UserAccess]
        // GET: RectalDiagnosis
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getRectalExam(string qrCode)
        {
            try
            {
                var rectal = dbMed.MaleRepro_Interview.Join(dbMed.MRHrequests, mri => mri.requestID, req => req.requestID, (mri, req) => new { mri, req })
                                                   .Join(dbMed.Referrals, r1 => r1.req.referralID, refer => refer.referralID, (r1, refer) => new { r1, refer })
                                                   .Join(dbMed.Consultations, r2 => r2.refer.consultID, con => con.consultID, (r2, con) => new { r2, con })
                                                   .Join(dbMed.VitalSigns, r3 => r3.con.vSignID, vs => vs.vSignID, (r3, vs) => new { r3, vs })
                                                   .Where(a => a.vs.qrCode == qrCode && a.r3.r2.r1.req.isInterviewDone == true && a.r3.r2.r1.req.isDiagnoseDone == false)
                                                   .Select(b => new
                                                   {
                                                       b.r3.r2.r1.mri.besesGumising,
                                                       b.r3.r2.r1.mri.cancerName,
                                                       b.r3.r2.r1.req.interviewDT,
                                                       b.r3.r2.r1.req.isInterviewDone,
                                                       b.r3.r2.r1.req.interviewerID,
                                                       b.r3.r2.r1.mri.diNauubos,
                                                       b.r3.r2.r1.mri.DREfrequency,
                                                       b.r3.r2.r1.mri.is1stDRE,
                                                       b.r3.r2.r1.mri.isAnyCancer,
                                                       b.r3.r2.r1.mri.isMedication,
                                                       b.r3.r2.r1.mri.isProstateCancer,
                                                       b.r3.r2.r1.mri.kadalasUmihi,
                                                       b.r3.r2.r1.mri.magpwersaNgIhi,
                                                       b.r3.r2.r1.mri.mahinangDaloy,
                                                       b.r3.r2.r1.mri.medicineName,
                                                       b.r3.r2.r1.mri.MRID,
                                                       b.r3.r2.r1.mri.nadarama,
                                                       b.r3.r2.r1.mri.pagpigilNgIhi,
                                                       b.r3.r2.r1.mri.patigiltiglNaIhi,
                                                       interviewPerson = dbMed.Personnels.Where(c => c.personnelID == b.r3.r2.r1.req.interviewerID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       b.r3.r2.r1.mri.requestID,
                                                       b.r3.r2.r1.mri.sintomasNgIhi,
                                                       b.r3.r2.r1.req.referralID,
                                                       b.vs.qrCode
                                                   }).OrderByDescending(x => x.interviewDT).ToList();

                return Json(rectal, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getRectalHistory(string qrCode)
        {
            try
            {
                var rectal = dbMed.MaleRepro_Diagnosis.Join(dbMed.MaleRepro_Interview, mrd => mrd.MRID, mri => mri.MRID, (mrd, mri) => new { mrd, mri })
                                                   .Join(dbMed.MRHrequests, r1 => r1.mri.requestID, mrh => mrh.requestID, (r1, mrh) => new { r1, mrh })
                                                   .Join(dbMed.Referrals, r2 => r2.mrh.referralID, refer => refer.referralID, (r2, refer) => new { r2, refer })
                                                   .Join(dbMed.Consultations, r3 => r3.refer.consultID, con => con.consultID, (r3, con) => new { r3, con })
                                                   .Join(dbMed.VitalSigns, r4 => r4.con.vSignID, vs => vs.vSignID, (r4, vs) => new { r4, vs })
                                                   .Where(a => a.vs.qrCode == qrCode)
                                                   .Select(b => new
                                                   {
                                                       b.r4.r3.r2.r1.mri.besesGumising,
                                                       b.r4.r3.r2.r1.mri.cancerName,
                                                       b.r4.r3.r2.mrh.interviewDT,
                                                       b.r4.r3.r2.mrh.isInterviewDone,
                                                       b.r4.r3.r2.mrh.interviewerID,
                                                       b.r4.r3.r2.r1.mri.diNauubos,
                                                       b.r4.r3.r2.r1.mri.DREfrequency,
                                                       b.r4.r3.r2.r1.mri.is1stDRE,
                                                       b.r4.r3.r2.r1.mri.isAnyCancer,
                                                       b.r4.r3.r2.r1.mri.isMedication,
                                                       b.r4.r3.r2.r1.mri.isProstateCancer,
                                                       b.r4.r3.r2.r1.mri.kadalasUmihi,
                                                       b.r4.r3.r2.r1.mri.magpwersaNgIhi,
                                                       b.r4.r3.r2.r1.mri.mahinangDaloy,
                                                       b.r4.r3.r2.r1.mri.medicineName,
                                                       b.r4.r3.r2.r1.mri.MRID,
                                                       b.r4.r3.r2.r1.mri.nadarama,
                                                       b.r4.r3.r2.r1.mri.pagpigilNgIhi,
                                                       b.r4.r3.r2.r1.mri.patigiltiglNaIhi,
                                                       interviewPerson = dbMed.Personnels.Where(c => c.personnelID == b.r4.r3.r2.mrh.interviewerID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       b.r4.r3.r2.r1.mri.requestID,
                                                       b.r4.r3.r2.r1.mri.sintomasNgIhi,
                                                       b.r4.r3.r2.r1.mrd.abdomen,
                                                       b.r4.r3.r2.r1.mrd.arthriticPain,
                                                       b.r4.r3.r2.r1.mrd.consistency,
                                                       b.r4.r3.r2.mrh.isDiagnoseDone,
                                                       b.r4.r3.r2.mrh.diagnoseDT,
                                                       b.r4.r3.r2.mrh.diagPersonID,
                                                       b.r4.r3.r2.r1.mrd.DREsize,
                                                       b.r4.r3.r2.r1.mrd.extGenita,
                                                       b.r4.r3.r2.r1.mrd.lowbackPain,
                                                       b.r4.r3.r2.r1.mrd.mobility,
                                                       b.r4.r3.r2.r1.mrd.MRDiagnosisID,
                                                       b.r4.r3.r2.r1.mrd.PEfindings,
                                                       diagPerson = dbMed.Personnels.Where(c => c.personnelID == b.r4.r3.r2.mrh.diagPersonID).Select(e => new { e.personnel_lastName, e.personnel_firstName, e.personnel_midInit, e.personnel_extName }),
                                                       b.r4.r3.r2.r1.mrd.PSA,
                                                       b.r4.r3.r2.r1.mrd.rectalFinding,
                                                       b.r4.r3.r2.r1.mrd.Remarks,
                                                       b.r4.r3.r2.r1.mrd.texture,
                                                       b.r4.r3.r2.r1.mrd.transperrinealBiopsy,
                                                       b.r4.r3.r2.r1.mrd.transrectalBiopsy,
                                                       b.r4.r3.r2.r1.mrd.TRUS,
                                                       b.r4.r3.r2.r1.mrd.TRUSBiopsy,
                                                       b.vs.qrCode
                                                   }).OrderByDescending(x => x.diagnoseDT).ToList();

                var RectalRX = dbMed.VitalSigns.Join(dbMed.Consultations, vs => vs.vSignID, c => c.vSignID, (vs, c) => new { vs, c })
                                             .Join(dbMed.Referrals, r0 => r0.c.consultID, referral => referral.consultID, (r0, referral) => new { r0, referral })
                                             .Join(dbMed.MedicalPrescriptions, r1 => r1.referral.referralID, mp => mp.referralID, (r1, mp) => new { r1, mp })
                                             .Join(dbMed.OutgoingItems, r2 => r2.mp.rxID, oi => oi.rxID, (r2, oi) => new { r2, oi })
                                             .Join(dbMed.ProductLists, r3 => r3.oi.productCode, pl => pl.productCode, (r3, pl) => new { r3, pl })
                                             .Join(dbMed.ProductUnits, r4 => r4.pl.unitID, pu => pu.unitID, (r4, pu) => new { r4, pu })
                                             .Join(dbMed.Measurements, r5 => r5.r4.pl.measurementID, m => m.measurementID, (r5, m) => new { r5, m })
                                             .Join(dbMed.Services, r6 => r6.r5.r4.r3.r2.mp.serviceID, s => s.serviceID, (r6, s) => new { r6, s })
                                             .Where(a => a.r6.r5.r4.r3.r2.r1.r0.vs.qrCode == qrCode && a.r6.r5.r4.r3.r2.mp.serviceID == "SERVICE004")
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
                                             }).GroupBy(c => c.rxID).ToList();

                return Json(new {rectal = rectal, rx = RectalRX}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getLabHistory(string qrCode)
        {
            try
            {
                var labHist = dbMed.fn_getPatientLabHistory(qrCode).Where(a => a.MRDiagnosisID != null).OrderByDescending(b => b.dateTested).ToList();

                return Json(labHist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveDiagnosis(MaleRepro_Diagnosis mrd, string requestID)
        {
            try
            {
                var ID = new IDgenerator(mrd.MRID);

                mrd.MRDiagnosisID = ID.generateID.Substring(0, 15);
                currentMRDiagnosisID = mrd.MRDiagnosisID;
                dbMed.MaleRepro_Diagnosis.Add(mrd);

                var request = dbMed.MRHrequests.SingleOrDefault(a => a.requestID == requestID);
                request.isDiagnoseDone = true;
                request.diagPersonID = Session["personnelID"].ToString();
                request.diagnoseDT = DateTime.Now;
                dbMed.Entry(request).State = EntityState.Modified;

                var referral = dbMed.Referrals.SingleOrDefault(a => a.referralID == request.referralID);
                referral.MRDiagnosisID = mrd.MRDiagnosisID;
                dbMed.Entry(referral).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Rectal diagnosis is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Rectal diagnosis is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult saveLaboratory(string[] labtest, string referralID, string otherLab, string service)
        {
            try
                {
                    if (currentMRDiagnosisID == null)
                    {
                        return Json(new { status = "error", msg = "Please fill-up the RECTAL DIAGNOSIS TAB first before proceeding to laboratory!" }, JsonRequestBehavior.AllowGet);
                    }

                    else {
                        //......  UPDATE DATA IN REFERRAL AND SAVE DATA IN LABORATORY EXAM TABLE   ---
                        //......  GET RECORD FROM REFERRAL TABLE USING THE REFERRAL ID USED TO CREATE MRHREQUEST
                    
                            //var refID = new IDgenerator(referralID);

                            //Referral Ref = new Referral();
                            //Ref.referralID = refID.generateID.Substring(0, 15);
                            //Ref.referredServiceID = service;
                            //Ref.consultID = null;
                            //Ref.MRDiagnosisID = currentMRDiagnosisID;
                            //dbMed.Referrals.Add(Ref);

                            foreach (var lab in labtest)
                            {
                                var labID = new IDgenerator(referralID);

                                LaboratoryExam labEx = new LaboratoryExam();
                                labEx.labID = labID.generateID.Substring(0, 15);
                                labEx.referralID = referralID;
                                labEx.labTestID = lab;
                                labEx.otherLabDesc = lab == "L0022" ? otherLab : null;
                                dbMed.LaboratoryExams.Add(labEx);
                            }


                        //......  /UPDATE DATA IN REFERRAL AND SAVE DATA IN LABORATORY EXAM TABLE   ---

                        var affectedRow = dbMed.SaveChanges();

                        currentMRDiagnosisID = null;

                        if (affectedRow == 0)
                            return Json(new { status = "error", msg = "Rectal examination is not saved!" }, JsonRequestBehavior.AllowGet);

                        return Json(new { status = "success", msg = "Rectal examination is successfully saved!" }, JsonRequestBehavior.AllowGet);
                    }
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult savePrescription(string referralID, List<OutgoingItem> listRx)
        {
            try
            {
                var rxID = new IDgenerator(referralID);

                //........  SAVE MEDICAL PRESCRIPTION
                MedicalPrescription mp = new MedicalPrescription();
                mp.rxID = rxID.generateID.Substring(0, 15);
                mp.serviceID = "SERVICE004";
                mp.consultID = null;
                mp.referralID = referralID;
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
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult getRectalClientList(DateTime date)
        {
            try
            {
                var client = dbMed.fn_getRectalClients(date).OrderByDescending(x => x.diagnoseDT).ToList();

                return Json(client, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}