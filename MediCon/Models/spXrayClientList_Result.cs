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
    
    public partial class spXrayClientList_Result
    {
        public int recNo { get; set; }
        public string personStatusID { get; set; }
        public string screeningID { get; set; }
        public Nullable<bool> isXray { get; set; }
        public Nullable<bool> isNeedScutum { get; set; }
        public string personnelID { get; set; }
        public Nullable<System.DateTime> dateTimeLog { get; set; }
        public string qrCode { get; set; }
        public string fullName { get; set; }
        public Nullable<int> Age { get; set; }
        public Nullable<bool> sex { get; set; }
        public string contactNo { get; set; }
        public string fullAddress { get; set; }
    }
}
