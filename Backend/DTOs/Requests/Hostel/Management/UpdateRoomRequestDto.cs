namespace CampusServicesPortal.DTOs.Requests.Hostel.Managment
{
    public class UpdateRoomRequestDto
    {
        public string RoomNumber { get; set; } = null!;
        public int MaxCapacity { get; set; }
        public bool IsActive { get; set; }
    }
}
