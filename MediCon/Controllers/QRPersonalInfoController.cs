using MediCon.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class QRPersonalInfoController : Controller
    {
        EQPEntities db = new EQPEntities();
        HRISDBEntities hrdb = new HRISDBEntities();

        [UserAccess]
        // GET: QRPersonalInfo
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult getQRInfo(string qrCode)
        {
            try
            {
                // CHECK HRIS DB IF QR CODE EXIST
                var hrisQR = hrdb.vEmployeeHealthWells.SingleOrDefault(a => a.qrCode == qrCode);

                if (hrisQR == null)
                    return Json(new { status = "error", msg = "QR code does not exist in HRIS" });

                else
                    return Json(hrisQR, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}