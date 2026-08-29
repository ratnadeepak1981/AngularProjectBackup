using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Events;
using CampusServicesPortal.DTOs.Responses.Events;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IEventService
    {
        Task<ServiceResult<EventResponseDto>> CreateEventAsync(CreateEventDto request);
        Task<ServiceResult<EventResponseDto>> RegisterForEventAsync(int studentId, RegisterEventDto request);
        Task<ServiceResult<object>> CancelRegistrationAsync(int eventId, int studentId);
        Task<ServiceResult<IEnumerable<EventResponseDto>>> GetAvailableEventsAsync();
        Task<ServiceResult<IEnumerable<object>>> GetEventRegistrationsAsync(int eventId);
        Task ProcessExpiredHoldsAsync();
    }
}
