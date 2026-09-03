using System;
using System.IO;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Sms;
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

        public async Task<ServiceResult<object>> DispatchSmsAsync(SendSmsRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                return ServiceResult<object>.Failure("Phone number is required.", 400);
            }

            string msg = request.MessageOverride ?? string.Empty;
            if (string.IsNullOrWhiteSpace(msg))
            {
                switch (request.Purpose)
                {
                    case SmsPurpose.ForgotPasswordOtp:
                        msg = $"Campus Services Portal: Your password reset OTP is {request.OtpCode ?? "482910"}. Do not share this OTP with anyone.";
                        break;
                    case SmsPurpose.PaymentOtp:
                        decimal amt = request.Amount ?? 5000.00m;
                        msg = $"Campus Payment Gateway: OTP {request.OtpCode ?? "482910"} to authorize LKR {amt:N2} for Tuition Settlement (Ref: {request.TransactionId ?? "TXN-849201"}). Valid 5 mins. Do NOT share.";
                        break;
                    case SmsPurpose.PaymentReceipt:
                        decimal receiptAmt = request.Amount ?? 5000.00m;
                        msg = $"Campus Finance: Payment CLEARED! LKR {receiptAmt:N2} for Semester Fees processed (Ref: {request.TransactionId ?? "TXN-849201"}). Thank you.";
                        break;
                    default:
                        msg = $"Campus Alert: {request.OtpCode}";
                        break;
                }
            }

            await SendSmsAsync(request.PhoneNumber, msg);
            return ServiceResult<object>.Success(new { Message = "SMS dispatched successfully to simulation gateway.", To = request.PhoneNumber }, 200);
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
            int remainingMins = latestToken != null ? Math.Max(1, (int)Math.Ceiling((latestToken.ExpiresAt - DateTime.UtcNow).TotalMinutes)) : 15;
            string expiresAtStr = $"Valid for {remainingMins} minutes (Expires in ~{remainingMins} mins)";
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

        public async Task<ServiceResult<string>> GeneratePaymentOtpSmsPreviewAsync(string email, decimal? amount = null, string? transactionId = null)
        {
            string cleanEmail = string.IsNullOrWhiteSpace(email) ? "ruwanbandara@univercity.co.lk" : email.Trim();
            var student = await _passwordRepo.GetStudentByEmailThroughUserAsync(cleanEmail);

            string fullName = student?.FullName ?? "Ruwan Bandara";
            string phoneNo = student?.ContactDetails ?? "+94 77 123 4567";
            decimal finalAmt = amount ?? 5000.00m;
            string txnId = string.IsNullOrWhiteSpace(transactionId) ? "TXN-" + new Random().Next(100000, 999999) : transactionId;

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentOtp.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentOtp.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("Payment OTP template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{TOKEN_CODE}}", "482910")
                .Replace("{{AMOUNT}}", finalAmt.ToString("N2"))
                .Replace("{{TRANSACTION_ID}}", txnId);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }

        public async Task<ServiceResult<string>> GeneratePaymentReceiptSmsPreviewAsync(string email, decimal? amount = null, string? transactionId = null)
        {
            string cleanEmail = string.IsNullOrWhiteSpace(email) ? "ruwanbandara@univercity.co.lk" : email.Trim();
            var student = await _passwordRepo.GetStudentByEmailThroughUserAsync(cleanEmail);

            string fullName = student?.FullName ?? "Ruwan Bandara";
            string phoneNo = student?.ContactDetails ?? "+94 77 123 4567";
            decimal finalAmt = amount ?? 5000.00m;
            string txnId = string.IsNullOrWhiteSpace(transactionId) ? "TXN-" + new Random().Next(100000, 999999) : transactionId;

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentReceipt.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentReceipt.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("Payment receipt template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{AMOUNT}}", finalAmt.ToString("N2"))
                .Replace("{{TRANSACTION_ID}}", txnId);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }
    }
}
