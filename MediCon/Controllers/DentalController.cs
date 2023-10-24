using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using MediCon.Models;
using System.Net.NetworkInformation;
using System.Net;
using System.Net.Sockets;
using MediCon.ModelTemp;
using System.Data.Entity;
using MediCon.Classes;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class DentalController : Controller
    {
        MediconEntities db = new MediconEntities();
        EQPEntities eqpDB = new EQPEntities();
        HRISDBEntities hrisDB = new HRISDBEntities();
        Guid guid;

        [UserAccess]
        // GET: Dental
        public ActionResult OralExam()
        {
            return View();
        }

        [UserAccess]
        public ActionResult ToothExtraction()
        {
            return View();
        }   


        [HttpPost]
        public ActionResult getDentalPersonnel()
        {
            try
            {
                var personnel = db.Personnels.Where(a => a.serviceID == "SERVICE002" && a.userTypeID == "3").OrderByDescending(d => d.personnel_lastName).ThenBy(e => e.personnel_firstName).ToList();
                return Json(personnel, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve dental personnel", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);            
            }
        }


        [HttpPost]
        public ActionResult saveDentalDiagnosis(string[] checkedDiagnosis, Consultation detail, string dentistID, string otherDiag)
        {
            try
            {
                var date = new CurrentDateTime();

                var countRecord = db.Consultations.FirstOrDefault(a => a.vSignID == detail.vSignID && a.serviceID == "SRV0022"
                                                   && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT);

                if (countRecord != null)
                {
                    return Json(new { status = "error", msg = "Patient is not yet screen (Vital Signs) for today!" }, JsonRequestBehavior.AllowGet);
                }

                else
                {
                    //......  SAVE DATA IN CONSULATIONSURGERY TABLE
                    guid = Guid.NewGuid();
                    detail.consultID = "DEN" + guid.ToString().Substring(0, 8) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                    detail.consultID = detail.consultID.Length > 15 ? detail.consultID.Substring(0, 15) : detail.consultID;
                    detail.toothNum = detail.toothNum != null ? detail.toothNum : null;
                    detail.remarks = detail.remarks != null ? detail.remarks : null;
                    detail.dentistID = dentistID != null ? dentistID : null;                    // SAVE DENTIST PERSONNEL ID ONLY TO DIAG049 - TOOTH EXTRACTION DIAGNOSIS
                    detail.outsideReferral = detail.outsideReferral != null ? detail.outsideReferral : null;
                    detail.personnelID = Session["personnelID"].ToString();         // ENCODER OF DATA
                    detail.dateTimeLog = DateTime.Now;
                    detail.serviceID = "SERVICE002";
                    db.Consultations.Add(detail);
                    //......  /SAVE DATA IN CONSULATIONSURGERY TABLE

                    //......  SAVE DATA IN RESULT DIAGNOSIS TABLE
                    if (checkedDiagnosis != null)
                    {
                        var arrList = checkedDiagnosis.ToList();

                        if (detail.outsideReferral != null && detail.outsideReferral != "")
                        {
                            arrList.Add("DIAG024");
                            arrList = arrList.ToList();
                        }

                        foreach (var item in arrList)
                        {
                            guid = Guid.NewGuid();
                            ResultDiagnosi RS = new ResultDiagnosi();
                            RS.resultID = "RS" + guid.ToString().Substring(0, 8) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                            RS.resultID = RS.resultID.Length > 15 ? RS.resultID.Substring(0, 15) : RS.resultID;
                            RS.diagnoseID = item;
                            RS.otherDiagnosis = item == "DIAG023" ? otherDiag : null;
                            //RS.referDesc = item == "DIAG024" ? detail.referDesc : null;
                                       // SAVE TOOTH NUM ONLY TO DIAG049 - TOOTH EXTRACTION DIAGNOSIS
                            RS.consultID = detail.consultID;
                            db.ResultDiagnosis.Add(RS);
                        }
                        //......  /SAVE DATA IN RESULT DIAGNOSIS TABLE
                    }

                    var affectedRow = db.SaveChanges();

                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Diagnosis is not saved!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { result = detail.consultID, status = "success", msg = "Diagnosis is successfully saved!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult updateDentalDiagnosis(string[] checkedDiagnosis, Consultation detail, string otherDiag)
        {
            try
            {
                var date = new CurrentDateTime();

                var findRec = db.Consultations.Find(detail.consultID);

                findRec.outsideReferral = detail.outsideReferral;
                findRec.remarks = detail.remarks;
                findRec.toothNum = detail.toothNum;
                findRec.dentistID = detail.dentistID;
                db.Entry(findRec).State = EntityState.Modified;

                // REMOVE EXISTING LIST OF RESULT DIAGNOSIS DATA
                var resultDiag = db.ResultDiagnosis.Where(a => a.consultID == detail.consultID);
                if (resultDiag != null) { db.ResultDiagnosis.RemoveRange(resultDiag); }

                // ADD THE UPDATED DATA FOR RESULT DIAGNOSIS
                    if (checkedDiagnosis != null)
                    {
                        var arrList = checkedDiagnosis.ToList();

                        if (detail.outsideReferral != null && detail.outsideReferral != "")
                        {
                            arrList.Add("DIAG024");
                            arrList = arrList.ToList();
                        }

                        foreach (var item in arrList)
                        {
                            guid = Guid.NewGuid();
                            ResultDiagnosi RS = new ResultDiagnosi();
                            RS.resultID = "RS" + guid.ToString().Substring(0, 8) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                            RS.resultID = RS.resultID.Length > 15 ? RS.resultID.Substring(0, 15) : RS.resultID;
                            RS.diagnoseID = item;
                            RS.otherDiagnosis = item == "DIAG023" ? otherDiag : null;
                            RS.consultID = detail.consultID;
                            db.ResultDiagnosis.Add(RS);
                        }
                        //......  /SAVE DATA IN RESULT DIAGNOSIS TABLE
                    }

                    var affectedRow = db.SaveChanges();

                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Diagnosis is not updated!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { result = detail.consultID, status = "success", msg = "Diagnosis is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }


        [HttpPost]
        public ActionResult getMedicineList()
        {
            try
            {
                var medList = db.ProductLists.Select(a => new
                { 
                    a.productCode,
                    a.productDesc,
                    measurementDesc = db.Measurements.FirstOrDefault(m => m.measurementID == a.measurementID).measurementDesc,
                    unitDesc = db.ProductUnits.FirstOrDefault(pu => pu.unitID == a.unitID).unitDesc
                });
              
                return Json(medList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public class listPrescription
        {
            public string productCode { get; set; }
            public string productDesc { get; set; }
            public int qtyRx { get; set; }
            public int dosage { get; set; }
            public string noDays { get; set; }
            public int perDay { get; set; }
        }

        [HttpPost]
        public ActionResult updatePrescription(string consultID, List<OutgoingItem> newListRx)
        {
            try
            {
                var medRx = db.MedicalPrescriptions.SingleOrDefault(a => a.consultID == consultID);
                var existingRx = medRx == null ? null : db.OutgoingItems.Where(a => a.rxID == medRx.rxID).ToArray();

                // If the new list of RX are empty, remove existing/old MedicalPrescription and OutgoingItems
                if (newListRx == null)
                {
                    db.MedicalPrescriptions.Remove(medRx);
                    db.OutgoingItems.RemoveRange(existingRx);
                }

                else
                {
                    var rxID = new IDgenerator(consultID);

                    //........  UPDATE MEDICAL PRESCRIPTION
                    if (medRx != null)
                    {
                        medRx.personnelID = Session["userTypeID"].ToString() == "1" ? medRx.personnelID : Session["personnelID"].ToString();
                        medRx.dateTimeRx = DateTime.Now;
                        db.Entry(medRx).State = EntityState.Modified;
                    }

                    else
                    {
                        MedicalPrescription mp = new MedicalPrescription();
                        mp.rxID = rxID.generateID.Substring(0, 15);
                        mp.serviceID = "SERVICE002";
                        mp.consultID = consultID;
                        mp.referralID = null;
                        mp.personnelID = Session["personnelID"].ToString();
                        mp.dateTimeRx = DateTime.Now;
                        db.MedicalPrescriptions.Add(mp);
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
                                db.OutgoingItems.Remove(existRec);

                            else
                            {
                                // only update the record that is not yet released
                                if (existCounter.isRelease == false || existCounter.isRelease == null)
                                {
                                    existRec.qtyRx = existCounter.qtyRx;
                                    existRec.dosage = existCounter.dosage;
                                    existRec.perDay = existCounter.perDay;
                                    existRec.noDay = existCounter.noDay;
                                    db.Entry(existRec).State = EntityState.Modified;
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
                                db.OutgoingItems.Add(newRx);
                            }
                        }
                    }
                    //........  /UPDATE OUTGOING
                }

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Medical Prescription failed to update!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Medical Prescription is successfully updated!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving the prescription.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult savePrescription_Dental(string consultID, List<listPrescription> listRx)
        {
            try
            {
                MedicalPrescription MP = new MedicalPrescription();
                MP.rxID = "RX" + guid.ToString().Substring(9, 4) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                MP.rxID = MP.rxID.Length > 15 ? MP.rxID.Substring(0, 15) : MP.rxID;
                MP.serviceID = "SERVICE002";
                MP.consultID = consultID;
                MP.dateTimeRx = DateTime.Now;
                MP.personnelID = Session["personnelID"].ToString();
                db.MedicalPrescriptions.Add(MP);
                
                foreach (var item in listRx)
                {
                    guid = Guid.NewGuid();
                    OutgoingItem OI = new OutgoingItem();
                    OI.outID = "OUT" + guid.ToString().Substring(0, 8) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                    OI.outID = OI.outID.Length > 15 ? OI.outID.Substring(0, 15) : OI.outID;
                    OI.productCode = item.productCode;
                    OI.rxID = MP.rxID;
                    OI.qtyRx = item.qtyRx;
                    OI.dosage = item.dosage;
                    OI.perDay = item.perDay;
                    OI.noDay = item.noDays;
                    OI.isRelease = false;
                    db.OutgoingItems.Add(OI);
                   
                }

                var affectedRow = db.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Medical Prescription is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Medical Prescription is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult getDiagnosis(string vitalSignID)
        {
            try
            {
                var consultID = db.Consultations.SingleOrDefault(a => a.vSignID == vitalSignID).consultID;

                var diagList = db.Consultations.Join(db.ResultDiagnosis, con => con.consultID, res => res.consultID, (con, res) => new { con, res })
                                           .Join(db.Diagnosis, conres => conres.res.diagnoseID, diag => diag.diagnoseID, (conres, diag) => new { conres, diag })
                                           .Join(db.Personnels, p => p.conres.con.dentistID, pp => pp.personnelID, (p, pp) => new { p, pp })
                                           .Where(w => w.p.conres.con.vSignID == vitalSignID && w.p.conres.con.serviceID == "SERVICE002")
                                           .Select(s => new
                                           {
                                               s.p.conres.con.vSignID,
                                               s.p.conres.con.consultID,
                                               s.p.conres.con.outsideReferral,
                                               s.p.conres.con.remarks,
                                               s.p.conres.con.toothNum,
                                               s.p.conres.con.personnelID,
                                               s.p.conres.con.serviceID,
                                               s.pp.personnel_firstName,
                                               s.pp.personnel_midInit,
                                               s.pp.personnel_lastName,
                                               s.pp.personnel_extName,
                                               s.p.conres.con.dateTimeLog,
                                               s.p.diag.diagnoseName,
                                           }).ToList();

                return Json(new { consultID = consultID, diagList = diagList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        //.......       LIST OF DENTAL CLIENT
        [HttpPost]
        public ActionResult getClientList(string date)
        {
            try
            {
                DateTime dateStart = DateTime.Parse(date);
                DateTime dateEnd = DateTime.Parse(date + " 23:59:59");

                var result = db.VitalSigns.Join(db.Consultations, r1 => r1.vSignID, con => con.vSignID, (r1, con) => new { r1, con })
                                               .Where(a => a.con.serviceID == "SERVICE002" && a.con.dateTimeLog >= dateStart && a.con.dateTimeLog <= dateEnd)
                                               .Select(b => new
                                               {
                                                   b.r1.qrCode,
                                                   b.con.consultID,
                                                   b.con.outsideReferral,
                                                   b.con.remarks,
                                                   b.con.serviceID,
                                                   b.con.toothNum,
                                                   b.con.dateTimeLog,
                                                   b.con.dentistID,
                                                   Dentist = db.Personnels.Where(den => den.personnelID == b.con.dentistID).Select(person => new {
                                                       DrLastName = person.personnel_lastName,
                                                       DrFirstName = person.personnel_firstName,
                                                       DrMiddleName = person.personnel_midInit,
                                                       DrExtName = person.personnel_extName,
                                                   }),
                                                   diagnosis = db.ResultDiagnosis.Join(db.Diagnosis, rd => rd.diagnoseID, dg => dg.diagnoseID, (rd, dg) => new { rd, dg })
                                                   .Where(c => c.rd.consultID == b.con.consultID).Select(d => new
                                                   {
                                                       d.rd.diagnoseID,
                                                       d.dg.diagnoseName,
                                                       d.rd.otherDiagnosis,
                                                       d.rd.resultID
                                                   }).ToList()
                                               }).ToList();

                var joined = result.Join(hrisDB.vEmployeeHealthWells, r => r.qrCode, pi => pi.qrCode, (r, pi) => new { r, pi })
                                    .Select(a => new
                                    {
                                        a.r.qrCode,
                                        a.r.consultID,
                                        a.r.outsideReferral,
                                        a.r.remarks,
                                        a.r.serviceID,
                                        a.r.toothNum,
                                        a.r.dentistID,
                                        a.r.Dentist,
                                        a.pi.lastName,
                                        a.pi.firstName,
                                        a.pi.middleName,
                                        a.pi.extName,
                                        a.pi.sex,
                                        a.pi.birthDate,
                                        a.pi.contactNo,
                                        a.pi.brgyPermAddress,
                                        a.pi.cityMunPermAddress,
                                        a.pi.provincePermAddress,
                                        a.r.dateTimeLog,
                                        a.r.diagnosis
                                    }).OrderByDescending(b => b.dateTimeLog).ToList();

                var serializer = new JavaScriptSerializer();
                serializer.MaxJsonLength = Int32.MaxValue;

                var content = new ContentResult
                {
                    Content = serializer.Serialize(joined),
                    ContentType = "application/json"

                };
                return content;
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve list of clients.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
                //return new HttpStatusCodeResult(HttpStatusCode.BadRequest, ex.InnerException.Message);
            }
        }

        [HttpPost]
        public ActionResult getClientRx(string consultID)
        {
            try
            {
                var rxList = db.MedicalPrescriptions.Join(db.Personnels, mp => mp.personnelID, p => p.personnelID, (mp, p) => new { mp, p })
                                                    .Where(a => a.mp.consultID == consultID)
                                                    .Select(b => new
                                                    {
                                                        b.mp.rxID,
                                                        b.mp.personnelID,
                                                        b.mp.dateTimeRx,
                                                        b.p.personnel_extName,
                                                        b.p.personnel_firstName,
                                                        b.p.personnel_lastName,
                                                        b.p.personnel_midInit,
                                                        rx = db.OutgoingItems.Join(db.ProductLists, oi => oi.productCode, pl => pl.productCode, (oi, pl) => new { oi, pl })
                                                                             .Join(db.Measurements, r1 => r1.pl.measurementID, m => m.measurementID, (r1, m) => new { r1, m })
                                                                             .Join(db.ProductUnits, r2 => r2.r1.pl.unitID, pu => pu.unitID, (r2, pu) => new { r2, pu })
                                                                             .Where(rx => rx.r2.r1.oi.rxID == b.mp.rxID)
                                                                             .Select(item => new
                                                                             {
                                                                                 item.r2.r1.oi.outID,
                                                                                 item.r2.r1.oi.productCode,
                                                                                 item.r2.r1.oi.qtyRx,
                                                                                 item.r2.r1.oi.dosage,
                                                                                 item.r2.r1.oi.perDay,
                                                                                 item.r2.r1.oi.noDay,
                                                                                 item.r2.r1.pl.productDesc,
                                                                                 item.r2.r1.pl.measurementID,
                                                                                 item.r2.r1.pl.unitID,
                                                                                 item.r2.m.measurementDesc,
                                                                                 item.pu.unitDesc
                                                                             }).ToList()
                                                    }).ToList();
                return Json(rxList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult getRxList(string consultID)
        {
            try
            {
                var rxList = db.MedicalPrescriptions.Join(db.OutgoingItems, mp => mp.rxID, oi => oi.rxID, (mp, oi) => new { mp, oi })
                                                .Join(db.ProductLists, r1 => r1.oi.productCode, pl => pl.productCode, (r1, pl) => new { r1, pl })
                                                .Join(db.Measurements, r2 => r2.pl.measurementID, m => m.measurementID, (r2, m) => new { r2, m })
                                                .Join(db.ProductUnits, r3 => r3.r2.pl.unitID, pu => pu.unitID, (r3, pu) => new { r3, pu })
                                                .Where(a => a.r3.r2.r1.mp.consultID == consultID)
                                                .Select(b => new
                                                {
                                                    b.pu.unitID,
                                                    b.pu.unitDesc,
                                                    b.r3.m.measurementID,
                                                    b.r3.m.measurementDesc,
                                                    b.r3.r2.pl.productCode,
                                                    b.r3.r2.pl.productDesc,
                                                    b.r3.r2.r1.oi.dosage,
                                                    b.r3.r2.r1.oi.noDay,
                                                    b.r3.r2.r1.oi.outID,
                                                    b.r3.r2.r1.oi.perDay,
                                                    b.r3.r2.r1.oi.qtyRx,
                                                    b.r3.r2.r1.oi.rxID
                                                }).ToList();

                return Json(rxList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}