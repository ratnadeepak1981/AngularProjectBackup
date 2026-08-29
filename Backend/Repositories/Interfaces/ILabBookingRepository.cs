using CampusServicesPortal.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace CampusServicesPortal.Repositories.Interfaces;

public interface ILabBookingRepository
{
    Task<LabBooking?> GetByIdAsync(int id);
    Task<IEnumerable<LabBooking>> GetStudentBookingsAsync(int studentId);
    Task<int> GetActiveBookingsCountForSlotAsync(int labId, DateTime date, string timeSlot);
    // ADD THIS LINE EXACTLY:
    Task<LabBooking?> GetActiveBookingForSeatAsync(int labId, int seatId, DateTime date, string timeSlot);

    Task<bool> IsSeatOccupiedOrHeldAsync(int labId, int seatId, DateTime date, string timeSlot);
    Task AddBookingAsync(LabBooking booking);
    Task<IDbContextTransaction> BeginSerializableTransactionAsync();
    Task<bool> SaveChangesAsync();

    // ADD THIS MISSING LINE:
    Task<IEnumerable<LabBooking>> GetExpiredHeldBookingsAsync();
}

