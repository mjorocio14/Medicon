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
                    rpt.Parameters.Add("rxID", Session["rxID"].ToString());
                    rpt.Parameters.Add("rxLength", Session["rxLength"].ToString());
                    rpt.Parameters.Add("PatientFirstName", Session["PatientFirstName"].ToString());
                    rpt.Parameters.Add("PatientMidName", Session["PatientMidName"].ToString());
                    rpt.Parameters.Add("PatientLastName", Session["PatientLastName"].ToString());
                    rpt.Parameters.Add("PatientExtName", Session["PatientExtName"].ToString());
                    rpt.Parameters.Add("PatientAddress", Session["PatientAddress"].ToString());
                    rpt.Parameters.Add("PatientAge", Session["PatientAge"].ToString());
                    rpt.Parameters.Add("PatientOffice", Session["PatientOffice"].ToString());

                    rpt.Parameters.Add("personnel_firstName", Session["personnel_firstName"].ToString());
                    rpt.Parameters.Add("personnel_midInit", Session["personnel_midInit"].ToString());
                    rpt.Parameters.Add("personnel_lastName", Session["personnel_lastName"].ToString());
                    rpt.Parameters.Add("personnel_extName", Session["personnel_extName"].ToString());
                    rpt.Parameters.Add("personnel_title", Session["personnel_title"].ToString());
                    rpt.Parameters.Add("personnel_licenseNo", Session["personnel_licenseNo"].ToString());
                    rpt.ReportDocument = new Prescription.RX();
                    break;
            }

            MediconReportViewer.ReportSource = rpt;

        }
    }
}