using System.Threading.Tasks;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string recipientEmail, string messageSubject, string HTMLContent);
        Task<ServiceResult<string>> GenerateVerificationEmailPreviewAsync(string email);
    }
}
