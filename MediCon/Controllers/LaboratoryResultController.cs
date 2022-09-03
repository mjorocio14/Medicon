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
        MediconEntities db = new MediconEntities();

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
                    db.BloodChems.Add(result);

                    // SAVE TAGGING OF TRUE TO ISENCODED FIELD (LABORATORY EXAM)
                    var findLab = db.LaboratoryExams.SingleOrDefault(a => a.labID == result.labID);
                    findLab.isEncoded = true;
                    db.Entry(findLab).State = EntityState.Modified;

                    db.SaveChanges();
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
    }
}