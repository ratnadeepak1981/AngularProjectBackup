using System;
using System.Text.Json.Serialization;

namespace CampusServicesPortal.Models
{
    public class StudentPhoneNumber
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string PhoneType { get; set; } = "Primary Mobile";
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = true;
        public bool IsVerified { get; set; } = false;

        [JsonIgnore]
        public virtual Student? Student { get; set; }
    }
}
