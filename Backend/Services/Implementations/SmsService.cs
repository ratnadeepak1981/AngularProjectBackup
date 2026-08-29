using System;
using System.IO;
using System.Threading.Tasks;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace CampusServicesPortal.Services.Implementations
{
    public class SmsService : ISmsService
    {
        private readonly IPasswordRepository _passwordRepo;
        private readonly ILogger<SmsService> _logger;
        private readonly IWebHostEnvironment _env;

        public SmsService(IPasswordRepository passwordRepo, ILogger<SmsService> logger, IWebHostEnvironment env)
        {
            _passwordRepo = passwordRepo;
            _logger = logger;
            _env = env;
        }

        public Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            _logger.LogInformation("=========================================================================================");
            _logger.LogInformation("[SMS SIMULATION GATEWAY] 📱");
            _logger.LogInformation("To          : {PhoneNumber}", phoneNumber);
            _logger.LogInformation("Timestamp   : {Timestamp} UTC", DateTime.UtcNow.ToString("g"));
            _logger.LogInformation("Message Body: {Message}", message);
            _logger.LogInformation("=========================================================================================");

            return Task.FromResult(true);
        }

        public async Task<ServiceResult<string>> GenerateForgotPasswordSmsPreviewAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ServiceResult<string>.Failure("Email parameter is required.", 400);
            }

            string cleanEmail = email.Trim();
            var student = await _passwordRepo.GetStudentByEmailThroughUserAsync(cleanEmail);

            if (student == null)
            {
                return ServiceResult<string>.Failure($"No student account record found for email '{cleanEmail}'.", 404);
            }

            var latestToken = await _passwordRepo.GetLatestUnusedTokenAsync();
            string tokenCode = latestToken?.Token ?? "482910";
            string expiresAtStr = latestToken?.ExpiresAt.ToString("g") + " UTC" ?? "30 Minutes from Request";
            string phoneNo = !string.IsNullOrWhiteSpace(student.ContactDetails) ? student.ContactDetails : "+94 77 123 4567";

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("SMS OTP preview template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", student.FullName ?? "Student User")
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{TOKEN_CODE}}", tokenCode)
                .Replace("{{EXPIRES_AT_STR}}", expiresAtStr);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }
    }
}
