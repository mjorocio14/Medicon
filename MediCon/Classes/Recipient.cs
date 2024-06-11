using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediCon.Classes
{
    public class Recipient
    {
        public string employee { get; set; }
        public string contactNo { get; set; }
        public string appointee { get; set; }
        public string hospitalID { get; set; }
        public DateTime schedule { get; set; }
    }
}