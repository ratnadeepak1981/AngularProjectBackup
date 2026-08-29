using System.Threading.Tasks;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
        Task<ServiceResult<string>> GenerateForgotPasswordSmsPreviewAsync(string email);
    }
}
