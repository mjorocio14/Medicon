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
    
    public partial class OutgoingItem
    {
        public long recNo { get; set; }
        public string outID { get; set; }
        public string rxID { get; set; }
        public string productCode { get; set; }
        public Nullable<int> qtyRx { get; set; }
        public string personnelID { get; set; }
        public Nullable<System.DateTime> dateTimeRx { get; set; }
        public Nullable<bool> isRelease { get; set; }
        public Nullable<int> qtyReleased { get; set; }
        public string userIDreleased { get; set; }
        public Nullable<System.DateTime> dateTimeReleased { get; set; }
    }
}
