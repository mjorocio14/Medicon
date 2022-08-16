using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class DentalController : Controller
    {
        MediconEntities db = new MediconEntities();
        Guid guid;

        private static string checkDate = DateTime.Now.ToShortDateString();
        private static string checkDateStart = checkDate + " 00:00:00";
        private static string checkDateEnd = checkDate + " 23:59:59";
        DateTime cds = DateTime.Parse(checkDateStart);
        DateTime cde = DateTime.Parse(checkDateEnd);
        // GET: Dental
        public ActionResult OralExam()
        {
            return View();
        }



    }
}