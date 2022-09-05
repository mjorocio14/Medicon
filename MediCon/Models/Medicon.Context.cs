﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class MediconEntities : DbContext
    {
        public MediconEntities()
            : base("name=MediconEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<BloodChem> BloodChems { get; set; }
        public virtual DbSet<BloodPressure> BloodPressures { get; set; }
        public virtual DbSet<BrandList> BrandLists { get; set; }
        public virtual DbSet<Consultation> Consultations { get; set; }
        public virtual DbSet<Diagnosi> Diagnosis { get; set; }
        public virtual DbSet<DietCounseling> DietCounselings { get; set; }
        public virtual DbSet<LaboratoryExam> LaboratoryExams { get; set; }
        public virtual DbSet<LaboratoryTest> LaboratoryTests { get; set; }
        public virtual DbSet<MaleRepro_Diagnosis> MaleRepro_Diagnosis { get; set; }
        public virtual DbSet<MaleRepro_Interview> MaleRepro_Interview { get; set; }
        public virtual DbSet<Measurement> Measurements { get; set; }
        public virtual DbSet<MedicalPrescription> MedicalPrescriptions { get; set; }
        public virtual DbSet<MenuAccess> MenuAccesses { get; set; }
        public virtual DbSet<MRHrequest> MRHrequests { get; set; }
        public virtual DbSet<OutgoingItem> OutgoingItems { get; set; }
        public virtual DbSet<PapsmearBreastExam> PapsmearBreastExams { get; set; }
        public virtual DbSet<Personnel> Personnels { get; set; }
        public virtual DbSet<ProductList> ProductLists { get; set; }
        public virtual DbSet<ProductUnit> ProductUnits { get; set; }
        public virtual DbSet<Referral> Referrals { get; set; }
        public virtual DbSet<Service> Services { get; set; }
        public virtual DbSet<sysdiagram> sysdiagrams { get; set; }
        public virtual DbSet<UserType> UserTypes { get; set; }
        public virtual DbSet<VitalSign> VitalSigns { get; set; }
    
        [DbFunction("MediconEntities", "fn_getDiagnoseClients")]
        public virtual IQueryable<fn_getDiagnoseClients_Result> fn_getDiagnoseClients(string serviceID)
        {
            var serviceIDParameter = serviceID != null ?
                new ObjectParameter("serviceID", serviceID) :
                new ObjectParameter("serviceID", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getDiagnoseClients_Result>("[MediconEntities].[fn_getDiagnoseClients](@serviceID)", serviceIDParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getLabPatients")]
        public virtual IQueryable<fn_getLabPatients_Result> fn_getLabPatients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getLabPatients_Result>("[MediconEntities].[fn_getLabPatients]()");
        }
    
        [DbFunction("MediconEntities", "fn_getMRHclients")]
        public virtual IQueryable<fn_getMRHclients_Result> fn_getMRHclients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getMRHclients_Result>("[MediconEntities].[fn_getMRHclients]()");
        }
    
        [DbFunction("MediconEntities", "fn_getPapsmearBreastExamClients")]
        public virtual IQueryable<fn_getPapsmearBreastExamClients_Result> fn_getPapsmearBreastExamClients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getPapsmearBreastExamClients_Result>("[MediconEntities].[fn_getPapsmearBreastExamClients]()");
        }
    
        [DbFunction("MediconEntities", "fn_getPatientLabHistory")]
        public virtual IQueryable<fn_getPatientLabHistory_Result> fn_getPatientLabHistory(string qrCode)
        {
            var qrCodeParameter = qrCode != null ?
                new ObjectParameter("qrCode", qrCode) :
                new ObjectParameter("qrCode", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getPatientLabHistory_Result>("[MediconEntities].[fn_getPatientLabHistory](@qrCode)", qrCodeParameter);
        }
    
        [DbFunction("MediconEntities", "fn_MedicineList")]
        public virtual IQueryable<fn_MedicineList_Result> fn_MedicineList()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_MedicineList_Result>("[MediconEntities].[fn_MedicineList]()");
        }
    
        public virtual ObjectResult<spOT_MedicineDispensing_Result> spOT_MedicineDispensing(string qrCode)
        {
            var qrCodeParameter = qrCode != null ?
                new ObjectParameter("qrCode", qrCode) :
                new ObjectParameter("qrCode", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<spOT_MedicineDispensing_Result>("spOT_MedicineDispensing", qrCodeParameter);
        }
    
        public virtual int spOT_MedicineList(string serviceID)
        {
            var serviceIDParameter = serviceID != null ?
                new ObjectParameter("serviceID", serviceID) :
                new ObjectParameter("serviceID", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("spOT_MedicineList", serviceIDParameter);
        }
    }
}