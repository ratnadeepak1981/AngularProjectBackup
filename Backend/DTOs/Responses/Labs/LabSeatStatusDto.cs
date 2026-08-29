namespace CampusServicesPortal.DTOs.Responses.Labs
{
    public class LabSeatStatusDto
    {
        public int Id { get; set; }
        public string SeatNumber { get; set; } = string.Empty; // e.g., "PC-01"
        public int RowIndex { get; set; }
        public int ColumnIndex { get; set; }
        public string Status { get; set; } = "Available"; // "Available", "Held", "Occupied", "Broken"
    }
}

