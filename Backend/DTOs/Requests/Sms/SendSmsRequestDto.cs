namespace CampusServicesPortal.DTOs.Requests.Sms
{
    public enum SmsPurpose
    {
        ForgotPasswordOtp = 1,
        PaymentOtp = 2,
        PaymentReceipt = 3,
        GeneralAlert = 4
    }

    public class SendSmsRequestDto
    {
        public string PhoneNumber { get; set; } = null!;
        public SmsPurpose Purpose { get; set; } = SmsPurpose.ForgotPasswordOtp;
        public string? OtpCode { get; set; }
        public decimal? Amount { get; set; }
        public string? TransactionId { get; set; }
        public string? RecipientName { get; set; }
        public string? MessageOverride { get; set; }
    }
}
