namespace CampusServicesPortal.DTOs.Responses.Labs
{
    public class ScienceSlotCapacityDto
    {
        public string TimeSlot { get; set; } = string.Empty;
        public int BookedCount { get; set; }
        public int MaxCapacity { get; set; }
    }
}
