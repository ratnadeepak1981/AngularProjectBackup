namespace CampusServicesPortal.DTOs.Requests.Auth
{
    public class VerifyPhoneOtpRequestDto
    {
        public string EmailOrIndex { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }
}
