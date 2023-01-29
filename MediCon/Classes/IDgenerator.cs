using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediCon.Classes
{
    public class IDgenerator
    {

        string generatedID;

        public IDgenerator(string source) {
            generatedID = string.Format("{1:N}", source, Guid.NewGuid());
        }

        public string generateID
        {
            get
            {
                return generatedID;
            }
        }
    }
}