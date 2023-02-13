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
                var result = db.PersonalInfoes.Join(db.Brgies, pi => pi.brgyCode, br => br.brgyCode, (pi, br) => new { pi, br })
                             .Join(db.CityMuns, res1 => res1.br.citymunCode, cm => cm.citymunCode, (res1, cm) => new { res1, cm })
                             .Join(db.Provinces, res2 => res2.res1.br.provCode, pr => pr.provCode, (res2, pr) => new { res2, pr })
                             .Where(b => b.res2.res1.pi.qrCode == qrCode)
                             .Select(a => new { 
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
                                 a.pr.provDesc,
                                 fullAddress = a.res2.res1.br.brgyDesc + " " + a.res2.cm.citymunDesc + " " + a.pr.provDesc
                             }).ToList();

                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve personal information.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}