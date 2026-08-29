namespace CampusServicesPortal.DTOs.Requests.Complaints
{
    public class SubmitComplaintDto
    {
        public int CategoryId { get; set; }
        public string Description { get; set; } = null!;
    }
}
