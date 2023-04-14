using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Classes;
using MediCon.ModelTemp;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class ClinicalScreeningController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: ClinicalScreening
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult saveScreening(Xray_Screening screening, string otherComorbidity, string [] gibati, string [] comorbidity, Xray_HouseMembers[] houseMembers)
        {
            try
            {
                var date = new CurrentDateTime();
                var checkScreening = dbMed.Xray_Screening.Count(a => a.qrCode == screening.qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT);

                if (checkScreening > 0)
                    return Json(new { status = "error", msg = "Client is already screened for today." }, JsonRequestBehavior.AllowGet);

                else
                {
                    // Save screening info
                    screening.screeningID = new IDgenerator(screening.qrCode).generateID.Substring(0, 15);
                    screening.personnelID = Session["personnelID"].ToString();
                    screening.dateTimeLog = DateTime.Now;
                    dbMed.Xray_Screening.Add(screening);

                    if (gibati != null)
                    {
                        // Save Xray_PersonGibati data
                        foreach (var item in gibati)
                        {
                            Xray_PersonGibati PG = new Xray_PersonGibati();
                            PG.personGibatiID = new IDgenerator(item).generateID.Substring(0, 15);
                            PG.screeningID = screening.screeningID;
                            PG.illnessID = item;
                            dbMed.Xray_PersonGibati.Add(PG);
                        }
                    }

                    if (comorbidity != null)
                    {
                        // Save Xray_PersonComorbidity data
                        foreach (var item in comorbidity)
                        {
                            Xray_PersonComorbidity PC = new Xray_PersonComorbidity();
                            PC.personComorbidityID = new IDgenerator(item).generateID.Substring(0, 15);
                            PC.screeningID = screening.screeningID;
                            PC.comorbidityID = item;
                            PC.otherComorbidity = item == "comor007" ? otherComorbidity : null;
                            dbMed.Xray_PersonComorbidity.Add(PC);
                        }
                    }


                    // Check Xray_HouseMembers is has existing data
                    var countHouseMembers = dbMed.Xray_HouseMembers.Where(a => a.qrCode == screening.qrCode).ToList();

                    // If has existing house members removed then replace with the latest data
                    if (countHouseMembers != null)
                    {
                        dbMed.Xray_HouseMembers.RemoveRange(countHouseMembers);
                    }

                    // Save Xray_HouseMembers data
                    if (houseMembers != null)
                    {
                        foreach (var item in houseMembers)
                        {
                            Xray_HouseMembers HM = new Xray_HouseMembers();
                            HM.houseID = new IDgenerator(item.name).generateID.Substring(0, 15);
                            HM.name = item.name;
                            HM.sex = item.sex;
                            HM.birthdate = item.birthdate;
                            HM.qrCode = screening.qrCode;
                            HM.personnelID = Session["personnelID"].ToString();
                            HM.dateTimeLog = DateTime.Now;
                            dbMed.Xray_HouseMembers.Add(HM);
                        }
                    }

                    var affectedRow = dbMed.SaveChanges();

                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Clinical Screening is not saved!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { status = "success", msg = "Clinical Screening is successfully saved!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult updateScreening(Xray_Screening screening, string otherComorbidity, string[] gibati, string[] comorbidity, Xray_HouseMembers[] houseMembers)
        {
            try
            {
                    // Update screening info
                    screening.dateTimeLog = DateTime.Now;
                    screening.personnelID = Session["personnelID"].ToString();
                    dbMed.Entry(screening).State = EntityState.Modified;

                    #region --- Update Xray_PersonGibati ----
                    // Check Xray_PersonGibati is has existing data
                    var countGibati = dbMed.Xray_PersonGibati.Where(a => a.screeningID == screening.screeningID).ToList();

                    // If has existing PersonGibati removed then replace with the latest data
                    if (countGibati != null)
                    {
                        dbMed.Xray_PersonGibati.RemoveRange(countGibati);
                    }

                    // Save new Xray_PersonGibati data
                    if (gibati != null)
                    {
                        foreach (var item in gibati)
                        {
                            Xray_PersonGibati PG = new Xray_PersonGibati();
                            PG.personGibatiID = new IDgenerator(item).generateID.Substring(0, 15);
                            PG.screeningID = screening.screeningID;
                            PG.illnessID = item;
                            dbMed.Xray_PersonGibati.Add(PG);
                        }
                    }
                    #endregion

                    #region --- Update Xray_PersonComorbidity ----
                    // Check Xray_PersonComorbidity is has existing data
                    var countComorbidity = dbMed.Xray_PersonComorbidity.Where(a => a.screeningID == screening.screeningID).ToList();

                    // If has existing PersonComorbidity removed then replace with the latest data
                    if (countComorbidity != null)
                    {
                        dbMed.Xray_PersonComorbidity.RemoveRange(countComorbidity);
                    }

                    // Save new Xray_PersonComorbidity data
                    if (comorbidity != null)
                    {
                        foreach (var item in comorbidity)
                        {
                            Xray_PersonComorbidity PC = new Xray_PersonComorbidity();
                            PC.personComorbidityID = new IDgenerator(item).generateID.Substring(0, 15);
                            PC.screeningID = screening.screeningID;
                            PC.comorbidityID = item;
                            PC.otherComorbidity = item == "comor007" ? otherComorbidity : null;
                            dbMed.Xray_PersonComorbidity.Add(PC);
                        }
                    }
                    #endregion

                    #region --- Update Xray_HouseMembers ---
                    // Check Xray_HouseMembers is has existing data
                    var countHouseMembers = dbMed.Xray_HouseMembers.Where(a => a.qrCode == screening.qrCode).ToList();

                    // If has existing house members removed then replace with the latest data
                    if (countHouseMembers != null)
                    {
                        dbMed.Xray_HouseMembers.RemoveRange(countHouseMembers);
                    }

                    // Save Xray_HouseMembers data
                    if (houseMembers != null)
                    {
                        foreach (var item in houseMembers)
                        {
                            Xray_HouseMembers HM = new Xray_HouseMembers();
                            HM.houseID = new IDgenerator(item.name).generateID.Substring(0, 15);
                            HM.name = item.name;
                            HM.sex = item.sex;
                            HM.birthdate = item.birthdate;
                            HM.qrCode = screening.qrCode;
                            HM.personnelID = Session["personnelID"].ToString();
                            HM.dateTimeLog = DateTime.Now;
                            dbMed.Xray_HouseMembers.Add(HM);
                        }
                    }
                    #endregion

                    var affectedRow = dbMed.SaveChanges();

                    if (affectedRow == 0)
                        return Json(new { status = "error", msg = "Clinical Screening is not saved!" }, JsonRequestBehavior.AllowGet);

                    return Json(new { status = "success", msg = "Clinical Screening is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getScreenedClients(DateTime date)
        {
            try
            {
                var client = dbMed.fn_getXrayScreenedClients(date).OrderByDescending(x => x.dateTimeLog).ToList();

                return Json(client, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getIllness(string screeningID)
        {
            try
            {
                var gibati = dbMed.Xray_PersonGibati.Where(a => a.screeningID == screeningID).ToList();
                
                var comorbidity = dbMed.Xray_PersonComorbidity.Where(a => a.screeningID == screeningID).ToList();

                return Json(new { gibati = gibati, comorbidity = comorbidity}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getXrayHistory(string qrCode)
        {
            try
            {
                var history = dbMed.fn_getPatientXrayHistory(qrCode).OrderByDescending(a => a.screenDT);

                return Json(history, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getHouseMembers(string qrCode)
        {
            try
            {
                var house = dbMed.Xray_HouseMembers.Where(a => a.qrCode == qrCode).ToList();

                return Json(house, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}