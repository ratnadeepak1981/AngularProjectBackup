namespace CampusServicesPortal.DTOs.Requests.Hostel.Application
{
    public class UpdateHostelStatusDto
    {
        public string Status { get; set; } = null!; // Must be "Approved" or "Rejected"
    }
}
