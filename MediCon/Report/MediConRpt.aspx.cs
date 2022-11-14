using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Telerik.Reporting;

namespace MediCon.Report
{
    public partial class MediConRpt : System.Web.UI.Page
    {

        InstanceReportSource rpt = new InstanceReportSource();
        protected void Page_Load(object sender, EventArgs e)
        {
            var qrCode = "";

            switch (Request["type"])

            {
                case "lrrf":
                    qrCode = Session["qrCode"].ToString();
                    rpt.ReportDocument = new LRRF.LRRFRpt();
                    rpt.Parameters.Add("qrCode", qrCode);
                    break;
            }

            MediconReportViewer.ReportSource = rpt;

        }
    }
}