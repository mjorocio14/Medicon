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
    
    public partial class sp_getRxHistory_Result
    {
        public long recNo { get; set; }
        public string rxID { get; set; }
        public string serviceID { get; set; }
        public string consultID { get; set; }
        public string referralID { get; set; }
        public string personnelID { get; set; }
        public Nullable<System.DateTime> dateTimeRx { get; set; }
        public string productCode { get; set; }
        public Nullable<int> qtyRx { get; set; }
        public Nullable<decimal> dosage { get; set; }
        public Nullable<int> perDay { get; set; }
        public string noDay { get; set; }
        public string productDesc { get; set; }
        public string measurementID { get; set; }
        public string unitID { get; set; }
        public string unitDesc { get; set; }
        public string measurementDesc { get; set; }
    }
}
