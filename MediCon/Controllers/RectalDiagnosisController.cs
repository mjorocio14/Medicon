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
                                                       b.r3.con.consultID,
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
        public ActionResult updateDiagnosis(MaleRepro_Diagnosis mrd)
        {
            try
            {
                var diagRecord = dbMed.MaleRepro_Diagnosis.SingleOrDefault(a => a.MRDiagnosisID == mrd.MRDiagnosisID);
                diagRecord.PEfindings = mrd.PEfindings;
                diagRecord.abdomen = mrd.abdomen;
                diagRecord.extGenita = mrd.extGenita;
                diagRecord.DREsize = mrd.DREsize;
                diagRecord.consistency = mrd.consistency;
                diagRecord.texture = mrd.texture;
                diagRecord.mobility = mrd.mobility;
                diagRecord.lowbackPain = mrd.lowbackPain;
                diagRecord.arthriticPain = mrd.arthriticPain;
                diagRecord.rectalFinding = mrd.rectalFinding;
                diagRecord.TRUS = mrd.TRUS;
                diagRecord.PSA = mrd.PSA;
                diagRecord.transperrinealBiopsy = mrd.transperrinealBiopsy;
                diagRecord.transrectalBiopsy = mrd.transrectalBiopsy;
                diagRecord.TRUSBiopsy = mrd.TRUSBiopsy;
                diagRecord.Remarks = mrd.Remarks;
                dbMed.Entry(diagRecord).State = EntityState.Modified;

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Rectal diagnosis was not updated!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Rectal diagnosis is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult updateLaboratory(string[] labtest, string referralID, string otherLab, string xrayDesc, string ecgDesc, string ultrasoundDesc)
        {
            try
            {
                var originalLab = dbMed.LaboratoryExams.Where(a => a.referralID == referralID).ToArray();

                if (labtest == null)
                {
                    if (originalLab.Count() > 0) dbMed.LaboratoryExams.RemoveRange(originalLab);
                }
                
                else
                {
                    foreach (var rec in originalLab)
                    {
                        bool isExistLab = false;

                        // Check if old labtest exist in the new labtest list
                        if (labtest != null)
                            isExistLab = Array.Exists(labtest, element => element == rec.labTestID);

                        // If old labtest does not exist anymore in the new labReq list
                        // then remove this labtest and its related data
                        if (!isExistLab)
                            dbMed.LaboratoryExams.Remove(rec);
                    }

                    // Saving new labtest that does not exist in the original labtest list
                    if (labtest != null)
                    {
                        foreach (var newLab in labtest)
                        {
                            bool isExistNewLab = false;

                            // Check if NEW referral list exist in the OLD referral list
                            if (originalLab != null)
                                isExistNewLab = Array.Exists(originalLab, element => element.labTestID == newLab);

                            // If new referral serviceID does not exist in the old referral list
                            // then Add this new referredServiceID
                            if (!isExistNewLab)
                                CreateLabExamRecord(newLab, referralID, otherLab, xrayDesc, ecgDesc, ultrasoundDesc);
                        }
                    }
                }

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Laboratory was not updated!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Laboratory is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        private void CreateLabExamRecord(string labtestID, string referralID, string otherLab, string xrayDesc, string ecgDesc, string ultrasoundDesc)
        {
            var labID = new IDgenerator(referralID);

            LaboratoryExam labEx = new LaboratoryExam();
            labEx.labID = labID.generateID.Substring(0, 15);
            labEx.referralID = referralID;
            labEx.labTestID = labtestID;
            labEx.otherLabDesc = labtestID == "L0022" ? otherLab : null;
            labEx.xrayDesc = labtestID == "L0006" ? xrayDesc : null;
            labEx.ecgDesc = labtestID == "L0004" ? ecgDesc : null;
            labEx.ultrasoundDesc = labtestID == "L0023" ? ultrasoundDesc : null;
            dbMed.LaboratoryExams.Add(labEx);
        }

        [HttpPost]
        public ActionResult saveLaboratory(string[] labtest, string referralID, string otherLab, string xrayDesc, string ecgDesc, string ultrasoundDesc)
        {
            try
                {
                    if (currentMRDiagnosisID == null)
                    {
                        return Json(new { status = "error", msg = "Please fill-up the RECTAL DIAGNOSIS TAB first before proceeding to laboratory!" }, JsonRequestBehavior.AllowGet);
                    }

                    else {
                        //......  UPDATE DATA IN REFERRAL AND SAVE DATA IN LABORATORY EXAM TABLE   ---
                            foreach (var lab in labtest)
                            {
                                CreateLabExamRecord(lab, referralID, otherLab, xrayDesc, ecgDesc, ultrasoundDesc);
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
        public ActionResult savePrescription(string referralID, List<OutgoingItem> listRx, string consultID)
        {
            try
            {
                var rxID = new IDgenerator(referralID);

                //........  SAVE MEDICAL PRESCRIPTION
                MedicalPrescription mp = new MedicalPrescription();
                mp.rxID = rxID.generateID.Substring(0, 15);
                mp.serviceID = "SERVICE004";
                mp.consultID = consultID;
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

        [HttpPost]
        public ActionResult updatePrescription(string referralID, List<OutgoingItem> newListRx, string consultID)
        {
            try
            {
                var medRx = dbMed.MedicalPrescriptions.SingleOrDefault(a => a.referralID == referralID);
                var existingRx = medRx == null ? null : dbMed.OutgoingItems.Where(a => a.rxID == medRx.rxID).ToArray();

                // If the new list of RX are empty, remove existing/old MedicalPrescription and OutgoingItems
                if (newListRx == null)
                {
                    dbMed.MedicalPrescriptions.Remove(medRx);
                    dbMed.OutgoingItems.RemoveRange(existingRx);
                }

                else
                {
                    var rxID = new IDgenerator(consultID);

                    //........  UPDATE MEDICAL PRESCRIPTION
                    if (medRx != null)
                    {
                        medRx.personnelID = Session["personnelID"].ToString();
                        medRx.dateTimeRx = DateTime.Now;
                        dbMed.Entry(medRx).State = EntityState.Modified;
                    }

                    else
                    {
                        MedicalPrescription mp = new MedicalPrescription();
                        mp.rxID = rxID.generateID.Substring(0, 15);
                        mp.serviceID = "SERVICE004";
                        mp.consultID = consultID;
                        mp.referralID = referralID;
                        mp.personnelID = Session["personnelID"].ToString();
                        mp.dateTimeRx = DateTime.Now;
                        dbMed.MedicalPrescriptions.Add(mp);
                    }
                    //........  /UPDATE MEDICAL PRESCRIPTION

                    //........  UPDATE OUTGOING
                    if (existingRx != null && existingRx.Length > 0)
                    {
                        foreach (var existRec in existingRx)
                        {
                            var existCounter = new OutgoingItem();

                            // Check if old medicine exist in the new medicine rx list
                            if (newListRx != null)
                                existCounter = Array.Find(newListRx.ToArray(), element => element.productCode == existRec.productCode);

                            // If old medicine does not exist anymore in the new medicine rx list
                            // then remove this medicine and its related data
                            if (existCounter == null)
                                dbMed.OutgoingItems.Remove(existRec);

                            else
                            {
                                // only update the record that is not yet released
                                if (existCounter.isRelease == false || existCounter.isRelease == null)
                                {
                                    existRec.qtyRx = existCounter.qtyRx;
                                    existRec.dosage = existCounter.dosage;
                                    existRec.perDay = existCounter.perDay;
                                    existRec.noDay = existCounter.noDay;
                                    dbMed.Entry(existRec).State = EntityState.Modified;
                                }
                            }
                        }
                    }

                    if (newListRx != null)
                    {
                        foreach (var newRx in newListRx)
                        {
                            bool isExistNewRx = false;

                            // Check if NEW medicine rx exist in the OLD medicine rx list
                            if (existingRx != null)
                                isExistNewRx = Array.Exists(existingRx, element => element.productCode == newRx.productCode);

                            // If new medicine rx does not exist in the old medicine rx list
                            // then Add this new medicine rx
                            if (!isExistNewRx)
                            {
                                var outID = new IDgenerator(medRx == null ? rxID.generateID.Substring(0, 15) : medRx.rxID);
                                newRx.outID = outID.generateID.Substring(0, 15);
                                newRx.rxID = medRx == null ? rxID.generateID.Substring(0, 15) : medRx.rxID;
                                dbMed.OutgoingItems.Add(newRx);
                            }
                        }
                    }
                    //........  /UPDATE OUTGOING
                }

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Medical Prescription is not updated!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Medical Prescription is successfully updated!" }, JsonRequestBehavior.AllowGet);
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
                var client = dbMed.fn_getRectalClients(date).OrderByDescending(x => x.diagnoseDT)
                            .Select(a => new {
                                mrhInfo = new {
                                    a.requestID,
                                    a.isDiagnoseDone,
                                    a.diagnoseDT,
                                    a.referralID,
                                    a.referredServiceID,
                                    a.consultID
                                },
                                personInfo = new
                                {
                                    a.birthDate,
                                    a.brgyPermAddress,
                                    a.citymunPermAddress,
                                    a.contactNo,
                                    a.EIC,
                                    a.extName,
                                    a.firstName,
                                    a.fullNameLast,
                                    a.idNO,
                                    a.lastName,
                                    a.middleName,
                                    a.provincePermAddress,
                                    a.qrCode,
                                    a.sex,
                                    a.shortDepartmentName
                                },
                                rectalInterview = new
                                {
                                    a.MRID,
                                    a.requestID,
                                    a.is1stDRE,
                                    a.DREfrequency,
                                    a.isProstateCancer,
                                    a.isAnyCancer,
                                    a.cancerName,
                                    a.isMedication,
                                    a.medicineName,
                                    a.diNauubos,
                                    a.kadalasUmihi,
                                    a.patigiltiglNaIhi,
                                    a.pagpigilNgIhi,
                                    a.mahinangDaloy,
                                    a.magpwersaNgIhi,
                                    a.besesGumising,
                                    a.sintomasNgIhi,
                                    a.nadarama
                                },
                                rectalDiagnosis = new
                                {
                                    a.MRDiagnosisID,
                                    a.PEfindings,
                                    a.abdomen,
                                    a.extGenita,
                                    a.DREsize,
                                    a.consistency,
                                    a.texture,
                                    a.mobility,
                                    a.lowbackPain,
                                    a.arthriticPain,
                                    a.rectalFinding,
                                    a.TRUS,
                                    a.PSA,
                                    a.transperrinealBiopsy,
                                    a.transrectalBiopsy,
                                    a.TRUSBiopsy,
                                    a.Remarks
                                },
                                physician = new
                                {
                                    a.personnel_firstName,
                                    a.personnel_midInit,
                                    a.personnel_lastName,
                                    a.personnel_extName,
                                    a.diagPersonID
                                }
                            }).ToList();

                return Json(client, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getLabByReferralID(string ReferralID)
        {
             try
            {
                var labs = dbMed.Referrals.Join(dbMed.LaboratoryExams, r => r.referralID, le => le.referralID, (r, le) => new { r, le })
                                         .Where(a => a.r.referralID == ReferralID)
                                         .Select(b => new
                                         {
                                             b.r.referralID,
                                             b.r.referredServiceID,
                                             b.r.consultID,
                                             b.le.labID,
                                             b.le.labTestID,
                                             b.le.otherLabDesc,
                                             b.le.isTested,
                                             b.le.isEncoded,
                                             b.le.dateEncoded,
                                             b.le.personnelID,
                                             b.le.dateTimeLog,
                                             b.le.xrayDesc,
                                             b.le.ultrasoundDesc,
                                             b.le.ecgDesc
                                         }).ToList();

                return Json(labs, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getRxByReferralID(string ReferralID)
        {
            try
            {
                var rx = dbMed.MedicalPrescriptions.Join(dbMed.OutgoingItems, mp => mp.rxID, oi => oi.rxID, (mp, oi) => new { mp, oi })
                                                     .Join(dbMed.ProductLists, r1 => r1.oi.productCode, pl => pl.productCode, (r1, pl) => new { r1, pl })
                                                     .Join(dbMed.Measurements, r2 => r2.pl.measurementID, m => m.measurementID, (r2, m) => new { r2, m })
                                                     .Join(dbMed.ProductUnits, r3 => r3.r2.pl.unitID, pu => pu.unitID, (r3, pu) => new { r3, pu })
                                                     .Where(a => a.r3.r2.r1.mp.referralID == ReferralID)
                                                     .Select(b => new
                                                     {
                                                         b.r3.r2.r1.mp.rxID,
                                                         b.r3.r2.r1.mp.serviceID,
                                                         b.r3.r2.r1.mp.consultID,
                                                         b.r3.r2.r1.mp.referralID,
                                                         b.r3.r2.r1.mp.personnelID,
                                                         b.r3.r2.r1.mp.dateTimeRx,
                                                         b.r3.r2.r1.oi.outID,
                                                         b.r3.r2.r1.oi.productCode,
                                                         b.r3.r2.r1.oi.qtyRx,
                                                         b.r3.r2.r1.oi.dosage,
                                                         b.r3.r2.r1.oi.perDay,
                                                         b.r3.r2.r1.oi.noDay,
                                                         b.r3.r2.r1.oi.isRelease,
                                                         b.r3.r2.r1.oi.qtyReleased,
                                                         b.r3.r2.r1.oi.dateTimeReleased,
                                                         b.r3.r2.r1.oi.userIDreleased,
                                                         b.r3.r2.pl.productDesc,
                                                         b.r3.r2.pl.measurementID,
                                                         b.r3.r2.pl.unitID,
                                                         b.r3.m.measurementDesc,
                                                         b.pu.unitDesc
                                                     }).ToList();

                return Json(rx, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}