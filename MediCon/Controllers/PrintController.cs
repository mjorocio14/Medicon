using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class PrintController : Controller
    {

        MediconEntities db = new MediconEntities();
        // GET: Print
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult printAccomp(string qrCode)
        {

            Session["qrCode"] = qrCode;
       
            return Content("YES");
        }
    }
}