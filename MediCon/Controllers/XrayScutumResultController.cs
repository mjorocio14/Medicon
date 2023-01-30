using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    [SessionTimeout]
    public class XrayScutumResultController : Controller
    {
        [UserAccess]
        // GET: XrayScutumResult
        public ActionResult Result()
        {
            return View();
        }
    }
}