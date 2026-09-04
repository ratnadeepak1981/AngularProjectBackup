using System.Collections.Generic;

namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class RegisterStudentRequestDto
    {
        public string IndexNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int FacultyId { get; set; }
        public string? ContactDetails { get; set; }

        public List<StudentPhoneNumberDto> PhoneNumbers { get; set; } = new();
        public List<StudentAddressDto>? Addresses { get; set; } = new();
    }
}
