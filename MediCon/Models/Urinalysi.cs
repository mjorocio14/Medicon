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
    
    public partial class Urinalysi
    {
        public long recNo { get; set; }
        public string urinalysisID { get; set; }
        public string labID { get; set; }
        public string color { get; set; }
        public string transparency { get; set; }
        public string albumin { get; set; }
        public string sugar { get; set; }
        public Nullable<decimal> reaction { get; set; }
        public Nullable<decimal> spGravity { get; set; }
        public Nullable<decimal> pusCells { get; set; }
        public Nullable<decimal> rbcCells { get; set; }
        public string epithelialCells { get; set; }
        public Nullable<decimal> renalCells { get; set; }
        public string mucusThread { get; set; }
        public string bacteria { get; set; }
        public string yeastCells { get; set; }
        public string coarseGranular { get; set; }
        public string fineGranular { get; set; }
        public string hyaline { get; set; }
        public string pusCellsCast { get; set; }
        public string rbcCast { get; set; }
        public string waxyCast { get; set; }
        public string amourphousUrates { get; set; }
        public string amourphousPhospates { get; set; }
        public string triplePhospates { get; set; }
        public string uricAcid { get; set; }
        public string calciumOxalates { get; set; }
        public string pregnancyTest { get; set; }
        public string others { get; set; }
        public string personnelID { get; set; }
        public Nullable<System.DateTime> dateTimeLog { get; set; }
    }
}
