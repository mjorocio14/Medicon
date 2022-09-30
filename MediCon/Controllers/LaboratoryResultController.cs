using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Net;
using System.Data.Entity;
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
        public ActionResult saveBloodChemResult(BloodChem result)
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
                    // SAVE LAB RESULT OF BLOOD CHEM
                    result.bloodChemID = generateID(result.labID).Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.BloodChems.Add(result);

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
        public ActionResult saveCBC(CBC result)
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
                    // SAVE LAB RESULT OF BLOOD CHEM
                    result.cbcID = generateID(result.labID).Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.CBCs.Add(result);

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
        

        public ActionResult editCBC([Bind(Exclude = "dateTimeLog,dateEdited")] CBC result, EditRemark EditRemarks)
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
                    data.signatory1 = result.signatory1;
                    data.signatory2 = result.signatory2;
                    dbMed.Entry(data).State = EntityState.Modified;


                    var edited = new EditRemark();
                    string temp = Convert.ToString(DateTime.Now);
                    edited.editID = generateID(temp).Substring(0, 15);
                    edited.labID = data.labID;
                    edited.remarks = EditRemarks.remarks;
                    edited.dateEdited = DateTime.Now;
                    edited.editedBy = Session["personnelID"].ToString();
                    dbMed.EditRemarks.Add(edited);




                    dbMed.SaveChanges();
                }
                return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }
        public ActionResult saveUrinalysis(Urinalysi result)
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
                    // SAVE LAB RESULT OF BLOOD CHEM
                    result.urinalysisID = generateID(result.labID).Substring(0, 15);
                    result.dateTimeLog = DateTime.Now;
                    result.personnelID = Session["personnelID"].ToString();
                    dbMed.Urinalysis.Add(result);

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

        public string generateID(string source)
        {
            return string.Format("{1:N}", source, Guid.NewGuid());
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
                var lab = dbMed.fn_getLabResult().OrderBy(x => x.lastName).ThenBy(y => y.firstName).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data." }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult getCBCresult(string labID)
        {
            var data = dbMed.CBCs.Where(e => e.labID == labID).FirstOrDefault();
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        public ActionResult getUrinalysisResult(string labID)
        {
            var data = dbMed.Urinalysis.Where(e => e.labID == labID).FirstOrDefault();
            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}