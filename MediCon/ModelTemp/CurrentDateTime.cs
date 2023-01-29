using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediCon.ModelTemp
{
    public class CurrentDateTime
    {
        private string checkDate = DateTime.Now.ToShortDateString();
        private string checkDateStart;
        private string checkDateEnd;
        private DateTime cds;
        private DateTime cde;

        public CurrentDateTime()
        {
            checkDateStart = checkDate + " 00:00:00";
            checkDateEnd = checkDate + " 23:59:59";
            cds = DateTime.Parse(checkDateStart);
            cde = DateTime.Parse(checkDateEnd);
        }

        #region -- Property of Current Date --
        public DateTime CurrentStartDT
        {
            get
            {
                return cds;
            }
        }

        public DateTime CurrentEndDT
        {
            get
            {
                return cde;
            }
        }
        #endregion -- Property of Current Date --
    }
}