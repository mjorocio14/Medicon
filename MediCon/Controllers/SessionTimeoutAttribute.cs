using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MediCon.Controllers
{
    public class SessionTimeoutAttribute : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            string controllerName = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName;
            string actionName = filterContext.ActionDescriptor.ActionName;
            HttpContext ctx = HttpContext.Current;
            try
            {
                if (HttpContext.Current.Session["personnelID"] == null)
                {
                    ctx.Session["controllerName"] = controllerName;
                    ctx.Session["actionName"] = actionName;
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