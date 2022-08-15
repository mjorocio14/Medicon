using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class UserAccess : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;
            string controllerName = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName;
            string actionName = filterContext.ActionDescriptor.ActionName;
            try
            {
                if (ctx.Session["personnelID"] != null)
                {
                    ctx.Session["controllerName"] = controllerName;
                    ctx.Session["actionName"] = actionName;
                    var access = ctx.Session["userTypeID"].ToString();
                    Console.WriteLine("test");
                    var accessusers = ctx.Session["MenuAccess"] as List<MenuAccess>;
                    var tb3 = accessusers.Where(y => y.controller == controllerName && y.action == actionName).FirstOrDefault();
                    if (tb3 == null)
                    {
                        filterContext.Result = new RedirectResult("~/Home/Index");
                        return;
                    }
                }
                else
                {
                    filterContext.Result = new RedirectResult("~/Account/Signout");
                    return;
                }
            }

            catch (Exception)
            {
                filterContext.Result = new RedirectResult("~/Account/Signout");
                return;
            }
            base.OnActionExecuting(filterContext);
        }

    }
}