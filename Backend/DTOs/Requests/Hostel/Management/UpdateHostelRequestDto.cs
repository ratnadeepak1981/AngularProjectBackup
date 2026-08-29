namespace CampusServicesPortal.DTOs.Requests.Hostel.Managment
{
    public class UpdateHostelRequestDto
    {
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
