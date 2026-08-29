namespace CampusServicesPortal.DTOs.Requests.Complaints
{
    public class ResolveComplaintDto
    {
        // Aligns with the BRD lifecycle flow (e.g., "In Progress", "Resolved")
        public string Status { get; set; } = null!;
        public string? ResolutionNote { get; set; }
    }
}
