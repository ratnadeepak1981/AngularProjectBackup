namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class RegisterStudentRequestDto
    {
        public string IndexNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int FacultyId { get; set; }
        public string? ContactDetails { get; set; }
    }
}
