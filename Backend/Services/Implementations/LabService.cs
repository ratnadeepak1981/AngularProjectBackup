using CampusServicesPortal.DTOs.Responses.Labs;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Services.Implementations;

public class LabService : ILabService
{
    // Declared exactly once to resolve any compiler ambiguity errors
    private readonly ILabRepository _labRepo;

    public LabService(ILabRepository labRepo)
    {
        _labRepo = labRepo;
    }

    public async Task<bool> CreateLabAsync(string name, string labType, int capacity)
    {
        var newLab = new Lab { Name = name, LabType = labType, Capacity = capacity };
        await _labRepo.AddLabAsync(newLab);
        return await _labRepo.SaveChangesAsync();
    }

    public async Task<bool> AddSeatToLabAsync(int labId, string seatNumber)
    {
        var lab = await _labRepo.GetByIdAsync(labId);
        if (lab == null || !lab.LabType.Equals("Computer", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Seats can only be added to a valid Computer Lab.");

        await _labRepo.AddSeatAsync(new LabSeat { LabId = labId, SeatNumber = seatNumber });
        return await _labRepo.SaveChangesAsync();
    }

    public async Task<bool> RemoveSeatFromLabAsync(int labId, int seatId)
    {
        var seats = await _labRepo.GetSeatsByLabIdAsync(labId);
        var targetSeat = seats.FirstOrDefault(s => s.Id == seatId);
        if (targetSeat == null)
            throw new KeyNotFoundException("Seat not found in this laboratory.");

        // Rule: A seat cannot be deleted while it has future active bookings
        bool hasBookings = await _labRepo.HasFutureBookingsForSeatAsync(seatId);
        if (hasBookings)
            throw new InvalidOperationException("Cannot remove workstation seat because it has pending future bookings.");

        await _labRepo.DeleteSeatAsync(targetSeat);
        return await _labRepo.SaveChangesAsync();
    }

   public async Task<IEnumerable<LabMinimalResponseDto>> GetAllLabsAsync()
    {
        var labs = await _labRepo.GetAllAsync();
        return labs.Select(l => new LabMinimalResponseDto
        {
            Id = l.Id,
            Name = l.Name,
            LabType = l.LabType,
            Capacity = l.Capacity
        });
    }

}
