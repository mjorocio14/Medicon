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
    
    public partial class Personnel
    {
        public short recNo { get; set; }
        public string personnelID { get; set; }
        public string personnel_lastName { get; set; }
        public string personnel_firstName { get; set; }
        public string personnel_midInit { get; set; }
        public string personnel_extName { get; set; }
        public Nullable<bool> sex { get; set; }
        public string contactNum { get; set; }
        public string position { get; set; }
        public string licenseNo { get; set; }
        public string title { get; set; }
        public string serviceID { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public Nullable<bool> isActive { get; set; }
        public string userTypeID { get; set; }
        public string userEncoder { get; set; }
        public Nullable<System.DateTime> dateTimeLog { get; set; }
    }
}
