namespace CampusServicesPortal.DTOs.Responses.Labs
{
    public class LabMatrixLayoutDto
    {
        public int TotalRows { get; set; }
        public int TotalColumns { get; set; }
        public IEnumerable<LabSeatStatusDto> Seats { get; set; } = new List<LabSeatStatusDto>();
    }
}
