namespace CampusServicesPortal.DTOs.Responses.Hostel.Application
{
    public class RoomOccupancyResponseDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int CurrentOccupancy { get; set; }
        public int MaximumCapacity { get; set; }
    }
}
