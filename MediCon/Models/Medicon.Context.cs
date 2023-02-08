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
        public virtual DbSet<CBC> CBCs { get; set; }
        public virtual DbSet<Consultation> Consultations { get; set; }
        public virtual DbSet<Diagnosi> Diagnosis { get; set; }
        public virtual DbSet<DietCounseling> DietCounselings { get; set; }
        public virtual DbSet<ECG> ECGs { get; set; }
        public virtual DbSet<EditRemark> EditRemarks { get; set; }
        public virtual DbSet<Fecalysi> Fecalysis { get; set; }
        public virtual DbSet<LaboratoryExam> LaboratoryExams { get; set; }
        public virtual DbSet<LaboratoryGroupTest> LaboratoryGroupTests { get; set; }
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
        public virtual DbSet<ResultDiagnosi> ResultDiagnosis { get; set; }
        public virtual DbSet<Service> Services { get; set; }
        public virtual DbSet<sysdiagram> sysdiagrams { get; set; }
        public virtual DbSet<Temp_LabPrices> Temp_LabPrices { get; set; }
        public virtual DbSet<Temp_Morbidity> Temp_Morbidity { get; set; }
        public virtual DbSet<Urinalysi> Urinalysis { get; set; }
        public virtual DbSet<UserType> UserTypes { get; set; }
        public virtual DbSet<VitalSign> VitalSigns { get; set; }
        public virtual DbSet<Xray_Comorbidity> Xray_Comorbidity { get; set; }
        public virtual DbSet<Xray_HouseMembers> Xray_HouseMembers { get; set; }
        public virtual DbSet<Xray_Illness> Xray_Illness { get; set; }
        public virtual DbSet<Xray_LabResult> Xray_LabResult { get; set; }
        public virtual DbSet<Xray_PersonComorbidity> Xray_PersonComorbidity { get; set; }
        public virtual DbSet<Xray_PersonGibati> Xray_PersonGibati { get; set; }
        public virtual DbSet<Xray_PersonStatus> Xray_PersonStatus { get; set; }
        public virtual DbSet<Xray_Screening> Xray_Screening { get; set; }
        public virtual DbSet<Xray_ScutumLabRequest> Xray_ScutumLabRequest { get; set; }
    
        [DbFunction("MediconEntities", "fn_getMRHclients")]
        public virtual IQueryable<fn_getMRHclients_Result> fn_getMRHclients(Nullable<System.DateTime> paramDate)
        {
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getMRHclients_Result>("[MediconEntities].[fn_getMRHclients](@paramDate)", paramDateParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getPatientLabHistory")]
        public virtual IQueryable<fn_getPatientLabHistory_Result> fn_getPatientLabHistory(string qrCode)
        {
            var qrCodeParameter = qrCode != null ?
                new ObjectParameter("qrCode", qrCode) :
                new ObjectParameter("qrCode", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getPatientLabHistory_Result>("[MediconEntities].[fn_getPatientLabHistory](@qrCode)", qrCodeParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getPatientXrayHistory")]
        public virtual IQueryable<fn_getPatientXrayHistory_Result> fn_getPatientXrayHistory(string qrCode)
        {
            var qrCodeParameter = qrCode != null ?
                new ObjectParameter("qrCode", qrCode) :
                new ObjectParameter("qrCode", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getPatientXrayHistory_Result>("[MediconEntities].[fn_getPatientXrayHistory](@qrCode)", qrCodeParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getXrayScreenedClients")]
        public virtual IQueryable<fn_getXrayScreenedClients_Result> fn_getXrayScreenedClients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getXrayScreenedClients_Result>("[MediconEntities].[fn_getXrayScreenedClients]()");
        }
    
        [DbFunction("MediconEntities", "fn_getXrayTagClients")]
        public virtual IQueryable<fn_getXrayTagClients_Result> fn_getXrayTagClients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getXrayTagClients_Result>("[MediconEntities].[fn_getXrayTagClients]()");
        }
    
        [DbFunction("MediconEntities", "fn_MedicineList")]
        public virtual IQueryable<fn_MedicineList_Result> fn_MedicineList()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_MedicineList_Result>("[MediconEntities].[fn_MedicineList]()");
        }
    
        [DbFunction("MediconEntities", "fn_vitalSignList")]
        public virtual IQueryable<fn_vitalSignList_Result> fn_vitalSignList()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_vitalSignList_Result>("[MediconEntities].[fn_vitalSignList]()");
        }
    
        public virtual int sp_alterdiagram(string diagramname, Nullable<int> owner_id, Nullable<int> version, byte[] definition)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            var versionParameter = version.HasValue ?
                new ObjectParameter("version", version) :
                new ObjectParameter("version", typeof(int));
    
            var definitionParameter = definition != null ?
                new ObjectParameter("definition", definition) :
                new ObjectParameter("definition", typeof(byte[]));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_alterdiagram", diagramnameParameter, owner_idParameter, versionParameter, definitionParameter);
        }
    
        public virtual int sp_creatediagram(string diagramname, Nullable<int> owner_id, Nullable<int> version, byte[] definition)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            var versionParameter = version.HasValue ?
                new ObjectParameter("version", version) :
                new ObjectParameter("version", typeof(int));
    
            var definitionParameter = definition != null ?
                new ObjectParameter("definition", definition) :
                new ObjectParameter("definition", typeof(byte[]));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_creatediagram", diagramnameParameter, owner_idParameter, versionParameter, definitionParameter);
        }
    
        public virtual int sp_dropdiagram(string diagramname, Nullable<int> owner_id)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_dropdiagram", diagramnameParameter, owner_idParameter);
        }
    
        public virtual ObjectResult<sp_getXrayClientRecord_Result> sp_getXrayClientRecord(string param, Nullable<bool> searchType)
        {
            var paramParameter = param != null ?
                new ObjectParameter("param", param) :
                new ObjectParameter("param", typeof(string));
    
            var searchTypeParameter = searchType.HasValue ?
                new ObjectParameter("searchType", searchType) :
                new ObjectParameter("searchType", typeof(bool));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_getXrayClientRecord_Result>("sp_getXrayClientRecord", paramParameter, searchTypeParameter);
        }
    
        public virtual ObjectResult<sp_getXrayClientScreened_Result> sp_getXrayClientScreened(string param, Nullable<bool> searchType)
        {
            var paramParameter = param != null ?
                new ObjectParameter("param", param) :
                new ObjectParameter("param", typeof(string));
    
            var searchTypeParameter = searchType.HasValue ?
                new ObjectParameter("searchType", searchType) :
                new ObjectParameter("searchType", typeof(bool));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_getXrayClientScreened_Result>("sp_getXrayClientScreened", paramParameter, searchTypeParameter);
        }
    
        public virtual ObjectResult<sp_helpdiagramdefinition_Result> sp_helpdiagramdefinition(string diagramname, Nullable<int> owner_id)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_helpdiagramdefinition_Result>("sp_helpdiagramdefinition", diagramnameParameter, owner_idParameter);
        }
    
        public virtual ObjectResult<sp_helpdiagrams_Result> sp_helpdiagrams(string diagramname, Nullable<int> owner_id)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_helpdiagrams_Result>("sp_helpdiagrams", diagramnameParameter, owner_idParameter);
        }
    
        public virtual int sp_renamediagram(string diagramname, Nullable<int> owner_id, string new_diagramname)
        {
            var diagramnameParameter = diagramname != null ?
                new ObjectParameter("diagramname", diagramname) :
                new ObjectParameter("diagramname", typeof(string));
    
            var owner_idParameter = owner_id.HasValue ?
                new ObjectParameter("owner_id", owner_id) :
                new ObjectParameter("owner_id", typeof(int));
    
            var new_diagramnameParameter = new_diagramname != null ?
                new ObjectParameter("new_diagramname", new_diagramname) :
                new ObjectParameter("new_diagramname", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_renamediagram", diagramnameParameter, owner_idParameter, new_diagramnameParameter);
        }
    
        public virtual int sp_upgraddiagrams()
        {
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_upgraddiagrams");
        }
    
        public virtual ObjectResult<spOT_MedicineDispensing_Result> spOT_MedicineDispensing(string qrCode)
        {
            var qrCodeParameter = qrCode != null ?
                new ObjectParameter("qrCode", qrCode) :
                new ObjectParameter("qrCode", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<spOT_MedicineDispensing_Result>("spOT_MedicineDispensing", qrCodeParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getXrayLabReqClients")]
        public virtual IQueryable<fn_getXrayLabReqClients_Result> fn_getXrayLabReqClients()
        {
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getXrayLabReqClients_Result>("[MediconEntities].[fn_getXrayLabReqClients]()");
        }
    
        [DbFunction("MediconEntities", "fn_getRectalClients")]
        public virtual IQueryable<fn_getRectalClients_Result> fn_getRectalClients(Nullable<System.DateTime> paramDate)
        {
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getRectalClients_Result>("[MediconEntities].[fn_getRectalClients](@paramDate)", paramDateParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getPapsmearBreastExamClients")]
        public virtual IQueryable<fn_getPapsmearBreastExamClients_Result> fn_getPapsmearBreastExamClients(Nullable<System.DateTime> paramDate)
        {
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getPapsmearBreastExamClients_Result>("[MediconEntities].[fn_getPapsmearBreastExamClients](@paramDate)", paramDateParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getLabPatients")]
        public virtual IQueryable<fn_getLabPatients_Result> fn_getLabPatients(Nullable<System.DateTime> paramDate)
        {
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getLabPatients_Result>("[MediconEntities].[fn_getLabPatients](@paramDate)", paramDateParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getLabResult")]
        public virtual IQueryable<fn_getLabResult_Result> fn_getLabResult(Nullable<System.DateTime> paramDate)
        {
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getLabResult_Result>("[MediconEntities].[fn_getLabResult](@paramDate)", paramDateParameter);
        }
    
        [DbFunction("MediconEntities", "fn_getDiagnoseClients")]
        public virtual IQueryable<fn_getDiagnoseClients_Result> fn_getDiagnoseClients(string serviceID, Nullable<System.DateTime> paramDate)
        {
            var serviceIDParameter = serviceID != null ?
                new ObjectParameter("serviceID", serviceID) :
                new ObjectParameter("serviceID", typeof(string));
    
            var paramDateParameter = paramDate.HasValue ?
                new ObjectParameter("paramDate", paramDate) :
                new ObjectParameter("paramDate", typeof(System.DateTime));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<fn_getDiagnoseClients_Result>("[MediconEntities].[fn_getDiagnoseClients](@serviceID, @paramDate)", serviceIDParameter, paramDateParameter);
        }
    }
}
