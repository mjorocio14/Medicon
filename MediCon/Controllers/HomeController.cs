using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;
using System.Data.Entity.Validation;

namespace MediCon.Controllers
{
     [SessionTimeout]
    public class HomeController : Controller
    {
        MediconEntities db = new MediconEntities();

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Scanner()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }


        public ActionResult gMenuAccess()
        {
            try
            {
                var accessusers = Session["MenuAccess"] as List<MenuAccess>;
                return Json(accessusers.Select(a => new { 
                    a.controller,
                    a.action,
                    a.menuDesc,
                    a.mainMenu
                }).ToList(), JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                return Json(new { status = "error", msg = "Something went wrong. Failed to retrieve data.", exceptionMessage = e.InnerException.Message }, JsonRequestBehavior.AllowGet);
            }    
        }



        //[HttpPost]
        //public ActionResult gMenuAccess()
        //{
        //    var accessusers = Session["MenuAccess"] as List<MenuAccess>;
        //    return Json(accessusers.ToList(), JsonRequestBehavior.AllowGet);
        //}

    }
}