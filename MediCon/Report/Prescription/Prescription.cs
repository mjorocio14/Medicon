namespace MediCon.Report.Prescription
{
    using System;
    using System.ComponentModel;
    using System.Drawing;
    using System.Windows.Forms;
    using Telerik.Reporting;
    using Telerik.Reporting.Drawing;

    /// <summary>
    /// Summary description for Prescription.
    /// </summary>
    public partial class Prescription : Telerik.Reporting.Report
    {
        public Prescription()
        {
            //
            // Required for telerik Reporting designer support
            //
            InitializeComponent();
            //var row = this.ReportParameters[13].Value;  
            //this.sample.Height = Unit.Inch(5);

            //
            // TODO: Add any constructor code after InitializeComponent call
            //
        }
    }
}