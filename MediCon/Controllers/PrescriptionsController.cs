using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class PrescriptionsController : Controller
    {

        MediconEntities db = new MediconEntities();

        // GET: Prescriptions
        public ActionResult List()
        {
            return View();
        }


        [HttpPost]
        public ActionResult getList(string dateFilter)
        {
            var list = db.fn_Prescriptions(dateFilter).ToList();
            return Json(list, JsonRequestBehavior.AllowGet);
        }


        public ActionResult printRXList(rxData info)
        {

            Session["rxID"] = info.rxID;
            Session["fullName"] = info.fullName;
            Session["PatientAddress"] = (info.fullAddress == null ? "" : info.fullAddress);
            Session["PatientAge"] = info.age;

            Session["personnelFullName"] = info.personnelFullName;
            Session["personnel_title"] = info.title == null ? "" : info.title;
            Session["personnel_licenseNo"] = info.licenseNo == null ? "" : info.licenseNo;

            Session["mp_dateTimeRx"] = info.mp_dateTimeRx;

            return Content("YES");
        }


        public class rxData
        {
            public string rxID { get; set; }
            public string qrCode {get;set;}
            public string fullName { get; set; }
            public int age { get; set; }
            public string fullAddress { get; set; }
            public string personnelFullName { get; set; }
            public string title { get; set; }
            public string licenseNo { get; set; }
            public string mp_dateTimeRx { get; set; }
        
        }


    }
}