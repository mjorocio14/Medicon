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
    
    public partial class fn_getMRHclients_Result
    {
        public string MRID { get; set; }
        public string requestID { get; set; }
        public Nullable<bool> is1stDRE { get; set; }
        public byte DREfrequency { get; set; }
        public Nullable<bool> isProstateCancer { get; set; }
        public Nullable<bool> isAnyCancer { get; set; }
        public string cancerName { get; set; }
        public Nullable<bool> isMedication { get; set; }
        public string medicineName { get; set; }
        public Nullable<byte> diNauubos { get; set; }
        public Nullable<byte> kadalasUmihi { get; set; }
        public Nullable<byte> patigiltiglNaIhi { get; set; }
        public Nullable<byte> pagpigilNgIhi { get; set; }
        public Nullable<byte> mahinangDaloy { get; set; }
        public Nullable<byte> magpwersaNgIhi { get; set; }
        public Nullable<byte> besesGumising { get; set; }
        public Nullable<byte> sintomasNgIhi { get; set; }
        public Nullable<byte> nadarama { get; set; }
        public string referralID { get; set; }
        public Nullable<bool> isInterviewDone { get; set; }
        public Nullable<System.DateTime> interviewDT { get; set; }
        public string interviewerID { get; set; }
        public string consultID { get; set; }
        public string vSignID { get; set; }
        public string lastName { get; set; }
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string extName { get; set; }
        public Nullable<System.DateTime> birthdate { get; set; }
        public string contactNo { get; set; }
        public string personnel_lastName { get; set; }
        public string personnel_firstName { get; set; }
        public string personnel_midInit { get; set; }
    }
}
