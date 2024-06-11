using MediCon.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class XrayReportController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        [UserAccess]
        // GET: XrayReport
        public ActionResult Report()
        {
            return View();
        }

        // GET: XrayReport/Details/5
        public ActionResult Details(string date)
        {
            try
            {
                var clients = dbMed.fnSputumTransmittal(date).OrderBy(a => a.lastName).ThenBy(b => b.firstName).ToList();
                return Json(clients, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", msg = "An error occured while fetching the medicines.", error = ex }, JsonRequestBehavior.AllowGet);
            }
        }

       
    }
}
