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
using System.IO;
using Microsoft.Owin;
using System.Drawing;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class LaboratoryResultController : Controller
    {
        MediconEntities dbMed = new MediconEntities();
        //private string fileuploadDir = @"D:\DavNor Health & Wellness\LaboratoryResults\";
        private string fileuploadDir = @"C:\Users\LOG1C\Documents\LOG1C Files\System Development\Project Files\ASP.NET Projects\MediCon Sample Lab\";

        [UserAccess]
        // GET: LaboratoryResult
        public ActionResult Encoding()
        {
            return View();
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

        public ActionResult getPatientList(DateTime date)
        {
            try
            {
                var lab = dbMed.fn_getLabResult(date).OrderByDescending(x => x.encodeDT).ToList();

                return Json(lab, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpPost]
        public ActionResult saveScannedLab(string qrCode, string labID, string file)
        {
            try
            {
                if (file != null)
                {
                    string fileDir = fileuploadDir + qrCode + "\\";

                    if (!Directory.Exists(fileDir))
                        Directory.CreateDirectory(fileDir);

                    // Check and count if file exist
                    DirectoryInfo di = new DirectoryInfo(fileDir);
                    var fileCount = di.EnumerateFiles(labID + "*").Count();

                    if(fileCount > 0)
                    {
                        var randomID = new IDgenerator(labID);
                        labID = labID + "_" + randomID.generateID.Substring(0, 4);
                    }

                    var fileData = file.Substring(22);
                    byte[] bytes = Convert.FromBase64String(fileData);

                    Image imageData;
                    using (MemoryStream ms = new MemoryStream(bytes))
                    {
                        imageData = Image.FromStream(ms);
                    }

                    var fullPath = Path.Combine(fileDir, labID + ".png");
                    imageData.Save(fullPath, System.Drawing.Imaging.ImageFormat.Png);

                    if (fileCount == 0)
                    {
                        // Save tagging ni LaboratoryExam table
                        var tag = dbMed.LaboratoryExams.Find(labID);
                        tag.isEncoded = true;
                        tag.dateEncoded = DateTime.Now;
                        tag.encodedBy = Session["personnelID"].ToString();
                        dbMed.Entry(tag).State = EntityState.Modified;
                        var affectedRow = dbMed.SaveChanges();

                        if (affectedRow == 0)
                            return Json(new { status = "error", msg = "Failed to save the scanned document." }, JsonRequestBehavior.AllowGet);

                        return Json(new { status = "success", msg = "Document is successfully saved" }, JsonRequestBehavior.AllowGet);
                    }
                }

                return Json(new { status = "success", msg = "Document is successfully saved" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = ex.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult getScannedList(string qrCode, string labID)
        {
            var dir = fileuploadDir + qrCode + "\\";
            List<string> fileNameList = new List<string>();

            DirectoryInfo di = new DirectoryInfo(dir);

            foreach (var fi in di.EnumerateFiles(labID + "*"))
            {
                fileNameList.Add(fi.Name);
            }

            return Json(fileNameList);
        }

        public ActionResult getScannedLabResult(string qrCode, string fileName)
        {
            try
            {
                string fileDir = fileuploadDir + qrCode + "\\" + fileName;
                var path = Path.Combine(fileDir);
                return base.File(path, "image/png");
            }
            catch
            {
                return Content("File not found!");
            }           
        }

        [HttpPost]
        public ActionResult DeleteImg(string qrCode, string fileName)
        {
            try
            {
                string fileDir = fileuploadDir + qrCode + "\\" + fileName;
                var path = Path.Combine(fileDir);
                System.IO.File.Delete(path);

                // Check and count if there are still lab files
                DirectoryInfo di = new DirectoryInfo(fileuploadDir + qrCode);
                var labID = fileName.Remove(fileName.Contains('_') ? fileName.IndexOf('_') : fileName.IndexOf('.'));

                if(di.EnumerateFiles(labID + "*").Count() == 0)
                {
                    // Untag LaboratoryExam table when there is no scanned results in folder
                        var tag = dbMed.LaboratoryExams.Find(labID);
                        tag.isEncoded = null;
                        tag.dateEncoded = null;
                        tag.encodedBy = null;
                        dbMed.Entry(tag).State = EntityState.Modified;
                        var affectedRow = dbMed.SaveChanges();
                }

                return Json(new { status = "success", msg = "Laboratory result is successfully deleted." }, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return Content("File not found!");
            }   
        }
    }
}