namespace CampusServicesPortal.DTOs.Responses.Hostel.Management
{
    public class RoomResponseDto
    {
        public int Id { get; set; }
        public int HostelId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int MaxCapacity { get; set; }
        public bool IsActive { get; set; }
    }
}
