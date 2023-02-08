using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class PrintController : Controller
    {

        MediconEntities db = new MediconEntities();

        [UserAccess]
        // GET: Print
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult printAccomp(string labRequestID)
        {

            Session["labRequestID"] = labRequestID;
       
            return Content("YES");
        }
    }
}