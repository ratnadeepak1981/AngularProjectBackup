namespace CampusServicesPortal.DTOs.Responses.Hostel.Management
{
    public class RoomOccupancyResponseDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int CurrentOccupancy { get; set; }
        public int MaxCapacity { get; set; }
        public int AvailableSlots => MaxCapacity - CurrentOccupancy;
    }
}
