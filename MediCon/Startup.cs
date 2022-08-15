using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MediCon.Startup))]
namespace MediCon
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
