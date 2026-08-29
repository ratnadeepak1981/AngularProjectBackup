using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IEventRepository
    {
        Task<Venue?> GetVenueByIdAsync(int venueId);
        Task<bool> IsVenueDoubleBookedAsync(int venueId, DateTime start, DateTime end);
        Task<Event?> GetEventByIdAsync(int eventId);
        Task<EventRegistration?> GetRegistrationAsync(int eventId, int studentId);
        Task AddEventAsync(Event newEvent);
        Task AddRegistrationAsync(EventRegistration registration);
        void RemoveRegistration(EventRegistration registration);
        Task<IEnumerable<Event>> GetUpcomingEventsAsync();
        Task SaveChangesAsync();

        // Added: Missing method contracts required to satisfy updated EventService dependencies [PDF: 0.1.12, 0.1.19]
        Task<int> GetActiveAndHeldRegistrationCountAsync(int eventId);
        Task<int> GetSharedReservationHoldMinutesAsync();
        Task<IEnumerable<EventRegistration>> GetExpiredRegistrationHoldsAsync(DateTime thresholdTime);
        void UpdateRegistrationStatus(EventRegistration registration);

        Task<IEnumerable<Venue>> GetAllVenuesAsync();
        Task AddVenueAsync(Venue venue);
        void UpdateVenue(Venue venue);
        Task<bool> VenueHasUpcomingEventsAsync(int venueId);
        Task<IEnumerable<EventRegistration>> GetEventRegistrationsAsync(int eventId);
        void UpdateEvent(Event ev);
        Task<int> GetRegistrationCountAsync(int eventId);
    }
}
