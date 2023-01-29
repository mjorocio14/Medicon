using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Data.Entity;
using MediCon.ModelTemp;
using MediCon.Classes;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class LaboratoryResultController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // GET: LaboratoryResult
        public ActionResult Encoding()
        {
            return View();
        }

        public ActionResult saveBloodChemResult(List<BloodChem> result, string medTech, string pathologist, bool isUpdating)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }

                else
                {
                    foreach (var item in result)
                    {
                        if (isUpdating)
                        {
                            var findBC = dbMed.BloodChems.SingleOrDefault(a => a.bloodChemID == item.bloodChemID);
                            findBC.LabTestGroupID = item.LabTestGroupID;
                            findBC.result = item.result;
                            dbMed.Entry(findBC).State = EntityState.Modified;

                            var labRec = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == item.labID);
                            labRec.medtech = medTech;
                            labRec.pathologist = pathologist;
                        }

                        else
                        {
                            var bcID = new IDgenerator(item.labID);

                            // SAVE LAB RESULT OF BLOOD CHEM
                            item.bloodChemID = bcID.generateID.Substring(0, 15);
                            item.dateTimeLog = DateTime.Now;
                            item.personnelID = Session["personnelID"].ToString();
                            dbMed.BloodChems.Add(item);

                            // SAVE TAGGING OF TRUE TO ISENCODED FIELD (LABORATORY EXAM)
                            var findLab = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == item.labID);
                            findLab.isEncoded = true;
                            findLab.medtech = medTech;
                            findLab.pathologist = pathologist;
                            findLab.dateEncoded = DateTime.Now;
                            dbMed.Entry(findLab).State = EntityState.Modified;
                        }
                    }

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        public ActionResult saveCBC(CBC result, string medTech, string pathologist)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }
                else
                {
                    var cbcID = new IDgenerator(result.labID);

                    // SAVE LAB RESULT OF BLOOD CHEM
                    result.cbcID = cbcID.generateID.Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.CBCs.Add(result);

                    // SAVE TAGGING OF TRUE TO ISENCODED FIELD (LABORATORY EXAM)
                    var findLab = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLab.isEncoded = true;
                    findLab.medtech = medTech;
                    findLab.pathologist = pathologist;
                    findLab.dateEncoded = DateTime.Now;
                    dbMed.Entry(findLab).State = EntityState.Modified;

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        public ActionResult editCBC([Bind(Exclude = "dateTimeLog,dateEdited")] CBC result, EditRemarks EditRemarks, string medTech, string pathologist)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }
                else
                {

                    var data = dbMed.CBCs.Where(e => e.labID == result.labID).FirstOrDefault();

                    data.wbc = result.wbc;
                    data.neu = result.neu;
                    data.lym = result.lym;
                    data.mon = result.mon;
                    data.eos = result.eos;
                    data.bas = result.bas;
                    data.rbc = result.rbc;
                    data.hgb = result.hgb;
                    data.hct = result.hct;
                    data.mcv = result.mcv;
                    data.mch = result.mch;
                    data.plt = result.plt;
                    dbMed.Entry(data).State = EntityState.Modified;

                    
                    var edited = new EditRemark();
                    string temp = Convert.ToString(DateTime.Now);
                    var editID = new IDgenerator(temp);

                    edited.editID = editID.generateID.Substring(0, 15);
                    edited.labID = data.labID;
                    edited.remarks = EditRemarks.remarks;
                    edited.dateEdited = DateTime.Now;
                    edited.editedBy = Session["personnelID"].ToString();
                    dbMed.EditRemarks.Add(edited);

                    var findLabExam = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLabExam.medtech = medTech;
                    findLabExam.pathologist = pathologist;
                    dbMed.Entry(findLabExam).State = EntityState.Modified;

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        public ActionResult editUrinalysis([Bind(Exclude = "dateTimeLog,dateEdited")] Urinalysi result, EditRemarks EditRemarks, string medTech, string pathologist)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }
                else
                {

                    var data = dbMed.Urinalysis.Where(e => e.labID == result.labID).FirstOrDefault();

                    data.albumin = result.albumin;
                    data.amourphousPhospates = result.amourphousPhospates;
                    data.amourphousUrates = result.amourphousUrates;
                    data.bacteria = result.bacteria;
                    data.calciumOxalates = result.calciumOxalates;
                    data.coarseGranular = result.coarseGranular;
                    data.color = result.color;
                    data.epithelialCells = result.epithelialCells;
                    data.fineGranular = result.fineGranular;
                    data.hyaline = result.hyaline;
                    data.mucusThread = result.mucusThread;
                    data.others = result.others;
                    data.pregnancyTest = result.pregnancyTest;
                    data.pusCells = result.pusCells;
                    data.pusCellsCast = result.pusCellsCast;
                    data.rbcCast = result.rbcCast;
                    data.rbcCells = result.rbcCells;
                    data.reaction = result.reaction;
                    data.renalCells = result.renalCells;
                    data.spGravity = result.spGravity;
                    data.sugar = result.sugar;
                    data.transparency = result.transparency;
                    data.triplePhospates = result.triplePhospates;
                    data.uricAcid = result.uricAcid;
                    data.waxyCast = result.waxyCast;
                    data.yeastCells = result.yeastCells;
                    dbMed.Entry(data).State = EntityState.Modified;

                    var edited = new EditRemark();
                    string temp = Convert.ToString(DateTime.Now);
                    var editID = new IDgenerator(temp);

                    edited.editID = editID.generateID.Substring(0, 15);
                    edited.labID = data.labID;
                    edited.remarks = EditRemarks.remarks;
                    edited.dateEdited = DateTime.Now;
                    edited.editedBy = Session["personnelID"].ToString();
                    dbMed.EditRemarks.Add(edited);

                    var findLabExam = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLabExam.medtech = medTech;
                    findLabExam.pathologist = pathologist;
                    dbMed.Entry(findLabExam).State = EntityState.Modified;

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        public ActionResult saveUrinalysis(Urinalysi result, string medTech, string pathologist)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }
                else
                {
                    var urinalysisID = new IDgenerator(result.labID);

                    // SAVE LAB RESULT OF BLOOD CHEM
                    result.urinalysisID = urinalysisID.generateID.Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.Urinalysis.Add(result);

                    // SAVE TAGGING OF TRUE TO ISENCODED FIELD (LABORATORY EXAM)
                    var findLab = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLab.isEncoded = true;
                    findLab.medtech = medTech;
                    findLab.pathologist = pathologist;
                    findLab.dateEncoded = DateTime.Now;
                    dbMed.Entry(findLab).State = EntityState.Modified;

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        [HttpPost]
        public ActionResult saveECG(ECG result)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var temp = string.Join(" | ", ModelState.Values
                     .SelectMany(v => v.Errors)
                     .Select(e => e.ErrorMessage));
                    return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Model State Not Valid" + temp);
                }
                else
                {
                    var ecgID = new IDgenerator(result.labID);

                    // SAVE LAB RESULT OF FECALYSIS
                    result.ECGID = ecgID.generateID.Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.ECGs.Add(result);

                    // SAVE TAGGING OF TRUE TO ISENCODED FIELD (LABORATORY EXAM)
                    var findLab = dbMed.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLab.isEncoded = true;
                    findLab.dateEncoded = DateTime.Now;
                    dbMed.Entry(findLab).State = EntityState.Modified;

                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }
        
        public ActionResult getSpecialist()
        {
            var userList = dbMed.Personnels.Where(x => x.userTypeID == "3").Select(a => new
            {
                a.personnel_firstName,
                a.personnel_midInit,
                a.personnel_lastName,
                a.personnel_extName,
                fullname = a.personnel_firstName + " " + (string.IsNullOrEmpty(a.personnel_midInit) ? "" : (a.personnel_midInit + ". ")) + a.personnel_lastName + " " + (string.IsNullOrEmpty(a.personnel_extName) ? "" : (a.personnel_extName + ". "))+(string.IsNullOrEmpty(a.title) ? "" : (a.title)), 
                a.isActive,
                a.password,
                a.personnelID,
                a.position,
                a.userTypeID,
                a.username,
                a.sex,
                a.contactNum,
                a.licenseNo,
                a.title,
                userDesc = dbMed.UserTypes.FirstOrDefault(b => b.userTypeID == a.userTypeID).userTypeDesc
            }).ToList();
            return Json(userList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getPatientList()
        {
            try
            {
                var lab = dbMed.fn_getLabResult().OrderByDescending(x => x.encodeDT).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getBloodChem(string labID)
        {
            var data = dbMed.BloodChems.Where(e => e.labID == labID)
                        .Select(a => new { 
                            a.bloodChemID,
                            a.LabTestGroupID,
                            a.result,
                            labTestName = dbMed.LaboratoryGroupTests.FirstOrDefault(b => b.LabTestGroupID == a.LabTestGroupID).LabTestGroupDesc,
                            labTestID = dbMed.LaboratoryExams.FirstOrDefault(x => x.labID == labID).labTestID,
                            medtech = dbMed.LaboratoryExams.FirstOrDefault(b => b.labID == labID).medtech,
                            pathologist = dbMed.LaboratoryExams.FirstOrDefault(c => c.labID == labID).pathologist
                        });
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getCBCresult(string labID)
        {
            var data = dbMed.CBCs.Where(e => e.labID == labID).Select(a => new { 
                                         a.bas,
                                         a.cbcID,
                                         a.dateTimeLog,
                                         a.eos,
                                         a.hct,
                                         a.hgb,
                                         a.labID,
                                         a.lym,
                                         a.mch,
                                         a.mchc,
                                         a.mcv,
                                         a.mon,
                                         a.neu,
                                         a.personnelID,
                                         a.plt,
                                         a.rbc,
                                         a.recNO,
                                         a.wbc,
                                         medtech = dbMed.LaboratoryExams.FirstOrDefault(b => b.labID == labID).medtech,
                                         pathologist = dbMed.LaboratoryExams.FirstOrDefault(c => c.labID == labID).pathologist
                                    });
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getUrinalysisResult(string labID)
        {
            var data = dbMed.Urinalysis.Where(e => e.labID == labID).Select(a => new { 
                                            a.albumin,
                                            a.amourphousPhospates,
                                            a.amourphousUrates,
                                            a.bacteria,
                                            a.calciumOxalates,
                                            a.coarseGranular,
                                            a.color,
                                            a.dateTimeLog,
                                            a.epithelialCells,
                                            a.fineGranular,
                                            a.hyaline,
                                            a.labID,
                                            a.mucusThread,
                                            a.others,
                                            a.personnelID,
                                            a.pregnancyTest,
                                            a.pusCells,
                                            a.pusCellsCast,
                                            a.rbcCast,
                                            a.rbcCells,
                                            a.reaction,
                                            a.recNo,
                                            a.renalCells,
                                            a.spGravity,
                                            a.sugar,
                                            a.transparency,
                                            a.triplePhospates,
                                            a.uricAcid,
                                            a.urinalysisID,
                                            a.waxyCast,
                                            a.yeastCells,
                                            medtech = dbMed.LaboratoryExams.FirstOrDefault(b => b.labID == labID).medtech,
                                            pathologist = dbMed.LaboratoryExams.FirstOrDefault(c => c.labID == labID).pathologist
                                        });
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        
        public ActionResult getBunGlycosylated(string labID)
        {
            var data = dbMed.BloodChems.SingleOrDefault(e => e.labID == labID);
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getECGResult(string labID)
        {
            var data = dbMed.ECGs.SingleOrDefault(e => e.labID == labID);
            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}