namespace CampusServicesPortal.DTOs.Requests.Billing
{
    public class GenerateLabFineDto
    {
        public int StudentId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = null!; // Details the lab incident/fine cause
    }
}
