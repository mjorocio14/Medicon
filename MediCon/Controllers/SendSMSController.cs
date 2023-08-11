using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;
using System.Net;
using MediCon.Models;

namespace MediCon.Controllers
{
    public class SendSMSController : Controller
    {
        MediconEntities dbMed = new MediconEntities();

        // HttpClient is intended to be instantiated once per application, rather than per-use. See Remarks.
        private static readonly HttpClient client = new HttpClient();

        // GET: SendSMS
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task Send(recipient info, bool isHospital)
        {
            var values = new Dictionary<string, string>();
            values.Add("app_key", "DavN0rHR!S");
            values.Add("app_secret", "gyNJUQ486EBZ9tZeNpdqPjMuCn17tgcr");
            values.Add("msisdn", info.contactNo);
            values.Add("shortcode_mask", "PG DavNor");
            values.Add("rcvd_transid", "S858340416-9601");
            values.Add("is_intl", "false");

            if (isHospital)
                values.Add("content", "Hi " + info.employee + "! We would like to inform you that your laboratory schedule at PEEDO-" + info.appointee + " will be on " + info.schedule.ToLongDateString() + ", at 7 a.m."
                                       + " It is highly encouraged for you to strictly follow the assigned schedule due to the limited slots in the hospital laboratory. For any schedule changes and other concerns, kindly inform the PHRMO-Admin Division.");

            else
            {
                var physician = dbMed.Personnels.SingleOrDefault(a => a.personnelID == info.appointee);
                var physicianName = "Dr. " + physician.personnel_firstName + " " + physician.personnel_lastName;

                values.Add("content", "Hi " + info.employee + "! We would like to inform you that your laboratory results are already available and you are scheduled to visit " + physicianName +
                    " on " + info.schedule.ToLongDateString() + ", at DavNor Employee`s Clinic. It is highly encouraged for you to strictly follow the assigned schedule due to the limited slots in the physician`s schedule. For any schedule changes and other concerns, kindly inform the PHRMO-Admin Division.");
            }

            var content = new FormUrlEncodedContent(values);

            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            var response = await client.PostAsync("https://api.m360.com.ph/v3/api/broadcast", content);
            var responseString = await response.Content.ReadAsStringAsync();
        }

        public class recipient
        {
            public string employee { get; set; }
            public string contactNo { get; set; }
            public string appointee { get; set; }
            public DateTime schedule { get; set; }
        }

    }
}