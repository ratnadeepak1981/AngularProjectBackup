namespace CampusServicesPortal.DTOs.Requests.Sms
{
    public static class SmsPurposes
    {
        public const string ForgotPasswordOtp = "ForgotPasswordOtp";
        public const string PaymentOtp = "PaymentOtp";
        public const string PaymentReceipt = "PaymentReceipt";
        public const string GeneralAlert = "GeneralAlert";
        public const string RegistrationOtp = "RegistrationOtp";
        public const string PrimaryMobileUpdateOtp = "PrimaryMobileUpdateOtp";
    }

    public class SendSmsRequestDto
    {
        public string PhoneNumber { get; set; } = null!;
        public string Purpose { get; set; } = SmsPurposes.ForgotPasswordOtp;
        public string? OtpCode { get; set; }
        public decimal? Amount { get; set; }
        public string? TransactionId { get; set; }
        public string? RecipientName { get; set; }
        public string? MessageOverride { get; set; }
    }
}
