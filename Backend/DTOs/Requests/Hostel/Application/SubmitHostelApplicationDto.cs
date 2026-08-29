namespace CampusServicesPortal.DTOs.Requests.Hostel.Application
{
    public class SubmitHostelApplicationDto
    {
        public int HostelId { get; set; }
        public string TermSemester { get; set; } = null!;
        public string? SpecialRequirements { get; set; }
    }
}
