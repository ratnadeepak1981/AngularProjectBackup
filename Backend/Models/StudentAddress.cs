using System;
using System.Text.Json.Serialization;

namespace CampusServicesPortal.Models
{
    public class StudentAddress
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string AddressType { get; set; } = "Permanent";
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string? DistrictOrProvince { get; set; }
        public string? PostalCode { get; set; }
        public string Country { get; set; } = "Sri Lanka";
        public bool IsPrimary { get; set; } = true;

        [JsonIgnore]
        public virtual Student? Student { get; set; }
    }
}
