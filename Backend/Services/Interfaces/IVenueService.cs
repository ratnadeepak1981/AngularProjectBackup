using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IVenueService
    {
        Task<ServiceResult<IEnumerable<Venue>>> GetVenuesAsync();
        Task<ServiceResult<Venue>> CreateVenueAsync(string name, string venueType, int capacity);
        Task<ServiceResult<Venue>> UpdateVenueAsync(int id, string name, string venueType, int capacity, bool isActive);
        Task<ServiceResult<object>> DeleteVenueAsync(int id);
        Task<ServiceResult<object>> CheckAvailabilityAsync(int id, DateTime from, DateTime to);
    }
}
