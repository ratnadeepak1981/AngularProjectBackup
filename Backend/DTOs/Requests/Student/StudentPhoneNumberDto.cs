namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class StudentPhoneNumberDto
    {
        public int? Id { get; set; }
        public string PhoneType { get; set; } = "Primary Mobile";
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = true;
        public bool IsVerified { get; set; } = false;
    }
}
