namespace CampusServicesPortal.DTOs.Responses.Hostel.Management
{
    public class HostelResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
