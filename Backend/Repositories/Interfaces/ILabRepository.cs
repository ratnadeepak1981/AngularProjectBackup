using CampusServicesPortal.Models; // Replace with your actual entity namespace

namespace CampusServicesPortal.Repositories.Interfaces;

public interface ILabRepository
{
    Task<Lab?> GetByIdAsync(int id);
    Task<IEnumerable<Lab>> GetAllAsync();
    Task<IEnumerable<LabSeat>> GetSeatsByLabIdAsync(int labId);
    Task<bool> HasFutureBookingsForSeatAsync(int seatId);
    Task AddLabAsync(Lab lab);
    Task AddSeatAsync(LabSeat seat);
    Task DeleteSeatAsync(LabSeat seat);
    Task<bool> SaveChangesAsync();
}
