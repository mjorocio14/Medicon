using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Net;
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
                    using (MediconEntities dbb = new MediconEntities())
                    {
                        var data = new BloodChem();
                        data.bloodChemID=generateID(result.labID).Substring(0, 15);
                        data.labID = result.labID;
                        data.fbs = result.fbs;
                        data.serumUricAcid = result.serumUricAcid;
                        data.creatinine = result.creatinine;
                        data.cholesterol = result.cholesterol;
                        data.triglycerides = result.triglycerides;
                        data.hdl = result.hdl;
                        data.ldl = result.ldl;
                        data.vldl = result.vldl;
                        data.sgpt = result.sgpt;
                        data.sgot = result.sgot;
                        data.bun = result.bun;
                        data.potassium = result.potassium;
                        data.sodium = result.sodium;
                        data.chloride = result.chloride;
                        data.calcium = result.calcium;
                        data.glycosylatedHemoglobin = result.glycosylatedHemoglobin;
                        data.dateTimeLog = DateTime.Now;
                        data.personnelID = Session["personnelID"].ToString();
                        dbb.BloodChems.Add(data);
                        dbb.SaveChanges();
                    }
                    return new HttpStatusCodeResult(HttpStatusCode.OK, "Successfully Save");
                }
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