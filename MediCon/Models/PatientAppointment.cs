//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MediCon.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class PatientAppointment
    {
        public long recNo { get; set; }
        public string appointmentID { get; set; }
        public string phyCalendarID { get; set; }
        public string qrCode { get; set; }
        public string personnelID { get; set; }
        public Nullable<System.DateTime> dateTimeLog { get; set; }
    }
}
