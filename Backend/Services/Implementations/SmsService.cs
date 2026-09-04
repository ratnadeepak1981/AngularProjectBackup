using System;
using System.IO;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CampusServicesPortal.Data;
using CampusServicesPortal.DTOs.Requests.Sms;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace CampusServicesPortal.Services.Implementations
{
    public class SmsService : ISmsService
    {
        private readonly IPasswordRepository _passwordRepo;
        private readonly ILogger<SmsService> _logger;
        private readonly IWebHostEnvironment _env;
        private readonly IMemoryCache _memoryCache;
        private readonly AppDbContext _context;

        public SmsService(
            IPasswordRepository passwordRepo, 
            ILogger<SmsService> logger, 
            IWebHostEnvironment env,
            IMemoryCache memoryCache,
            AppDbContext context)
        {
            _passwordRepo = passwordRepo;
            _logger = logger;
            _env = env;
            _memoryCache = memoryCache;
            _context = context;
        }

        private static string NormalizePhoneKey(string raw)
        {
            return string.IsNullOrWhiteSpace(raw) ? string.Empty : Regex.Replace(raw, @"[^\d]", "");
        }

        private async Task<string> ResolveStudentNameAsync(string emailOrPhone)
        {
            if (string.IsNullOrWhiteSpace(emailOrPhone)) return "Student User";
            string cleanInput = emailOrPhone.Trim();
            string digitsOnly = NormalizePhoneKey(cleanInput);

            try
            {
                // 1. Check by Email
                var studentByEmail = await _context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.User.Email.ToLower() == cleanInput.ToLower());
                if (studentByEmail != null && !string.IsNullOrWhiteSpace(studentByEmail.FullName))
                    return studentByEmail.FullName;

                // 2. Check by Index Number
                var studentByIndex = await _context.Students
                    .FirstOrDefaultAsync(s => s.IndexNumber.ToLower() == cleanInput.ToLower());
                if (studentByIndex != null && !string.IsNullOrWhiteSpace(studentByIndex.FullName))
                    return studentByIndex.FullName;

                // 3. Check by Phone Number
                if (!string.IsNullOrEmpty(digitsOnly) && digitsOnly.Length >= 6)
                {
                    var phoneRecord = await _context.StudentPhoneNumbers
                        .Include(p => p.Student)
                        .FirstOrDefaultAsync(p => p.PhoneNumber.Contains(digitsOnly) || digitsOnly.Contains(p.PhoneNumber.Replace(" ", "").Replace("-", "").Replace("+", "")));
                    if (phoneRecord?.Student != null && !string.IsNullOrWhiteSpace(phoneRecord.Student.FullName))
                        return phoneRecord.Student.FullName;

                    var studentByContact = await _context.Students
                        .FirstOrDefaultAsync(s => s.ContactDetails != null && s.ContactDetails.Contains(digitsOnly));
                    if (studentByContact != null && !string.IsNullOrWhiteSpace(studentByContact.FullName))
                        return studentByContact.FullName;
                }

                // 4. Check by Master List
                var master = await _context.StudentMasterLists
                    .FirstOrDefaultAsync(m => m.IndexNumber.ToLower() == cleanInput.ToLower());
                if (master != null && !string.IsNullOrWhiteSpace(master.FullName))
                    return master.FullName;
            }
            catch
            {
                // Fallback
            }

            return "Student User";
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

        private async Task<int> GetOtpValidityMinutesAsync()
        {
            try
            {
                var setting = await _passwordRepo.GetSystemSettingAsync("OtpValidityMinutes");
                if (setting != null && int.TryParse(setting.SettingValue, out int mins) && mins > 0)
                {
                    return mins;
                }
            }
            catch
            {
                // Fallback
            }
            return 3;
        }

        public async Task<ServiceResult<object>> DispatchSmsAsync(SendSmsRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                return ServiceResult<object>.Failure("Phone number is required.", 400);
            }

            int validityMinutes = await GetOtpValidityMinutesAsync();

            string otp = string.IsNullOrWhiteSpace(request.OtpCode) 
                ? RandomNumberGenerator.GetInt32(100000, 1000000).ToString() 
                : request.OtpCode;

            string msg = request.MessageOverride ?? string.Empty;
            if (string.IsNullOrWhiteSpace(msg))
            {
                switch (request.Purpose)
                {
                    case SmsPurposes.ForgotPasswordOtp:
                        msg = $"Campus Services Portal: Your password reset OTP is {otp}. Valid for 15 minutes. Do not share this OTP with anyone.";
                        break;
                    case SmsPurposes.RegistrationOtp:
                        msg = $"Campus Services Portal: Your Student Registration mobile verification OTP is {otp}. Valid for {validityMinutes} minutes. Do NOT share.";
                        break;
                    case SmsPurposes.PrimaryMobileUpdateOtp:
                        msg = $"Campus Services Portal: Your Primary Mobile change verification OTP is {otp}. Valid for {validityMinutes} minutes. Do NOT share.";
                        break;
                    case SmsPurposes.PaymentOtp:
                        decimal amt = request.Amount ?? 5000.00m;
                        msg = $"Campus Payment Gateway: OTP {otp} to authorize LKR {amt:N2} for Tuition Settlement (Ref: {request.TransactionId ?? "TXN-849201"}). Valid 5 mins. Do NOT share.";
                        break;
                    case SmsPurposes.PaymentReceipt:
                        decimal receiptAmt = request.Amount ?? 5000.00m;
                        msg = $"Campus Finance: Payment CLEARED! LKR {receiptAmt:N2} for Semester Fees processed (Ref: {request.TransactionId ?? "TXN-849201"}). Thank you.";
                        break;
                    default:
                        msg = $"Campus Alert: {otp}";
                        break;
                }
            }

            await SendSmsAsync(request.PhoneNumber, msg);
            return ServiceResult<object>.Success(new { Message = "SMS dispatched successfully to simulation gateway.", To = request.PhoneNumber, OtpCode = otp }, 200);
        }

        public async Task<ServiceResult<string>> GenerateForgotPasswordSmsPreviewAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ServiceResult<string>.Failure("Email parameter is required.", 400);
            }

            string cleanEmail = email.Trim();
            var student = await _passwordRepo.GetStudentByEmailThroughUserAsync(cleanEmail);
            string fullName = student?.FullName ?? await ResolveStudentNameAsync(cleanEmail);

            var latestToken = await _passwordRepo.GetLatestUnusedTokenAsync();
            string tokenCode = latestToken?.Token ?? RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            int remainingMins = latestToken != null ? Math.Max(1, (int)Math.Ceiling((latestToken.ExpiresAt - DateTime.UtcNow).TotalMinutes)) : 15;
            string expiresAtStr = $"Valid for {remainingMins} minutes (Expires in ~{remainingMins} mins)";
            string phoneNo = !string.IsNullOrWhiteSpace(student?.ContactDetails) ? student.ContactDetails : "+94 77 123 4567";

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("SMS OTP preview template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string currentTimeShort = DateTime.Now.ToString("h:mm tt");
            string currentDateTime = DateTime.Now.ToString("MMM dd, yyyy • h:mm tt");

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{TOKEN_CODE}}", tokenCode)
                .Replace("{{EXPIRES_AT_STR}}", expiresAtStr)
                .Replace("{{SUB_HEADER}}", "Password Reset Token Dispatch")
                .Replace("{{PURPOSE_DESC}}", "A password reset request was initiated for your Campus Portal account.")
                .Replace("{{CURRENT_TIME_SHORT}}", currentTimeShort)
                .Replace("{{CURRENT_DATE_TIME}}", currentDateTime);

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

            string tokenCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            if (_memoryCache.TryGetValue($"PaymentOtp_{cleanEmail.ToLowerInvariant()}", out string? cachedPaymentOtp) && !string.IsNullOrEmpty(cachedPaymentOtp))
            {
                tokenCode = cachedPaymentOtp;
            }

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentOtp.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "PaymentOtp.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("Payment OTP template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            string currentTimeShort = DateTime.Now.ToString("h:mm tt");
            string currentDateTime = DateTime.Now.ToString("MMM dd, yyyy • h:mm tt");

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{TOKEN_CODE}}", tokenCode)
                .Replace("{{AMOUNT}}", finalAmt.ToString("N2"))
                .Replace("{{TRANSACTION_ID}}", txnId)
                .Replace("{{CURRENT_TIME_SHORT}}", currentTimeShort)
                .Replace("{{CURRENT_DATE_TIME}}", currentDateTime);

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

            string currentTimeShort = DateTime.Now.ToString("h:mm tt");
            string currentDateTime = DateTime.Now.ToString("MMM dd, yyyy • h:mm tt");

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{AMOUNT}}", finalAmt.ToString("N2"))
                .Replace("{{TRANSACTION_ID}}", txnId)
                .Replace("{{CURRENT_TIME_SHORT}}", currentTimeShort)
                .Replace("{{CURRENT_DATE_TIME}}", currentDateTime);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }

        public async Task<ServiceResult<string>> GeneratePhoneOtpSmsPreviewAsync(string emailOrPhone, string? otpCode = null, string purpose = "Registration")
        {
            string phoneNo = string.IsNullOrWhiteSpace(emailOrPhone) ? "+94 77 123 4567" : emailOrPhone.Trim();
            string fullName = await ResolveStudentNameAsync(emailOrPhone);

            string cleanPhone = NormalizePhoneKey(phoneNo);
            string code = otpCode ?? string.Empty;

            if (string.IsNullOrWhiteSpace(code))
            {
                if (!string.IsNullOrEmpty(cleanPhone) && _memoryCache.TryGetValue($"PhoneOtp_Phone_{cleanPhone}", out string? cachedPhoneOtp) && !string.IsNullOrEmpty(cachedPhoneOtp))
                {
                    code = cachedPhoneOtp;
                }
                else if (!string.IsNullOrWhiteSpace(emailOrPhone) && _memoryCache.TryGetValue($"PhoneOtp_User_{emailOrPhone.Trim().ToLowerInvariant()}", out string? cachedUserOtp) && !string.IsNullOrEmpty(cachedUserOtp))
                {
                    code = cachedUserOtp;
                }
                else
                {
                    code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
                }
            }

            string templatePath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.cshtml");
            string cssPath = Path.Combine(_env.ContentRootPath, "Views", "Templates", "Sms", "ForgotPasswordOtp.css");

            if (!File.Exists(templatePath) || !File.Exists(cssPath))
            {
                return ServiceResult<string>.Failure("SMS preview template files missing on server.", 500);
            }

            string cssContent = await File.ReadAllTextAsync(cssPath);
            string htmlTemplate = await File.ReadAllTextAsync(templatePath);

            int validityMinutes = await GetOtpValidityMinutesAsync();
            string currentTimeShort = DateTime.Now.ToString("h:mm tt");
            string currentDateTime = DateTime.Now.ToString("MMM dd, yyyy • h:mm tt");

            string subHeader = purpose.Equals("ForgotPassword", StringComparison.OrdinalIgnoreCase)
                ? "Password Reset Token Dispatch"
                : "Mobile Phone OTP Verification";

            string purposeDesc = purpose.Equals("ForgotPassword", StringComparison.OrdinalIgnoreCase)
                ? "A password reset request was initiated for your Campus Portal account."
                : "Your mobile verification security OTP code for the Campus Services Portal is:";

            string renderedHtml = htmlTemplate
                .Replace("{{CSS_CONTENT}}", cssContent)
                .Replace("{{FULL_NAME}}", fullName)
                .Replace("{{PHONE_NUMBER}}", phoneNo)
                .Replace("{{TOKEN_CODE}}", code)
                .Replace("{{EXPIRES_AT_STR}}", $"Valid for {validityMinutes} minutes (Expires in ~{validityMinutes} mins)")
                .Replace("{{SUB_HEADER}}", subHeader)
                .Replace("{{PURPOSE_DESC}}", purposeDesc)
                .Replace("{{CURRENT_TIME_SHORT}}", currentTimeShort)
                .Replace("{{CURRENT_DATE_TIME}}", currentDateTime);

            return ServiceResult<string>.Success(renderedHtml, 200);
        }
    }
}
