namespace CampusServicesPortal.DTOs.Requests.Nortifcation
{
    public class CreateNotificationDto
    {
        public int StudentId { get; set; }
        public string Message { get; set; } = null!;
        public string Type { get; set; } = null!; // e.g., "HostelApproved", "LabHoldExpired"
    }
}
