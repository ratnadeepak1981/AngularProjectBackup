namespace CampusServicesPortal.DTOs.Responses.Labs
{
    public class StudentLedgerResponseDto
    {
        public int Id { get; set; }
        public string LabName { get; set; } = string.Empty;
        public string LabType { get; set; } = string.Empty;
        public string? SeatNumber { get; set; } // Null if Science Lab slot allocation
        public string BookingDate { get; set; } = string.Empty; // Formatted YYYY-MM-DD
        public string TimeSlot { get; set; } = string.Empty;
        public string Status { get; set; } = "Held"; // "Held", "Confirmed", "Expired"
        public DateTime? ExpiresAt { get; set; } // Tracks running countdown threshold variables
    }
}
