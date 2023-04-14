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
        MediconEntities dbMed = new MediconEntities();
        HRISDBEntities hrdb = new HRISDBEntities();

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
                var qrInfo = hrdb.vEmployeeHealthWells.SingleOrDefault(a => a.qrCode == qrCode);

                if (qrInfo == null)
                    return Json(new { status = "error", msg = "QR code does not exist in HRIS" });

                else
                {
                    var tagStatus = dbMed.Xray_Screening.Join(dbMed.Xray_PersonStatus, sc => sc.screeningID, ps => ps.screeningID, (sc, ps) => new { sc, ps })
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
                                                            .Count(a => a.sc.qrCode == qrCode);

                    return Json(new { qr = qrInfo, tag = tagStatus, labReqCount = labReq }, JsonRequestBehavior.AllowGet);
                }
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