using System.Web;
using System.Web.Optimization;

namespace MediCon
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        //"~/Scripts/jquery-{version}.js",
                        "~/Scripts/AngularJS/angular.min.js",
                        "~/Scripts/AngularJS/MedConApp.js",
                        "~/Content/ISPINIA/js/jquery-2.1.1.js",
                        // "~/Content/ISPINIA/js/jquery.min.js",
                         "~/Content/ISPINIA/js/jquery.metisMenu.js",
                        "~/Content/ISPINIA/js/jquery.slimscroll.min.js"
                        ));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"
                          ));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Content/ISPINIA/js/bootstrap.min.js",
                      "~/Content/ISPINIA/js/inspinia.js",
                      "~/Content/ISPINIA/js/pace.min.js"
                      ));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/ISPINIA/css/bootstrap.min.css",
                      "~/Content/ISPINIA/css/font-awesome.min.css",
                      "~/Content/ISPINIA/css/animate.css",
                      "~/Content/ISPINIA/css/style.css" 
                      ));
        }
    }
}
