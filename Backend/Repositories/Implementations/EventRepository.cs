using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;

        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Venue?> GetVenueByIdAsync(int venueId)
        {
            return await _context.Venues.FindAsync(venueId);
        }

        public async Task<Event?> GetEventByIdAsync(int eventId)
        {
            return await _context.Events
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == eventId);
        }

        public async Task<EventRegistration?> GetRegistrationAsync(int eventId, int studentId)
        {
            return await _context.EventRegistrations
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.StudentId == studentId);
        }

        public async Task AddEventAsync(Event newEvent)
        {
            await _context.Events.AddAsync(newEvent);
        }

        public async Task AddRegistrationAsync(EventRegistration registration)
        {
            await _context.EventRegistrations.AddAsync(registration);
        }

        public void RemoveRegistration(EventRegistration registration)
        {
            _context.EventRegistrations.Remove(registration);
        }

        public async Task<IEnumerable<Event>> GetUpcomingEventsAsync()
        {
            return await _context.Events
                .Include(e => e.Venue)
                .Where(e => e.StartDateTime >= DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // 🛠️ Implemented: Rule #6 Double Booking Check [PDF: 0.1.10, 0.1.19]
        public async Task<bool> IsVenueDoubleBookedAsync(int venueId, DateTime start, DateTime end)
        {
            return await _context.Events
                .AnyAsync(e => e.VenueId == venueId &&
                               e.StartDateTime < end &&
                               e.EndDateTime > start);
        }

        // 🛠️ Implemented: Rule #7 & #12 Capacity Check [PDF: 0.1.12, 0.1.19]
        public async Task<int> GetActiveAndHeldRegistrationCountAsync(int eventId)
        {
            return await _context.EventRegistrations
                .CountAsync(r => r.EventId == eventId &&
                                 (r.Status == "Confirmed" || r.Status == "Held"));
        }

        // 🛠️ Implemented: Rule #12 Configurable Setting Retreival [PDF: 0.1.12, 0.1.21]
        public async Task<int> GetSharedReservationHoldMinutesAsync()
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "reservation-hold-minutes");

            return setting != null && int.TryParse(setting.SettingValue, out var minutes)
                ? minutes
                : 15; // Default fallback parameter [PDF: 0.1.12]
        }

        // 🛠️ Implemented: Rule #12 Sweeper Query for Background Service [PDF: 0.1.12, 0.1.19]
        public async Task<IEnumerable<EventRegistration>> GetExpiredRegistrationHoldsAsync(DateTime thresholdTime)
        {
            return await _context.EventRegistrations
                .Where(r => r.Status == "Held" && r.ExpiresAt < thresholdTime)
                .ToListAsync();
        }

        // 🛠️ Implemented: Status Mutator [PDF: 0.1.12]
        public void UpdateRegistrationStatus(EventRegistration registration)
        {
            _context.EventRegistrations.Update(registration);
        }

        // Add this implementation to your EventRepository.cs file
        public async Task<int> GetRegistrationCountAsync(int eventId)
        {
            return await GetActiveAndHeldRegistrationCountAsync(eventId);
        }

        public async Task<IEnumerable<Venue>> GetAllVenuesAsync()
        {
            return await _context.Venues.Where(v => v.IsActive).OrderBy(v => v.Name).ToListAsync();
        }

        public async Task AddVenueAsync(Venue venue)
        {
            await _context.Venues.AddAsync(venue);
        }

        public void UpdateVenue(Venue venue)
        {
            _context.Venues.Update(venue);
        }

        public async Task<bool> VenueHasUpcomingEventsAsync(int venueId)
        {
            return await _context.Events.AnyAsync(e => e.VenueId == venueId && e.StartDateTime >= DateTime.UtcNow);
        }

        public async Task<IEnumerable<EventRegistration>> GetEventRegistrationsAsync(int eventId)
        {
            return await _context.EventRegistrations
                .Include(r => r.Student)
                .Where(r => r.EventId == eventId)
                .OrderByDescending(r => r.Id)
                .ToListAsync();
        }

        public void UpdateEvent(Event ev)
        {
            _context.Events.Update(ev);
        }
    }
}
