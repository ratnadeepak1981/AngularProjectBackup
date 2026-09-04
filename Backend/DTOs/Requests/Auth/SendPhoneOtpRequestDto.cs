namespace CampusServicesPortal.DTOs.Requests.Auth
{
    public class SendPhoneOtpRequestDto
    {
        public string EmailOrIndex { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Purpose { get; set; } = "Registration"; // "Registration" or "ProfileUpdate"
    }
}
