using CampusServicesPortal.DTOs.Responses.Labs;

namespace CampusServicesPortal.Services.Interfaces;

public interface ILabService
{
    Task<IEnumerable<LabMinimalResponseDto>> GetAllLabsAsync();
    Task<bool> CreateLabAsync(string name, string labType, int capacity);
    Task<bool> AddSeatToLabAsync(int labId, string seatNumber);
    Task<bool> RemoveSeatFromLabAsync(int labId, int seatId);
}
