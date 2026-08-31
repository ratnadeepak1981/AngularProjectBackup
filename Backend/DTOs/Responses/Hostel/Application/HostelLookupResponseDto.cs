using System.Collections.Generic;

namespace CampusServicesPortal.DTOs.Responses.Hostel.Application
{
    public class HostelLookupResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<RoomLookupResponseDto> Rooms { get; set; } = new();
    }

    public class RoomLookupResponseDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int CurrentOccupancy { get; set; }
    }
}
