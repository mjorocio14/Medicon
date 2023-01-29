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

namespace MediCon.Controllers
{
    public class DentalController : Controller
    {
        MediconEntities db = new MediconEntities();
        Guid guid;

        // GET: Dental
        public ActionResult OralExam()
        {
            return View();
        }

        public ActionResult ToothExtraction()
        {
            return View();
        }   



        [HttpPost]
        public ActionResult getDentalPersonnel()
        {
            try
            {
                var personnel = db.Personnels.Where(a => a.position == "DENTIST").OrderByDescending(d => d.personnel_lastName).ThenBy(e => e.personnel_firstName).ToList();
                return Json(personnel, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve dental personnel", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);            
            }
        }


        [HttpPost]
        public ActionResult saveDentalDiagnosis(string[] checkedDiagnosis, Consultation detail, string personnelID, string otherDiag)
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
                    detail.personnelID = personnelID != null ? personnelID : null;                    // SAVE DENTIST PERSONNEL ID ONLY TO DIAG049 - TOOTH EXTRACTION DIAGNOSIS
                    detail.outsideReferral = detail.outsideReferral != null ? detail.outsideReferral : null;
                    detail.dateTimeLog = DateTime.Now;
                    detail.serviceID = "dental";
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
        public ActionResult savePrescription_Dental(string consultID, List<listPrescription> listRx)
        {
            try
            {
                MedicalPrescription MP = new MedicalPrescription();
                MP.rxID = "RX" + guid.ToString().Substring(9, 4) + (DateTime.Now.GetHashCode() < 0 ? (DateTime.Now.GetHashCode() * -1) : DateTime.Now.GetHashCode());
                MP.rxID = MP.rxID.Length > 15 ? MP.rxID.Substring(0, 15) : MP.rxID;
                MP.serviceID = "DENTAL";
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
                var diagList = db.Consultations.Join(db.ResultDiagnosis, con => con.consultID, res => res.consultID, (con, res) => new { con, res })
                                           .Join(db.Diagnosis, conres => conres.res.diagnoseID, diag => diag.diagnoseID, (conres, diag) => new { conres, diag })
                                           .Join(db.Personnels, p => p.conres.con.personnelID, pp => pp.personnelID, (p, pp) => new { p, pp })
                                           .Where(w => w.p.conres.con.vSignID == vitalSignID)
                                           .Select(s => new
                                           {
                                               s.p.conres.con.vSignID,
                                               s.p.conres.con.consultID,
                                               s.p.conres.con.outsideReferral,
                                               s.p.conres.con.remarks,
                                               s.p.conres.con.toothNum,
                                               s.p.conres.con.personnelID,
                                               s.pp.personnel_firstName,
                                               s.pp.personnel_midInit,
                                               s.pp.personnel_lastName,
                                               s.pp.personnel_extName,
                                               s.p.conres.con.dateTimeLog,
                                               s.p.diag.diagnoseName
                                           }).ToList();

                return Json(diagList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}