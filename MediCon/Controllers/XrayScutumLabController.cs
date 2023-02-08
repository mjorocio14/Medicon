using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.ModelTemp;
using MediCon.Models;
using MediCon.Classes;
using System.Data.Entity;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class XrayScutumLabController : Controller
    {
        EQPEntities db = new EQPEntities();
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: XrayScutumLab
        public ActionResult Form2A()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getQrWithScutumReq(string qrCode)
        {
            try
            {
                //var date = new CurrentDateTime();

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

                var tagStatus = dbMed.Xray_Screening.Join(dbMed.Xray_PersonStatus, sc => sc.screeningID, ps => ps.screeningID, (sc, ps) => new { sc, ps })
                                                    //.Where(a => a.ps.isXray == true && a.sc.qrCode == qrCode && a.sc.dateTimeLog >= date.CurrentStartDT && a.sc.dateTimeLog <= date.CurrentEndDT)
                                                    .Where(a => a.ps.isXray == true && a.sc.qrCode == qrCode)
                                                    .Select(b => new
                                                    {
                                                        b.ps.isXray,
                                                        b.ps.isNeedScutum,
                                                        b.ps.personStatusID,
                                                        b.ps.dateTimeLog
                                                    }).OrderByDescending(c => c.dateTimeLog).ToList();

                var labReq = dbMed.Xray_ScutumLabRequest.Join(dbMed.Xray_PersonStatus, lr => lr.personStatusID, ps => ps.personStatusID, (lr, ps) => new { lr, ps })
                                                        .Join(dbMed.Xray_Screening, r1 => r1.ps.screeningID, sc => sc.screeningID, (r1, sc) => new { r1, sc })
                                                        //.Count(a => a.sc.qrCode == qrCode && a.sc.dateTimeLog >= date.CurrentStartDT && a.sc.dateTimeLog <= date.CurrentEndDT);
                                                        .Count(a => a.sc.qrCode == qrCode);

                return Json(new { qr = qrInfo, tag = tagStatus, labReqCount = labReq }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult saveLabReq(string qrCode, Xray_ScutumLabRequest labReq)
        {
            try
            {
                // Save Xray_ScutumLabRequest
                labReq.labRequestID = new IDgenerator(labReq.personStatusID).generateID.Substring(0, 15);
                labReq.preparedBy_personnelID = Session["personnelID"].ToString();
                labReq.personnelID = Session["personnelID"].ToString();
                labReq.dateTimeLog = DateTime.Now;
                dbMed.Xray_ScutumLabRequest.Add(labReq);

                var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Laboratory request is not saved!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Laboratory request is successfully saved!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getLabReqClients(string date)
        {
            try
            {
                DateTime dateStart = DateTime.Parse(date);
                DateTime dateEnd = DateTime.Parse(date + " 23:59:59");

                var client = dbMed.fn_getXrayLabReqClients().Where(a => a.labReqDT >= dateStart && a.labReqDT <= dateEnd).OrderByDescending(x => x.labReqDT).ToList();

                return Json(client, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

         [HttpPost]
        public ActionResult saveUpdatesLabReq(Xray_ScutumLabRequest labReq)
        {
            try
            {
                var find = dbMed.Xray_ScutumLabRequest.SingleOrDefault(a => a.labRequestID == labReq.labRequestID);

                    if (find != null)
                    {
                        find.requestingFacility = labReq.requestingFacility;
                        find.dateOfRequest = labReq.dateOfRequest;
                        find.treatmentHistory = labReq.treatmentHistory;
                        find.dateOfTreatment = labReq.dateOfTreatment;
                        find.testRequested = labReq.testRequested;
                        find.collection = labReq.collection;
                        find.dateCollected = labReq.dateCollected;
                        find.preparedBy_personnelID = Session["personnelID"].ToString();
                        find.personnelID = Session["personnelID"].ToString();
                        find.dateTimeLog = DateTime.Now;
                        dbMed.Entry(find).State = EntityState.Modified;
                    }

                    var affectedRow = dbMed.SaveChanges();

                if (affectedRow == 0)
                    return Json(new { status = "error", msg = "Updating lab request failed!" }, JsonRequestBehavior.AllowGet);

                return Json(new { status = "success", msg = "Updating lab request is successful!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while saving your data.", exceptionMessage = ex }, JsonRequestBehavior.AllowGet);
            }

        }
        
    }
}