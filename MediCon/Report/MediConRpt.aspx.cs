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
            var labRequestID = "";

            switch (Request["type"])

            {
                case "lrrf":
                    labRequestID = Session["labRequestID"].ToString();
                    rpt.ReportDocument = new LRRF.LRRFRpt();
                    rpt.Parameters.Add("labRequestID", labRequestID);
                    break;
                case "prescription":
                    rpt.ReportDocument = new Prescription.Prescription();
                    rpt.Parameters.Add("rxID", Session["rxID"].ToString());
                    break;
            }

            MediconReportViewer.ReportSource = rpt;

        }
    }
}