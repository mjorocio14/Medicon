﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using MediCon.ModelTemp;
using MediCon.Classes;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class XrayTaggingController : Controller
    {
        EQPEntities db = new EQPEntities();
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: XrayTagging
        public ActionResult Tag()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getQRInfoWithXrayScreening(string qrCode, string dateFilter)
        {
            DateTime dateStart = DateTime.Parse(dateFilter);
            DateTime dateEnd = DateTime.Parse(dateFilter + " 23:59:59");

            try
            {
                var date = new CurrentDateTime();

                var qrInfo = db.PersonalInfoes.Join(db.Brgies, pi => pi.brgyCode, br => br.brgyCode, (pi, br) => new { pi, br })
                             .Join(db.CityMuns, res1 => res1.br.citymunCode, cm => cm.citymunCode, (res1, cm) => new { res1, cm })
                             .Join(db.Provinces, res2 => res2.res1.br.provCode, pr => pr.provCode, (res2, pr) => new { res2, pr })
                             .Where(b => b.res2.res1.pi.qrCode == qrCode)
                             .Select(a => new
                             {
                                 a.res2.res1.pi.address,
                                 a.res2.res1.pi.birthdate,
                                 a.res2.res1.pi.brgyCode,
                                 a.res2.res1.pi.contactNo,
                                 a.res2.res1.pi.extName,
                                 a.res2.res1.pi.firstName,
                                 a.res2.res1.pi.lastName,
                                 a.res2.res1.pi.middleName,
                                 a.res2.res1.pi.occupation,
                                 a.res2.res1.pi.qrCode,
                                 a.res2.res1.pi.sex,
                                 a.res2.res1.br.brgyDesc,
                                 a.res2.cm.citymunDesc,
                                 a.pr.provDesc
                             }).ToList();

                var screenInfo = dbMed.Xray_Screening.Count(a => a.qrCode == qrCode && a.dateTimeLog >= dateStart && a.dateTimeLog <= dateEnd);

                var tagStatus = dbMed.Xray_Screening.Join(dbMed.Xray_PersonStatus, sc => sc.screeningID, ps => ps.screeningID, (sc, ps) => new { sc, ps })
                                                    .Where(a => a.sc.qrCode == qrCode && a.sc.dateTimeLog >= dateStart && a.sc.dateTimeLog <= dateEnd)
                                                    .Select(b => new
                                                    {
                                                        b.ps.isXray,
                                                        b.ps.isNeedScutum
                                                    }).ToList();

                return Json(new { result = screenInfo == 0 ? "No Record" : "Record Found", qr = qrInfo, tag = tagStatus }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveTag(string qrCode, Xray_PersonStatus xrayStatus)
        {
            try
            {
                var date = new CurrentDateTime();

                // Get screening ID
                var screeningID = dbMed.Xray_Screening.SingleOrDefault(a => a.qrCode == qrCode && a.dateTimeLog >= date.CurrentStartDT && a.dateTimeLog <= date.CurrentEndDT).screeningID;

                // Save screening info
                xrayStatus.personStatusID = new IDgenerator(screeningID).generateID.Substring(0, 15);
                xrayStatus.screeningID = screeningID;
                xrayStatus.personnelID = Session["personnelID"].ToString();
                xrayStatus.dateTimeLog = DateTime.Now;
                dbMed.Xray_PersonStatus.Add(xrayStatus);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Xray Tag is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Xray Tag is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult updateTag(string statusID, Xray_PersonStatus xrayStatus)
        {
            try
            {
                var findRec = dbMed.Xray_PersonStatus.Find(statusID);

                findRec.isXray = xrayStatus.isXray;
                findRec.isNeedScutum = xrayStatus.isNeedScutum;
                findRec.personnelID = Session["personnelID"].ToString();
                dbMed.Entry(findRec).State = EntityState.Modified;
               
                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Xray Tag is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Xray Tag is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getXrayClients(string date)
        {
            try
            {
                DateTime dateStart = DateTime.Parse(date);
                DateTime dateEnd = DateTime.Parse(date + " 23:59:59");

                //var date = new CurrentDateTime();

                //var client = dbMed.fn_getXrayTagClients().Where(a => a.isXray != null && a.tagDT >= date.CurrentStartDT && a.tagDT <= date.CurrentEndDT).OrderByDescending(x => x.tagDT).ToList();
                var client = dbMed.fn_getXrayTagClients().Where(a => a.isXray != null && a.tagDT >= dateStart && a.tagDT <= dateEnd).OrderByDescending(x => x.tagDT).ToList();

                return Json(client, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}