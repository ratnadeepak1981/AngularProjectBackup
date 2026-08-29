namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class UpdateStudentProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string ContactDetails { get; set; } = string.Empty;
        public int FacultyId { get; set; }
    }
}
