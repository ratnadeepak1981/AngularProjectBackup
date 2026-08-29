using System;
using System.IO;
using System.Threading.Tasks;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using Microsoft.AspNetCore.Hosting;

namespace CampusServicesPortal.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IAccountRepository _accountRepo;
        private readonly IWebHostEnvironment _env;

        public EmailService(IAccountRepository accountRepo, IWebHostEnvironment env)
        {
            _accountRepo = accountRepo;
            _env = env;
        }

        public Task SendEmailAsync(string recipientEmail, string messageSubject, string HTMLContent)
        {
            // Simulation gate for email dispatching
            return Task.CompletedTask;
        }

        public async Task<ServiceResult<string>> GenerateVerificationEmailPreviewAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ServiceResult<string>.Failure("Email parameter is required.", 400);
            }

            string cleanEmail = email.Trim();
            var student = await _accountRepo.GetStudentByEmailThroughUserAsync(cleanEmail);

            if (student == null)
            {
                return ServiceResult<string>.Failure($"No student account record found for email '{cleanEmail}'.", 404);
            }

            string token = student.EmailVerificationToken ?? "NO-TOKEN-GENERATED";
            string expiresStr = student.EmailVerificationTokenExpiresAt.HasValue
                ? student.EmailVerificationTokenExpiresAt.Value.ToString("g") + " UTC"
                : "24 Hours from Registration";

            string statusBadge = student.EmailVerified
                ? "<span style='background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px;'>VERIFIED & ACTIVE</span>"
                : "<span style='background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px;'>UNVERIFIED (PENDING TOKEN)</span>";

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Email", "EmailVerification.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Email", "EmailVerification.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("Email verification template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{STATUS_BADGE}}", statusBadge)
                .Replace("{{FULL_NAME}}", student.FullName ?? "Student User")
                .Replace("{{INDEX_NUMBER}}", student.IndexNumber ?? "N/A")
                .Replace("{{REGISTERED_EMAIL}}", student.User?.Email ?? cleanEmail)
                .Replace("{{FACULTY_NAME}}", student.Faculty?.Name ?? "General University Faculty")
                .Replace("{{TOKEN}}", token)
                .Replace("{{EXPIRES_STR}}", expiresStr);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }
    }
}
