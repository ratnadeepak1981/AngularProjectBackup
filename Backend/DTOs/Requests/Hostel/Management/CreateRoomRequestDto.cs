namespace CampusServicesPortal.DTOs.Requests.Hostel.Managment
{
    public class CreateRoomRequestDto
    {
        public string RoomNumber { get; set; } = null!;
        public int MaxCapacity { get; set; }
    }
}
