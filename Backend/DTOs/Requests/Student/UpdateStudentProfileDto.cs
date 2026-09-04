using System.Collections.Generic;

namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class UpdateStudentProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string ContactDetails { get; set; } = string.Empty;
        public int FacultyId { get; set; }

        public List<StudentPhoneNumberDto> PhoneNumbers { get; set; } = new();
        public List<StudentAddressDto>? Addresses { get; set; } = new();
        public string? MobileOtpCode { get; set; } // Required ONLY when Primary Mobile is changed
    }
}
