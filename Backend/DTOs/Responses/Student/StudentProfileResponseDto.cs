namespace CampusServicesPortal.DTOs.Responses.Student
{
    public class StudentProfileResponseDto
    {
        public int Id { get; set; }
        public string IndexNumber { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FacultyName { get; set; } = null!;
        public string? ContactDetails { get; set; }
        public bool EmailVerified { get; set; }
        public bool IsActive { get; set; }
    }
}
